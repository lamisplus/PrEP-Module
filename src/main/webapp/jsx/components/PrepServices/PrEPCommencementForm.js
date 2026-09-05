import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
  Label as FormLabelName,
} from "reactstrap";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
import "react-widgets/dist/css/react-widgets.css";
import moment from "moment";
import { Spinner } from "reactstrap";
import { LiverFunctionTest } from "./PrEPEligibilityScreeningForm";
import DurationWrapper from "../Consultation/DurationWrapper/DurationWrapper";
import { useStyles } from "../../../hooks/styles/prepCommencement/useStyles";
import { fetchCommencementCodesets } from "../../../apiCalls/hivPreventionCodesets";
import { fetchPrepRegimens, fetchPrepRegimenByType } from "../Consultation/codesets";

const durationMap = {
  "DURATION_OF_CAB-LA_INJECTABLE_REFILL_30": "30",
  "DURATION_OF_CAB-LA_INJECTABLE_REFILL_60": "60",
  "DURATION_OF_CAB-LA_INJECTABLE_REFILL_90": "90",
};
// Long-acting injectable regimens. Compare on canonical PREP_REGIMEN codes
// (numeric `regimenId` shifts when the codeset changes; codes are stable).
const LONG_ACTING_INJECTABLE_CODES = [
  "PREP_REGIMEN_CABOTEGRAVIR",
  "PREP_REGIMEN_LENACAPAVIR",
];

function getDuration(key) {
  if (durationMap[key]) {
    return durationMap[key];
  }
  const match = key?.toString().match(/\d+/);
  return match ? match[0] : key;
}

function getDurationByValue(value) {
  for (const key in durationMap) {
    if (durationMap[key] === "" + value) {
      return key;
    }
  }
}

// CODESET_KEYS removed — codesets now loaded from codesets.js

const PrEPCommencementForm = props => {
  const { patientObj } = props;
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [prepRegimen, setPrepRegimen] = useState([]);
  const [objValues, setObjValues] = useState({
    dateInitialAdherenceCounseling: "",
    datePrepStart: "",
    height: "",
    personId: patientObj.personId || patientObj.id,
    prepClientId: props.prepId,
    regimenId: "",
    urinalysisResult: "",
    prepEligibilityUuid: "",
    weight: "",
    drugAllergies: "",
    referred: "",
    datereferred: "",
    nextAppointment: "",
    prepEnrollmentUuid: "",
    prepDistributionSetting: "",
    prepType: "",
    // REPLACED monthsOfRefill/duration with the canonical refillDays (DAYS).
    refillDays: "",
    liverFunctionTestResults: [],
    dateLiverFunctionTestResults: "",
    historyOfDrugToDrugInteraction: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [patientDto, setPatientDto] = useState();
  const [codeset, setCodeset] = useState({});
  const [availableRegimens, setAvailableRegimens] = useState([]);
  useEffect(() => {
    fetchAllCodesets();
    fetchPrepRegimen();
    getPatientDTOObj();
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      getPatientCommencement(props.activeContent.id);
      setDisabledField(props.activeContent.actionType === "view");
    }
  }, []);

  const fetchAllCodesets = async () => {
    try {
      const data = await fetchCommencementCodesets();
      setCodeset(data);
    } catch (error) {
      console.error("Error fetching codesets:", error);
    }
  };

  const fetchPrepRegimen = async () => {
    fetchPrepRegimens()
      .then(data => {
        setPrepRegimen(data);
        setAvailableRegimens(data);
      })
      .catch(error => {
        console.error("Error fetching prep regimen:", error);
      });
  };

  // Legacy rows saved `regimenId` as the codeset row id (e.g. "2172"); new
  // ones persist the canonical code. Translate id → code on load so the
  // dropdown autopopulates instead of going blank on view/edit.
  const normalizeRegimenIdToCode = (value, list) => {
    if (value == null || value === "") return "";
    const key = String(value);
    const byCode = (list || []).find(r => r.code === key);
    if (byCode) return byCode.code;
    const byId = (list || []).find(r => String(r.id) === key);
    return byId?.code || key;
  };

  const getPatientCommencement = id => {
    axios
      .get(
        `${baseUrl}prep/commencement/person/${
          props.patientObj.personUuid || props.patientObj.uuid
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(async response => {
        let data = response.data.find(x => x.id === id);
        let regimenList =
          (prepRegimen && prepRegimen.length > 0 && prepRegimen) ||
          (availableRegimens && availableRegimens.length > 0 && availableRegimens) ||
          null;
        if (!regimenList) {
          try {
            regimenList = await fetchPrepRegimens();
          } catch (_) {
            regimenList = [];
          }
        }
        data = {
          ...data,
          regimenId: normalizeRegimenIdToCode(data?.regimenId, regimenList),
          refillDays:
            getDurationByValue(data?.refillDays) ||
            data?.refillDays ||
            data?.duration,
        };
        setObjValues(data);
      })
      .catch(error => {
        console.error("Error fetching patient commencement:", error);
      });
  };

  const getPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${
          props.patientObj.personUuid || props.patientObj.uuid
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setPatientDto(response.data);
      })
      .catch(error => {
        console.error("Error fetching patient DTO:", error);
      });
  };

  // Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: "",
    height: "",
  });

  const handleInputChange = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "referred" && e.target.value === "false") {
      objValues.datereferred = "";
      setObjValues({ ...objValues, ["datereferred"]: "" });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let temp = { ...errors };
    temp.dateInitialAdherenceCounseling =
      objValues.dateInitialAdherenceCounseling ? "" : "This field is required";
    temp.datePrepStart = objValues.datePrepStart
      ? ""
      : "This field is required";
    temp.prepType = objValues.prepType ? "" : "This field is required";
    temp.regimenId = objValues.regimenId ? "" : "This field is required";
    temp.height = objValues.height ? "" : "This field is required";
    temp.weight = objValues.weight ? "" : "This field is required";
    temp.referred = objValues.referred ? "" : "This field is required";
    temp.prepDistributionSetting = objValues.prepDistributionSetting
      ? ""
      : "This field is required";
    temp.drugAllergies = objValues.drugAllergies
      ? ""
      : "This field is required";
    temp.urinalysisResult = objValues.urinalysisResult
      ? ""
      : "This field is required";
    temp.liverFunctionTestResults =
      objValues.liverFunctionTestResults &&
      objValues.liverFunctionTestResults.length > 0
        ? ""
        : "This field is required";
    setErrors({ ...temp });
    return Object.values(temp).every(x => x === "");
  };

  const handleInputValueCheckHeight = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (
      e.target.name === "height" &&
      (e.target.value < 30 || e.target.value > 250)
    ) {
      const message = "Height must be between 30 and 250 cm";
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: "" });
    }
  };

  const handleInputValueCheckBodyWeight = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (
      e.target.name === "weight" &&
      (e.target.value < 1 || e.target.value > 300)
    ) {
      const message =
        "Body weight must be between 1 and 300 kg";
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: "" });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      objValues.refillDays = getDuration(objValues.refillDays);
      objValues.prepEnrollmentUuid = patientDto.uuid;
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(`${baseUrl}prep-followup-visit/${props.activeContent.id}`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            patientObj.commencementCount = 1;
            toast.success("Record save successful", {
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error(extractErrorMessage(error), {
            });
          });
      } else {
        axios
          .post(`${baseUrl}prep/commencement`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            patientObj.commencementCount = 1;
            props.PatientObject();
            toast.success("Record save successful", {
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error(extractErrorMessage(error), {
            });
          });
      }
    }
  };

  const handlePrepTypeChange = e => {
    const value = e.target.value;
    setObjValues({ ...objValues, regimenId: "", prepType: value });
    if (value === "PREP_TYPE_OTHERS" || value === "PREP_TYPE_ED_PREP") {
      // Catch-all types — show every regimen.
      setPrepRegimen([...availableRegimens]);
    } else {
      // Per data dictionary: ORAL -> TDF/FTC, TDF/3TC; INJECTIBLES -> Cabotegravir, Lenacapavir.
      // The mapping lives in ALL_REGIMENS via the `types` field; let it filter for us.
      // TODO: Replace fetchPrepRegimenByType() with API call when endpoint is ready.
      fetchPrepRegimenByType(value)
        .then(data => setPrepRegimen(data))
        .catch(error => console.error("Error fetching regimen by prep type:", error));
    }
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const [latestFromEligibility, setLatestFromEligibility] = useState(null);

  const getLatestFromEligibility = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}prep-eligibility/person/${objValues?.personId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const latestEligibility = response?.data?.sort((a, b) =>
        moment(a?.visitDate).isBefore(moment(b?.visitDate))
      )[response.data.length - 1];
      setLatestFromEligibility(latestEligibility);
    } catch (error) {
      console.error("Error fetching latest eligibility:", error);
    }
  };

  const handleLftInputChange = event => {
    const { name, value } = event.target;
    setObjValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(() => {
    getLatestFromEligibility();
  }, []);

  useEffect(() => {
    if (latestFromEligibility) {
      setObjValues(prevValues => ({
        ...prevValues,
        liverFunctionTestResults:
          latestFromEligibility.liverFunctionTestResults || [],
        dateLiverFunctionTestResults:
          latestFromEligibility.dateLiverFunctionTestResults || "",
      }));
    }
  }, [latestFromEligibility]);

  const isSelectedRegimenCabLa = useCallback(() => {
    if (!objValues?.regimenId) return false;
    const key = objValues.regimenId.toString();
    // New records persist the canonical code; older rows may still carry the
    // codeset row id, so match either shape.
    const selected = (prepRegimen || availableRegimens || []).find(
      r => r.code === key || r.id?.toString() === key
    );
    return LONG_ACTING_INJECTABLE_CODES.includes(selected?.code);
  }, [objValues, prepRegimen, availableRegimens]);

  useEffect(() => {
    if (!["update", "view"].includes(props.activeContent.actionType))
      setObjValues(prev => ({ ...prev, refillDays: "" }));
  }, [objValues?.regimenId]);

  return (
    <Card className={classes.root}>
      <CardBody>
        <form>
          <div className="row">
            <h2>PrEP Commencement</h2>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="uniqueId">
                  Date of Initial Adherence Counseling{" "}
                  <span style={{ color: "red" }}>*</span>
                </Label>
                <Input
                  className="form-control"
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="dateInitialAdherenceCounseling"
                  id="dateInitialAdherenceCounseling"
                  min={patientDto?.dateEnrolled || ""}
                  max={moment(new Date()).format("YYYY-MM-DD")}
                  value={objValues.dateInitialAdherenceCounseling}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  disabled={disabledField}
                />
                {errors.dateInitialAdherenceCounseling && (
                  <span className={classes.error}>
                    {errors.dateInitialAdherenceCounseling}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>
                  Date PrEP started <span style={{ color: "red" }}>*</span>
                </Label>
                <Input
                  className="form-control"
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="datePrepStart"
                  id="datePrepStart"
                  min={patientDto?.dateEnrolled || ""}
                  max={moment(new Date()).format("YYYY-MM-DD")}
                  value={objValues.datePrepStart}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  disabled={disabledField}
                />
                {errors.datePrepStart && (
                  <span className={classes.error}>{errors.datePrepStart}</span>
                )}
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="mb-3 col-md-4">
              <FormGroup>
                <Label>
                  Body Weight <span style={{ color: "red" }}>*</span>
                </Label>
                <InputGroup>
                  <Input
                    type="number"
                    name="weight"
                    id="weight"
                    onChange={handleInputChange}
                    min="1"
                    max="300"
                    value={objValues.weight}
                    onKeyUp={handleInputValueCheckBodyWeight}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                      borderTopRightRadius: "0",
                      borderBottomRightRadius: "0",
                    }}
                    disabled={disabledField}
                  />
                  <InputGroupText
                    addonType="append"
                    style={{
                      backgroundColor: "#014D88",
                      color: "#fff",
                      border: "1px solid #014D88",
                      borderRadius: "0rem",
                      borderTopRightRadius: "0.25rem",
                      borderBottomRightRadius: "0.25rem",
                    }}
                  >
                    kg
                  </InputGroupText>
                </InputGroup>
                {vitalClinicalSupport.bodyWeight && (
                  <span className={classes.error}>
                    {vitalClinicalSupport.bodyWeight}
                  </span>
                )}
                {errors.weight && (
                  <span className={classes.error}>{errors.weight}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>
                  Height <span style={{ color: "red" }}>*</span>
                </Label>
                <InputGroup>
                  <InputGroupText
                    addonType="append"
                    style={{
                      backgroundColor: "#014D88",
                      color: "#fff",
                      border: "1px solid #014D88",
                      borderRadius: "0rem",
                      borderTopLeftRadius: "0.25rem",
                      borderBottomLeftRadius: "0.25rem",
                    }}
                  >
                    cm
                  </InputGroupText>
                  <Input
                    type="number"
                    name="height"
                    id="height"
                    onChange={handleInputChange}
                    value={objValues.height}
                    min="30"
                    max="250"
                    step="1"
                    disabled={disabledField}
                    onKeyUp={handleInputValueCheckHeight}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0rem",
                      borderTopRightRadius: "0.25rem",
                      borderBottomRightRadius: "0.25rem",
                    }}
                  />
                </InputGroup>
                {vitalClinicalSupport.height && (
                  <span className={classes.error}>
                    {vitalClinicalSupport.height}
                  </span>
                )}
                {errors.height && (
                  <span className={classes.error}>{errors.height}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 mt-2 col-md-4">
              {objValues.weight && objValues.height && (
                <FormGroup>
                  <Label>BMI</Label>
                  <Input
                    type="text"
                    value={(
                      Number(objValues.weight) /
                      ((Number(objValues.height) / 100) ** 2)
                    ).toFixed(2)}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled
                  />
                </FormGroup>
              )}
            </div>
            {/* Pregnancy / Breastfeeding are no longer captured on the initiation
                form; both are resolved from the linked hts_encounter (via
                hts_encounter_uuid) at display time. */}
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>History of drug Allergies <span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="select"
                  name="drugAllergies"
                  id="drugAllergies"
                  onChange={handleInputChange}
                  value={objValues.drugAllergies}
                  disabled={disabledField}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                >
                  <option value="">Select</option>
                  {(codeset?.YES_NO || []).map(item => (
                    <option key={item.code} value={item.code}>{item.display}</option>
                  ))}
                </Input>
                {errors.drugAllergies && (
                  <span className={classes.error}>{errors.drugAllergies}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>Urinalysis Result <span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="select"
                  name="urinalysisResult"
                  id="urinalysisResult"
                  onChange={handleInputChange}
                  value={objValues.urinalysisResult}
                  disabled={disabledField}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                >
                  <option value="">Select</option>
                  {codeset?.PREP_URINALYSIS_RESULT?.map(value => (
                    <option key={value.id} value={value.display}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.urinalysisResult && (
                  <span className={classes.error}>{errors.urinalysisResult}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>History of PrEP drug interactions</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="historyOfDrugToDrugInteraction"
                  id="historyOfDrugToDrugInteraction"
                  value={objValues.historyOfDrugToDrugInteraction}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  disabled={disabledField}
                >
                  <option value="">Select</option>
                  {codeset?.PREP_HISTORY_OF_DRUG_INTERACTIONS?.map(value => (
                    <option key={value.id} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.historyOfDrugToDrugInteraction && (
                  <span className={classes.error}>
                    {errors.historyOfDrugToDrugInteraction}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>Liver Function Tests Result <span style={{ color: "red" }}>*</span></Label>
                <LiverFunctionTest
                  objValues={objValues}
                  handleInputChange={handleLftInputChange}
                  liverFunctionTestResult={codeset?.LIVER_FUNCTION_TEST_RESULT}
                  disabledField={disabledField}
                  isAutoPop={true}
                />
                {errors.liverFunctionTestResults && (
                  <span className={classes.error}>
                    {errors.liverFunctionTestResults}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-8">
              <FormGroup>
                <Label>Date of Liver Function Tests Result </Label>
                <Input
                  className="form-control"
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="dateLiverFunctionTestResults"
                  id="dateLiverFunctionTestResults"
                  max={moment(new Date()).format("YYYY-MM-DD")}
                  value={objValues.dateLiverFunctionTestResults}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  disabled
                />
                {errors.dateLiverFunctionTestResults && (
                  <span className={classes.error}>
                    {errors.dateLiverFunctionTestResults}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>
                  Referred <span style={{ color: "red" }}>*</span>
                </Label>
                <Input
                  type="select"
                  name="referred"
                  id="referred"
                  onChange={handleInputChange}
                  value={objValues.referred}
                  disabled={disabledField}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                >
                  <option value="">Select</option>
                  {(codeset?.YES_NO || []).map(item => (
                    <option key={item.code} value={item.code}>{item.display}</option>
                  ))}
                </Input>
                {errors.referred && (
                  <span className={classes.error}>{errors.referred}</span>
                )}
              </FormGroup>
            </div>
            {objValues.referred === "true" && (
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Date referred</Label>
                  <Input
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="datereferred"
                    id="datereferred"
                    onChange={handleInputChange}
                    value={objValues.datereferred}
                    min={patientDto?.dateEnrolled || ""}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.datereferred && (
                    <span className={classes.error}>{errors.datereferred}</span>
                  )}
                </FormGroup>
              </div>
            )}
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <FormLabelName for="prepType">
                  Prep Type At Start <span style={{ color: "red" }}>*</span>
                </FormLabelName>
                <Input
                  type="select"
                  name="prepType"
                  id="prepType"
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  onChange={handlePrepTypeChange}
                  value={objValues.prepType}
                  disabled={disabledField}
                >
                  <option value="">Select Prep Type</option>
                  {codeset?.PrEP_TYPE?.map(value => (
                    <option key={value.id} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.prepType && (
                  <span className={classes.error}>{errors.prepType}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>
                  PrEP Regimen <span style={{ color: "red" }}>*</span>
                </Label>
                <Input
                  type="select"
                  name="regimenId"
                  id="regimenId"
                  onChange={handleInputChange}
                  value={objValues.regimenId}
                  disabled={disabledField}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                >
                  <option value="">Select</option>
                  {prepRegimen.map(value => (
                    <option key={value.code || value.id} value={value.code}>
                      {value.regimen}
                    </option>
                  ))}
                </Input>
                {errors.regimenId && (
                  <span className={classes.error}>{errors.regimenId}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <FormLabelName>
                  Prep Distribution Setting{" "}
                  <span style={{ color: "red" }}>*</span>
                </FormLabelName>
                <Input
                  type="select"
                  name="prepDistributionSetting"
                  id="prepDistributionSetting"
                  onChange={handleInputChange}
                  value={objValues.prepDistributionSetting}
                  disabled={disabledField}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                >
                  <option value=""></option>
                  {codeset?.PrEP_ENTRY_POINT?.map(value => (
                    <option key={value.code} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.prepDistributionSetting && (
                  <span className={classes.error}>
                    {errors.prepDistributionSetting}
                  </span>
                )}
              </FormGroup>
            </div>
            {objValues.regimenId && (
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    {`Duration of refill (days)`}{" "}
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <DurationWrapper
                    isCabLaEligible={true}
                    isSelectedRegimenCabLa={isSelectedRegimenCabLa()}
                    name={"refillDays"}
                    id="refillDays"
                    value={objValues.refillDays}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    handleInputChange={handleInputChange}
                    disabledField={disabledField}
                    setObjValues={setObjValues}
                  />
                  {errors.refillDays !== "" ? (
                    <span className={classes.error}>
                      {errors.refillDays}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
            )}
          </div>
          {saving && <Spinner />}
          <br />
          {!(props.activeContent.actionType === "view") && (
            <MatButton
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SaveIcon />}
              style={{ backgroundColor: "#014d88" }}
              onClick={handleSubmit}
              disabled={saving}
            >
              <span style={{ textTransform: "capitalize" }}>
                {saving
                  ? "Saving..."
                  : props.activeContent?.actionType
                  ? "Update"
                  : "Save"}
              </span>
            </MatButton>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export default PrEPCommencementForm;

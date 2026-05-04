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
const regimenMapping = { orals: "1", cabLa: "2" };

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
    pregnant: "",
    prepEnrollmentUuid: "",
    duration: "",
    prepDistributionSetting: "",
    prepType: "",
    monthsOfRefill: "",
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

  const getPatientCommencement = id => {
    axios
      .get(
        `${baseUrl}prep/commencement/person/${
          props.patientObj.personId || props.patientObj.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        let data = response.data.find(x => x.id === id);
        data = {
          ...data,
          monthsOfRefill:
            getDurationByValue(data?.monthsOfRefill) || data?.monthsOfRefill,
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
          props.patientObj.personId || props.patientObj.id
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
    } else if (e.target.name === "monthsOfRefill") {
      const durationInDays = Number(e.target.value) * 30;
      setObjValues({
        ...objValues,
        monthsOfRefill: e.target.value,
        duration: durationInDays,
      });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const isFemalePatient =
    (props.patientObj.gender?.toLowerCase() === "female" ||
      props.patientObj.sex?.toLowerCase() === "female");

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
    if (isFemalePatient) {
      temp.pregnant = objValues.pregnant ? "" : "This field is required";
      // Skip-logic: Breastfeeding only displayed (and thus required) when
      // pregnancy status indicates breastfeeding.
      if (objValues.pregnant === "PREGANACY_STATUS_BREASTFEEDING") {
        temp.breastFeeding = objValues.breastFeeding
          ? ""
          : "This field is required";
      } else {
        temp.breastFeeding = "";
      }
    }
    setErrors({ ...temp });
    return Object.values(temp).every(x => x === "");
  };

  const handleInputValueCheckHeight = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (
      e.target.name === "height" &&
      (e.target.value < 0.3 || e.target.value > 2.5)
    ) {
      const message =
        "Height must be between 0.3 and 2.5 meters";
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
      objValues.duration = getDuration(objValues.monthsOfRefill);
      objValues.monthsOfRefill = getDuration(objValues.monthsOfRefill);
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
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            let errorMessage =
              error.response?.data?.apierror?.message ||
              "Something went wrong, please try again";
            toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_CENTER,
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
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            let errorMessage =
              error.response?.data?.apierror?.message ||
              "Something went wrong, please try again";
            toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          });
      }
    }
  };

  const handlePrepTypeChange = e => {
    setObjValues({ ...objValues, regimenId: "", prepType: e.target.value });
    if (
      e.target.value === "PREP_TYPE_OTHERS" ||
      e.target.value === "PREP_TYPE_ED_PREP"
    ) {
      setPrepRegimen([...availableRegimens]);
    } else if (e.target.value === "PREP_TYPE_INJECTIBLES") {
      const regimens = [...availableRegimens]?.filter(({ id }) => id == 2);
      setPrepRegimen(regimens);
    } else if (e.target.value === "PREP_TYPE_ORAL") {
      const regimens = [...availableRegimens]?.filter(({ id }) => id == 1);
      setPrepRegimen(regimens);
    } else {
      // TODO: Replace fetchPrepRegimenByType() with API call when endpoint is ready.
      fetchPrepRegimenByType(e.target.value)
        .then(data => {
          setPrepRegimen(data);
        })
        .catch(error => {
          console.error("Error fetching regimen by prep type:", error);
        });
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
    return objValues?.regimenId.toString() === regimenMapping["cabLa"];
  }, [objValues]);

  useEffect(() => {
    if (!["update", "view"].includes(props.activeContent.actionType))
      setObjValues(prev => ({ ...prev, monthsOfRefill: "", duration: "" }));
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
                    m
                  </InputGroupText>
                  <Input
                    type="number"
                    name="height"
                    id="height"
                    onChange={handleInputChange}
                    value={objValues.height}
                    min="0.3"
                    max="2.5"
                    step="0.01"
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
                      objValues.weight /
                      objValues.height ** 2
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
            {(props.patientObj.gender?.toLowerCase() === "female" ||
              props.patientObj.sex?.toLowerCase()) === "female" && (
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Pregnancy Status <span style={{ color: "red" }}>*</span></Label>
                  <Input
                    type="select"
                    name="pregnant"
                    id="pregnant"
                    onChange={handleInputChange}
                    value={objValues.pregnant}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <option value=""></option>
                    {codeset?.PREGNANCY_STATUS?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.pregnant && (
                    <span className={classes.error}>{errors.pregnant}</span>
                  )}
                </FormGroup>
              </div>
            )}
            {objValues.pregnant === "PREGANACY_STATUS_BREASTFEEDING" && (
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Breast Feeding <span style={{ color: "red" }}>*</span></Label>
                  <Input
                    type="select"
                    name="breastFeeding"
                    id="breastFeeding"
                    onChange={handleInputChange}
                    value={objValues.breastFeeding}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                  {errors.breastFeeding && (
                    <span className={classes.error}>{errors.breastFeeding}</span>
                  )}
                </FormGroup>
              </div>
            )}
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
                  <option value="true">Yes</option>
                  <option value="false">No</option>
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
                  <option value="true">Yes</option>
                  <option value="false">No</option>
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
                    <option key={value.id} value={value.id}>
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
                    name={"monthsOfRefill"}
                    id="monthsOfRefill"
                    value={objValues.monthsOfRefill}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    handleInputChange={handleInputChange}
                    disabledField={disabledField}
                    setObjValues={setObjValues}
                  />
                  {errors.monthsOfRefill !== "" ? (
                    <span className={classes.error}>
                      {errors.monthsOfRefill}
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

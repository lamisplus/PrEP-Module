import React, { useState, useEffect } from "react";
import { Form, Row, Card, CardBody, FormGroup, Label, Input, InputGroup, InputGroupText } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import "react-widgets/dist/css/react-widgets.css";
import "react-dual-listbox/lib/react-dual-listbox.css";
import PhoneInput from "react-phone-input-2";
import moment from "moment";
import { Spinner } from "reactstrap";
import { useStyles } from "../../../hooks/styles/prepRegistration/useStyle";
import { LiverFunctionTest } from "./PrEPEligibiltyScreeningForm";

const CODESET_KEYS = [
  "HTS_ENTRY_POINT",
  "RELATIONSHIP",
  "PREP_RISK_TYPE",
  "PREGNANCY_STATUS",
  "PREP_HISTORY_OF_DRUG_INTERACTIONS",
  "PREP_URINALYSIS_RESULT",
  "LIVER_FUNCTION_TEST_RESULT",
];

const PrEPRegistrationForm = props => {
  const [entryPoint, setEntryPoint] = useState([]);
  const classes = useStyles();
  const [objValues, setObjValues] = useState({
    dateEnrolled: "",
    dateReferred: "",
    extra: {},
    personId: 0,
    prepEligibilityUuid: "",
    riskType: "",
    supporterName: "",
    supporterPhone: "",
    supporterRelationshipType: "",
    uniqueId: "",
    hivTestingPoint: "",
    dateOfLastHivNegativeTest: "",
    targetGroup: "",
    enrollmentType: "",
    populationType: "",
    weight: "",
    height: "",
    pregnancyStatus: "",
    historyOfDrugAllergies: "",
    historyOfDrugToDrugInteraction: "",
    urinalysisResult: "",
    liverFunctionTestResults: [],
    dateOfHivTest: "",
    resultOfHivTest: "",
    dateOfInitialAdherenceCounseling: "",
    datePrepStarted: "",
    prepTypeAtStart: "",
    prepRegimen: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [prepRisk, setPrepRisk] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [patientDto, setPatientDto] = useState();
  const [disabledField, setSisabledField] = useState(false);
  const [targetGroupValue, setTargetGroupValue] = useState("");
  const [codeset, setCodeset] = useState({});
  const [prepRegimen, setPrepRegimen] = useState([]);
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
    height: "",
  });

  useEffect(() => {
    axios
      .get(`${baseUrl}application-codesets/v2/codeSets`, {
        params: { codes: CODESET_KEYS },
        paramsSerializer: params =>
          params.codes
            .map(code => `codes=${encodeURIComponent(code)}`)
            .join("&"),
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setCodeset(data);
        setEntryPoint(data.HTS_ENTRY_POINT || []);
        setRelatives(data.RELATIONSHIP || []);
        setPrepRisk(data.PREP_RISK_TYPE || []);
      })
      .catch(error => {
        //console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${baseUrl}prep-regimen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepRegimen(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  }, []);

  useEffect(() => {
    GetPatientDTOObj();
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      GetPatientPrepEnrollment(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, []);

  const getTargetGroupvalue = () => {
    axios
      .get(
        `${baseUrl}hts/persons/${
          props.patientObj.personId || props.patientObj.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setTargetGroupValue(response.data?.htsClientDtoList[0]?.targetGroup);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const GetPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
        getTargetGroupvalue();
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const GetPatientPrepEnrollment = id => {
    axios
      .get(
        `${baseUrl}prep/enrollment/person/${
          props.patientObj.personId || props.patientObj.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setObjValues(response.data.find(x => x.id === id));
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const handleInputChange = e => {
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const handleLftInputChange = event => {
    const { name, value } = event.target;
    setObjValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const checkPhoneNumberBasic = (e, inputName) => {
    const limit = 10;
    setObjValues({ ...objValues, [inputName]: e.slice(0, limit) });
  };

  const handleInputValueCheckBodyWeight = e => {
    if (
      e.target.value !== "" &&
      (Number(e.target.value) > 150 || Number(e.target.value) < 3)
    ) {
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        bodyWeight: "Body weight must not be greater than 150 and less than 3",
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: "" });
    }
  };

  const handleInputValueCheckHeight = e => {
    if (
      e.target.value !== "" &&
      (Number(e.target.value) > 216.408 || Number(e.target.value) < 48.26)
    ) {
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        height: "Height cannot be greater than 216.408 and less than 48.26",
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: "" });
    }
  };

  const validate = () => {
    let temp = { ...errors };
    temp.dateEnrolled = objValues.dateEnrolled ? "" : "This field is required⚠";
    temp.uniqueId = objValues.uniqueId ? "" : "This field is required⚠";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x == "");
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      objValues.personId = props.patientObj.personId || props.patientObj.id;
      objValues.prepEligibilityUuid = patientDto.uuid;
      objValues.targetGroup = targetGroupValue;
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType) {
        axios
          .put(
            `${baseUrl}prep-enrollment/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(response => {
            setSaving(false);
            props.patientObj.prepCount = "1";
            props.PatientObject();
            toast.success("PrEP enrolment saved successfully!✔", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error("Something went wrong❌");
          });
      } else {
        axios
          .post(`${baseUrl}prep/enrollment`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            props.patientObj.prepCount = "1";
            toast.success("PrEP enrolment saved successfully!✔", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error("Something went wrong❌");
          });
      }
    } else {
      toast.error("All fields are required❌", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  return (
    <div>
      <Card>
        <CardBody>
          <form>
            <div className="row">
              <h2>{`PrEP/PEP Initial Visit`}</h2>

              {/* 1. Unique ID */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label for="uniqueId">
                    Unique ID <span style={{ color: "red" }}> *</span>
                  </Label>
                  <input
                    type="text"
                    className="form-control"
                    name="uniqueId"
                    id="uniqueId"
                    onChange={handleInputChange}
                    value={objValues.uniqueId}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  />
                  {errors.uniqueId !== "" ? (
                    <span className={classes.error}>{errors.uniqueId}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 2. Date Enrolled */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>
                    Date Enrolled <span style={{ color: "red" }}> *</span>
                  </Label>
                  <input
                    type="date"
                    className="form-control"
                    onKeyDown={e => e.preventDefault()}
                    name="dateEnrolled"
                    id="dateEnrolled"
                    value={objValues.dateEnrolled}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    min={
                      patientDto && patientDto.visitDate
                        ? patientDto.visitDate
                        : ""
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateEnrolled !== "" ? (
                    <span className={classes.error}>{errors.dateEnrolled}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 3. Enrollment Type */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Enrollment Type</Label>
                  <select
                    className="form-control"
                    name="enrollmentType"
                    id="enrollmentType"
                    onChange={handleInputChange}
                    value={objValues.enrollmentType}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="PrEP">PrEP</option>
                    <option value="PEP">PEP</option>
                  </select>
                </FormGroup>
              </div>

              {/* 4. Population Type */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Population Type</Label>
                  <select
                    className="form-control"
                    name="populationType"
                    id="populationType"
                    onChange={handleInputChange}
                    value={objValues.populationType}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Serodiscordant Couples(SDC)">Serodiscordant Couples(SDC)</option>
                    <option value="Sex Workers">Sex Workers</option>
                    <option value="Partners of Sex workers">Partners of Sex workers</option>
                    <option value="Injecting Drug Users">Injecting Drug Users</option>
                    <option value="Individuals who engage in anal sex on a prolonged and regular basis">Individuals who engage in anal sex on a prolonged and regular basis</option>
                    <option value="Exposed adolescents and young people">Exposed adolescents and young people</option>
                    <option value="Transgender">Transgender</option>
                    <option value="At risk Pregnant & Breastfeeding Women">{`At risk Pregnant & Breastfeeding Women`}</option>
                  </select>
                </FormGroup>
              </div>

              {/* 5. Date Referred for PrEP */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Date Referred for PrEP</Label>
                  <input
                    type="date"
                    className="form-control"
                    onKeyDown={e => e.preventDefault()}
                    name="dateReferred"
                    id="dateReferred"
                    value={objValues.dateReferred}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    min={
                      patientDto && patientDto.visitDate
                        ? patientDto.visitDate
                        : ""
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateReferred !== "" ? (
                    <span className={classes.error}>{errors.dateReferred}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 6. HIV Testing Point */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>HIV Testing Point</Label>
                  <select
                    className="form-control"
                    name="hivTestingPoint"
                    id="hivTestingPoint"
                    onChange={handleInputChange}
                    value={objValues.hivTestingPoint}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Facility">Facility</option>
                    <option value="Community">Community</option>
                    <option value="Others">Others</option>
                  </select>
                </FormGroup>
              </div>

              {/* 7. Date of HIV Test */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Date of HIV Test</Label>
                  <input
                    type="date"
                    className="form-control"
                    onKeyDown={e => e.preventDefault()}
                    name="dateOfHivTest"
                    id="dateOfHivTest"
                    value={objValues.dateOfHivTest}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* 8. Result of HIV test */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Result of HIV test</Label>
                  <select
                    className="form-control"
                    name="resultOfHivTest"
                    id="resultOfHivTest"
                    onChange={handleInputChange}
                    value={objValues.resultOfHivTest}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Early Detect">Early Detect</option>
                  </select>
                </FormGroup>
              </div>

              {/* 9. PrEP Supporter */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>PrEP Supporter</Label>
                  <input
                    type="text"
                    className="form-control"
                    name="supporterName"
                    id="supporterName"
                    value={objValues.supporterName}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* 10. Relationship */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Relationship</Label>
                  <select
                    className="form-control"
                    name="supporterRelationshipType"
                    id="supporterRelationshipType"
                    value={objValues.supporterRelationshipType}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    {codeset?.RELATIONSHIP?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              {/* 11. Telephone number (supporter) */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Telephone number (supporter)</Label>
                  <PhoneInput
                    containerStyle={{
                      width: "100%",
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    style={{ borderRadius: "0.25rem" }}
                    inputStyle={{
                      width: "100%",
                      borderRadius: "0.25rem",
                    }}
                    country={"ng"}
                    placeholder="(234)7099999999"
                    maxLength={5}
                    name="supporterPhone"
                    id="supporterPhone"
                    masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                    value={objValues.supporterPhone}
                    onChange={e => {
                      checkPhoneNumberBasic(e, "supporterPhone");
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* ====== Section B: PrEP/PEP Initiation ====== */}
              <div
                className="form-group col-md-12 text-center pt-2 mb-4 p-3"
                style={{
                  backgroundColor: "#014D88",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {`PrEP/PEP Initiation`}
              </div>

              {/* 12. Date of Initial Adherence Counseling */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Date of Initial Adherence Counseling</Label>
                  <input
                    type="date"
                    className="form-control"
                    onKeyDown={e => e.preventDefault()}
                    name="dateOfInitialAdherenceCounseling"
                    id="dateOfInitialAdherenceCounseling"
                    value={objValues.dateOfInitialAdherenceCounseling}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* 13. Date PrEP started */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Date PrEP started</Label>
                  <input
                    type="date"
                    className="form-control"
                    onKeyDown={e => e.preventDefault()}
                    name="datePrepStarted"
                    id="datePrepStarted"
                    value={objValues.datePrepStarted}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* 14. Weight */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Body Weight</Label>
                  <InputGroup>
                    <Input
                      type="number"
                      name="weight"
                      id="weight"
                      onChange={handleInputChange}
                      min="3"
                      max="150"
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
                </FormGroup>
              </div>

              {/* 15. Height */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Height</Label>
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
                      min="48.26"
                      max="216.408"
                      disabled={disabledField}
                      onKeyUp={handleInputValueCheckHeight}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0rem",
                      }}
                    />
                    <InputGroupText
                      addonType="append"
                      style={{
                        backgroundColor: "#992E62",
                        color: "#fff",
                        border: "1px solid #992E62",
                        borderRadius: "0rem",
                        borderTopRightRadius: "0.25rem",
                        borderBottomRightRadius: "0.25rem",
                      }}
                    >
                      {objValues.height
                        ? (objValues.height / 100).toFixed(2) + "m"
                        : "m"}
                    </InputGroupText>
                  </InputGroup>
                  {vitalClinicalSupport.height && (
                    <span className={classes.error}>
                      {vitalClinicalSupport.height}
                    </span>
                  )}
                </FormGroup>
              </div>

              {/* 16. Pregnancy Status */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Pregnancy Status</Label>
                  <select
                    className="form-control"
                    name="pregnancyStatus"
                    id="pregnancyStatus"
                    onChange={handleInputChange}
                    value={objValues.pregnancyStatus}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    {codeset?.PREGNANCY_STATUS?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              {/* 17. PrEP Type at Start */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>PrEP Type at Start</Label>
                  <select
                    className="form-control"
                    name="prepTypeAtStart"
                    id="prepTypeAtStart"
                    onChange={handleInputChange}
                    value={objValues.prepTypeAtStart}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Oral">Oral</option>
                    <option value="Injectable">Injectable</option>
                    <option value="Ring">Ring</option>
                    <option value="Others">Others</option>
                  </select>
                </FormGroup>
              </div>

              {/* 18. PrEP Regimen */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>PrEP Regimen</Label>
                  <select
                    className="form-control"
                    name="prepRegimen"
                    id="prepRegimen"
                    onChange={handleInputChange}
                    value={objValues.prepRegimen}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    {prepRegimen.map(value => (
                      <option key={value.id} value={value.id}>
                        {value.regimen}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              {/* 19. History of Drug Allergies */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>History of Drug Allergies</Label>
                  <select
                    className="form-control"
                    name="historyOfDrugAllergies"
                    id="historyOfDrugAllergies"
                    onChange={handleInputChange}
                    value={objValues.historyOfDrugAllergies}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </FormGroup>
              </div>

              {/* 20. History of Drug-Drug Interaction */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>History of Drug-Drug Interaction</Label>
                  <select
                    className="form-control"
                    name="historyOfDrugToDrugInteraction"
                    id="historyOfDrugToDrugInteraction"
                    onChange={handleInputChange}
                    value={objValues.historyOfDrugToDrugInteraction}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    {codeset?.PREP_HISTORY_OF_DRUG_INTERACTIONS?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              {/* 21. Urinalysis Result */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Urinalysis Result</Label>
                  <select
                    className="form-control"
                    name="urinalysisResult"
                    id="urinalysisResult"
                    onChange={handleInputChange}
                    value={objValues.urinalysisResult}
                    disabled={disabledField}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    {codeset?.PREP_URINALYSIS_RESULT?.map(value => (
                      <option key={value.id} value={value.display}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              {/* 22. Liver Function Test (DualListBox) */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Liver Function Test</Label>
                  <LiverFunctionTest
                    objValues={objValues}
                    handleInputChange={handleLftInputChange}
                    liverFunctionTestResult={codeset?.LIVER_FUNCTION_TEST_RESULT}
                    disabledField={disabledField}
                    isAutoPop={false}
                  />
                </FormGroup>
              </div>
            </div>

            {saving ? <Spinner /> : ""}
            <br />
            {props.activeContent &&
            props.activeContent.actionType === "update" ? (
              <>
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  hidden={disabledField}
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{
                    backgroundColor: "#014d88",
                    border: "1px solid #014D88",
                  }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Updating...
                    </span>
                  )}
                </MatButton>
              </>
            ) : (
              <>
                {!disabledField && (
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
                    {!saving ? (
                      <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Saving...
                      </span>
                    )}
                  </MatButton>
                )}
              </>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrEPRegistrationForm;

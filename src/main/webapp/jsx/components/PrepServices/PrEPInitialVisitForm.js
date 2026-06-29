import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Row,
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
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
import { LiverFunctionTest } from "./PrEPEligibilityScreeningForm";
import { fetchInitialVisitCodesets } from "../../../apiCalls/hivPreventionCodesets";
import { toHivTestResultCode } from "../../../Utils/htsResultMapper";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
import { isValidHtsEncounter, normalizeHtsObservation } from "../../../Utils/htsEncounter";
import HtsWarningModal from "../../../Reusables/HtsWarningModal";
import {
  fetchPrepRegimens,
  fetchPrepRegimenByType,
  fetchPepRegimens,
} from "../Consultation/codesets";

const ENROLLMENT_TYPE_PREP_CODE = "PREP_PEP_ENROLLMENT_TYPE_PREP";
const ENROLLMENT_TYPE_PEP_CODE = "PREP_PEP_ENROLLMENT_TYPE_PEP";
const toEnrollmentTypeCode = (value) => {
  if (!value) return value;
  if (value === "PrEP" || value === ENROLLMENT_TYPE_PREP_CODE) return ENROLLMENT_TYPE_PREP_CODE;
  if (value === "PEP" || value === ENROLLMENT_TYPE_PEP_CODE) return ENROLLMENT_TYPE_PEP_CODE;
  return value;
};
const fromEnrollmentTypeCode = (value) => {
  if (value === ENROLLMENT_TYPE_PREP_CODE) return "PrEP";
  if (value === ENROLLMENT_TYPE_PEP_CODE) return "PEP";
  return value;
};

const PrEPInitialVisitForm = props => {
  const [entryPoint, setEntryPoint] = useState([]);
  const classes = useStyles();
  const screeningType = props.activeContent?.screeningType || '';
  const resolveTypeLabel = (val) => {
    const normalized = fromEnrollmentTypeCode(val) || val;
    return normalized === 'PEP' ? 'PEP' : normalized === 'PrEP' ? 'PrEP' : '';
  };
  const [objValues, setObjValues] = useState({
    dateEnrolled: "",
    dateReferred: "",
    personId: 0,
    prepEligibilityUuid: "",
    supporterName: "",
    supporterPhone: "",
    supporterRelationshipType: "",
    uniqueId: "",
    hivTestingPoint: "",
    htsEncounterUuid: "",
    enrollmentType: screeningType || "",
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
    prepTypeAtStartOthersSpecify: "",
    prepRegimen: "",
    monthsOfRefill: "",
  });

  const [loadedHts, setLoadedHts] = useState(null);
  const latestHts = props.patientObj?.latestHtsResult || loadedHts;
  const htsObs = useMemo(
    () => normalizeHtsObservation(latestHts?.observation),
    [latestHts?.uuid]
  );
  const isFromHts = isValidHtsEncounter(latestHts);
  const isCreateMode = !props.activeContent?.id;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [prepRisk, setPrepRisk] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [patientDto, setPatientDto] = useState();
  const [disabledField, setSisabledField] = useState(false);
  const [codeset, setCodeset] = useState({});
  const htsCandidateUuid =
    objValues?.htsEncounterUuid
    || patientDto?.htsEncounterUuid
    || props.patientObj?.latestHtsResult?.uuid
    || null;
  const htsFetchPending =
    !!htsCandidateUuid &&
    props.patientObj?.latestHtsResult?.uuid !== htsCandidateUuid &&
    loadedHts?.uuid !== htsCandidateUuid;
  const htsBlocked = isCreateMode && !isFromHts && !htsFetchPending;
  const [hasExistingInitiation, setHasExistingInitiation] = useState(false);
  const [prepRegimen, setPrepRegimen] = useState([]);
  const [pepRegimenOptions, setPepRegimenOptions] = useState([]);
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    bodyWeight: "",
    height: "",
  });

  useEffect(() => {
    fetchInitialVisitCodesets().then(data => {
      setCodeset(data);
      setEntryPoint(data.HTS_ENTRY_POINT || []);
      setRelatives(data.RELATIONSHIP || []);
      setPrepRisk(data.PREP_RISK_TYPE || []);
    });
  }, []);

  useEffect(() => {
    fetchPrepRegimens().then(data => {
      setPrepRegimen(data);
    });
    fetchPepRegimens().then(data => {
      setPepRegimenOptions(data);
    });
  }, []);

  useEffect(() => {
    const prepType = objValues.prepTypeAtStart;
    if (!prepType
        || prepType === "PREP_TYPE_OTHERS"
        || prepType === "PREP_TYPE_ED_PREP") {
      fetchPrepRegimens().then(data => setPrepRegimen(data));
      return;
    }
    fetchPrepRegimenByType(prepType).then(data => setPrepRegimen(data));
  }, [objValues.prepTypeAtStart]);

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
  useEffect(() => {
    const targetUuid =
      objValues?.htsEncounterUuid || patientDto?.htsEncounterUuid;
    if (!targetUuid) return;
    if (props.patientObj?.latestHtsResult?.uuid === targetUuid) return;
    if (loadedHts?.uuid === targetUuid) return;
    axios
      .get(`${baseUrl}prep/hts-encounter/${targetUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(resp => setLoadedHts(resp?.data || null))
      .catch(() => setLoadedHts(null));
  }, [
    objValues?.htsEncounterUuid,
    patientDto?.htsEncounterUuid,
    props.patientObj?.latestHtsResult?.uuid,
  ]);

  useEffect(() => {
    if (!isFromHts) return;
    setObjValues(prev => ({
      ...prev,
      htsEncounterUuid: prev.htsEncounterUuid || latestHts.uuid || "",
      hivTestingPoint: latestHts.setting || prev.hivTestingPoint,
      dateOfHivTest: latestHts.dateOfVisit || prev.dateOfHivTest,
      resultOfHivTest:
        toHivTestResultCode(
          htsObs.confirmatoryHivTest || htsObs.initialHivTest,
          htsObs.typeOfHivTestDone)
          || prev.resultOfHivTest,
      pregnancyStatus: htsObs.pregnancyStatus || prev.pregnancyStatus,
    }));
  }, [latestHts?.uuid]);

  const GetPatientDTOObj = () => {
    const personId = props.patientObj.personId || props.patientObj.id;
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
        if (response.data) {
          setObjValues(prev => ({
            ...prev,
            enrollmentType:
              fromEnrollmentTypeCode(response.data.category) || prev.enrollmentType,
            uniqueId: response.data.uniqueClientId || prev.uniqueId,
            populationType: response.data.populationType || prev.populationType,
          }));
        }
        axios
          .get(`${baseUrl}prep-pep-initiation/person/${personId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(initResponse => {
            if (initResponse.data && initResponse.data.length > 0) {
              const prevInitiation = initResponse.data[0]; // most recent
              setHasExistingInitiation(true);
              setObjValues(prev => ({
                ...prev,
                // Lock Unique ID to the existing initiation's value so all
                // prophylaxis_initiation rows for this client share one ID.
                uniqueId: prevInitiation.uniqueId || prev.uniqueId,
                populationType: prevInitiation.populationType || prev.populationType,
                weight: prevInitiation.weight || prev.weight,
                height: prevInitiation.height || prev.height,
                // hivTestingPoint is no longer stored on prophylaxis_initiation;
                // it's derived from the latest hts_encounter (handled by the
                // HTS auto-pop useEffect). Skip it here.
              }));
            }
          })
          .catch(() => {});
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
        const rec = response.data.find(x => x.id === id);
        if (rec) {
          setObjValues({
            ...rec,
            enrollmentType:
              fromEnrollmentTypeCode(rec.enrollmentType) || rec.enrollmentType,
          });
        }
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const handleInputChange = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "prepTypeAtStart") {
      setObjValues({ ...objValues, prepTypeAtStart: e.target.value, prepRegimen: "" });
      return;
    }
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
      (Number(e.target.value) > 300 || Number(e.target.value) < 1)
    ) {
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        bodyWeight: "Body weight must be between 1 and 300 kg",
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, bodyWeight: "" });
    }
  };

  const handleInputValueCheckHeight = e => {
    if (
      e.target.value !== "" &&
      (Number(e.target.value) > 250 || Number(e.target.value) < 30)
    ) {
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        height: "Height must be between 30 and 250 cm",
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: "" });
    }
  };

  const validate = () => {
    let temp = { ...errors };
    temp.dateEnrolled = objValues.dateEnrolled ? "" : "This field is required";
    temp.uniqueId = objValues.uniqueId ? "" : "This field is required";
    temp.enrollmentType = objValues.enrollmentType
      ? ""
      : "This field is required";
    temp.populationType = objValues.populationType
      ? ""
      : "This field is required";
    temp.hivTestingPoint = "";
    temp.dateOfHivTest = "";
    temp.resultOfHivTest = "";
    if (objValues.enrollmentType !== 'PEP' && objValues.supporterName) {
      temp.supporterRelationshipType = objValues.supporterRelationshipType
        ? ""
        : "This field is required";
      temp.supporterPhone = objValues.supporterPhone
        ? ""
        : "This field is required";
    }
    // Conditional: dateReferred required (PrEP or PEP) when HIV result is Positive or Early Detect.
    if (
      objValues.resultOfHivTest?.toLowerCase().includes("positive") ||
      objValues.resultOfHivTest?.toLowerCase().includes("early")
    ) {
      temp.dateReferred = objValues.dateReferred
        ? ""
        : "This field is required";
    } else {
      temp.dateReferred = "";
    }
    // Date of HIV Test must be on or before Date Enrolled
    if (
      objValues.dateOfHivTest &&
      objValues.dateEnrolled &&
      objValues.dateOfHivTest > objValues.dateEnrolled
    ) {
      temp.dateOfHivTest = "Date of HIV Test must be on or before Date Enrolled";
    }
    temp.dateOfInitialAdherenceCounseling = objValues.dateOfInitialAdherenceCounseling
      ? "" : "This field is required";
    temp.datePrepStarted = objValues.datePrepStarted
      ? "" : "This field is required";
    temp.prepTypeAtStart = objValues.prepTypeAtStart
      ? "" : "This field is required";
    temp.prepRegimen = objValues.prepRegimen
      ? "" : "This field is required";
    temp.pregnancyStatus = "";
    temp.historyOfDrugAllergies = objValues.historyOfDrugAllergies
      ? "" : "This field is required";
    temp.weight = objValues.weight ? "" : "This field is required";
    temp.height = objValues.height ? "" : "This field is required";
    if (!objValues.weight || !objValues.height) {
      temp.bmi = "Weight and height are required to compute BMI";
    } else {
      temp.bmi = "";
    }
    temp.urinalysisResult = objValues.urinalysisResult
      ? "" : "This field is required";
    // liverFunctionTestResults is an array; require at least one entry.
    const lft = objValues.liverFunctionTestResults;
    const hasLft = Array.isArray(lft) ? lft.length > 0 : !!lft;
    temp.liverFunctionTestResults = hasLft ? "" : "This field is required";
    setErrors({ ...temp });
    return Object.values(temp).every(x => x === "");
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (htsBlocked) {
      return;
    }
    if (objValues.resultOfHivTest === "Positive") {
      const typeLabel =
        objValues.enrollmentType === 'PEP'
          ? 'PEP'
          : objValues.enrollmentType === 'PrEP'
          ? 'PrEP'
          : (screeningType === 'PEP' ? 'PEP' : 'PrEP');
      toast.error(`Client with Positive HIV result cannot be initiated on ${typeLabel}`, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      return;
    }
    if (validate()) {
      objValues.personId = props.patientObj.personId || props.patientObj.id;
      objValues.prophylaxisScreeningUuid = patientDto.uuid;
      objValues.prepEligibilityUuid = patientDto.uuid;
      objValues.enrollmentType = toEnrollmentTypeCode(objValues.enrollmentType);
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType) {
        axios
          .put(
            `${baseUrl}prep-pep-initiation/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(async response => {
            setSaving(false);
            props.patientObj.prepCount = "1";
            if (props.PatientObject) await props.PatientObject();
            toast.success(`${screeningType === 'PEP' ? 'PEP' : 'PrEP'} initiation saved successfully!✔`, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error(extractErrorMessage(error), { position: toast.POSITION.BOTTOM_CENTER });
          });
      } else {
        axios
          .post(`${baseUrl}prep/enrollment`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(async response => {
            setSaving(false);
            props.patientObj.prepCount = "1";
            if (props.PatientObject) {
              await props.PatientObject();
            }
            toast.success(`${screeningType === 'PEP' ? 'PEP' : 'PrEP'} initiation saved successfully!✔`, {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error(extractErrorMessage(error), { position: toast.POSITION.BOTTOM_CENTER });
          });
      }
    } else {
      // Build a specific list of missing/invalid fields from the errors map
      const fieldLabels = {
        dateEnrolled: "Date Enrolled",
        uniqueId: "Unique ID",
        enrollmentType: "Enrollment Type",
        populationType: "Population Type",
        hivTestingPoint: "HIV Testing Point",
        dateOfHivTest: "Date of HIV Test",
        resultOfHivTest: "Result of HIV Test",
        supporterRelationshipType: "Supporter Relationship",
        supporterPhone: "Supporter Phone",
        dateReferred: "Date Referred",
        dateOfInitialAdherenceCounseling: "Date of Initial Adherence Counseling",
        datePrepStarted: "Date Started",
        prepTypeAtStart:
          objValues.enrollmentType === "PEP"
            ? "PEP Type at Start" : "PrEP Type at Start",
        prepRegimen: "Regimen",
        pregnancyStatus: "Pregnant",
        historyOfDrugAllergies: "History of Drug Allergies",
        weight: "Body Weight",
        height: "Height",
        bmi: "BMI",
        urinalysisResult: "Urinalysis Result",
        liverFunctionTestResults: "Liver Function Test Result",
      };
      const missing = Object.keys(errors)
        .filter(k => errors[k])
        .map(k => fieldLabels[k] || k);
      const message = missing.length > 0
        ? `Please fix: ${missing.join(", ")}`
        : "Please complete all required fields";
      toast.error(message, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  if (htsBlocked) {
    return (
      <HtsWarningModal
        isOpen
        onReturnToDashboard={() =>
          props.setActiveContent({
            ...props.activeContent,
            route: "recent-history",
          })
        }
      />
    );
  }

  return (
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              <h2>{resolveTypeLabel(objValues.enrollmentType) || resolveTypeLabel(screeningType) || 'PrEP'} Initiation</h2>

              {/* Section A Header */}
              <div
                className="form-group col-md-12 mb-3 p-3"
                style={{
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  fontWeight: "800",
                  fontSize: "1.2rem",
                  marginTop: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                {resolveTypeLabel(objValues.enrollmentType) || resolveTypeLabel(screeningType) || 'PrEP'} Initial Visit
              </div>
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
                    disabled
                    title="Sourced from the latest screening's Unique Client ID"
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      backgroundColor: "#f1f3f5",
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
                  <Label>Enrollment Type <span style={{ color: "red" }}> *</span></Label>
                  <select
                    className="form-control"
                    name="enrollmentType"
                    id="enrollmentType"
                    onChange={handleInputChange}
                    value={objValues.enrollmentType}
                    disabled={true}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="PrEP">PrEP</option>
                    <option value="PEP">PEP</option>
                  </select>
                  {errors.enrollmentType !== "" ? (
                    <span className={classes.error}>{errors.enrollmentType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 4. Population Type */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Population Type <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.POPULATION_TYPE || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.populationType !== "" ? (
                    <span className={classes.error}>{errors.populationType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 6. HIV Testing Point */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>HIV Testing Point <span style={{ color: "red" }}> *</span></Label>
                  <select
                    className="form-control"
                    name="hivTestingPoint"
                    id="hivTestingPoint"
                    onChange={handleInputChange}
                    value={isFromHts
                      ? (latestHts?.setting || "")
                      : (objValues.hivTestingPoint || "")}
                    disabled={disabledField || isFromHts}
                    title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                    }}
                  >
                    <option value="">Select</option>
                    {(codeset?.HTS_ENTRY_POINT || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.hivTestingPoint !== "" ? (
                    <span className={classes.error}>{errors.hivTestingPoint}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 7. Date of HIV Test */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Date of HIV Test <span style={{ color: "red" }}> *</span></Label>
                  <input
                    type="date"
                    className="form-control"
                    onKeyDown={e => e.preventDefault()}
                    name="dateOfHivTest"
                    id="dateOfHivTest"
                    // Read from HTS when present so the disabled field stays
                    // populated even after a server-side load wipes objValues.
                    value={isFromHts
                      ? (latestHts?.dateOfVisit || "")
                      : (objValues.dateOfHivTest || "")}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                    }}
                    max={objValues.dateEnrolled || moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField || isFromHts}
                    title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                  />
                  {errors.dateOfHivTest !== "" ? (
                    <span className={classes.error}>{errors.dateOfHivTest}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 8. Result of HIV test */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Result of HIV test <span style={{ color: "red" }}> *</span></Label>
                  <select
                    className="form-control"
                    name="resultOfHivTest"
                    id="resultOfHivTest"
                    onChange={handleInputChange}
                    value={isFromHts
                      ? (toHivTestResultCode(
                          htsObs.confirmatoryHivTest || htsObs.initialHivTest,
                          htsObs.typeOfHivTestDone) || "")
                      : (objValues.resultOfHivTest || "")}
                    disabled={disabledField || isFromHts}
                    title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                    }}
                  >
                    <option value="">Select</option>
                    {(codeset?.HIV_TEST_RESULT || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.resultOfHivTest !== "" ? (
                    <span className={classes.error}>{errors.resultOfHivTest}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 8b. Date Referred - shown when HIV result = Positive or Early Detect (PrEP or PEP) */}
              {(objValues.resultOfHivTest?.toLowerCase().includes("positive") ||
                objValues.resultOfHivTest?.toLowerCase().includes("early")) && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Date Referred <span style={{ color: "red" }}> *</span></Label>
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
              )}

              {/* 9-11. PrEP Supporter fields - hidden when enrollmentType is PEP */}
              {objValues.enrollmentType !== 'PEP' && (
              <>
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
                  <Label>Relationship{objValues.supporterName && <span style={{ color: "red" }}> *</span>}</Label>
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
                  {errors.supporterRelationshipType !== "" ? (
                    <span className={classes.error}>{errors.supporterRelationshipType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 11. Telephone number (supporter) */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Telephone number (supporter){objValues.supporterName && <span style={{ color: "red" }}> *</span>}</Label>
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
                  {errors.supporterPhone !== "" ? (
                    <span className={classes.error}>{errors.supporterPhone}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              </>
              )}

              {/* ====== Section B: PrEP/PEP Initiation ====== */}
              <div
                className="form-group col-md-12 mb-3 p-3"
                style={{
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  fontWeight: "800",
                  fontSize: "1.2rem",
                  marginTop: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                {`${resolveTypeLabel(objValues.enrollmentType) || resolveTypeLabel(screeningType) || 'PrEP'} Initiation`}
              </div>

              {/* 12. Date of Initial Adherence Counseling */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Date of Initial Adherence Counseling <span style={{ color: "red" }}> *</span></Label>
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
                  <Label>Date Started <span style={{ color: "red" }}> *</span></Label>
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
                    // Not earlier than the latest HTS date that auto-populates
                    // this form.
                    min={latestHts?.dateOfVisit || ""}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* 14. Weight */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Body Weight <span style={{ color: "red" }}> *</span></Label>
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
                </FormGroup>
              </div>

              {/* 15. Height */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Height <span style={{ color: "red" }}> *</span></Label>
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
                </FormGroup>
              </div>

              {/* BMI Display — height is captured in cm; BMI = weight(kg) / height(m)^2 */}
              {objValues.weight && objValues.height && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>BMI <span style={{ color: "red" }}> *</span></Label>
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
                </div>
              )}

              {/* 16. Pregnant */}
              {(props.patientObj?.gender?.toLowerCase() === "female" ||
                props.patientObj?.sex?.toLowerCase() === "female") && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Pregnant <span style={{ color: "red" }}> *</span></Label>
                    <select
                      className="form-control"
                      name="pregnancyStatus"
                      id="pregnancyStatus"
                      onChange={handleInputChange}
                      // Same pattern as the screening form: read directly from
                      // HTS observation when read-only to avoid the
                      // edit-mode-loader race.
                      value={isFromHts
                        ? (htsObs.pregnancyStatus || "")
                        : (objValues.pregnancyStatus || "")}
                      disabled={disabledField || isFromHts}
                      title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                        padding: "0.5rem",
                        backgroundColor: isFromHts ? "#f1f3f5" : undefined,
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
              )}
              {(props.patientObj?.gender?.toLowerCase() === "female" ||
                props.patientObj?.sex?.toLowerCase() === "female") && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Breast Feeding</Label>
                    <select
                      className="form-control"
                      name="breastFeeding"
                      id="breastFeeding"
                      value={
                        (props.patientDetail?.pregnant || "")
                          .toString()
                          .toLowerCase()
                          .replace(/\s|-/g, "") === "breastfeeding"
                          ? "YES_NO_YES"
                          : "YES_NO_NO"
                      }
                      disabled
                      title="Autopopulated from pregnancy status"
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                        padding: "0.5rem",
                        backgroundColor: "#f1f3f5",
                      }}
                    >
                      <option value="">Select</option>
                      {(codeset?.YES_NO || []).map(item => (
                        <option key={item.id} value={item.code}>
                          {item.display}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              )}

              <>
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>{objValues.enrollmentType === 'PEP' ? 'PEP' : 'PrEP'} Type at Start <span style={{ color: "red" }}> *</span></Label>
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
                    {(objValues.enrollmentType === 'PEP'
                      ? [
                          { code: "PEP_TYPE_ORAL", display: "Oral" },
                          { code: "PEP_TYPE_OTHERS", display: "Others" },
                        ]
                      : (codeset?.PrEP_TYPE || [])
                    ).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
              {objValues.prepTypeAtStart?.toLowerCase().includes("other") && (
                <div className="form-group mb-3 col-md-4">
                  <FormGroup>
                    <Label>Specify</Label>
                    <input
                      type="text"
                      className="form-control"
                      name="prepTypeAtStartOthersSpecify"
                      id="prepTypeAtStartOthersSpecify"
                      value={objValues.prepTypeAtStartOthersSpecify}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={disabledField}
                    />
                  </FormGroup>
                </div>
              )}
              </>

              {/* 18. PrEP Regimen */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Regimen <span style={{ color: "red" }}> *</span></Label>
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
                    {objValues.enrollmentType === 'PEP'
                      ? pepRegimenOptions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))
                      : prepRegimen.map(value => (
                          <option key={value.code || value.id} value={value.code || value.id}>
                            {value.regimen}
                          </option>
                        ))}
                  </select>
                </FormGroup>
              </div>

              {/* 18b. Months of Refill */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>Months of Refill</Label>
                  <Input
                    type="number"
                    className="form-control"
                    name="monthsOfRefill"
                    id="monthsOfRefill"
                    min="0"
                    value={objValues.monthsOfRefill}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              {/* 19. History of Drug Allergies */}
              <div className="form-group mb-3 col-md-4">
                <FormGroup>
                  <Label>History of Drug Allergies <span style={{ color: "red" }}> *</span></Label>
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
                  <Label>Urinalysis Result <span style={{ color: "red" }}> *</span></Label>
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
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              {/* 22. Liver Function Test (DualListBox) */}
              <div className="form-group mb-3 col-md-12">
                <FormGroup>
                  <Label>Liver Function Test Result <span style={{ color: "red" }}> *</span></Label>
                  <LiverFunctionTest
                    objValues={objValues}
                    handleInputChange={handleLftInputChange}
                    liverFunctionTestResult={
                      codeset?.LIVER_FUNCTION_TEST_RESULT
                    }
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
  );
};

export default PrEPInitialVisitForm;

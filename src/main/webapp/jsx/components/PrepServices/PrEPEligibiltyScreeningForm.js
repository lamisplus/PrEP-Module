import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormGroup, Label, CardBody, Spinner, Input } from "reactstrap";
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import {
  Card,
  FormLabel,
  makeStyles,
  Button as MatButton,
} from "@material-ui/core";
import { toast } from "react-toastify";
import "react-widgets/dist/css/react-widgets.css";
import { token, url as baseUrl } from "../../../api";
import "react-phone-input-2/lib/style.css";
import { Message, Dropdown } from "semantic-ui-react";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import * as moment from "moment";
import SaveIcon from "@material-ui/icons/Save";
import "../../index.css";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import { useStyles } from "../../../hooks/styles/prepEligibilityScreeningForm/useStyles";
export const DateInputWrapper = ({ children }) => {
  const handleKeyDown = event => {
    event.preventDefault();
  };

  const clonedChildren = React.cloneElement(children, {
    onKeydown: handleKeyDown,
  });

  return clonedChildren;
};
export const LiverFunctionTest = ({
  objValues,
  handleInputChange,
  disabledField,
  liverFunctionTestResult,
  isAutoPop,
}) => {
  const [selectedValues, setSelectedValues] = useState(
    objValues?.liverFunctionTestResults
  );

  const handleChange = selected => {
    setSelectedValues(selected);
    handleInputChange({
      target: { name: "liverFunctionTestResults", value: selected },
    });
  };

  const options = liverFunctionTestResult?.map(value => ({
    value: value?.code,
    label: value?.display,
  }));

  useEffect(() => {
    setSelectedValues(objValues.liverFunctionTestResults);
  }, [objValues.liverFunctionTestResults]);

  return (
    <DualListBox
      options={options || []}
      selected={selectedValues || []}
      onChange={handleChange}
      disabled={isAutoPop || disabledField}
      canFilter
    />
  );
};

const CODESET_KEYS = [
  "COUNSELING_TYPE",
  "LIVER_FUNCTION_TEST_RESULT",
  "REASON_METHOD_SWITCH",
  "REASON_PREP_DECLINED",
  "POPULATION_TYPE",
  "PREGNANCY_STATUS",
  "PrEP_VISIT_TYPE",
  "PrEP_TYPE",
];

const BasicInfo = props => {
  const classes = useStyles();
  const [disabledField, setSisabledField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [reasonForSwitchOptions, setReasonForSwitchOptions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const history = useLocation;
  const patientObj = history?.state?.patientObj || props?.patientObj;
  const [codeset, setCodeset] = useState({});
  let temp = { ...errors };

  const [objValues, setObjValues] = useState({
    uniqueClientId: "",
    clientHtsCode: "",
    counselingType: "",
    drugUseHistory: {},
    extra: {},
    firstTimeVisit: true,
    hivRisk: {},
    numChildrenLessThanFive: "",
    numWives: "",
    personId: "",
    personalHivRiskAssessment: {},
    sexPartner: "",
    sexPartnerRisk: {},
    stiScreening: {},
    targetGroup: "TARGET_GROUP_GEN_POP",
    uniqueId: "",
    visitDate: "",
    visitType: "",
    reasonForSwitch: "",
    populationType: "",
    pregnancyStatus: "",
    referredFrom: "",
    setting: "",
    serviceStatus: "",
    typeOfSession: "",
    lftConducted: "",
    liverFunctionTestResults: [],
    dateLiverFunctionTestResults: "",
    score: 0,
  });
  const [riskAssessment, setRiskAssessment] = useState({
    unprotectedVaginalSexCasual: "",
    unprotectedVaginalSexRegular: "",
    uprotectedAnalSexWithCasual: "",
    uprotectedAnalSexWithRegular: "",
    stiHistory: "",
    sharedNeedles: "",
    moreThan1SexPartner: "",
    analSexWithPartner: "",
    unprotectedAnalSexWithPartner: "",
    haveYouPaidForSex: "",
    haveYouBeenPaidForSex: "",
    haveSexWithoutCondom: "",
    experienceCondomBreakage: "",
    takenPartInSexualOrgy: "",
  });
  const [riskAssessmentPartner, setRiskAssessmentPartner] = useState({
    haveSexWithHIVPositive: "",
    haveSexWithPartnerInjectDrug: "",
    haveSexWithPartnerWhoHasSexWithMen: "",
    haveSexWithPartnerTransgender: "",
    sexWithPartnersWithoutCondoms: "",
  });
  const [stiScreening, setStiScreening] = useState({
    vaginalDischarge: "",
    lowerAbdominalPains: "",
    urethralDischarge: "",
    complaintsOfScrotal: "",
    complaintsGenitalSore: "",
    analDischarge: "",
    analItching: "",
    analpain: "",
    swollenIguinal: "",
    genitalScore: "",
  });

  const [drugHistory, setDrugHistory] = useState({
    useAnyOfTheseDrugs: "",
    cocaine: "",
    heroine: "",
    marijuana: "",
    amphetamine: "",
    codeineSyrup: "",
    othersSpecify: "",
    inject: "",
    sniff: "",
    smoke: "",
    Snort: "",
    useDrugSexualPerformance: "",
    hivTestedBefore: "",
    recommendHivRetest: "",
    clinicalSetting: "",
    reportHivRisk: "",
    hivExposure: "",
    hivTestResultAtvisit: "",
    lastTest: "",
  });
  const [assessmentForPepIndication, setAssessmentForPepIndication] = useState({
    unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours: "",
    sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours: "",
  });
  const [servicesReceivedByClient, setServicesReceivedByClient] = useState({
    willingToCommencePrep: "",
    reasonsForDecline: [],
    otherReasonsForDecline: "",
  });
  const [assessmentForAcuteHivInfection, setAssessmentForAcuteHivInfection] =
    useState({
      acuteHivSymptomsLasttwoWeeks: "",
      unprotectedAnalOrVaginalOrSharedNeedlesLast28Days: "",
    });
  const [assessmentForPrepEligibility, setAssessmentForPrepEligibility] =
    useState({
      hivNegative: "",
      hivRiskScore: "",
      noIndicationForPep: "",
      hasNoProteinuria: "",
      noHistoryOrSignsOfLiverAbnormalitiesCabLa: "",
      noHistoryOfDrugToDrugInteractionCabLa: "",
      noHistoryOfDrugHypersensitivityCabLa: "",
    });

  const handleLftInputChange = event => {
    const { name, value } = event.target;
    setObjValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(async () => {
    axios
      .get(`${baseUrl}application-codesets/v2/codeSets`, {
        params: { codes: CODESET_KEYS },
        paramsSerializer: params =>
          params.codes
            .map(code => `codes=${encodeURIComponent(code)}`)
            .join("&"),
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) =>
        //console.log(res)
        setCodeset(data)
      );
  }, []);

  useEffect(async () => {
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      getPatientPrepEligibility(props.activeContent.id);
      setSisabledField(props.activeContent.actionType === "view");
    }
  }, [props.activeContent]);

  const getPatientPrepEligibility = id => {
    axios
      .get(`${baseUrl}prep/eligibility/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        const {
          personalHivRiskAssessment,
          sexPartnerRisk,
          stiScreening,
          drugUseHistory,
          assessmentForPepIndication,
          assessmentForAcuteHivInfection,
          servicesReceivedByClient,
          assessmentForPrepEligibility,
        } = response.data;
        setObjValues(response.data);
        setRiskAssessment(personalHivRiskAssessment);
        setRiskAssessmentPartner(sexPartnerRisk);
        setStiScreening(stiScreening);
        setDrugHistory(drugUseHistory);
        setAssessmentForPepIndication(assessmentForPepIndication);
        setAssessmentForAcuteHivInfection(assessmentForAcuteHivInfection);
        setServicesReceivedByClient(servicesReceivedByClient);
        setAssessmentForPrepEligibility(assessmentForPrepEligibility);
      })
      .catch(error => {
        console.error("Error fetching patient eligibility data:", error);
      });
  };

  const handleInputChange = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const handleInputChangeRiskAssessment = e => {
    setRiskAssessment({ ...riskAssessment, [e.target.name]: e.target.value });
  };

  const actualRiskCountTrue = Object.values(riskAssessment);
  const riskCount = actualRiskCountTrue.filter(x => x === "true");

  const handleInputChangeRiskAssessmentPartner = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setRiskAssessmentPartner({
      ...riskAssessmentPartner,
      [e.target.name]: e.target.value,
    });
  };

  const actualSexPartRiskCountTrue = Object.values(riskAssessmentPartner);
  const sexPartRiskCount = actualSexPartRiskCountTrue.filter(x => x === "true");

  const handleInputChangeStiScreening = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    setStiScreening({ ...stiScreening, [e.target.name]: e.target.value });
  };

  const actualStiTrue = Object.values(stiScreening);
  const stiCount = actualStiTrue.filter(x => x === "true");

  const handleInputChangeDrugHistory = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (drugHistory.hivTestedBefore === "true") {
      setDrugHistory({ ...drugHistory, lastTest: "" });
    }
    setDrugHistory({ ...drugHistory, [e.target.name]: e.target.value });
  };

  const handleInputChangeAssessmentForPepIndication = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setAssessmentForPepIndication({
      ...assessmentForPepIndication,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeAssessmentForAcuteHivInfection = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setAssessmentForAcuteHivInfection({
      ...assessmentForAcuteHivInfection,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeAssessmentForPrepEligibility = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setAssessmentForPrepEligibility({
      ...assessmentForPrepEligibility,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeServicesReceivedByClient = (e, data) => {
    setErrors({ ...temp, [e.target.name]: "" });

    if (e.target.name === "willingToCommencePrep") {
      setServicesReceivedByClient({
        ...servicesReceivedByClient,
        [e.target.name]: e.target.value,
        reasonsForDecline: [],
      });
    } else {
      setServicesReceivedByClient({
        ...servicesReceivedByClient,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleInputReasonsForDecline = (e, data) => {
    setServicesReceivedByClient({
      ...servicesReceivedByClient,
      reasonsForDecline: data.value,
    });
  };

  const validate = () => {
    temp.visitDate = objValues.visitDate ? "" : "⚠ This field is required.";
    temp.hivTestResultAtvisit = drugHistory.hivTestResultAtvisit
      ? ""
      : "⚠ This field is required.";
    setErrors({ ...temp });

    return Object.values(temp).every(x => x === "");
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (validate()) {
      setSaving(true);
      objValues.drugUseHistory = drugHistory;
      objValues.personalHivRiskAssessment = riskAssessment;
      objValues.sexPartnerRisk = riskAssessmentPartner;
      objValues.stiScreening = stiScreening;
      objValues.personId = props?.patientObj?.personId || props?.patientObj?.id;
      objValues.uniqueId = props?.patientObj?.uniqueId;
      objValues.assessmentForAcuteHivInfection = assessmentForAcuteHivInfection;
      objValues.assessmentForPepIndication = assessmentForPepIndication;
      objValues.assessmentForPrepEligibility = assessmentForPrepEligibility;
      objValues.servicesReceivedByClient = servicesReceivedByClient;
      objValues.score = getPrepEligibilityScore();
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}prep-eligibility/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(response => {
            setSaving(false);
            props.patientObj.eligibilityCount = 1;
            patientObj.eligibilityCount = 1;
            props.patientObj.hivresultAtVisit =
              drugHistory.hivTestResultAtvisit;
            props.patientObj.hivresultAtVisit =
              drugHistory.hivTestResultAtvisit;
            toast.success("Prep eligilibility saved successfully! ✔", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
            props.PatientObject();
          })
          .catch(error => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong ❌ please try again";
              if (error.response.data.apierror) {
                toast.error(error.response.data.apierror.message, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              } else {
                toast.error(errorMessage, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              }
            } else {
              toast.error("Something went wrong ❌ please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      } else {
        axios
          .post(`${baseUrl}prep/eligibility`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            props.patientObj.eligibilityCount = 1;
            props.patientObj.hivresultAtVisit =
              drugHistory.hivTestResultAtvisit;
            toast.success("Prep eligilibility saved successfull! ✔", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
            props.PatientObject();
          })
          .catch(error => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong ❌ please try again";
              if (error.response.data.apierror) {
                toast.error(error.response.data.apierror.message, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              } else {
                toast.error(errorMessage, {
                  position: toast.POSITION.BOTTOM_CENTER,
                });
              }
            } else {
              toast.error("Something went wrong ❌ please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      }
    } else {
      setSaving(false);
      toast.error("All field are required ⚠", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  const isFemale = () => {
    return (
      (props?.patientObj?.gender?.toLowerCase() ||
        patientObj.sex?.toLowerCase()) === "female"
    );
  };

  const is30AndAbove = () => {
    return Number(props.patientObj.age) >= 30;
  };

  const getIndicationForPepResult = () => {
    if (
      assessmentForPepIndication !== null &&
      assessmentForPepIndication !== undefined
    ) {
      return Object.values(assessmentForPepIndication).filter(
        each => each === "true"
      ).length > 0
        ? 0
        : 1;
    }
  };

  const getAcuteHivResult = () => {
    if (
      assessmentForAcuteHivInfection !== null &&
      assessmentForAcuteHivInfection !== undefined
    ) {
      return Object.values(assessmentForAcuteHivInfection).filter(
        each => each === "true"
      ).length > 0
        ? 0
        : 1;
    }
  };

  const getPrepEligibilityScore = () => {
    var score = 0;
    score += drugHistory.hivTestResultAtvisit === "Negative" ? 1 : 0;
    score += riskCount.length > 0 ? 1 : 0;
    score += getAcuteHivResult();
    score += getIndicationForPepResult();
    if (is30AndAbove() && isFemale() === false) {
      score +=
        assessmentForPrepEligibility?.hasNoProteinuria === "true" ? 1 : 0;
    }
    score +=
      assessmentForPrepEligibility?.noHistoryOrSignsOfLiverAbnormalitiesCabLa ===
      "true"
        ? 1
        : 0;
    score +=
      assessmentForPrepEligibility?.noHistoryOfDrugToDrugInteractionCabLa ===
      "true"
        ? 1
        : 0;
    score +=
      assessmentForPrepEligibility?.noHistoryOfDrugHypersensitivityCabLa ===
      "true"
        ? 1
        : 0;

    if (is30AndAbove() && isFemale() === false) {
      return score >= 8 ? 1 : 0;
    } else {
      return score >= 7 ? 1 : 0;
    }
  };

  const getRecentActivities = () => {
    axios
      .get(
        `${baseUrl}prep/activities/patients/${
          props.patientObj.personId || props.patientObj.id
        }?full=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setRecentActivities(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  useEffect(() => {
    getRecentActivities();
  }, []);
  useEffect(() => {
    if (objValues.lftConducted === "false") {
      setObjValues(prevValues => ({
        ...prevValues,
        liverFunctionTestResults: [],
        dateLiverFunctionTestResults: "",
      }));
    }
  }, [objValues.lftConducted]);

  useEffect(() => {
    if (drugHistory.hivTestedBefore === "false") {
      setDrugHistory(prevHistory => ({
        ...prevHistory,
        lastTest: "",
      }));
    }
  }, [drugHistory.hivTestedBefore]);

  return (
    <>
      <Card className={classes.root}>
        <CardBody>
          <h1 style={{ fontSize: "1.1rem" }}>
            PrEP Eligibility Screening Form
          </h1>
          <form>
            <div className="row">
              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Unique Client ID</Label>
                  <input
                    type="text"
                    className="form-control"
                    name="uniqueClientId"
                    id="uniqueClientId"
                    value={objValues.uniqueClientId}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Client HTS Code</Label>
                  <input
                    type="text"
                    className="form-control"
                    name="clientHtsCode"
                    id="clientHtsCode"
                    value={objValues.clientHtsCode}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </Label>
                  <input
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    className="form-control"
                    name="visitDate"
                    id="visitDate"
                    value={objValues.visitDate}
                    onChange={handleInputChange}
                    min={
                      props.patientDetail &&
                      props.patientDetail.dateHivPositive !== null
                        ? props.patientDetail.dateHivPositive
                        : props.patientObj.dateOfRegistration
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                  {errors.visitDate !== "" ? (
                    <span className={classes.error}>{errors.visitDate}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Referred From</Label>
                  <input
                    type="text"
                    className="form-control"
                    name="referredFrom"
                    id="referredFrom"
                    value={objValues.referredFrom}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Visit Type</Label>
                  <select
                    className="form-control"
                    name="visitType"
                    id="visitType"
                    value={objValues.visitType}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {codeset?.PrEP_VISIT_TYPE?.map(value => (
                      <option key={value.code} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Setting</Label>
                  <input
                    type="text"
                    className="form-control"
                    name="setting"
                    id="setting"
                    value={objValues.setting}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Population Type</Label>
                  <select
                    className="form-control"
                    name="populationType"
                    id="populationType"
                    value={objValues.populationType}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {codeset?.POPULATION_TYPE?.map(value => (
                      <option key={value.code} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                    {!codeset?.POPULATION_TYPE?.find(
                      pType => pType.display === "GenPop"
                    ) && (
                      <option value="POPULATION_TYPE_GEN_POP">GenPop</option>
                    )}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>No. of Own Children &lt;5 years</Label>
                  <input
                    type="number"
                    className="form-control"
                    name="numChildrenLessThanFive"
                    id="numChildrenLessThanFive"
                    min="0"
                    value={objValues.numChildrenLessThanFive}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "" || Number(val) >= 0) {
                        handleInputChange(e);
                      }
                    }}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Service Status</Label>
                  <select
                    className="form-control"
                    name="serviceStatus"
                    id="serviceStatus"
                    value={objValues.serviceStatus}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="Civilian">Civilian</option>
                    <option value="Military">Military</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Type of Session</Label>
                  <select
                    className="form-control"
                    name="typeOfSession"
                    id="typeOfSession"
                    value={objValues.typeOfSession}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="Individual">Individual</option>
                    <option value="Couple">Couple</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Sex Partners</Label>
                  <select
                    className="form-control"
                    name="sexPartner"
                    id="sexPartner"
                    value={objValues.sexPartner}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Both">Both</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Pregnancy Status</Label>
                  <select
                    className="form-control"
                    name="pregnancyStatus"
                    id="pregnancyStatus"
                    value={objValues.pregnancyStatus}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="Pregnant">Pregnant</option>
                    <option value="Breastfeeding">Breastfeeding</option>
                    <option value="Not pregnant">Not pregnant</option>
                  </select>
                </FormGroup>
              </div>
              {/* ===== Main Header: Pre-Test Counselling / Risk Assessment ===== */}
              <div
                className="form-group my-4 col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#014D88",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Pre-Test Counselling / Risk Assessment
              </div>

              {/* --- Subsection: Sex Partner Risk --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "4px solid #014D88",
                  backgroundColor: "#f0f4f8",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <h4 style={{ fontWeight: "bold", margin: 0, color: "#014D88" }}>
                  Sex Partner Risk
                </h4>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Have you had sex with a partner who is HIV positive?
                  </Label>
                  <select
                    className="form-control"
                    name="haveSexWithHIVPositive"
                    id="haveSexWithHIVPositive"
                    value={riskAssessmentPartner.haveSexWithHIVPositive}
                    onChange={handleInputChangeRiskAssessmentPartner}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.haveSexWithHIVPositive !== "" ? (
                    <span className={classes.error}>
                      {errors.haveSexWithHIVPositive}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Have you had sex with a partner who injects drugs?
                  </Label>
                  <select
                    className="form-control"
                    name="haveSexWithPartnerInjectDrug"
                    id="haveSexWithPartnerInjectDrug"
                    value={riskAssessmentPartner.haveSexWithPartnerInjectDrug}
                    onChange={handleInputChangeRiskAssessmentPartner}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.haveSexWithPartnerInjectDrug !== "" ? (
                    <span className={classes.error}>
                      {errors.haveSexWithPartnerInjectDrug}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Have you had sex with a partner who has sex with men?
                  </Label>
                  <select
                    className="form-control"
                    name="haveSexWithPartnerWhoHasSexWithMen"
                    id="haveSexWithPartnerWhoHasSexWithMen"
                    value={
                      riskAssessmentPartner.haveSexWithPartnerWhoHasSexWithMen
                    }
                    onChange={handleInputChangeRiskAssessmentPartner}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.haveSexWithPartnerWhoHasSexWithMen !== "" ? (
                    <span className={classes.error}>
                      {errors.haveSexWithPartnerWhoHasSexWithMen}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>
                    Have you had sex with a partner who is a transgender person?
                  </Label>
                  <select
                    className="form-control"
                    name="haveSexWithPartnerTransgender"
                    id="haveSexWithPartnerTransgender"
                    value={riskAssessmentPartner.haveSexWithPartnerTransgender}
                    onChange={handleInputChangeRiskAssessmentPartner}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.haveSexWithPartnerTransgender !== "" ? (
                    <span className={classes.error}>
                      {errors.haveSexWithPartnerTransgender}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>
                    Have you had sex with a partner who has sex with multiple
                    partners without condoms?
                  </Label>
                  <select
                    className="form-control"
                    name="sexWithPartnersWithoutCondoms"
                    id="sexWithPartnersWithoutCondoms"
                    value={riskAssessmentPartner.sexWithPartnersWithoutCondoms}
                    onChange={handleInputChangeRiskAssessmentPartner}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.sexWithPartnersWithoutCondoms !== "" ? (
                    <span className={classes.error}>
                      {errors.sexWithPartnersWithoutCondoms}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <Message warning>
                <h4>
                  Sex Partner Risk Assessment score (sum of all 6 answers)
                </h4>
                <b>Score: {sexPartRiskCount.length}</b>
              </Message>

              <hr />

              {/* --- Subsection: Personal HIV Risk Assessment (Last 3 months) --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "4px solid #014D88",
                  backgroundColor: "#f0f4f8",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <h4 style={{ fontWeight: "bold", margin: 0, color: "#014D88" }}>
                  Personal HIV Risk Assessment (Last 3 months)
                </h4>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Unprotected Vaginal Sex with Casual Partner?</Label>
                  <select
                    className="form-control"
                    name="unprotectedVaginalSexCasual"
                    id="unprotectedVaginalSexCasual"
                    value={riskAssessment.unprotectedVaginalSexCasual}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Unprotected Anal Sex?</Label>
                  <select
                    className="form-control"
                    name="uprotectedAnalSexWithCasual"
                    id="uprotectedAnalSexWithCasual"
                    value={riskAssessment.uprotectedAnalSexWithCasual}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Shared needles/injecting materials?</Label>
                  <select
                    className="form-control"
                    name="sharedNeedles"
                    id="sharedNeedles"
                    value={riskAssessment.sharedNeedles}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>More than 1 sex partner?</Label>
                  <select
                    className="form-control"
                    name="moreThan1SexPartner"
                    id="moreThan1SexPartner"
                    value={riskAssessment.moreThan1SexPartner}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Have you paid for sex in the last 3 months?</Label>
                  <select
                    className="form-control"
                    name="haveYouPaidForSex"
                    id="haveYouPaidForSex"
                    value={riskAssessment.haveYouPaidForSex}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Have you been paid for sex in the last 3 months?</Label>
                  <select
                    className="form-control"
                    name="haveYouBeenPaidForSex"
                    id="haveYouBeenPaidForSex"
                    value={riskAssessment.haveYouBeenPaidForSex}
                    onChange={handleInputChangeRiskAssessment}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <Message warning>
                <h4>
                  Personal HIV Risk assessment score (sum of all 6 answers)
                </h4>
                <b>Score : {riskCount.length}</b>
              </Message>

              <hr />

              {/* --- Subsection: Drug Use History --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "4px solid #014D88",
                  backgroundColor: "#f0f4f8",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <h4 style={{ fontWeight: "bold", margin: 0, color: "#014D88" }}>
                  Drug Use History
                </h4>
              </div>
              <h5
                style={{
                  width: "100%",
                  paddingLeft: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                Do you use any of these drugs/substances?
              </h5>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Cocaine</Label>
                  <select
                    className="form-control"
                    name="cocaine"
                    id="cocaine"
                    value={drugHistory.cocaine}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Heroine</Label>
                  <select
                    className="form-control"
                    name="heroine"
                    id="heroine"
                    value={drugHistory.heroine}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Marijuana</Label>
                  <select
                    className="form-control"
                    name="marijuana"
                    id="marijuana"
                    value={drugHistory.marijuana}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Amphetamine</Label>
                  <select
                    className="form-control"
                    name="amphetamine"
                    id="amphetamine"
                    value={drugHistory.amphetamine}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Codeine/syrup</Label>
                  <select
                    className="form-control"
                    name="codeineSyrup"
                    id="codeineSyrup"
                    value={drugHistory.codeineSyrup}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Others(Specify)</Label>
                  <input
                    type="text"
                    className="form-control"
                    name="othersSpecify"
                    id="othersSpecify"
                    value={drugHistory.othersSpecify}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <h5
                style={{
                  width: "100%",
                  paddingLeft: "0.5rem",
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                Do you use any of these drugs/substances_Route of Administration?
              </h5>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Inject</Label>
                  <select
                    className="form-control"
                    name="inject"
                    id="inject"
                    value={drugHistory.inject}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Sniff</Label>
                  <select
                    className="form-control"
                    name="sniff"
                    id="sniff"
                    value={drugHistory.sniff}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Snort</Label>
                  <select
                    className="form-control"
                    name="Snort"
                    id="Snort"
                    value={drugHistory.Snort}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Smoke</Label>
                  <select
                    className="form-control"
                    name="smoke"
                    id="smoke"
                    value={drugHistory.smoke}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Have you used drugs to enhance sexual performance?</Label>
                  <select
                    className="form-control"
                    name="useDrugSexualPerformance"
                    id="useDrugSexualPerformance"
                    value={drugHistory.useDrugSexualPerformance}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </FormGroup>
              </div>

              <hr />

              {/* --- Subsection: Assessment for PEP Indication --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "4px solid #014D88",
                  backgroundColor: "#f0f4f8",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <h4 style={{ fontWeight: "bold", margin: 0, color: "#014D88" }}>
                  Assessment for PEP Indication
                </h4>
              </div>

              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>
                    In the past 72 hours, have you had sex without a condom with
                    someone whose HIV status is positive or not known to you?
                  </Label>
                  <select
                    className="form-control"
                    name="unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours"
                    id="unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours"
                    value={
                      assessmentForPepIndication?.unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours
                    }
                    onChange={handleInputChangeAssessmentForPepIndication}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours !==
                  "" ? (
                    <span className={classes.error}>
                      {
                        errors.unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours
                      }
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>
                    Have you shared injection equipment like needles with
                    someone whose HIV status is positive or unknown to you?
                  </Label>
                  <select
                    className="form-control"
                    name="sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours"
                    id="sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours"
                    value={
                      assessmentForPepIndication?.sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours
                    }
                    onChange={handleInputChangeAssessmentForPepIndication}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours !==
                  "" ? (
                    <span className={classes.error}>
                      {
                        errors.sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours
                      }
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <hr />

              {/* --- Subsection: Assessment Acute HIV Infection --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "4px solid #014D88",
                  backgroundColor: "#f0f4f8",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <h4 style={{ fontWeight: "bold", margin: 0, color: "#014D88" }}>
                  Assessment Acute HIV Infection
                </h4>
              </div>

              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>
                    In the past 2 weeks: Have you had a cold or flu such as
                    fever, sore throat, abnormal sweats, swollen lymph nodes,
                    mouth sores, headache or rash?
                  </Label>
                  <select
                    className="form-control"
                    name="acuteHivSymptomsLasttwoWeeks"
                    id="acuteHivSymptomsLasttwoWeeks"
                    value={
                      assessmentForAcuteHivInfection?.acuteHivSymptomsLasttwoWeeks
                    }
                    onChange={handleInputChangeAssessmentForAcuteHivInfection}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.acuteHivSymptomsLasttwoWeeks !== "" ? (
                    <span className={classes.error}>
                      {errors.acuteHivSymptomsLasttwoWeeks}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>
                    Have you had anal or vaginal sex without a condom or shared
                    injection materials and/or equipment in the past 28 days?
                  </Label>
                  <select
                    className="form-control"
                    name="unprotectedAnalOrVaginalOrSharedNeedlesLast28Days"
                    id="unprotectedAnalOrVaginalOrSharedNeedlesLast28Days"
                    value={
                      assessmentForAcuteHivInfection?.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days
                    }
                    onChange={handleInputChangeAssessmentForAcuteHivInfection}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days !==
                  "" ? (
                    <span className={classes.error}>
                      {errors.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <hr />

              {/* --- Subsection: STI Screening --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "4px solid #014D88",
                  backgroundColor: "#f0f4f8",
                  padding: "0.5rem 1rem",
                  marginBottom: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <h4 style={{ fontWeight: "bold", margin: 0, color: "#014D88" }}>
                  STI Screening
                </h4>
              </div>

              {props.patientDetail &&
                props.patientDetail.personResponseDto?.sex === "Female" && (
                  <>
                    <div className="form-group col-md-4 p-3">
                      <FormGroup>
                        <Label>
                          Complaints of vaginal discharge or burning when
                          urinating?
                        </Label>
                        <select
                          className="form-control"
                          name="vaginalDischarge"
                          id="vaginalDischarge"
                          value={stiScreening.vaginalDischarge}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value={""}>Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.vaginalDischarge !== "" ? (
                          <span className={classes.error}>
                            {errors.vaginalDischarge}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>

                    <div className="form-group col-md-4 p-3">
                      <FormGroup>
                        <Label>
                          Complaints of lower abdominal pains with or without
                          vaginal discharge?
                        </Label>
                        <select
                          className="form-control"
                          name="lowerAbdominalPains"
                          id="lowerAbdominalPains"
                          value={stiScreening.lowerAbdominalPains}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value={""}>Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.lowerAbdominalPains !== "" ? (
                          <span className={classes.error}>
                            {errors.lowerAbdominalPains}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                )}
              {props.patientObj?.personResponseDto &&
                props.patientDetail?.personResponseDto.sex === "Male" && (
                  <>
                    <div className="form-group col-md-4 p-3">
                      <FormGroup>
                        <Label>
                          Complaints of urethral discharge or burning when
                          urinating?
                        </Label>
                        <select
                          className="form-control"
                          name="urethralDischarge"
                          id="urethralDischarge"
                          value={stiScreening.urethralDischarge}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value={""}>Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.urethralDischarge !== "" ? (
                          <span className={classes.error}>
                            {errors.urethralDischarge}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group col-md-4 p-3">
                      <FormGroup>
                        <Label>Complaints of scrotal swelling and pain</Label>
                        <select
                          className="form-control"
                          name="complaintsOfScrotal"
                          id="complaintsOfScrotal"
                          value={stiScreening.complaintsOfScrotal}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value={""}>Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.complaintsOfScrotal !== "" ? (
                          <span className={classes.error}>
                            {errors.complaintsOfScrotal}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                    <div className="form-group col-md-4 p-3">
                      <FormGroup>
                        <Label>
                          Complaints of genital sore(s) or swollen inguinal
                          lymph nodes with or without pains?
                        </Label>
                        <select
                          className="form-control"
                          name="complaintsGenitalSore"
                          id="complaintsGenitalSore"
                          value={stiScreening.complaintsGenitalSore}
                          onChange={handleInputChangeStiScreening}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.2rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value={""}>Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                        {errors.complaintsGenitalSore !== "" ? (
                          <span className={classes.error}>
                            {errors.complaintsGenitalSore}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  </>
                )}
              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Genital sore +/-pains?</Label>
                  <select
                    className="form-control"
                    name="genitalScore"
                    id="genitalScore"
                    value={stiScreening.genitalScore}
                    onChange={handleInputChangeStiScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.genitalScore !== "" ? (
                    <span className={classes.error}>{errors.genitalScore}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Swollen iguinal lymph node +/-pains?</Label>
                  <select
                    className="form-control"
                    name="swollenIguinal"
                    id="swollenIguinal"
                    value={stiScreening.swollenIguinal}
                    onChange={handleInputChangeStiScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.swollenIguinal !== "" ? (
                    <span className={classes.error}>
                      {errors.swollenIguinal}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Anal pain on stooling?</Label>
                  <select
                    className="form-control"
                    name="analpain"
                    id="analpain"
                    value={stiScreening.analpain}
                    onChange={handleInputChangeStiScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.analpain !== "" ? (
                    <span className={classes.error}>{errors.analpain}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Anal itching?</Label>
                  <select
                    className="form-control"
                    name="analItching"
                    id="analItching"
                    value={stiScreening.analItching}
                    onChange={handleInputChangeStiScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.analItching !== "" ? (
                    <span className={classes.error}>{errors.analItching}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-6 p-3">
                <FormGroup>
                  <Label>Anal discharge?</Label>
                  <select
                    className="form-control"
                    name="analDischarge"
                    id="analDischarge"
                    value={stiScreening.analDischarge}
                    onChange={handleInputChangeStiScreening}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.analDischarge !== "" ? (
                    <span className={classes.error}>
                      {errors.analDischarge}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <Message warning>
                <h4>
                  Calculate the sum of the STI screening. If {">= "}1, should be
                  referred for STI test{" "}
                </h4>
                <b>Score :{stiCount.length}</b>
              </Message>

              <hr />
              <br />
              <div
                className="form-group  col-md-12 text-center pt-2 mb-4 p-3"
                style={{
                  backgroundColor: "#014D88",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Assessment for PrEP Eligibilty
              </div>

              <div className="col-md-6 p-3">
                <div className="d-flex">
                  <div style={{ flex: 1 }}>
                    <FormGroup>
                      <Label>
                        HIV Negative:{" "}
                        <span className="badge badge-info">{`${
                          drugHistory.hivTestResultAtvisit === "Negative"
                            ? 1
                            : 0
                        }`}</span>{" "}
                      </Label>
                    </FormGroup>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Label>
                      HIV Risk Score &gt; 1:{" "}
                      <span className="badge badge-info">{`${
                        riskCount.length > 0 ? 1 : 0
                      }`}</span>
                    </Label>
                  </div>
                </div>

                {true && (
                  <div className="form-group  col-md-4 p-3">
                    <FormGroup>
                      <Label>{`Has no proteinuria (>=30 Years)`}</Label>
                      <select
                        className="form-control"
                        name="hasNoProteinuria"
                        id="hasNoProteinuria"
                        value={assessmentForPrepEligibility?.hasNoProteinuria}
                        onChange={handleInputChangeAssessmentForPrepEligibility}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value={""}>Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      {errors.hasNoProteinuria !== "" ? (
                        <span className={classes.error}>
                          {errors.hasNoProteinuria}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}
              </div>
              <div className="form-group  col-md-6 p-3">
                <FormGroup>
                  <Label>
                    {`No history/signs & symptoms of Liver abnormalities (CAB-LA)`}
                  </Label>
                  <select
                    className="form-control"
                    name="noHistoryOrSignsOfLiverAbnormalitiesCabLa"
                    id="noHistoryOrSignsOfLiverAbnormalitiesCabLa"
                    value={
                      assessmentForPrepEligibility?.noHistoryOrSignsOfLiverAbnormalitiesCabLa
                    }
                    onChange={handleInputChangeAssessmentForPrepEligibility}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.noHistoryOrSignsOfLiverAbnormalitiesCabLa !== "" ? (
                    <span className={classes.error}>
                      {errors.noHistoryOrSignsOfLiverAbnormalitiesCabLa}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-4 p-3">
                <FormGroup>
                  <Label>{`No history of PrEP drug interaction (CAB-LA)`}</Label>
                  <select
                    className="form-control"
                    name="noHistoryOfDrugToDrugInteractionCabLa"
                    id="noHistoryOfDrugToDrugInteractionCabLa"
                    value={
                      assessmentForPrepEligibility?.noHistoryOfDrugToDrugInteractionCabLa
                    }
                    onChange={handleInputChangeAssessmentForPrepEligibility}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.noHistoryOfDrugToDrugInteractionCabLa !== "" ? (
                    <span className={classes.error}>
                      {errors.noHistoryOfDrugToDrugInteractionCabLa}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group  col-md-8 p-3">
                <FormGroup>
                  <Label>{`No history of drug hypersensitivity (CAB-LA)`}</Label>
                  <select
                    className="form-control"
                    name="noHistoryOfDrugHypersensitivityCabLa"
                    id="noHistoryOfDrugHypersensitivityCabLa"
                    value={
                      assessmentForPrepEligibility?.noHistoryOfDrugHypersensitivityCabLa
                    }
                    onChange={handleInputChangeAssessmentForPrepEligibility}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.noHistoryOfDrugHypersensitivityCabLa !== "" ? (
                    <span className={classes.error}>
                      {errors.noHistoryOfDrugHypersensitivityCabLa}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <Message warning>
                <h4>
                  Calculate the sum of PrEP Eligibility. If {">= "}1 client is
                  Eligible for PrEP. (Score: Count Yes=1, No=0).
                </h4>
                {/* <b>Score :{stiCount.length}</b> */}
                <h5>{`HIV Negative: ${
                  drugHistory.hivTestResultAtvisit === "Negative" ? 1 : 0
                }`}</h5>
                <h5>{`HIV risk score >=1 : ${
                  riskCount.length > 0 ? 1 : 0
                }`}</h5>
                <h5>{`No signs & symptoms of acute HIV infection: ${getAcuteHivResult()}`}</h5>
                <h5>{`No Indication for PEP: ${getIndicationForPepResult()}`}</h5>
                {is30AndAbove() && isFemale() === false && (
                  <h5>{`Has no proteinuria: ${
                    assessmentForPrepEligibility?.hasNoProteinuria === "true"
                      ? 1
                      : 0
                  }`}</h5>
                )}
              </Message>
              <Message warning>
                <h4>
                  Calculate the sum of PrEP Eligibility for CAB-LA regimen. If
                  the following below =1 client is Eligible for CAB-LA.{" "}
                  {`(Score: Count Yes=1, No=0)`}
                </h4>
                {/* <b>Score :{stiCount.length}</b> */}
                <h5>{`No history / signs & symptoms of Liver abnormalities (CAB-LA): ${
                  assessmentForPrepEligibility?.noHistoryOrSignsOfLiverAbnormalitiesCabLa ===
                  "true"
                    ? 1
                    : 0
                }`}</h5>
                <h5>{`No history of PrEP drug interaction (CAB-LA): ${
                  assessmentForPrepEligibility?.noHistoryOfDrugToDrugInteractionCabLa ===
                  "true"
                    ? 1
                    : 0
                }`}</h5>
                <h5>{`No history of drug hypersensitivity (CAB-LA): ${
                  assessmentForPrepEligibility?.noHistoryOfDrugHypersensitivityCabLa ===
                  "true"
                    ? 1
                    : 0
                }`}</h5>
              </Message>
              {/* <Message warning>
                                <h3>{`Final Prep Eligibility Score: ${getPrepEligibilityScore()}`}</h3>
                            </Message> */}
              <hr />
              <br />
              <div
                className="form-group  col-md-12 text-center mb-4 p-2"
                style={{
                  backgroundColor: "#014D88",
                  width: "125%",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Services Received by Client
              </div>
              <div className="form-group  col-md-6">
                <FormGroup>
                  <Label>Willing to commence PrEP</Label>
                  <select
                    className="form-control"
                    name="willingToCommencePrep"
                    id="willingToCommencePrep"
                    value={servicesReceivedByClient?.willingToCommencePrep}
                    onChange={handleInputChangeServicesReceivedByClient}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {errors.willingToCommencePrep !== "" ? (
                    <span className={classes.error}>
                      {errors.willingToCommencePrep}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* <Dropdown placeholder='Skills' fluid multiple selection options={reasonForDecline} /> */}
              {servicesReceivedByClient?.willingToCommencePrep === "false" && (
                <div className="form-group  col-md-4">
                  <FormGroup>
                    <Label>Reasons for Declining PrEP</Label>
                    <Dropdown
                      value={servicesReceivedByClient?.reasonsForDecline}
                      placeholder="select reasons for decline"
                      onChange={handleInputReasonsForDecline}
                      fluid
                      multiple
                      selection
                      options={codeset?.REASON_PREP_DECLINED?.map(each => {
                        return {
                          key: each.code,
                          text: each.display,
                          value: each.code,
                        };
                      })}
                    />
                    {errors.reasonsForDecline !== "" ? (
                      <span className={classes.error}>
                        {errors.reasonsForDecline}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
              {servicesReceivedByClient?.reasonsForDecline?.find(
                one => one === "REASON_PREP_DECLINED_OTHERS_(SPECIFY)"
              ) !== (null || undefined) && (
                <div className="form-group  col-md-12 p-3">
                  <FormGroup>
                    <Label>{`Other Reasons for Declining PrEP (Specify)`}</Label>
                    <Input
                      className="form-control"
                      name="otherReasonsForDecline"
                      id="otherReasonsForDecline"
                      value={servicesReceivedByClient?.otherReasonsForDecline}
                      onChange={handleInputChangeServicesReceivedByClient}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={disabledField}
                    />

                    {errors.reasonsForDecline !== "" ? (
                      <span className={classes.error}>
                        {errors.reasonsForDecline}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {saving ? <Spinner /> : ""}
              <br />
              <div className="row">
                <div className="form-group mb-3 col-md-12 p-3">
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
                        style={{ backgroundColor: "#014d88" }}
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        {!saving ? (
                          <span style={{ textTransform: "capitalize" }}>
                            Update
                          </span>
                        ) : (
                          <span style={{ textTransform: "capitalize" }}>
                            Updating...
                          </span>
                        )}
                      </MatButton>
                    </>
                  ) : (
                    <>
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
                          <span style={{ textTransform: "capitalize" }}>
                            Save
                          </span>
                        ) : (
                          <span style={{ textTransform: "capitalize" }}>
                            Saving...
                          </span>
                        )}
                      </MatButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
};

export default BasicInfo;

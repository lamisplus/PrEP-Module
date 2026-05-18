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
import { fetchEligibilityScreeningCodesets } from "../../../apiCalls/hivPreventionCodesets";
import { toHivTestResultCode } from "../../../Utils/htsResultMapper";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
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

// Tolerant truthiness checks for the YES_NO codeset migration.
// Older records and a few hand-crafted fields still use "true" / "false";
// new records arrive with the codeset codes "YES_NO_YES" / "YES_NO_NO".
// Treat both as equivalent so screening scoring keeps working.
const isYes = v => v === true || v === "true" || v === "YES_NO_YES";
const isNo = v => v === false || v === "false" || v === "YES_NO_NO";
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

// CODESET_KEYS removed — codesets now loaded from codesets.js

const BasicInfo = props => {
  const classes = useStyles();
  const screeningType = props.activeContent?.screeningType || '';
  const [disabledField, setSisabledField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [reasonForSwitchOptions, setReasonForSwitchOptions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const history = useLocation;
  const patientObj = history?.state?.patientObj || props?.patientObj;
  const [codeset, setCodeset] = useState({});
  const [settingOptions, setSettingOptions] = useState([]);
  let temp = { ...errors };

  const [objValues, setObjValues] = useState({
    uniqueClientId: "",
    clientHtsCode: "",
    htsEncounterUuid: "",
    counselingType: "",
    category: screeningType,
    drugUseHistory: {},
    firstTimeVisit: true,
    numChildrenLessThanFive: "",
    personId: "",
    personalHivRiskAssessment: {},
    sexPartner: "",
    sexPartnerRisk: {},
    stiScreening: {},
    targetGroup: "TARGET_GROUP_GEN_POP",
    visitDate: "",
    visitType: "",
    reasonForSwitch: "",
    populationType: "",
    pregnancyStatus: "",
    referredFrom: "",
    setting: "",
    serviceStatus: "",
    typeOfSession: "",
    score: 0,
  });

  // The Patient tab now ships the latest HTS encounter with each row. When
  // present, Client's HTS Code / Pregnancy Status / HIV Test Result at Visit
  // are sourced from it (not collected on this form), and `htsEncounterUuid` is what
  // we persist server-side. Locked fields below read this flag.
  //
  // On edit/view the saved record carries a `htsEncounterUuid` instead — fetched via
  // GET /prep/hts-encounter/{uuid} and stashed in `loadedHts` so the same
  // auto-populate / disable logic applies on every render path.
  const [loadedHts, setLoadedHts] = useState(null);
  const latestHts = patientObj?.latestHtsResult || loadedHts;
  const htsObs = latestHts?.observation || {};
  const isFromHts = !!latestHts;
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
    prepOffered: "",
    willingToCommencePrep: "",
    prepAccepted: "",
    clientReferredToOtherServices: "",
    othersSpecify: "",
    reasonsForDecline: [],
    otherReasonsForDecline: "",
  });
  const [reasonForDecliningPrep, setReasonForDecliningPrep] = useState({
    noNeedForPrep: "",
    doesNotWishDailyMedication: "",
    concernsAboutSideEffects: "",
    concernsAboutWhatOthersThink: "",
    concernsAboutTimeForClinicFollowUp: "",
    concernsAboutSafetyOfMedication: "",
    concernsAboutEffectivenessOfMedication: "",
    othersSpecify: "",
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
      noSignsAndSymptomsOfAcuteHivInfection: "",
      noIndicationForPep: "",
      hasNoProteinuria: "",
    });
  const [considerationForInjections, setConsiderationForInjections] = useState({
    noHistoryOrSignsOfLiverAbnormalitiesInjectable: "",
    noHistoryOfDrugToDrugInteractionInjectable: "",
    noHistoryOfDrugHypersensitivityInjectable: "",
  });

  useEffect(() => {
    fetchEligibilityScreeningCodesets().then(({ codeset, settingOptions }) => {
      setCodeset(codeset);
      setSettingOptions(settingOptions);
    });
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

  // On edit/view: once the saved record loads and exposes its `htsEncounterUuid`,
  // fetch the underlying hts_encounter so the read-only HTS fields can show
  // the same values that were captured at save time.
  useEffect(() => {
    const savedUuid = objValues?.htsEncounterUuid;
    if (!savedUuid) return;
    // Skip the fetch if the Patient tab already shipped a latestHtsResult that
    // matches (avoids a wasted round-trip on the create path).
    if (patientObj?.latestHtsResult?.uuid === savedUuid) return;
    if (loadedHts?.uuid === savedUuid) return;
    axios
      .get(`${baseUrl}prep/hts-encounter/${savedUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(resp => setLoadedHts(resp?.data || null))
      .catch(() => setLoadedHts(null));
  }, [objValues?.htsEncounterUuid, patientObj?.latestHtsResult?.uuid]);

  // Auto-populate fields sourced from the latest hts_encounter. Runs on both
  // create (latestHtsResult from the row) and edit/view (loadedHts from the
  // GET /hts-encounter/{uuid} call) so the disabled fields always reflect the
  // canonical HTS values.
  useEffect(() => {
    if (!isFromHts) return;
    setObjValues(prev => ({
      ...prev,
      clientHtsCode:
        patientObj?.htsClientCode || latestHts.clientCode || prev.clientHtsCode,
      htsEncounterUuid: prev.htsEncounterUuid || latestHts.uuid || "",
      pregnancyStatus: htsObs.pregnancyStatus || prev.pregnancyStatus,
    }));
    setDrugHistory(prev => ({
      ...prev,
      // HTS observation stores STI_HIV_RESULT_* codes; the screening form's
      // dropdown is on HIV_TEST_RESULT_*, so translate.
      hivTestResultAtvisit:
        toHivTestResultCode(
          htsObs.confirmatoryHivTest || htsObs.initialHivTest,
          htsObs.typeOfHivTestDone)
          || prev.hivTestResultAtvisit,
    }));
  }, [latestHts?.uuid]);

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
          considerationForInjections,
          reasonForDecliningPrep,
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
        if (considerationForInjections)
          setConsiderationForInjections(considerationForInjections);
        if (reasonForDecliningPrep)
          setReasonForDecliningPrep(reasonForDecliningPrep);
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
  const riskCount = actualRiskCountTrue.filter(isYes);

  const handleInputChangeRiskAssessmentPartner = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setRiskAssessmentPartner({
      ...riskAssessmentPartner,
      [e.target.name]: e.target.value,
    });
  };

  const actualSexPartRiskCountTrue = Object.values(riskAssessmentPartner);
  const sexPartRiskCount = actualSexPartRiskCountTrue.filter(isYes);

  const handleInputChangeStiScreening = e => {
    setErrors({ ...errors, [e.target.name]: "" });
    setStiScreening({ ...stiScreening, [e.target.name]: e.target.value });
  };

  const actualStiTrue = Object.values(stiScreening);
  const stiCount = actualStiTrue.filter(isYes);

  const handleInputChangeDrugHistory = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    if (isYes(drugHistory.hivTestedBefore)) {
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

  const handleInputChangeConsiderationForInjections = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setConsiderationForInjections({
      ...considerationForInjections,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeReasonForDecliningPrep = e => {
    setErrors({ ...temp, [e.target.name]: "" });
    setReasonForDecliningPrep({
      ...reasonForDecliningPrep,
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
    temp.visitDate = objValues.visitDate ? "" : "This field is required";
    // Date of Visit cannot precede the latest HTS encounter date — the screening
    // is for a visit that happened on/after the HTS test.
    if (objValues.visitDate && latestHts?.dateOfVisit
        && objValues.visitDate < latestHts.dateOfVisit) {
      temp.visitDate =
        `Date of Visit cannot be earlier than the HTS test date (${latestHts.dateOfVisit})`;
    }
    temp.uniqueClientId = objValues.uniqueClientId
      ? ""
      : "This field is required";
    // clientHtsCode is auto-populated from latestHtsResult.clientCode when an HTS
    // encounter is present; only require it on legacy paths without one.
    temp.clientHtsCode = isFromHts || objValues.clientHtsCode
      ? ""
      : "This field is required";
    temp.referredFrom = objValues.referredFrom ? "" : "This field is required";
    temp.visitType = objValues.visitType ? "" : "This field is required";
    // Skip-logic: Reason for Switch is required only when Visit Type = Method Switch
    if (objValues.visitType === "PREP_VISIT_TYPE_METHOD_SWITCH") {
      temp.reasonForSwitch = objValues.reasonForSwitch
        ? ""
        : "This field is required";
    } else {
      temp.reasonForSwitch = "";
    }
    temp.setting = objValues.setting ? "" : "This field is required";
    temp.populationType = objValues.populationType
      ? ""
      : "This field is required";
    temp.serviceStatus = objValues.serviceStatus
      ? ""
      : "This field is required";
    temp.sexPartner = objValues.sexPartner ? "" : "This field is required";
    if (isFemale()) {
      // Pregnancy status comes from HTS observation when available.
      temp.pregnancyStatus = isFromHts || objValues.pregnancyStatus
        ? ""
        : "This field is required";
    }
    // HIV Test Result at Visit comes from HTS observation when available.
    temp.hivTestResultAtvisit = isFromHts || drugHistory.hivTestResultAtvisit
      ? ""
      : "This field is required";
    // Drug-history fields are compulsory — the user can't submit until every
    // drug-history question has an answer. Errors are namespaced under
    // drugHistory.* so existing UI error rendering can target them
    // individually.
    // Only fields actually rendered in the JSX appear here; "useAnyOfTheseDrugs"
    // and "hivTestedBefore" live in state but have no input today, so requiring
    // them would permanently block submission.
    [
      "cocaine",
      "heroine",
      "marijuana",
      "amphetamine",
      "codeineSyrup",
      "useDrugSexualPerformance",
      "recommendHivRetest",
      "clinicalSetting",
      "reportHivRisk",
      "hivExposure",
    ].forEach(field => {
      temp[`drugHistory.${field}`] = drugHistory[field]
        ? ""
        : "This field is required";
    });
    setErrors({ ...temp });

    return Object.values(temp).every(x => x === "");
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (validate()) {
      setSaving(true);
      // When the HIV test result is sourced from the latest hts_encounter, do
      // NOT echo it back into drug_use_history JSONB — the canonical source is
      // the linked hts_encounter_uuid. Keeps the table free of redundant fields.
      const drugUseHistoryToSave = { ...drugHistory };
      if (isFromHts) delete drugUseHistoryToSave.hivTestResultAtvisit;
      objValues.drugUseHistory = drugUseHistoryToSave;
      objValues.personalHivRiskAssessment = riskAssessment;
      objValues.sexPartnerRisk = riskAssessmentPartner;
      objValues.stiScreening = stiScreening;
      objValues.personId = props?.patientObj?.personId || props?.patientObj?.id;
      objValues.assessmentForAcuteHivInfection = assessmentForAcuteHivInfection;
      // Only include PEP indication if screening type is not PrEP
      objValues.assessmentForPepIndication = screeningType !== 'PrEP' ? assessmentForPepIndication : {};
      // Only include PrEP-specific sections if screening type is not PEP
      objValues.assessmentForPrepEligibility = screeningType !== 'PEP' ? assessmentForPrepEligibility : {};
      objValues.considerationForInjections = screeningType !== 'PEP' ? considerationForInjections : {};
      objValues.servicesReceivedByClient = screeningType !== 'PEP' ? servicesReceivedByClient : {};
      objValues.reasonForDecliningPrep = screeningType !== 'PEP' ? reasonForDecliningPrep : {};
      objValues.score = getPrepEligibilityScore();
      // Persist the canonical codeset code for `category` (PREP_PEP_ENROLLMENT_TYPE).
      objValues.category =
        screeningType === 'PEP'
          ? 'PREP_PEP_ENROLLMENT_TYPE_PEP'
          : screeningType === 'PrEP'
          ? 'PREP_PEP_ENROLLMENT_TYPE_PREP'
          : objValues.category;
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}prep-eligibility-screening/${props.activeContent.id}`,
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
            toast.success(`${screeningType === 'PEP' ? 'PEP' : 'PrEP'} eligibility screening updated successfully! ✔`, {
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
            handleSaveError(error);
          });
      } else {
        axios
          .post(`${baseUrl}prep-eligibility-screening`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            props.patientObj.eligibilityCount = 1;
            props.patientObj.hivresultAtVisit =
              drugHistory.hivTestResultAtvisit;
            toast.success(`${screeningType === 'PEP' ? 'PEP' : 'PrEP'} eligibility screening saved successfully! ✔`, {
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
            handleSaveError(error);
          });
      }
    } else {
      setSaving(false);
      toast.error("All field are required ⚠", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  // Display the backend's message verbatim — the server already returns a
  // user-friendly string (e.g. "A PrEP/PEP eligibility screening has already
  // been recorded for this client on 13 May 2026.") via PrepErrors.
  const handleSaveError = error => {
    toast.error(extractErrorMessage(error), { position: toast.POSITION.BOTTOM_CENTER });
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
      return Object.values(assessmentForPepIndication).filter(isYes).length > 0
        ? 0
        : 1;
    }
  };

  const getAcuteHivResult = () => {
    if (
      assessmentForAcuteHivInfection !== null &&
      assessmentForAcuteHivInfection !== undefined
    ) {
      return Object.values(assessmentForAcuteHivInfection).filter(isYes).length > 0
        ? 0
        : 1;
    }
  };

  // Aggregate score the form computes from the eligibility questions. We
  // persist this raw sum on prophylaxis_screening.score so reports can read
  // it back; the eligibility-pass flag is derived separately.
  const getPrepEligibilityScore = () => {
    var score = 0;
    score += drugHistory.hivTestResultAtvisit?.toLowerCase().includes("negative") ? 1 : 0;
    score += riskCount.length >= 1 ? 1 : 0;
    score += isYes(assessmentForPrepEligibility?.noSignsAndSymptomsOfAcuteHivInfection) ? 1 : 0;
    score += isYes(assessmentForPrepEligibility?.noIndicationForPep) ? 1 : 0;
    if (is30AndAbove()) {
      score += isYes(assessmentForPrepEligibility?.hasNoProteinuria) ? 1 : 0;
    }
    return score;
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

  // Pre-populate Unique Client ID from the patient's latest screening record
  // so a returning client doesn't have to type the same ID again. Skip when
  // we're editing an existing record (the saved value loads via
  // getPatientPrepEligibility) and when the user has already typed something.
  useEffect(() => {
    if (props.activeContent?.id) return;
    const personId = props.patientObj?.personId || props.patientObj?.id;
    if (!personId) return;
    if (objValues.uniqueClientId) return;
    axios
      .get(`${baseUrl}prep-eligibility-screening/person/${personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(resp => {
        const latest = (resp?.data || [])
          .filter(r => !r.archived && r.uniqueClientId)
          .sort((a, b) => new Date(b.visitDate || 0) - new Date(a.visitDate || 0))[0];
        if (latest?.uniqueClientId) {
          setObjValues(prev =>
            prev.uniqueClientId ? prev : { ...prev, uniqueClientId: latest.uniqueClientId }
          );
        }
      })
      .catch(() => {});
  }, [props.patientObj?.personId, props.patientObj?.id, props.activeContent?.id]);
  useEffect(() => {
    if (isNo(drugHistory.hivTestedBefore)) {
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
          <h1 style={{ fontSize: "1.1rem" }}>{screeningType === 'PEP' ? 'PEP' : 'PrEP'} Eligibility Screening</h1>
          <form>
            <div className="row">
              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Unique Client ID <span style={{ color: "red" }}> *</span></Label>
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
                  {errors.uniqueClientId !== "" ? (
                    <span className={classes.error}>{errors.uniqueClientId}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Client's HTS Code <span style={{ color: "red" }}> *</span></Label>
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
                      backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                    }}
                    disabled={disabledField || isFromHts}
                    title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                  />
                  {errors.clientHtsCode !== "" ? (
                    <span className={classes.error}>{errors.clientHtsCode}</span>
                  ) : (
                    ""
                  )}
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
                    min={latestHts?.dateOfVisit || props.patientObj?.dateOfBirth || ""}
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
                  <Label>Referred From <span style={{ color: "red" }}> *</span></Label>
                  <select
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
                  >
                    <option value="">Select</option>
                    {(codeset?.SOURCE_REFERRAL || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.referredFrom !== "" ? (
                    <span className={classes.error}>{errors.referredFrom}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.referredFrom?.toLowerCase().includes("other") && (
                <div className="form-group col-md-4 p-2">
                  <FormGroup className="p-2">
                    <Label>Specify</Label>
                    <input
                      type="text"
                      className="form-control"
                      name="referredFromSpecify"
                      id="referredFromSpecify"
                      value={objValues.referredFromSpecify || ""}
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

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Visit Type <span style={{ color: "red" }}> *</span></Label>
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
                  {errors.visitType !== "" ? (
                    <span className={classes.error}>{errors.visitType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {objValues.visitType === "PREP_VISIT_TYPE_METHOD_SWITCH" && (
                <div className="form-group col-md-4 p-2">
                  <FormGroup className="p-2">
                    <Label>Reason for Switch <span style={{ color: "red" }}> *</span></Label>
                    <input
                      type="text"
                      className="form-control"
                      name="reasonForSwitch"
                      id="reasonForSwitch"
                      value={objValues.reasonForSwitch}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={disabledField}
                    />
                    {errors.reasonForSwitch !== "" ? (
                      <span className={classes.error}>{errors.reasonForSwitch}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Setting <span style={{ color: "red" }}> *</span></Label>
                  <select
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
                  >
                    <option value="">Select</option>
                    {settingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.setting !== "" ? (
                    <span className={classes.error}>{errors.setting}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Population Type <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.POPULATION_TYPE || []).map(value => (
                      <option key={value.code} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </select>
                  {errors.populationType !== "" ? (
                    <span className={classes.error}>{errors.populationType}</span>
                  ) : (
                    ""
                  )}
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
                  <Label>Service Status <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.PREP_SERVICE_STATUS || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.serviceStatus !== "" ? (
                    <span className={classes.error}>{errors.serviceStatus}</span>
                  ) : (
                    ""
                  )}
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
                    {(codeset?.COUNSELING_TYPE || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Sex Partners <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.SEX || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.sexPartner !== "" ? (
                    <span className={classes.error}>{errors.sexPartner}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {isFemale() && (
                <div className="form-group col-md-4 p-2">
                  <FormGroup className="p-2">
                    <Label>Pregnancy Status <span style={{ color: "red" }}> *</span></Label>
                    <select
                      className="form-control"
                      name="pregnancyStatus"
                      id="pregnancyStatus"
                      // When isFromHts the field is read-only and its value is
                      // the HTS observation directly. This avoids a race where
                      // a server-side fetch (which no longer carries
                      // pregnancyStatus) wipes the formik value after the HTS
                      // auto-pop has set it.
                      value={isFromHts ? (htsObs.pregnancyStatus || "") : (objValues.pregnancyStatus || "")}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                        backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                      }}
                      disabled={disabledField || isFromHts}
                      title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                    >
                      <option value={""}>Select</option>
                      {(codeset?.PREGNANCY_STATUS || []).map(item => (
                        <option key={item.code} value={item.code}>{item.display}</option>
                      ))}
                    </select>
                    {errors.pregnancyStatus !== "" ? (
                      <span className={classes.error}>{errors.pregnancyStatus}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}
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
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "800",
                    margin: 0,
                    color: "#014D88",
                    fontSize: "1.2rem",
                  }}
                >
                  Sex Partner Risk
                </h4>
              </div>

              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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

              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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

              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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

              <Message warning style={{ width: "100%" }}>
                <b>Score: {sexPartRiskCount.length}</b>
              </Message>

              <hr />

              {/* --- Subsection: Personal HIV Risk Assessment (Last 3 months) --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "800",
                    margin: 0,
                    color: "#014D88",
                    fontSize: "1.2rem",
                  }}
                >
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Have you been paid for sex in the last 3 months?
                  </Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <Message warning style={{ width: "100%" }}>
                <b>Score: {riskCount.length}</b>
              </Message>

              <hr />

              {/* --- Subsection: Drug Use History --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "800",
                    margin: 0,
                    color: "#014D88",
                    fontSize: "1.2rem",
                  }}
                >
                  Drug Use History (last 3months)
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
                  <Label>Cocaine <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Heroine <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Marijuana <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Amphetamine <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Codeine/syrup <span style={{ color: "red" }}> *</span></Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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

              {(isYes(drugHistory.cocaine) ||
                isYes(drugHistory.heroine) ||
                isYes(drugHistory.marijuana) ||
                isYes(drugHistory.amphetamine) ||
                isYes(drugHistory.codeineSyrup) ||
                drugHistory.othersSpecify) && (
                <>
              <h5
                style={{
                  width: "100%",
                  paddingLeft: "0.5rem",
                  marginTop: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                Do you use any of these drugs/substances_Route of
                Administration?
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Have you used drugs to enhance sexual performance? <span style={{ color: "red" }}> *</span>
                  </Label>
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
                </>
              )}

              <Message warning style={{ width: "100%" }}>
                <b>Score: {[drugHistory.cocaine, drugHistory.heroine, drugHistory.marijuana, drugHistory.amphetamine, drugHistory.codeineSyrup].filter(isYes).length}</b>
              </Message>

              <hr />

              {screeningType !== 'PrEP' && (
              <>
              {/* --- Subsection: Assessment for PEP Indication --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "800",
                    margin: 0,
                    color: "#014D88",
                    fontSize: "1.2rem",
                  }}
                >
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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

              <Message warning style={{ width: "100%" }}>
                <b>Score: {Object.values(assessmentForPepIndication).filter(isYes).length}</b>
              </Message>
              {Object.values(assessmentForPepIndication).some(isYes) && (
                <div style={{ backgroundColor: "rgba(220,53,69,0.1)", border: "1px solid #dc3545", borderRadius: "0.28571429rem", padding: "0.75rem 1rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: "#dc3545", fontSize: "0.9rem", width: "100%" }}>
                  Refer for PEP
                </div>
              )}

              <hr />
              </>
              )}

              {/* --- Subsection: Assessment Acute HIV Infection --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "800",
                    margin: 0,
                    color: "#014D88",
                    fontSize: "1.2rem",
                  }}
                >
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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

              <Message warning style={{ width: "100%" }}>
                <b>Score: {Object.values(assessmentForAcuteHivInfection).filter(isYes).length}</b>
              </Message>

              <hr />

              {/* --- Subsection: STI Screening --- */}
              <div
                style={{
                  width: "100%",
                  borderLeft: "5px solid #992E62",
                  backgroundColor: "#f0f4f8",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <h4
                  style={{
                    fontWeight: "800",
                    margin: 0,
                    color: "#014D88",
                    fontSize: "1.2rem",
                  }}
                >
                  STI Screening
                </h4>
              </div>

              {props.patientDetail &&
                props.patientDetail.personResponseDto?.sex === "Female" && (
                  <>
                    <div className="form-group col-md-6 p-3">
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
                          {(codeset?.YES_NO || []).map(item => (
                            <option key={item.code} value={item.code}>{item.display}</option>
                          ))}
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

                    <div className="form-group col-md-6 p-3">
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
                          {(codeset?.YES_NO || []).map(item => (
                            <option key={item.code} value={item.code}>{item.display}</option>
                          ))}
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
                    <div className="form-group col-md-6 p-3">
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
                          {(codeset?.YES_NO || []).map(item => (
                            <option key={item.code} value={item.code}>{item.display}</option>
                          ))}
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
                    <div className="form-group col-md-6 p-3">
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
                          {(codeset?.YES_NO || []).map(item => (
                            <option key={item.code} value={item.code}>{item.display}</option>
                          ))}
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
                    <div className="form-group col-md-6 p-3">
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
                          {(codeset?.YES_NO || []).map(item => (
                            <option key={item.code} value={item.code}>{item.display}</option>
                          ))}
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
              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.genitalScore !== "" ? (
                    <span className={classes.error}>{errors.genitalScore}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.analpain !== "" ? (
                    <span className={classes.error}>{errors.analpain}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-6 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.analItching !== "" ? (
                    <span className={classes.error}>{errors.analItching}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group col-md-4 p-3">
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
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
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
                <b>Score: {stiCount.length}</b>
              </Message>
              {stiCount.length >= 1 && (
                <div style={{ backgroundColor: "rgba(220,53,69,0.1)", border: "1px solid #dc3545", borderRadius: "0.28571429rem", padding: "0.75rem 1rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: "#dc3545", fontSize: "0.9rem", width: "100%" }}>
                  Enroll in Syndromic STI management or Refer
                </div>
              )}

              <hr />
              <br />

              {/* ===== Main Header: HIV Testing ===== */}
              <div
                className="form-group my-4 col-md-12 text-center pt-2 mb-4"
                style={{
                  backgroundColor: "#992E62",
                  width: "125%",
                  height: "35px",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                HIV Testing
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>When was your last test?</Label>
                  <select
                    className="form-control"
                    name="lastTest"
                    id="lastTest"
                    value={drugHistory.lastTest}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.TIME_LAST_NEGATIVE_TEST_RESULT || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Recommended for HIV Retest? <span style={{ color: "red" }}> *</span></Label>
                  <select
                    className="form-control"
                    name="recommendHivRetest"
                    id="recommendHivRetest"
                    value={drugHistory.recommendHivRetest}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Tested in other clinical settings such as STI clinic <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="clinicalSetting"
                    id="clinicalSetting"
                    value={drugHistory.clinicalSetting}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    HIV Test Result at Visit{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="hivTestResultAtvisit"
                    id="hivTestResultAtvisit"
                    // On the HTS path the field is read-only and the value
                    // must come straight from the resolved hts_encounter —
                    // the saved screening record deliberately drops this
                    // field on submit (it's dereferenced via hts_encounter_uuid),
                    // so reading from drugHistory state shows blank on view/edit.
                    value={isFromHts
                      ? (toHivTestResultCode(
                          htsObs.confirmatoryHivTest || htsObs.initialHivTest,
                          htsObs.typeOfHivTestDone) || drugHistory.hivTestResultAtvisit || "")
                      : (drugHistory.hivTestResultAtvisit || "")}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                      backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                    }}
                    disabled={disabledField || isFromHts}
                    title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.HIV_TEST_RESULT || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                  {errors.hivTestResultAtvisit !== "" ? (
                    <span className={classes.error}>
                      {errors.hivTestResultAtvisit}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>Report ongoing HIV risk behaviors? <span style={{ color: "red" }}> *</span></Label>
                  <select
                    className="form-control"
                    name="reportHivRisk"
                    id="reportHivRisk"
                    value={drugHistory.reportHivRisk}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="form-group col-md-4 p-3">
                <FormGroup>
                  <Label>
                    Report a specific HIV exposure within the last 3 months? <span style={{ color: "red" }}> *</span>
                  </Label>
                  <select
                    className="form-control"
                    name="hivExposure"
                    id="hivExposure"
                    value={drugHistory.hivExposure}
                    onChange={handleInputChangeDrugHistory}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <Message warning>
                <h4>HIV Testing Summary</h4>
                <b>{`HIV Test Result at Visit: ${
                  codeset?.HIV_TEST_RESULT?.find(item => item.code === drugHistory.hivTestResultAtvisit)?.display
                  || drugHistory.hivTestResultAtvisit
                  || "Not provided"
                }`}</b>
                <br />
                <b>{`Ongoing HIV risk behaviors: ${
                  isYes(drugHistory.reportHivRisk)
                    ? "Yes"
                    : isNo(drugHistory.reportHivRisk)
                      ? "No"
                      : "Not provided"
                }`}</b>
                <br />
                <b>{`HIV exposure in last 3 months: ${
                  isYes(drugHistory.hivExposure)
                    ? "Yes"
                    : isNo(drugHistory.hivExposure)
                      ? "No"
                      : "Not provided"
                }`}</b>
              </Message>

              {drugHistory.hivTestResultAtvisit?.toLowerCase().includes("negative") &&
                (isYes(assessmentForAcuteHivInfection?.acuteHivSymptomsLasttwoWeeks) ||
                  isYes(assessmentForAcuteHivInfection?.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days)) && (
                  <div style={{ backgroundColor: "rgba(220,53,69,0.1)", border: "1px solid #dc3545", borderRadius: "0.28571429rem", padding: "0.75rem 1rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: "#dc3545", fontSize: "0.9rem", width: "100%" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>HIV Re-Testing Recommended</div>
                    <span>Client tested HIV Negative but has signs/symptoms of acute HIV infection. HIV re-testing is recommended after 1 month.</span>
                  </div>
                )}

              <hr />
              <br />
              {screeningType !== 'PEP' && (
              <>
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
                PrEP Eligibility Scoring
              </div>

              {(() => {
                const sexPartnerRiskBinary = sexPartRiskCount.length >= 1 ? 1 : 0;
                const personalHivRiskBinary = riskCount.length >= 1 ? 1 : 0;
                const drugUseBinary = [drugHistory.cocaine, drugHistory.heroine, drugHistory.marijuana, drugHistory.amphetamine, drugHistory.codeineSyrup].some(isYes) ? 1 : 0;
                const acuteHivBinary = Object.values(assessmentForAcuteHivInfection).some(isYes) ? 1 : 0;
                const hivNegativeBinary = drugHistory.hivTestResultAtvisit?.toLowerCase().includes("negative") ? 1 : 0;
                const binaryScore = sexPartnerRiskBinary + personalHivRiskBinary + drugUseBinary + acuteHivBinary + hivNegativeBinary;
                return (
                  <div style={{ width: "100%" }}>
                    <div className="form-group mb-3 col-md-12">
                      <p>Sex Partner Risk: <b>{sexPartnerRiskBinary}</b></p>
                      <p>Personal HIV Risk Assessment: <b>{personalHivRiskBinary}</b></p>
                      <p>Drug Use History: <b>{drugUseBinary}</b></p>
                      <p>Assessment for Acute HIV Infection: <b>{acuteHivBinary}</b></p>
                      <p>HIV Negative: <b>{hivNegativeBinary}</b></p>
                    </div>
                    <Message warning style={{ width: "100%" }}>
                      <b>Score: {binaryScore}</b>
                    </Message>
                    {binaryScore >= 2 && (
                      <div style={{ backgroundColor: "rgba(40,167,69,0.1)", border: "1px solid #28a745", borderRadius: "0.28571429rem", padding: "0.75rem 1rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: "#28a745", fontSize: "0.9rem", width: "100%" }}>
                        Client is Eligible for PrEP
                      </div>
                    )}
                  </div>
                );
              })()}
              </>
              )}
              {screeningType !== 'PEP' && (
              <>
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
                Consideration for Injections
              </div>

              <div className="form-group col-md-6 p-2">
                <FormGroup className="p-2">
                  <Label>{`No history / signs & symptoms of Liver abnormalities (Injectable)`}</Label>
                  <select
                    className="form-control"
                    name="noHistoryOrSignsOfLiverAbnormalitiesInjectable"
                    id="noHistoryOrSignsOfLiverAbnormalitiesInjectable"
                    value={
                      considerationForInjections?.noHistoryOrSignsOfLiverAbnormalitiesInjectable
                    }
                    onChange={handleInputChangeConsiderationForInjections}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
              <div className="form-group col-md-6 p-2">
                <FormGroup className="p-2">
                  <Label>{`No history of drug-drug interaction (Injectable)`}</Label>
                  <select
                    className="form-control"
                    name="noHistoryOfDrugToDrugInteractionInjectable"
                    id="noHistoryOfDrugToDrugInteractionInjectable"
                    value={
                      considerationForInjections?.noHistoryOfDrugToDrugInteractionInjectable
                    }
                    onChange={handleInputChangeConsiderationForInjections}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
              <div className="form-group col-md-6 p-2">
                <FormGroup className="p-2">
                  <Label>{`No history of drug hypersensitivity (Injectable)`}</Label>
                  <select
                    className="form-control"
                    name="noHistoryOfDrugHypersensitivityInjectable"
                    id="noHistoryOfDrugHypersensitivityInjectable"
                    value={
                      considerationForInjections?.noHistoryOfDrugHypersensitivityInjectable
                    }
                    onChange={handleInputChangeConsiderationForInjections}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>

              <div className="col-md-12 p-2">
                {(() => {
                  const liver =
                    considerationForInjections?.noHistoryOrSignsOfLiverAbnormalitiesInjectable;
                  const drugInteraction =
                    considerationForInjections?.noHistoryOfDrugToDrugInteractionInjectable;
                  const hypersensitivity =
                    considerationForInjections?.noHistoryOfDrugHypersensitivityInjectable;
                  const allSelected =
                    liver !== "" &&
                    drugInteraction !== "" &&
                    hypersensitivity !== "";
                  if (!allSelected) return null;
                  const allYes =
                    isYes(liver) &&
                    isYes(drugInteraction) &&
                    isYes(hypersensitivity);
                  return (
                    <div
                      style={{
                        backgroundColor: allYes ? "rgba(40,167,69,0.1)" : "rgba(23,162,184,0.1)",
                        border: `1px solid ${allYes ? "#28a745" : "#17a2b8"}`,
                        borderRadius: "0.28571429rem",
                        padding: "0.75rem 1rem",
                        marginTop: "0.5rem",
                        marginBottom: "0.5rem",
                        color: allYes ? "#28a745" : "#17a2b8",
                        fontSize: "0.9rem",
                        width: "100%",
                      }}
                    >
                      {allYes ? "Eligible for Injectable" : "Consider for Oral"}
                    </div>
                  );
                })()}
              </div>
              </>
              )}

              {screeningType !== 'PEP' && (
              <>
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
                PrEP Initiation
              </div>

              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>PrEP Offered</Label>
                  <select
                    className="form-control"
                    name="prepOffered"
                    id="prepOffered"
                    value={servicesReceivedByClient?.prepOffered}
                    onChange={handleInputChangeServicesReceivedByClient}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
              {isYes(servicesReceivedByClient?.prepOffered) && (
                <div className="form-group col-md-4 p-2">
                  <FormGroup className="p-2">
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
                      {(codeset?.YES_NO || []).map(item => (
                        <option key={item.code} value={item.code}>{item.display}</option>
                      ))}
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
              )}
              {isYes(servicesReceivedByClient?.willingToCommencePrep) && (
                <div className="form-group col-md-4 p-2">
                  <FormGroup className="p-2">
                    <Label>PrEP Accepted</Label>
                    <select
                      className="form-control"
                      name="prepAccepted"
                      id="prepAccepted"
                      value={servicesReceivedByClient?.prepAccepted}
                      onChange={handleInputChangeServicesReceivedByClient}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value={""}>Select</option>
                      {(codeset?.YES_NO || []).map(item => (
                        <option key={item.code} value={item.code}>{item.display}</option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              )}
              <div className="form-group col-md-4 p-2">
                <FormGroup className="p-2">
                  <Label>Client referred to other services</Label>
                  <select
                    className="form-control"
                    name="clientReferredToOtherServices"
                    id="clientReferredToOtherServices"
                    value={
                      servicesReceivedByClient?.clientReferredToOtherServices
                    }
                    onChange={handleInputChangeServicesReceivedByClient}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value={""}>Select</option>
                    {(codeset?.YES_NO || []).map(item => (
                      <option key={item.code} value={item.code}>{item.display}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
              {isYes(servicesReceivedByClient?.clientReferredToOtherServices) && (
                <div className="form-group col-md-4 p-2">
                  <FormGroup className="p-2">
                    <Label>Others (Specify)</Label>
                    <Input
                      className="form-control"
                      name="othersSpecify"
                      id="othersSpecify"
                      value={servicesReceivedByClient?.othersSpecify}
                      onChange={handleInputChangeServicesReceivedByClient}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.2rem",
                      }}
                      disabled={disabledField}
                    />
                  </FormGroup>
                </div>
              )}

              {isNo(servicesReceivedByClient?.willingToCommencePrep) && (
                <>
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
                    Reasons for Declining PrEP
                  </div>

                  <div className="form-group col-md-8 p-2">
                    <FormGroup className="p-2">
                      <Label>Reasons for Declining PrEP</Label>
                      <Dropdown
                        placeholder="Select reasons"
                        fluid
                        multiple
                        selection
                        search
                        options={(codeset?.REASON_PREP_DECLINED || []).map(item => ({
                          key: item.code,
                          value: item.code,
                          text: item.display,
                        }))}
                        value={servicesReceivedByClient.reasonsForDecline || []}
                        onChange={handleInputReasonsForDecline}
                        disabled={disabledField}
                      />
                    </FormGroup>
                  </div>

                  {servicesReceivedByClient.reasonsForDecline?.some(v =>
                    v.toLowerCase().includes("other")
                  ) && (
                    <div className="form-group col-md-4 p-2">
                      <FormGroup className="p-2">
                        <Label>Others (Specify)</Label>
                        <Input
                          className="form-control"
                          name="otherReasonsForDecline"
                          id="otherReasonsForDecline"
                          value={
                            servicesReceivedByClient?.otherReasonsForDecline
                          }
                          onChange={handleInputChangeServicesReceivedByClient}
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
              )}
              </>
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

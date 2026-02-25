import React, { useState, useEffect, useRef, useCallback } from "react";
import { Grid, Segment, Label } from "semantic-ui-react";
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import { Button as MatButton } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Divider from "@mui/material/Divider";
import { TiTrash } from "react-icons/ti";
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { LiverFunctionTest } from "../PrepServices/PrEPEligibilityScreeningForm";
import DurationWrapper from "./DurationWrapper/DurationWrapper";
import { useStyles } from "../../../hooks/styles/prepVisit/useStyle";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  fetchAllCodesets,
  fetchPrepRegimens,
  fetchPrepRegimenByType,
} from "./codesets";

export const CleanupWrapper = ({ cleanup, children }) => {
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);
  return children;
};

const prepTypesMappedToDuration = ["PREP_TYPE_INJECTIBLES", "PREP_TYPE_ORAL"];

const durationMap = {
  "DURATION_OF_CAB-LA_INJECTABLE_REFILL_30": "30",
  "DURATION_OF_CAB-LA_INJECTABLE_REFILL_60": "60",
  "DURATION_OF_CAB-LA_INJECTABLE_REFILL_90": "90",
};
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

const regimenMapping = { orals: "1", cabLa: "2" };

const inputStyle = {
  border: "1px solid #014D88",
  borderRadius: "0.25rem",
};

const inputGroupLeftStyle = {
  backgroundColor: "#014D88",
  color: "#fff",
  border: "1px solid #014D88",
  borderRadius: "0rem",
  borderTopLeftRadius: "0.25rem",
  borderBottomLeftRadius: "0.25rem",
};

const inputGroupRightStyle = {
  backgroundColor: "#014D88",
  color: "#fff",
  border: "1px solid #014D88",
  borderRadius: "0rem",
  borderTopRightRadius: "0.25rem",
  borderBottomRightRadius: "0.25rem",
};

const inputGroupMiddleStyle = {
  border: "1px solid #014D88",
  borderRadius: "0rem",
};

const buildValidationSchema = (isFemalePatient) =>
  Yup.object().shape({
    encounterDate: Yup.string().required("This field is required"),
    visitType: Yup.string().required("This field is required"),
    weight: Yup.string().required("This field is required"),
    pregnant: isFemalePatient
      ? Yup.string().required("This field is required")
      : Yup.string(),
    prepType: Yup.string().required("This field is required"),
    regimenId: Yup.string().required("This field is required"),
    monthsOfRefill: Yup.string().required("This field is required"),
    nextAppointment: Yup.string().required("This field is required"),
    whyAdherenceLevelPoor: Yup.string().when("adherenceLevel", {
      is: val =>
        val?.toUpperCase()?.includes("POOR") ||
        val?.toUpperCase()?.includes("FAIR"),
      then: schema => schema.required("This field is required"),
      otherwise: schema => schema,
    }),
  });

const INITIAL_VALUES = {
  adherenceLevel: "",
  dateInitialAdherenceCounseling: "",
  datePrepGiven: "",
  datePrepStart: "",
  dateReferre: "",
  diastolic: "",
  encounterDate: "",
  extra: {},
  height: "",
  hepatitis: {},
  nextAppointment: "",
  prepNotedSideEffects: [],
  notedSideEffects: "",
  wasPrepAdministered: "",
  otherTestsDone: [],
  personId: "",
  pregnant: "",
  prepEnrollmentUuid: "",
  pulse: "",
  referred: "",
  regimenId: "",
  otherRegimenId: "",
  otherPrepGiven: "",
  respiratoryRate: "",
  riskReductionServices: "",
  healthCareWorkerSignature: "",
  stiScreening: "",
  syndromicStiScreening: null,
  syphilis: {},
  systolic: "",
  temperature: "",
  urinalysis: {},
  creatinine: {},
  urinalysisResult: "",
  creatinineResult: "",
  weight: "",
  why: "",
  otherDrugs: "",
  otherDrugsPrescribed: "",
  hasOtherDrugs: "",
  prepGiven: "",
  hivTestResult: "",
  hivTestResultDate: "",
  prepType: "",
  otherPrepType: "",
  populationType: "",
  prepDistributionSetting: "",
  familyPlanning: "",
  dateOfFamilyPlanning: "",
  monthsOfRefill: "",
  visitType: "",
  reasonForSwitch: "",
  dateLiverFunctionTestResults: "",
  liverFunctionTestResults: [],
  whyAdherenceLevelPoor: "",
  otherReasonForPoorFairAdherence: "",
  otherSyndromicStiScreening: "",
  otherNotedSideEffects: "",
  comment: "",
  duration: "",
};

const ClinicVisit = props => {
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [patientDto, setPatientDto] = useState();
  const [saving, setSaving] = useState(false);
  const [prepRegimen, setprepRegimen] = useState([]);
  const [prepType, setPrepType] = useState([]);
  const [codeset, setCodeset] = useState({});
  const [latestFromEligibility, setLatestFromEligibility] = useState(null);
  const [hivTestValue, setHivTestValue] = useState("");
  const [hivTestResultDate, setHivTestResultDate] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);
  const [fullPrepTypeList, setFullPrepTypeList] = useState([]);
  const [isCabLaEligible, setIsCabLaEligible] = useState(false);
  const [eligibilityVisitDateSync, setEligibilityVisitDateSync] = useState(false);
  const [notedSideEffects, setNotedSideEffects] = useState([]);

  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: "",
    diastolic: "",
    systolic: "",
  });

  const [urinalysisTest, setUrinalysisTest] = useState({
    urinalysisTest: "No",
    testDate: "",
    result: "",
  });
  const [syphilisTest, setSyphilisTest] = useState({
    syphilisTest: "No",
    testDate: "",
    result: "",
    others: "",
  });
  const [hepatitisTest, setHepatitisTest] = useState({
    hepatitisTest: "No",
    testDate: "",
    result: "",
  });
  const [otherTest, setOtherTest] = useState([]);
  const [liverFunctionTestEnabled, setLiverFunctionTestEnabled] = useState(false);

  const [formInitialValues, setFormInitialValues] = useState({
    ...INITIAL_VALUES,
    personId: props.patientObj.personId || props.patientObj.id,
  });

  const formikRef = useRef(null);
  const otherTestInputRef = useRef();

  // ── API Calls ──

  const checkEligibleForCabLa = async (currentDate, regimenList, currentValues) => {
    if (!currentDate) return;
    try {
      const response = await axios.get(
        `${baseUrl}prep-clinic/checkEnableCab/${
          props.patientObj.personId || props.patientObj.id
        }/${currentDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const isEligibleForCABLA = response?.data;
      setIsCabLaEligible(isEligibleForCABLA);
      const reg = regimenList?.filter(each => each.code !== "CAB-LA(600mg/3mL)");
      const pTypes = [...prepType]?.filter(each => each.code !== "PREP_TYPE_INJECTIBLES");
      const vals = currentValues || formikRef.current?.values;
      if (
        isEligibleForCABLA ||
        vals?.visitType === "PREP_VISIT_TYPE_METHOD_SWITCH" ||
        ["update"].includes(props.activeContent.actionType)
      ) {
        setPrepType(fullPrepTypeList);
        setprepRegimen(regimenList);
      } else {
        setPrepType(pTypes);
        setprepRegimen(reg);
      }
    } catch (error) {}
  };

  const PrepRegimen = currentDate => {
    // TODO: Replace fetchPrepRegimens() with API call when endpoint is ready.
    fetchPrepRegimens()
      .then(data => {
        checkEligibleForCabLa(currentDate, data);
      })
      .catch(error => {});
  };

  const getPatientVisit = async () => {
    if (!props.activeContent.id) return;
    try {
      const response = await axios.get(
        `${baseUrl}prep-clinic/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let data = JSON.parse(JSON.stringify(response.data));
      setUrinalysisTest(data.urinalysis || { urinalysisTest: "No", testDate: "", result: "" });
      const loadedOtherTests = (data?.otherTestsDone || []).map((t, i) => ({
        ...t,
        localId: t.localId != null ? t.localId : i,
      }));
      setOtherTest(loadedOtherTests);
      if (loadedOtherTests.length > 0) {
        otherTestIdCounter.current = Math.max(...loadedOtherTests.map(t => t.localId)) + 1;
      }
      setSyphilisTest(data?.syphilis || { syphilisTest: "No", testDate: "", result: "", others: "" });
      setHepatitisTest(data?.hepatitis || { hepatitisTest: "No", testDate: "", result: "" });
      setIsCabLaEligible(true);
      data = {
        ...data,
        monthsOfRefill: getDurationByValue(data.monthsOfRefill) || data?.monthsOfRefill,
        duration: getDurationByValue(data.monthsOfRefill) || data?.duration,
        hasOtherDrugs: data.otherDrugs ? "true" : "",
        otherDrugsPrescribed: data.otherDrugs || "",
      };
      if (data.prepNotedSideEffects) {
        setNotedSideEffects(data.prepNotedSideEffects);
      }
      setFormInitialValues(prev => ({ ...prev, ...data }));
      if (formikRef.current) {
        formikRef.current.setValues({ ...formikRef.current.values, ...data });
      }
    } catch (error) {}
  };

  const getHivResult = () => {
    axios
      .get(
        `${baseUrl}prep-clinic/hts-record/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        if (response.data?.length === 0) {
          toast.error(
            "No HTS record found. At least 1 test result is required to proceed"
          );
        } else if (response.data?.length > 0) {
          toast.success("HTS record found. You may proceed");
        }
        setHivTestValue(response?.data?.[0]?.hivTestResult);
        setHivTestResultDate(response?.data?.[0]?.visitDate);
      })
      .catch(error => {});
  };

  const getPatientDtoObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
      })
      .catch(error => {});
  };

  const getPrepEligibilityObj = () => {
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {})
      .catch(error => {});
  };

  function sortByVisitDateDescending(data) {
    return data.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  }

  const getLatestFromEligibility = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}prep-eligibility/person/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const latestEligibility = sortByVisitDateDescending(response?.data)[0];
      setLatestFromEligibility(latestEligibility);
    } catch (error) {}
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
      .catch(error => {});
  };

  const prepRegimenUpdateView = () =>
    // TODO: Replace fetchPrepRegimens() with API call when endpoint is ready.
    fetchPrepRegimens()
      .then(data => {
        setprepRegimen(data);
      })
      .catch(error => {});

  // ── Utility Functions ──

  const isFemale = () => {
    return (
      props.patientObj.gender?.toLowerCase() === "female" ||
      props.patientObj.sex?.toLowerCase() === "female"
    );
  };

  function areDatesSame(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function hasPrepEligibility(targetDate, activitiesArray) {
    for (const activityGroup of activitiesArray) {
      for (const activity of activityGroup?.activities) {
        if (
          activity.name === "Prep Eligibility" &&
          areDatesSame(new Date(activity.date), new Date(targetDate))
        ) {
          return true;
        }
      }
    }
    return false;
  }

  function areDatesInSync(date1, date2) {
    return date1 === date2;
  }

  const checkDateMismatch = (visitDate, eligibilityDate) => {
    if (visitDate !== eligibilityDate) {
      toast.error(
        "Please enter a date that matches the latest eligibility date!"
      );
    } else {
      toast.success(
        "The visit date matches the latest eligibility date. Great job!"
      );
    }
  };

  function addDaysToDate(dateString, daysToAdd) {
    const date = new Date(dateString);
    if (
      isNaN(date.getTime()) ||
      typeof daysToAdd !== "number" ||
      isNaN(parseInt(daysToAdd))
    ) {
      return "";
    }
    date.setDate(date.getDate() + parseInt(daysToAdd));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const filterOutLastRegimen = (codeSet, lastRegimenId) =>
    codeSet?.filter(regimen => regimen.id !== lastRegimenId);

  const getOptions = (otherPrepTypeVal) => {
    switch (otherPrepTypeVal) {
      case "PREP_TYPE_ORAL":
        return <option value="1">TDF(300mg)+3TC(300mg)</option>;
      case "PREP_TYPE_INJECTIBLES":
        return <option value="2">IM CAB-LA(600mg/3mL)</option>;
      case "PREP_TYPE_ED_PREP":
        return (
          <>
            <option value="2">IM CAB-LA(600mg/3mL)</option>
            <option value="1">TDF(300mg)+3TC(300mg)</option>
          </>
        );
      default:
        return null;
    }
  };

  const isSelectedRegimenCabLa = useCallback(
    (regimenIdVal) => {
      return (regimenIdVal || "").toString() === regimenMapping["cabLa"];
    },
    []
  );

  // ── Vital sign warning helpers ──

  const handleInputValueCheckWeight = e => {
    if (e.target.value < 3 || e.target.value > 150) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        weight: "Body weight must not be greater than 150 and less than 3",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, weight: "" }));
    }
  };

  const handleInputValueCheckSystolic = e => {
    if (e.target.value < 90 || e.target.value > 240) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        systolic:
          "Blood Pressure systolic must not be greater than 240 and less than 90",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, systolic: "" }));
    }
  };

  const handleInputValueCheckDiastolic = e => {
    if (e.target.value < 60 || e.target.value > 140) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        diastolic:
          "Blood Pressure diastolic must not be greater than 140 and less than 60",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, diastolic: "" }));
    }
  };

  // ── Test handlers (outside Formik) ──

  const handleCheckBoxUrinalysisTest = () => {
    if (urinalysisTest?.urinalysisTest === "Yes") {
      setUrinalysisTest({ urinalysisTest: "No", testDate: "", result: "" });
    } else {
      setUrinalysisTest({ ...urinalysisTest, urinalysisTest: "Yes" });
    }
  };

  const handleCheckBoxSyphilisTest = () => {
    if (syphilisTest?.syphilisTest === "Yes") {
      setSyphilisTest({ syphilisTest: "No", testDate: "", result: "", others: "" });
    } else {
      setSyphilisTest({ ...syphilisTest, syphilisTest: "Yes" });
    }
  };

  const handleCheckBoxHepatitisTest = () => {
    if (hepatitisTest?.hepatitisTest === "Yes") {
      setHepatitisTest({ hepatitisTest: "No", testDate: "", result: "" });
    } else {
      setHepatitisTest({ ...hepatitisTest, hepatitisTest: "Yes" });
    }
  };

  const handleCheckBoxLiverFunctionTest = () => {
    setLiverFunctionTestEnabled(prev => !prev);
  };

  const otherTestIdCounter = useRef(0);

  const handleCheckBoxOtherTest = () => {
    if (otherTest.length > 0) {
      setOtherTest([]);
    } else {
      const id = otherTestIdCounter.current++;
      setOtherTest([
        {
          localId: id,
          otherTest: "Yes",
          otherTestsDone: "",
          testDate: "",
          result: "",
          name: "",
          otherTestName: "",
        },
      ]);
    }
  };

  const handleInputChangeUrinalysisTest = e => {
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };

  const handleInputChangeSyphilisTest = e => {
    if (e.target.name === "result" && e.target.value !== "Others") {
      setSyphilisTest({ ...syphilisTest, others: "", [e.target.name]: e.target.value });
    } else {
      setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    }
  };

  const handleInputChangeHepatitisTest = e => {
    setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
  };

  const handleInputChangeOtherTest = (e, localId) => {
    const { name, value } = e.target;
    setOtherTest(prev =>
      prev.map(item => {
        if (item.localId !== localId) return item;
        const updated = { ...item, [name]: value };
        if (name === "otherTestsDone") {
          const matched = codeset?.PREP_OTHER_TEST?.find(
            v => v.code === value
          );
          updated.name = matched?.code || "";
        }
        return updated;
      })
    );
  };

  const handleRemoveTest = localId => {
    setOtherTest(prev => prev?.filter(test => test.localId !== localId));
  };

  const handleCreateNewTest = () => {
    const id = otherTestIdCounter.current++;
    setOtherTest(prev => [
      ...prev,
      {
        localId: id,
        otherTest: "Yes",
        otherTestsDone: "",
        testDate: "",
        result: "",
        name: "",
        otherTestName: "",
      },
    ]);
  };

  // ── Liver Function Test handler ──

  const handleLftInputChange = event => {
    const { name, value } = event.target;
    if (formikRef.current) {
      formikRef.current.setFieldValue(name, value);
    }
  };

  // ── Codeset fetch ──
  // TODO: Replace fetchAllCodesets() with API call when endpoints are ready.

  useEffect(() => {
    fetchAllCodesets().then(data => {
      setCodeset(data);
    });
  }, []);

  // ── Side effects & data loading ──

  useEffect(() => {
    getRecentActivities();
    getHivResult();
    getLatestFromEligibility();
    getPatientDtoObj();
  }, []);

  useEffect(() => {
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      getPrepEligibilityObj();
      setDisabledField(props.activeContent.actionType === "view");
    }
  }, [props.activeContent]);

  useEffect(() => {
    getPrepEligibilityObj();
    getPatientVisit();
    setDisabledField(
      !["update", undefined].includes(props.activeContent.actionType)
    );
  }, [props.activeContent]);

  useEffect(() => {
    if (["update", "view"].includes(props.activeContent.actionType))
      prepRegimenUpdateView();
  }, [props.activeContent.actionType]);

  useEffect(() => {
    if (
      props.activeContent.actionType === "" ||
      props.activeContent.actionType === null
    ) {
      if (formikRef.current) {
        formikRef.current.resetForm({
          values: {
            ...INITIAL_VALUES,
            personId: props.patientObj.personId || props.patientObj.id,
          },
        });
      }
      setUrinalysisTest({ urinalysisTest: "No", testDate: "", result: "" });
      setSyphilisTest({ syphilisTest: "No", testDate: "", result: "", others: "" });
      setHepatitisTest({ hepatitisTest: "No", testDate: "", result: "" });
      setOtherTest([]);
      setNotedSideEffects([]);
    }
  }, [props.activeContent.actionType]);

  // ── Eligibility date sync ──

  useEffect(() => {
    if (!eligibilityVisitDateSync && formikRef.current) {
      formikRef.current.setFieldValue("populationType", "");
      formikRef.current.setFieldValue("visitType", "");
      formikRef.current.setFieldValue("pregnant", "");
      formikRef.current.setFieldValue("liverFunctionTestResults", []);
      formikRef.current.setFieldValue("dateLiverFunctionTestResults", "");
    }
  }, [eligibilityVisitDateSync]);

  useEffect(() => {
    if (eligibilityVisitDateSync && latestFromEligibility !== null && formikRef.current) {
      formikRef.current.setFieldValue(
        "populationType",
        latestFromEligibility?.populationType || ""
      );
      formikRef.current.setFieldValue(
        "visitType",
        latestFromEligibility?.visitType || ""
      );
      formikRef.current.setFieldValue(
        "reasonForSwitch",
        latestFromEligibility?.reasonForSwitch || ""
      );
      formikRef.current.setFieldValue(
        "pregnant",
        latestFromEligibility?.pregnancyStatus || ""
      );
    }
  }, [latestFromEligibility, eligibilityVisitDateSync]);

  useEffect(() => {
    if (eligibilityVisitDateSync && latestFromEligibility && formikRef.current) {
      formikRef.current.setFieldValue(
        "liverFunctionTestResults",
        latestFromEligibility.liverFunctionTestResults
      );
      formikRef.current.setFieldValue(
        "dateLiverFunctionTestResults",
        latestFromEligibility.dateLiverFunctionTestResults || ""
      );
      if (
        latestFromEligibility.liverFunctionTestResults?.length > 0 ||
        latestFromEligibility.dateLiverFunctionTestResults
      ) {
        setLiverFunctionTestEnabled(true);
      }
    }
  }, [latestFromEligibility, eligibilityVisitDateSync]);

  // ── Update tests from loaded data ──

  useEffect(() => {
    const vals = formikRef.current?.values;
    if (!vals) return;
    const updateTest = (testType, setTestFunction) => {
      const testData = vals[testType];
      if (testData?.testDate && testData?.result && testData?.[`${testType}Test`]) {
        setTestFunction({
          ...testData,
          testDate: testData.testDate,
          result: testData.result,
          [`${testType}Test`]: testData[`${testType}Test`],
        });
      }
    };
    updateTest("urinalysis", setUrinalysisTest);
    updateTest("syphilis", setSyphilisTest);
    updateTest("hepatitis", setHepatitisTest);
  }, [formInitialValues]);

  // ── Noted side effects handler ──

  const handleNotedSideEffectsChange = selected => {
    setNotedSideEffects(selected);
    if (formikRef.current) {
      formikRef.current.setFieldValue("notedSideEffects", selected);
    }
  };

  // ── PrEP type change ──

  const handlePrepTypeChange = (e, setFieldValue) => {
    setFieldValue("regimenId", "");
    setFieldValue("prepType", e.target.value);
    if (
      e.target.value === "PREP_TYPE_OTHERS" ||
      e.target.value === "PREP_TYPE_ED_PREP"
    ) {
      PrepRegimen(formikRef.current?.values?.encounterDate);
    } else {
      // TODO: Replace fetchPrepRegimenByType() with API call when endpoint is ready.
      fetchPrepRegimenByType(e.target.value)
        .then(data => {
          checkEligibleForCabLa(
            formikRef.current?.values?.encounterDate,
            data
          );
        })
        .catch(error => {});
    }
  };

  // ── Submit ──

  function handleError(error) {
    setSaving(false);
    if (error.response && error.response.data) {
      let errorMessage =
        error.response.data.apierror &&
        error.response.data.apierror.message !== ""
          ? error.response.data.apierror.message
          : "Something went wrong. Please try again";
      toast.error(errorMessage, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    } else {
      toast.error("Something went wrong, please try again...", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  }

  const handleFormSubmit = async (values) => {
    setSaving(true);
    const payload = { ...values };
    payload.duration = getDuration(payload.monthsOfRefill);
    payload.monthsOfRefill = getDuration(payload.monthsOfRefill);
    payload.hivTestResultDate = hivTestResultDate;
    payload.hivTestResult = hivTestValue;
    payload.syphilis = syphilisTest;
    payload.hepatitis = hepatitisTest;
    payload.urinalysis = urinalysisTest;
    payload.otherTestsDone = otherTest;
    payload.prepEnrollmentUuid = patientDto?.uuid;
    payload.prepNotedSideEffects = notedSideEffects;
    payload.notedSideEffects = "";
    payload.previousPrepStatus = props.patientObj?.prepStatus;
    // Derive stiScreening from syndromicStiScreening for API compatibility
    payload.stiScreening = payload.syndromicStiScreening ? "true" : "false";
    // Map otherDrugsPrescribed back to otherDrugs for API compatibility
    if (payload.hasOtherDrugs === "true") {
      payload.otherDrugs = payload.otherDrugsPrescribed || "";
    } else {
      payload.otherDrugs = "";
    }

    if (props.activeContent && props.activeContent.actionType === "update") {
      try {
        await axios.put(
          `${baseUrl}prep-clinic/${props.activeContent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaving(false);
        toast.success("Clinic visit updated successfully!", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        props.setActiveContent({
          ...props.activeContent,
          route: "consultation",
          activeTab: "history",
          actionType: "view",
        });
      } catch (error) {
        handleError(error);
      }
    } else {
      try {
        await axios.post(`${baseUrl}prep/clinic-visit`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaving(false);
        toast.success("Clinic Visit saved successfully!", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        props.setActiveContent({
          ...props.activeContent,
          route: "consultation",
          activeTab: "history",
          actionType: "view",
        });
      } catch (error) {
        handleError(error);
      }
    }
  };

  const validationSchema = buildValidationSchema(isFemale());

  return (
    <div className={`${classes.root} container-fluid`}>
      <div className="row">
        <div className="col-12">
          <h2 className="p-2">PrEP Follow-up Visit</h2>
        </div>
      </div>
      <Formik
        innerRef={formikRef}
        initialValues={formInitialValues}
        enableReinitialize
        // validationSchema={validationSchema} // Validation temporarily disabled
        onSubmit={(values) => {
          handleFormSubmit(values);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => {
          // Auto-calculate next appointment when encounterDate or monthsOfRefill changes
          const autoCalcNextAppointment = () => {
            if (!["update", "view"].includes(props.activeContent.actionType)) {
              const nextAppt = addDaysToDate(
                values.encounterDate,
                parseInt(getDuration(values.monthsOfRefill))
              );
              if (nextAppt && nextAppt !== values.nextAppointment) {
                setTimeout(() => setFieldValue("nextAppointment", nextAppt), 0);
              }
            }
          };
          autoCalcNextAppointment();

          const showReasonField =
            values.adherenceLevel?.toUpperCase()?.includes("POOR") ||
            values.adherenceLevel?.toUpperCase()?.includes("FAIR");

          const getError = (field) => {
            return touched[field] && errors[field] ? errors[field] : "";
          };

          return (
            <Grid>
              <Grid.Column>
                <Segment>
                  <div className="row">
                    {/* 1. Visit Date */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Visit Date <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          className="form-control"
                          type="date"
                          name="encounterDate"
                          id="encounterDate"
                          onKeyDown={e => e.preventDefault()}
                          value={values.encounterDate}
                          style={inputStyle}
                          onChange={e => {
                            handleChange(e);
                            const newDate = e.target.value;
                            setEligibilityVisitDateSync(
                              areDatesInSync(newDate, latestFromEligibility?.visitDate)
                            );
                            PrepRegimen(newDate);
                            checkDateMismatch(newDate, latestFromEligibility?.visitDate);
                          }}
                          min={
                            patientDto && patientDto.dateEnrolled
                              ? patientDto.dateEnrolled
                              : ""
                          }
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          disabled={disabledField}
                        />
                        {getError("encounterDate") && (
                          <span className={classes.error}>
                            {getError("encounterDate")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 2. Visit Type */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Visit Type <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="visitType"
                          id="visitType"
                          onChange={handleChange}
                          value={values.visitType}
                          disabled
                          style={inputStyle}
                        >
                          <option value="">Select Visit Type</option>
                          {codeset?.PrEP_VISIT_TYPE?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("visitType") && (
                          <span className={classes.error}>
                            {getError("visitType")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 3. Duration on PrEP (Months) */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Duration on PrEP (Months)</FormLabelName>
                        <Input
                          type="text"
                          name="durationOnPrep"
                          id="durationOnPrep"
                          value={
                            latestFromEligibility?.durationOnPrep || ""
                          }
                          style={inputStyle}
                          disabled
                        />
                      </FormGroup>
                    </div>

                    {/* 4. Pregnancy Status (female only) */}
                    {isFemale() && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Pregnancy Status{" "}
                            <span style={{ color: "red" }}> *</span>
                          </FormLabelName>
                          <Input
                            type="select"
                            name="pregnant"
                            id="pregnant"
                            onChange={handleChange}
                            value={values.pregnant}
                            disabled
                            style={inputStyle}
                          >
                            <option value="">Select Pregnancy Status</option>
                            {codeset?.PREGNANCY_STATUS?.map(value => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                          {getError("pregnant") && (
                            <span className={classes.error}>
                              {getError("pregnant")}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    )}

                    {/* 5. Weight (kg) */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Weight (kg) <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <InputGroup>
                          <Input
                            type="number"
                            name="weight"
                            id="weight"
                            onChange={e => {
                              handleChange(e);
                              handleInputValueCheckWeight(e);
                            }}
                            min="3"
                            max="150"
                            value={values.weight}
                            style={{
                              ...inputGroupMiddleStyle,
                              borderTopLeftRadius: "0.25rem",
                              borderBottomLeftRadius: "0.25rem",
                            }}
                            disabled={disabledField}
                          />
                          <InputGroupText
                            addonType="append"
                            style={inputGroupRightStyle}
                          >
                            kg
                          </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.weight && (
                          <span className={classes.error}>
                            {vitalClinicalSupport.weight}
                          </span>
                        )}
                        {getError("weight") && (
                          <span className={classes.error}>
                            {getError("weight")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 6. Blood Pressure (mmHg) */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Blood Pressure (mmHg)</FormLabelName>
                        <InputGroup>
                          <InputGroupText
                            addonType="append"
                            style={inputGroupLeftStyle}
                          >
                            systolic
                          </InputGroupText>
                          <Input
                            type="number"
                            name="systolic"
                            id="systolic"
                            min="90"
                            max="240"
                            onChange={e => {
                              handleChange(e);
                              handleInputValueCheckSystolic(e);
                            }}
                            value={values.systolic}
                            style={inputGroupMiddleStyle}
                            disabled={disabledField}
                          />
                          <InputGroupText
                            addonType="append"
                            style={{
                              backgroundColor: "#014D88",
                              color: "#fff",
                              border: "1px solid #014D88",
                              borderRadius: "0rem",
                            }}
                          >
                            diastolic
                          </InputGroupText>
                          <Input
                            type="number"
                            name="diastolic"
                            id="diastolic"
                            min={0}
                            max={140}
                            onChange={e => {
                              handleChange(e);
                              handleInputValueCheckDiastolic(e);
                            }}
                            value={values.diastolic}
                            style={{
                              ...inputGroupMiddleStyle,
                              borderTopRightRadius: "0.25rem",
                              borderBottomRightRadius: "0.25rem",
                            }}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {vitalClinicalSupport.systolic && (
                          <span className={classes.error}>
                            {vitalClinicalSupport.systolic}
                          </span>
                        )}
                        {vitalClinicalSupport.diastolic && (
                          <span className={classes.error}>
                            {vitalClinicalSupport.diastolic}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 7. HTS Result */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          HTS Result{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="text"
                          name="hivTestResult"
                          id="hivTestResult"
                          value={hivTestValue}
                          style={inputStyle}
                          disabled
                        />
                        {!hivTestValue && (
                          <span className={classes.error}>
                            At least 1 HIV test result is required
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 8. Noted Side Effects */}
                    {codeset?.PREP_SIDE_EFFECTS && (
                      <div className="mb-3 col-md-12">
                        <FormGroup>
                          <FormLabelName>Noted Side Effects</FormLabelName>
                          <DualListBox
                            options={codeset.PREP_SIDE_EFFECTS.map(effect => ({
                              value: effect?.code,
                              label: effect?.display,
                            }))}
                            selected={notedSideEffects}
                            onChange={handleNotedSideEffectsChange}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 8b. Noted Side Effects - Other specify */}
                    {notedSideEffects?.includes("PREP_SIDE_EFFECTS_OTHER") && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Specify Other Side Effect</FormLabelName>
                          <Input
                            type="text"
                            name="otherNotedSideEffects"
                            id="otherNotedSideEffects"
                            value={values.otherNotedSideEffects}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 9. Syndromic STI Screening */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Syndromic STI Screening</FormLabelName>
                        <Input
                          type="select"
                          name="syndromicStiScreening"
                          id="syndromicStiScreening"
                          value={values.syndromicStiScreening || ""}
                          onChange={handleChange}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {codeset?.SYNDROMIC_STI_SCREENING?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </div>

                    {/* 9b. Syndromic STI Screening - Other specify */}
                    {values.syndromicStiScreening &&
                      codeset?.SYNDROMIC_STI_SCREENING?.find(
                        v => v.code === values.syndromicStiScreening
                      )?.display?.toLowerCase()?.includes("other") && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Specify Other STI Screening</FormLabelName>
                          <Input
                            type="text"
                            name="otherSyndromicStiScreening"
                            id="otherSyndromicStiScreening"
                            value={values.otherSyndromicStiScreening}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 10. Risk Reduction Services */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Risk Reduction Services</FormLabelName>
                        <Input
                          type="select"
                          name="riskReductionServices"
                          id="riskReductionServices"
                          value={values.riskReductionServices}
                          onChange={handleChange}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {codeset?.PrEP_RISK_REDUCTION_PLAN?.map(plan => (
                            <option key={plan.id} value={plan.code}>
                              {plan.display}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </div>

                    {/* 11. Adherence */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Adherence</FormLabelName>
                        <Input
                          type="select"
                          name="adherenceLevel"
                          id="adherenceLevel"
                          value={values.adherenceLevel}
                          onChange={e => {
                            handleChange(e);
                            if (
                              !e.target.value?.toUpperCase()?.includes("POOR") &&
                              !e.target.value?.toUpperCase()?.includes("FAIR")
                            ) {
                              setFieldValue("whyAdherenceLevelPoor", "");
                            }
                          }}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {codeset?.PrEP_LEVEL_OF_ADHERENCE?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </div>

                    {/* 12. Reason for Poor/Fair Adherence (conditional) */}
                    {showReasonField && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Reason for Poor/Fair Adherence{" "}
                            <span style={{ color: "red" }}> *</span>
                          </FormLabelName>
                          <Input
                            type="select"
                            name="whyAdherenceLevelPoor"
                            id="whyAdherenceLevelPoor"
                            value={values.whyAdherenceLevelPoor}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {codeset?.WHY_POOR_FAIR_ADHERENCE?.map(value => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                          {getError("whyAdherenceLevelPoor") && (
                            <span className={classes.error}>
                              {getError("whyAdherenceLevelPoor")}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    )}

                    {/* 12b. Reason for Poor/Fair Adherence - Other specify */}
                    {showReasonField &&
                      values.whyAdherenceLevelPoor?.toUpperCase()?.includes("OTHER") && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Specify Other Reason</FormLabelName>
                          <Input
                            type="text"
                            name="otherReasonForPoorFairAdherence"
                            id="otherReasonForPoorFairAdherence"
                            value={values.otherReasonForPoorFairAdherence}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 13. PrEP Type */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          PrEP Type <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="prepType"
                          id="prepType"
                          style={inputStyle}
                          onChange={e => handlePrepTypeChange(e, setFieldValue)}
                          value={values.prepType}
                          disabled={disabledField}
                        >
                          <option value="">Select PrEP Type</option>
                          {codeset?.PrEP_TYPE?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("prepType") && (
                          <span className={classes.error}>
                            {getError("prepType")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 13b. PrEP Type - Other specify */}
                    {values.prepType === "PREP_TYPE_OTHERS" && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Specify Other PrEP Type</FormLabelName>
                          <Input
                            type="text"
                            name="otherPrepType"
                            id="otherPrepType"
                            value={values.otherPrepType}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 14. Prep Regimen */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Prep Regimen <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="regimenId"
                          id="regimenId"
                          onChange={e => {
                            handleChange(e);
                            if (
                              !["update", "view"].includes(
                                props.activeContent.actionType
                              )
                            ) {
                              setFieldValue("monthsOfRefill", "");
                              setFieldValue("duration", "");
                            }
                          }}
                          value={values.regimenId}
                          disabled={disabledField}
                          style={inputStyle}
                        >
                          <option value="">Select</option>
                          {["update", "view"].includes(
                            props.activeContent.actionType
                          )
                            ? prepRegimen?.map(value => (
                                <option key={value.id} value={value.id}>
                                  {value.regimen}
                                </option>
                              ))
                            : values?.visitType ===
                              "PREP_VISIT_TYPE_METHOD_SWITCH"
                            ? filterOutLastRegimen(
                                prepRegimen,
                                props.recentActivities?.[0]?.regimenId
                              )?.map(value => (
                                <option key={value.id} value={value.id}>
                                  {value.regimen}
                                </option>
                              ))
                            : prepRegimen?.map(value => (
                                <option key={value.id} value={value.id}>
                                  {value.regimen}
                                </option>
                              ))}
                        </Input>
                        {getError("regimenId") && (
                          <span className={classes.error}>
                            {getError("regimenId")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 15. Months of Refill */}
                    {values.regimenId && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Months of Refill{" "}
                            <span style={{ color: "red" }}> *</span>
                          </FormLabelName>
                          <DurationWrapper
                            isCabLaEligible={isCabLaEligible}
                            isSelectedRegimenCabLa={isSelectedRegimenCabLa(
                              values.regimenId
                            )}
                            name="monthsOfRefill"
                            id="monthsOfRefill"
                            value={values.monthsOfRefill}
                            style={inputStyle}
                            handleInputChange={e => {
                              const durationInDays = e.target.value;
                              setFieldValue(
                                "monthsOfRefill",
                                `${durationInDays}`
                              );
                              setFieldValue("duration", `${durationInDays}`);
                            }}
                            disabledField={disabledField}
                            setObjValues={fn => {
                              if (typeof fn === "function") {
                                const result = fn(values);
                                Object.keys(result).forEach(key => {
                                  if (result[key] !== values[key]) {
                                    setFieldValue(key, result[key]);
                                  }
                                });
                              }
                            }}
                          />
                          {getError("monthsOfRefill") && (
                            <span className={classes.error}>
                              {getError("monthsOfRefill")}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    )}

                    {/* 16. Other Drugs Prescribed */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Other Drugs Prescribed</FormLabelName>
                        <Input
                          type="select"
                          name="hasOtherDrugs"
                          id="hasOtherDrugs"
                          value={values.hasOtherDrugs}
                          onChange={e => {
                            handleChange(e);
                            if (e.target.value !== "true") {
                              setFieldValue("otherDrugsPrescribed", "");
                            }
                          }}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </Input>
                      </FormGroup>
                    </div>
                    {values.hasOtherDrugs === "true" && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Specify Other Drugs Prescribed
                          </FormLabelName>
                          <Input
                            type="text"
                            name="otherDrugsPrescribed"
                            id="otherDrugsPrescribed"
                            value={values.otherDrugsPrescribed}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Enter other drugs prescribed..."
                          />
                        </FormGroup>
                      </div>
                    )}
                  </div>

                  {/* ── Result of Urinalysis Test ── */}
                  <Label
                    as="a"
                    color="teal"
                    style={{ width: "106%", height: "35px" }}
                    ribbon
                  >
                    <h4 style={{ color: "#fff" }}>
                      <input
                        type="checkbox"
                        name="urinalysisTest"
                        value="Yes"
                        onChange={handleCheckBoxUrinalysisTest}
                        checked={urinalysisTest?.urinalysisTest === "Yes"}
                        disabled={disabledField}
                      />{" "}
                      Result of Urinalysis Test
                    </h4>
                  </Label>
                  <br />
                  <br />
                  {urinalysisTest?.urinalysisTest === "Yes" && (
                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Date of Urinalysis</FormLabelName>
                          <Input
                            type="date"
                            onKeyDown={e => e.preventDefault()}
                            name="testDate"
                            id="urinalysisTestDate"
                            value={urinalysisTest?.testDate}
                            onChange={handleInputChangeUrinalysisTest}
                            style={inputStyle}
                            min={values.encounterDate}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Result</FormLabelName>
                          <Input
                            type="select"
                            name="result"
                            id="urinalysisResult"
                            value={urinalysisTest?.result}
                            onChange={handleInputChangeUrinalysisTest}
                            style={inputStyle}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {codeset?.PREP_URINALYSIS_RESULT?.map(value => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </div>
                    </div>
                  )}

                  {/* ── Result of Hepatitis Test ── */}
                  <Label
                    as="a"
                    color="blue"
                    style={{ width: "106%", height: "35px" }}
                    ribbon
                  >
                    <h4 style={{ color: "#fff" }}>
                      <input
                        type="checkbox"
                        name="hepatitisTest"
                        value="Yes"
                        onChange={handleCheckBoxHepatitisTest}
                        checked={hepatitisTest.hepatitisTest === "Yes"}
                        disabled={disabledField}
                      />{" "}
                      Result of Hepatitis Test
                    </h4>
                  </Label>
                  <br />
                  <br />
                  {hepatitisTest.hepatitisTest === "Yes" && (
                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Date of Hepatitis</FormLabelName>
                          <Input
                            type="date"
                            onKeyDown={e => e.preventDefault()}
                            name="testDate"
                            id="hepatitisTestDate"
                            value={hepatitisTest.testDate}
                            onChange={handleInputChangeHepatitisTest}
                            style={inputStyle}
                            min={values.encounterDate}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Result</FormLabelName>
                          <Input
                            type="select"
                            name="result"
                            id="hepatitisResult"
                            value={hepatitisTest.result}
                            onChange={handleInputChangeHepatitisTest}
                            style={inputStyle}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {codeset?.HEPATITIS_SCREENING_RESULT?.map(
                              value => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              )
                            )}
                          </Input>
                        </FormGroup>
                      </div>
                    </div>
                  )}

                  {/* ── Result of Syphilis Test ── */}
                  <Label
                    as="a"
                    color="red"
                    style={{ width: "106%", height: "35px" }}
                    ribbon
                  >
                    <h4 style={{ color: "#fff" }}>
                      <input
                        type="checkbox"
                        name="syphilisTest"
                        value="Yes"
                        onChange={handleCheckBoxSyphilisTest}
                        checked={syphilisTest?.syphilisTest === "Yes"}
                        disabled={disabledField}
                      />{" "}
                      Result of Syphilis Test
                    </h4>
                  </Label>
                  <br />
                  <br />
                  {syphilisTest?.syphilisTest === "Yes" && (
                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Date of Syphilis Test</FormLabelName>
                          <Input
                            type="date"
                            onKeyDown={e => e.preventDefault()}
                            name="testDate"
                            id="syphilisTestDate"
                            value={syphilisTest?.testDate}
                            onChange={handleInputChangeSyphilisTest}
                            style={inputStyle}
                            disabled={disabledField}
                            min={values.encounterDate}
                            max={moment(new Date()).format("YYYY-MM-DD")}
                          />
                        </FormGroup>
                      </div>
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Result</FormLabelName>
                          <Input
                            type="select"
                            name="result"
                            id="syphilisResult"
                            value={syphilisTest?.result}
                            onChange={handleInputChangeSyphilisTest}
                            style={inputStyle}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {codeset?.SYPHILIS_RESULT?.map(value => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </div>
                      {syphilisTest?.result === "Others" && (
                        <div className="mb-3 col-md-6">
                          <FormGroup>
                            <FormLabelName>
                              Result (Others)
                            </FormLabelName>
                            <Input
                              type="text"
                              name="others"
                              id="syphilisOthers"
                              value={syphilisTest.others}
                              onChange={handleInputChangeSyphilisTest}
                              style={inputStyle}
                              disabled={disabledField}
                            />
                          </FormGroup>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Result of Liver Function Test ── */}
                  <Label
                    as="a"
                    color="olive"
                    style={{ width: "106%", height: "35px" }}
                    ribbon
                  >
                    <h4 style={{ color: "#fff" }}>
                      <input
                        type="checkbox"
                        name="liverFunctionTest"
                        value="Yes"
                        onChange={handleCheckBoxLiverFunctionTest}
                        checked={liverFunctionTestEnabled}
                        disabled={disabledField}
                      />{" "}
                      Result of Liver Function Test
                    </h4>
                  </Label>
                  <br />
                  <br />
                  {liverFunctionTestEnabled && (
                    <div className="row">
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Date of Liver Function Test
                          </FormLabelName>
                          <Input
                            className="form-control"
                            type="date"
                            onKeyDown={e => e.preventDefault()}
                            name="dateLiverFunctionTestResults"
                            id="dateLiverFunctionTestResults"
                            max={moment(new Date()).format("YYYY-MM-DD")}
                            value={values.dateLiverFunctionTestResults}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-12">
                        <FormGroup>
                          <FormLabelName>
                            Result
                          </FormLabelName>
                          <LiverFunctionTest
                            objValues={values}
                            handleInputChange={handleLftInputChange}
                            liverFunctionTestResult={
                              codeset?.LIVER_FUNCTION_TEST_RESULT
                            }
                            disabledField={disabledField}
                            isAutoPop={true}
                          />
                        </FormGroup>
                      </div>
                    </div>
                  )}

                  {/* ── Result of Other Tests ── */}
                  <Label
                    as="a"
                    color="black"
                    style={{ width: "106%", height: "35px" }}
                    ribbon
                  >
                    <h4 style={{ color: "#fff" }}>
                      <input
                        type="checkbox"
                        name="otherTest"
                        value="Yes"
                        ref={otherTestInputRef}
                        onChange={handleCheckBoxOtherTest}
                        checked={otherTest.length > 0}
                        disabled={disabledField}
                      />{" "}
                      Result of Other Tests
                    </h4>
                  </Label>
                  <br />
                  <br />
                  {otherTest.length > 0 &&
                    otherTest?.map(eachTest => (
                      <React.Fragment key={eachTest.localId}>
                        <div className="row">
                          <div className="mb-1 col-md-3">
                            <FormGroup>
                              <FormLabelName>Date</FormLabelName>
                              <Input
                                type="date"
                                onKeyDown={e => e.preventDefault()}
                                name="testDate"
                                id={`otherTestDate_${eachTest.localId}`}
                                value={eachTest.testDate}
                                onChange={e =>
                                  handleInputChangeOtherTest(e, eachTest.localId)
                                }
                                style={inputStyle}
                                disabled={disabledField}
                                min={values.encounterDate}
                                max={moment(new Date()).format("YYYY-MM-DD")}
                              />
                            </FormGroup>
                          </div>

                          <div className="mb-1 col-md-4">
                            <FormGroup>
                              <FormLabelName>Other Tests</FormLabelName>
                              <Input
                                type="select"
                                name="otherTestsDone"
                                id={`otherTestsDone_${eachTest.localId}`}
                                onChange={e =>
                                  handleInputChangeOtherTest(e, eachTest.localId)
                                }
                                value={eachTest.otherTestsDone}
                                style={inputStyle}
                                disabled={disabledField}
                              >
                                <option value="">Select</option>
                                {codeset?.PREP_OTHER_TEST?.map(value => (
                                  <option key={value.id} value={value.code}>
                                    {value.display}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </div>

                          <div className="mb-1 col-md-4">
                            <FormGroup>
                              <FormLabelName>Result</FormLabelName>
                              <Input
                                type="text"
                                name="result"
                                id={`otherTestResult_${eachTest.localId}`}
                                value={eachTest.result}
                                onChange={e =>
                                  handleInputChangeOtherTest(e, eachTest.localId)
                                }
                                style={inputStyle}
                                disabled={disabledField}
                              />
                            </FormGroup>
                          </div>

                          <div className="mb-1 col-md-1 d-flex align-items-end">
                            <button
                              className={`${classes.button} btn btn-danger`}
                              style={{
                                display: "block",
                                margin: 0,
                                fontSize: "1.2em",
                              }}
                              disabled={disabledField}
                              onClick={() => handleRemoveTest(eachTest.localId)}
                            >
                              <TiTrash />
                            </button>
                          </div>
                        </div>

                        {eachTest.name ===
                          "PREP_OTHER_TEST_OTHER_(SPECIFY)" && (
                          <div className="row">
                            <div className="mb-1 col-md-6">
                              <FormGroup>
                                <FormLabelName>Specify Other Test Name</FormLabelName>
                                <Input
                                  type="text"
                                  name="otherTestName"
                                  id={`otherTestName_${eachTest.localId}`}
                                  value={eachTest.otherTestName}
                                  onChange={e =>
                                    handleInputChangeOtherTest(
                                      e,
                                      eachTest.localId
                                    )
                                  }
                                  style={inputStyle}
                                  disabled={disabledField}
                                  placeholder="Specify the other test..."
                                />
                              </FormGroup>
                            </div>
                          </div>
                        )}

                        {otherTest.length > 1 && (
                          <Divider
                            component="li"
                            style={{ marginBottom: "10px" }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  {otherTest.length > 0 && (
                    <div className="p-2">
                      <MatButton
                        type="button"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        startIcon={<AddIcon />}
                        style={{ backgroundColor: "#014d88" }}
                        onClick={handleCreateNewTest}
                        disabled={saving || disabledField}
                      >
                        <span style={{ textTransform: "capitalize" }}>
                          Add more test results
                        </span>
                      </MatButton>
                    </div>
                  )}

                  <br />
                  <div className="row">
                    {/* 22. Next Appointment Date */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Next Appointment Date{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="date"
                          onKeyDown={e => e.preventDefault()}
                          name="nextAppointment"
                          id="nextAppointment"
                          value={values.nextAppointment}
                          onChange={handleChange}
                          style={inputStyle}
                          min={values.encounterDate}
                          disabled
                        />
                        {getError("nextAppointment") && (
                          <span className={classes.error}>
                            {getError("nextAppointment")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 23. Signature */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Healthcare Worker Signature</FormLabelName>
                        <Input
                          name="healthCareWorkerSignature"
                          id="healthCareWorkerSignature"
                          placeholder="Enter signature..."
                          value={values.healthCareWorkerSignature}
                          disabled={disabledField}
                          onChange={handleChange}
                          style={inputStyle}
                        />
                      </FormGroup>
                    </div>
                  </div>

                  <br />

                  {/* ── Submit Buttons ── */}
                  {!disabledField && (
                    <>
                      {props.activeContent &&
                      props.activeContent.actionType === "update" ? (
                        <div>
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
                        </div>
                      ) : (
                        <div>
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
                        </div>
                      )}
                    </>
                  )}
                </Segment>
              </Grid.Column>
            </Grid>
          );
        }}
      </Formik>
    </div>
  );
};
export default ClinicVisit;

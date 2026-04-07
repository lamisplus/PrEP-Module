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
    systolic: Yup.string().required("This field is required"),
    diastolic: Yup.string().required("This field is required"),
    pregnant: isFemalePatient
      ? Yup.string().required("This field is required")
      : Yup.string(),
    riskReductionServices: Yup.string().required("This field is required"),
    adherenceLevel: Yup.string().required("This field is required"),
    prepType: Yup.string().required("This field is required"),
    regimenId: Yup.string().required("This field is required"),
    monthsOfRefill: Yup.string().required("This field is required"),
    nextAppointment: Yup.string().required("This field is required"),
    healthCareWorkerSignature: Yup.string().required("This field is required"),
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
  syndromicScreening: "",
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
  const [syndromicStiSelected, setSyndromicStiSelected] = useState([]);
  const [durationOnPrep, setDurationOnPrep] = useState("");

  const calculateDurationOnPrep = (encounterDate) => {
    if (!encounterDate || !patientDto?.datePrepStarted) {
      setDurationOnPrep("");
      return;
    }
    const start = new Date(patientDto.datePrepStarted);
    const end = new Date(encounterDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    setDurationOnPrep(months >= 0 ? months : 0);
  };

  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: "",
    height: "",
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
  const [otherTestInput, setOtherTestInput] = useState({
    testDate: "",
    otherTestsDone: "",
    result: "",
    name: "",
    otherTestName: "",
  });
  const [editingOtherTestIndex, setEditingOtherTestIndex] = useState(null);
  const [showOtherTests, setShowOtherTests] = useState(false);
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
        `${baseUrl}prep-followup-visit/checkEnableCab/${
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
        `${baseUrl}prep-followup-visit/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let data = JSON.parse(JSON.stringify(response.data));
      setUrinalysisTest(data.urinalysis || { urinalysisTest: "No", testDate: "", result: "" });
      const loadedOtherTests = (data?.otherTestsDone || []).map((t, i) => ({
        ...t,
        localId: t.localId != null ? t.localId : i,
      }));
      setOtherTest(loadedOtherTests);
      setShowOtherTests(loadedOtherTests.length > 0);
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
      if (data.syndromicStiScreening) {
        setSyndromicStiSelected(
          Array.isArray(data.syndromicStiScreening)
            ? data.syndromicStiScreening
            : [data.syndromicStiScreening]
        );
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
        `${baseUrl}prep-followup-visit/hts-record/${
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
        `${baseUrl}prep-eligibility-screening/person/${
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
    if (e.target.value < 1 || e.target.value > 300) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        weight: "Body weight must be between 1 and 300 kg",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, weight: "" }));
    }
  };

  const handleInputValueCheckHeight = e => {
    if (e.target.value < 0.3 || e.target.value > 2.5) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        height: "Height must be between 0.3 and 2.5 meters",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, height: "" }));
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
    if (showOtherTests) {
      setShowOtherTests(false);
      setOtherTest([]);
      setOtherTestInput({ testDate: "", otherTestsDone: "", result: "", name: "", otherTestName: "" });
      setEditingOtherTestIndex(null);
    } else {
      setShowOtherTests(true);
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

  const handleOtherTestInputChange = e => {
    const { name, value } = e.target;
    setOtherTestInput(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "otherTestsDone") {
        const matched = codeset?.PREP_OTHER_TEST?.find(v => v.code === value);
        updated.name = matched?.code || "";
      }
      return updated;
    });
  };

  const handleAddOtherTestEntry = () => {
    if (!otherTestInput.testDate || !otherTestInput.otherTestsDone || !otherTestInput.result) return;
    if (editingOtherTestIndex !== null) {
      setOtherTest(prev =>
        prev.map((item, idx) =>
          idx === editingOtherTestIndex
            ? { ...otherTestInput, localId: item.localId, otherTest: "Yes" }
            : item
        )
      );
      setEditingOtherTestIndex(null);
    } else {
      const id = otherTestIdCounter.current++;
      setOtherTest(prev => [...prev, { ...otherTestInput, localId: id, otherTest: "Yes" }]);
    }
    setOtherTestInput({ testDate: "", otherTestsDone: "", result: "", name: "", otherTestName: "" });
  };

  const handleEditOtherTestEntry = index => {
    const entry = otherTest[index];
    setOtherTestInput({
      testDate: entry.testDate || "",
      otherTestsDone: entry.otherTestsDone || "",
      result: entry.result || "",
      name: entry.name || "",
      otherTestName: entry.otherTestName || "",
    });
    setEditingOtherTestIndex(index);
  };

  const handleDeleteOtherTestEntry = index => {
    setOtherTest(prev => prev.filter((_, idx) => idx !== index));
    if (editingOtherTestIndex === index) {
      setEditingOtherTestIndex(null);
      setOtherTestInput({ testDate: "", otherTestsDone: "", result: "", name: "", otherTestName: "" });
    }
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
      setShowOtherTests(false);
      setNotedSideEffects([]);
      setSyndromicStiSelected([]);
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

  // ── Recalculate duration on PrEP when patientDto or encounter date loads ──
  useEffect(() => {
    const encounterDate = formikRef.current?.values?.encounterDate;
    if (encounterDate && patientDto?.datePrepStarted) {
      calculateDurationOnPrep(encounterDate);
    }
  }, [patientDto, formInitialValues]);

  // ── Noted side effects handler ──

  const handleNotedSideEffectsChange = selected => {
    setNotedSideEffects(selected);
    if (formikRef.current) {
      formikRef.current.setFieldValue("notedSideEffects", selected);
    }
  };

  const handleSyndromicStiChange = selected => {
    setSyndromicStiSelected(selected);
    if (formikRef.current) {
      formikRef.current.setFieldValue("syndromicStiScreening", selected);
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
    // Manual validation for non-Formik fields
    const manualErrors = [];
    if (!hivTestValue) {
      manualErrors.push("HIV Test Result is required");
    }
    if (!notedSideEffects || notedSideEffects.length === 0) {
      manualErrors.push("Noted Side Effects is required");
    }
    if (!syndromicStiSelected || syndromicStiSelected.length === 0) {
      manualErrors.push("Syndromic STI Screening is required");
    }
    if (manualErrors.length > 0) {
      manualErrors.forEach(msg => toast.error(msg, { position: toast.POSITION.BOTTOM_CENTER }));
      return;
    }

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
    payload.syndromicStiScreening = syndromicStiSelected;
    payload.notedSideEffects = "";
    payload.previousPrepStatus = props.patientObj?.prepStatus;
    // Derive stiScreening from syndromicStiScreening for API compatibility
    payload.stiScreening = syndromicStiSelected.length > 0 ? "true" : "false";
    // Map otherDrugsPrescribed back to otherDrugs for API compatibility
    if (payload.hasOtherDrugs === "true") {
      payload.otherDrugs = payload.otherDrugsPrescribed || "";
    } else {
      payload.otherDrugs = "";
    }

    if (props.activeContent && props.activeContent.actionType === "update") {
      try {
        await axios.put(
          `${baseUrl}prep-followup-visit/${props.activeContent.id}`,
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
        validationSchema={validationSchema}
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
                            calculateDurationOnPrep(newDate);
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
                          disabled={disabledField}
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
                          value={durationOnPrep !== "" ? durationOnPrep : ""}
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
                            disabled={disabledField}
                            style={inputStyle}
                          >
                            <option value="">Select Pregnancy Status</option>
                            <option value="Pregnant">Pregnant</option>
                            <option value="Breastfeeding">Breastfeeding</option>
                            <option value="Non-pregnant">Non-pregnant</option>
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
                            min="1"
                            max="300"
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

                    {/* 5b. Height */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Height</FormLabelName>
                        <InputGroup>
                          <InputGroupText
                            addonType="append"
                            style={inputGroupLeftStyle}
                          >
                            m
                          </InputGroupText>
                          <Input
                            type="number"
                            name="height"
                            id="height"
                            onChange={e => {
                              handleChange(e);
                              handleInputValueCheckHeight(e);
                            }}
                            min="0.3"
                            max="2.5"
                            step="0.01"
                            value={values.height}
                            style={{
                              ...inputGroupMiddleStyle,
                              borderTopRightRadius: "0.25rem",
                              borderBottomRightRadius: "0.25rem",
                            }}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {vitalClinicalSupport.height && (
                          <span className={classes.error}>
                            {vitalClinicalSupport.height}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 5c. BMI */}
                    {values.weight && values.height && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>BMI</FormLabelName>
                          <Input
                            type="text"
                            value={(
                              values.weight /
                              values.height ** 2
                            ).toFixed(2)}
                            style={inputStyle}
                            disabled
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 6. Blood Pressure (mmHg) */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Blood Pressure (mmHg) <span style={{ color: "red" }}> *</span></FormLabelName>
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
                        {getError("systolic") && (
                          <span className={classes.error}>
                            {getError("systolic")}
                          </span>
                        )}
                        {getError("diastolic") && (
                          <span className={classes.error}>
                            {getError("diastolic")}
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
                          type="select"
                          name="hivTestResult"
                          id="hivTestResult"
                          value={hivTestValue}
                          style={inputStyle}
                          disabled={disabledField}
                          onChange={e => setHivTestValue(e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="Negative">Negative</option>
                          <option value="Positive">Positive</option>
                        </Input>
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
                          <FormLabelName>Noted Side Effects <span style={{ color: "red" }}> *</span></FormLabelName>
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

                    {/* 9. Syndromic STI Screening (multiselect) */}
                    {codeset?.SYNDROMIC_STI_SCREENING && (
                      <div className="mb-3 col-md-12">
                        <FormGroup>
                          <FormLabelName>Syndromic STI Screening <span style={{ color: "red" }}> *</span></FormLabelName>
                          <DualListBox
                            options={codeset.SYNDROMIC_STI_SCREENING.map(item => ({
                              value: item?.code,
                              label: item?.display,
                            }))}
                            selected={syndromicStiSelected}
                            onChange={handleSyndromicStiChange}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 9b. Syndromic STI Screening - Other specify */}
                    {syndromicStiSelected?.includes("SYNDROMIC_STI_SCREENING_OTHERS") && (
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
                        <FormLabelName>Risk Reduction Services <span style={{ color: "red" }}> *</span></FormLabelName>
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
                        {getError("riskReductionServices") && (
                          <span className={classes.error}>
                            {getError("riskReductionServices")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 11. Adherence */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Adherence <span style={{ color: "red" }}> *</span></FormLabelName>
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
                        {getError("adherenceLevel") && (
                          <span className={classes.error}>
                            {getError("adherenceLevel")}
                          </span>
                        )}
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
                            isAutoPop={false}
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
                        checked={showOtherTests}
                        disabled={disabledField}
                      />{" "}
                      Result of Other Tests
                    </h4>
                  </Label>
                  <br />
                  <br />
                  {showOtherTests && !disabledField && (
                    <>
                      <div className="row">
                        <div className="mb-1 col-md-3">
                          <FormGroup>
                            <FormLabelName>Date</FormLabelName>
                            <Input
                              type="date"
                              onKeyDown={e => e.preventDefault()}
                              name="testDate"
                              id="otherTestInputDate"
                              value={otherTestInput.testDate}
                              onChange={handleOtherTestInputChange}
                              style={inputStyle}
                              min={values.encounterDate}
                              max={moment(new Date()).format("YYYY-MM-DD")}
                            />
                          </FormGroup>
                        </div>
                        <div className="mb-1 col-md-3">
                          <FormGroup>
                            <FormLabelName>Other Tests</FormLabelName>
                            <Input
                              type="select"
                              name="otherTestsDone"
                              id="otherTestInputTest"
                              onChange={handleOtherTestInputChange}
                              value={otherTestInput.otherTestsDone}
                              style={inputStyle}
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
                        <div className="mb-1 col-md-3">
                          <FormGroup>
                            <FormLabelName>Result</FormLabelName>
                            <Input
                              type="text"
                              name="result"
                              id="otherTestInputResult"
                              value={otherTestInput.result}
                              onChange={handleOtherTestInputChange}
                              style={inputStyle}
                            />
                          </FormGroup>
                        </div>
                        <div className="mb-1 col-md-3 d-flex align-items-end">
                          <MatButton
                            type="button"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<AddIcon />}
                            style={{ backgroundColor: "#014d88" }}
                            onClick={handleAddOtherTestEntry}
                            disabled={saving}
                          >
                            <span style={{ textTransform: "capitalize" }}>
                              {editingOtherTestIndex !== null ? "Update" : "Add"}
                            </span>
                          </MatButton>
                        </div>
                      </div>
                      {otherTestInput.name === "PREP_OTHER_TEST_OTHER_(SPECIFY)" && (
                        <div className="row">
                          <div className="mb-1 col-md-6">
                            <FormGroup>
                              <FormLabelName>Specify Other Test Name</FormLabelName>
                              <Input
                                type="text"
                                name="otherTestName"
                                id="otherTestInputOtherName"
                                value={otherTestInput.otherTestName}
                                onChange={handleOtherTestInputChange}
                                style={inputStyle}
                                placeholder="Specify the other test..."
                              />
                            </FormGroup>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {otherTest.length > 0 && (
                    <table className="table table-bordered table-sm mb-3 mt-2">
                      <thead style={{ backgroundColor: "#014d88", color: "#fff" }}>
                        <tr>
                          <th>S/N</th>
                          <th>Date</th>
                          <th>Test</th>
                          <th>Result</th>
                          {!disabledField && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {otherTest.map((entry, index) => {
                          const testLabel = codeset?.PREP_OTHER_TEST?.find(
                            v => v.code === entry.otherTestsDone
                          )?.display || entry.otherTestsDone;
                          return (
                            <tr key={entry.localId ?? index}>
                              <td>{index + 1}</td>
                              <td>{entry.testDate}</td>
                              <td>
                                {testLabel}
                                {entry.otherTestName ? ` (${entry.otherTestName})` : ""}
                              </td>
                              <td>{entry.result}</td>
                              {!disabledField && (
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    style={{ marginRight: "5px" }}
                                    onClick={() => handleEditOtherTestEntry(index)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteOtherTestEntry(index)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                        <FormLabelName>Healthcare Worker Signature <span style={{ color: "red" }}> *</span></FormLabelName>
                        <Input
                          name="healthCareWorkerSignature"
                          id="healthCareWorkerSignature"
                          placeholder="Enter signature..."
                          value={values.healthCareWorkerSignature}
                          disabled={disabledField}
                          onChange={handleChange}
                          style={inputStyle}
                        />
                        {getError("healthCareWorkerSignature") && (
                          <span className={classes.error}>
                            {getError("healthCareWorkerSignature")}
                          </span>
                        )}
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

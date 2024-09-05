import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, List, Card } from "semantic-ui-react";
// Page titie
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import MatButton from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Select from "react-select";
import Divider from "@mui/material/Divider";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(20),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  cardBottom: {
    marginBottom: 20,
  },
  Select: {
    height: 45,
    width: 350,
  },
  button: {
    margin: theme.spacing(1),
  },

  root: {
    flexGrow: 1,
    "& .card-title": {
      color: "#fff",
      fontWeight: "bold",
    },
    "& .form-control": {
      borderRadius: "0.25rem",
      height: "41px",
    },
    "& .card-header:first-child": {
      borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0",
    },
    "& .dropdown-toggle::after": {
      display: " block !important",
    },
    "& select": {
      "-webkit-appearance": "listbox !important",
    },
    "& p": {
      color: "red",
    },
    "& label": {
      fontSize: "14px",
      color: "#014d88",
      fontWeight: "bold",
    },
  },
  input: {
    display: "none",
  },
  error: {
    color: "#f85032",
    fontSize: "11px",
  },
  success: {
    color: "#4BB543 ",
    fontSize: "11px",
  },
}));

const ClinicVisit = (props) => {
  //let patientObj = props.patientObj ? props.patientObj : {}
  const [errors, setErrors] = useState({});
  const [disabledField, setSisabledField] = useState(false);
  const [patientDto, setPatientDto] = useState();
  let temp = { ...errors };
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [adherenceLevel, setAdherenceLevel] = useState([]);
  const [sti, setSti] = useState([]);
  const [prepStatus, setPrepStatus] = useState([]);
  const [prepSideEffect, setPrepSideEffect] = useState([]);
  const [htsResult, setHtsResult] = useState([]);
  const [prepRegimen, setprepRegimen] = useState([]);
  const [whyAdherenceLevelPoor, setWhyAdherenceLevelPoor] = useState([]);
  const [labTestOptions, setLabTestOptions] = useState([]);
  const [urineTestResult, setUrineTestResult] = useState([]);
  const [otherTestResult, setOtherTestResult] = useState([]);
  const [sphylisTestResult, setSphylisTestResult] = useState([]);
  const [hepaTestResult, setHepaTestResult] = useState([]);
  const [familyPlanningMethod, setFamilyPlanningMethod] = useState([]);
  const [pregnant, setpregnant] = useState([]);
  const [prepEntryPoint, setPrepEntryPoints] = useState([]);
  const [prepType, setPrepType] = useState([]);
  const [populationType, setPopulationType] = useState([]);
  const [visitType, setVisitType] = useState([]);
  // const [selectedPregnant, setSelectedPregnant] = useState("");
  const [selectedPopulationType, setSelectedPopulationType] = useState("");
  // const [selectedVisitType, setSelectedVisitType] = useState("");
  const [latestFromEligibility, setLatestFromEligibility] = useState(null);
  let testsOptions = [];
  const [hivTestValue, setHivTestValue] = useState("");
  const [hivTestResultDate, setHivTestResultDate] = useState("");

  useEffect(() => {
    handleInputChange({
      target: { name: "hivTestResult", value: hivTestValue },
    });
    handleInputChange({
      target: { name: "hivTestResultDate", value: hivTestResultDate },
    });
  }, [hivTestValue]);
  //Vital signs clinical decision support
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: "",
    diastolic: "",
    height: "",
    systolic: "",
    pulse: "",
    temperature: "",
    respiratoryRate: "",
  });

  const [objValues, setObjValues] = useState({
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
    notedSideEffects: "",
    otherTestsDone: [],
    personId: props.patientObj.personId,
    pregnant: "",
    prepEnrollmentUuid: "",
    pulse: "",
    referred: "",
    regimenId: "",
    respiratoryRate: "",
    riskReductionServices: "",
    healthCareWorkerSignature: "",
    stiScreening: "",
    syndromicStiScreening: null,
    syphilis: {},
    systolic: "",
    temperature: "",
    urinalysis: {},
    urinalysisResult: "",
    weight: "",
    why: "",
    otherDrugs: "",
    duration: "",
    prepGiven: "",
    hivTestResult: "",
    hivTestResultDate: "",
    prepType: "",
    populationType: "",
    prepDistributionSetting: "",
    familyPlanning: "",
    dateOfFamilyPlanning: "",
    monthsOfRefill: "",
    visitType: "",
  });
  const [urinalysisTest, setUrinalysisTest] = useState({
    urinalysisTest: "Yes",
    testDate: "",
    result: "",
  });

  const [syphilisTest, setSyphilisTest] = useState({
    syphilisTest: "Yes",
    testDate: "",
    result: "",
    others: "",
  });
  const [hepatitisTest, setHepatitisTest] = useState({
    hepatitisTest: "Yes",
    testDate: "",
    result: "",
  });

  const [otherTest, setOtherTest] = useState([]);

  useEffect(async () => {
    // Check if the fields exist in objValues first
    if (
      objValues.urinalysis.testDate &&
      objValues.urinalysis.result &&
      objValues.urinalysis.urinalysisTest
    ) {
      setUrinalysisTest({
        ...urinalysisTest,
        testDate: objValues.urinalysis.testDate,
        result: objValues.urinalysis.result,
        urinalysisTest: objValues.urinalysis.urinalysisTest,
      });
    }
    if (
      objValues.syphilis.testDate &&
      objValues.syphilis.result &&
      objValues.syphilis.syphilisTest
    ) {
      setSyphilisTest({
        ...syphilisTest,
        testDate: objValues.syphilis.testDate,
        result: objValues.syphilis.result,
        syphilisTest: objValues.syphilis.syphilisTest,
        others: objValues.syphilis.others,
      });
    }
    if (
      objValues.hepatitis.testDate &&
      objValues.hepatitis.result &&
      objValues.hepatitis.hepatitisTest
    ) {
      setHepatitisTest({
        ...hepatitisTest,
        testDate: objValues.hepatitis.testDate,
        result: objValues.hepatitis.result,
        hepatitisTest: objValues.hepatitis.hepatitisTest,
      });
    }
  }, [objValues]);

  useEffect(() => {
    AdherenceLevel();
    SYNDROMIC_STI_SCREENING();
    PREP_RISK_REDUCTION_PLAN();
    //PatientDetaild();
    PREP_STATUS();
    HTS_RESULT();
    LAST_HIV_TEST_RESULT();
    PREP_SIDE_EFFECTS();
    GetPatientDTOObj();
    WHY_POOR_FAIR_ADHERENCE();
    PrepEligibilityObj();
    PrepRegimen();
    TestGroup();
    PREP_URINALYSIS_RESULT();
    PREP_OTHER_TEST();
    HEPATITIS_SCREENING_RESULT();
    SYPHILIS_RESULT();
    PREGANACY_STATUS();
    PREP_ENTRY_POINT();
    PREP_TYPE();
    POPULATION_TYPE();
    VISIT_TYPE();
    FAMILY_PLANNING_METHOD();
    if (
      props.activeContent &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      GetPatientVisit(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
    GetLatestFromEligibility();
  }, [props.activeContent]);

  const PREGANACY_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setpregnant(response.data);
      })
      .catch((error) => {});
  };

  const PREP_ENTRY_POINT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPrepEntryPoints(response.data);
      })
      .catch((error) => {});
  };

  const PREP_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPrepType(response.data);
      })
      .catch((error) => {});
  };

  //Get list of Test Group
  const TestGroup = () => {
    axios
      .get(`${baseUrl}laboratory/labtestgroups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        response.data.map((x) => {
          x.labTests.map((x2) => {
            testsOptions.push({
              value: x2.id,
              label: x2.labTestName,
              testGroupId: x.id,
              testGroupName: x.groupName,
              sampleType: x2.sampleType,
            });
          });
        });
        setLabTestOptions(testsOptions);
      })
      .catch((error) => {});
  };
  const GetPatientVisit = async (id) => {
    axios
      .get(`${baseUrl}prep-clinic/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("returned: ", response.data);
        setObjValues(response.data);
        if (response.data.otherTestsDone !== null) {
          setOtherTest([
            ...response.data.otherTestsDone.map((x, index) => {
              return {
                localId: index + 1,
                otherTest: "Yes",
                testDate: x.testDate,
                result: x.result,
                name: x.name,
                otherTestName: x.otherTestName,
              };
            }),
          ]);
        }
      })
      .catch((error) => {});
  };
  const GetPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${props.patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setPatientDto(response.data);
      })
      .catch((error) => {});
  };
  const PrepEligibilityObj = () => {
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${props.patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        //setPrepStatus(response.data);
        objValues.prepEnrollmentUuid = "";
      })
      .catch((error) => {});
  };
  const PrepRegimen = () => {
    axios
      .get(`${baseUrl}prep-regimen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setprepRegimen(response.data);
      })
      .catch((error) => {});
  };
  const PREP_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPrepStatus(response.data);
      })
      .catch((error) => {});
  };
  const [prepRiskReductionPlan, setPrepRiskReductionPlan] = useState([]);
  const PREP_RISK_REDUCTION_PLAN = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_RISK_REDUCTION_PLAN`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("prep codeset: ", response.data);
        setPrepRiskReductionPlan(response.data);
      })
      .catch((error) => {});
  };
  const PREP_SIDE_EFFECTS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPrepSideEffect(response.data);
      })
      .catch((error) => {});
  };

  const HTS_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HTS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setHtsResult(response.data);
      })
      .catch((error) => {});
  };
  const LAST_HIV_TEST_RESULT = () => {
    axios
      .get(`${baseUrl}hts/persons/${objValues.personId}/current-hts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        var lastHivTest = response.data.hivTestResult;

        if (lastHivTest !== null && lastHivTest !== undefined) {
          setHivTestValue(response.data.hivTestResult);
          setHivTestResultDate(response.data.test1.date);
          objValues.hivTestResultDate = response.data.hivTestResult;
          objValues.hivTestResultDate = response.data.test1.date;
        } else {
          setHivTestValue("NOT DONE");
        }
      })
      .catch((error) => {});
  };

  useEffect(() => {
    if (latestFromEligibility !== null) {
      setObjValues({
        ...objValues,
        populationType:
          latestFromEligibility !== null
            ? latestFromEligibility.populationType
            : "",
        visitType:
          latestFromEligibility !== null ? latestFromEligibility.visitType : "",
        pregnant:
          latestFromEligibility !== null
            ? latestFromEligibility.pregnancyStatus
            : "",
      });
      // await POPULATION_TYPE();
      const autoPopulatePopulationType = populationType.find(
        (type) => type.code === latestFromEligibility.populationType
      )?.display;
      const autoPopulateVisitType = visitType.find(
        (type) => type.code === latestFromEligibility.visitType
      )?.display;
      const autoPopulatePregnant = pregnant.find(
        (type) => type.code === latestFromEligibility.pregnancyStatus
      )?.display;
      setSelectedPopulationType(autoPopulatePopulationType);
      // setSelectedVisitType(autoPopulateVisitType)
      // setSelectedPregnant(autoPopulatePregnant)
    }
  }, [latestFromEligibility]);

  const GetLatestFromEligibility = async () => {
    axios
      .get(`${baseUrl}prep-eligibility/person/${objValues.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (response) => {
        const latestEligibility = response.data.sort((a, b) =>
          moment(a.visitDate).isBefore(moment(b.visitDate))
        )[
          // (a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          response.data.length - 1
        ];

        setLatestFromEligibility(latestEligibility);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    if (
      objValues.populationType !== null &&
      objValues.populationType !== undefined
    ) {
      const autoPopulate = populationType.find(
        (type) => type.code === objValues.populationType
      );

      setSelectedPopulationType(autoPopulate ? autoPopulate.display : "");
    }
  }, [objValues.populationType]);
  const POPULATION_TYPE = async () => {
    axios
      .get(`${baseUrl}application-codesets/v2/POPULATION_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPopulationType(response.data);
      })
      .catch((error) => {});
  };

  const VISIT_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_VISIT_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setVisitType(response.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };
  const WHY_POOR_FAIR_ADHERENCE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/WHY_POOR_FAIR_ADHERENCE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setWhyAdherenceLevelPoor(response.data);
      })
      .catch((error) => {});
  };
  ///GET LIST OF FUNCTIONAL%20_STATUS
  // TB STATUS
  const SYNDROMIC_STI_SCREENING = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SYNDROMIC_STI_SCREENING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSti(response.data);
      })
      .catch((error) => {});
  };
  //PREP_URINALYSIS_RESULT
  const PREP_URINALYSIS_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_URINALYSIS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUrineTestResult(response.data);
      })
      .catch((error) => {});
  };
  //PREP_OTHER_TEST
  const PREP_OTHER_TEST = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_OTHER_TEST`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setOtherTestResult(response.data);
      })
      .catch((error) => {});
  };
  //SYPHILIS_RESULT
  const SYPHILIS_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SYPHILIS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSphylisTestResult(response.data);
      })
      .catch((error) => {});
  };
  //HEPATITIS_SCREENING_RESULT
  const HEPATITIS_SCREENING_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HEPATITIS_SCREENING_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setHepaTestResult(response.data);
      })
      .catch((error) => {});
  };

  // FAMILY_PLANNING_METHOD
  const FAMILY_PLANNING_METHOD = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FAMILY_PLANNING_METHOD`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFamilyPlanningMethod(response.data);
      })
      .catch((error) => {});
  };

  ///Level of Adherence
  async function AdherenceLevel() {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAdherenceLevel(response.data);
      })
      .catch((error) => {});
  }

  const handleInputChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "monthsOfRefill") {
      const asNumber = Number(e.target.value);
      const durationInDays = asNumber * 30;
      setObjValues({
        ...objValues,
        monthsOfRefill: e.target.value,
        duration: `${durationInDays}`,
      });
    } else {
      // if the encounterDate is the same as the commencement date, the prep regimen id should be automatically populated from the commencement
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
  };
  const handleInputChangeUrinalysisTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeOtherTest = (e, localId) => {
    //find the test with the localId
    let temp = [...otherTest];
    let index = temp.findIndex((x) => Number(x.localId) === Number(localId));

    if (
      e.target.name === "name" &&
      e.target.value !== "PREP_OTHER_TEST_OTHER_(SPECIFY)"
    ) {
      temp[index].otherTestName = "";
      temp[index][e.target.name] = e.target.value;
      setOtherTest(temp);
    } else {
      temp[index][e.target.name] = e.target.value;
      setOtherTest(temp);
    }
  };
  const handleInputChangeHepatitisTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeSyphilisTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    //Others
    if (e.target.name === "result" && e.target.value !== "Others") {
      syphilisTest.others = "";
      setSyphilisTest({ ...syphilisTest, ["others"]: "" });
      setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    }
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
  };
  //Handle CheckBox
  const handleCheckBoxSyphilisTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.checked) {
      setSyphilisTest({ ...syphilisTest, ["syphilisTest"]: "Yes" });
    } else {
      setSyphilisTest({ ...syphilisTest, ["syphilisTest"]: "No" });
    }
  };
  const handleCheckBoxHepatitisTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.checked) {
      setHepatitisTest({ ...hepatitisTest, ["hepatitisTest"]: "Yes" });
    } else {
      setHepatitisTest({ ...syphilisTest, ["syphilisTest"]: "No" });
    }
  };
  const handleCheckBoxOtherTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.checked) {
      setOtherTest([
        ...otherTest,
        ...objValues.otherTestsDone,
        {
          localId: objValues.otherTestsDone?.length || 0,
          otherTest: "Yes",
          testDate: "",
          result: "",
          name: "",
          otherTestName: "",
        },
      ]);
    } else {
      // setOtherTest({...otherTest, ["otherTest"]: "No"})
      setOtherTest([]);
    }
  };

  const handleCheckBoxUrinalysisTest = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.checked) {
      setUrinalysisTest({ ...urinalysisTest, ["urinalysisTest"]: "Yes" });
    } else {
      setUrinalysisTest({ ...otherTest, ["urinalysisTest"]: "No" });
    }
  };
  //to check the input value for clinical decision
  const handleInputValueCheckHeight = (e) => {
    if (
      e.target.name === "height" &&
      (e.target.value < 48.26 || e.target.value > 216.408)
    ) {
      const message =
        "Height cannot be greater than 216.408 and less than 48.26";
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: "" });
    }
  };
  const handleInputValueCheckweight = (e) => {
    if (
      e.target.name === "weight" &&
      (e.target.value < 3 || e.target.value > 150)
    ) {
      const message =
        "Body weight must not be greater than 150 and less than 3";
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: "" });
    }
  };
  const handleInputValueCheckSystolic = (e) => {
    if (
      e.target.name === "systolic" &&
      (e.target.value < 90 || e.target.value > 240)
    ) {
      const message =
        "Blood Pressure systolic must not be greater than 240 and less than 90";
      setVitalClinicalSupport({ ...vitalClinicalSupport, systolic: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, systolic: "" });
    }
  };
  const handleInputValueCheckDiastolic = (e) => {
    if (
      e.target.name === "diastolic" &&
      (e.target.value < 60 || e.target.value > 140)
    ) {
      const message =
        "Blood Pressure diastolic must not be greater than 140 and less than 60";
      setVitalClinicalSupport({ ...vitalClinicalSupport, diastolic: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, diastolic: "" });
    }
  };
  const handleInputValueCheckPulse = (e) => {
    if (
      e.target.name === "pulse" &&
      (e.target.value < 40 || e.target.value > 120)
    ) {
      const message = "Pulse must not be greater than 120 and less than 40";
      setVitalClinicalSupport({ ...vitalClinicalSupport, pulse: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, pulse: "" });
    }
  };
  const handleInputValueCheckRespiratoryRate = (e) => {
    if (
      e.target.name === "respiratoryRate" &&
      (e.target.value < 10 || e.target.value > 70)
    ) {
      const message =
        "Respiratory Rate must not be greater than 70 and less than 10";
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        respiratoryRate: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, respiratoryRate: "" });
    }
  };
  const handleInputValueCheckTemperature = (e) => {
    if (
      e.target.name === "temperature" &&
      (e.target.value < 35 || e.target.value > 47)
    ) {
      const message =
        "Temperature must not be greater than 47 and less than 35";
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        temperature: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, temperature: "" });
    }
  };

  useEffect(() => {
    if (
      props.activeContent.actionType === "" ||
      props.activeContent.actionType === null
    ) {
      emptyObjValues();
    }
  }, [props.activeContent.actionType]);

  const emptyObjValues = () => {
    setObjValues({
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
      notedSideEffects: "",
      otherTestsDone: [],
      personId: props.patientObj.personId,
      pregnant: "",
      prepEnrollmentUuid: "",
      pulse: "",
      referred: "",
      regimenId: "",
      respiratoryRate: "",
      riskReductionServices: "",
      stiScreening: "",
      syndromicStiScreening: null,
      syphilis: {},
      systolic: "",
      temperature: "",
      urinalysis: {},
      urinalysisResult: "",
      weight: "",
      why: "",
      otherDrugs: "",
      hivTestResult: "",
      duration: "",
      prepGiven: "",
      prepDistributionSetting: "",
      visitType: "",
    });
    setUrinalysisTest({});
    setSyphilisTest({});
    setHepatitisTest({});
    setOtherTest([]);
  };

  //Validations of the forms
  const validate = () => {
    temp.encounterDate = objValues.encounterDate
      ? ""
      : "This field is required";
    // temp.pregnant = (isFemale() && objValues.pregnant === null) ? "" : "This field is required"
    if (isFemale()) {
      temp.pregnant = objValues.pregnant ? "" : "This field is required";
    }
    temp.nextAppointment = objValues.nextAppointment
      ? ""
      : "This field is required";
    temp.adherenceLevel = objValues.adherenceLevel
      ? ""
      : "This field is required";

    //temp.systolic = objValues.systolic ? "" : "This field is required"
    temp.height = objValues.height ? "" : "This field is required";
    temp.weight = objValues.weight ? "" : "This field is required";
    temp.urinalysisTest = urinalysisTest.urinalysisTest
      ? ""
      : "This field is required";
    temp.testDate = urinalysisTest.testDate ? "" : "This field is required";
    temp.result = urinalysisTest.result ? "" : "This field is required";
    temp.regimenId = objValues.regimenId ? "" : "This field is required";
    temp.duration = objValues.duration ? "" : "This field is required";
    temp.prepDistributionSetting = objValues.prepDistributionSetting
      ? ""
      : "This field is required";
    temp.populationType = objValues.populationType
      ? ""
      : "This field is required";
    temp.visitType = objValues.visitType ? "" : "This field is required";
    // temp.hivTestResult = objValues.hivTestResult ? "" : "This field is required"
    // temp.hivTestResultDate = objValues.hivTestResultDate ? "" : "This field is required"
    //temp.datePrepGiven = objValues.datePrepGiven ? "" : "This field is required"

    setErrors({
      ...temp,
    });
    return Object.values(temp).every((x) => x === "");
  };
  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      //objValues.visitDate = vital.encounterDate
      objValues.hivTestResultDate = hivTestResultDate;
      objValues.hivTestResult = hivTestValue;
      objValues.syphilis = syphilisTest;
      objValues.hepatitis = hepatitisTest;
      objValues.urinalysis = urinalysisTest;
      objValues.otherTestsDone = otherTest.map((x) => {
        return {
          testDate: x.testDate,
          result: x.result,
          name: x.name,
          otherTestName: x.otherTestName,
        };
      });
      objValues.prepEnrollmentUuid = patientDto.uuid;

      if (props.activeContent && props.activeContent.actionType === "update") {
        //Perform operation for updation action
        axios
          .put(`${baseUrl}prep-clinic/${props.activeContent.id}`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            //PatientDetaild();
            setSaving(false);
            toast.success("Clinic Visit save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "consultation",
              activeTab: "history",
              actionType: "view",
            });
          })
          .catch((error) => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
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
              toast.error("Something went wrong, please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      } else {
        axios
          .post(`${baseUrl}prep/clinic-visit`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            //PatientDetaild();
            setSaving(false);
            emptyObjValues();
            toast.success("Clinic Visit save successful", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "consultation",
              activeTab: "history",
              actionType: "view",
            });
          })
          .catch((error) => {
            setSaving(false);

            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ""
                  ? error.response.data.apierror.message
                  : "Something went wrong, please try again";
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
              toast.error("Something went wrong, please try again...", {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      }
    }
  };
  // const handleSubmit = ()=>{
  //     if (validate()) {objValues.syphilis = syphilisTest
  //     objValues.hepatitis = hepatitisTest
  //     objValues.urinalysis = urinalysisTest
  //     objValues.otherTestsDone = otherTest
  //     objValues.prepEnrollmentUuid = patientDto.uuid
  //     emptyObjValues();
  //     props.setActiveContent({
  //         ...props.activeContent,
  //         id: "",
  //         route: 'consultation',
  //         activeTab: "history",
  //         actionType: "view"
  //     })}
  // }

  const handleCreateNewTest = () => {
    setOtherTest([
      ...otherTest,
      {
        localId: otherTest.length + 1,
        otherTest: "Yes",
        testDate: "",
        result: "",
        name: "",
        otherTestName: "",
      },
    ]);
  };

  const isFemale = () => {
    return props.patientObj.gender.toLowerCase() === "female";
  };

  const handlePrepTypeChange = (e) => {
    setObjValues({ ...objValues, regimenId: "", prepType: e.target.value });
    if (
      e.target.value === "PREP_TYPE_OTHERS" ||
      e.target.value === "PREP_TYPE_ED_PREP"
    ) {
      PrepRegimen();
    } else {
      axios
        .get(`${baseUrl}prep-regimen/prepType?prepType=${e.target.value}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setprepRegimen(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });
    }

    setErrors({ ...errors, [e.target.name]: "" });
  };
  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          <h2>Clinic Follow-up Visit hhh</h2>
        </div>
      </div>
      <Grid>
        <Grid.Column>
          <Segment>
            <Label
              as="a"
              color="blue"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}>VITAL SIGNS</h4>
            </Label>
            <br />
            <br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Visit <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="date"
                    name="encounterDate"
                    id="encounterDate"
                    onKeyDown={(e)=>e.preventDefault()}
                    value={objValues.encounterDate}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChange}
                    //min={props.patientDetail && props.patientDetail.dateHivPositive!==null ? props.patientDetail.dateHivPositive : props.patientDetail.personResponseDto.dateOfRegistration}
                    min={
                      patientDto && patientDto.dateEnrolled
                        ? patientDto.dateEnrolled
                        : ""
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.encounterDate !== "" ? (
                    <span className={classes.error}>
                      {errors.encounterDate}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="row">
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Pulse</FormLabelName>
                    <InputGroup>
                      <Input
                        type="number"
                        name="pulse"
                        id="pulse"
                        onChange={handleInputChange}
                        min="40"
                        max="120"
                        value={objValues.pulse}
                        onKeyUp={handleInputValueCheckPulse}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
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
                        }}
                      >
                        bmp
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.pulse !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.pulse}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.pulse !== "" ? (
                      <span className={classes.error}>{errors.pulse}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Respiratory Rate </FormLabelName>
                    <InputGroup>
                      <Input
                        type="number"
                        name="respiratoryRate"
                        id="respiratoryRate"
                        onChange={handleInputChange}
                        min="10"
                        max="70"
                        value={objValues.respiratoryRate}
                        onKeyUp={handleInputValueCheckRespiratoryRate}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
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
                        }}
                      >
                        bmp
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.respiratoryRate !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.respiratoryRate}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.respiratoryRate !== "" ? (
                      <span className={classes.error}>
                        {errors.respiratoryRate}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className=" mb-3 col-md-4">
                  <FormGroup>
                    <FormLabelName>Temperature </FormLabelName>
                    <InputGroup>
                      <Input
                        type="number"
                        name="temperature"
                        id="temperature"
                        onChange={handleInputChange}
                        min="35"
                        max="47"
                        value={objValues.temperature}
                        onKeyUp={handleInputValueCheckTemperature}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
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
                        }}
                      >
                        <sup>o</sup>c
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.temperature !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.temperature}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.temperature !== "" ? (
                      <span className={classes.error}>
                        {errors.temperature}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>

                <div className=" mb-3 col-md-5">
                  <FormGroup>
                    <FormLabelName>
                      Body Weight <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <InputGroup>
                      <Input
                        type="number"
                        name="weight"
                        id="weight"
                        onChange={handleInputChange}
                        min="3"
                        max="150"
                        value={objValues.weight}
                        onKeyUp={handleInputValueCheckweight}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
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
                        }}
                      >
                        kg
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.weight !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.weight}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.weight !== "" ? (
                      <span className={classes.error}>{errors.weight}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-5">
                  <FormGroup>
                    <FormLabelName>
                      Height <span style={{ color: "red" }}> *</span>
                    </FormLabelName>
                    <InputGroup>
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: "#014D88",
                          color: "#fff",
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
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
                        onKeyUp={handleInputValueCheckHeight}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: "#992E62",
                          color: "#fff",
                          border: "1px solid #992E62",
                          borderRadius: "0rem",
                        }}
                      >
                        {objValues.height !== ""
                          ? (objValues.height / 100).toFixed(2) + "m"
                          : "m"}
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.height !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.height}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.height !== "" ? (
                      <span className={classes.error}>{errors.height}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 mt-2 col-md-2">
                  {objValues.weight !== "" && objValues.height !== "" && (
                    <FormGroup>
                      <Label> </Label>
                      <InputGroup>
                        <InputGroupText
                          addonType="append"
                          style={{
                            backgroundColor: "#014D88",
                            color: "#fff",
                            border: "1px solid #014D88",
                            borderRadius: "0rem",
                          }}
                        >
                          BMI :{" "}
                          {(
                            objValues.weight /
                            ((objValues.height / 100) *
                              (objValues.height / 100))
                          ).toFixed(2)}
                        </InputGroupText>
                      </InputGroup>
                    </FormGroup>
                  )}
                </div>
              </div>
              <div className="row">
                <div className="form-group mb-3 col-md-8">
                  <FormGroup>
                    <FormLabelName>Blood Pressure</FormLabelName>
                    <InputGroup>
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: "#014D88",
                          color: "#fff",
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
                        }}
                      >
                        systolic(mmHg)
                      </InputGroupText>
                      <Input
                        type="number"
                        name="systolic"
                        id="systolic"
                        min="90"
                        max="240"
                        onChange={handleInputChange}
                        value={objValues.systolic}
                        onKeyUp={handleInputValueCheckSystolic}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
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
                        }}
                      >
                        diastolic(mmHg)
                      </InputGroupText>
                      <Input
                        type="number"
                        name="diastolic"
                        id="diastolic"
                        min={0}
                        max={140}
                        onChange={handleInputChange}
                        value={objValues.diastolic}
                        onKeyUp={handleInputValueCheckDiastolic}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0rem",
                        }}
                        disabled={disabledField}
                      />
                    </InputGroup>
                    {vitalClinicalSupport.systolic !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.systolic}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.systolic !== "" ? (
                      <span className={classes.error}>{errors.systolic}</span>
                    ) : (
                      ""
                    )}

                    {vitalClinicalSupport.diastolic !== "" ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.diastolic}
                      </span>
                    ) : (
                      ""
                    )}
                    {errors.diastolic !== "" ? (
                      <span className={classes.error}>{errors.diastolic}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
                {isFemale() && (
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>
                        Pregnancy Status{" "}
                        <span style={{ color: "red" }}> *</span>
                      </FormLabelName>
                      <Input
                        type="select"
                        name="pregnant"
                        id="pregnant"
                        onChange={handleInputChange}
                        value={objValues.pregnant}
                        disabled={disabledField}
                      >
                        <option value="">Select Pregnancy Status</option>
                        {pregnant.map((value) => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.pregnant !== "" ? (
                        <span className={classes.error}>{errors.pregnant}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                )}
              </div>
            </div>
            <Label
              as="a"
              color="black"
              style={{ width: "106%", height: "35px" }}
              ribbon
            >
              <h4 style={{ color: "#fff" }}></h4>
            </Label>
            <br />
            <br />

            <div className="row">
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Result of Last HIV Test </FormLabelName>
                  <Input
                    type="text"
                    name="hivTestResult"
                    id="hivTestResult"
                    value={hivTestValue}
                    onChange={(e) => {
                      setHivTestValue(e.target.value);
                      handleInputChange(e);
                    }}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled
                  />
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Date of Last HIV Test </FormLabelName>
                  <Input
                    type={hivTestValue == "NOT DONE" ? "text" : "date"}
                    name="hivTestResultDate"
                    id="hivTestResultDate"
                    value={
                      hivTestValue == "NOT DONE"
                        ? "NOT APPLICABLE"
                        : hivTestResultDate
                    }
                    onChange={(e) => {
                      setHivTestValue(e.target.value);
                      handleInputChange(e);
                    }}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled
                  />
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Noted Side Effects </FormLabelName>
                  <Input
                    type="select"
                    name="notedSideEffects"
                    id="notedSideEffects"
                    value={objValues.notedSideEffects}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    {prepSideEffect.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              {/* <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Regimen at Start of PrEP </FormLabelName>
                  <Input
                    type="select"
                    name="regimenStartPrep"
                    id="regimenStartPrep"
                    value={objValues.regimenStartPrep}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="TDF/FTC">TDF/FTC </option>
                    <option value="TDF/3TC">TDF/3TC </option>
                  </Input>
                 
                </FormGroup>
              </div>
               */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>STI Screening</FormLabelName>
                  <Input
                    type="select"
                    name="stiScreening"
                    id="stiScreening"
                    value={objValues.stiScreening}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Input>
                </FormGroup>
              </div>
              {objValues.stiScreening === "true" && (
                <div className=" mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>Syndromic STI Screening </FormLabelName>
                    <Input
                      type="select"
                      name="syndromicStiScreening"
                      id="syndromicStiScreening"
                      value={objValues.syndromicStiScreening}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {sti.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
              )}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Risk Reduction Service </FormLabelName>
                  <Input
                    type="select"
                    name="riskReductionServices"
                    id="riskReductionServices"
                    value={objValues.riskReductionServices}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option key={100} value="">
                      Select
                    </option>
                    {prepRiskReductionPlan.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Level of Adherence <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="adherenceLevel"
                    id="adherenceLevel"
                    value={objValues.adherenceLevel}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>

                    {adherenceLevel.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.adherenceLevel !== "" ? (
                    <span className={classes.error}>
                      {errors.adherenceLevel}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {objValues.adherenceLevel ===
                "PREP_LEVEL_OF_ADHERENCE_(POOR)_≥_7_DOSES" && (
                <div className=" mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>Why Poor/Fair Adherence </FormLabelName>
                    <Input
                      type="select"
                      name="whyAdherenceLevelPoor"
                      id="whyAdherenceLevelPoor"
                      value={objValues.whyAdherenceLevelPoor}
                      onChange={handleInputChange}
                      style={{
                        border: "1px solid #014D88",
                        borderRadius: "0.25rem",
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>

                      {whyAdherenceLevelPoor.map((value) => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
              )}
              {/* <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >PrEP Given</FormLabelName>
                  <Input
                    type="select"
                    name="prepGiven"
                    id="prepGiven"
                    value={objValues.prepGiven}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="Yes">Yes </option>
                    <option value="No">No </option>
                  </Input>
                 
                </FormGroup>
              </div> */}

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Population Type <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="populationType"
                    id="populationType"
                    onChange={handleInputChange}
                    value={objValues.populationType}
                    disabled={disabledField}
                  >
                    <option value=""> Select Population Type</option>
                    {populationType?.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.populationType !== "" ? (
                    <span className={classes.error}>
                      {errors.populationType}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Visit Type <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="visitType"
                    id="visitType"
                    onChange={handleInputChange}
                    value={objValues.visitType}
                    disabled={disabledField}
                  >
                    <option value=""> Select Visit Type</option>
                    {visitType.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.visitType !== "" ? (
                    <span className={classes.error}>{errors.visitType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Prep Type<span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="prepType"
                    id="prepType"
                    // disabled
                    onChange={handlePrepTypeChange}
                    value={objValues.prepType}
                    disabled={disabledField}
                  >
                    <option value=""> Select Prep Type</option>
                    {prepType.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.prepType !== "" ? (
                    <span className={classes.error}>{errors.prepType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    PrEP Regimen <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="regimenId"
                    id="regimenId"
                    onChange={handleInputChange}
                    value={objValues.regimenId}
                    disabled={disabledField}
                  >
                    <option value=""> Select</option>
                    {prepRegimen.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.regimen}
                      </option>
                    ))}
                  </Input>
                  {errors.regimenId !== "" ? (
                    <span className={classes.error}>{errors.regimenId}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Prep Distribution Setting{" "}
                    <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="prepDistributionSetting"
                    id="prepDistributionSetting"
                    onChange={handleInputChange}
                    value={objValues.prepDistributionSetting}
                    disabled={disabledField}
                  >
                    <option value=""></option>
                    {prepEntryPoint.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.prepDistributionSetting !== "" ? (
                    <span className={classes.error}>
                      {errors.prepDistributionSetting}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* <div className=" mb-3 col-md-6">
                                <FormGroup>
                                    <FormLabelName>Duration <span style={{color: "red"}}> *</span></FormLabelName>
                                    <Input
                                        type="number"
                                        name="duration"
                                        id="duration"
                                        value={objValues.duration}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius: "0.25rem"}}

                                        disabled={disabledField}
                                    />
                                    {errors.duration !== "" ? (
                                        <span className={classes.error}>{errors.duration}</span>
                                    ) : ""}
                                </FormGroup>
                            </div> */}

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Months of Refill <span style={{ color: "red" }}> *</span>
                  </FormLabelName>
                  <Input
                    type="number"
                    name="monthsOfRefill"
                    id="monthsOfRefill"
                    value={objValues.monthsOfRefill}
                    min={0}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
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
              {/* <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Date PrEP Given <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="date"
                    onKeyDown={(e)=>e.preventDefault()}
                    name="datePrepGiven"
                    id="datePrepGiven"
                    value={objValues.datePrepGiven}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    min={patientDto && patientDto.dateEnrolled ?patientDto.dateEnrolled :""}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.datePrepGiven !=="" ? (
                      <span className={classes.error}>{errors.datePrepGiven}</span>
                  ) : "" }   
                </FormGroup>
              </div>  */}

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Other Drugs</FormLabelName>
                  <Input
                    type="text"
                    name="otherDrugs"
                    id="otherDrugs"
                    value={objValues.otherDrugs}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>
              {/* <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >PrEP Status</FormLabelName>
                  <Input
                    type="select"
                    name="prepStatus"
                    id="prepStatus"
                    value={objValues.prepStatus}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select</option>
                    {prepStatus.map((value) => (
                            <option key={value.id} value={value.code}>
                                {value.display}
                            </option>
                        ))}
                  </Input>
                 
                </FormGroup>
              </div> */}

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">Family Planning</FormLabelName>
                  <Input
                    type="select"
                    name="familyPlanning"
                    id="familyPlanning"
                    onChange={handleInputChange}
                    value={objValues.familyPlanning}
                    disabled={disabledField}
                  >
                    <option value=""></option>
                    {familyPlanningMethod.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Date of Family Planning </FormLabelName>
                  <Input
                    type="date"
                    onKeyDown={(e)=>e.preventDefault()}
                    name="dateOfFamilyPlanning"
                    id="dateOfFamilyPlanning"
                    value={objValues.dateOfFamilyPlanning}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem",
                    }}
                    onChange={handleInputChange}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateOfFamilyPlanning !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfFamilyPlanning}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <br />
              <br />
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
                    checked={
                      urinalysisTest.urinalysisTest == "Yes" ? true : false
                    }
                  />{" "}
                  Urinalysis Test
                </h4>
              </Label>
              <br />
              <br />
              {urinalysisTest.urinalysisTest === "Yes" && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>
                        Urinalysis Test Date{" "}
                        <span style={{ color: "red" }}> *</span>
                      </FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={(e)=>e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={urinalysisTest.testDate}
                        // defaultValue={objValues.urinalysis?.testDate}
                        onChange={handleInputChangeUrinalysisTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                      {errors.testDate !== "" ? (
                        <span className={classes.error}>{errors.testDate}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>
                        Urinalysis Test Result{" "}
                        <span style={{ color: "red" }}> *</span>
                      </FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={urinalysisTest.result}
                        onChange={handleInputChangeUrinalysisTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {urineTestResult.map((value) => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.result !== "" ? (
                        <span className={classes.error}>{errors.result}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}
              <br />
              <br />
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
                    checked={
                      hepatitisTest.hepatitisTest === "Yes" ? true : false
                    }
                  />{" "}
                  Hepatitis Test{" "}
                </h4>
              </Label>
              <br />
              <br />
              {hepatitisTest.hepatitisTest === "Yes" && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Hepatitis Test Date</FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={(e)=>e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={hepatitisTest.testDate}
                        onChange={handleInputChangeHepatitisTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                        disabled={disabledField}
                      />
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Hepatitis Test Result</FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={hepatitisTest.result}
                        onChange={handleInputChangeHepatitisTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {hepaTestResult.map((value) => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </div>
                </>
              )}
              <br />
              <br />
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
                    checked={syphilisTest.syphilisTest === "Yes" ? true : false}
                  />{" "}
                  Syphilis Test{" "}
                </h4>
              </Label>
              <br />
              <br />
              {syphilisTest.syphilisTest === "Yes" && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Syphilis Test Date</FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={(e)=>e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={syphilisTest.testDate}
                        onChange={handleInputChangeSyphilisTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format("YYYY-MM-DD")}
                      />
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Syphilis Test Result</FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={syphilisTest.result}
                        onChange={handleInputChangeSyphilisTest}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.25rem",
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {sphylisTestResult.map((value) => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </div>
                  {syphilisTest.result === "Others" && (
                    <div className=" mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Syphilis Test Result (Others)
                        </FormLabelName>
                        <Input
                          type="text"
                          name="others"
                          id="others"
                          value={syphilisTest.others}
                          onChange={handleInputChangeSyphilisTest}
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={disabledField}
                        />
                      </FormGroup>
                    </div>
                  )}
                </>
              )}
              <br />
              <br />
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
                    onChange={handleCheckBoxOtherTest}
                    defaultChecked={true}
                    checked={otherTest.length > 0}
                  />
                  Other Test
                </h4>
              </Label>
              <br />
              <br />
              {/* {otherTest.otherTest === 'Yes' && (<> */}
              {otherTest.length > 0 &&
                otherTest.map((eachTest) => (
                  <div className="row" key={eachTest.localId}>
                    <div className=" mb-1 col-md-4">
                      <FormGroup>
                        <FormLabelName> Test Name</FormLabelName>

                        <Input
                          type="select"
                          name="name"
                          id="name"
                          value={eachTest.name}
                          onChange={(e) =>
                            handleInputChangeOtherTest(e, eachTest.localId)
                          }
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {otherTestResult.map((value) => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </div>
                    {eachTest.name === "PREP_OTHER_TEST_OTHER_(SPECIFY)" && (
                      <div className=" mb-1 col-md-4">
                        <FormGroup>
                          <FormLabelName> Other Test Name</FormLabelName>
                          <Input
                            type="text"
                            name="otherTestName"
                            id="otherTestName"
                            value={eachTest.otherTestName}
                            onChange={(e) =>
                              handleInputChangeOtherTest(e, eachTest.localId)
                            }
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.25rem",
                            }}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                    )}
                    <div className=" mb-1 col-md-4">
                      <FormGroup>
                        <FormLabelName> Test Date</FormLabelName>
                        <Input
                          type="date"
                          onKeyDown={(e)=>e.preventDefault()}
                          name="testDate"
                          id="testDate"
                          value={eachTest.testDate}
                          onChange={(e) =>
                            handleInputChangeOtherTest(e, eachTest.localId)
                          }
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={disabledField}
                          min={objValues.encounterDate}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                        />
                      </FormGroup>
                    </div>
                    <div className=" mb-1 col-md-4">
                      <FormGroup>
                        <FormLabelName> Test Result</FormLabelName>
                        <Input
                          type="text"
                          name="result"
                          id="result"
                          value={eachTest.result}
                          onChange={(e) =>
                            handleInputChangeOtherTest(e, eachTest.localId)
                          }
                          style={{
                            border: "1px solid #014D88",
                            borderRadius: "0.25rem",
                          }}
                          disabled={disabledField}
                        ></Input>
                      </FormGroup>
                    </div>
                    {/* add material ui divider  */}
                    {otherTest.length > 1 && (
                      <Divider
                        component="li"
                        style={{ marginBottom: "10px" }}
                      />
                    )}
                  </div>
                ))}
              {otherTest.length > 0 && (
                <div>
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={`${classes.button} col-md-4`}
                    startIcon={<AddIcon />}
                    style={{ backgroundColor: "#014d88" }}
                    onClick={handleCreateNewTest}
                    disabled={saving}
                  >
                    <span style={{ textTransform: "capitalize" }}>
                      Add Test
                    </span>
                  </MatButton>
                </div>
              )}

              <br />
              <Label
                as="a"
                color="blue"
                style={{ width: "106%", height: "35px" }}
                ribbon
              >
                <h4 style={{ color: "#fff" }}>NEXT APPOINTMENT DATE </h4>
              </Label>
              <br />
              <br />
              <br />
              <div className="mb-3 col-md-6">
                <FormLabelName>Next Appointment Date</FormLabelName>
                <Input
                  type="date"
                  onKeyDown={(e)=>e.preventDefault()}
                  name="nextAppointment"
                  id="nextAppointment"
                  value={objValues.nextAppointment}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                  min={objValues.encounterDate}
                  disabled={disabledField}
                />
                {errors.nextAppointment !== "" ? (
                  <span className={classes.error}>
                    {errors.nextAppointment}
                  </span>
                ) : (
                  ""
                )}
              </div>
              <div className=" mb-3 col-md-6">
                <FormLabelName>Healthcare Worker Signature</FormLabelName>
                <Input
                  name="healthCareWorkerSignature"
                  id="healthCareWorkerSignature"
                  placeholder="Enter signature..."
                  value={objValues.healthCareWorkerSignature}
                  onChange={handleInputChange}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                />
                {errors.healthCareWorkerSignature !== "" ? (
                  <span className={classes.error}>
                    {errors.healthCareWorkerSignature}
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
            <br />
            {!disabledField && (
              <>
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
              </>
            )}
          </Segment>
        </Grid.Column>
      </Grid>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
    </div>
  );
};

export default ClinicVisit;

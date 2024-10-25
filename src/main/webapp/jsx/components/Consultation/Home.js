import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Grid, Segment, Label, List, Card } from 'semantic-ui-react';
// Page titie
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from 'reactstrap';
import { url as baseUrl, token } from '../../../api';
import MatButton from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import Select from 'react-select';
import Divider from '@mui/material/Divider';
import { TiTrash } from 'react-icons/ti';

import { formValues } from 'redux-form';

import { CSSTransition } from 'react-transition-group';
import { LiverFunctionTest } from '../PrepServices/PrEPEligibiltyScreeningForm';

const useStyles = makeStyles(theme => ({
  card: {
    margin: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
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
    '& .card-title': {
      color: '#fff',
      fontWeight: 'bold',
    },
    '& .form-control': {
      borderRadius: '0.25rem',
      height: '41px',
    },
    '& .card-header:first-child': {
      borderRadius: 'calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0',
    },
    '& .dropdown-toggle::after': {
      display: ' block !important',
    },
    '& select': {
      '-webkit-appearance': 'listbox !important',
    },
    '& p': {
      color: 'red',
    },
    '& label': {
      fontSize: '14px',
      color: '#014d88',
      fontWeight: 'bold',
    },
  },
  input: {
    display: 'none',
  },
  error: {
    color: '#f85032',
    fontSize: '11px',
  },
  success: {
    color: '#4BB543 ',
    fontSize: '11px',
  },
}));

const ClinicVisit = props => {
  const [errors, setErrors] = useState({});
  const [disabledField, setDisabledField] = useState(false);
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
  const [selectedPopulationType, setSelectedPopulationType] = useState('');
  // const [selectedVisitType, setSelectedVisitType] = useState("");
  const [latestFromEligibility, setLatestFromEligibility] = useState(null);
  let testsOptions = [];
  const [hivTestValue, setHivTestValue] = useState('');
  const [hivTestResultDate, setHivTestResultDate] = useState('');
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: '',
    diastolic: '',
    height: '',
    systolic: '',
    pulse: '',
    temperature: '',
    respiratoryRate: '',
  });

  const [objValues, setObjValues] = useState({
    adherenceLevel: '',
    dateInitialAdherenceCounseling: '',
    datePrepGiven: '',
    datePrepStart: '',
    dateReferre: '',
    diastolic: '',
    encounterDate: '',
    extra: {},
    height: '',
    hepatitis: {},
    nextAppointment: '',
    notedSideEffects: '',
    wasPrepAdministered: 'false',
    otherTestsDone: [],
    personId: props.patientObj.personId, //should person id be from patientObj?
    pregnant: '',
    prepEnrollmentUuid: '',
    pulse: '',
    referred: '',
    regimenId: '',
    otherRegimenId: '',
    otherPrepgiven: 'false',
    respiratoryRate: '',
    riskReductionServices: '',
    healthCareWorkerSignature: '',
    stiScreening: '',
    syndromicStiScreening: null,
    syphilis: {},
    systolic: '',
    temperature: '',
    urinalysis: {},
    urinalysisResult: '',
    weight: '',
    why: '',
    otherDrugs: '',
    duration: '',
    prepGiven: '',
    hivTestResult: '',
    hivTestResultDate: '',
    prepType: '',
    otherPrepType: '',
    populationType: '',
    prepDistributionSetting: '',
    familyPlanning: '',
    dateOfFamilyPlanning: '',
    monthsOfRefill: '',
    visitType: '',
    reasonForSwitch: '',
    dateLiverFunctionTestResults: '',
    liverFunctionTestResults: [],
  });
  const [urinalysisTest, setUrinalysisTest] = useState({
    urinalysisTest: 'Yes',
    testDate: '',
    result: '',
  });
  const [otherPrepgiven, setOtherPrepgiven] = useState({
    prepType: 'Yes',
    prepRegimen: '',
    datePrepgiven: '',
  });
  const [syphilisTest, setSyphilisTest] = useState({
    syphilisTest: 'Yes',
    testDate: '',
    result: '',
    others: '',
  });
  const [hepatitisTest, setHepatitisTest] = useState({
    hepatitisTest: 'Yes',
    testDate: '',
    result: '',
  });

  const [otherTest, setOtherTest] = useState([
    {
      localId: 0,
      otherTest: 'Yes',
      testDate: '',
      result: '',
      name: '',
      otherTestName: '',
    },
  ]);
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
      objValues.otherPrepgiven.prepType &&
      objValues.otherPrepgiven.prepRegimen &&
      objValues.otherPrepgiven.datePrepgiven
    ) {
      setOtherPrepgiven({
        ...otherPrepgiven,
        prepType: objValues.otherPrepgiven.prepType,
        prepRegimen: objValues.otherPrepgiven.prepRegimen,
        datePrepgiven: objValues.otherPrepgiven.datePrepgiven,
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
    console.log('objectVals: ', objValues.wasPrepAdministered);
  });
  useEffect(() => {
    AdherenceLevel();
    SYNDROMIC_STI_SCREENING();
    PREP_RISK_REDUCTION_PLAN();
    //PatientDetaild();
    PREP_STATUS();
    HTS_RESULT();
    // LAST_HIV_TEST_RESULT();
    PREP_SIDE_EFFECTS();
    GetPatientDTOObj();
    WHY_POOR_FAIR_ADHERENCE();
    PrepEligibilityObj();
    // PrepRegimen(objValues.encounterDate);
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
    getPatientVisit(props.activeContent.id);

    setDisabledField(
      !['update', undefined].includes(props.activeContent.actionType)
    );
  }, [props.activeContent]);

  useEffect(() => {
    getLatestFromEligibility();
  }, []);

  const PREGANACY_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setpregnant(response.data);
      })
      .catch(error => {});
  };

  const PREP_ENTRY_POINT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepEntryPoints(response.data);
      })
      .catch(error => {});
  };

  const PREP_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepType(response.data);
      })
      .catch(error => {});
  };

  //Get list of Test Group
  const TestGroup = () => {
    axios
      .get(`${baseUrl}laboratory/labtestgroups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        response.data.map(x => {
          x.labTests.map(x2 => {
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
      .catch(error => {});
  };

  const checkEligibleForCABLA = async (currentDate, regimenList) => {
    if (currentDate) {
      await axios
        .get(
          `${baseUrl}prep-clinic/checkEnableCab/${props.patientObj.personId}/${currentDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(response => {
          if (response?.data || !response?.data) {
            let isEligibleForCABLA = response?.data;
            if (
              isEligibleForCABLA ||
              objValues?.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH'
            ) {
              setPrepType(prepType);
              setprepRegimen(regimenList);
            } else {
              let reg = regimenList.filter((each, index) => {
                return each.code !== 'CAB-LA(600mg/3mL)';
              });
              let pTypes = prepType.filter((each, index) => {
                return each.code !== 'PREP_TYPE_INJECTIBLES';
              });
              setPrepType(pTypes);
              setprepRegimen(reg);
            }
            return response?.data;
          }
        })
        .catch(error => {});
    }
  };

  const getPatientVisit = async id => {
    axios
      .get(`${baseUrl}prep-clinic/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        const { data } = JSON.parse(JSON.stringify(response));
        console.log('resp: ', data.regimen);
        setOtherTest(response?.data?.otherTestsDone);
        setObjValues(data);
      })
      .catch(error => {});
  };

  const getHIVresult = () => {
    axios
      .get(`${baseUrl}prep-clinic/hts-record/${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        if (response.data?.length === 0) {
          toast.error(
            'No HTS record found. Atleast, 1 test result is required to proceed.'
          );
        } else if (response.data?.length > 0) {
          toast.success('HTS record found. You may proceed.');
        }
        setHivTestValue(response?.data?.[0]?.hivTestResult);
        setHivTestResultDate(response?.data?.[0]?.visitDate);
      })
      .catch(error => {});
  };
  const GetPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${props.patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
      })
      .catch(error => {});
  };
  const PrepEligibilityObj = () => {
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${props.patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        //setPrepStatus(response.data);
        objValues.prepEnrollmentUuid = '';
      })
      .catch(error => {});
  };
  const PrepRegimen = currentDate => {
    axios
      .get(`${baseUrl}prep-regimen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        let isEligibleForCABLA = checkEligibleForCABLA(
          currentDate,
          response.data
        );
      })
      .catch(error => {});
  };
  const PREP_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepStatus(response.data);
      })
      .catch(error => {});
  };
  const [prepRiskReductionPlan, setPrepRiskReductionPlan] = useState([]);
  const PREP_RISK_REDUCTION_PLAN = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_RISK_REDUCTION_PLAN`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        console.log('prep codeset: ', response.data);
        setPrepRiskReductionPlan(response.data);
      })
      .catch(error => {});
  };
  const PREP_SIDE_EFFECTS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepSideEffect(response.data);
      })
      .catch(error => {});
  };

  const HTS_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HTS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setHtsResult(response.data);
      })
      .catch(error => {});
  };
  const LAST_HIV_TEST_RESULT = () => {
    axios
      .get(`${baseUrl}hts/persons/${objValues.personId}/current-hts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        var lastHivTest = response?.data?.hivTestResult;
        // console.log('last res; ', response.data.hivTestResult)
        if (!lastHivTest) {
          setHivTestValue(response.data.hivTestResult);
          setHivTestResultDate(response.data.test1.date);
          objValues.hivTestResultDate = response.data.hivTestResult;
          objValues.hivTestResultDate = response.data.test1.date;
        } else {
          setHivTestValue('NOT DONE');
        }
      })
      .catch(error => {});
  };

  useEffect(() => {
    if (latestFromEligibility !== null) {
      setObjValues({
        ...objValues,
        populationType:
          latestFromEligibility !== null
            ? latestFromEligibility?.populationType
            : '',
        visitType:
          latestFromEligibility !== null
            ? latestFromEligibility?.visitType
            : '',
        pregnant:
          latestFromEligibility !== null
            ? latestFromEligibility?.pregnancyStatus
            : '',
      });
      // await POPULATION_TYPE();
      const autoPopulatePopulationType = populationType?.find(
        type => type?.code === latestFromEligibility?.populationType
      )?.display;
      const autoPopulateVisitType = visitType.find(
        type => type?.code === latestFromEligibility?.visitType
      )?.display;
      const autoPopulatePregnant = pregnant?.find(
        type => type?.code === latestFromEligibility?.pregnancyStatus
      )?.display;
      setSelectedPopulationType(autoPopulatePopulationType);
    }
  }, [latestFromEligibility]);

  const getLatestFromEligibility = async () => {
    axios
      .get(`${baseUrl}prep-eligibility/person/${objValues?.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async response => {
        const latestEligibility = response?.data?.sort((a, b) =>
          moment(a?.visitDate).isBefore(moment(b?.visitDate))
        )[response.data.length - 1];
        console.log(
          'CabLa Eligibility Assesment: ',
          latestEligibility?.assessmentForPrepEligibility
        );
        setLatestFromEligibility(latestEligibility);
      })
      .catch(error => {});
  };

  function checkEligibleForCabLaFromLatestEligibility(
    assessmentForPrepEligibility
  ) {
    const keysToCheck = [
      'noHistoryOfDrugHypersensitivityCabLa',
      'noHistoryOfDrugToDrugInteractionCabLa',
      'noHistoryOrSignsOfLiverAbnormalitiesCabLa',
    ];

    for (let key of keysToCheck) {
      if (assessmentForPrepEligibility?.[key] === 'Yes') {
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    if (
      objValues.populationType !== null &&
      objValues.populationType !== undefined
    ) {
      const autoPopulate = populationType.find(
        type => type.code === objValues.populationType
      );

      setSelectedPopulationType(autoPopulate ? autoPopulate.display : '');
    }
  }, [objValues.populationType]);
  const POPULATION_TYPE = async () => {
    axios
      .get(`${baseUrl}application-codesets/v2/POPULATION_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPopulationType(response?.data);
      })
      .catch(error => {});
  };

  const VISIT_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_VISIT_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setVisitType(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const WHY_POOR_FAIR_ADHERENCE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/WHY_POOR_FAIR_ADHERENCE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setWhyAdherenceLevelPoor(response.data);
      })
      .catch(error => {});
  };
  ///GET LIST OF FUNCTIONAL%20_STATUS
  // TB STATUS
  const SYNDROMIC_STI_SCREENING = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SYNDROMIC_STI_SCREENING`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setSti(response.data);
      })
      .catch(error => {});
  };
  //PREP_URINALYSIS_RESULT
  const PREP_URINALYSIS_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_URINALYSIS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setUrineTestResult(response?.data);
      })
      .catch(error => {});
  };
  //PREP_OTHER_TEST
  const PREP_OTHER_TEST = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_OTHER_TEST`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setOtherTestResult(response.data);
      })
      .catch(error => {});
  };
  //SYPHILIS_RESULT
  const SYPHILIS_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/SYPHILIS_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setSphylisTestResult(response.data);
      })
      .catch(error => {});
  };
  //HEPATITIS_SCREENING_RESULT
  const HEPATITIS_SCREENING_RESULT = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HEPATITIS_SCREENING_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setHepaTestResult(response?.data);
      })
      .catch(error => {});
  };

  // FAMILY_PLANNING_METHOD
  const FAMILY_PLANNING_METHOD = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/FAMILY_PLANNING_METHOD`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setFamilyPlanningMethod(response.data);
      })
      .catch(error => {});
  };

  ///Level of Adherence
  async function AdherenceLevel() {
    axios
      .get(`${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setAdherenceLevel(response.data);
      })
      .catch(error => {});
  }

  const handleInputChange = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.name === 'monthsOfRefill') {
      const durationInDays = Number(e.target.value);
      setObjValues({
        ...objValues,
        monthsOfRefill: e.target.value,
        duration: `${durationInDays}`,
      });
    } else if (e.target.name === 'encounterDate') {
      PrepRegimen(e.target.value);
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    } else if (e.target.name === 'otherPrepgiven') {
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    } else {
      // if the encounterDate is the same as the commencement date, the prep regimen id should be automatically populated from the commencement
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
    }
  };
  const handleInputChangeUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeOtherTest = (e, localId) => {
    //find the test with the localId
    let temp = [...otherTest];
    let index = temp.findIndex(x => Number(x.localId) === Number(localId));

    console.log('index found: ', index, e.target.name);
    console.log('index found: ', index, e.target.value);
    temp[index][e.target.name] = e.target.value;
    console.log('otherTest: ', temp);
    setOtherTest(temp);
  };
  const handleRemoveTest = localId => {
    setOtherTest(prev => prev.filter(test => test.localId !== localId));
  };
  const handleInputChangeHepatitisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeSyphilisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    //Others
    if (e.target.name === 'result' && e.target.value !== 'Others') {
      syphilisTest.others = '';
      setSyphilisTest({ ...syphilisTest, ['others']: '' });
      setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    }
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
  };

  const handleCheckBoxSyphilisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.checked) {
      setSyphilisTest({ ...syphilisTest, ['syphilisTest']: 'Yes' });
    } else {
      setSyphilisTest({ ...syphilisTest, ['syphilisTest']: 'No' });
    }
  };
  const handleCheckBoxHepatitisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.checked) {
      setHepatitisTest({ ...hepatitisTest, ['hepatitisTest']: 'Yes' });
    } else {
      setHepatitisTest({ ...syphilisTest, ['syphilisTest']: 'No' });
    }
  };
  const handleCheckBoxOtherTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.checked) {
      setOtherTest([
        ...otherTest,
        ...objValues.otherTestsDone,
        {
          localId: objValues.otherTestsDone?.length || 0,
          otherTest: 'Yes',
          testDate: '',
          result: '',
          name: '',
          otherTestName: '',
        },
      ]);
    } else {
      setOtherTest([]);
    }
  };
  const otherTestInputRef = useRef();

  const loadOtherTestOptions = () => {
    setErrors({ ...errors, [otherTestInputRef.current.name]: '' });
    if (otherTestInputRef.current.checked) {
      setOtherTest([
        ...otherTest,
        ...objValues.otherTestsDone,
        {
          localId: objValues.otherTestsDone?.length || 0,
          otherTest: 'Yes',
          testDate: '',
          result: '',
          name: '',
          otherTestName: '',
        },
      ]);
    } else {
      setOtherTest([]);
    }
  };
  const handleCheckBoxUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.checked) {
      setUrinalysisTest({ ...urinalysisTest, ['urinalysisTest']: 'Yes' });
    } else {
      setUrinalysisTest({ ...otherTest, ['urinalysisTest']: 'No' });
    }
  };

  const handleInputValueCheckHeight = e => {
    if (
      e.target.name === 'height' &&
      (e.target.value < 48.26 || e.target.value > 216.408)
    ) {
      const message =
        'Height cannot be greater than 216.408 and less than 48.26';
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: '' });
    }
  };
  const handleInputValueCheckweight = e => {
    if (
      e.target.name === 'weight' &&
      (e.target.value < 3 || e.target.value > 150)
    ) {
      const message =
        'Body weight must not be greater than 150 and less than 3';
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: '' });
    }
  };
  const handleInputValueCheckSystolic = e => {
    if (
      e.target.name === 'systolic' &&
      (e.target.value < 90 || e.target.value > 240)
    ) {
      const message =
        'Blood Pressure systolic must not be greater than 240 and less than 90';
      setVitalClinicalSupport({ ...vitalClinicalSupport, systolic: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, systolic: '' });
    }
  };
  const handleInputValueCheckDiastolic = e => {
    if (
      e.target.name === 'diastolic' &&
      (e.target.value < 60 || e.target.value > 140)
    ) {
      const message =
        'Blood Pressure diastolic must not be greater than 140 and less than 60';
      setVitalClinicalSupport({ ...vitalClinicalSupport, diastolic: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, diastolic: '' });
    }
  };
  const handleInputValueCheckPulse = e => {
    if (
      e.target.name === 'pulse' &&
      (e.target.value < 40 || e.target.value > 120)
    ) {
      const message = 'Pulse must not be greater than 120 and less than 40';
      setVitalClinicalSupport({ ...vitalClinicalSupport, pulse: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, pulse: '' });
    }
  };
  const handleInputValueCheckRespiratoryRate = e => {
    if (
      e.target.name === 'respiratoryRate' &&
      (e.target.value < 10 || e.target.value > 70)
    ) {
      const message =
        'Respiratory Rate must not be greater than 70 and less than 10';
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        respiratoryRate: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, respiratoryRate: '' });
    }
  };
  const handleInputValueCheckTemperature = e => {
    if (
      e.target.name === 'temperature' &&
      (e.target.value < 35 || e.target.value > 47)
    ) {
      const message =
        'Temperature must not be greater than 47 and less than 35';
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        temperature: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, temperature: '' });
    }
  };

  useEffect(() => {
    if (
      props.activeContent.actionType === '' ||
      props.activeContent.actionType === null
    ) {
      emptyObjValues();
    }
  }, [props.activeContent.actionType]);

  const emptyObjValues = () => {
    setObjValues({
      adherenceLevel: '',
      dateInitialAdherenceCounseling: '',
      datePrepGiven: '',
      datePrepStart: '',
      dateReferre: '',
      diastolic: '',
      encounterDate: '',
      extra: {},
      height: '',
      hepatitis: {},
      nextAppointment: '',
      notedSideEffects: '',
      otherTestsDone: [],
      personId: props.patientObj.personId,
      pregnant: '',
      prepEnrollmentUuid: '',
      pulse: '',
      referred: '',
      regimenId: '',
      respiratoryRate: '',
      riskReductionServices: '',
      stiScreening: '',
      syndromicStiScreening: null,
      syphilis: {},
      systolic: '',
      temperature: '',
      urinalysis: {},
      urinalysisResult: '',
      weight: '',
      why: '',
      otherDrugs: '',
      hivTestResult: '',
      duration: '',
      prepGiven: '',
      prepDistributionSetting: '',
      visitType: '',
    });
    setUrinalysisTest({});
    setSyphilisTest({});
    setHepatitisTest({});
    setOtherTest([]);
  };

  //Validations of the forms
  const validate = () => {
    temp.lastHts = hivTestValue ? '' : 'Atleast, 1 HIV test result is required';
    // temp.otherTestsDone = otherTest.length
    //   ? ''
    //   : 'You must submit atleast, a test result.';
    temp.monthsOfRefill = objValues.monthsOfRefill
      ? ''
      : 'This field is required';
    temp.wasPrepAdministered = objValues.wasPrepAdministered
      ? ''
      : 'This field is required';
    hasPrepEligibility(temp.encounterDate, props.encounters);
    temp.encounterDate = objValues.encounterDate
      ? ''
      : 'This field is required';

    if (isFemale()) {
      temp.pregnant = objValues.pregnant ? '' : 'This field is required';
    }
    temp.nextAppointment = objValues.nextAppointment
      ? ''
      : 'This field is required';

    temp.height = objValues.height ? '' : 'This field is required';
    temp.weight = objValues.weight ? '' : 'This field is required';
    temp.urinalysisTest = urinalysisTest.urinalysisTest
      ? ''
      : 'This field is required';
    temp.testDate = urinalysisTest.testDate ? '' : 'This field is required';
    temp.result = urinalysisTest.result ? '' : 'This field is required';
    temp.regimenId = objValues.regimenId ? '' : 'This field is required';
    temp.duration = objValues.duration ? '' : 'This field is required';
    temp.prepDistributionSetting = objValues.prepDistributionSetting
      ? ''
      : 'This field is required';
    temp.populationType = objValues.populationType
      ? ''
      : 'This field is required';
    temp.visitType = objValues.visitType ? '' : 'This field is required';
    if (objValues.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH') {
      temp.reasonForSwitch = objValues.reasonForSwitch
        ? ''
        : 'This field is required';
    } else {
      temp.reasonForSwitch = '';
    }

    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x === '');
  };
  /**** Submit Button Processing  */
  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      //objValues.visitDate = vital.encounterDate
      objValues.hivTestResultDate = hivTestResultDate;
      objValues.hivTestResult = hivTestValue;
      objValues.syphilis = syphilisTest;
      objValues.hepatitis = hepatitisTest;
      objValues.urinalysis = urinalysisTest;
      objValues.otherTestsDone = otherTest;
      objValues.prepEnrollmentUuid = patientDto.uuid;

      if (props.activeContent && props.activeContent.actionType === 'update') {
        axios
          .put(`${baseUrl}prep-clinic/${props.activeContent.id}`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            //PatientDetaild();
            setSaving(false);
            toast.success('Clinic visit update successful', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: 'consultation',
              activeTab: 'history',
              actionType: 'view',
            });
          })
          .catch(error => {
            setSaving(false);
            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ''
                  ? error.response.data.apierror.message
                  : 'Something went wrong, please try again';
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
              toast.error('Something went wrong, please try again...', {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      } else {
        axios
          .post(`${baseUrl}prep/clinic-visit`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            //PatientDetaild();
            setSaving(false);
            emptyObjValues();
            toast.success('Clinic Visit save successful', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: 'consultation',
              activeTab: 'history',
              actionType: 'view',
            });
          })
          .catch(error => {
            setSaving(false);

            if (error.response && error.response.data) {
              let errorMessage =
                error.response.data.apierror &&
                error.response.data.apierror.message !== ''
                  ? error.response.data.apierror.message
                  : 'Something went wrong, please try again';
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
              toast.error('Something went wrong, please try again...', {
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          });
      }
    }
  };

  const handleCreateNewTest = () => {
    setOtherTest([
      ...otherTest,
      {
        localId: otherTest.length,
        otherTest: 'Yes',
        testDate: '',
        result: '',
        name: '',
        otherTestName: '',
      },
    ]);
  };

  const isFemale = () => {
    return props.patientObj.gender.toLowerCase() === 'female';
  };

  const handlePrepTypeChange = e => {
    setObjValues({ ...objValues, regimenId: '', prepType: e.target.value });
    if (
      e.target.value === 'PREP_TYPE_OTHERS' ||
      e.target.value === 'PREP_TYPE_ED_PREP'
    ) {
      PrepRegimen(objValues.encounterDate);
    } else {
      axios
        .get(`${baseUrl}prep-regimen/prepType?prepType=${e.target.value}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          checkEligibleForCABLA(objValues.encounterDate, response.data);

          // setprepRegimen(response.data);
        })
        .catch(error => {
          //console.log(error);
        });
    }

    setErrors({ ...errors, [e.target.name]: '' });
  };

  function joinActivities(data) {
    return data.reduce((acc, item) => {
      return acc.concat(item.activities);
    }, []);
  }
  function countPrepEligibility(data) {
    let count = 0;
    let relevantActivities = ['Prep Commencement', 'Prep Clinic'];
    data.forEach(entry => {
      entry?.activities?.forEach(activity => {
        if (relevantActivities.includes(activity?.name)) {
          count++;
        }
      });
    });

    return count;
  }
  function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }
  function areDatesSame(date1, date2) {
    // if (!isValidDate(date1) || !isValidDate(date2)) return alert('Invalid eligibility or visit date.')
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
          activity.name === 'Prep Eligibility' &&
          areDatesSame(new Date(activity.date), new Date(targetDate))
        ) {
          return true;
        }
      }
    }
    return false;
  }
  const [recentActivities, setRecentActivities] = useState([]);
  const getRecentActivities = () => {
    axios
      .get(
        `${baseUrl}prep/activities/patients/${props.patientObj.personId}?full=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setRecentActivities(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const filterOutLastRegimen = (codeSet, lastRegimenId) =>
    codeSet.filter(regimen => {
      return regimen.id !== lastRegimenId;
    });
  const handleOtherTestsDone = e => {
    setOtherTestResult(prev =>
      prev?.filter(eachTest => eachTest?.name !== e.target.value)
    );
  };
  useEffect(() => {
    getRecentActivities();
    getHIVresult();
  }, []);
  const handleOtherTestDoneChange = e => {
    const { name, value } = e.target;

    // Handle normal inputs
    if (name !== 'otherTestsDone') {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // Handle changes for the otherTestsDone array
      const { localId, field } = e.target.dataset; // Assuming you're using data attributes to pass localId and the field being edited
      console.log('found dataset: ', e.target.dataset);
      const updatedTests = [...objValues.otherTestsDone];

      // Find the index of the test being updated
      const index = updatedTests.findIndex(
        test => test.localId === Number(localId)
      );

      console.log('found index: ', index);

      if (index !== -1) {
        updatedTests[index] = {
          ...updatedTests[index],
          [field]: value,
        };
      }

      setObjValues(prev => ({
        ...prev,
        otherTestsDone: updatedTests,
      }));
    }
  };

  const prepRegimenUpdateView = () => {
    axios
      .get(`${baseUrl}prep-regimen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setprepRegimen(response.data);
      })
      .catch(error => {});
  };
  useEffect(() => {
    if (['update', 'view'].includes(props.activeContent.actionType))
      prepRegimenUpdateView();
  }, [props.activeContent.actionType]);

  const handleCheckBoxOtherPrepgiven = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.checked) {
      setOtherPrepgiven({ ...otherPrepgiven, ['prepType']: 'Yes' });
    } else {
      setOtherPrepgiven({ ...otherPrepgiven, ['prepType']: 'No' });
    }
  };
  const handleLftInputChange = event => {
    const { name, value } = event.target;
    setObjValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const [liverFunctionTestResult, setLiverFunctionTestResult] = useState([]);

  const getLiverFunctionTestResult = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/LIVER_FUNCTION_TEST_RESULT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setLiverFunctionTestResult(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  useEffect(() => {
    getLiverFunctionTestResult();
  }, []);

  useEffect(() => {
    if (latestFromEligibility) {
      setObjValues(prevValues => ({
        ...prevValues,
        liverFunctionTestResults:
          latestFromEligibility.liverFunctionTestResults || [
            'LIVER_FUNCTION_TEST_RESULT_ALANINE_AMINOTRANSFERASE_(ALT)__DERANGED',
          ],
        dateLiverFunctionTestResults:
          latestFromEligibility.dateLiverFunctionTestResults || '',
      }));
    }
  }, [latestFromEligibility]);

  useEffect(() => {
    console.log('objValues: ', objValues);
    console.log('errors: : ', errors);
  });
  return (
    <div className={classes.root}>
      <div className="row">
        <div className="col-md-6">
          <h2>Clinic Follow-up Visit</h2>
        </div>
      </div>
      <Grid>
        <Grid.Column>
          <Segment>
            <Label
              as="a"
              color="blue"
              style={{ width: '106%', height: '35px' }}
              ribbon
            >
              <h4 style={{ color: '#fff' }}>VITAL SIGNS</h4>
            </Label>
            <br />
            <br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Visit <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    className="form-control"
                    type="date"
                    name="encounterDate"
                    id="encounterDate"
                    onKeyDown={e => e.preventDefault()}
                    value={objValues.encounterDate}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    onChange={handleInputChange}
                    //min={props.patientDetail && props.patientDetail.dateHivPositive!==null ? props.patientDetail.dateHivPositive : props.patientDetail.personResponseDto.dateOfRegistration}
                    min={
                      patientDto && patientDto.dateEnrolled
                        ? patientDto.dateEnrolled
                        : ''
                    }
                    max={moment(new Date()).format('YYYY-MM-DD')}
                    disabled={disabledField}
                  />
                  {errors.encounterDate !== '' ? (
                    <span className={classes.error}>
                      {errors.encounterDate}
                    </span>
                  ) : (
                    ''
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
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                          borderTopRightRadius: '0',
                          borderBottomRightRadius: '0',
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopRightRadius: '0.25rem',
                          borderBottomRightRadius: '0.25rem',
                        }}
                      >
                        bmp
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.pulse !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.pulse}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.pulse !== '' ? (
                      <span className={classes.error}>{errors.pulse}</span>
                    ) : (
                      ''
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
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopLeftRadius: '0.25rem',
                          borderBottomLeftRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopRightRadius: '0.25rem',
                          borderBottomRightRadius: '0.25rem',
                        }}
                      >
                        bmp
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.respiratoryRate !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.respiratoryRate}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.respiratoryRate !== '' ? (
                      <span className={classes.error}>
                        {errors.respiratoryRate}
                      </span>
                    ) : (
                      ''
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
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopLeftRadius: '0.25rem',
                          borderBottomLeftRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopRightRadius: '0.25rem',
                          borderBottomRightRadius: '0.25rem',
                        }}
                      >
                        <sup>o</sup>c
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.temperature !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.temperature}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.temperature !== '' ? (
                      <span className={classes.error}>
                        {errors.temperature}
                      </span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>

                <div className=" mb-3 col-md-5">
                  <FormGroup>
                    <FormLabelName>
                      Body Weight <span style={{ color: 'red' }}> *</span>
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
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopLeftRadius: '0.25rem',
                          borderBottomLeftRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopRightRadius: '0.25rem',
                          borderBottomRightRadius: '0.25rem',
                        }}
                      >
                        kg
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.weight !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.weight}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.weight !== '' ? (
                      <span className={classes.error}>{errors.weight}</span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-5">
                  <FormGroup>
                    <FormLabelName>
                      Height <span style={{ color: 'red' }}> *</span>
                    </FormLabelName>
                    <InputGroup>
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopLeftRadius: '0.25rem',
                          borderBottomLeftRadius: '0.25rem',
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
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                        }}
                        disabled={disabledField}
                      />
                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#992E62',
                          color: '#fff',
                          border: '1px solid #992E62',
                          borderRadius: '0rem',
                          borderTopRightRadius: '0.25rem',
                          borderBottomRightRadius: '0.25rem',
                        }}
                      >
                        {objValues.height !== ''
                          ? (objValues.height / 100).toFixed(2) + 'm'
                          : 'm'}
                      </InputGroupText>
                    </InputGroup>
                    {vitalClinicalSupport.height !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.height}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.height !== '' ? (
                      <span className={classes.error}>{errors.height}</span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 mt-2 col-md-2">
                  {objValues.weight !== '' && objValues.height !== '' && (
                    <FormGroup>
                      <Label> </Label>
                      <InputGroup>
                        <InputGroupText
                          addonType="append"
                          style={{
                            backgroundColor: '#014D88',
                            color: '#fff',
                            border: '1px solid #014D88',
                          }}
                        >
                          BMI :{' '}
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
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopLefttRadius: '0.25rem',
                          borderBottomLeftRadius: '0.25rem',
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
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                        }}
                        disabled={disabledField}
                      />

                      <InputGroupText
                        addonType="append"
                        style={{
                          backgroundColor: '#014D88',
                          color: '#fff',
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
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
                          border: '1px solid #014D88',
                          borderRadius: '0rem',
                          borderTopRightRadius: '0.25rem',
                          borderBottomRightRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      />
                    </InputGroup>
                    {vitalClinicalSupport.systolic !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.systolic}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.systolic !== '' ? (
                      <span className={classes.error}>{errors.systolic}</span>
                    ) : (
                      ''
                    )}

                    {vitalClinicalSupport.diastolic !== '' ? (
                      <span className={classes.error}>
                        {vitalClinicalSupport.diastolic}
                      </span>
                    ) : (
                      ''
                    )}
                    {errors.diastolic !== '' ? (
                      <span className={classes.error}>{errors.diastolic}</span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
                {isFemale() && (
                  <div className="form-group mb-3 col-md-4">
                    <FormGroup>
                      <FormLabelName>
                        Pregnancy Status{' '}
                        <span style={{ color: 'red' }}> *</span>
                      </FormLabelName>
                      <Input
                        type="select"
                        name="pregnant"
                        id="pregnant"
                        onChange={handleInputChange}
                        value={objValues.pregnant}
                        disabled={disabledField}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                      >
                        <option value="">Select Pregnancy Status</option>
                        {pregnant.map(value => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.pregnant !== '' ? (
                        <span className={classes.error}>{errors.pregnant}</span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                )}
              </div>
            </div>
            <Label
              as="a"
              color="black"
              style={{ width: '106%', height: '35px' }}
              ribbon
            >
              <h4 style={{ color: '#fff' }}></h4>
            </Label>
            <br />
            <br />

            <div className="row">
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Result of Last HIV Test{' '}
                    <span style={{ color: 'red' }}> *</span>{' '}
                  </FormLabelName>
                  <Input
                    type="text"
                    name="hivTestResult"
                    id="hivTestResult"
                    value={hivTestValue}
                    onChange={e => {
                      setHivTestValue(e.target.value);
                      handleInputChange(e);
                    }}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled
                  />
                  <div className="p-1">
                    {errors.lastHts !== '' ? (
                      <span className={classes.error}>{errors.lastHts}</span>
                    ) : (
                      ''
                    )}
                  </div>
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    Date of Last HIV Test{' '}
                    <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type={hivTestValue == 'NOT DONE' ? 'text' : 'date'}
                    name="hivTestResultDate"
                    id="hivTestResultDate"
                    value={
                      hivTestValue == 'NOT DONE'
                        ? 'NOT APPLICABLE'
                        : hivTestResultDate
                    }
                    onChange={e => {
                      setHivTestValue(e.target.value);
                      handleInputChange(e);
                    }}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled
                  />
                  <div className="p-1">
                    {errors.lastHtsDate !== '' ? (
                      <span className={classes.error}>
                        {errors.lastHtsDate}
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </FormGroup>
              </div>
              <>
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName for="liverFunctionTestResults">
                      Liver Function Tests Result
                      <span style={{ color: 'red' }}> *</span>
                    </FormLabelName>
                    <LiverFunctionTest
                      objValues={objValues}
                      handleInputChange={handleLftInputChange}
                      liverFunctionTestResult={liverFunctionTestResult}
                      disabledField={disabledField}
                      isAutoPop={true}
                    />
                    {errors.liverFunctionTestResults !== '' ? (
                      <span className={classes.error}>
                        {errors.liverFunctionTestResults}
                      </span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
                <div className="form-group mb-3 col-md-8">
                  <FormGroup>
                    <FormLabelName for="dateLiverFunctionTestResults">
                      Date of Liver Function Tests Result{' '}
                      <span style={{ color: 'red' }}> *</span>
                    </FormLabelName>
                    <Input
                      className="form-control"
                      type="date"
                      onKeyDown={e => e.preventDefault()}
                      name="dateLiverFunctionTestResults"
                      id="dateLiverFunctionTestResults"
                      // min={
                      //   patientDto && patientDto.dateEnrolled
                      //     ? patientDto.dateEnrolled
                      //     : ''
                      // }
                      max={moment(new Date()).format('YYYY-MM-DD')}
                      value={objValues.dateLiverFunctionTestResults}
                      onChange={handleInputChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled
                    />
                    {errors.dateLiverFunctionTestResults !== '' ? (
                      <span className={classes.error}>
                        {errors.dateLiverFunctionTestResults}
                      </span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
              </>
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
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    {prepSideEffect.map(value => (
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
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Input>
                </FormGroup>
              </div>
              {objValues.stiScreening === 'true' && (
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
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {sti.map(value => (
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
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option key={100} value="">
                      Select
                    </option>
                    {prepRiskReductionPlan.map(plan => (
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
                    Level of Adherence
                    {/* {countPrepEligibility(recentActivities) < 2 && <span style={{ color: "red" }}> *</span>} */}
                  </FormLabelName>
                  <Input
                    type="select"
                    name="adherenceLevel"
                    id="adherenceLevel"
                    value={objValues.adherenceLevel}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>

                    {adherenceLevel.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.adherenceLevel !== '' ? (
                    <span className={classes.error}>
                      {errors.adherenceLevel}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              {objValues.adherenceLevel ===
                'PREP_LEVEL_OF_ADHERENCE_(POOR)_≥_7_DOSES' && (
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
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>

                      {whyAdherenceLevelPoor.map(value => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
              )}

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Population Type <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="populationType"
                    id="populationType"
                    onChange={handleInputChange}
                    value={objValues.populationType}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""> Select Population Type</option>
                    {populationType?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.populationType !== '' ? (
                    <span className={classes.error}>
                      {errors.populationType}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Visit Type <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="visitType"
                    id="visitType"
                    onChange={handleInputChange}
                    value={objValues.visitType}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""> Select Visit Type</option>
                    {visitType.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.visitType !== '' ? (
                    <span className={classes.error}>{errors.visitType}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              {objValues.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH' && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <FormLabelName>Reason for switch</FormLabelName>
                    <span style={{ color: 'red' }}> *</span>
                    <Input
                      type="select"
                      name="reasonForSwitch"
                      id="reasonForSwitch"
                      value={objValues.reasonForSwitch}
                      onChange={handleInputChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </Input>
                  </FormGroup>
                  {errors.reasonForSwitch !== '' ? (
                    <span className={classes.error}>
                      {errors.reasonForSwitch}
                    </span>
                  ) : (
                    ''
                  )}
                </div>
              )}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    Prep Type<span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="prepType"
                    id="prepType"
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    // disabled
                    onChange={handlePrepTypeChange}
                    value={objValues.prepType}
                    disabled={disabledField}
                  >
                    <option value=""> Select PrEP Type</option>
                    {prepType.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.prepType !== '' ? (
                    <span className={classes.error}>{errors.prepType}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    PrEP Regimen <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="regimenId"
                    id="regimenId"
                    onChange={handleInputChange}
                    value={objValues.regimenId}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""> Select</option>
                    {['update', 'view'].includes(props.activeContent.actionType)
                      ? prepRegimen?.map(value => (
                          <option key={value.id} value={value.id}>
                            {value.regimen}
                          </option>
                        ))
                      : objValues?.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH'
                      ? filterOutLastRegimen(
                          prepRegimen,
                          props.recentActivities[0]?.regimenId
                        ).map(value => (
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
                  {errors.regimenId !== '' ? (
                    <span className={classes.error}>{errors.regimenId}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              {objValues.prepType === 'PREP_TYPE_INJECTIBLES' && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <>
                      <FormGroup>
                        <FormLabelName>Other PrEP given</FormLabelName>
                        <span style={{ color: 'red' }}> *</span>
                        <Input
                          type="select"
                          name="otherPrepgiven"
                          id="otherPrepgiven"
                          value={objValues.otherPrepgiven}
                          onChange={handleInputChange}
                          style={{
                            border: '1px solid #014D88',
                            borderRadius: '0.25rem',
                          }}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </Input>
                      </FormGroup>
                      {errors.otherPrepgiven !== '' ? (
                        <span className={classes.error}>
                          {errors.otherPrepgiven}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  </div>
                  {objValues.otherPrepgiven === 'true' && (
                    <>
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName for="">
                            Other PrEP Type
                            <span style={{ color: 'red' }}> *</span>
                          </FormLabelName>
                          <Input
                            type="select"
                            name="otherPrepType"
                            id="otherPrepType"
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                            onChange={handleInputChange}
                            value={objValues.otherPrepType}
                            disabled={disabledField}
                          >
                            <option value=""> Select Prep Type</option>
                            {prepType
                              .filter(
                                (each, index) =>
                                  each.code !== 'PREP_TYPE_INJECTIBLES'
                              )
                              .map(value => (
                                <option key={value.id} value={value.code}>
                                  {value.display}
                                </option>
                              ))}
                          </Input>
                          {errors.otherPrepType !== '' ? (
                            <span className={classes.error}>
                              {errors.otherPrepType}
                            </span>
                          ) : (
                            ''
                          )}
                        </FormGroup>
                      </div>
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName for="">
                            Other PrEP Regimen{' '}
                            <span style={{ color: 'red' }}> *</span>
                          </FormLabelName>
                          <Input
                            type="select"
                            name="otherRegimenId"
                            id="otherRegimenId"
                            onChange={handleInputChange}
                            value={objValues.otherRegimenId}
                            disabled={disabledField}
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                          >
                            <option value=""> Select</option>
                            {objValues.otherPrepType === 'PREP_TYPE_ORAL' ? (
                              <option value="1">TDF(300mg)+3TC(300mg)</option>
                            ) : null}
                            {objValues.otherPrepType ===
                            'PREP_TYPE_INJECTIBLES' ? (
                              <option value="2">IM CAB-LA(600mg/3mL)</option>
                            ) : null}
                            {objValues.otherPrepType === 'PREP_TYPE_ED_PREP' ? (
                              <>
                                <option value="2">IM CAB-LA(600mg/3mL)</option>
                                <option value="1">TDF(300mg)+3TC(300mg)</option>
                              </>
                            ) : null}
                          </Input>
                          {errors.otherRegimenId !== '' ? (
                            <span className={classes.error}>
                              {errors.otherRegimenId}
                            </span>
                          ) : (
                            ''
                          )}
                        </FormGroup>
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">
                    PrEP Distribution Setting{' '}
                    <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="select"
                    name="prepDistributionSetting"
                    id="prepDistributionSetting"
                    onChange={handleInputChange}
                    value={objValues.prepDistributionSetting}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""></option>
                    {prepEntryPoint.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.prepDistributionSetting !== '' ? (
                    <span className={classes.error}>
                      {errors.prepDistributionSetting}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>

              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    {`Duration of refill (Day[s])`}{' '}
                    <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="number"
                    name="monthsOfRefill"
                    id="monthsOfRefill"
                    value={objValues.monthsOfRefill}
                    min={0}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  />
                  {errors.monthsOfRefill !== '' ? (
                    <span className={classes.error}>
                      {errors.monthsOfRefill}
                    </span>
                  ) : (
                    ''
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
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
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
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""></option>
                    {familyPlanningMethod.map(value => (
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
                    onKeyDown={e => e.preventDefault()}
                    name="dateOfFamilyPlanning"
                    id="dateOfFamilyPlanning"
                    value={objValues.dateOfFamilyPlanning}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    onChange={handleInputChange}
                    max={moment(new Date()).format('YYYY-MM-DD')}
                    disabled={disabledField}
                  />
                  {errors.dateOfFamilyPlanning !== '' ? (
                    <span className={classes.error}>
                      {errors.dateOfFamilyPlanning}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Was PrEP Administered?</FormLabelName>
                  <span style={{ color: 'red' }}> *</span>
                  <Input
                    type="select"
                    name="wasPrepAdministered"
                    id="wasPrepAdministered"
                    value={objValues.wasPrepAdministered}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Input>
                </FormGroup>
                {errors.wasPrepAdministered !== '' ? (
                  <span className={classes.error}>
                    {errors.wasPrepAdministered}
                  </span>
                ) : (
                  ''
                )}
              </div>

              <br />
              <br />
              {/* <Label
                as="a"
                color="purple"
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}>
                  <input
                    type="checkbox"
                    name="otherPrepgiven"
                    value="Yes"
                    onChange={handleCheckBoxOtherPrepgiven}
                    checked={otherPrepgiven.prepType == 'Yes' ? true : false}
                  />{' '}
                  Other PrEP Given
                </h4>
              </Label>
              <br />
              <br />
              {otherPrepgiven.prepType === 'Yes' && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName for="">PrEP Type</FormLabelName>
                      <Input
                        type="select"
                        name="prepType"
                        id="prepType"
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        // disabled
                        onChange={handlePrepTypeChange}
                        value={objValues.prepType}
                        disabled={disabledField}
                      >
                        <option value=""> Select Prep Type</option>
                        {prepType.map(value => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.prepType !== '' ? (
                        <span className={classes.error}>{errors.prepType}</span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName for="">PrEP Regimen</FormLabelName>
                      <Input
                        type="select"
                        name="regimenId"
                        id="regimenId"
                        onChange={handleInputChange}
                        value={objValues.regimenId}
                        disabled={disabledField}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                      >
                        <option value=""> Select</option>
                        {['update', 'view'].includes(
                          props.activeContent.actionType
                        )
                          ? prepRegimen?.map(value => (
                              <option key={value.id} value={value.id}>
                                {value.regimen}
                              </option>
                            ))
                          : objValues?.visitType ===
                            'PREP_VISIT_TYPE_METHOD_SWITCH'
                          ? filterOutLastRegimen(
                              prepRegimen,
                              props.recentActivities[0]?.regimenId
                            ).map(value => (
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
                      {errors.regimenId !== '' ? (
                        <span className={classes.error}>
                          {errors.regimenId}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                </>
              )} */}
              <br />
              <br />
              <Label
                as="a"
                color="teal"
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}>
                  <input
                    type="checkbox"
                    name="urinalysisTest"
                    value="Yes"
                    onChange={handleCheckBoxUrinalysisTest}
                    checked={
                      urinalysisTest.urinalysisTest == 'Yes' ? true : false
                    }
                  />{' '}
                  Urinalysis Test
                </h4>
              </Label>
              <br />
              <br />
              {urinalysisTest.urinalysisTest === 'Yes' && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>
                        Urinalysis Test Date{' '}
                        <span style={{ color: 'red' }}> *</span>
                      </FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={urinalysisTest.testDate}
                        // defaultValue={objValues.urinalysis?.testDate}
                        onChange={handleInputChangeUrinalysisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        disabled={disabledField}
                      />
                      {errors.testDate !== '' ? (
                        <span className={classes.error}>{errors.testDate}</span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>
                        Urinalysis Test Result{' '}
                        <span style={{ color: 'red' }}> *</span>
                      </FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={urinalysisTest.result}
                        onChange={handleInputChangeUrinalysisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {urineTestResult.map(value => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.result !== '' ? (
                        <span className={classes.error}>{errors.result}</span>
                      ) : (
                        ''
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
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}>
                  <input
                    type="checkbox"
                    name="hepatitisTest"
                    value="Yes"
                    onChange={handleCheckBoxHepatitisTest}
                    checked={
                      hepatitisTest.hepatitisTest === 'Yes' ? true : false
                    }
                  />{' '}
                  Hepatitis Test{' '}
                </h4>
              </Label>
              <br />
              <br />
              {hepatitisTest.hepatitisTest === 'Yes' && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Hepatitis Test Date</FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={hepatitisTest.testDate}
                        onChange={handleInputChangeHepatitisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format('YYYY-MM-DD')}
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
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {hepaTestResult.map(value => (
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
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}>
                  <input
                    type="checkbox"
                    name="syphilisTest"
                    value="Yes"
                    onChange={handleCheckBoxSyphilisTest}
                    checked={syphilisTest.syphilisTest === 'Yes' ? true : false}
                  />{' '}
                  Syphilis Test{' '}
                </h4>
              </Label>
              <br />
              <br />
              {syphilisTest.syphilisTest === 'Yes' && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Syphilis Test Date</FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={syphilisTest.testDate}
                        onChange={handleInputChangeSyphilisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format('YYYY-MM-DD')}
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
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {sphylisTestResult.map(value => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </div>
                  {syphilisTest.result === 'Others' && (
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
                            border: '1px solid #014D88',
                            borderRadius: '0.25rem',
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
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}>
                  <input
                    type="checkbox"
                    name="otherTest"
                    value="Yes"
                    ref={otherTestInputRef}
                    onChange={handleCheckBoxOtherTest}
                    checked={otherTest.length > 0}
                  />
                  Other Test
                </h4>
              </Label>
              <br />
              <br />
              {/* {otherTest.otherTest === 'Yes' && (<> */}
              {otherTest.length > 0 &&
                otherTest.map(eachTest => (
                  <div className="row" key={eachTest.localId}>
                    <div className=" mb-1 col-md-3">
                      <FormGroup>
                        <FormLabelName> Test Name</FormLabelName>
                        <Input
                          type="select"
                          name="otherTestsDone"
                          id="otherTestsDone"
                          data-localid={eachTest.localId}
                          data-field="name"
                          onChange={e =>
                            handleInputChangeOtherTest(e, eachTest.localId)
                          }
                          value={eachTest.otherTestsDone}
                          style={{
                            border: '1px solid #014D88',
                            borderRadius: '0.25rem',
                          }}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {otherTestResult?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </div>

                    {eachTest.name === 'PREP_OTHER_TEST_OTHER_(SPECIFY)' && (
                      <div
                        style={{ display: 'none' }}
                        className=" mb-1 col-md-3"
                      >
                        <FormGroup>
                          <FormLabelName> Other Test Name </FormLabelName>
                          <Input
                            type="text"
                            name="otherTestName"
                            id="otherTestName"
                            data-localid={eachTest.localId}
                            data-field="otherTestName"
                            value={eachTest.otherTestName}
                            onChange={e =>
                              handleInputChangeOtherTest(e, eachTest.localId)
                            }
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                    )}

                    <div className=" mb-1 col-md-3">
                      <FormGroup>
                        <FormLabelName> Test Date</FormLabelName>
                        <Input
                          type="date"
                          onKeyDown={e => e.preventDefault()}
                          name="testDate"
                          id="testDate"
                          data-localid={eachTest.localId}
                          data-field="testDate"
                          value={eachTest.testDate}
                          onChange={e =>
                            handleInputChangeOtherTest(e, eachTest.localId)
                          }
                          style={{
                            border: '1px solid #014D88',
                            borderRadius: '0.25rem',
                          }}
                          disabled={disabledField}
                          min={objValues.encounterDate}
                          max={moment(new Date()).format('YYYY-MM-DD')}
                        />
                      </FormGroup>
                    </div>

                    <div className=" mb-1 col-md-3">
                      <FormGroup>
                        <FormLabelName> Test Result</FormLabelName>
                        <Input
                          type="text"
                          name="result"
                          id="result"
                          data-localid={eachTest.localId}
                          data-field="result"
                          value={eachTest.result}
                          onChange={e =>
                            handleInputChangeOtherTest(e, eachTest.localId)
                          }
                          style={{
                            border: '1px solid #014D88',
                            borderRadius: '0.25rem',
                          }}
                          disabled={disabledField}
                        />
                      </FormGroup>
                    </div>

                    <div className=" mb-1 col-md-3 d-flex align-items-end">
                      <button
                        variant="contained"
                        color="secondary"
                        size="medium"
                        className={`${classes.button} btn btn-danger`}
                        style={{
                          display: 'block',
                          margin: 0,
                          fontSize: '1.2em',
                        }}
                        onClick={() => handleRemoveTest(eachTest.localId)}
                      >
                        <TiTrash />
                      </button>
                    </div>

                    {otherTest.length > 1 && (
                      <Divider
                        component="li"
                        style={{ marginBottom: '10px' }}
                      />
                    )}
                  </div>
                ))}
              {errors.otherTestsDone !== '' ? (
                <span className={classes.error}>{errors.otherTestsDone}</span>
              ) : (
                ''
              )}
              {otherTest.length > 0 && (
                <div>
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={`${classes.button}`}
                    startIcon={<AddIcon />}
                    style={{ backgroundColor: '#014d88' }}
                    onClick={handleCreateNewTest}
                    disabled={saving}
                  >
                    <span style={{ textTransform: 'capitalize' }}>
                      Add more test results
                    </span>
                  </MatButton>
                </div>
              )}

              <br />
              <Label
                as="a"
                color="blue"
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}>NEXT APPOINTMENT DATE </h4>
              </Label>
              <br />
              <br />
              <br />
              <div className="mb-3 col-md-6">
                <FormLabelName>Next Appointment Date</FormLabelName>
                <Input
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="nextAppointment"
                  id="nextAppointment"
                  value={objValues.nextAppointment}
                  onChange={handleInputChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  min={objValues.encounterDate}
                  disabled={disabledField}
                />
                {errors.nextAppointment !== '' ? (
                  <span className={classes.error}>
                    {errors.nextAppointment}
                  </span>
                ) : (
                  ''
                )}
              </div>
              <div className=" mb-3 col-md-6">
                <FormLabelName>Healthcare Worker Signature</FormLabelName>
                <Input
                  name="healthCareWorkerSignature"
                  id="healthCareWorkerSignature"
                  placeholder="Enter signature..."
                  value={objValues.healthCareWorkerSignature}
                  disabled={disabledField}
                  onChange={handleInputChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                />
                {errors.healthCareWorkerSignature !== '' ? (
                  <span className={classes.error}>
                    {errors.healthCareWorkerSignature}
                  </span>
                ) : (
                  ''
                )}
              </div>
            </div>
            <br />
            {!disabledField && (
              <>
                {props.activeContent &&
                props.activeContent.actionType === 'update' ? (
                  <>
                    <MatButton
                      type="submit"
                      variant="contained"
                      color="primary"
                      hidden={disabledField}
                      className={classes.button}
                      startIcon={<SaveIcon />}
                      style={{ backgroundColor: '#014d88' }}
                      onClick={handleSubmit}
                      disabled={saving}
                    >
                      {!saving ? (
                        <span style={{ textTransform: 'capitalize' }}>
                          Update
                        </span>
                      ) : (
                        <span style={{ textTransform: 'capitalize' }}>
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
                      style={{ backgroundColor: '#014d88' }}
                      onClick={handleSubmit}
                      disabled={saving}
                    >
                      {!saving ? (
                        <span style={{ textTransform: 'capitalize' }}>
                          Save
                        </span>
                      ) : (
                        <span style={{ textTransform: 'capitalize' }}>
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
    </div>
  );
};
export default ClinicVisit;

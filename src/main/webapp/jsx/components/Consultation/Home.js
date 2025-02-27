import React, { useState, useEffect, useRef } from 'react';
import { Grid, Segment, Label } from 'semantic-ui-react';
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from 'reactstrap';
import { url as baseUrl, token } from '../../../api';
import { makeStyles, Button as MatButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import Divider from '@mui/material/Divider';
import { TiTrash } from 'react-icons/ti';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import { LiverFunctionTest } from '../PrepServices/PrEPEligibiltyScreeningForm';
import usePrepClinicState from '../../../hooks/usePrepClinicState';
import useStyleForVisitForm from '../../../hooks/useStyleForVisitForm';
import {
  useHivResult,
  usePrepEligibilityObj,
} from '../../../hooks/useApiUtilsForPrepVisit';
import { useEligibilityCheckApi } from '../../../hooks/useEligibilityCheckApi';

export const CleanupWrapper = ({ isVisible, cleanup, children }) => {
  useEffect(() => {
    return () => {
      if (!isVisible) {
        cleanup();
      }
    };
  }, [isVisible, cleanup]);
  return isVisible ? children : null;
};

const ClinicVisit = props => {
  const [errors, setErrors] = useState({});
  const [patientDto, setPatientDto] = useState();
  const [saving, setSaving] = useState(false);
  const [whyAdherenceLevelPoor, setWhyAdherenceLevelPoor] = useState([]);
  const [selectedPopulationType, setSelectedPopulationType] = useState('');
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
    prepNotedSideEffects: [],
    notedSideEffects: '',
    wasPrepAdministered: '',
    otherTestsDone: [],
    personId: props.patientObj.personId,
    pregnant: '',
    prepEnrollmentUuid: '',
    pulse: '',
    referred: '',
    regimenId: '',
    otherRegimenId: '',
    otherPrepGiven: '',
    respiratoryRate: '',
    riskReductionServices: '',
    healthCareWorkerSignature: '',
    stiScreening: '',
    syndromicStiScreening: null,
    syphilis: {},
    systolic: '',
    temperature: '',
    urinalysis: {},
    creatinine: {},
    urinalysisResult: '',
    creatinineResult: '',
    weight: '',
    why: '',
    otherDrugs: '',
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
    urinalysisTest: 'No',
    testDate: '',
    result: '',
  });
  const [creatinineTest, setCreatinineTest] = useState({
    creatinineTest: 'No',
    testDate: '',
    result: '',
  });
  const [syphilisTest, setSyphilisTest] = useState({
    syphilisTest: 'No',
    testDate: '',
    result: '',
    others: '',
  });
  const [hepatitisTest, setHepatitisTest] = useState({
    hepatitisTest: 'No',
    testDate: '',
    result: '',
  });
  const {
    formik,
    disabledField,
    setDisabledField,
    adherenceLevel,
    setAdherenceLevel,
    sti,
    setSti,
    prepStatus,
    setPrepStatus,
    prepSideEffect,
    setPrepSideEffect,
    htsResult,
    setHtsResult,
    prepRegimen,
    setPrepRegimen,
    labTestOptions,
    setLabTestOptions,
    urineTestResult,
    setUrineTestResult,
    creatinineTestResult,
    setCreatinineTestResult,
    otherTestResult,
    setOtherTestResult,
    sphylisTestResult,
    setSphylisTestResult,
    hepaTestResult,
    setHepaTestResult,
    familyPlanningMethod,
    setFamilyPlanningMethod,
    pregnant,
    setPregnant,
    prepEntryPoint,
    setPrepEntryPoints,
    prepType,
    setPrepType,
    populationType,
    setPopulationType,
    visitType,
    setVisitType,
    latestFromEligibility,
    setLatestFromEligibility,
    hivTestValue,
    setHivTestValue,
    hivTestResultDate,
    setHivTestResultDate,
    reasonForSwitchOptions,
    setReasonForSwitchOptions,
    prepRiskReductionPlan,
    setPrepRiskReductionPlan,
    recentActivities,
    setRecentActivities,
    liverFunctionTestResult,
    setLiverFunctionTestResult,
  } = usePrepClinicState(props);
  const { isEligibleForCabLa, setIsEligibleForCabLa } = useEligibilityCheckApi(
    baseUrl,
    props.patientObj.personId,
    latestFromEligibility?.visitDate,
    token
  );
  console.log(
    'params: ',
    baseUrl,
    props.patientObj.personId,
    latestFromEligibility?.visitDate,
    token
  );

  const [otherTest, setOtherTest] = useState([]);
  const { data, setData } = useHivResult(props.patientObj.personId);

  const classes = useStyleForVisitForm();
  let temp = { ...errors };
  let testsOptions = [];

  function sortByVisitDateDescending(data) {
    return data.sort((a, b) => {
      const dateA = new Date(a.visitDate);
      const dateB = new Date(b.visitDate);
      return dateB - dateA;
    });
  }
  useEffect(
    () => console.log('isEligibleForCabLa: ', isEligibleForCabLa),
    [isEligibleForCabLa]
  );
  const [eligibilityVisitDateSync, setEligibilityVisitDateSync] =
    useState(false);

  const checkDateMismatch = (visitDate, eligibilityDate) => {
    if (visitDate !== eligibilityDate) {
      toast.error(
        '⚠ Please enter a date that matches the latest eligibility date!'
      );
    } else {
      toast.success(
        'The visit date matches the latest eligibility date. Great job! 👍'
      );
    }
  };

  useEffect(() => {
    if (!eligibilityVisitDateSync) {
      setObjValues(prevValues => ({
        ...prevValues,
        populationType: '',
        visitType: '',
        pregnant: '',
        liverFunctionTestResults: [],
        dateLiverFunctionTestResults: '',
      }));
      setSelectedPopulationType('');
    }
  }, [eligibilityVisitDateSync]);

  const handleInputChangeUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeCreatinineTest = e => {
    setErrors({
      ...errors,
      creatinineResult: '',
      creatinineTestDate: '',
    });
    setCreatinineTest({ ...creatinineTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeOtherTest = (e, localId) => {
    let temp = [...otherTest];
    let index = temp.findIndex(x => Number(x.localId) === Number(localId));
    temp[index][e.target.name] = e.target.value;
    setOtherTest(temp);
  };
  const handleRemoveTest = localId => {
    setOtherTest(prev => prev?.filter(test => test.localId !== localId));
  };
  const handleInputChangeHepatitisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
  };
  const handleInputChangeSyphilisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    if (e.target.name === 'result' && e.target.value !== 'Others') {
      syphilisTest.others = '';
      setSyphilisTest({ ...syphilisTest, ['others']: '' });
      setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    }
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
  };
  const handleCheckBoxUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (urinalysisTest?.urinalysisTest === 'Yes') {
      setUrinalysisTest({ urinalysisTest: 'No', testDate: '', result: '' });
    } else {
      setUrinalysisTest({ ...urinalysisTest, urinalysisTest: 'Yes' });
    }
  };

  const handleCheckBoxCreatinineTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (creatinineTest?.creatinineTest === 'Yes') {
      setCreatinineTest({ creatinineTest: 'No', testDate: '', result: '' });
    } else {
      setCreatinineTest({ ...creatinineTest, creatinineTest: 'Yes' });
    }
  };

  const handleCheckBoxSyphilisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (syphilisTest?.syphilisTest === 'Yes') {
      setSyphilisTest({
        syphilisTest: 'No',
        testDate: '',
        result: '',
        others: '',
      });
    } else {
      setSyphilisTest({ ...syphilisTest, syphilisTest: 'Yes' });
    }
  };

  const handleCheckBoxHepatitisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (hepatitisTest?.hepatitisTest === 'Yes') {
      setHepatitisTest({ hepatitisTest: 'No', testDate: '', result: '' });
    } else {
      setHepatitisTest({ ...hepatitisTest, hepatitisTest: 'Yes' });
    }
  };

  const handleCheckBoxOtherTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (otherTest.length > 0) {
      setOtherTest([]);
    } else {
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
    }
  };

  const otherTestInputRef = useRef();
  const handleInputValueCheckHeight = e => {
    if (
      e.target.name === 'height' &&
      (e.target.value < 48.26 || e.target.value > 216.408)
    ) {
      const message =
        '⚠ Height cannot be greater than 216.408 and less than 48.26';
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
        '⚠ Body weight must not be greater than 150 and less than 3';
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
        '⚠ Blood Pressure systolic must not be greater than 240 and less than 90';
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
        '⚠ Blood Pressure diastolic must not be greater than 140 and less than 60';
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
      const message = '⚠ Pulse must not be greater than 120 and less than 40';
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
        '⚠ Respiratory Rate must not be greater than 70 and less than 10';
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
        '⚠ Temperature must not be greater than 47 and less than 35';
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        temperature: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, temperature: '' });
    }
  };

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
      prepNotedSideEffects: '',
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
      creatinine: {},
      creatinineResult: '',
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
    setCreatinineTest({});
    setSyphilisTest({});
    setHepatitisTest({});
    setOtherTest([]);
  };
  const isFemale = () => {
    return props.patientObj.gender.toLowerCase() === 'female';
  };
  const validate = () => {
    temp.lastHts = hivTestValue
      ? ''
      : '⚠ Atleast, 1 HIV test result is required';
    temp.monthsOfRefill = objValues.monthsOfRefill
      ? ''
      : '⚠ This field is required';
    temp.prepType = objValues.prepType ? '' : '⚠ This field is required';
    temp.wasPrepAdministered = objValues.wasPrepAdministered
      ? ''
      : '⚠ This field is required';
    hasPrepEligibility(temp.encounterDate, props.encounters);
    temp.encounterDate = objValues.encounterDate
      ? ''
      : '⚠ This field is required';
    if (isFemale()) {
      temp.pregnant = objValues.pregnant ? '' : '⚠ This field is required';
    }
    temp.nextAppointment = objValues.nextAppointment
      ? ''
      : '⚠ This field is required';

    temp.height = objValues.height ? '' : '⚠ This field is required';
    if (objValues.prepType === 'PREP_TYPE_INJECTIBLES') {
      temp.otherPrepGiven = objValues.otherPrepGiven
        ? ''
        : '⚠ This field is required';
    }
    temp.weight = objValues.weight ? '' : '⚠ This field is required';
    temp.regimenId = objValues.regimenId ? '' : '⚠ This field is required';
    temp.prepDistributionSetting = objValues.prepDistributionSetting
      ? ''
      : '⚠ This field is required';
    temp.populationType = objValues.populationType
      ? ''
      : '⚠ This field is required';
    temp.visitType = objValues.visitType ? '' : '⚠ This field is required';

    if (objValues.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH') {
      temp.reasonForSwitch = objValues.reasonForSwitch
        ? ''
        : '⚠ This field is required';
    } else {
      temp.reasonForSwitch = '';
    }

    if (
      urinalysisTest?.urinalysisTest === 'Yes' &&
      urinalysisTest?.testDate === ''
    ) {
      temp.urinalysisTestDate = '⚠ This field is required';
    } else {
      temp.urinalysisTestDate = '';
    }

    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x === '');
  };
  const handleSubmit = e => {
    e.preventDefault();
    updatePreviousPrepStatusAndSubmit(
      props.patientObj?.personUuid,
      props.patientObj?.prepStatus
    );
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
          activity.name === 'Prep Eligibility' &&
          areDatesSame(new Date(activity.date), new Date(targetDate))
        ) {
          return true;
        }
      }
    }
    return false;
  }
  const getHtsResult = () => {
    if (htsResult.length === 0) {
      toast.error(
        '⚠ No HTS record found. Atleast, 1 test result is required to proceed'
      );
    } else if (htsResult.length > 0) {
      toast.success('👍 HTS record found. You may proceed ✔');
    }
    formik.setValues(prev => ({
      ...prev,
      // hivTestResult,
      hivTestResultDate,
    }));
  };
  useEffect(() => {
    getHtsResult();
    console.log('values: ', formik.values);
  }, [htsResult]);

  const filterOutLastRegimen = (codeSet, lastRegimenId) =>
    codeSet?.filter(regimen => regimen.id !== lastRegimenId);

  useEffect(() => {
    if (
      props.activeContent.actionType === '' ||
      props.activeContent.actionType === null
    ) {
      emptyObjValues();
    }
  }, [props.activeContent.actionType]);

  useEffect(() => {
    if (
      objValues.populationType !== null &&
      objValues.populationType !== undefined
    ) {
      const autoPopulate = populationType?.find(
        type => type.code === objValues.populationType
      );
      setSelectedPopulationType(autoPopulate ? autoPopulate.display : '');
    }
  }, [objValues.populationType]);

  useEffect(() => {
    if (eligibilityVisitDateSync && latestFromEligibility !== null) {
      const autoPopulate = populationType?.find(
        type => type.code === latestFromEligibility?.populationType
      );
      setObjValues(prevValues => ({
        ...prevValues,
        populationType: latestFromEligibility?.populationType || '',
        visitType: latestFromEligibility?.visitType || '',
        monthsOfRefill:
          visitTypeDurationMapping[`${latestFromEligibility?.visitType}`] || '',
        reasonForSwitch: latestFromEligibility?.reasonForSwitch || '',
        pregnant: latestFromEligibility?.pregnancyStatus || '',
      }));

      setSelectedPopulationType(autoPopulate ? autoPopulate.display : '');
    }
  }, [latestFromEligibility, eligibilityVisitDateSync, populationType]);

  useEffect(() => {
    const updateTest = (testType, setTestFunction) => {
      const testData = objValues[testType];
      if (
        testData?.testDate &&
        testData?.result &&
        testData?.[`${testType}Test`]
      ) {
        setTestFunction({
          ...testData,
          testDate: testData.testDate,
          result: testData.result,
          [`${testType}Test`]: testData[`${testType}Test`],
        });
      }
    };

    updateTest('urinalysis', setUrinalysisTest);
    updateTest('creatinine', setCreatinineTest);
    updateTest('syphilis', setSyphilisTest);
    updateTest('hepatitis', setHepatitisTest);
  }, [objValues]);

  const { data: prepEligibilityObj, setData: setPrepEligibilityObj } =
    usePrepEligibilityObj(props?.patientObj?.personId);

  useEffect(async () => {
    if (
      props.activeContent.id &&
      props.activeContent.id !== '' &&
      props.activeContent.id !== null
    ) {
      setDisabledField(props.activeContent.actionType === 'view');
    }
  }, [props.activeContent]);

  const handleLftInputChange = event => {
    const { name, value } = event.target;
    setObjValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (eligibilityVisitDateSync && latestFromEligibility) {
      setObjValues(prevValues => ({
        ...prevValues,
        liverFunctionTestResults:
          latestFromEligibility.liverFunctionTestResults,
        dateLiverFunctionTestResults:
          latestFromEligibility.dateLiverFunctionTestResults || '',
      }));
    }
  }, [latestFromEligibility, eligibilityVisitDateSync]);

  function areDatesInSync(date1, date2) {
    return date1 === date2;
  }
  const getOptions = () => {
    switch (objValues.otherPrepType) {
      case 'PREP_TYPE_ORAL':
        return <option value="1">TDF(300mg)+3TC(300mg)</option>;
      case 'PREP_TYPE_INJECTIBLES':
        return <option value="2">IM CAB-LA(600mg/3mL)</option>;
      case 'PREP_TYPE_ED_PREP':
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

  const [notedSideEffects, setNotedSideEffects] = useState([]);
  const handleNotedSideEffectsChange = selected => {
    setNotedSideEffects(selected);
  };

  const visitTypeDurationMapping = {
    PREP_VISIT_TYPE_DISCONTINUATION: null,
    'PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP': null,
    PREP_VISIT_TYPE_INITIATION: 30,
    PREP_VISIT_TYPE_METHOD_SWITCH: null,
    PREP_VISIT_TYPE_NO_PREP_PROVIDED: null,
    'PREP_VISIT_TYPE_REFILL_RE-INJECTION': 60,
    PREP_VISIT_TYPE_RESTART: 30,
    PREP_VISIT_TYPE_SECOND_INITIATION: 60,
    PREP_VISIT_TYPE_TRANSFER_IN: null,
  };

  function addDaysToDate(dateString, daysToAdd) {
    const date = new Date(dateString);
    if (
      isNaN(date.getTime()) ||
      typeof daysToAdd !== 'number' ||
      isNaN(daysToAdd)
    ) {
      return '';
    }
    date.setDate(date.getDate() + daysToAdd);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    let nextAppointment = addDaysToDate(
      objValues.encounterDate,
      objValues.monthsOfRefill
    );
    setObjValues(prev => ({ ...prev, nextAppointment }));
  }, [objValues.encounterDate, objValues.monthsOfRefill]);

  async function updatePreviousPrepStatusAndSubmit(personUuid, previousStatus) {
    if (validate()) {
      setSaving(true);
      objValues.duration = objValues.monthsOfRefill;
      objValues.hivTestResultDate = hivTestResultDate;
      objValues.hivTestResult = hivTestValue;
      objValues.syphilis = syphilisTest;
      objValues.hepatitis = hepatitisTest;
      objValues.urinalysis = urinalysisTest;
      objValues.creatinine = creatinineTest;
      objValues.otherTestsDone = otherTest;
      objValues.prepEnrollmentUuid = patientDto.uuid;
      objValues.prepNotedSideEffects = notedSideEffects;
      objValues.notedSideEffects = '';
      objValues.previousPrepStatus = props.patientObj?.prepStatus;

      if (props.activeContent && props.activeContent.actionType === 'update') {
        try {
          const updateResponse = await axios.put(
            `${baseUrl}prep-clinic/${props.activeContent.id}`,
            objValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSaving(false);
          toast.success('Clinic visit updated successfully! ✔', {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          props.setActiveContent({
            ...props.activeContent,
            route: 'consultation',
            activeTab: 'history',
            actionType: 'view',
          });
        } catch (error) {
          handleError(error);
        }
      } else {
        try {
          const postResponse = await axios.post(
            `${baseUrl}prep/clinic-visit`,
            objValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSaving(false);
          emptyObjValues();
          toast.success('Clinic Visit saved successfully! ✔', {
            position: toast.POSITION.BOTTOM_CENTER,
          });
          props.setActiveContent({
            ...props.activeContent,
            route: 'consultation',
            activeTab: 'history',
            actionType: 'view',
          });
        } catch (error) {
          handleError(error);
        }
      }
    } else {
    }
  }

  function handleError(error) {
    setSaving(false);
    if (error.response && error.response.data) {
      let errorMessage =
        error.response.data.apierror &&
        error.response.data.apierror.message !== ''
          ? error.response.data.apierror.message
          : '❌ Something went wrong. Please try again';
      toast.error(errorMessage, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    } else {
      toast.error('Something went wrong ❌ please try again...', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  }
  useEffect(() => {
    formik.setFieldValue('prepNotedSideEffects', notedSideEffects);
  }, [notedSideEffects]);
  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      creatinine: creatinineTest,
      creatinineResult: creatinineTest,
    }));
  }, [creatinineTest]);

  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      urinalysis: urinalysisTest,
      urinalysisResult: urinalysisTest,
    }));
  }, [urinalysisTest]);

  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      hepatitis: hepatitisTest,
      hepatitisTestTestResult: hepatitisTest,
    }));
  }, [hepatitisTest]);

  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      syphilis: syphilisTest,
      syphilisTestTestResult: syphilisTest,
    }));
  }, [syphilisTest]);
  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      otherTestsDone: otherTest,
    }));
  }, [otherTest]);

  const checkEligibleForCabLa = currentDate => {
    if (currentDate) {
      axios
        .get(
          `${baseUrl}prep-clinic/checkEnableCab/${props.patientObj.personId}/${currentDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(response => {
          console.log('res: ', response.data, props.patientObj.personId);
          return response?.data;
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
        setOtherTest(response?.data?.otherTestsDone);
        setObjValues(data);
      })
      .catch(error => {});
  };

  const getPatientDtoObj = () => {
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

  return (
    <div className={`${classes.root} container-fluid`}>
      <div className="row">
        <div className="col-12">
          <h2 className="p-2">Clinic Follow-up Visit</h2>
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
                    value={formik.values.encounterDate}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    onChange={formik.handleChange}
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
                        onChange={formik.handleChange}
                        min="40"
                        max="120"
                        value={formik.values.pulse}
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
                        onChange={formik.handleChange}
                        min="10"
                        max="70"
                        value={formik.values.respiratoryRate}
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
                        onChange={formik.handleChange}
                        min="35"
                        max="47"
                        value={formik.values.temperature}
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
                        onChange={formik.handleChange}
                        min="3"
                        max="150"
                        value={formik.values.weight}
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
                        onChange={formik.handleChange}
                        value={formik.values.height}
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
                        onChange={formik.handleChange}
                        value={formik.values.systolic}
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
                        onChange={formik.handleChange}
                        value={formik.values.diastolic}
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
                        onChange={formik.handleChange}
                        value={formik.values.pregnant}
                        disabled
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                      >
                        <option value="">Select Pregnancy Status</option>
                        {pregnant?.map(value => (
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
                    </FormLabelName>
                    <LiverFunctionTest
                      objValues={objValues}
                      handleInputChange={handleLftInputChange}
                      liverFunctionTestResult={liverFunctionTestResult}
                      disabledField={true}
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
                    </FormLabelName>
                    <Input
                      className="form-control"
                      type="date"
                      onKeyDown={e => e.preventDefault()}
                      name="dateLiverFunctionTestResults"
                      id="dateLiverFunctionTestResults"
                      max={moment(new Date()).format('YYYY-MM-DD')}
                      value={formik.values.dateLiverFunctionTestResults}
                      onChange={formik.handleChange}
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
                  <FormLabelName>Noted Side Effects</FormLabelName>
                  <DualListBox
                    options={prepSideEffect?.map(effect => ({
                      value: effect.code,
                      label: effect.display,
                    }))}
                    selected={notedSideEffects}
                    onChange={handleNotedSideEffectsChange}
                    disabled={disabledField}
                  />
                  {errors.notedSideEffects !== '' ? (
                    <span className={classes.error}>
                      {errors.notedSideEffects}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>STI Screening</FormLabelName>
                  <Input
                    type="select"
                    name="stiScreening"
                    id="stiScreening"
                    value={formik.values.stiScreening}
                    onChange={formik.handleChange}
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
                      value={formik.values.syndromicStiScreening}
                      onChange={formik.handleChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {sti?.map(value => (
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
                    value={formik.values.riskReductionServices}
                    onChange={formik.handleChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option key={100} value="">
                      Select
                    </option>
                    {prepRiskReductionPlan?.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>Level of Adherence</FormLabelName>
                  <Input
                    type="select"
                    name="adherenceLevel"
                    id="adherenceLevel"
                    value={formik.values.adherenceLevel}
                    onChange={formik.handleChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>

                    {adherenceLevel?.map(value => (
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
                      value={formik.values.whyAdherenceLevelPoor}
                      onChange={formik.handleChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>

                      {whyAdherenceLevelPoor?.map(value => (
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
                    onChange={formik.handleChange}
                    value={formik.values.populationType}
                    disabled
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
                    {!populationType?.find(
                      pType => pType.display === 'GenPop'
                    ) && (
                      <option value="POPULATION_TYPE_GEN_POP">GenPop</option>
                    )}
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
                    onChange={formik.handleChange}
                    value={formik.values.visitType}
                    disabled
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""> Select Visit Type</option>
                    {visitType?.map(value => (
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
                      value={formik.values.reasonForSwitch}
                      onChange={formik.handleChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled
                    >
                      <option value="">Select</option>

                      {reasonForSwitchOptions?.map(value => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
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
                  <FormLabelName>Was PrEP Administered?</FormLabelName>
                  <span style={{ color: 'red' }}> *</span>
                  <Input
                    type="select"
                    name="wasPrepAdministered"
                    id="wasPrepAdministered"
                    value={formik.values.wasPrepAdministered}
                    onChange={formik.handleChange}
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
                    onChange={formik.handleChange}
                    value={formik.values.prepType}
                    disabled={disabledField}
                  >
                    <option value=""> Select PrEP Type</option>
                    {prepType?.map(value => (
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
                    onChange={formik.handleChange}
                    value={formik.values.regimenId}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""> Select</option>
                    {prepRegimen?.map(value => (
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
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName>
                    {`Duration of refill (days)`}{' '}
                    <span style={{ color: 'red' }}> *</span>
                  </FormLabelName>
                  <Input
                    type="number"
                    name="monthsOfRefill"
                    id="monthsOfRefill"
                    value={formik.values.monthsOfRefill}
                    min={0}
                    onChange={formik.handleChange}
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
              {objValues.prepType && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <>
                      <FormGroup>
                        <FormLabelName>Other PrEP given</FormLabelName>
                        <span style={{ color: 'red' }}> *</span>
                        <Input
                          type="select"
                          name="otherPrepGiven"
                          id="otherPrepGiven"
                          value={formik.values.otherPrepGiven}
                          onChange={formik.handleChange}
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
                      {errors.otherPrepGiven !== '' ? (
                        <span className={classes.error}>
                          {errors.otherPrepGiven}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  </div>
                  {objValues.otherPrepGiven === 'true' && (
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
                            onChange={formik.handleChange}
                            value={formik.values.otherPrepType}
                            disabled={disabledField}
                          >
                            <option value=""> Select Prep Type</option>
                            {prepType
                              ?.filter(
                                (each, index) =>
                                  each.code !== 'PREP_TYPE_ED_PREP'
                              )
                              ?.filter(
                                (each, index) =>
                                  each.code !== objValues.prepType
                              )
                              ?.map(value => (
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
                            onChange={formik.handleChange}
                            value={formik.values.otherRegimenId}
                            disabled={disabledField}
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                          >
                            <option value="">Select</option>
                            {getOptions()}
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
                    onChange={formik.handleChange}
                    value={formik.values.prepDistributionSetting}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""></option>
                    {prepEntryPoint?.map(value => (
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
                  <FormLabelName>Other Drugs</FormLabelName>
                  <Input
                    type="text"
                    name="otherDrugs"
                    id="otherDrugs"
                    value={formik.values.otherDrugs}
                    onChange={formik.handleChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName for="">Family Planning</FormLabelName>
                  <Input
                    type="select"
                    name="familyPlanning"
                    id="familyPlanning"
                    onChange={formik.handleChange}
                    value={formik.values.familyPlanning}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value=""></option>
                    {familyPlanningMethod?.map(value => (
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
                    value={formik.values.dateOfFamilyPlanning}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    onChange={formik.handleChange}
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
                    name="creatinineTest"
                    value="Yes"
                    onChange={handleCheckBoxCreatinineTest}
                    checked={creatinineTest.creatinineTest === 'Yes'}
                  />{' '}
                  Creatinine Test
                </h4>
              </Label>
              <br />
              <br />
              {creatinineTest.creatinineTest === 'Yes' && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Creatinine Test Date </FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={creatinineTest.testDate}
                        onChange={handleInputChangeCreatinineTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        disabled={disabledField}
                      />
                      {errors.creatinineTestDate !== '' ? (
                        <span className={classes.error}>
                          {errors.creatinineTestDate}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Creatinine Test Result </FormLabelName>
                      <Input
                        type="text"
                        name="result"
                        id="result"
                        placeholder="Enter test result..."
                        value={creatinineTest.result}
                        onChange={handleInputChangeCreatinineTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      ></Input>
                      {errors.creatinineResult !== '' ? (
                        <span className={classes.error}>
                          {errors.creatinineResult}
                        </span>
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
                    checked={urinalysisTest?.urinalysisTest === 'Yes'}
                  />{' '}
                  Urinalysis Test
                </h4>
              </Label>
              <br />
              <br />
              {urinalysisTest?.urinalysisTest === 'Yes' && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Urinalysis Test Date </FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={urinalysisTest?.testDate}
                        onChange={handleInputChangeUrinalysisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        min={objValues.encounterDate}
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        disabled={disabledField}
                      />
                      {errors.urinalysisTestDate !== '' ? (
                        <span className={classes.error}>
                          {errors.urinalysisTestDate}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Urinalysis Test Result </FormLabelName>
                      <Input
                        type="select"
                        name="result"
                        id="result"
                        value={urinalysisTest?.result}
                        onChange={handleInputChangeUrinalysisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {urineTestResult?.map(value => (
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
                    checked={hepatitisTest.hepatitisTest === 'Yes'}
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
                        {hepaTestResult?.map(value => (
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
                    checked={syphilisTest?.syphilisTest === 'Yes'}
                  />{' '}
                  Syphilis Test{' '}
                </h4>
              </Label>
              <br />
              <br />
              {syphilisTest?.syphilisTest === 'Yes' && (
                <>
                  <div className=" mb-3 col-md-6">
                    <FormGroup>
                      <FormLabelName>Syphilis Test Date</FormLabelName>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="testDate"
                        id="testDate"
                        value={syphilisTest?.testDate}
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
                        value={syphilisTest?.result}
                        onChange={handleInputChangeSyphilisTest}
                        style={{
                          border: '1px solid #014D88',
                          borderRadius: '0.25rem',
                        }}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {sphylisTestResult?.map(value => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </div>
                  {syphilisTest?.result === 'Others' && (
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
                  />{' '}
                  Other Test{' '}
                </h4>
              </Label>
              <br />
              <br />
              {otherTest.length > 0 &&
                otherTest?.map(eachTest => (
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
                        disabled={disabledField}
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
                <div className="p-2">
                  <MatButton
                    type="button"
                    variant="contained"
                    color="primary"
                    className={`${classes.button}`}
                    startIcon={<AddIcon />}
                    style={{ backgroundColor: '#014d88' }}
                    onClick={handleCreateNewTest}
                    disabled={saving || disabledField}
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
                <h4 style={{ color: '#fff' }}>NEXT APPOINTMENT DATE</h4>
              </Label>
              <br />
              <br />
              <br />
              <div className="mb-3 col-md-6">
                <FormLabelName>
                  Next Appointment Date <span style={{ color: 'red' }}> *</span>
                </FormLabelName>
                <Input
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="nextAppointment"
                  id="nextAppointment"
                  value={formik.values.nextAppointment}
                  onChange={formik.handleChange}
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
                <FormLabelName>Healthcare Worker Signature </FormLabelName>

                <Input
                  name="healthCareWorkerSignature"
                  id="healthCareWorkerSignature"
                  placeholder="Enter signature..."
                  value={formik.values.healthCareWorkerSignature}
                  disabled={disabledField}
                  onChange={formik.handleChange}
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
              <Label
                as="a"
                color="teal"
                style={{ width: '106%', height: '35px' }}
                ribbon
              >
                <h4 style={{ color: '#fff' }}></h4>
              </Label>
              <br />
              <br />
              <br />
              <div className=" mb-3 col-md-8">
                <FormLabelName>Comment</FormLabelName>
                <Input
                  type="textarea"
                  name="comment"
                  id="comment"
                  placeholder="Enter comment..."
                  value={formik.values.comment}
                  disabled={disabledField}
                  onChange={formik.handleChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                    height: '10em',
                  }}
                />
                {errors.comment !== '' ? (
                  <span className={classes.error}>{errors.comment}</span>
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
                  <div>
                    {' '}
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
                  </div>
                ) : (
                  <div>
                    {' '}
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
                  </div>
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

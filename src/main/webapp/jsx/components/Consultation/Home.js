import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Grid, Segment, Label } from 'semantic-ui-react';
import { FormGroup, Label as FormLabelName, Input } from 'reactstrap';
import { url as baseUrl, token } from '../../../api';
import { Button as MatButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@mui/icons-material/Add';
import moment from 'moment';
import { toast } from 'react-toastify';
import Divider from '@mui/material/Divider';
import { TiTrash } from 'react-icons/ti';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import { LiverFunctionTest } from '../PrepServices/PrEPEligibiltyScreeningForm';
import usePrepClinicState from '../../../hooks/usePrepClinicState';
import useStyleForVisitForm from '../../../hooks/useStyleForVisitForm';
import { useHivResult } from '../../../hooks/useApiUtilsForPrepVisit';
import { useEligibilityCheckApi } from '../../../hooks/useEligibilityCheckApi';
import { FormikProvider } from 'formik';
import useSetPrepVisitAutopopulatedValues from '../../../hooks/useSetPrepVisitAutopopulatedValues';
import useHtsResultCheck from '../../../hooks/useHtsResultCheck';
import { useSyphilisTestInputChange } from '../../../hooks/useSyphilisTestInputChange';
import { useHandleHeightInputValueChange } from '../../../hooks/useHandleHeightInputValueCheck';
import { useHandleCreatinineTestInputChange } from '../../../hooks/useHandleCreatinineTestInputChange';
import { useHandleCheckboxUrinalysisTest } from '../../../hooks/useHandleCheckboxUrinalysisTest';
import { useHandleCheckboxCreatinineTest } from '../../../hooks/useHandleCheckboxCreatinineTest';
import { useHandleCheckboxSyphilisTest } from '../../../hooks/handleCheckboxSyphilisTest';
import { useHandleCheckboxHepatitisTest } from '../../../hooks/useHandleCheckboxHepatitisTest';
import { useHandleCheckboxOtherTest } from '../../../hooks/useHandleCheckboxOtherTest';
import { useHandleWeightInputValueCheck } from '../../../hooks/useHandleWeightInputValueCheck';
import { useHandleSystolicInputValueCheck } from '../../../hooks/useHandleSystolicInputValueCheck';
import { useHandleDiastolicInputValueCheck } from '../../../hooks/useHandleDiastolicInputValueCheck';
import { useHandlePulseInputValueCheck } from '../../../hooks/useHandlePulseInputValueCheck';
import { useHandleRespiratoryRateInputValueCheck } from '../../../hooks/useHandleRespiratoryRateInputValueCheck';
import { useHandleTemperatureInputValueCheck } from '../../../hooks/useHandleTemperatureInputValueCheck';
import useCheckDateMismatch from '../../../hooks/useCheckDateMismatch';
import useGetNextAppDate from '../../../hooks/vistUtils/useGetNextAppDate';
import VitalSigns from './VitalSigns';
import ConditionalFieldWrapper from './ConditionalFieldWrapper/ConditionalFieldWrapper';
import TestResultEntryField from './CreatinineTest/TestResultEntryField';

const ClinicVisit = props => {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [whyAdherenceLevelPoor, setWhyAdherenceLevelPoor] = useState([]);
  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: '',
    diastolic: '',
    height: '',
    systolic: '',
    pulse: '',
    temperature: '',
    respiratoryRate: '',
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
    pregnancyStatus,
    setPregnancyStatus,
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

  const [otherTest, setOtherTest] = useState([]);
  const { data: latestHtsResult, setData } = useHivResult(
    props.patientObj.personId
  );
  const { isHtsFound } = useHtsResultCheck();

  useEffect(() => {
    if (latestHtsResult?.hivTestValue) isHtsFound(latestHtsResult.hivTestValue);
  }, [latestHtsResult]);

  const classes = useStyleForVisitForm();

  const [isInitialValues, setIsInitialValues] = useState(1);
  const [localEncounterDate, setLocalEncounterDate] = useState('');
  const { checkDateMismatch } = useCheckDateMismatch();

  useEffect(
    () => setLocalEncounterDate(formik.values.encounterDate),
    [formik.values.encounterDate]
  );

  useSetPrepVisitAutopopulatedValues(
    formik,
    localEncounterDate,
    latestFromEligibility,
    latestHtsResult,
    isInitialValues
  );

  const { handleSyphilisTestInputChange } = useSyphilisTestInputChange(
    setSyphilisTest,
    setErrors,
    syphilisTest,
    errors
  );

  const handleInputChangeUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };

  const { handleCreatinineTestInputChange } =
    useHandleCreatinineTestInputChange(
      setErrors,
      setCreatinineTest,
      creatinineTest,
      errors
    );

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

  const { handleCheckBoxUrinalysisTest } = useHandleCheckboxUrinalysisTest(
    setErrors,
    setUrinalysisTest,
    urinalysisTest,
    errors
  );

  const { handleCheckboxCreatinineTest } = useHandleCheckboxCreatinineTest(
    setErrors,
    setCreatinineTest,
    creatinineTest,
    errors
  );

  const { handleCheckboxSyphilisTest } = useHandleCheckboxSyphilisTest(
    setErrors,
    setSyphilisTest,
    syphilisTest,
    errors
  );
  const { handleCheckboxUrinalysisTest } = useHandleCheckboxUrinalysisTest(
    setErrors,
    setUrinalysisTest,
    urinalysisTest,
    errors
  );
  const { handleCheckboxHepatitisTest } = useHandleCheckboxHepatitisTest(
    setErrors,
    setHepatitisTest,
    hepatitisTest,
    errors
  );

  const { handleCheckboxOtherTest } = useHandleCheckboxOtherTest(
    setErrors,
    setOtherTest,
    otherTest,
    formik.values,
    errors
  );

  const otherTestInputRef = useRef();

  const { handleHeightInputValueCheck } = useHandleHeightInputValueChange(
    setVitalClinicalSupport,
    vitalClinicalSupport
  );

  const { handleWeightInputValueCheck } = useHandleWeightInputValueCheck(
    setVitalClinicalSupport,
    vitalClinicalSupport
  );

  const { handleSystolicInputValueCheck } = useHandleSystolicInputValueCheck(
    setVitalClinicalSupport,
    vitalClinicalSupport
  );

  const { handleDiastolicInputValueCheck } = useHandleDiastolicInputValueCheck(
    setVitalClinicalSupport,
    vitalClinicalSupport
  );

  const { handlePulseInputValueCheck } = useHandlePulseInputValueCheck(
    setVitalClinicalSupport,
    vitalClinicalSupport
  );

  const { handleRespiratoryRateInputValueCheck } =
    useHandleRespiratoryRateInputValueCheck(
      setVitalClinicalSupport,
      vitalClinicalSupport
    );

  const { handleTemperatureInputValueCheck } =
    useHandleTemperatureInputValueCheck(
      setVitalClinicalSupport,
      vitalClinicalSupport
    );

  const isFemale = () => {
    return props.patientObj.gender.toLowerCase() === 'female';
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

  useEffect(() => {
    if (
      props.activeContent.actionType === '' ||
      props.activeContent.actionType === null
    ) {
      // formik.resetForm();
    }
  }, [props.activeContent.actionType]);

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
    formik.setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const [notedSideEffects, setNotedSideEffects] = useState([]);

  const handleNotedSideEffectsChange = selected => {
    setNotedSideEffects(selected);
  };

  const { getNextAppDate } = useGetNextAppDate();
  useEffect(() => {
    let nextAppointment = getNextAppDate(
      formik.values.encounterDate,
      formik.values.monthsOfRefill
    );
    formik.setValues(prev => ({ ...prev, nextAppointment }));
  }, [formik.values.encounterDate, formik.values.monthsOfRefill]);

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

  const eligibleRegimens = useMemo(() => {
    return isEligibleForCabLa || props.activeContent.actionType === 'update'
      ? [...prepRegimen]
      : [...prepRegimen].filter(({ id }) => id !== 2);
  }, [isEligibleForCabLa, props.activeContent.actionType, prepRegimen]);
  const eligiblePrepTypes = useMemo(
    () =>
      isEligibleForCabLa || props.activeContent.actionType === 'update'
        ? [...prepType]
        : [...prepType].filter(({ id }) => ![1373, 1726].includes(id)),
    [isEligibleForCabLa, props.activeContent.actionType, prepType]
  );

  const isMatchedDate = useMemo(() => {
    if (!localEncounterDate) {
      return checkDateMismatch(
        localEncounterDate || '',
        latestFromEligibility?.visitDate || '',
        isInitialValues
      );
    }
    return false;
  }, [localEncounterDate]);

  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      hivTestValue: latestHtsResult?.hivTestValue || '',
      hivTestResult: latestHtsResult?.hivTestValue || '',
      hivTestResultDate: latestHtsResult?.hivTestResultDate || '',
    }));
  }, [latestHtsResult]);

  const getOtherPrepTypeOptions = () => {
    switch (formik.values.otherPrepType) {
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
  console.log('formik: ', formik);
  return (
    <div className={`${classes.root} container-fluid`}>
      <div className="row">
        <div className="col-12">
          <h2 className="p-2">Clinic Follow-up Visit</h2>
        </div>
      </div>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Grid>
            <Grid.Column>
              <Segment>
                <VitalSigns
                  formik={formik}
                  setIsInitialValues={setIsInitialValues}
                  vitalClinicalSupport={vitalClinicalSupport}
                  handlePulseInputValueCheck={handlePulseInputValueCheck}
                  handleDiastolicInputValueCheck={
                    handleDiastolicInputValueCheck
                  }
                  handleHeightInputValueCheck={handleHeightInputValueCheck}
                  handleRespiratoryRateInputValueCheck={
                    handleRespiratoryRateInputValueCheck
                  }
                  handleSystolicInputValueCheck={handleSystolicInputValueCheck}
                  handleTemperatureInputValueCheck={
                    handleTemperatureInputValueCheck
                  }
                  handleWeightInputValueCheck={handleWeightInputValueCheck}
                  disabledField={disabledField}
                  classes={classes}
                  isFemale={isFemale}
                  pregnancyStatus={pregnancyStatus}
                />
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
                        value={formik.values.hivTestValue}
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
                        {formik.touched.pregnancyStatus &&
                          formik.errors.lastHts && (
                            <span className={classes.error}>
                              {formik.errors.lastHts}
                            </span>
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
                        type={
                          formik.values.hivTestValue == 'NOT DONE'
                            ? 'text'
                            : 'date'
                        }
                        name="hivTestResultDate"
                        id="hivTestResultDate"
                        value={
                          formik.values.hivTestValue == 'NOT DONE'
                            ? 'NOT APPLICABLE'
                            : formik.values.hivTestResultDate
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
                        {formik.touched.lastHtsDate &&
                          formik.errors.lastHtsDate && (
                            <span className={classes.error}>
                              {formik.errors.lastHtsDate}
                            </span>
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
                          objValues={formik.values}
                          handleInputChange={handleLftInputChange}
                          liverFunctionTestResult={liverFunctionTestResult}
                          disabledField={true}
                          isAutoPop={true}
                        />
                        {formik.touched.liverFunctionTestResults &&
                          formik.errors.liverFunctionTestResults && (
                            <span className={classes.error}>
                              {formik.errors.liverFunctionTestResults}
                            </span>
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
                        {formik.touched.dateLiverFunctionTestResults &&
                          formik.errors.dateLiverFunctionTestResults && (
                            <span className={classes.error}>
                              {formik.errors.dateLiverFunctionTestResults}
                            </span>
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
                      {formik.touched.notedSideEffects &&
                        formik.errors.notedSideEffects && (
                          <span className={classes.error}>
                            {formik.errors.notedSideEffects}
                          </span>
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
                  {formik.values.stiScreening === 'true' && (
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
                      {formik.touched.adherenceLevel &&
                        formik.errors.adherenceLevel && (
                          <span className={classes.error}>
                            {formik.errors.adherenceLevel}
                          </span>
                        )}
                    </FormGroup>
                  </div>
                  {formik.values.adherenceLevel ===
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
                          <option value="POPULATION_TYPE_GEN_POP">
                            GenPop
                          </option>
                        )}
                      </Input>
                      {formik.touched.adherenceLevel &&
                        formik.errors.populationType && (
                          <span className={classes.error}>
                            {formik.errors.populationType}
                          </span>
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
                      {formik.touched.visitType && formik.errors.visitType && (
                        <span className={classes.error}>
                          {formik.errors.visitType}
                        </span>
                      )}
                    </FormGroup>
                  </div>

                  {formik.values.visitType ===
                    'PREP_VISIT_TYPE_METHOD_SWITCH' && (
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
                      {formik.touched.reasonForSwitch &&
                        formik.errors.reasonForSwitch && (
                          <span className={classes.error}>
                            {formik.errors.reasonForSwitch}
                          </span>
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
                    {formik.touched.wasPrepAdministered &&
                      formik.errors.wasPrepAdministered && (
                        <span className={classes.error}>
                          {formik.errors.wasPrepAdministered}
                        </span>
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
                        {eligiblePrepTypes?.map(value => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.prepType && formik.errors.prepType && (
                        <span className={classes.error}>
                          {formik.errors.prepType}
                        </span>
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
                        {eligibleRegimens?.map(value => (
                          <option key={value.id} value={value.id}>
                            {value.regimen}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.regimenId && formik.errors.regimenId && (
                        <span className={classes.error}>
                          {formik.errors.regimenId}
                        </span>
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
                      {formik.touched.monthsOfRefill &&
                        formik.errors.monthsOfRefill && (
                          <span className={classes.error}>
                            {formik.errors.monthsOfRefill}
                          </span>
                        )}
                    </FormGroup>
                  </div>
                  {formik.values.prepType && (
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
                          {formik.touched.otherPrepGiven &&
                            formik.errors.otherPrepGiven && (
                              <span className={classes.error}>
                                {formik.errors.otherPrepGiven}
                              </span>
                            )}
                        </>
                      </div>
                      {formik.values.otherPrepGiven === 'true' && (
                        <>
                          <ConditionalFieldWrapper
                            setFieldValue={formik.setFieldValue}
                            fieldId="otherPrepType"
                          >
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
                                  {eligiblePrepTypes
                                    ?.filter(
                                      (each, index) =>
                                        each.code !== 'PREP_TYPE_ED_PREP'
                                    )
                                    ?.filter(
                                      (each, index) =>
                                        each.code !== formik.values.prepType
                                    )
                                    ?.map(value => (
                                      <option key={value.id} value={value.code}>
                                        {value.display}
                                      </option>
                                    ))}
                                </Input>
                                {formik.touched.otherPrepType &&
                                  formik.errors.otherPrepType && (
                                    <span className={classes.error}>
                                      {formik.errors.otherPrepType}
                                    </span>
                                  )}
                              </FormGroup>
                            </div>
                          </ConditionalFieldWrapper>
                          <ConditionalFieldWrapper
                            setFieldValue={formik.setFieldValue}
                            fieldId="otherRegimenId"
                          >
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
                                  {getOtherPrepTypeOptions()}
                                </Input>
                                {formik.touched.otherRegimenId &&
                                  formik.errors.otherRegimenId && (
                                    <span className={classes.error}>
                                      {formik.errors.otherRegimenId}
                                    </span>
                                  )}
                              </FormGroup>
                            </div>
                          </ConditionalFieldWrapper>
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
                      {formik.touched.prepDistributionSetting &&
                        formik.errors.prepDistributionSetting && (
                          <span className={classes.error}>
                            {formik.errors.prepDistributionSetting}
                          </span>
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
                      {formik.touched.dateOfFamilyPlanning &&
                        formik.errors.dateOfFamilyPlanning && (
                          <span className={classes.error}>
                            {formik.errors.dateOfFamilyPlanning}
                          </span>
                        )}
                    </FormGroup>
                  </div>
                  <br />
                  <br />
                  {/* <Label
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
                        onChange={handleCheckboxCreatinineTest}
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
                            onChange={handleCreatinineTestInputChange}
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                            min={formik.values.encounterDate}
                            max={moment(new Date()).format('YYYY-MM-DD')}
                            disabled={disabledField}
                          />
                          {formik.touched.creatinineTestDate &&
                            formik.errors.creatinineTestDate && (
                              <span className={classes.error}>
                                {formik.errors.creatinineTestDate}
                              </span>
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
                            onChange={handleCreatinineTestInputChange}
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                            disabled={disabledField}
                          ></Input>
                          {formik.touched.creatinineResult &&
                            formik.errors.creatinineResult && (
                              <span className={classes.error}>
                                {formik.errors.creatinineResult}
                              </span>
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
                        onChange={handleCheckboxUrinalysisTest}
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
                            min={formik.values.encounterDate}
                            max={moment(new Date()).format('YYYY-MM-DD')}
                            disabled={disabledField}
                          />
                          {formik.touched.urinalysisTestDate &&
                            formik.errors.urinalysisTestDate && (
                              <span className={classes.error}>
                                {formik.errors.urinalysisTestDate}
                              </span>
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
                          {formik.touched.result && formik.errors.result && (
                            <span className={classes.error}>
                              {formik.errors.result}
                            </span>
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
                        onChange={handleCheckboxHepatitisTest}
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
                            min={formik.values.encounterDate}
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
                        onChange={handleCheckboxSyphilisTest}
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
                            onChange={handleSyphilisTestInputChange}
                            style={{
                              border: '1px solid #014D88',
                              borderRadius: '0.25rem',
                            }}
                            disabled={disabledField}
                            min={formik.values.encounterDate}
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
                            onChange={handleSyphilisTestInputChange}
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
                              onChange={handleSyphilisTestInputChange}
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
                  )} */}
                  <TestResultEntryField
                    testName="Urinalysis"
                    testCheckboxName="urinalysisTest"
                    checkboxState={urinalysisTest.urinalysisTest}
                    handleCheckboxChange={handleCheckboxUrinalysisTest}
                    dateName="testDate"
                    dateValue={urinalysisTest.testDate}
                    dateTouched={formik.touched.urinalysisTestDate}
                    dateError={formik.errors.urinalysisTestDate}
                    handleDateChange={handleInputChangeUrinalysisTest}
                    resultName="result"
                    resultValue={urinalysisTest.result}
                    resultTouched={formik.touched.urinalysisTestResult}
                    resultError={formik.errors.urinalysisTestResult}
                    handleResultChange={handleInputChangeUrinalysisTest}
                    formik={formik}
                    disabledField={disabledField}
                    classes={classes}
                    color="blue"
                  />

                  <TestResultEntryField
                    testName="Creatinine"
                    testCheckboxName="creatinineTest"
                    checkboxState={creatinineTest.creatinineTest}
                    handleCheckboxChange={handleCheckboxCreatinineTest}
                    dateName="testDate"
                    dateValue={creatinineTest.testDate}
                    dateTouched={formik.touched.creatinineTestDate}
                    dateError={formik.errors.creatinineTestDate}
                    handleDateChange={handleCreatinineTestInputChange}
                    resultName="result"
                    resultValue={creatinineTest.result}
                    resultTouched={formik.touched.creatinineTestResult}
                    resultError={formik.errors.creatinineTestResult}
                    handleResultChange={handleCreatinineTestInputChange}
                    formik={formik}
                    disabledField={disabledField}
                    classes={classes}
                    color="teal"
                  />

                  <TestResultEntryField
                    testName="Syphilis"
                    testCheckboxName="syphilisTest"
                    checkboxState={syphilisTest.syphilisTest}
                    handleCheckboxChange={handleCheckboxSyphilisTest}
                    dateName="testDate"
                    dateValue={syphilisTest.testDate}
                    dateTouched={formik.touched.syphilisTestDate}
                    dateError={formik.errors.syphilisTestDate}
                    handleDateChange={handleSyphilisTestInputChange}
                    resultName="result"
                    resultValue={syphilisTest.result}
                    resultTouched={formik.touched.syphilisTestResult}
                    resultError={formik.errors.syphilisTestResult}
                    handleResultChange={handleSyphilisTestInputChange}
                    formik={formik}
                    disabledField={disabledField}
                    classes={classes}
                    color="blue"
                  />

                  <TestResultEntryField
                    testName="Hepatitis"
                    testCheckboxName="hepatitisTest"
                    checkboxState={hepatitisTest.hepatitisTest}
                    handleCheckboxChange={handleCheckboxHepatitisTest}
                    dateName="testDate"
                    dateValue={hepatitisTest.testDate}
                    dateTouched={formik.touched.hepatitisTestDate}
                    dateError={formik.errors.hepatitisTestDate}
                    handleDateChange={handleInputChangeHepatitisTest}
                    resultName="result"
                    resultValue={hepatitisTest.result}
                    resultTouched={formik.touched.hepatitisTestResult}
                    resultError={formik.errors.hepatitisTestResult}
                    handleResultChange={handleInputChangeHepatitisTest}
                    formik={formik}
                    disabledField={disabledField}
                    classes={classes}
                    color="red"
                  />
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
                        onChange={handleCheckboxOtherTest}
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

                        {eachTest.name ===
                          'PREP_OTHER_TEST_OTHER_(SPECIFY)' && (
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
                                  handleInputChangeOtherTest(
                                    e,
                                    eachTest.localId
                                  )
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
                              min={formik.values.encounterDate}
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
                  {formik.touched.otherTestsDone &&
                    formik.errors.otherTestsDone && (
                      <span className={classes.error}>
                        {formik.errors.otherTestsDone}
                      </span>
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
                      Next Appointment Date{' '}
                      <span style={{ color: 'red' }}> *</span>
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
                      min={formik.values.encounterDate}
                      disabled={disabledField}
                    />
                    {formik.touched.nextAppointment &&
                      formik.errors.nextAppointment && (
                        <span className={classes.error}>
                          {formik.errors.nextAppointment}
                        </span>
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
                    {formik.errors.healthCareWorkerSignature !== '' ? (
                      <span className={classes.error}>
                        {formik.errors.healthCareWorkerSignature}
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
                    {formik.errors.comment && (
                      <span className={classes.error}>
                        {formik.errors.comment}
                      </span>
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
        </form>
      </FormikProvider>
    </div>
  );
};
export default ClinicVisit;

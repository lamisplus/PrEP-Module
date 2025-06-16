import React, { useState, useEffect, useRef } from 'react';
import { Grid, Segment, Label } from 'semantic-ui-react';
import { FormGroup, Label as FormLabelName, Input } from 'reactstrap';
import { url as baseUrl, token } from '../../../api';
import moment from 'moment';
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
import useGetNextAppDate from '../../../hooks/vistUtils/useGetNextAppDate';
import VitalSigns from './VitalSigns';
import ConditionalFieldWrapper from './ConditionalFieldWrapper/ConditionalFieldWrapper';
import TestResultEntryField from './CreatinineTest/TestResultEntryField';
import OtherTestSection from './OtherTestEntryField/OtherTestEntryField';
import useEligibleRegimens from '../../../hooks/useEligibleRegimens';
import useEligiblePrepTypes from '../../../hooks/useEligiblePrepTypes';
import useOtherPrepTypeOptions from '../../../hooks/useOtherPrepTypeOptions';
import useIsFemale from '../../../hooks/useIsFemale';
import useCreateNewTest from '../../../hooks/useHandleCreateNewTest';
import SubmitButton from './SubmitButton';
import useUrinalysisTestInputChange from '../../../hooks/useUrinalysisTestInputChange';
import useOtherTestInputChange from '../../../hooks/useOtherTestInputChange';
import useHepatitisTestInputChange from '../../../hooks/useHepatitisTestInputChange';
import useRemoveTest from '../../../hooks/useRemoveTest';
import useLftInputChange from '../../../hooks/useLftInputChange';
import useNotedSideEffectsChange from '../../../hooks/useNotedSideEffectsChange';
import useFilterOutRegimen from '../../../hooks/vistUtils/useFilterOutRegimen';
import useIsLastVisitTypeMethodSwitch from '../../../hooks/vistUtils/useIsLastVisitTypeMethodSwitch';
import useFilterOutPrepType from '../../../hooks/vistUtils/useFilterOutPrepType';
import { useGetPatientDtoObj } from '../../../hooks/vistUtils/useGetPatientDtoObj';

const ClinicVisit = props => {
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [whyAdherenceLevelPoor, setWhyAdherenceLevelPoor] = useState([]);
  const [otherTest, setOtherTest] = useState([]);
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

  const [isInitialValues, setIsInitialValues] = useState(1);
  const [localEncounterDate, setLocalEncounterDate] = useState('');
  const [notedSideEffects, setNotedSideEffects] = useState([]);
  const otherTestInputRef = useRef();
  const classes = useStyleForVisitForm();
  const { error, root, inputStyle } = classes;
  const isFemale = useIsFemale(props.patientObj.gender);
  const { handleCreateNewTest } = useCreateNewTest(setOtherTest);
  const {
    formik,
    disabledField,
    setDisabledField,
    adherenceLevel,
    sti,
    prepSideEffect,
    prepRegimen,
    otherTestResult,
    familyPlanningMethod,
    pregnancyStatus,
    prepEntryPoint,
    prepType,
    populationType,
    visitType,
    latestFromEligibility,
    setHivTestValue,
    reasonForSwitchOptions,
    prepRiskReductionPlan,
    liverFunctionTestResult,
  } = usePrepClinicState(props);

  const { filterOutRegimen } = useFilterOutRegimen(
    prepRegimen,
    props.recentActivities[0]?.regimenId
  );
  const { filterOutPrepType } = useFilterOutPrepType(
    prepType,
    props.recentActivities[0]?.prepType
  );

  const { isLastVisitTypeMethodSwitch } = useIsLastVisitTypeMethodSwitch(
    formik.values.visitType
  );

  const filteredRegimensByPreviousVisitType = isLastVisitTypeMethodSwitch(
    formik.values.visitType
  )
    ? filterOutRegimen()
    : [...prepRegimen];

  const filteredPrepTypeByPreviousVisitType = isLastVisitTypeMethodSwitch(
    formik.values.visitType
  )
    ? filterOutPrepType()
    : [...prepType];

  const { isEligibleForCabLa, setIsEligibleForCabLa } = useEligibilityCheckApi(
    baseUrl,
    props.patientObj.personId,
    latestFromEligibility?.visitDate,
    token
  );
  const { getPatientDtoObj } = useGetPatientDtoObj();

  const { data: latestHtsResult, setData } = useHivResult(
    props.patientObj.personId
  );
  const { isHtsFound } = useHtsResultCheck();
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

  const { handleInputChangeUrinalysisTest } = useUrinalysisTestInputChange(
    setErrors,
    setUrinalysisTest,
    urinalysisTest,
    errors
  );

  const { handleCreatinineTestInputChange } =
    useHandleCreatinineTestInputChange(
      setErrors,
      setCreatinineTest,
      creatinineTest,
      errors
    );

  const { handleInputChangeOtherTest } = useOtherTestInputChange(
    setOtherTest,
    otherTest
  );

  const { handleRemoveTest } = useRemoveTest(setOtherTest);

  const { handleInputChangeHepatitisTest } = useHepatitisTestInputChange(
    setErrors,
    setHepatitisTest,
    hepatitisTest,
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

  const { handleLftInputChange } = useLftInputChange(formik);

  const { handleNotedSideEffectsChange } =
    useNotedSideEffectsChange(setNotedSideEffects);

  const { getNextAppDate } = useGetNextAppDate();

  const eligibleRegimens = useEligibleRegimens(
    isEligibleForCabLa,
    props.activeContent.actionType,
    filteredRegimensByPreviousVisitType
  );

  const eligiblePrepTypes = useEligiblePrepTypes(
    isEligibleForCabLa,
    props.activeContent.actionType,
    filteredPrepTypeByPreviousVisitType
  );
  const getOtherPrepTypeOptions = useOtherPrepTypeOptions(
    formik.values.otherPrepType
  );

  useEffect(() => {
    if (latestHtsResult?.hivTestValue) isHtsFound(latestHtsResult.hivTestValue);
  }, [latestHtsResult]);

  useEffect(
    () => setLocalEncounterDate(formik.values.encounterDate),
    [formik.values.encounterDate]
  );
  useEffect(async () => {
    if (
      props.activeContent.id &&
      props.activeContent.id !== '' &&
      props.activeContent.id !== null
    ) {
      setDisabledField(props.activeContent.actionType === 'view');
    }
  }, [props.activeContent]);

  useEffect(() => {
    let nextAppointment = getNextAppDate(
      formik.values.encounterDate,
      formik.values.monthsOfRefill
    );
    formik.setValues(prev => ({ ...prev, nextAppointment }));
  }, [formik.values.encounterDate, formik.values.monthsOfRefill]);
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
  useEffect(() => {
    formik.setValues(prev => ({
      ...prev,
      hivTestValue: latestHtsResult?.hivTestValue || '',
      hivTestResult: latestHtsResult?.hivTestValue || '',
      hivTestResultDate: latestHtsResult?.hivTestResultDate || '',
    }));
  }, [latestHtsResult]);

  return (
    <div className={`${root} container-fluid`}>
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
                        className={inputStyle}
                        disabled
                      />
                      <div className="p-1">
                        {formik.touched.pregnancyStatus &&
                          formik.errors.lastHts && (
                            <span className={error}>
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
                        className={inputStyle}
                        disabled
                      />
                      <div className="p-1">
                        {formik.touched.lastHtsDate &&
                          formik.errors.lastHtsDate && (
                            <span className={error}>
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
                            <span className={error}>
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
                            <span className={error}>
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
                          <span className={error}>
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
                        className={inputStyle}
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
                        className={inputStyle}
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
                        className={inputStyle}
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
                          <span className={error}>
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
                        className={inputStyle}
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
                          <span className={error}>
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
                        className={inputStyle}
                      >
                        <option value=""> Select Visit Type</option>
                        {visitType?.map(value => (
                          <option key={value.id} value={value.code}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.visitType && formik.errors.visitType && (
                        <span className={error}>{formik.errors.visitType}</span>
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
                          <span className={error}>
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
                        className={inputStyle}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </Input>
                    </FormGroup>
                    {formik.touched.wasPrepAdministered &&
                      formik.errors.wasPrepAdministered && (
                        <span className={error}>
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
                        className={inputStyle}
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
                        <span className={error}>{formik.errors.prepType}</span>
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
                        className={inputStyle}
                      >
                        <option value=""> Select</option>
                        {eligibleRegimens?.map(value => (
                          <option key={value.id} value={value.id}>
                            {value.regimen}
                          </option>
                        ))}
                      </Input>
                      {formik.touched.regimenId && formik.errors.regimenId && (
                        <span className={error}>{formik.errors.regimenId}</span>
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
                        className={inputStyle}
                        disabled={disabledField}
                      />
                      {formik.touched.monthsOfRefill &&
                        formik.errors.monthsOfRefill && (
                          <span className={error}>
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
                              <span className={error}>
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
                                    <span className={error}>
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
                                  {getOtherPrepTypeOptions}
                                </Input>
                                {formik.touched.otherRegimenId &&
                                  formik.errors.otherRegimenId && (
                                    <span className={error}>
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
                        className={inputStyle}
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
                          <span className={error}>
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
                        className={inputStyle}
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
                        className={inputStyle}
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
                        className={inputStyle}
                        onChange={formik.handleChange}
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        disabled={disabledField}
                      />
                      {formik.touched.dateOfFamilyPlanning &&
                        formik.errors.dateOfFamilyPlanning && (
                          <span className={error}>
                            {formik.errors.dateOfFamilyPlanning}
                          </span>
                        )}
                    </FormGroup>
                  </div>
                  <br />
                  <br />
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
                  <OtherTestSection
                    otherTest={otherTest}
                    otherTestResult={otherTestResult}
                    handleCheckboxOtherTest={handleCheckboxOtherTest}
                    handleInputChangeOtherTest={handleInputChangeOtherTest}
                    handleRemoveTest={handleRemoveTest}
                    handleCreateNewTest={handleCreateNewTest}
                    otherTestInputRef={otherTestInputRef}
                    disabledField={disabledField}
                    formik={formik}
                    saving={saving}
                    classes={classes}
                  />
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
                      className={inputStyle}
                      min={formik.values.encounterDate}
                      disabled={disabledField}
                    />
                    {formik.touched.nextAppointment &&
                      formik.errors.nextAppointment && (
                        <span className={error}>
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
                      className={inputStyle}
                    />
                    {formik.errors.healthCareWorkerSignature !== '' ? (
                      <span className={error}>
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
                      style={{ height: '10em' }}
                      className={{ ...inputStyle }}
                    />
                    {formik.errors.comment && (
                      <span className={error}>{formik.errors.comment}</span>
                    )}
                  </div>
                </div>
                <br />
                <SubmitButton
                  disabledField={disabledField}
                  actionType={props.activeContent.actionType}
                  saving={saving}
                  classes={classes}
                />
              </Segment>
            </Grid.Column>
          </Grid>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ClinicVisit;

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupText,
  Label as FormLabelName,
} from 'reactstrap';
import MatButton from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url as baseUrl, token } from '../../../api';
import 'react-widgets/dist/css/react-widgets.css';
import moment from 'moment';
import { Spinner } from 'reactstrap';
import { LiverFunctionTest } from './PrEPEligibiltyScreeningForm';
import useStyleForCommencementForm from '../../../hooks/useStyleForCommencementForm';
import usePrepClinicState from '../../../hooks/usePrepClinicState';

const PrEPCommencementForm = props => {
  const patientObj = props.patientObj;
  const classes = useStyleForCommencementForm();
  const [historyOfDrugToDrugInteraction, setHistoryOfDrugToDrugInteraction] =
    useState([]);
  const [objValues, setObjValues] = useState({
    dateInitialAdherenceCounseling: '',
    datePrepStart: '',
    height: '',
    personId: patientObj.personId,
    prepClientId: props.prepId,
    regimenId: '',
    urinalysisResult: '',
    prepEligibilityUuid: '',
    weight: '',
    drugAllergies: '',
    referred: '',
    datereferred: '',
    extra: {},
    nextAppointment: '',
    pregnant: true,
    prepEnrollmentUuid: '',
    duration: '',
    prepDistributionSetting: '',
    prepType: '',
    monthsOfRefill: '',
    liverFunctionTestResults: [],
    dateLiverFunctionTestResults: '',
    historyOfDrugToDrugInteraction: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [patientDto, setPatientDto] = useState();
  const [urinalysisTestResult, setUrinalysisTestResult] = useState([]);
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
    hivTestResultDate,
    setHivTestResultDate,
    reasonForSwitchOptions,
    setReasonForSwitchOptions,
    recentActivities,
    setRecentActivities,
    liverFunctionTestResult,
    setLiverFunctionTestResult,
  } = usePrepClinicState(props);
  useEffect(() => {
    getPatientDTOObj();
    fetchHistoryOfDrugToDrugInteraction();
    if (
      props.activeContent.id &&
      props.activeContent.id !== '' &&
      props.activeContent.id !== null
    ) {
      getPatientCommencement(props.activeContent.id);
    }
  }, []);

  const fetchHistoryOfDrugToDrugInteraction = () => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/PREP_HISTORY_OF_DRUG_INTERACTIONS`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setHistoryOfDrugToDrugInteraction(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const getPatientCommencement = id => {
    axios
      .get(`${baseUrl}prep/commencement/person/${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setObjValues(response.data.find(x => x.id === id));
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const getPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${props.patientObj.personId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setPatientDto(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    weight: '',
    height: '',
  });

  const handleInputChange = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.name === 'referred' && e.target.value === 'false') {
      objValues.datereferred = '';
      setObjValues({ ...objValues, ['datereferred']: '' });
    } else if (e.target.name === 'monthsOfRefill') {
      const durationInDays = Number(e.target.value) * 30;
      setObjValues({
        ...objValues,
        monthsOfRefill: e.target.value,
        duration: durationInDays,
      });
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let temp = { ...errors };
    temp.dateInitialAdherenceCounseling =
      objValues.dateInitialAdherenceCounseling ? '' : 'This field is required';
    temp.datePrepStart = objValues.datePrepStart
      ? ''
      : 'This field is required';
    temp.prepType = objValues.prepType ? '' : 'This field is required';
    temp.regimenId = objValues.regimenId ? '' : 'This field is required';
    temp.height = objValues.height ? '' : 'This field is required';
    temp.weight = objValues.weight ? '' : 'This field is required';
    temp.referred = objValues.referred ? '' : 'This field is required';
    temp.prepDistributionSetting = objValues.prepDistributionSetting
      ? ''
      : 'This field is required';
    setErrors({ ...temp });
    return Object.values(temp).every(x => x === '');
  };

  //to check the input value for clinical decision
  const handleInputValueCheckHeight = e => {
    setErrors({ ...errors, [e.target.name]: '' });
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

  const handleInputValueCheckBodyWeight = e => {
    setErrors({ ...errors, [e.target.name]: '' });
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

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      setSaving(true);
      objValues.prepEnrollmentUuid = patientDto.uuid;
      if (props.activeContent && props.activeContent.actionType === 'update') {
        axios
          .put(`${baseUrl}prep-clinic/${props.activeContent.id}`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            patientObj.commencementCount = 1;
            toast.success('Record save successful', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: 'recent-history',
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
          .post(`${baseUrl}prep/commencement`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            patientObj.commencementCount = 1;
            props.PatientObject();
            toast.success('Record save successful', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: 'recent-history',
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

  const handlePrepTypeChange = e => {
    setObjValues({ ...objValues, regimenId: '', prepType: e.target.value });
  };

  const handleLftInputChange = event => {
    const { name, value } = event.target;
    setObjValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (latestFromEligibility) {
      setObjValues(prevValues => ({
        ...prevValues,
        liverFunctionTestResults:
          latestFromEligibility.liverFunctionTestResults || [],
        dateLiverFunctionTestResults:
          latestFromEligibility.dateLiverFunctionTestResults || '',
      }));
    }
  }, [latestFromEligibility]);

  return (
    <Card className={classes.root}>
      <CardBody>
        <form>
          <div className="row">
            <h2>PrEP Commencement</h2>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label for="uniqueId">
                  Date of Initial Adherence Counseling{' '}
                  <span style={{ color: 'red' }}>*</span>
                </Label>
                <Input
                  className="form-control"
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="dateInitialAdherenceCounseling"
                  id="dateInitialAdherenceCounseling"
                  min={patientDto?.dateEnrolled || ''}
                  max={moment(new Date()).format('YYYY-MM-DD')}
                  value={objValues.dateInitialAdherenceCounseling}
                  onChange={handleInputChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
                {errors.dateInitialAdherenceCounseling && (
                  <span className={classes.error}>
                    {errors.dateInitialAdherenceCounseling}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>
                  Date PrEP started <span style={{ color: 'red' }}>*</span>
                </Label>
                <Input
                  className="form-control"
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="datePrepStart"
                  id="datePrepStart"
                  min={patientDto?.dateEnrolled || ''}
                  max={moment(new Date()).format('YYYY-MM-DD')}
                  value={objValues.datePrepStart}
                  onChange={handleInputChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
                {errors.datePrepStart && (
                  <span className={classes.error}>{errors.datePrepStart}</span>
                )}
              </FormGroup>
            </div>
          </div>
          <div className="row">
            <div className="mb-3 col-md-4">
              <FormGroup>
                <Label>
                  Body Weight <span style={{ color: 'red' }}>*</span>
                </Label>
                <InputGroup>
                  <Input
                    type="number"
                    name="weight"
                    id="weight"
                    onChange={handleInputChange}
                    min="3"
                    max="150"
                    value={objValues.weight}
                    onKeyUp={handleInputValueCheckBodyWeight}
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
                    kg
                  </InputGroupText>
                </InputGroup>
                {vitalClinicalSupport.bodyWeight && (
                  <span className={classes.error}>
                    {vitalClinicalSupport.bodyWeight}
                  </span>
                )}
                {errors.weight && (
                  <span className={classes.error}>{errors.weight}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <Label>
                  Height <span style={{ color: 'red' }}>*</span>
                </Label>
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
                    disabled={disabledField}
                    onKeyUp={handleInputValueCheckHeight}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0rem',
                    }}
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
                    {objValues.height
                      ? (objValues.height / 100).toFixed(2) + 'm'
                      : 'm'}
                  </InputGroupText>
                </InputGroup>
                {vitalClinicalSupport.height && (
                  <span className={classes.error}>
                    {vitalClinicalSupport.height}
                  </span>
                )}
                {errors.height && (
                  <span className={classes.error}>{errors.height}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 mt-2 col-md-4">
              {objValues.weight && objValues.height && (
                <FormGroup>
                  <InputGroup>
                    <InputGroupText
                      addonType="append"
                      style={{
                        backgroundColor: '#014D88',
                        color: '#fff',
                        border: '1px solid #014D88',
                        borderRadius: '0rem',
                      }}
                    >
                      BMI:{' '}
                      {(
                        objValues.weight /
                        (objValues.height / 100) ** 2
                      ).toFixed(2)}
                    </InputGroupText>
                  </InputGroup>
                </FormGroup>
              )}
            </div>
            {props.patientObj.gender.toLowerCase() === 'female' && (
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Pregnancy Status</Label>
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
                    <option value=""></option>
                    {pregnant.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
            )}
            {objValues.pregnant === 'PREGANACY_STATUS_BREASTFEEDING' && (
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Breast Feeding</Label>
                  <Input
                    type="select"
                    name="breastFeeding"
                    id="breastFeeding"
                    onChange={handleInputChange}
                    value={objValues.breastFeeding}
                    disabled={disabledField}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                </FormGroup>
              </div>
            )}
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>History of drug Allergies</Label>
                <Input
                  type="select"
                  name="drugAllergies"
                  id="drugAllergies"
                  onChange={handleInputChange}
                  value={objValues.drugAllergies}
                  disabled={disabledField}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Input>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>Urinalysis Result</Label>
                <Input
                  type="select"
                  name="urinalysisResult"
                  id="urinalysisResult"
                  onChange={handleInputChange}
                  value={objValues.urinalysisResult}
                  disabled={disabledField}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                >
                  <option value="">Select</option>
                  {urinalysisTestResult.map(value => (
                    <option key={value.id} value={value.display}>
                      {value.display}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>History of PrEP drug interactions</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="historyOfDrugToDrugInteraction"
                  id="historyOfDrugToDrugInteraction"
                  value={objValues.historyOfDrugToDrugInteraction}
                  onChange={handleInputChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                >
                  <option value="">Select</option>
                  {historyOfDrugToDrugInteraction.map(value => (
                    <option key={value.id} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.historyOfDrugToDrugInteraction && (
                  <span className={classes.error}>
                    {errors.historyOfDrugToDrugInteraction}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>Liver Function Tests Result </Label>
                <LiverFunctionTest
                  objValues={objValues}
                  handleInputChange={handleLftInputChange}
                  liverFunctionTestResult={liverFunctionTestResult}
                  disabledField={disabledField}
                  isAutoPop={true}
                />
                {errors.liverFunctionTestResults && (
                  <span className={classes.error}>
                    {errors.liverFunctionTestResults}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-8">
              <FormGroup>
                <Label>Date of Liver Function Tests Result </Label>
                <Input
                  className="form-control"
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="dateLiverFunctionTestResults"
                  id="dateLiverFunctionTestResults"
                  max={moment(new Date()).format('YYYY-MM-DD')}
                  value={objValues.dateLiverFunctionTestResults}
                  onChange={handleInputChange}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled
                />
                {errors.dateLiverFunctionTestResults && (
                  <span className={classes.error}>
                    {errors.dateLiverFunctionTestResults}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>
                  Referred <span style={{ color: 'red' }}>*</span>
                </Label>
                <Input
                  type="select"
                  name="referred"
                  id="referred"
                  onChange={handleInputChange}
                  value={objValues.referred}
                  disabled={disabledField}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Input>
                {errors.referred && (
                  <span className={classes.error}>{errors.referred}</span>
                )}
              </FormGroup>
            </div>
            {objValues.referred === 'true' && (
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Date referred</Label>
                  <Input
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="datereferred"
                    id="datereferred"
                    onChange={handleInputChange}
                    value={objValues.datereferred}
                    min={patientDto?.dateEnrolled || ''}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    max={moment(new Date()).format('YYYY-MM-DD')}
                    disabled={disabledField}
                  />
                  {errors.datereferred && (
                    <span className={classes.error}>{errors.datereferred}</span>
                  )}
                </FormGroup>
              </div>
            )}
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <FormLabelName for="prepType">
                  Prep Type At Start <span style={{ color: 'red' }}>*</span>
                </FormLabelName>
                <Input
                  type="select"
                  name="prepType"
                  id="prepType"
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  onChange={handlePrepTypeChange}
                  value={objValues.prepType}
                >
                  <option value="">Select Prep Type</option>
                  {prepType.map(value => (
                    <option key={value.id} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.prepType && (
                  <span className={classes.error}>{errors.prepType}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <Label>
                  PrEP Regimen <span style={{ color: 'red' }}>*</span>
                </Label>
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
                  <option value="">Select</option>
                  {prepRegimen.map(value => (
                    <option key={value.id} value={value.id}>
                      {value.regimen}
                    </option>
                  ))}
                </Input>
                {errors.regimenId && (
                  <span className={classes.error}>{errors.regimenId}</span>
                )}
              </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
              <FormGroup>
                <FormLabelName>
                  Prep Distribution Setting{' '}
                  <span style={{ color: 'red' }}>*</span>
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
                    <option key={value.code} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {errors.prepDistributionSetting && (
                  <span className={classes.error}>
                    {errors.prepDistributionSetting}
                  </span>
                )}
              </FormGroup>
            </div>
            <div className="mb-3 col-md-6">
              <FormGroup>
                <Label>Duration of Refill (Day[s])</Label>
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
              </FormGroup>
            </div>
          </div>
          {saving && <Spinner />}
          <br />
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
            <span style={{ textTransform: 'capitalize' }}>
              {saving
                ? 'Saving...'
                : props.activeContent?.actionType
                ? 'Update'
                : 'Save'}
            </span>
          </MatButton>
        </form>
      </CardBody>
    </Card>
  );
};

export default PrEPCommencementForm;

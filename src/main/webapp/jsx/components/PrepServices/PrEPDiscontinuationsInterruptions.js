import React, { useState, useEffect } from 'react';
import { Form, Row, Card, CardBody, FormGroup, Label, Input } from 'reactstrap';
import MatButton from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url as baseUrl, token } from '../../../api';
import 'react-widgets/dist/css/react-widgets.css';
import moment from 'moment';
import { Spinner } from 'reactstrap';

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
    width: 300,
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
      height: '2.5625em',
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
  demo: {
    backgroundColor: theme.palette.background.default,
  },
  inline: {
    display: 'inline',
  },
  error: {
    color: '#f85032',
    fontSize: '12.8px',
  },
  success: {
    color: '#4BB543 ',
    fontSize: '11px',
  },
}));

const PrEPEligibiltyScreeningForm = props => {
  const patientObj = props.patientObj;
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [objValues, setObjValues] = useState({
    dateInterruption: '',
    why: '',
    interruptionType: '',
    dateRestartPlacedBackMedication: '',
    personId: patientObj.personId,
    causeOfDeath: '',
    dateClientDied: '',
    dateClientReferredOut: '',
    facilityReferredTo: '',
    interruptionDate: '',
    interruptionReason: '',
    sourceOfDeathInfo: '',
    dateSeroconverted: '',
    reasonStopped: '',
    reasonStoppedOthers: '',
    reasonForPrepDiscontinuation: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [prepStatus, setPrepStatus] = useState([]);
  const [reasonStooped, setReasonStooped] = useState([]);
  const [causeOfDeath, setCauseOfDeath] = useState([]);
  const [reasonForDiscontinuationOptions, setReasonForDiscontinuationOptions] =
    useState([]);
  const [patientDto, setPatientDto] = useState();

  useEffect(() => {
    PREP_STATUS();
    PREP_STATUS_STOPPED_REASON();
    GetPatientDTOObj();
    CAUSE_DEATH();
    getReasonForDiscontinuationOptions();
    if (
      props.activeContent.id &&
      props.activeContent.id !== '' &&
      props.activeContent.id !== null
    ) {
      setDisabledField(
        props.activeContent.actionType === 'view' ? true : false
      );
    }
  }, []);

  const GetPatientDTOObj = () => {
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

  const GetPatientInterruption = id => {
    axios
      .get(`${baseUrl}prep-interruption/${props.activeContent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setObjValues(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const PREP_STATUS = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_STATUS`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepStatus(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const CAUSE_DEATH = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/CAUSE_DEATH`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setCauseOfDeath(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const PREP_STATUS_STOPPED_REASON = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_STATUS_STOPPED_REASON`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setReasonStooped(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const getReasonForDiscontinuationOptions = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/REASON_FOR_DISCONTINUATION`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setReasonForDiscontinuationOptions(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const getNewPrepStatus = (interruptionOption, allPrepInterruptions) => {
    const transformedInterruption =
      interruptionOption?.interruptionType?.toLowerCase();
    const newPrepInterruptionObj = allPrepInterruptions?.find(interruption =>
      transformedInterruption.includes(
        interruption?.display?.replace(/\s/g, '_').toLowerCase()
      )
    );
    return newPrepInterruptionObj;
  };

  const handleInputChange = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.name === 'interruptionType') {
      switch (e.target.value) {
        case 'PREP_STATUS_STOPPED':
          setObjValues({
            ...objValues,
            reasonStopped: '',
            reasonStoppedOthers: '',
          });
          break;
        case 'PREP_STATUS_DEAD':
          setObjValues({
            ...objValues,
            causeOfDeath: '',
            sourceOfDeathInfo: '',
            dateClientDied: '',
          });
          break;
        case 'PREP_STATUS_RESTART':
          setObjValues({ ...objValues, dateRestartPlacedBackMedication: '' });
          break;
        case 'PREP_STATUS_TRANSFER_OUT':
          setObjValues({
            ...objValues,
            dateClientReferredOut: '',
            facilityReferredTo: '',
          });
          break;
        case 'PREP_STATUS_SEROCONVERTED':
          setObjValues({ ...objValues, linkToArt: '', dateSeroconverted: '' });
          break;
        default:
          break;
      }
    }
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let temp = { ...errors };
    // if (
    //   containsDiscontinued(objValues.interruptionType) &&
    //   !objValues.reasonForPrepDiscontinuation
    // ) {
    //   temp.reasonForPrepDiscontinuation = 'This field is required';
    // }
    if (
      (objValues.interruptionType === 'PREP_STATUS_ADVERSE_DRUG_REACTION' ||
        objValues.interruptionType === 'PREP_STATUS_STOPPED' ||
        objValues.interruptionType === 'PREP_STATUS_LOSS_TO_FOLLOW_UP') &&
      !objValues.interruptionDate
    ) {
      temp.interruptionDate = 'This field is required';
    }
    if (
      objValues.interruptionType === 'PREP_STATUS_TRANSFER_OUT' &&
      !objValues.dateClientReferredOut
    ) {
      temp.dateClientReferredOut = 'This field is required';
    }
    if (
      objValues.interruptionType === 'PREP_STATUS_DEAD' &&
      !objValues.dateClientDied
    ) {
      temp.dateClientDied = 'This field is required';
    }
    if (!objValues.interruptionType) {
      temp.interruptionType = 'This field is required';
    }
    setErrors({ ...temp });
    return Object.values(temp).every(x => x === '');
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (
      objValues.interruptionDate === '' &&
      objValues.dateSeroconverted !== ''
    ) {
      objValues.interruptionDate = objValues.dateSeroconverted;
    } else if (
      objValues.interruptionDate === '' &&
      objValues.dateRestartPlacedBackMedication !== ''
    ) {
      objValues.interruptionDate = objValues.dateRestartPlacedBackMedication;
    } else if (
      objValues.interruptionDate === '' &&
      objValues.dateClientReferredOut !== ''
    ) {
      objValues.interruptionDate = objValues.dateClientReferredOut;
    } else if (
      objValues.interruptionDate === '' &&
      objValues.dateClientDied !== ''
    ) {
      objValues.interruptionDate = objValues.dateClientDied;
    }
    if (validate()) {
      objValues.previousPrepStatus = props.patientObj?.prepStatus;
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === 'update') {
        axios
          .put(
            `${baseUrl}prep-interruption/${props.activeContent.id}`,
            objValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then(response => {
            setSaving(false);
            toast.success('👍 Record saved successfully! ✔');
            props.PatientObject();
            props.setActiveContent({
              ...props.activeContent,
              route: 'recent-history',
            });
          })
          .catch(error => {
            setSaving(false);
            handleError(error);
          });
      } else {
        axios
          .post(`${baseUrl}prep/interruption`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            const newStatus = getNewPrepStatus(response.data, prepStatus);
            setSaving(false);
            toast.success('👍 Record saved successfully! ✔');
            props.PatientObject();
            props.setActiveContent({
              ...props.activeContent,
              route: 'recent-history',
              obj: { newStatus },
            });
          })
          .catch(error => {
            setSaving(false);
            handleError(error);
          });
      }
    }
  };

  const handleError = error => {
    if (error.response && error.response.data) {
      let errorMessage =
        error.response.data.apierror &&
        error.response.data.apierror.message !== ''
          ? error.response.data.apierror.message
          : '❌ Something went wrong. Please try again...';
      toast.error(errorMessage);
    } else {
      toast.error('❌ Something went wrong. Please try again...');
    }
  };

  useEffect(() => {
    getReasonForDiscontinuationOptions();
  }, []);

  useEffect(() => {
    return () => {
      if (!['view', 'update'].includes(props.activeContent.actionType)) {
        setObjValues(prevValues => ({
          ...prevValues,
          dateInterruption: '',
          dateRestartPlacedBackMedication: '',
          causeOfDeath: '',
          dateClientDied: '',
          dateClientReferredOut: '',
          facilityReferredTo: '',
          interruptionDate: '',
          sourceOfDeathInfo: '',
          dateSeroconverted: '',
          reasonStopped: '',
          reasonStoppedOthers: '',
          reasonForPrepDiscontinuation: '',
        }));

        setErrors(prevErrors => ({
          ...prevErrors,
          interruptionDate: '',
          reasonStopped: '',
          reasonStoppedOthers: '',
          dateClientReferredOut: '',
          facilityReferredTo: '',
          dateClientDied: '',
          causeOfDeath: '',
          sourceOfDeathInfo: '',
          dateRestartPlacedBackMedication: '',
          dateSeroconverted: '',
          reasonForPrepDiscontinuation: '',
        }));
      }
    };
  }, [objValues.interruptionType]);

  useEffect(() => {
    GetPatientInterruption(props.activeContent.id);
  }, [props.activeContent.id]);

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              <h2>PrEP Client Tracking & Discontinuations/Interruptions</h2>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="uniqueId">
                    PrEP Interruptions <span style={{ color: 'red' }}> *</span>
                  </Label>
                  <Input
                    type="select"
                    name="interruptionType"
                    id="interruptionType"
                    onChange={handleInputChange}
                    value={objValues.interruptionType}
                    required
                    style={{ border: '1px solid #014D88' }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    {prepStatus
                      .filter(interruption => interruption?.id !== 743)
                      .map(value => (
                        <option key={value.id} value={value.code}>
                          {value.display}
                        </option>
                      ))}
                    {/* <option value="PREP_INTERRUPtIONS_DISCONTINUED_ORAL_PREP">
                      Discontinued Oral PrEP
                    </option>
                    <option value="PREP_INTERRUPtIONS_DISCONTINUED_CABLA">
                      Discontinued CAB-LA
                    </option> */}
                  </Input>
                  {errors.interruptionType !== '' ? (
                    <span className={classes.error}>
                      {errors.interruptionType}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              {(objValues.interruptionType ===
                'PREP_STATUS_ADVERSE_DRUG_REACTION' ||
                objValues.interruptionType === 'PREP_STATUS_STOPPED' ||
                objValues.interruptionType ===
                  'PREP_INTERRUPtIONS_DISCONTINUED_ORAL_PREP' ||
                objValues.interruptionType ===
                  'PREP_INTERRUPtIONS_DISCONTINUED_CABLA' ||
                objValues.interruptionType ===
                  'PREP_STATUS_LOSS_TO_FOLLOW_UP') && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label for="uniqueId">
                      Date of Interruption{' '}
                      <span style={{ color: 'red' }}> *</span>
                    </Label>
                    <Input
                      type="date"
                      onKeyDown={e => {
                        e.preventDefault();
                      }}
                      name="interruptionDate"
                      id="interruptionDate"
                      min={
                        patientDto && patientDto.dateEnrolled
                          ? patientDto.dateEnrolled
                          : ''
                      }
                      max={moment(new Date()).format('YYYY-MM-DD')}
                      onChange={handleInputChange}
                      value={objValues.interruptionDate}
                      required
                      disabled={disabledField}
                    />
                    {errors.interruptionDate !== '' ? (
                      <span className={classes.error}>
                        {errors.interruptionDate}
                      </span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
              )}
              {objValues.interruptionType === 'PREP_STATUS_STOPPED' && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Reason Stopped </Label>
                      <Input
                        type="select"
                        name="reasonStopped"
                        id="reasonStopped"
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={objValues.reasonStopped}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {reasonStooped.map(value => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.reasonStopped !== '' ? (
                        <span className={classes.error}>
                          {errors.reasonStopped}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  {objValues.reasonStopped === 'Others (Pls specify)' && (
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label for="uniqueId">Other Reason Stopped </Label>
                        <Input
                          type="text"
                          name="reasonStoppedOthers"
                          id="reasonStoppedOthers"
                          max={moment(new Date()).format('YYYY-MM-DD')}
                          onChange={handleInputChange}
                          value={objValues.reasonStoppedOthers}
                          disabled={disabledField}
                        ></Input>
                        {errors.reasonStoppedOther !== '' ? (
                          <span className={classes.error}>
                            {errors.reasonStopped}
                          </span>
                        ) : (
                          ''
                        )}
                      </FormGroup>
                    </div>
                  )}
                </>
              )}
              {objValues.interruptionType === 'PREP_STATUS_TRANSFER_OUT' && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Date of client referred out </Label>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="dateClientReferredOut"
                        id="dateClientReferredOut"
                        min={
                          patientDto && patientDto.dateEnrolled
                            ? patientDto.dateEnrolled
                            : ''
                        }
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={
                          objValues.dateClientReferredOut ||
                          objValues.interruptionDate
                        }
                        required
                        disabled={disabledField}
                      />
                      {errors.dateClientReferredOut !== '' ? (
                        <span className={classes.error}>
                          {errors.dateClientReferredOut}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Facility referred to </Label>
                      <Input
                        type="text"
                        name="facilityReferredTo"
                        id="facilityReferredTo"
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={objValues.facilityReferredTo}
                        required
                        disabled={disabledField}
                      />
                      {errors.facilityReferredTo !== '' ? (
                        <span className={classes.error}>
                          {errors.facilityReferredTo}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                </>
              )}
              {objValues.interruptionType === 'PREP_STATUS_DEAD' && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Date of Client's Death </Label>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="dateClientDied"
                        id="dateClientDied"
                        min={
                          patientDto && patientDto.dateEnrolled
                            ? patientDto.dateEnrolled
                            : ''
                        }
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={
                          objValues.dateClientDied || objValues.interruptionDate
                        }
                        required
                        disabled={disabledField}
                      />
                      {errors.dateClientDied !== '' ? (
                        <span className={classes.error}>
                          {errors.dateClientDied}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Cause of death</Label>
                      <Input
                        type="select"
                        name="causeOfDeath"
                        id="causeOfDeath"
                        min={
                          patientDto && patientDto.dateEnrolled
                            ? patientDto.dateEnrolled
                            : ''
                        }
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={objValues.causeOfDeath}
                        required
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {causeOfDeath.map(value => (
                          <option key={value.id} value={value.display}>
                            {value.display}
                          </option>
                        ))}
                      </Input>
                      {errors.causeOfDeath !== '' ? (
                        <span className={classes.error}>
                          {errors.causeOfDeath}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Source of death information </Label>
                      <Input
                        type="text"
                        name="sourceOfDeathInfo"
                        id="sourceOfDeathInfo"
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={objValues.sourceOfDeathInfo}
                        required
                        disabled={disabledField}
                      />
                      {errors.sourceOfDeathInfo !== '' ? (
                        <span className={classes.error}>
                          {errors.sourceOfDeathInfo}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                </>
              )}
              {objValues.interruptionType === 'PREP_STATUS_RESTART' && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>Date of restart if placed back on medication</Label>
                    <Input
                      className="form-control"
                      type="date"
                      onKeyDown={e => e.preventDefault()}
                      name="dateRestartPlacedBackMedication"
                      id="dateRestartPlacedBackMedication"
                      min={
                        patientDto && patientDto.dateEnrolled
                          ? patientDto.dateEnrolled
                          : ''
                      }
                      max={moment(new Date()).format('YYYY-MM-DD')}
                      value={objValues.dateRestartPlacedBackMedication}
                      onChange={handleInputChange}
                      disabled={disabledField}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.2rem',
                      }}
                    />
                    {errors.dateRestartPlacedBackMedication !== '' ? (
                      <span className={classes.error}>
                        {errors.dateRestartPlacedBackMedication}
                      </span>
                    ) : (
                      ''
                    )}
                  </FormGroup>
                </div>
              )}
              {objValues.interruptionType === 'PREP_STATUS_SEROCONVERTED' && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label for="uniqueId">Date Seroconverted </Label>
                      <Input
                        type="date"
                        onKeyDown={e => e.preventDefault()}
                        name="dateSeroconverted"
                        id="dateSeroconverted"
                        min={
                          patientDto && patientDto.dateEnrolled
                            ? patientDto.dateEnrolled
                            : ''
                        }
                        max={moment(new Date()).format('YYYY-MM-DD')}
                        onChange={handleInputChange}
                        value={
                          objValues.dateSeroconverted ||
                          objValues.interruptionDate
                        }
                        required
                        disabled={disabledField}
                      />
                      {errors.dateSeroconverted !== '' ? (
                        <span className={classes.error}>
                          {errors.dateSeroconverted}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>Link to ART</Label>
                      <Input
                        type="select"
                        name="linkToArt"
                        id="linkToArt"
                        onChange={handleInputChange}
                        value={objValues.linkToArt}
                        disabled={disabledField}
                      >
                        <option value=""> Select</option>
                        <option value="true">Yes </option>
                        <option value="false"> No</option>
                      </Input>
                      {errors.linkToArt !== '' ? (
                        <span className={classes.error}>
                          {errors.linkToArt}
                        </span>
                      ) : (
                        ''
                      )}
                    </FormGroup>
                  </div>
                  {objValues.linkToArt === 'true' && (
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>Date link to ART</Label>
                        <Input
                          className="form-control"
                          type="date"
                          onKeyDown={e => e.preventDefault()}
                          name="dateLinkToArt"
                          id="dateLinkToArt"
                          min={
                            patientDto && patientDto.dateEnrolled
                              ? patientDto.dateEnrolled
                              : ''
                          }
                          max={moment(new Date()).format('YYYY-MM-DD')}
                          value={objValues.dateLinkToArt}
                          onChange={handleInputChange}
                          disabled={disabledField}
                          style={{
                            border: '1px solid #014D88',
                            borderRadius: '0.2rem',
                          }}
                        />
                        {errors.dateLinkToArt !== '' ? (
                          <span className={classes.error}>
                            {errors.dateLinkToArt}
                          </span>
                        ) : (
                          ''
                        )}
                      </FormGroup>
                    </div>
                  )}
                </>
              )}
              {/* {containsDiscontinued(objValues.interruptionType) ? (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>Reason for discontinuation</Label>
                    <span style={{ color: 'red' }}> *</span>
                    <Input
                      type="text"
                      name="reasonForPrepDiscontinuation"
                      id="reasonForPrepDiscontinuation"
                      value={objValues.reasonForPrepDiscontinuation}
                      placeholder="Enter reason for PrEP discontinuation..."
                      onChange={handleInputChange}
                      style={{
                        border: '1px solid #014D88',
                        borderRadius: '0.25rem',
                      }}
                      disabled={disabledField}
                    ></Input>
                  </FormGroup>
                  {errors.reasonForPrepDiscontinuation !== '' ? (
                    <span className={classes.error}>
                      {errors.reasonForPrepDiscontinuation}
                    </span>
                  ) : (
                    ''
                  )}
                </div>
              ) : null} */}
            </div>
            {saving ? <Spinner /> : ''}
            <br />
            {props.activeContent.actionType !== 'view' && (
              <>
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  style={{ backgroundColor: '#014d88', fontWeight: 'bolder' }}
                >
                  {!saving ? (
                    <span style={{ textTransform: 'capitalize' }}>Save</span>
                  ) : (
                    <span style={{ textTransform: 'capitalize' }}>
                      Saving...
                    </span>
                  )}
                </MatButton>
                <MatButton
                  variant="contained"
                  className={classes.button}
                  startIcon={<CancelIcon />}
                  onClick={props.toggle}
                  style={{ backgroundColor: '#992E62' }}
                >
                  <span style={{ textTransform: 'capitalize', color: '#fff' }}>
                    {' '}
                    Cancel{' '}
                  </span>
                </MatButton>
              </>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrEPEligibiltyScreeningForm;

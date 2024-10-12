import React, { useState, useEffect } from 'react';
import { Form, Row, Card, CardBody, FormGroup, Label, Input } from 'reactstrap';
import MatButton from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
// import { Alert } from 'reactstrap';
// import { Spinner } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url as baseUrl, token } from '../../../api';
import { useHistory } from 'react-router-dom';
//import {  Modal, Button } from "react-bootstrap";
import 'react-widgets/dist/css/react-widgets.css';
//import { DateTimePicker } from "react-widgets";
import PhoneInput from 'react-phone-input-2';
// import momentLocalizer from "react-widgets-moment";
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

const PrEPRegistrationForm = props => {
  ///const patientObj = props.patientObj;
  const [entryPoint, setEntryPoint] = useState([]);
  //let history = useHistory();
  const classes = useStyles();
  const [objValues, setObjValues] = useState({
    dateEnrolled: '',
    dateReferred: '',
    extra: {},
    personId: 0,
    prepEligibilityUuid: '',
    riskType: '',
    supporterName: '',
    supporterPhone: '',
    supporterRelationshipType: '',
    uniqueId: '',
    hivTestingPoint: '',
    dateOfLastHivNegativeTest: '',
    targetGroup: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [prepRisk, setPrepRisk] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [patientDto, setPatientDto] = useState();
  const [disabledField, setSisabledField] = useState(false);
  const [targetGroupValue, setTargetGroupValue] = useState('');
  useEffect(() => {
    GetPatientDTOObj();
    RELATIONSHIP();
    PREP_RISK_TYPE();
    EntryPoint();
    if (
      props.activeContent.id &&
      props.activeContent.id !== '' &&
      props.activeContent.id !== null
    ) {
      GetPatientPrepEnrollment(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === 'view' ? true : false
      );
    }
    //GetPatientPrepEnrollment
  }, []);
  const getTargetGroupvalue = () => {
    axios
      .get(`${baseUrl}hts/persons/${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        //console.log(response.data?.htsClientDtoList[0]?.targetGroup);
        setTargetGroupValue(response.data?.htsClientDtoList[0]?.targetGroup);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const EntryPoint = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/HTS_ENTRY_POINT`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        //console.log(response.data);
        setEntryPoint(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const RELATIONSHIP = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/RELATIONSHIP`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setRelatives(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const PREP_RISK_TYPE = () => {
    axios
      .get(`${baseUrl}application-codesets/v2/PREP_RISK_TYPE`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPrepRisk(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const GetPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${props.patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        //console.log(response.data)
        setPatientDto(response.data);
        getTargetGroupvalue();
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const GetPatientPrepEnrollment = id => {
    axios
      .get(`${baseUrl}prep/enrollment/person/${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        //console.log(response.data.find((x)=> x.id===id));
        setObjValues(response.data.find(x => x.id === id));
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const handleInputChange = e => {
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };
  const checkPhoneNumberBasic = (e, inputName) => {
    const limit = 10;
    setObjValues({ ...objValues, [inputName]: e.slice(0, limit) });
  };

  const validate = () => {
    let temp = { ...errors };
    temp.dateEnrolled = objValues.dateEnrolled ? '' : 'This field is required';
    temp.dateReferred = objValues.dateReferred ? '' : 'This field is required';
    temp.riskType = objValues.riskType ? '' : 'This field is required';
    //temp.supporterName = objValues.supporterName ? "" : "This field is required"
    //temp.supporterPhone = objValues.supporterPhone ? "" : "This field is required"
    //temp.supporterRelationshipType = objValues.supporterRelationshipType ? "" : "This field is required"
    temp.uniqueId = objValues.uniqueId ? '' : 'This field is required';
    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x == '');
  };
  /**** Submit Button Processing  */
  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      objValues.personId = props.patientObj.personId;
      objValues.prepEligibilityUuid = patientDto.uuid;
      objValues.targetGroup = targetGroupValue;
      //console.log("prep", objValues);
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType) {
        axios
          .put(
            `${baseUrl}prep-enrollment/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(response => {
            setSaving(false);
            props.patientObj.prepCount = '1';
            props.PatientObject();
            toast.success('Prep Enrollment save successful!', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: 'recent-history',
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error('Something went wrong');
          });
      } else {
        axios
          .post(`${baseUrl}prep/enrollment`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            props.patientObj.prepCount = '1';
            toast.success('Prep Enrollment save successful!', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: 'recent-history',
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error('Something went wrong');
          });
      }
    } else {
      toast.error('All fields are required ', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  return (
    <div>
      <Card>
        <CardBody>
          <form>
            <div className="row">
              <h2>PrEP Enrollment </h2>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="uniqueId">
                    Unique Client's ID <span style={{ color: 'red' }}> *</span>{' '}
                  </Label>
                  <Input
                    type="text"
                    name="uniqueId"
                    id="uniqueId"
                    onChange={handleInputChange}
                    value={objValues.uniqueId}
                    disabled={disabledField}
                    style={{ border: '1px solid #014D88' }}
                  />
                  {errors.uniqueId !== '' ? (
                    <span className={classes.error}>{errors.uniqueId}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="">Partner ANC/Unique ART No </Label>
                  <Input
                    type="text"
                    name="ancUniqueArtNo"
                    id="ancUniqueArtNo"
                    onChange={handleInputChange}
                    value={objValues.ancUniqueArtNo}
                    disabled={disabledField}
                    style={{ border: '1px solid #014D88' }}
                  />
                  {errors.ancUniqueArtNo !== '' ? (
                    <span className={classes.error}>
                      {errors.ancUniqueArtNo}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Date enrolled in PrEP{' '}
                    <span style={{ color: 'red' }}> *</span>
                  </Label>
                  <Input
                    className="form-control"
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="dateEnrolled"
                    id="dateEnrolled"
                    value={objValues.dateEnrolled}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.2rem',
                    }}
                    min={
                      patientDto && patientDto.visitDate
                        ? patientDto.visitDate
                        : ''
                    }
                    max={moment(new Date()).format('YYYY-MM-DD')}
                    disabled={disabledField}
                  />
                  {errors.dateEnrolled !== '' ? (
                    <span className={classes.error}>{errors.dateEnrolled}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="entryPointId">
                    PrEP Risk Type <span style={{ color: 'red' }}> *</span>
                  </Label>
                  <Input
                    type="select"
                    name="riskType"
                    id="riskType"
                    onChange={handleInputChange}
                    value={objValues.riskType}
                    disabled={disabledField}
                    style={{ border: '1px solid #014D88' }}
                  >
                    <option value=""> Select</option>
                    {prepRisk.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.riskType !== '' ? (
                    <span className={classes.error}>{errors.riskType}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>HIV Testing Point </Label>
                  <Input
                    type="select"
                    name="hivTestingPoint"
                    id="hivTestingPoint"
                    onChange={handleInputChange}
                    value={objValues.hivTestingPoint}
                    disabled={disabledField}
                    style={{ border: '1px solid #014D88' }}
                  >
                    <option value=""> Select</option>
                    {entryPoint.map(value => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Date of last HIV Negative test</Label>
                  <Input
                    className="form-control"
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="dateOfLastHivNegativeTest"
                    id="dateOfLastHivNegativeTest"
                    value={objValues.dateOfLastHivNegativeTest}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.2rem',
                    }}
                    max={moment(new Date()).format('YYYY-MM-DD')}
                    disabled={disabledField}
                  />
                  {errors.dateOfLastHivNegativeTest !== '' ? (
                    <span className={classes.error}>
                      {errors.dateOfLastHivNegativeTest}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Date Referred for PrEP{' '}
                    <span style={{ color: 'red' }}> *</span>{' '}
                  </Label>
                  <Input
                    className="form-control"
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="dateReferred"
                    id="dateReferred"
                    value={objValues.dateReferred}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.2rem',
                    }}
                    min={
                      patientDto && patientDto.visitDate
                        ? patientDto.visitDate
                        : ''
                    }
                    max={moment(new Date()).format('YYYY-MM-DD')}
                    disabled={disabledField}
                  />
                  {errors.dateReferred !== '' ? (
                    <span className={classes.error}>{errors.dateReferred}</span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>PrEP Supporter </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="supporterName"
                    id="supporterName"
                    value={objValues.supporterName}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem !important',
                    }}
                    disabled={disabledField}
                  />
                  {errors.supporterName !== '' ? (
                    <span className={classes.error}>
                      {errors.supporterName}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Relationship </Label>
                  <Input
                    className="form-control"
                    type="select"
                    name="supporterRelationshipType"
                    id="supporterRelationshipType"
                    value={objValues.supporterRelationshipType}
                    onChange={handleInputChange}
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.2rem',
                    }}
                    disabled={disabledField}
                  >
                    <option value=""> Select</option>

                    {relatives.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.supporterRelationshipType !== '' ? (
                    <span className={classes.error}>
                      {errors.supporterRelationshipType}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>PrEP Supporter Phone Number</Label>
                  <PhoneInput
                    containerStyle={{
                      width: '100%',
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem !important',
                    }}
                    style={{ borderRadius: '0.25rem !important' }}
                    inputStyle={{
                      width: '100%',
                      borderRadius: '0.25rem !important',
                    }}
                    country={'ng'}
                    placeholder="(234)7099999999"
                    maxLength={5}
                    name="supporterPhone"
                    id="supporterPhone"
                    masks={{ ng: '...-...-....', at: '(....) ...-....' }}
                    value={objValues.supporterPhone}
                    onChange={e => {
                      checkPhoneNumberBasic(e, 'supporterPhone');
                    }}
                    disabled={disabledField}
                  />
                  {errors.supporterPhone !== '' ? (
                    <span className={classes.error}>
                      {errors.supporterPhone}
                    </span>
                  ) : (
                    ''
                  )}
                </FormGroup>
              </div>
            </div>

            {saving ? <Spinner /> : ''}
            <br />
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
                  style={{
                    backgroundColor: '#014d88',
                    border: '1px solid #014D88',
                  }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: 'capitalize' }}>Update</span>
                  ) : (
                    <span style={{ textTransform: 'capitalize' }}>
                      Updating...
                    </span>
                  )}
                </MatButton>
              </>
            ) : (
              <>
                {!disabledField && (
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
                      <span style={{ textTransform: 'capitalize' }}>Save</span>
                    ) : (
                      <span style={{ textTransform: 'capitalize' }}>
                        Saving...
                      </span>
                    )}
                  </MatButton>
                )}
              </>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrEPRegistrationForm;

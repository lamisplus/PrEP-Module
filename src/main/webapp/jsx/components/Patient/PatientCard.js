import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import { Link } from 'react-router-dom';
import ButtonMui from '@material-ui/core/Button';
import { TiArrowBack } from 'react-icons/ti';
import Divider from '@material-ui/core/Divider';
import { Label } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Col, Row } from 'reactstrap';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import { AccordionSummary } from '@material-ui/core';
import { Alert as Reminder } from '../Consultation/Alert/Alert';
Moment.locale('en');
momentLocalizer();

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '20.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing}px ${theme.spacing(2)}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

function PatientCard(props) {
  const { classes } = props;
  const patientObj = props?.patientObj;

  const calculate_age = dob => {
    var today = new Date();
    var dateParts = dob.split('-');
    var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    var birthDate = new Date(dateObject);
    var age_now = today?.getFullYear() - birthDate?.getFullYear();
    var m = today?.getMonth() - birthDate?.getMonth();
    if (m < 0 || (m === 0 && today?.getDate() < birthDate?.getDate())) {
      age_now--;
    }
    if (age_now === 0) {
      return m + ' month(s)';
    }
    return age_now + ' year(s)';
  };
  const getHospitalNumber = identifier => {
    const identifiers = identifier;
    const hospitalNumber = identifiers?.identifier?.find?.(
      obj => obj.type === 'HospitalNumber'
    );
    return hospitalNumber ? hospitalNumber?.value : '';
  };
  const getPhoneNumber = identifier => {
    const identifiers = identifier;
    const phoneNumber = identifiers?.contactPoint?.find?.(
      obj => obj?.type === 'phone'
    );
    return phoneNumber ? phoneNumber?.value : '';
  };
  const getAddress = identifier => {
    console.log('identifier: ', identifier);
    const identifiers = identifier;
    const address = identifiers?.address?.find?.(obj => obj?.city);
    const houseAddress =
      Array.isArray(address?.line) && address?.line[0] != null
        ? address?.line[0]
        : '';
    const landMark =
      address && address?.city && address?.city !== null ? address?.city : '';
    return address ? houseAddress + ' ' + landMark : '';
  };
  const reminderConfig = useMemo(() => {
    return [
      null,
      {
        title: 'Upcoming CabLA Appointment!',
        body: `CabLA appointment is due tommorrow`,
      },
      {
        title: 'Missed CabLA Appointment!',
        body: `CabLA appointment is overdue!`,
      },
    ];
  }, []);
  const getReminderAlert = sendCabLaAlert => reminderConfig[sendCabLaAlert];

  const [showReminder, setShowReminder] = useState(0);
  const toggleModal = () => setShowReminder(0);

  useEffect(() => {
    setShowReminder(patientObj?.sendCabLaAlert);
  }, []);

  return (
    <div className={classes.root}>
      {/* <Reminder
        show={showReminder}
        title={showReminder?.title}
        body={showReminder?.body}
        patientObj={patientObj}
        onClose={toggleModal}
        nextAppointmentDate={Date()}
      /> */}
      <Accordion>
        <AccordionSummary>
          <Row>
            <Col md={12}>
              {patientObj && patientObj !== null ? (
                <>
                  <Row className={'mt-1'}>
                    <Col md={12} className={classes?.root2}>
                      <b
                        style={{ fontSize: '25px', color: 'rgb(153, 46, 98)' }}
                      >
                        {patientObj?.firstName + ' ' + patientObj?.surname}
                      </b>
                      <Link to={'/'}>
                        <ButtonMui
                          variant="contained"
                          color="primary"
                          className=" float-end ms-2 mr-2 mt-2"
                          startIcon={<TiArrowBack />}
                          style={{
                            backgroundColor: 'rgb(153, 46, 98)',
                            color: '#fff',
                            height: '35px',
                          }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>
                            Back
                          </span>
                        </ButtonMui>
                      </Link>
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {' '}
                        Patient ID :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {patientObj?.hospitalNumber}
                        </b>
                      </span>
                    </Col>

                    <Col md={4} className={classes.root2}>
                      <span>
                        Date Of Birth :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {patientObj?.dateOfBirth}
                        </b>
                      </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {' '}
                        Age :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {calculate_age(
                            moment(patientObj?.dateOfBirth).format('DD-MM-YYYY')
                          )}
                        </b>
                      </span>
                    </Col>
                    <Col md={4}>
                      <span>
                        {' '}
                        Gender :{' '}
                        <b style={{ color: '#0B72AA' }}>{patientObj?.gender}</b>
                      </span>
                    </Col>
                    <Col md={4}>
                      <span>
                        {' '}
                        Sex at Birth :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {patientObj?.sexAtBirth || patientObj?.gender}
                        </b>
                      </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {' '}
                        Phone Number :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {patientObj?.phoneNumber}
                        </b>
                      </span>
                    </Col>
                    <Col md={6} className={classes.root2}>
                      <span>
                        {' '}
                        Address :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {patientObj?.address}{' '}
                        </b>
                      </span>
                    </Col>
                    {patientObj?.prepStatus !== null && (
                      <Col md={12}>
                        <div>
                          <Typography variant="caption">
                            <Label color={'teal'} size={'mini'}>
                              STATUS :{' '}
                              {props.activeContent?.obj?.newStatus?.display ||
                                patientObj?.prepStatus}
                            </Label>
                          </Typography>
                        </div>
                      </Col>
                    )}
                  </Row>
                </>
              ) : (
                <>
                  <p>Loading please wait..</p>
                </>
              )}
            </Col>
          </Row>
        </AccordionSummary>
        <Divider />
      </Accordion>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);

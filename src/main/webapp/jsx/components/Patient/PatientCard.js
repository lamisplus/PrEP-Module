import React, { useState, useEffect } from 'react';
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
import { AccordionSummary, CircularProgress } from '@material-ui/core';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom';
import ContentLoader from 'react-content-loader';

import PatientDetail from './PatientDetail';
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
  const history = useLocation();
  const patientObj = history?.state?.patientObj || props?.patientObj;

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
  function formatAddressStrict(addressObj) {
    if (
      !addressObj?.address ||
      !Array.isArray(addressObj.address) ||
      !addressObj.address.length
    ) {
      return;
    }

    const firstAddress = addressObj.address[0];
    if (!firstAddress || !Array.isArray(firstAddress.line)) {
      return;
    }

    const line = firstAddress.line[0];
    const city = firstAddress.city?.trim() || '';
    return `${line}, ${city}`;
  }
  function extractPhoneNumber(personObject) {
    if (
      !personObject ||
      !personObject.personResponseDto ||
      !personObject.personResponseDto.contactPoint
    ) {
      return null;
    }
    const contactPoints =
      personObject.personResponseDto.contactPoint.contactPoint;
    const phoneContact = contactPoints.find(
      contact => contact.type === 'phone'
    );
    return phoneContact ? phoneContact.value : null;
  }
  function sanitizeInput(input) {
    const falsyStrings = ['false', 'null', 'undefined', '', '0'];

    if (
      !input ||
      falsyStrings.includes(input.toString().toLowerCase().trim())
    ) {
      return '';
    }

    return input;
  }
  return (
    <div className={classes.root}>
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
                        {sanitizeInput(
                          patientObj?.fullname ||
                            `${
                              patientObj?.firstName + ' ' + patientObj?.surname
                            }`
                        )}
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
                          {sanitizeInput(
                            patientObj?.hospitalNumber ||
                              props?.patientDetail?.personResponseDto
                                ?.identifier?.identifier[0].value
                          )}
                        </b>
                      </span>
                    </Col>

                    <Col md={4} className={classes.root2}>
                      <span>
                        Date Of Birth :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {sanitizeInput(
                            patientObj?.dateOfBirth ||
                              props?.patientDetail?.personResponseDto
                                ?.dateOfBirth
                          )}
                        </b>
                      </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {' '}
                        Age :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {sanitizeInput(
                            calculate_age(
                              moment(
                                patientObj?.dateOfBirth ||
                                  props?.patientDetail?.personResponseDto
                                    ?.dateOfBirth
                              ).format('DD-MM-YYYY')
                            )
                          )}
                        </b>
                      </span>
                    </Col>
                    <Col md={4}>
                      <span>
                        {' '}
                        Gender :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {sanitizeInput(
                            patientObj?.sex ||
                              patientObj?.gender ||
                              props?.patientDetail?.personResponseDto?.sex
                          )}
                        </b>
                      </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {' '}
                        Phone Number :{' '}
                        <b style={{ color: '#0B72AA' }}>
                          {sanitizeInput(
                            extractPhoneNumber(props?.patientDetail) ||
                              patientObj?.phoneNumber
                          )}
                        </b>
                      </span>
                    </Col>
                    <Col md={6} className={classes.root2}>
                      <span>
                        {' '}
                        Address :{' '}
                        {!props.patientDetail ? (
                          <ContentLoader
                            speed={2}
                            width={500}
                            viewBox="0 0 1000 50"
                            backgroundColor="#333"
                            foregroundColor="#555"
                          >
                            <rect
                              x="0"
                              y="15"
                              rx="5"
                              ry="5"
                              width="100"
                              height="20"
                            />
                          </ContentLoader>
                        ) : (
                          <span>
                            <b style={{ color: '#0B72AA' }}>
                              {sanitizeInput(
                                patientObj?.address ||
                                  formatAddressStrict(
                                    props.patientDetail?.personResponseDto
                                      ?.address
                                  )
                              )}{' '}
                            </b>
                          </span>
                        )}
                      </span>
                    </Col>
                    {patientObj?.prepStatus !== null && (
                      <Col md={12}>
                        <div>
                          <Typography variant="caption">
                            <Label color={'teal'} size={'mini'}>
                              STATUS :{' '}
                              {sanitizeInput(
                                props?.patientDetail?.prepStatus
                              ) || <CircularProgress color="#fff" size={10} />}
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

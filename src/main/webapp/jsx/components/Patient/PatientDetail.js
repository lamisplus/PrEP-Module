import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PatientCardDetail from './PatientCard';
import { useHistory } from 'react-router-dom';
import SubMenu from './SubMenu';
import RecentHistory from './../History/RecentHistory';
import PatientHistory from './../History/PatientHistory';
import ClinicVisit from '../Consultation/Index';
import PrEPCommencementForm from './../PrepServices/PrEPCommencementForm';
import PrEPDiscontinuationsInterruptions from './../PrepServices/PrEPDiscontinuationsInterruptions';
import PrEPEligibiltyScreeningForm from './../PrepServices/PrEPEligibiltyScreeningForm';
import PrEPVisit from './../PrepServices/PrEPVisit';
import PrEPRegistrationForm from './../PrepServices/PrEPRegistrationForm';
import Biometrics from './Biometric';
import axios from 'axios';
import { url as baseUrl, token } from './../../../api';

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
  let history = useHistory();
  const [patientDetail, setPatientDetail] = useState('');
  const [activeContent, setActiveContent] = useState({
    route: 'recent-history',
    id: '',
    activeTab: 'home',
    actionType: 'create',
    obj: {},
  });
  const { classes } = props;

  const patientObjLocation =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};
  const prepId =
    history.location && history.location.state
      ? history.location.state.prepId
      : {};

  useEffect(() => {
    PatientObject();
  }, []);

  async function PatientObject() {
    axios
      .get(`${baseUrl}prep/persons/${patientObjLocation.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setPatientDetail(response.data);
      })
      .catch(error => {});
  }

  return (
    <div className={classes.root}>
      <div
        className="row page-titles mx-0"
        style={{ marginTop: '0px', marginBottom: '-10px' }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>
              {' '}
              <Link to={'/'}>PrEP /</Link> Patient Dashboard
            </h4>
          </li>
        </ol>
      </div>
      <Card>
        <CardContent>
          <PatientCardDetail
            patientObj={patientObjLocation}
            setActiveContent={setActiveContent}
            activeContent={activeContent}
            patientDetail={patientDetail}
          />
          <SubMenu
            patientObj={patientObjLocation}
            setActiveContent={setActiveContent}
            patientDetail={patientDetail}
          />
          <br />

          {activeContent.route === 'recent-history' && (
            <RecentHistory
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
            />
          )}
          {activeContent.route === 'biometrics' && (
            <Biometrics
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
            />
          )}
          {activeContent.route === 'consultation' && (
            <ClinicVisit
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
            />
          )}
          {activeContent.route === 'prep-commencement' && (
            <PrEPCommencementForm
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              PatientObject={PatientObject}
            />
          )}
          {activeContent.route === 'prep-interruptions' && (
            <PrEPDiscontinuationsInterruptions
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              PatientObject={PatientObject}
            />
          )}
          {activeContent.route === 'prep-screening' && (
            <PrEPEligibiltyScreeningForm
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              patientDetail={patientDetail}
              PatientObject={PatientObject}
            />
          )}
          {activeContent.route === 'prep-visit' && (
            <PrEPVisit PatientObject={PatientObject} />
          )}
          {activeContent.route === 'prep-registration' && (
            <PrEPRegistrationForm
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              PatientObject={PatientObject}
            />
          )}
          {activeContent.route === 'patient-history' && (
            <PatientHistory
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);

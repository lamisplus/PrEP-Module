import React from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './main/webapp/vendor/bootstrap-select/dist/css/bootstrap-select.min.css';
import './../src/main/webapp/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import Home from './main/webapp/jsx/components/Home';
import PatientDetail from './main/webapp/jsx/components/Patient/PatientDetail';
import UpdatePatientEnrollment from './main/webapp/jsx/components/Patient/UpdatePatientEnrollment';
import { AuthProvider } from './main/webapp/context/AuthProvider/AuthProvider';
import './../src/main/webapp/css/alert.css';
import CheckedInPatientsAlert from './Globals/CheckedInPatientAlert/CheckedInPatientAlert';

export default function App() {
  return (
    <div style={{ marginTop: '3em' }}>
      <Router>
        <AuthProvider>
          <CheckedInPatientsAlert />
          <div>
            <ToastContainer />
            <Switch>
              <Route path="/patient-dashboard">
                <PatientDetail />
              </Route>
              <Route path="/update-patient">
                <UpdatePatientEnrollment />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </AuthProvider>
      </Router>
    </div>
  );
}

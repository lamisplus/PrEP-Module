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
import { usePrepRegimen } from './main/webapp/hooks/vistUtils/usePrepCodeSet';

export default function App() {
  return (
    <div style={{ marginTop: '3em' }}>
      <Router>
        <div>
          <ToastContainer />
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/patient-dashboard">
              {/* This is the component to access patient dashboard */}
              <PatientDetail />
            </Route>

            <Route path="/update-patient">
              <UpdatePatientEnrollment />
            </Route>

            <Route path="/">
              {/* This is the entry point to the application */}
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

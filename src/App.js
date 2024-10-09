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

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}

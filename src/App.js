import React, { useEffect, useState } from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './main/webapp/vendor/bootstrap-select/dist/css/bootstrap-select.min.css';
import './../src/main/webapp/css/style.css';
import 'bootstrap/dist/css/bootstrap.css';
import Home from './main/webapp/jsx/components/Home';
import PatientDetail from './main/webapp/jsx/components/Patient/PatientDetail';
import UpdatePatientEnrollment from './main/webapp/jsx/components/Patient/UpdatePatientEnrollment';
import { PermissionService } from './main/webapp/Utils/permissions';
import { token, url as baseUrl } from './main/webapp/api';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function App() {
  const [roles, setRoles] = useState(null);
  const getAccount = async () => {
    try {
      const response = await axios.get(`${baseUrl}account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Cookies.set('facilityName', response.data.currentOrganisationUnitName);
      setRoles(response.data?.permissions);
      return response.data;
    } catch (e) {}
  };

  const userRole = 'user';
  const permissionService = new PermissionService(userRole);
  const accessibleForms = permissionService.getAccessibleForms();

  console.log('Roles: : ', roles);

  useEffect(() => {
    getAccount();
  }, []);
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

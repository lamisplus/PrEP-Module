import React from "react";
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main/webapp/vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./../src/main/webapp/css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import Home from "./main/webapp/jsx/components/Home";
import PatientDetail from "./main/webapp/jsx/components/Patient/PatientDetail";
import UpdatePatientEnrollment from "./main/webapp/jsx/components/Patient/UpdatePatientEnrollment";
import { AuthProvider } from "./main/webapp/context/AuthProvider/AuthProvider";
import CheckedInPatientsAlert from "./Globals/CheckedInPatientAlert/CheckedInPatientAlert";

const routes = [
  { path: "/patient-dashboard", component: () => <PatientDetail /> },
  { path: "/update-patient", component: () => <UpdatePatientEnrollment /> },
  { path: "/", component: () => <Home /> },
];

export default function App() {
  return (
    <div style={{ marginTop: "3em" }}>
      <Router>
        <AuthProvider>
          <CheckedInPatientsAlert />
          <ToastContainer />
          <Switch>
            {routes.map(({ path, component: ComponentPage }, index) => (
              <Route key={path} path={path}>
                <ComponentPage />
              </Route>
            ))}
          </Switch>
        </AuthProvider>
      </Router>
    </div>
  );
}

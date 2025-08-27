import React, {
  useState,
  Fragment,
  useEffect,
  Suspense,
  useMemo,
  memo,
} from "react";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";
import PatientList from "./Patient/PatientList";
import CheckedInPatients from "./Patient/CheckedInPatients";
import { useRoles } from "../../hooks/useRoles";
import NotEnrolledPatients from "./Patient/NotEnrolledPatientList";
import PatientsWithInterruptedPrepStatus from "./Patient/PatientsWithInterruptedPrepStatus";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const Home = () => {
  const { hasRole, loading: rolesLoading } = useRoles();
  const [key, setKey] = useState("home");
  const [activeTab, setActiveTab] = useState("home");

  const handleTabSelect = k => {
    setKey(k);
    setActiveTab(k);
  };

  const isRDE = hasRole("RDE");

  useEffect(() => {
    if (!rolesLoading) {
      const defaultTab = isRDE ? "home" : "checkedIn";
      setKey(defaultTab);
      setActiveTab(defaultTab);
    }
  }, [rolesLoading, isRDE]);

  const permissions = useMemo(
    () => ({
      canSeeCheckedInPatients: !isRDE, // POC users see this
      canSeeFindPatients: isRDE, // RDE users see this
      canSeeArtPatients: isRDE, // RDE users see this
      canSeeOvcLinkage: isRDE, // RDE users see this
    }),
    [isRDE]
  );

  return (
    <Fragment>
      <div style={{ marginTop: "3em" }} className="page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>PrEP</h4>
          </li>
        </ol>
      </div>
      <Row>
        <Col xl={12}>
          <Card style={divStyle}>
            <Card.Body>
              <div className="custom-tab-1">
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={k => setKey(k)}
                  className="mb-3"
                >
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="home" title="Patients">
                      <Suspense>
                        <PatientList />
                      </Suspense>
                    </Tab>
                  )}
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="not-enrolled" title="Pending Enrollments">
                      <Suspense>
                        <NotEnrolledPatients />
                      </Suspense>
                    </Tab>
                  )}
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="enrolled" title="Interrupted PrEP Clients">
                      <Suspense>
                        <PatientsWithInterruptedPrepStatus />
                      </Suspense>
                    </Tab>
                  )}
                  {permissions.canSeeCheckedInPatients && (
                    <Tab eventKey="checkedIn" title="Checked-In Patients">
                      <Suspense>
                        {activeTab === "checkedIn" && <CheckedInPatients />}
                      </Suspense>
                    </Tab>
                  )}
                </Tabs>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Home;

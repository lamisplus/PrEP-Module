import React, {
  useState,
  Fragment,
  useEffect,
  Suspense,
  useMemo,
  memo,
  lazy,
} from "react";
import { Row, Col, Card, Tab, Tabs, Spinner } from "react-bootstrap";
import { useRoles } from "../../hooks/useRoles";

// Tab content is code-split so the HIV Prevention landing page can render its
// shell (title + tabs row) on first paint. Each chunk is fetched only when
// its tab is first activated; once loaded it stays in memory so subsequent
// switches between tabs are instant. Without this split, all four heavy
// MaterialTable-based grids parsed before the page could render.
const PatientList = lazy(() => import("./Patient/PatientList"));
const CheckedInPatients = lazy(() => import("./Patient/CheckedInPatients"));
const NotEnrolledPatients = lazy(() => import("./Patient/NotEnrolledPatientList"));
const PepEnrolledPatients = lazy(() => import("./Patient/PepEnrolledPatientList"));

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const TabLoading = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
    <Spinner animation="border" role="status" variant="primary" />
  </div>
);

const Home = () => {
  const { hasRole, loading: rolesLoading } = useRoles();
  const [key, setKey] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  // Tabs that have ever been activated; their child components stay mounted
  // after the first visit so subsequent tab switches are instant (no refetch).
  // The initial Set already contains the default tab so its content renders
  // on first paint.
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(["home"]));

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

  // Mark a tab visited the first time it becomes active. Without this, every
  // tab on this page mounts simultaneously on first paint and fires three
  // concurrent expensive grid queries — what was causing the ~10s landing
  // delay.
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

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
            <h4>PrEP/PEP</h4>
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
                  onSelect={handleTabSelect}
                  className="mb-3"
                  // Render only the active tab's pane in the DOM; this is what
                  // lets the `visitedTabs` guards below actually take effect.
                  // Without it react-bootstrap keeps every tab's children
                  // attached and the mount-time fetches fire anyway.
                  mountOnEnter
                  unmountOnExit={false}
                >
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="home" title="Patients">
                      <Suspense fallback={<TabLoading />}>
                        {visitedTabs.has("home") && <PatientList />}
                      </Suspense>
                    </Tab>
                  )}
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="not-enrolled" title="PrEP Enrolments">
                      <Suspense fallback={<TabLoading />}>
                        {visitedTabs.has("not-enrolled") && <NotEnrolledPatients />}
                      </Suspense>
                    </Tab>
                  )}
                  {permissions.canSeeFindPatients && (
                    <Tab eventKey="pep-enrolled" title="PEP Enrollments">
                      <Suspense fallback={<TabLoading />}>
                        {visitedTabs.has("pep-enrolled") && <PepEnrolledPatients />}
                      </Suspense>
                    </Tab>
                  )}
                  {permissions.canSeeCheckedInPatients && (
                    <Tab eventKey="checkedIn" title="Checked-In Patients">
                      <Suspense fallback={<TabLoading />}>
                        {visitedTabs.has("checkedIn") && <CheckedInPatients />}
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

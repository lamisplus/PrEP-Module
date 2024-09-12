import React, { useState, Fragment, useEffect } from "react";
import { Row, Col, Card, Tab, Tabs, } from "react-bootstrap";
import ConsultationPage from './Home';
import ClinicHistoryPage from "./ClinicHistory";
import { token, url as baseUrl } from "../../../api";
import axios from "axios";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const ClinicVisitPage = (props) => {
  const [key, setKey] = useState('home');
  const patientObj = props.patientObj
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const getPatientHistory = () => {
    setLoading(true)
    axios
      .get(`${baseUrl}prep-clinic/person/${props.patientObj.personId}?isCommenced=false&last=false`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        setLoading(false)
        setRecentActivities(response.data)
      })

      .catch((error) => {
        //console.log(error);
      });

  }

  const [encounters, setEncounters] = useState([])

  const fetchListOfEncounters = () => {
    setLoading(true)
    axios
      .get(`${baseUrl}prep/activities/patients/${props.patientObj.personId}?isCommenced=false&last=false`,
        { headers: { "Authorization": `Bearer ${token}` } }
      )
      .then((response) => {
        setLoading(false)
        setEncounters(response.data)
      })

      .catch((error) => {
        //console.log(error);
      });

  }

  useEffect(() => {
    setKey(props.activeContent.activeTab)
  }, [props.activeContent]);

  useEffect(() => { fetchListOfEncounters() }, [])

  return (
    <Fragment>
      <Row>
        <Col xl={12}>
          <Card style={divStyle}>
            <Card.Body>
              {/* <!-- Nav tabs --> */}
              <div className="custom-tab-1">
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3"
                >

                  <Tab eventKey="home" title="CLINIC VISIT ">
                    <ConsultationPage encounters={encounters}  recentActivities={recentActivities} patientObj={patientObj} setActiveContent={props.setActiveContent} activeContent={props.activeContent} />
                  </Tab>
                  <Tab eventKey="history" title="HISTORY">
                    <ClinicHistoryPage encounters={encounters} getPatientHistory={getPatientHistory} loading={loading} recentActivities={recentActivities} patientObj={patientObj} activeContent={props.activeContent} setActiveContent={props.setActiveContent} />
                  </Tab>
                </Tabs>
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Fragment>
  );
};

export default ClinicVisitPage;

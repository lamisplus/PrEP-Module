import React, {useState, Fragment, useEffect } from "react";
import { Row, Col, Card,  Tab, Tabs, } from "react-bootstrap";
import ConsultationPage from './Home';
import ClinicHistoryPage from "./ClinicHistory";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const ClinicVisitPage = (props) => {
    const [key, setKey] = useState('home');
    const patientObj = props.patientObj
    
    useEffect ( () => {
      setKey(props.activeContent.activeTab)
    }, [props.activeContent]);

    ///GET LIST OF Patients
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

                  <Tab eventKey="home" title="CLINIC VISIT">                   
                    <ConsultationPage patientObj={patientObj} setActiveContent={props.setActiveContent} activeContent={props.activeContent}/>
                  </Tab>  
                  <Tab eventKey="history" title="HISTORY">                   
                    <ClinicHistoryPage getPatientHistory={getPatientHistory} patientObj={patientObj} activeContent={props.activeContent} setActiveContent={props.setActiveContent} />
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

import React, {useState, Fragment, useEffect } from "react";
import { Row, Col, Card,  Tab, Tabs, } from "react-bootstrap";
import LabTestOrder from './LabTestOrder';
import LabHistory from "./LabHistory";
import LaboratoryRDE from "./LaboratoryRDE";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const LaboratoryModule = (props) => {
    const [key, setKey] = useState('home');
    const patientObj = props.patientObj
    useEffect ( () => {
      setKey(props.activeContent.activeTab)
    }, [props.activeContent.id]);


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
                  {/* <Tab eventKey="checked-in" title="Checked In Patients">                   
                    <CheckedInPatients />
                  </Tab> */}
                  <Tab eventKey="home" title="LABORATORY RDE">                   
                    <LaboratoryRDE patientObj={patientObj} setActiveContent={props.setActiveContent}/>
                  </Tab>
                  {/* <Tab eventKey="testOrder" title="LABORATORY TEST ORDER">                   
                    <LabTestOrder patientObj={patientObj} setActiveContent={props.setActiveContent}/>
                  </Tab>   */}
                  <Tab eventKey="history" title=" HISTORY">                   
                    <LabHistory patientObj={patientObj} setActiveContent={props.setActiveContent}/>
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

export default LaboratoryModule;

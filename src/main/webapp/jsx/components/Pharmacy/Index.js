import React, {useState, Fragment, useEffect } from "react";
import { Row, Col, Card,  Tab, Tabs, } from "react-bootstrap";
import PharmacyRefill from './PharmacyRefill';
import PharmacyRefillUpdate from './PharmacyRefillUpdate';
import PharmacyHistory from "./PharmacyHistory";

const divStyle = {
  borderRadius: "2px",
  fontSize: 14,
};

const PharmacyModule = (props) => {
    const [key, setKey] = useState('home');
    const patientObj = props.patientObj
    
    useEffect ( () => {
      setKey(props.activeContent.activeTab)
    }, [props.activeContent.id]);
    //console.log(key)

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
                  <Tab eventKey="home" title="Pharmacy Drug Refill ">
                    {props.activeContent.actionType==='update' ? 
                      (                 
                        <PharmacyRefillUpdate patientObj={patientObj} setActiveContent={props.setActiveContent} activeContent={props.activeContent}/>
                      )
                      :
                      (
                        <PharmacyRefill patientObj={patientObj} setActiveContent={props.setActiveContent} activeContent={props.activeContent}/>
                      )
                    }
                  </Tab>  
                  <Tab eventKey="history" title=" History">                   
                    <PharmacyHistory patientObj={patientObj} setActiveContent={props.setActiveContent} activeContent={props.activeContent}/>
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

export default PharmacyModule;

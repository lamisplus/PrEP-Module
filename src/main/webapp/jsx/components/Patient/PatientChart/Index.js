import React from "react";
// import { Link } from 'react-router-dom';
import { Row, Col, Card } from "react-bootstrap";

import PageTitle from "../../../layouts/PageTitle";

import Bmi from "./Bmi";
import Height from "./Height";
//import ViccinationStatus from "./ViccinationStatus";
//import LegendEffectOpacity from "./LegendEffectOpacity";

function RechartJs() {
  return (
    <>

      <Row>
        <Col xl={6} lg={6}>
          <Card>            
            <Card.Body>
                <p>Weight                    
                    <span className="float-end text-success">Normal</span>
                </p>
                <p><h5>45Kg</h5></p>                
              <Bmi />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={6} lg={6}>
          <Card>           
            <Card.Body>
            <p>Height                    
                    <span className="float-end text-success">Normal</span>
                </p>
                <p><h5>140cm</h5></p>
              <Height />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={12} lg={12}>
          <Card>            
            <Card.Body>
            <p>BMI                   
                    <span className="float-end text-danger">Below Normal</span>
                </p>
                <p><h5>5.6 kg/m<sup>2</sup></h5></p>
                <Height />
            </Card.Body>
          </Card>
        </Col>        
      </Row>
    </>
  );
}

export default RechartJs;

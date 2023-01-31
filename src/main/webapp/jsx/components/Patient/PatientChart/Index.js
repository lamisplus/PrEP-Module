import React from "react";
// import { Link } from 'react-router-dom';
import { Row, Col, Card } from "react-bootstrap";

import PageTitle from "../../../layouts/PageTitle";

import Bmi from "./Bmi";
import Height from "./Height";
//import ViccinationStatus from "./ViccinationStatus";
//import LegendEffectOpacity from "./LegendEffectOpacity";

function RechartJs(props) {
  console.log(props)
  return (
    <>

      <Row>
        <Col xl={6} lg={6}>
          <Card>            
            <Card.Body>
                <p><b>Weight</b>                    
                    <span className="float-end text-success"></span>
                </p>
                <p><h5>{props.summary.weight}Kg</h5></p>                
              <Bmi />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={6} lg={6}>
          <Card>           
            <Card.Body>
            <p><b>Height</b>                    
                    <span className="float-end text-success"></span>
                </p>
                <p><h5>{props.summary.height}cm</h5></p>
              <Height />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={12} lg={12}>
          <Card>            
            <Card.Body>
            <p><b>BMI</b>                   
                    <span className="float-end text-danger"></span>
                </p>
                <p><h5>{(props.summary.weight/((props.summary.height/100) * (props.summary.height/100))).toFixed(2)} kg/m<sup>2</sup></h5></p>
                <Height />
            </Card.Body>
          </Card>
        </Col>        
      </Row>
    </>
  );
}

export default RechartJs;

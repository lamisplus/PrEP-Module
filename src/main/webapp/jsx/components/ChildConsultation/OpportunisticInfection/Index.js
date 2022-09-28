import React, { Fragment, useState, useEffect } from "react";
// import { Link } from 'react-router-dom';
import { Row } from "react-bootstrap";
import {  Modal, Button, Table  } from "react-bootstrap";
import { Input, Label, FormGroup, InputGroupText, InputGroup, Col , CardBody, Card } from "reactstrap";
import { Tab, Grid,} from 'semantic-ui-react'
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'

import {Icon, List, Label as LabelSui} from 'semantic-ui-react'
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@material-ui/icons/Delete'

const useStyles = makeStyles(theme => ({ 
    button: {
      margin: theme.spacing(1)
    },
    error: {
      color: "#f85032",
      fontSize: "11px",
  },
  success: {
      color: "#4BB543 ",
      fontSize: "11px",
  },
}))
let adherenceLevelObj= []

const ADR = (props) => {
  const patientObj = props.patientObj;
  const classes = useStyles();

  const [prepSideEffect, setPrepSideEffect] = useState([]);
  const [infectionList, setInfectionList] = useState([]);
  const [infection, setInfection] = useState({illnessInfection:"", ondateInfection:""});
  const [objValues, setObjValues] = useState({
                                                adherenceLevel: "",
                                                adheres: {},
                                                adrScreened: "",
                                                adverseDrugReactions: {},
                                                artStatusId: 0,
                                                cd4: "",
                                                cd4Percentage: 0,
                                                clinicalNote: "",
                                                clinicalStageId: 0,
                                                facilityId: 0,
                                                functionalStatusId: 0,
                                                hivEnrollmentId: 0,
                                                nextAppointment: "",
                                                lmpDate:"",
                                                oiScreened: "",
                                                opportunisticInfections: {},
                                                personId: 0,
                                                stiIds: "",
                                                stiTreated: "",
                                                uuid: "",
                                                visitDate: "",
                                                
                                                whoStagingId: 0
                                              });
  const [vital, setVitalSignDto]= useState({
                                            bodyWeight: "",
                                            diastolic:"",
                                            encounterDate: "",
                                            facilityId: 1,
                                            height: "",
                                            personId: "",
                                            serviceTypeId: 1,
                                            systolic:"" 
                                            })

const handleInfectionInputChange = e => {
    setInfection ({...infection,  [e.target.name]: e.target.value});
    }
    
    const addInfection = e => { 
    setInfectionList([...infectionList, infection])
    }
    /* Remove ADR  function **/
    const removeInfection = index => {       
    infectionList.splice(index, 1);
    setInfectionList([...infectionList]);
        
    };
                                            

  return (
    <div>
       <div className="row">
        <div className="form-group mb-3 col-md-5">
            <FormGroup>
            <Label >Onset Date </Label>
            <Input
                type="date"
                name="ondateInfection"
                id="ondateInfection"
                value={infection.ondateInfection}
                onChange={handleInfectionInputChange}
                required
                > 
            </Input>
          
            </FormGroup>
        </div>
        <div className="form-group mb-3 col-md-5">        
        <FormGroup>
            <Label > Illness</Label>
            <Input
                type="text"
                name="illnessInfection"
                id="illnessInfection"
                value={infection.illnessInfection}
                onChange={handleInfectionInputChange}
                required
                > 
            </Input>
          
            </FormGroup>
        </div>
        <div className="form-group mb-3 col-md-2">
        <LabelSui as='a' color='black'  onClick={addInfection}  size='tiny' style={{ marginTop:35}}>
            <Icon name='plus' /> Add
        </LabelSui>
        </div>
        {infectionList.length >0 
          ?
            <List>
            <Table  striped responsive>
                  <thead >
                      <tr>
                          <th>Illness</th>
                          <th>OnSetDate</th>
                          <th ></th>
                      </tr>
                  </thead>
                  <tbody>
                {infectionList.map((relative, index) => (

                  <InfectionList
                      key={index}
                      index={index}
                      relative={relative}
                      removeInfection={removeInfection}
                  />
                  ))}
                  </tbody>
                  </Table>
                </List>
                :
                ""
            } 
    </div>
    </div>
     
  );
};

function InfectionList({
    relative,
    index,
    removeInfection,
  }) {
  
   
    return (
            <tr>
  
                <th>{relative.illnessInfection}</th>
                <th>{relative.ondateInfection}</th>
                <th></th>
                <th >
                    <IconButton aria-label="delete" size="small" color="error" onClick={() =>removeInfection(index)}>
                        <DeleteIcon fontSize="inherit" />
                    </IconButton>
                    
                </th>
            </tr> 
    );
  }

export default ADR;

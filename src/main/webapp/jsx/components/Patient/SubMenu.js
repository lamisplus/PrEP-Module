import React, { useState, useEffect } from "react";
import axios from "axios";
import {Dropdown, Menu } from "semantic-ui-react";
import { makeStyles } from "@material-ui/core/styles";
import { url as baseUrl, token } from "../../../api";


const useStyles = makeStyles((theme) => ({
    navItemText: {
        padding: theme.spacing(2),
    },
}));

function SubMenu(props) {
    const classes = useStyles();
    let gender=""
    const patientObjs = props.patientObj ? props.patientObj : {}
    //const patientCurrentStatus=props.patientObj && props.patientObj.currentStatus==="Died (Confirmed)" ? true : false ;
    const [patientObj, setpatientObj] = useState(patientObjs)
    const [genderType, setGenderType] = useState()
    //console.log(patientObj)
    useEffect(() => {
        Observation();
    }, [props.patientObj]);
     //Get list of RegimenLine
     const Observation =()=>{
        axios
            .get(`${baseUrl}observation/person/${props.patientObj.id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                const observation = response.data
                const mental= observation.filter((x)=> x.type==='mental health')
                const evaluation= observation.filter((x)=> x.type==='initial evaluation')
                

            })
            .catch((error) => {
            //console.log(error);
            });
        
        }

    const loadEAC =(row)=> {
        props.setActiveContent({...props.activeContent, route:'counseling'})
    }
    const loadStatusUpdate =(row)=> {
        props.setActiveContent({...props.activeContent, route:'status-update'})
    }
    const loadPharmacyModal =(row)=> {
        props.setActiveContent({...props.activeContent, route:'pharmacy'})
    }
    const loadLaboratoryModal =(row)=> {
        props.setActiveContent({...props.activeContent, route:'laboratory'})
    }
    const loadCervicalCancer = (row) =>{
        props.setActiveContent({...props.activeContent, route:'cervical-cancer'})
    }
    const loadPrEPDiscontinuationsInterruptions = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-interruptions'})
    }
    const loadPrEPRegistrationForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-registration'})
    }
    const loadPrEPCommencementForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-commencement'})
    }
    const loadPrEPEligibiltyScreeningForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-screening'})
    }
    const loadPrEPVisitForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-visit'})
    }
    const onClickConsultation = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'consultation'})
    }
    const onClickHome = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'recent-history'})
    }
    const loadPatientHistory = ()=>{
        props.setActiveContent({...props.activeContent, route:'patient-history'})
    }


    return (
         <div>
            <Menu size="mini" color={"black"} inverted >
                <Menu.Item onClick={() => onClickHome()} > Home</Menu.Item>                  
                {patientObj.prepEligibilityCount<=0 || patientObj.prepEnrollmentCount<=0 || patientObj.commenced!==true ? 
                (<>
                    {patientObj.prepEligibilityCount <=0 && (<Menu.Item onClick={() => loadPrEPEligibiltyScreeningForm()} >PrEP Eligibilty Screening Form</Menu.Item>)}
                    {patientObj.prepEligibilityCount >0 && patientObj.prepEnrollmentCount<=0 && (<Menu.Item onClick={() => loadPrEPRegistrationForm()} >PrEP Enrollment</Menu.Item>)}
                    {patientObj.prepEligibilityCount >0 && patientObj.prepEnrollmentCount>0 && patientObj.commenced!==true && (<Menu.Item onClick={() => loadPrEPCommencementForm()} >PrEP Commencement</Menu.Item>)}
                </>)
                :
                (<>  
                    <Menu.Item onClick={() => onClickConsultation()} > PrEP Visit</Menu.Item>
                    <Menu.Item onClick={() => loadPrEPDiscontinuationsInterruptions()} >PrEP Discontinuations & Interruptions</Menu.Item>
                </>)}
                <Menu.Item onClick={() => loadPatientHistory(patientObj)} >History</Menu.Item>                    
            </Menu>             
        </div>
    );
}



export default SubMenu;

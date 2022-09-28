import React, {useCallback, useEffect, useState} from "react";
import { Button} from 'semantic-ui-react'
import {Card, CardBody} from "reactstrap";
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "../../../../api";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import {Link, useHistory, useLocation} from "react-router-dom";
//import {TiArrowBack} from 'react-icons/ti'
//import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import { Icon, Menu } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import MedicalHistory from './MedicalHistory'
import PastArv from './PastArv'
import PhysicalExamination from './PhysicalExamination'
import Appearance from './Appearance'
import WhoStaging from './WhoStaging'
import Plan from './Plan'
import ChildRegimenNextAppointment from './ChildRegimenNextAppointment'
import AdultRegimenNextAppointment from './AdultRegimenNextAppointment'
import moment from "moment";


const useStyles = makeStyles((theme) => ({

    error:{
        color: '#f85032',
        fontSize: '12.8px'
    },  
    success: {
        color: "#4BB543 ",
        fontSize: "11px",
    },
}));


const UserRegistration = (props) => {
    //const classes = useStyles();
    const location = useLocation();
    const locationState = location.state;
    const [saving, setSaving] = useState(false);
    const [activeItem, setactiveItem] = useState('medical-history');
    const [completed, setCompleted] = useState([]);
    const [patientObj, setPatientObj] = useState("");
    const [observation, setObservation]=useState({
        data: {
                medicalHistory:"",
                currentMedical:"",
                patientDisclosure:"",
                pastArvMedical:"",
                physicalExamination:"",
                generalApperance:"",
                skin:"",
                eye:"",
                breast:"",
                cardiovascular:"",
                genitalia:"",
                respiratory:"",
                gastrointestinal:"",
                assesment :"",
                who:"",
                plan:"",
                regimen:"",
                enroll:"",
                planArt:"" ,
                nextAppointment:"",
                neurological:"",
                mentalstatus:"",
                visitDate:""           
        },
        dateOfObservation: null,
        facilityId: null,
        personId: patientObj.id,
        type: "Clinical evaluation",
        visitId: null
    })
    const handleItemClick =(activeItem)=>{
        setactiveItem(activeItem)
        //setCompleted({...completed, ...completedMenu})
    }
    useEffect(() => {
        GetInitialEvaluation();
    }, [props.activeContent.id]);
    const GetInitialEvaluation =()=>{
        axios
           .get(`${baseUrl}observation/${props.activeContent.id}`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {  

                //const newmedicalHistory=response.data.data.medicalHistory
                // observation.dateOfObservation =  response.data.dateOfObservation 
                // observation.facilityId =  response.data.facilityId
                // observation.type =  response.data.type
                observation=response.data  
                setPatientObj(response.data)
           })
           .catch((error) => {
           //console.log(response.data.data);
           });
       
        }
    const calculate_age = dob => {
        var today = new Date();
        var dateParts = dob.split("-");
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
        var age_now = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age_now--;
                }
            if (age_now === 0) {
                    return m + " month(s)";
                }
                return age_now + " year(s)";
      };
      console.log(observation);

    return (
        <>

            
            <Card >
                <CardBody>
              
                    <div className="row">
                    {calculate_age(moment(props.patientObj.dateOfBirth).format("DD-MM-YYYY"))<=14 ? (
                        <h2>Pediatric- Initial Clinical Evaluation ssd</h2>
                        )
                        :
                        (
                            <h2>Adult- Initial Clinical Evaluation </h2> 
                        )
                
                    }
                        <br/>
                        <br/>
                        <form >
                        <div className="col-md-3 float-start">
                        <Menu  size='large'  vertical  style={{backgroundColor:"#014D88"}}>
                            <Menu.Item
                                name='inbox'
                                active={activeItem === 'medical-history'}
                                onClick={()=>handleItemClick('medical-history')}
                                style={{backgroundColor:activeItem === 'medical-history' ? '#000': ""}}
                                disabled={activeItem !== 'medical-history' ? true : false}
                            >               
                                <span style={{color:'#fff'}}> Medical History
                                {completed.includes('medical-history') && (
                                    <Icon name='check' color='green' />
                                )}
                                </span>
                                
                            </Menu.Item>

                            <Menu.Item
                                name='inbox'
                                active={activeItem === 'past-arv'}
                                onClick={()=>handleItemClick('past-arv')}
                                style={{backgroundColor:activeItem === 'past-arv' ? '#000': ""}}
                                disabled={activeItem !== 'past-arv' ? true : false}
                            >               
                                <span style={{color:'#fff'}}>Past/Current ARV 
                                {completed.includes('past-arv') && (
                                    <Icon name='check' color='green' />
                                )}
                                </span>
                                
                                {/* <Label color='teal'>3</Label> */}
                            </Menu.Item>
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'physical-examination'}
                                onClick={()=>handleItemClick('physical-examination')}
                                style={{backgroundColor:activeItem === 'physical-examination' ? '#000': ""}}
                                disabled={activeItem !== 'physical-examination' ? true : false}
                            >
                            {/* <Label>4</Label> */}
                            <span style={{color:'#fff'}}>Physical Examination
                            {completed.includes('physical-examination') && (
                                <Icon name='check' color='green' />
                            )}</span>
                            
                            </Menu.Item>
                            
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'appearance'}
                                onClick={()=>handleItemClick('appearance')}
                                style={{backgroundColor:activeItem === 'appearance' ? '#000': ""}}
                                disabled={activeItem !== 'appearance' ? true : false}
                            >
                            {/* <Label>4</Label> */}
                            <span style={{color:'#fff'}}>Apperance
                            {completed.includes('appearance') && (
                                <Icon name='check' color='green' />
                            )}
                            </span>
                            
                            </Menu.Item>                           
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'who'}
                                onClick={()=>handleItemClick('who')}
                                style={{backgroundColor:activeItem === 'who' ? '#000': ""}}
                                disabled={activeItem !== 'who' ? true : false}
                            >
                                {/* <Label>4</Label> */}
                                <span style={{color:'#fff'}}>Assessment & WHO 
                                    {completed.includes('who') && (
                                        <Icon name='check' color='green' />
                                    )}
                                </span>                            
                            </Menu.Item>
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'plan'}
                                onClick={()=>handleItemClick('plan')}
                                style={{backgroundColor:activeItem === 'plan' ? '#000': ""}}
                                disabled={activeItem !== 'plan' ? true : false}
                            >
                                {/* <Label>4</Label> */}
                                <span style={{color:'#fff'}}>Plan & Enroll In
                                    {completed.includes('plan') && (
                                        <Icon name='check' color='green' />
                                    )}
                                </span>                            
                            </Menu.Item>
                           
                            <Menu.Item
                                name='spam'
                                active={activeItem === 'regimen'}
                                onClick={()=>handleItemClick('regimen')}
                                style={{backgroundColor:activeItem === 'regimen' ? '#000': ""}}
                                disabled={activeItem !== 'regimen' ? true : false}
                            >
                                {/* <Label>4</Label> */}
                                <span style={{color:'#fff'}}>Regimen & <br/>Next Appointment 
                                    {completed.includes('regimen') && (
                                        <Icon name='check' color='green' />
                                    )}
                                </span>                            
                            </Menu.Item>
                        </Menu>
                        </div>
                        <div className="col-md-9 float-end" style={{ backgroundColor:"#fff", }}>
                            {activeItem==='medical-history' && (<MedicalHistory handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation}/>)}
                            {activeItem==='past-arv' && (<PastArv handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation}/>)}
                            {activeItem==='physical-examination' && (<PhysicalExamination handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation}/>)}
                            {activeItem==='appearance' && (<Appearance handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation}/>)}
                            {activeItem==='who' && (<WhoStaging handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation}/>)}
                            {activeItem==='plan' && (<Plan  handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation}/>)}
                            {activeItem==='regimen' && (
                                 <>
                                 {calculate_age(moment(props.patientObj.dateOfBirth).format("DD-MM-YYYY"))<=14 ? 
                                 (
                                     <ChildRegimenNextAppointment handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation} activeContent={props.activeContent} setActiveContent={props.setActiveContent}/>
                                 )
                                 :
                                 (
                                     <AdultRegimenNextAppointment handleItemClick={handleItemClick} setCompleted={setCompleted} completed={completed} setPatientObj={setPatientObj} patientObj={patientObj} setObservation={setObservation} observation={observation} activeContent={props.activeContent} setActiveContent={props.setActiveContent}/>
                                 )}
                             </>  
                            )}
                            
                        </div>  
                        </form>                                 
                    </div>
                </CardBody>
            </Card>                                 
        </>
    );
};

export default UserRegistration

import React, { useEffect, useState} from "react";
import axios from "axios";
import {FormGroup, Label , CardBody, Spinner,Input,Form, InputGroup,
    InputGroupText,

} from "reactstrap";
import * as moment from 'moment';
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
// import AddIcon from "@material-ui/icons/Add";
// import CancelIcon from "@material-ui/icons/Cancel";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { useHistory, } from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import {token, url as baseUrl } from "../../../../api";
import 'react-phone-input-2/lib/style.css'
import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Button} from 'semantic-ui-react'
import {  Modal } from "react-bootstrap";


const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(20),
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    cardBottom: {
        marginBottom: 20,
    },
    Select: {
        height: 45,
        width: 300,
    },
    button: {
        margin: theme.spacing(1),
    },
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
        backgroundColor: theme.palette.background.default,
    },
    inline: {
        display: "inline",
    },
    error:{
        color: '#f85032',
        fontSize: '12.8px'
    }
}));


const AdultRegimenNextAppointment = (props) => {
    //console.log(props.activeContent)
    const [errors, setErrors] = useState({});
    let temp = { ...errors } 
    useEffect(() => { 
        if(props.observation.data ){
        setRegimen(props.observation.data.regimen) 
        setobjValues(props.observation.data.nextAppointment)             
        }
    }, [props.observation.data]);
    const [saving, setSaving] = useState(false); 
    const [hideFirstLine, setHideFirstLine] = useState(false);
    const [hideSecondLine, setHideSecondLine] = useState(false);
    const [hideThirdLine, setHideThirdLine] = useState(false);
    const [objValues, setobjValues] = useState({nextAppointment:""});
    const [regimen, setRegimen] = useState({regimenLine:"", regimen:""}); 
    const handleRegimen =e =>{
        if(e.target.value==='first line'){
            setHideFirstLine(true)
            setHideSecondLine(false)
            setHideThirdLine(false)
        }else if(e.target.value==='second line'){
            setHideFirstLine(false)
            setHideSecondLine(true)
            setHideThirdLine(false)

        }else if(e.target.value==='third line'){
            setHideFirstLine(false)
            setHideSecondLine(false)
            setHideThirdLine(true)

        }
        setRegimen({...regimen, [e.target.name]: e.target.value})
    }
    const handleInputChangeobjValues = e => {            
        setobjValues ({...objValues,  [e.target.name]: e.target.value});
    }
    const handleItemClick =(page, completedMenu)=>{
        props.handleItemClick(page)
        if(props.completed.includes(completedMenu)) {

        }else{
            props.setCompleted([...props.completed, completedMenu])
        }
    }  
    /**** Submit Button Processing  */
    const handleSubmit = (e) => { 
        e.preventDefault();  
        props.observation.data.regimen= regimen
        props.observation.personId =props.patientObj.id
        props.observation.data.nextAppointment=objValues.nextAppointment
        axios.put(`${baseUrl}observation/${props.observation.id}`, props.observation,
        { headers: {"Authorization" : `Bearer ${token}`}},            
        )
          .then(response => {
              setSaving(false);
              handleItemClick('', 'regimen' ) 
              props.patientObj.clinicalEvaluation=true
              toast.success("Initial Clinic Evaluation save successful");
              props.setActiveContent({...props.activeContent, route:'recent-history'})
          })
          .catch(error => {
              setSaving(false);
              if(error.response && error.response.data){
                let errorMessage = error.response.data && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage); 
            }
             
          });
       
                         
    }
        
return (
        <>  
        
            <Card >
                <CardBody>   
                <h2 style={{color:'#000'}}>Regimen & Next Appointment</h2>
                <br/>
                    <form >
                    {/* Medical History form inputs */}
                    <div className="row">
                    <h3>Regimen</h3>
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                            <Label>Regimen Line</Label>
                            <Input 
                                    type="select"
                                    name="regimenLine"
                                    id="regimenLine"
                                    onChange={handleRegimen} 
                                    value={regimen.regimenLine} 
                                >
                                <option value="">Select</option>
                                <option value="first line">First Line</option>
                                <option value="second line">Second Line</option>
                                <option value="third line">Third Line </option>
                               
                                </Input>
                        </FormGroup>
                    </div>
                    {hideFirstLine && (
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                            <Label>First Line Regimen</Label>
                            <Input 
                                    type="select"
                                    name="regimen"
                                    id="regimen"
                                    onChange={handleRegimen} 
                                    value={regimen.regimen}  
                                >
                                <option value="">Select</option>
                                <option value="TDF + 3TC + DTG">TDF + 3TC + DTG</option>
                                <option value="TDF + FTC + DTG">TDF + FTC + DTG</option>
                                <option value="TDF + 3TC + EFV400">TDF + 3TC + EFV400</option>
                                <option value="TAF + 3TC + DTG">TAF + 3TC + DTG</option> 
                                <option value="ABC + 3TC + DTG">ABC + 3TC + DTG</option> 
                                <option value="AZT + 3TC + EFV400">AZT + 3TC + EFV400</option>                              
                            </Input>
                        </FormGroup>
                    </div>
                    )}
                    {hideSecondLine && (
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                            <Label>Second Line Regimen</Label>
                            <Input 
                                    type="select"
                                    name="regimen"
                                    id="regimen"
                                    onChange={handleRegimen} 
                                    value={regimen.regimen}   
                                >
                                <option value="">Select</option>
                                <option value="AZT + 3TC + ATV/r">AZT + 3TC + ATV/r</option>
                                <option value="AZT + 3TC + LPV/r">AZT + 3TC + LPV/r</option>
                                <option value="AZT + FTC + ATV/r">AZT + FTC + ATV/r</option>
                                <option value="AZT + FTC + LPV/r">AZT + FTC + LPV/r</option>  
                                <option value="TDF + 3TC + ATV/r">TDF + 3TC + ATV/r </option>
                                <option value="TDF + 3TC + LPV/r">TDF + 3TC + LPV/r </option>
                                <option value="TDF +  FTC + ATV/r">TDF +  FTC + ATV/r</option>  
                                <option value="TDF + FTC + LPV/r">TDF + FTC + LPV/r</option>
                                <option value="AZT + 3TC + DRV/r">AZT + 3TC + DRV/r</option>   
                                <option value="AZT + FTC + DRV/r">AZT + FTC + DRV/r</option>                       
                                <option value="AZT + 3TC + DTG">AZT + 3TC + DTG</option>
                                <option value="AZT +  FTC + DTG">AZT +  FTC + DTG</option>
                                <option value="TDF + 3TC + DTG">TDF + 3TC + DTG</option>
                                <option value="TDF +  FTC + DTG">TDF +  FTC + DTG</option>
                            </Input>
                        </FormGroup>
                    </div>
                    )}
                    {hideThirdLine && (
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                            <Label>Third Line Regimen</Label>
                            <Input 
                                    type="select"
                                    name="regimen"
                                    id="regimen"
                                    onChange={handleRegimen}
                                    value={regimen.regimen}    
                                >
                                <option value="">Select</option>
                                <option value="TDF + 3TC + DRV/r + DTG">TDF + 3TC + DRV/r + DTG</option>
                                <option value="TDF + 3TC + DRV/r + DTG + ETV">TDF + 3TC + DRV/r + DTG + ETV</option>
                                <option value="TDF + FTC + DRV/r + DTG">TDF + FTC + DRV/r + DTG</option>
                                <option value="TDF + FTC + DRV/r + DTG + ETV">TDF + FTC + DRV/r + DTG + ETV</option>  
                                <option value="AZT + 3TC + DRV/r + ETV + DTG">AZT + 3TC + DRV/r + ETV + DTG</option>
                                <option value="AZT + FTC + DRV/r + ETV + DTG">AZT + FTC + DRV/r + ETV + DTG </option>
                                <option value="AZT + 3TC + DRV/r + ETV">AZT + 3TC + DRV/r + ETV</option>  
                                <option value="AZT + FTC + DRV/r + ETV">AZT + FTC + DRV/r + ETV</option>
                                <option value="AZT + 3TC + DRV/r + DTG">AZT + 3TC + DRV/r + DTG</option>   
                                <option value="AZT + 3TC + DRV/r + DTG">AZT + FTC + DRV/r + DTG</option> 
                                <option value="AZT + 3TC + DRV/r + DTG">AZT + 3TC + DRV/r</option> 
                                <option value="AZT + FTC + DRV/r">AZT + FTC + DRV/r</option>                        
                            </Input>
                        </FormGroup>
                    </div>
                    )}
                    <br/>
                    </div>
                    <div className="row">
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Next appointment</Label>
                            <InputGroup> 
                                <Input 
                                    type="date"
                                    name="nextAppointment"
                                    id="nextAppointment"
                                    onChange={handleInputChangeobjValues} 
                                    value={objValues.nextAppointment}  
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    </div> 
                    <br/>
                    <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('plan', 'plan')}/>
                    <Button content='Save Record' type="submit" icon='right arrow' labelPosition='right' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={handleSubmit}/>
                    
                    </form>
                    
                </CardBody>
            </Card> 
                                     
        </>
    );
};

export default AdultRegimenNextAppointment
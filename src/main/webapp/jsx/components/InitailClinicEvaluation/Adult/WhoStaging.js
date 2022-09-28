
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


const BasicInfo = (props) => {

    const [errors, setErrors] = useState({});
    let temp = { ...errors } 
    useEffect(() => { 
        if(props.observation.data ){
            setAssesment(props.observation.data.assesment) 
            setWho(props.observation.data.who)             
        }
    }, [props.observation.data]);  
    const [who, setWho] = useState({stage:"", stage1Value:"",stage2Value:"", stage3Value:"",stage4Value:""});
    const [hideStage1, setHideStage1] = useState(false);
    const [hideStage2, setHideStage2] = useState(false);
    const [hideStage3, setHideStage3] = useState(false);
    const [hideStage4, setHideStage4] = useState(false);
    const [assesment, setAssesment] = useState({assessment:""});
    const handleAssessment =e =>{
        setAssesment({...assesment, [e.target.name]: e.target.value})
        
    }
    const handleWho =e =>{
        console.log(e.target.value)
        if(e.target.value==="stage 1"){
            setHideStage1(true)
            setHideStage2(false)
            setHideStage3(false)
            setHideStage4(false)
        }else if(e.target.value==="stage 2"){
            setHideStage1(false)
            setHideStage2(true)
            setHideStage3(false)
            setHideStage4(false)

        }else if(e.target.value==="stage 3"){
            setHideStage1(false)
            setHideStage2(false)
            setHideStage3(true)
            setHideStage4(false)

        }else if(e.target.value==="stage 4"){
            setHideStage1(false)
            setHideStage2(false)
            setHideStage3(false)
            setHideStage4(true)

        }else{

        }
        setWho({...who, [e.target.name]: e.target.value})
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
        props.observation.data.assesment = assesment
        props.observation.data.who=who  
        toast.success("Record save successful");
        handleItemClick('plan', 'who' )                  
    }
        
return (
        <>  
        
            <Card >
                <CardBody>   
                <h2 style={{color:'#000'}}>Physical Examination</h2>
                <br/>
                    <form >
                    {/* Medical History form inputs */}
                    <div className="row">
                    <h3>Assessment</h3>
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                        <InputGroup> 
                                <Input 
                                    type="select"
                                    name="assessment"
                                    id="assessment"
                                    onChange={handleAssessment} 
                                    value={assesment.assessment} 
                                >
                                <option value="">Select</option>
                                <option value="Asymptomatic">Asymptomatic</option>
                                <option value="Symptomatic">Symptomatic</option>
                                <option value="AIDS defining illness">AIDS defining illness</option>
                                </Input>

                            </InputGroup>
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6"> </div>
                    <hr/>
                    <h3>WHO staging criteria (History of any of the following)</h3>
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                        <Label >WHO STAGE</Label>
                        <InputGroup> 
                                <Input 
                                    type="select"
                                    name="stage"
                                    id="stage"
                                    value={who.stage} 
                                    onChange={handleWho}  
                                >
                                <option value="">Select</option>
                                <option value="stage 1">Stage 1</option>
                                <option value="stage 2">Stage 2</option>
                                <option value="stage 3">Stage 3</option>
                                <option value="stage 4">Stage 4</option>
                                
                                </Input>

                            </InputGroup>
                        </FormGroup>
                    </div>
                    {hideStage1 && (
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                        <Label >Stage 1 options</Label>
                        <InputGroup> 
                                <Input 
                                    type="select"
                                    name="stage1Value"
                                    id="stage1Value"
                                    value={who.stage1Value} 
                                    onChange={handleWho}  
                                >
                                <option value="">Select</option>
                                <option value="Asymptomatic">Asymptomatic</option>
                                <option value="Persistent generalized lymphadenopathy">Persistent generalized lymphadenopathy</option>
                                <option value="Performance scale: 1 asymptomatic, normal activity">Performance scale: 1 asymptomatic, normal activity</option>
                                
                                </Input>

                            </InputGroup>
                        </FormGroup>
                    </div>
                    )}
                    {hideStage2 && (
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                        <Label >Stage 2 options</Label>
                        <InputGroup> 
                                <Input 
                                    type="select"
                                    name="stage2Value"
                                    id="stage2Value"
                                    value={who.stage2Value} 
                                    onChange={handleWho}  
                                >
                                <option value="">Select</option>
                                <option value="Weight loss less than 10% of body weight">Weight loss {"<"}10% of body weight</option>
                                <option value="Minor Mucocutaneous Manifestations">Minor Mucocutaneous Manifestations</option>
                                <option value="Herpes Zoster (within last 5 years)">Herpes Zoster (within last 5 years)</option>
                                <option value=" Recurrent Upper Respiratory Tract Infections"> Recurrent Upper Respiratory Tract Infections</option>
                                <option value="Performance scale: 2 symptomatic, normal activity">Performance scale: 2 symptomatic, normal activity</option>
                                </Input>

                            </InputGroup>
                        </FormGroup>
                    </div>
                    )}
                    {hideStage3 && (
                    <>
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                        <Label >Stage 3 options</Label>
                        <InputGroup> 
                                <Input 
                                    type="select"
                                    name="stage3Value"
                                    id="stage3Value"
                                    value={who.stage3Value} 
                                    onChange={handleWho} 
                                >
                                <option value="">Select</option>
                                <option value="Weight loss greater than 10% of body weight">Weight loss {">"}10% of body weight</option>
                                <option value="Unexplained Chronic Diarrhea less than 1 month">Unexplained Chronic Diarrhea ({">"}1 month)</option>
                                <option value="Unexplained Prolonged Fever">Unexplained Prolonged Fever</option>
                                <option value="Oral Candidiasis">Oral Candidiasis</option>
                                <option value="Oral Hairy Leukoplakia">Oral Hairy Leukoplakia</option>
                                <option value="TB, Pulmonary (within previous year)">TB, Pulmonary (within previous year)</option>
                                <option value="Severe Bacterial Infections">Severe Bacterial Infections</option>
                                <option value="Performance scale: 3 bedridden  less than 50% of day in last month">Performance scale: 3 bedridden {"<"}50% of day in last month</option>
                                </Input>

                            </InputGroup>
                        </FormGroup>
                    </div>
                    </>
                    )}
                    {hideStage4 && (
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                        <Label >Stage 4 options</Label>
                        <InputGroup> 
                                <Input 
                                    type="select"
                                    name="stage4Value"
                                    id="stage4Value"
                                    value={who.stage4Value} 
                                    onChange={handleWho}  
                                >
                                <option value="">Select</option>
                                <option value="HIV Wasting syndrome">HIV Wasting syndrome</option>
                                <option value="PCP">PCP</option>
                                <option value="Toxoplasmosis, CNS">Toxoplasmosis, CNS</option>
                                <option value="Cryptosporidiosis with Diarrhea greater than 1 month">Cryptosporidiosis with Diarrhea ({">"}1 month)</option>
                                <option value="Cryptococcosis, Extrapulmonary">Cryptococcosis, Extrapulmonary</option>
                                <option value="Cytomegalovirus disease">Cytomegalovirus disease</option>
                                <option value="Herpes Simplex (mucotaneous greater than 1 month)">Herpes Simplex (mucotaneous {">"}1 month)</option>
                                <option value="Progressive Multifocal Leukoencephalopathy">Progressive Multifocal Leukoencephalopathy</option>
                                <option value="Mycosis, disseminated"> Mycosis, disseminated</option>
                                <option value="Oesophageal Candidiasis">Oesophageal Candidiasis</option>
                                <option value="Atypical Mycobacteriosis, disseminated">Atypical Mycobacteriosis, disseminated</option>
                                <option value="Salmonella Septicemia, Non-typhoid">Salmonella Septicemia, Non-typhoid</option>
                                <option value="TB, Extrapulmonary"> TB, Extrapulmonary</option>
                                <option value="Lymphoma">Lymphoma</option>
                                <option value="Kaposi's Sarcoma"> Kaposi's Sarcoma</option>
                                <option value="HIV encephalopathy">  HIV encephalopathy</option>
                                <option value="Performance scale: 4 bedridden greater than 50% of the day in last month"> Performance scale: 4 bedridden {">"}50% of the day in last month</option>
                                </Input>

                            </InputGroup>
                        </FormGroup>
                    </div>
                   )}
                  
                    </div>
                    <br/>
                    <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('appearance', 'appearance')}/>
                    <Button content='Next' type="submit" icon='right arrow' labelPosition='right' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={handleSubmit}/>
                    
                    </form>
                    
                </CardBody>
            </Card> 
                                     
        </>
    );
};

export default BasicInfo
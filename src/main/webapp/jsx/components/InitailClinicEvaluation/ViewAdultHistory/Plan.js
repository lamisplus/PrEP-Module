
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
    const classes = useStyles();
    const history = useHistory();
    const [errors, setErrors] = useState({});
    useEffect(() => { 
        if(props.observation.data ){
            setPlan(props.observation.data.plan) 
            setPlanArt(props.observation.data.planArt)            
            setEnrollIn(props.observation.data.enroll)  
        }
    }, [props.observation.data]);
    const [planArt, setPlanArt] = useState({previousArvExposure:""});
    const [enroll, setEnrollIn] = useState({enrollIn:""});
    const [hidecd4CountQuantitative, setHidecd4CountQuantitative] = useState(false);
    const [hidecd4CountFlow, setHidecd4CountFlow] = useState(false);
    const [plan, setPlan] = useState({  lab_evaluation:"", 
                                        cd4Count:"",
                                        cd4SemiQuantitative :"",
                                        cxr:"", 
                                        lf_lam:"", 
                                        oi_prophylaxis:"", 
                                        adherence:"", 
                                        cervical:"", 
                                        cryptococcal:"",
                                        cd4FlowCyteometry :"",
                                        previous_arv_exposure:"", 
                                        tb_investigation:"", 
                                        expert:"", 
                                        oi_therapy:"", 
                                        admission:"",
                                        symptomatic :"",
                                        other_referrals:"",
    });
    let temp = { ...errors }   
    const handlePlanArt =e =>{
        setPlanArt({...planArt, [e.target.name]: e.target.value})
        
    }
    const handlePlan =e =>{
        if(e.target.name==='cd4Count' && e.target.value==='Semi-Quantitative'){ 
                        
                setHidecd4CountQuantitative(true)
        }else{
            setHidecd4CountQuantitative(false)
        }
        if(e.target.name==='cd4Count' && e.target.value==='Flow Cyteometry'){          
            setHidecd4CountFlow(true)
        }else{
            setHidecd4CountFlow(false)
        }
        setPlan({...plan, [e.target.name]: e.target.value})
        //console.log(plan)
    }
    const handleEnroll =e =>{
        setEnrollIn({...enroll, [e.target.name]: e.target.value})
        
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
        props.observation.data.planArt = planArt
        props.observation.data.plan = plan
        props.observation.data.enroll=enroll  
        toast.success("Record save successful");
        handleItemClick('regimen', 'plan' )                  
    }
        
return (
        <>  
        
            <Card >
                <CardBody>   
                <h2 style={{color:'#000'}}>Enroll In & Plan</h2>
                <br/>
                    <form >
                    {/* Medical History form inputs */}
                    <div className="row">
                    <h3>Enroll in</h3>
                    <div className="form-group mb-3 col-md-5">                                    
                            <Input 
                                type="select"
                                name="enrollIn"
                                id="enrollIn"
                                value={enroll.enrollIn}
                                onChange={handleEnroll}  
                            >
                            <option value="">Select</option>
                            <option value="General medical follow-up">General medical follow-up</option>
                            <option value="ARV therapy">ARV therapy</option>
                            <option value="AHD management">AHD management</option>
                            <option value="Pending lab results">Pending lab results</option>
                            </Input>
                    </div>
                    <div className="form-group mb-3 col-md-7">  </div>
                    <hr/>
                    <h3>Plan for Antiretroviral Therapy (ART)</h3>
                    <div className="form-group mb-3 col-md-6">                                    
                        <FormGroup>
                            <Label>Ongoing Monitoring </Label>
                            <Input 
                                    type="select"
                                    name="previousArvExposure"
                                    id="previousArvExposure"
                                    value={planArt.previousArvExposure}
                                    onChange={handlePlanArt}  
                                >
                                <option value="">Select</option>
                                <option value="Restart treatment">Restart treatment</option>
                                <option value="Start new treatment">Start new treatment</option>
                                <option value="Stop treatment">Stop treatment </option>
                                <option value="Change treatment">Change treatment </option>
                                <option value="ARV TX postponed for clinical reason">ARV TX postponed for clinical reason</option>
                                </Input>
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6"> </div>
                    <h3> Plan (specify orders on requisition)</h3>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Lab evaluation</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="lab_evaluation"
                                    id="lab_evaluation"
                                    value={plan.lab_evaluation}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>CD4 Count </Label>
                                    <select
                                        className="form-control"
                                        name="cd4Count"
                                        id="cd4Count"
                                        value={plan.cd4Count}
                                        onChange={handlePlan}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Semi-Quantitative">Semi-Quantitative</option>
                                        <option value="Flow Cyteometry">Flow Cyteometry</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            {plan.cd4Count ==='Semi-Quantitative' && (
                            <div className="form-group  col-md-5">
                                <FormGroup>
                                    <Label>CD4 Count Value</Label>
                                    <select
                                        className="form-control"
                                        name="cd4SemiQuantitative"
                                        id="cd4SemiQuantitative"
                                        value={plan.cd4SemiQuantitative}
                                        onChange={handlePlan}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    >
                                        <option value={""}></option>
                                        <option value="Semi-Quantitative">{"<200"}</option>
                                        <option value="Flow Cyteometry">{">=200"}</option>
                                        
                                    </select>
                                    
                                </FormGroup>
                            </div>
                            )}
                            {plan.cd4Count ==='Flow Cyteometry' && (
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label for="">CD4 Count Value</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    name="cd4FlowCyteometry"
                                    id="cd4FlowCyteometry"
                                    value={plan.cd4FlowCyteometry}
                                    onChange={handlePlan}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                 
                                </FormGroup>
                            </div>
                            )}
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >CD4 count evaluation</Label>                       
                            <InputGroup> 
                                <Input 
                                    type="select"
                                    name="previous_arv_exposure"
                                    id="previous_arv_exposure"
                                    value={plan.previous_arv_exposure}
                                    onChange={handlePlan}  
                                >
                                <option value="">Select</option>
                                <option value="CD4 LFA">CD4 LFA</option>
                                <option value="less than 200">{"<"}200</option>
                                <option value="greater than and equal to 200">  ≥200</option>
                               
                                </Input>

                            </InputGroup>                                      
                            </FormGroup>
                    </div>
                    <hr/>
                    <div className="form-group mb-3 col-md-2">                                    
                        <div className="form-check custom-checkbox ml-1 ">
                            <input
                            type="checkbox"
                            className="form-check-input"                           
                            name="tb_investigation"
                            id="tb_investigation"
                            value={plan.tb_investigation}
                            onChange={handlePlan} 
                            />
                            <label
                            className="form-check-label"
                            htmlFor="basic_checkbox_1"
                            >
                            TB Investigations
                            </label>
                        </div>
                    </div>
                    <div className="form-group mb-3 col-md-2">                                    
                        <div className="form-check custom-checkbox ml-1 ">
                            <input
                            type="checkbox"
                            className="form-check-input"                           
                            name="expert"
                            id="expert"
                            value={plan.expert}
                            onChange={handlePlan} 
                            />
                            <label
                            className="form-check-label"
                            htmlFor="basic_checkbox_1"
                            >
                            Xpert MTB/RIF
                            </label>
                        </div>
                    </div>
                    <div className="form-group mb-3 col-md-2">                                    
                        <div className="form-check custom-checkbox ml-1 ">
                            <input
                            type="checkbox"
                            className="form-check-input"                           
                            name="cxr"
                            id="cxr"
                            value={plan.cxr}
                            onChange={handlePlan} 
                            />
                            <label
                            className="form-check-label"
                            htmlFor="basic_checkbox_1"
                            >
                            CXR
                            </label>
                        </div>
                    </div>
                    <div className="form-group mb-3 col-md-2">                                    
                        <div className="form-check custom-checkbox ml-1 ">
                            <input
                            type="checkbox"
                            className="form-check-input"                           
                            name="lf_lam"
                            id="lf_lam"
                            value={plan.lf_lam}
                            onChange={handlePlan} 
                            />
                            <label
                            className="form-check-label"
                            htmlFor="basic_checkbox_1"
                            >
                            LF_LAM
                            </label>
                        </div>
                    </div>
                   
                    <hr/>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >OI Prophylaxis</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="oi_prophylaxis"
                                    id="oi_prophylaxis"
                                    value={plan.oi_prophylaxis}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >OI therapy </Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="oi_therapy"
                                    id="oi_therapy" 
                                    value={plan.oi_therapy}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Adherence counseling</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="adherence"
                                    id="adherence"
                                    value={plan.adherence}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Admission</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="admission"
                                    id="admission"
                                    value={plan.admission}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Cervical cancer screening</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="cervical"
                                    id="cervical" 
                                    value={plan.cervical}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Symptomatic treatment/pain control (specify)</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="symptomatic"
                                    id="symptomatic" 
                                    value={plan.symptomatic}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Cryptococcal antigen test</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="cryptococcal"
                                    id="cryptococcal"
                                    value={plan.cryptococcal}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Other referrals (specify)</Label>
                            <InputGroup> 
                                <Input 
                                    type="text"
                                    name="other_referrals"
                                    id="other_referrals" 
                                    value={plan.other_referrals}
                                    onChange={handlePlan} 
                                />
                            </InputGroup>                                        
                            </FormGroup>
                    </div>
                    </div>
                    <br/>
                    <Button content='Back' icon='left arrow' labelPosition='left' style={{backgroundColor:"#992E62", color:'#fff'}} onClick={()=>handleItemClick('who', 'who')}/>
                    <Button content='Next' type="submit" icon='right arrow' labelPosition='right' style={{backgroundColor:"#014d88", color:'#fff'}} onClick={handleSubmit}/>
                    
                    </form>
                    
                </CardBody>
            </Card> 
                                     
        </>
    );
};

export default BasicInfo
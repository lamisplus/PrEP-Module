import React, {useState, useEffect} from 'react';
import { Card,CardBody, FormGroup, Label, Input} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import { Table  } from "react-bootstrap";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl } from "./../../../api";
import { token as token } from "./../../../api";
import "react-widgets/dist/css/react-widgets.css";
import moment from "moment";
import { Spinner } from "reactstrap";
import {Icon, List, Label as LabelSui} from 'semantic-ui-react'

const useStyles = makeStyles(theme => ({
    card: {
        margin: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    cardBottom: {
        marginBottom: 20
    },
    Select: {
        height: 45,
        width: 350
    },
    button: {
        margin: theme.spacing(1)
    },

    root: {
        '& > *': {
            margin: theme.spacing(1)
        }
    },
    input: {
        display: 'none'
    } ,
    error: {
        color: "#f85032",
        fontSize: "11px",
      },
}))

const Tracking = (props) => {
    const patientObj = props.patientObj;
    const [errors, setErrors] = useState({});
    let temp = { ...errors }
    const enrollDate = patientObj && patientObj.enrollment ? patientObj.enrollment.dateOfRegistration : null
    const classes = useStyles()
    const [saving, setSaving] = useState(false);
    const [eacObj, setEacObj] = useState([]);
    
    const [observation, setObservation]=useState({
        data: {},
        dateOfObservation: "yyyy-MM-dd",
        facilityId: null,
        personId: 0,
        type: "Tracking form",
        visitId: null
    })
    const [objValues, setObjValues]=useState({
            durationOnART:"", 
            dsdStatus:"", 
            dsdModel:"", 
            reasonForTracking:"",
            dateLastAppointment:"",
            dateMissedAppointment :"",
            careInFacilityDiscountinued :"",
            dateOfDiscontinuation :"",
            reasonForDiscountinuation:"",
            reasonForLossToFollowUp :"",
            causeOfDeath :"",
            dateReturnToCare :"",
            referredFor:"",
            referredForOthers:"",
            reasonForTrackingOthers:"",
            causeOfDeathOthers:"",
            reasonForLossToFollowUpOthers:"",
            attempts:"",
            patientId:props.patientObj.id
            })
    const handleInputChange = e => {
        setErrors({...temp, [e.target.name]:""})
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
    }  
    const [attempt, setAttempt] = useState({ attemptDate: "", whoAttemptedContact: "", 
                modeOfConatct: "", personContacted: "", reasonForDefaulting: "", reasonForDefaultingOthers:""
    });
    const [attemptList, setAttemptList] = useState([])          
    const handleInputChangeAttempt = e => {
        //console.log(e.target.value)
        setErrors({...temp, [e.target.name]:""})
        setAttempt ({...attempt,  [e.target.name]: e.target.value});
    }
    //Validations of the forms
    const validate = () => {        
    temp.durationOnART = objValues.durationOnART ? "" : "This field is required"
    temp.dsdStatus = objValues.dsdStatus ? "" : "This field is required"
    {objValues.dsdStatus==='Devolved' && (temp.dsdModel = objValues.dsdModel ? "" : "This field is required")}
    temp.reasonForTracking = objValues.reasonForTracking ? "" : "This field is required"
    temp.dateLastAppointment = objValues.dateLastAppointment ? "" : "This field is required"
    temp.dateMissedAppointment = objValues.dateMissedAppointment ? "" : "This field is required"

    temp.careInFacilityDiscountinued = objValues.careInFacilityDiscountinued ? "" : "This field is required"
    {objValues.careInFacilityDiscountinued==='Yes' && (temp.dateOfDiscontinuation = objValues.dateOfDiscontinuation ? "" : "This field is required")}
    {objValues.careInFacilityDiscountinued==='Yes' && (temp.reasonForDiscountinuation = objValues.reasonForDiscountinuation ? "" : "This field is required")}
    {objValues.reasonForDiscountinuation==='Loss to follow-up' && (temp.reasonForLossToFollowUp = objValues.reasonForLossToFollowUp ? "" : "This field is required")}
    {objValues.reasonForDiscountinuation==='Death' && (temp.causeOfDeath = objValues.causeOfDeath ? "" : "This field is required")}
    temp.dateReturnToCare = objValues.dateReturnToCare ? "" : "This field is required"
    temp.referredFor = objValues.referredFor ? "" : "This field is required"
    {objValues.referredFor==='Others' && (temp.referredForOthers = objValues.referredForOthers ? "" : "This field is required")}
    {objValues.reasonForTracking==='Others' && (temp.reasonForTrackingOthers = objValues.reasonForTrackingOthers ? "" : "This field is required")}
    {objValues.causeOfDeath==='Unknown' || objValues.causeOfDeath==='Other cause of death' || objValues.causeOfDeath==='Suspected Opportunistic Infection' && (temp.causeOfDeathOthers = objValues.causeOfDeathOthers ? "" : "This field is required")}
    {objValues.reasonForLossToFollowUp==='Others' && ( temp.reasonForLossToFollowUpOthers = objValues.reasonForLossToFollowUpOthers ? "" : "This field is required")}
    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
    }
    //Validations of the forms
    const validateAttempt = () => {        
    temp.attemptDate = attempt.attemptDate ? "" : "This field is required"
    temp.whoAttemptedContact = attempt.whoAttemptedContact ? "" : "This field is required"
    temp.modeOfConatct = attempt.modeOfConatct ? "" : "This field is required"
    temp.personContacted = attempt.personContacted ? "" : "This field is required"
    temp.reasonForDefaulting = attempt.reasonForDefaulting ? "" : "This field is required"
    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }
    const addAttempt = e => {
        if(validateAttempt()){ 
            setAttemptList([...attemptList, attempt])
            setAttempt({attemptDate: "", whoAttemptedContact: "", 
                        modeOfConatct: "", personContacted: "", 
                        reasonForDefaulting: "", reasonForDefaultingOthers:""
            })
        }else{
            toast.error("Please fill the required fields");
        }
      }
    /* Remove ADR  function **/
    const removeAttempt = index => {       
        attemptList.splice(index, 1);
        setAttemptList([...attemptList]);        
    }; 
    
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();
        if(validate()){
            if(attemptList.length >0){
                objValues.attempts=attemptList
                observation.dateOfObservation= moment(new Date()).format("YYYY-MM-DD")       
                observation.personId =patientObj.id
                observation.data=objValues        
                setSaving(true);
                axios.post(`${baseUrl}patient-tracker`,objValues,
                { headers: {"Authorization" : `Bearer ${token}`}},
                
                )
                    .then(response => {
                        setSaving(false);
                        toast.success(" Save successful");
                        props.setActiveContent({...props.activeContent, route:'recent-history'})
                        //props.setActiveContent('recent-history')

                    })
                    .catch(error => {
                        setSaving(false);
                        if(error.response && error.response.data){
                            let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                            toast.error(errorMessage);
                        }
                        else{
                            toast.error("Something went wrong. Please try again...");
                        }
                    });
                }else{
                    toast.error("Attempt to Contact can not be empty");
                }
            }  
    }

  return (      
        <div>                   
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                    <h2>Client Tracking & Discontinuation Form</h2>
                        <br/>
                        <br/>
                        <div className="row">
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">Duration on ART</Label>

                                <Input 
                                    type="select"
                                    name="durationOnART"
                                    id="durationOnART"
                                    onChange={handleInputChange}
                                    value={objValues.durationOnART} 
                                >
                                    <option value=""></option>
                                    <option value="<3months">{"<"} 3 months</option>
                                    <option value=">=3months">{">="} 3 months</option>
                                </Input>
                                {errors.durationOnART !=="" ? (
                                    <span className={classes.error}>{errors.durationOnART}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">DSD Status</Label>
                                <Input 
                                    type="select"
                                    name="dsdStatus"
                                    id="dsdStatus"
                                    onChange={handleInputChange}
                                    value={objValues.dsdStatus} 
                                >
                                   <option value="Not devolved">Not devolved</option>
                                    <option value="Devolved">Devolved</option>
                                    
                                </Input>
                                {errors.dsdStatus !=="" ? (
                                    <span className={classes.error}>{errors.dsdStatus}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {objValues.dsdStatus==='Devolved' && (
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">DSD Model</Label>

                                <Input 
                                    type="select"
                                    name="dsdModel"
                                    id="dsdModel"
                                    onChange={handleInputChange}
                                    value={objValues.dsdModel} 
                                >
                                    <option value=""></option>
                                    <option value="FBM">FBM</option>
                                    <option value="CBM">CBM</option>
                                </Input>
                                {errors.dsdModel !=="" ? (
                                    <span className={classes.error}>{errors.dsdModel}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        )}
                        </div>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">Reason for Tracking</Label>

                                <Input 
                                    type="select"
                                    name="reasonForTracking"
                                    id="reasonForTracking"
                                    onChange={handleInputChange}
                                    value={objValues.reasonForTracking} 
                                >
                                    <option value=""></option>
                                    <option value="Intensive follow-up">Intensive follow-up</option>
                                    <option value="Missed Appointment">Missed Appointment</option>
                                    <option value="Missed Pharmacy Refill">Missed Pharmacy Refill</option>
                                    <option value="Missed Appointment">Lost to follow-up</option>
                                    <option value="Others">Others</option>
                                </Input>
                                {errors.reasonForTracking !=="" ? (
                                    <span className={classes.error}>{errors.reasonForTracking}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {objValues.reasonForTracking==='Others' && (
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">Reason for Tracking</Label>

                                <Input 
                                    type="text"
                                    name="reasonForTrackingOthers"
                                    id="reasonForTrackingOthers"
                                    onChange={handleInputChange}
                                    value={objValues.reasonForTrackingOthers} 
                                />
                                 {errors.reasonForTrackingOthers !=="" ? (
                                    <span className={classes.error}>{errors.reasonForTrackingOthers}</span>
                                    ) : "" }
                            
                            </FormGroup>
                        </div>
                        )}
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">Date of Last Actual Contact/ Appointment</Label>
                            <Input
                                type="date"
                                name="dateLastAppointment"
                                id="dateLastAppointment"
                                onChange={handleInputChange}
                                value={objValues.dateLastAppointment} 
                                //min= {moment(objValues.dateOfLastViralLoad).format("YYYY-MM-DD") }
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                            {errors.dateLastAppointment !=="" ? (
                                <span className={classes.error}>{errors.dateLastAppointment}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">Date of Missed Scheduled Appointment</Label>
                            <Input
                                type="date"
                                name="dateMissedAppointment"
                                id="dateMissedAppointment"
                                onChange={handleInputChange}
                                value={objValues.dateMissedAppointment} 
                                //min= {moment(objValues.dateOfLastViralLoad).format("YYYY-MM-DD") }
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                            {errors.dateMissedAppointment !=="" ? (
                                <span className={classes.error}>{errors.dateMissedAppointment}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="row">
                        <hr/>
                        <h3>Attempted to Contact</h3>
                        <div className="form-group mb-3 col-md-3">        
                            <FormGroup>
                                <Label >Attempt Date</Label>
                                <Input
                                    type="date"
                                    name="attemptDate"
                                    id="attemptDate"
                                    value={attempt.attemptDate}
                                    onChange={handleInputChangeAttempt}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    
                                    > 
                                </Input>
                                {errors.attemptDate !=="" ? (
                                    <span className={classes.error}>{errors.attemptDate}</span>
                                ) : "" }
                                </FormGroup> 
                            </div> 
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                <Label >Who Attempted Contact?</Label>
                                <Input
                                    type="text"
                                    name="whoAttemptedContact"
                                    id="whoAttemptedContact"
                                    value={attempt.whoAttemptedContact}
                                    onChange={handleInputChangeAttempt}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                {errors.whoAttemptedContact !=="" ? (
                                    <span className={classes.error}>{errors.whoAttemptedContact}</span>
                                ) : "" }   
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                <Label >Mode Of Contact</Label>
                                <Input
                                    type="select"
                                    name="modeOfConatct"
                                    id="modeOfConatct"
                                    value={attempt.modeOfConatct}
                                    onChange={handleInputChangeAttempt}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                >
                                 <option value="">Select</option> 
                                 <option value="Telephone">Telephone</option> 
                                 <option value="Home Visit">Home Visit</option> 
                                </Input> 
                                {errors.modeOfConatct !=="" ? (
                                    <span className={classes.error}>{errors.modeOfConatct}</span>
                                ) : "" }   
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                <Label >Person Contacted</Label>
                                <Input
                                    type="select"
                                    name="personContacted"
                                    id="personContacted"
                                    value={attempt.personContacted}
                                    onChange={handleInputChangeAttempt}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                >
                                 <option value="">Select</option> 
                                 <option value="Guardian">Guardian</option> 
                                 <option value="Client">Client</option> 
                                 <option value="Tx Partner">Tx Partner</option> 
                                 <option value="No Contact">No Contact</option>
                                </Input>
                                {errors.personContacted !=="" ? (
                                    <span className={classes.error}>{errors.personContacted}</span>
                                ) : "" }  
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                <Label >Reason for Defaulting</Label>
                                <Input
                                    type="select"
                                    name="reasonForDefaulting"
                                    id="reasonForDefaulting"
                                    value={attempt.reasonForDefaulting}
                                    onChange={handleInputChangeAttempt}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                >
                                 <option value="">Select</option> 
                                 <option value="Was sick">Was sick</option> 
                                 <option value="No transport fare">No transport fare</option> 
                                 <option value="Transferred to new site">Transferred to new site</option> 
                                 <option value="Forgot">Forgot</option>
                                 <option value="Felt Better">Felt Better</option> 
                                 <option value="Not permitted to leave work">Not permitted to leave work</option> 
                                 <option value="Lost appointment card">Lost appointment card</option> 
                                 <option value="Still had drugs">Still had drugs</option> 
                                 <option value="Taking Herbal Treatment">Taking Herbal Treatment</option>
                                 <option value="Others">Others</option>
                                </Input>
                                {errors.reasonForDefaulting !=="" ? (
                                    <span className={classes.error}>{errors.reasonForDefaulting}</span>
                                ) : "" }  
                                </FormGroup>
                            </div>
                            {attempt.reasonForDefaulting==='Others' && (
                            <div className="form-group mb-3 col-md-3">
                                <FormGroup>
                                <Label >Reason for Defaulting</Label>
                                <Input
                                    type="text"
                                    name="reasonForDefaultingOthers"
                                    id="reasonForDefaultingOthers"
                                    value={attempt.reasonForDefaultingOthers}
                                    onChange={handleInputChangeAttempt}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                />
                                {errors.reasonForDefaultingOthers !=="" ? (
                                <span className={classes.error}>{errors.reasonForDefaultingOthers}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                            )}
                            <div className="form-group mb-3 col-md-2">
                            <LabelSui as='a' color='black'  onClick={addAttempt}  size='tiny' style={{ marginTop:35}}>
                                <Icon name='plus' /> Add
                            </LabelSui>
                            </div>

                            {attemptList.length >0 
                            ?
                                <List>
                                <Table  striped responsive>
                                    <thead >
                                        <tr>
                                            <th>Attempted Date</th>
                                            <th>Who Attempted Contact</th>
                                            <th>Mode Of Conatct</th>
                                            <th>Person Contacted</th>
                                            <th>Reason For Defaulting</th>
                                            <th ></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {attemptList.map((attemptObj, index) => (

                                    <AttemptedLists
                                        key={index}
                                        index={index}
                                        attemptObj={attemptObj}
                                        removeAttempt={removeAttempt}
                                    />
                                    ))}
                                    </tbody>
                                    </Table>
                                </List>
                                :
                                ""
                            }       
                        <hr/>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="">Patient Care in Facility Discontinued? </Label>

                                <Input 
                                    type="select"
                                    name="careInFacilityDiscountinued"
                                    id="careInFacilityDiscountinued"
                                    onChange={handleInputChange}
                                    value={objValues.careInFacilityDiscountinued}  
                                >
                                    <option value=""></option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </Input>
                                {errors.careInFacilityDiscountinued !=="" ? (
                                <span className={classes.error}>{errors.careInFacilityDiscountinued}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {objValues.careInFacilityDiscountinued==='Yes' && (<>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for=""> Date of Discontinuation</Label>
                            <Input
                                type="date"
                                name="dateOfDiscontinuation"
                                id="dateOfDiscontinuation"
                                onChange={handleInputChange}
                                value={objValues.dateOfDiscontinuation} 
                                //min= {moment(objValues.dateOfLastViralLoad).format("YYYY-MM-DD") }
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                            {errors.dateOfDiscontinuation !=="" ? (
                                <span className={classes.error}>{errors.dateOfDiscontinuation}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Reason for Discontinuation</Label>
                            <Input
                                type="select"
                                name="reasonForDiscountinuation"
                                id="reasonForDiscountinuation"
                                onChange={handleInputChange}
                                value={objValues.reasonForDiscountinuation} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            >
                                <option value=""></option>
                                <option value="Treatment stop">Treatment stop</option>
                                <option value="Death">Death  </option>
                                <option value="Loss to follow-up">Loss to follow-up</option>
                                <option value="Self-transfer to another facility">Self-transfer to another facility</option>
                            </Input>
                            {errors.reasonForDiscountinuation !=="" ? (
                                <span className={classes.error}>{errors.reasonForDiscountinuation}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        </>)}
                        {objValues.reasonForDiscountinuation==='Death' && (
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Cause of Death</Label>
                            <Input
                                type="select"
                                name="causeOfDeath"
                                id="causeOfDeath"
                                onChange={handleInputChange}
                                value={objValues.causeOfDeath} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            >
                                <option value=""></option>
                                <option value="Natural cause">Natural cause</option>
                                <option value="Suspected ARV Side effect">Suspected ARV Side effect</option>
                                <option value="Tuberculosis">Tuberculosis</option>
                                <option value="HIV-related (Cancer, parasitic disease)">HIV-related (Cancer, parasitic disease)</option>
                                <option value="Suspected Opportunistic Infection">Suspected Opportunistic Infection</option>
                                <option value="Non-natural cause">Non-natural cause</option>
                                <option value="Other cause of death">Other cause of death</option>
                                <option value="Unknown">Unknown</option>
                            </Input>
                            {errors.causeOfDeath !=="" ? (
                                <span className={classes.error}>{errors.causeOfDeath}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        )}
                        {(objValues.causeOfDeath==='Unknown' || objValues.causeOfDeath==='Other cause of death' || objValues.causeOfDeath==='Suspected Opportunistic Infection') && (
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Cause of Death - {objValues.causeOfDeath} (specify)</Label>
                            <Input
                                type="text"
                                name="causeOfDeathOthers"
                                id="causeOfDeathOthers"
                                onChange={handleInputChange}
                                value={objValues.causeOfDeathOthers} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                            {errors.causeOfDeathOthers !=="" ? (
                                <span className={classes.error}>{errors.causeOfDeathOthers}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        )}
                        {objValues.reasonForDiscountinuation==='Loss to follow-up' && (
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Reason for Loss to follow-up</Label>
                            <Input
                                type="select"
                                name="reasonForLossToFollowUp"
                                id="reasonForLossToFollowUp"
                                onChange={handleInputChange}
                                value={objValues.reasonForLossToFollowUp} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            >
                                <option value=""></option>
                                <option value="Travel/Relocation">Travel/Relocation</option>
                                <option value="Spiritual/Cultural beliefs">Spiritual/Cultural beliefs</option>
                                <option value="Pill burden/ARV side effects">Pill burden/ARV side effects</option>
                                <option value="Stigma/Conduct of staff">Stigma/Conduct of staff</option>
                                <option value="Distance/Economic reasons">Distance/Economic reasons</option>
                                <option value="Others">Others</option>
                            </Input>
                            {errors.reasonForLossToFollowUp !=="" ? (
                                <span className={classes.error}>{errors.reasonForLossToFollowUp}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        )}
                        {objValues.reasonForLossToFollowUp==='Others' && (
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Reason for Loss to follow-up - Others specify</Label>
                            <Input
                                type="textarea"
                                name="reasonForLossToFollowUpOthers"
                                id="reasonForLossToFollowUpOthers"
                                onChange={handleInputChange}
                                value={objValues.reasonForLossToFollowUp} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                              
                            </FormGroup>
                        </div>
                        )}
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for=""> Date Returned to Care</Label>
                            <Input
                                type="date"
                                name="dateReturnToCare"
                                id="dateReturnToCare"
                                onChange={handleInputChange}
                                value={objValues.dateReturnToCare} 
                                //min= {moment(objValues.dateOfLastViralLoad).format("YYYY-MM-DD") }
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                            {errors.dateReturnToCare !=="" ? (
                                <span className={classes.error}>{errors.dateReturnToCare}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Referred for</Label>
                            <Input
                                type="select"
                                name="referredFor"
                                id="referredFor"
                                onChange={handleInputChange}
                                value={objValues.referredFor} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            >
                                <option value=""></option>
                                <option value="Adherence Counselling">Adherence Counselling</option>
                                <option value="Others">Others</option>
                            </Input>
                            {errors.referredFor !=="" ? (
                                <span className={classes.error}>{errors.referredFor}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {objValues.referredFor==='Others' && (
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Referred for - (Others specify ) </Label>
                            <Input
                                type="textarea"
                                name="referredForOthers"
                                id="referredForOthers"
                                onChange={handleInputChange}
                                value={objValues.referredForOthers} 
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                             {errors.referredForOthers !=="" ? (
                                <span className={classes.error}>{errors.referredForOthers}</span>
                                ) : "" } 
                            </FormGroup>
                        </div>
                      )}
                    </div>
                    
                    {saving ? <Spinner /> : ""}
                    <br />
                
                    <MatButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    style={{backgroundColor:"#014d88"}}
                    disabled={objValues.dateOfEac1==="" ? true : false}
                    >
                    {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                    )}
                    </MatButton>
                
                    </form>
                </CardBody>
            </Card>                    
        </div>
  );
}

function AttemptedLists({
    attemptObj,
    index,
    removeAttempt,
  }) {
  
  
    return (
            <tr>
                <th>{attemptObj.attemptDate}</th>
                <th>{attemptObj.whoAttemptedContact}</th>
                <th>{attemptObj.modeOfConatct}</th>
                <th>{attemptObj.personContacted}</th>
                <th>{attemptObj.reasonForDefaulting==='' ? attemptObj.reasonForDefaultingOthers : attemptObj.reasonForDefaulting}</th>
                <th></th>
                <th >
                    <IconButton aria-label="delete" size="small" color="error" onClick={() =>removeAttempt(index)}>
                        <DeleteIcon fontSize="inherit" />
                    </IconButton>
                    
                </th>
            </tr> 
    );
  }
export default Tracking;

import React, {useState, useEffect} from 'react';
import { Form,Row, Card,CardBody, FormGroup, Label, Input} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
// import { Alert } from 'reactstrap';
// import { Spinner } from 'reactstrap';
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "../../../api";
// import { useHistory } from "react-router-dom";
// import {  Modal, Button } from "react-bootstrap";
import "react-widgets/dist/css/react-widgets.css";
// import { DateTimePicker } from "react-widgets";
// import Moment from "moment";
// import momentLocalizer from "react-widgets-moment";
import moment from "moment";
import { Spinner } from "reactstrap";

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
        //maxWidth: 752,
        //flexGrow: 1,
        "& .card-title":{
            color:'#fff',
            fontWeight:'bold'
        },
        "& .form-control":{
            borderRadius:'0.25rem',
            height:'41px'
        },
        "& .card-header:first-child": {
            borderRadius: "calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0"
        },
        "& .dropdown-toggle::after": {
            display: " block !important"
        },
        "& select":{
            "-webkit-appearance": "listbox !important"
        },
        "& p":{
            color:'red'
        },
        "& label":{
            fontSize:'14px',
            color:'#014d88',
            fontWeight:'bold'
        }

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
    },  
    success: {
        color: "#4BB543 ",
        fontSize: "11px",
    },
    
}));

const PrEPEligibiltyScreeningForm = (props) => {

    const patientObj = props.patientObj;
    //let history = useHistory();
    const classes = useStyles()
    const [objValues, setObjValues] = useState({
        dateInterruption: "",
        why: "",
        interruptionType: "",
        dateRestartPlacedBackMedication: "",
        personId: patientObj.personId,
        causeOfDeath: "",
        dateClientDied: "",
        dateClientReferredOut: "",
        facilityReferredTo: "",
        interruptionDate: "",
        interruptionReason: "",
        sourceOfDeathInfo: ""
      });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [prepStatus, setPrepStatus] = useState([]);
    const [patientDto, setPatientDto] = useState();
    useEffect(() => {         
        PREP_STATUS();
        GetPatientDTOObj();
    }, []);
    const GetPatientDTOObj =()=>{
        axios
           .get(`${baseUrl}prep/enrollment/open/patients/${props.patientObj.personId}`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               setPatientDto(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });          
    }
    const PREP_STATUS =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PREP_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setPrepStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const handleInputChange = e => { 
        setErrors({...errors, [e.target.name]: ""})        
        setObjValues ({...objValues,  [e.target.name]: e.target.value});

    }

    const validate = () => {
        let temp = { ...errors }
        //temp.interruptionDate = objValues.interruptionDate ? "" : "This field is required"
        temp.interruptionType = objValues.interruptionType ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();
         //console.log(objValues)
         if(validate()){
          setSaving(true);
          axios.post(`${baseUrl}prep/interruption`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},
          
          ).then(response => {
                  setSaving(false);
                  toast.success("Record save successful");
                  props.PatientObject();
                  props.setActiveContent({...props.activeContent, route:'recent-history'})

              })
              .catch(error => {
                  setSaving(false);
                  if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    if(error.response.data.apierror){
                      toast.error(error.response.data.apierror.message , {position: toast.POSITION.BOTTOM_CENTER});
                    }else{
                      toast.error(errorMessage, {position: toast.POSITION.BOTTOM_CENTER});
                    }
                }else{
                    toast.error("Something went wrong, please try again...", {position: toast.POSITION.BOTTOM_CENTER});
                }
              });
        }
          
    }


  return (      
      <div>                   
        <Card className={classes.root}>
            <CardBody>
            <form >
                <div className="row">
                    <h2> PrEP Discontinuations & Interruptions</h2>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">PrEP Interruptions <span style={{ color:"red"}}> *</span></Label>
                        <Input
                            type="select"
                            name="interruptionType"
                            id="interruptionType"
                            onChange={handleInputChange}
                            value={objValues.interruptionType}
                            required
                        >
                         <option value="">Select</option>

                        {prepStatus.map((value) => (
                            <option key={value.id} value={value.code}>
                                {value.display}
                            </option>
                        ))}
                        </Input>
                        {errors.interruptionType !=="" ? (
                                <span className={classes.error}>{errors.interruptionType}</span>
                            ) : "" } 
                        </FormGroup>
                    </div>
                    {(objValues.interruptionType==='PREP_STATUS_ADVERSE_DRUG_REACTION' || objValues.interruptionType==='PREP_STATUS_STOPPED' || objValues.interruptionType==='PREP_STATUS_LOSS_TO_FOLLOW_UP' ) && (
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="uniqueId">Date of Interruption <span style={{ color:"red"}}> *</span></Label>
                            <Input
                                type="date"
                                name="interruptionDate"
                                id="interruptionDate"
                                min={patientDto && patientDto.dateEnrolled ?patientDto.dateEnrolled :""}
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                onChange={handleInputChange}
                                value={objValues.interruptionDate}
                                required
                            />
                            {errors.interruptionDate !=="" ? (
                                <span className={classes.error}>{errors.interruptionDate}</span>
                            ) : "" } 
                            </FormGroup>
                        </div>
                    )}
                    {objValues.interruptionType==='PREP_STATUS_TRANSFER_OUT' && (
                    <>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Date of client referred out </Label>
                        <Input
                            type="date"
                            name="dateClientReferredOut"
                            id="dateClientReferredOut"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.dateClientReferredOut}
                            required
                        />
                        {errors.dateClientReferredOut !=="" ? (
                            <span className={classes.error}>{errors.dateClientReferredOut}</span>
                        ) : "" } 
                        </FormGroup>
                    </div>
                    
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Facility referred to </Label>
                        <Input
                            type="text"
                            name="facilityReferredTo"
                            id="facilityReferredTo"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.facilityReferredTo}
                            required
                        />
                        {errors.facilityReferredTo !=="" ? (
                            <span className={classes.error}>{errors.facilityReferredTo}</span>
                        ) : "" } 
                        </FormGroup>
                    </div>
                    </>
                    )}
                    {objValues.interruptionType==='PREP_STATUS_DEAD' && (
                    <>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Date of client died </Label>
                        <Input
                            type="date"
                            name="dateClientDied"
                            id="dateClientDied"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.dateClientDied}
                            required
                        />
                        {errors.dateClientDied !=="" ? (
                            <span className={classes.error}>{errors.dateClientDied}</span>
                        ) : "" } 
                        </FormGroup>
                    </div>

                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Cause of death</Label>
                        <Input
                            type="text"
                            name="causeOfDeath"
                            id="causeOfDeath"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.causeOfDeath}
                            required
                        />
                        {errors.causeOfDeath !=="" ? (
                            <span className={classes.error}>{errors.causeOfDeath}</span>
                        ) : "" } 
                        </FormGroup>
                    </div>
                   
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Source of death information  </Label>
                        <Input
                            type="text"
                            name="sourceOfDeathInfo"
                            id="sourceOfDeathInfo"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.sourceOfDeathInfo}
                            required
                        />
                        {errors.sourceOfDeathInfo !=="" ? (
                            <span className={classes.error}>{errors.sourceOfDeathInfo}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    </>
                    )}
                    {/* <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="eligibilityScreeningOccupation">Why ? </Label>
                        <Input
                            type="text"
                            name="why"
                            id="why"
                            onChange={handleInputChange}
                            value={objValues.why}
                            required
                        />
                        
                        </FormGroup>
                    </div> */}
                     {objValues.interruptionType==='PREP_STATUS_RESTART' && (
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Date of restart if placed back on medication</Label>
                        <Input
                            className="form-control"
                            type="date"
                            name="dateRestartPlacedBackMedication"
                            id="dateRestartPlacedBackMedication"
                            //min="1983-12-31"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            value={objValues.dateRestartPlacedBackMedication}
                            onChange={handleInputChange}
                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                        />
                        {errors.dateRestartPlacedBackMedication !=="" ? (
                            <span className={classes.error}>{errors.dateRestartPlacedBackMedication}</span>
                        ) : "" }    
                        </FormGroup>
                    </div>
                     )}
                     {objValues.interruptionType==='PREP_STATUS_SEROCONVERTED' && (
                    <>
                     <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Date Seroconverted </Label>
                        <Input
                            type="date"
                            name="dateSeroconverted"
                            id="dateSeroconverted"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.dateSeroconverted}
                            required
                        />
                        {errors.dateSeroconverted !=="" ? (
                            <span className={classes.error}>{errors.dateSeroconverted}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Link to ART</Label>
                        <Input
                            type="select"
                            name="linkToArt"
                            id="linkToArt"
                            onChange={handleInputChange}
                            value={objValues.linkToArt}  
                        >
                        <option value=""> Select</option>
                        <option value="true">Yes </option>
                        <option value="false"> No</option>
                        </Input>
                        {errors.linkToArt !=="" ? (
                            <span className={classes.error}>{errors.linkToArt}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    {objValues.linkToArt==='true' && (
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Date link to ART</Label>
                        <Input
                            className="form-control"
                            type="date"
                            name="dateLinkToArt"
                            id="dateLinkToArt"
                            //min="1983-12-31"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            value={objValues.dateLinkToArt}
                            onChange={handleInputChange}
                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                        />
                        {errors.dateLinkToArt !=="" ? (
                            <span className={classes.error}>{errors.dateLinkToArt}</span>
                        ) : "" }    
                        </FormGroup>
                    </div>
                    )}
                    </>)}
                    
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
                    style={{backgroundColor:'#014d88',fontWeight:"bolder"}}
                    >
                    {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                    <span style={{ textTransform: "capitalize" }}>Saving...</span>
                    )}
                </MatButton>
            
                <MatButton
                    variant="contained"
                    className={classes.button}
                    startIcon={<CancelIcon />}
                    onClick={props.toggle}
                    style={{backgroundColor:'#992E62'}}
                    
                >
                    <span style={{ textTransform: "capitalize", color:"#fff" }}>Cancel</span>
                </MatButton>
            
                </form>
            </CardBody>
        </Card>                    
    </div>
  );
}

export default PrEPEligibiltyScreeningForm;

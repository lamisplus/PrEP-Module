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
import { useHistory } from "react-router-dom";
import {  Modal, Button } from "react-bootstrap";
import "react-widgets/dist/css/react-widgets.css";
import { DateTimePicker } from "react-widgets";
// import Moment from "moment";
// import momentLocalizer from "react-widgets-moment";
import moment from "moment";
import { Spinner } from "reactstrap";

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
        flexGrow: 1,
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
        },
    },
    input: {
        display: 'none'
    } 
}))

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

    useEffect(() => {         
        PREP_STATUS();
    }, []);
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
        setObjValues ({...objValues,  [e.target.name]: e.target.value});

    }

    const validate = () => {
        let temp = { ...errors }
        //temp.name = details.name ? "" : "This field is required"
        //temp.description = details.description ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();
         console.log(objValues)
          setSaving(true);
          axios.post(`${baseUrl}prep/interruption`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},
          
          ).then(response => {
                  setSaving(false);
                  toast.success("Record save successful");
                  props.setActiveContent({...props.activeContent, route:'recent-history'})

              })
              .catch(error => {
                  setSaving(false);
                  if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    
                      toast.error(errorMessage, {position: toast.POSITION.BOTTOM_CENTER});

                }else{
                    toast.error("Something went wrong, please try again...", {position: toast.POSITION.BOTTOM_CENTER});
                }
              });
          
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
                        <Label for="uniqueId">PrEP Interruptions </Label>
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
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Date of Interruption </Label>
                        <Input
                            type="date"
                            name="interruptionDate"
                            id="interruptionDate"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            onChange={handleInputChange}
                            value={objValues.interruptionDate}
                            required
                        />
                        
                        </FormGroup>
                    </div>
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
                            
                        </FormGroup>
                    </div>
                     )}
                     {objValues.interruptionType==='PREP_STATUS_SEROCONVERTED' && (
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
                        
                        </FormGroup>
                    </div>
                     )}
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
                        <option value="Yes">Yes </option>
                        <option value="No"> No</option>
                        </Input>
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Date link to ART</Label>
                        <Input
                            className="form-control"
                            type="date"
                            name="dateLinkToArt"
                            id="dateRestadateLinkToArtrtPlacedBackMedication"
                            //min="1983-12-31"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            value={objValues.dateLinkToArt}
                            onChange={handleInputChange}
                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                        />
                            
                        </FormGroup>
                    </div>
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
                    
                >
                    <span style={{ textTransform: "capitalize" }}>Cancel</span>
                </MatButton>
            
                </form>
            </CardBody>
        </Card>                    
    </div>
  );
}

export default PrEPEligibiltyScreeningForm;

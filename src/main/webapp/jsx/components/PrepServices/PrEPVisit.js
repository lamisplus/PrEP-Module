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
        '& > *': {
            margin: theme.spacing(1)
        }
    },
    input: {
        display: 'none'
    } 
}))

const PrEPVisit = (props) => {

    const patientObj = props.patientObj;
    let history = useHistory();
    const classes = useStyles()
    const [objValues, setObjValues] = useState({id:"", uniqueId: "",dateOfRegistration:"",entryPointId:"", facilityName:"",statusAtRegistrationId:"",dateConfirmedHiv:"",sourceOfReferrer:"",enrollmentSettingId:"",pregnancyStatusId:"",dateOfLpm:"",tbStatusId:"",targetGroupId:"",ovc_enrolled:"",ovcNumber:""});
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [carePoints, setCarePoints] = useState([]);
    const [hivStatus, setHivStatus] = useState([]);
    //set ro show the facility name field if is transfer in 
    const [transferIn, setTransferIn] = useState(false);
    // display the OVC number if patient is enrolled into OVC 
    const [ovcEnrolled, setOvcEnrolled] = useState(false);

    useEffect(() => {         

      }, []);

    const handleInputChange = e => {
        
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
        if(e.target.name ==="entryPointId" ){
            if(e.target.value==="21"){
                setTransferIn(true)
            }else{
                setTransferIn(false)
            }
        }

    }
          
    //Handle CheckBox 
    const handleCheckBox =e =>{
        if(e.target.checked){
            setOvcEnrolled(true)
        }else{
            setOvcEnrolled(false)
        }
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
        
          objValues.personId= patientObj.id
          patientObj.enrolled=true
          delete objValues['tableData'];
          setSaving(true);
          axios.post(`${baseUrl}hiv/enrollment`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},
          
          )
              .then(response => {
                  setSaving(false);
                  toast.success("Record save successful");
                  props.toggle()
                  props.patientObj.enrolled=true
                  props.PatientCurrentStatus()

              })
              .catch(error => {
                  setSaving(false);
                  toast.error("Something went wrong");
              });
          
    }

  return (      
        <div>                  
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                        <h2>PrEP Visit</h2>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="uniqueId">Duration on PErp  </Label>
                            <Input
                                type="text"
                                name="uniqueId"
                                id="uniqueId"
                                onChange={handleInputChange}
                                value={objValues.uniqueId}
                                required
                            />
                            
                            </FormGroup>
                        </div>
                        </div>
                        <hr/>
                        <div className="row">
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Noted Side Effects</Label>
                            <Input
                                type="select"
                                name="entryPointId"
                                id="entryPointId"
                                onChange={handleInputChange}
                                value={objValues.entryPointId}
                                required
                            >
                                <option value="">Select </option>
                
                                {carePoints.map((value) => (
                                    <option key={value.id} value={value.id}>
                                        {value.display}
                                    </option>
                                ))}
                                {errors.entryPointId !=="" ? (
                                        <span className={classes.error}>{errors.entryPointId}</span>
                                    ) : "" }
                            </Input>
                                
                            </FormGroup>
                        </div>
                        </div>
                        <hr/>
                        
                        <div className="row">
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="entryPointId">HTS Result</Label>
                        <Input
                            type="select"
                            name="entryPointId"
                            id="entryPointId"
                            onChange={handleInputChange}
                            value={objValues.entryPointId}
                            required
                        >
                        <option value=""> </option>
            
                        {carePoints.map((value) => (
                            <option key={value.id} value={value.id}>
                                {value.display}
                            </option>
                        ))}
                        {errors.entryPointId !=="" ? (
                                <span className={classes.error}>{errors.entryPointId}</span>
                            ) : "" }
                        </Input>
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="entryPointId">Risk Reduction Plan</Label>
                        <Input
                            type="select"
                            name="entryPointId"
                            id="entryPointId"
                            onChange={handleInputChange}
                            value={objValues.entryPointId}
                            required
                        >
                        <option value=""> </option>
            
                        {carePoints.map((value) => (
                            <option key={value.id} value={value.id}>
                                {value.display}
                            </option>
                        ))}
                        {errors.entryPointId !=="" ? (
                                <span className={classes.error}>{errors.entryPointId}</span>
                            ) : "" }
                        </Input>
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="entryPointId">Syndromic STI Screening</Label>
                        <Input
                            type="select"
                            name="entryPointId"
                            id="entryPointId"
                            onChange={handleInputChange}
                            value={objValues.entryPointId}
                            required
                        >
                        <option value=""> </option>
            
                        {carePoints.map((value) => (
                            <option key={value.id} value={value.id}>
                                {value.display}
                            </option>
                        ))}
                        {errors.entryPointId !=="" ? (
                                <span className={classes.error}>{errors.entryPointId}</span>
                            ) : "" }
                        </Input>
                        </FormGroup>
                        
                        </div>
                        </div>
                        <hr/>
                        <div className="row">
                        <h3>PrEP Drugs</h3>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Regimen</Label>
                        <Input
                            type="select"
                            name="statusAtRegistrationId"
                            id="statusAtRegistrationId"
                            onChange={handleInputChange}
                            value={objValues.statusAtRegistrationId}
                            required
                        >
                            <option value="">Select </option>
            
                            {hivStatus.map((value) => (
                                <option key={value.id} value={value.id}>
                                    {value.display}
                                </option>
                            ))}
                            {errors.statusAtRegistrationId !=="" ? (
                                    <span className={classes.error}>{errors.statusAtRegistrationId}</span>
                                ) : "" }
                        </Input>
                        </FormGroup>
                        </div>
                    
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Level of Adherence</Label>
                            <Input
                            type="select"
                            name="statusAtRegistrationId"
                            id="statusAtRegistrationId"
                            onChange={handleInputChange}
                            value={objValues.statusAtRegistrationId}
                            required
                        >
                            <option value="">Select </option>
            
                            {hivStatus.map((value) => (
                                <option key={value.id} value={value.id}>
                                    {value.display}
                                </option>
                            ))}
                            {errors.statusAtRegistrationId !=="" ? (
                                    <span className={classes.error}>{errors.statusAtRegistrationId}</span>
                                ) : "" }
                        </Input>
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Why Poor/Fair Adherence?</Label>
                            <Input
                            type="select"
                            name="statusAtRegistrationId"
                            id="statusAtRegistrationId"
                            onChange={handleInputChange}
                            value={objValues.statusAtRegistrationId}
                            required
                        >
                            <option value="">Select </option>
            
                            {hivStatus.map((value) => (
                                <option key={value.id} value={value.id}>
                                    {value.display}
                                </option>
                            ))}
                            {errors.statusAtRegistrationId !=="" ? (
                                    <span className={classes.error}>{errors.statusAtRegistrationId}</span>
                                ) : "" }
                        </Input>
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

export default PrEPVisit;

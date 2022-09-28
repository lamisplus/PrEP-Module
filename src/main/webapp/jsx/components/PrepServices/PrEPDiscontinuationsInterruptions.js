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

const PrEPDiscontinuationsInterruptions = (props) => {

    const patientObj = props.patientObj;
    let history = useHistory();
    const classes = useStyles()
    const [values, setValues] = useState([]);
    const [objValues, setObjValues] = useState({id:"", uniqueId: "",dateOfRegistration:"",entryPointId:"", facilityName:"",statusAtRegistrationId:"",dateConfirmedHiv:"",sourceOfReferrer:"",enrollmentSettingId:"",pregnancyStatusId:"",dateOfLpm:"",tbStatusId:"",targetGroupId:"",ovc_enrolled:"",ovcNumber:""});
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [carePoints, setCarePoints] = useState([]);
    const [sourceReferral, setSourceReferral] = useState([]);
    const [hivStatus, setHivStatus] = useState([]);
    const [enrollSetting, setEnrollSetting] = useState([]);
    const [tbStatus, setTbStatus] = useState([]);
    const [kP, setKP] = useState([]);
    const [pregnancyStatus, setPregnancyStatus] = useState([]);
    //set ro show the facility name field if is transfer in 
    const [transferIn, setTransferIn] = useState(false);
    // display the OVC number if patient is enrolled into OVC 
    const [ovcEnrolled, setOvcEnrolled] = useState(false);

    useEffect(() => {         
        CareEntryPoint();
        SourceReferral();
        HivStatus();
        EnrollmentSetting();
        TBStatus();
        KP();
        PregnancyStatus();
      }, []);

      //Get list of CareEntryPoint
      const CareEntryPoint =()=>{
             axios
                .get(`${baseUrl}application-codesets/v2/POINT_ENTRY`,
                    { headers: {"Authorization" : `Bearer ${token}`} }
                )
                .then((response) => {
                    //console.log(response.data);
                    setCarePoints(response.data);
                })
                .catch((error) => {
                //console.log(error);
                });
            
      }
    //Get list of Source of Referral
    const SourceReferral =()=>{
            axios
            .get(`${baseUrl}application-codesets/v2/SOURCE_REFERRAL`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                //console.log(response.data);
                setSourceReferral(response.data);
            })
            .catch((error) => {
            //console.log(error);
            });
        
    }
     //Get list of HIV STATUS ENROLLMENT
     const HivStatus =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/HIV_STATUS_ENROL`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setHivStatus(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
     }
      //Get list of HIV STATUS ENROLLMENT
      const EnrollmentSetting =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/ENROLLMENT_SETTING`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setEnrollSetting(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
     }
      //Get list of HIV STATUS ENROLLMENT
      const TBStatus =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/TB_STATUS`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setTbStatus(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
     }
      //Get list of KP
      const KP =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/KP_TYPE`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setKP(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
     }
      //Get list of KP
      const PregnancyStatus =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/PREGANACY_STATUS`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setPregnancyStatus(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
     }
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
                    <h2> PrEP Discontinuations & Interruptions</h2>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Interruption Type * </Label>
                        <Input
                            type="select"
                            name="entryPointId"
                            id="entryPointId"
                            onChange={handleInputChange}
                            value={objValues.entryPointId}
                            required
                            >
                            <option value="">select </option>
                            <option value="stop"> Stop</option>
                            <option value="default">Default </option>
                            {errors.entryPointId !=="" ? (
                                    <span className={classes.error}>{errors.entryPointId}</span>
                                ) : "" }
                        </Input>
                        
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Date of Interruption *</Label>
                        <DateTimePicker
                            time={false}
                            name="dateConfirmedHiv"
                            id="dateConfirmedHiv"
                            value={objValues.regDate}
                            onChange={value1 =>
                                setObjValues({ ...objValues, dateConfirmedHiv: moment(value1).format("YYYY-MM-DD") })
                            }
                            
                                max={new Date()}
                        />
                            
                        </FormGroup>
                    </div>
                    
                </div>
                <div className="row">
                    <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                    <Label for="entryPointId">Why?</Label>
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
                        <Label >Date of restart if placed back on medication</Label>
                        <DateTimePicker
                            time={false}
                            name="dateConfirmedHiv"
                            id="dateConfirmedHiv"
                            value={objValues.regDate}
                            onChange={value1 =>
                                setObjValues({ ...objValues, dateConfirmedHiv: moment(value1).format("YYYY-MM-DD") })
                            }
                            
                                max={new Date()}
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

export default PrEPDiscontinuationsInterruptions;

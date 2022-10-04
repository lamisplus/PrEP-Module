import React, {useState, useEffect} from 'react';
import { Form,Row, Card,CardBody, FormGroup, Label, Input,InputGroup,
    InputGroupText,} from 'reactstrap';
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
    },
    error: {
        color: "#f85032",
        fontSize: "11px",
      },
      success: {
        color: "#4BB543 ",
        fontSize: "11px",
      }, 
}))

const PrEPCommencementForm = (props) => {

    const patientObj = props.patientObj;
    console.log(props)
    let history = useHistory();
    const classes = useStyles()
    const [objValues, setObjValues] = useState({
        dateInitialAdherenceCounseling: "",
        datePrepStart: "",
        height: "",
        personId: patientObj.id,
        prepClientId: props.prepId,
        prepRegimen: "",
        urinalysisResult: "",
        weight:"",
        pregnancyStatus:"",
        breastFeeding:"",
        drugAllergies:"",
        reffered:"",
        dateReferred:""

    });
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
            //Vital signs clinical decision support 
    const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
        bodyWeight: "",
        height: "",
    })
    const handleInputChange = e => { 
          
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
    }    

    const validate = () => {
        let temp = { ...errors }
        temp.dateInitialAdherenceCounseling = objValues.dateInitialAdherenceCounseling ? "" : "This field is required"
        temp.datePrepStart = objValues.datePrepStart ? "" : "This field is required"
        temp.prepRegimen = objValues.prepRegimen ? "" : "This field is required"
        temp.height = objValues.height ? "" : "This field is required"
        temp.weight = objValues.weight ? "" : "This field is required"
        temp.reffered = objValues.reffered ? "" : "This field is required"
        temp.dateReferred = objValues.dateReferred ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }
    //to check the input value for clinical decision 
    const handleInputValueCheckHeight =(e)=>{
        if(e.target.name==="height" && (e.target.value < 48.26 || e.target.value>216.408)){
        const message ="Height cannot be greater than 216.408 and less than 48.26"
        setVitalClinicalSupport({...vitalClinicalSupport, height:message})
        }else{
        setVitalClinicalSupport({...vitalClinicalSupport, height:""})
        }
    }
    const handleInputValueCheckBodyWeight =(e)=>{
        if(e.target.name==="bodyWeight" && (e.target.value < 3 || e.target.value>150)){      
        const message ="Body weight must not be greater than 150 and less than 3"
        setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:message})
        }else{
        setVitalClinicalSupport({...vitalClinicalSupport, bodyWeight:""})
        }
    }
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();
        if(validate()){
           setSaving(true);
          axios.put(`${baseUrl}prep/${props.prepId}/commencement`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},          
          ).then(response => {
                  setSaving(false);
                  toast.success("Record save successful");
                  props.setActiveContent({...props.activeContent, route:'recent-history'})
                 
              })
              .catch(error => {
                  setSaving(false);
                  let errorMessage = error.response.data && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "An error occured while registering a patient !";
                    toast.error(errorMessage, {
                        position: toast.POSITION.TOP_RIGHT
                    });
              });
            }          
    }

  return (      
        <div >      
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                        <h2> PrEP Commencement </h2>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="uniqueId">Date of Initial Adherence Counseling </Label>
                            <Input
                                className="form-control"
                                type="date"
                                name="dateInitialAdherenceCounseling"
                                id="dateInitialAdherenceCounseling"
                                //min="1983-12-31"
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                value={objValues.dateInitialAdherenceCounseling}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                            />
                            {errors.dateInitialAdherenceCounseling !=="" ? (
                                <span className={classes.error}>{errors.dateInitialAdherenceCounseling}</span>
                            ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Date PrEP started *</Label>
                            <Input
                                className="form-control"
                                type="date"
                                name="datePrepStart"
                                id="datePrepStart"
                                //min="1983-12-31"
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                value={objValues.dateOfRegistration}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                            />
                             {errors.datePrepStart !=="" ? (
                                <span className={classes.error}>{errors.datePrepStart}</span>
                            ) : "" }   
                            </FormGroup>
                        </div>
                        
                    </div>
                    
                    <div className="row">
                        <div className=" mb-3 col-md-4">
                            <FormGroup>
                            <Label >Body Weight</Label>
                            <InputGroup> 
                                <Input 
                                    type="number"
                                    name="weight"
                                    id="weight"
                                    onChange={handleInputChange}
                                    min="3"
                                    max="150"
                                    value={objValues.weight}
                                    onKeyUp={handleInputValueCheckBodyWeight} 
                                    style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                />
                                <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                    kg
                                </InputGroupText>
                            </InputGroup>
                            {vitalClinicalSupport.bodyWeight !=="" ? (
                                    <span className={classes.error}>{vitalClinicalSupport.bodyWeight}</span>
                            ) : ""}
                            {errors.weight !=="" ? (
                                <span className={classes.error}>{errors.weight}</span>
                            ) : "" }
                            </FormGroup>
                        </div>                                   
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Height</Label>
                            <InputGroup> 
                            <InputGroupText
                                    addonType="append"
                                    style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}
                                    >
                                    cm
                            </InputGroupText>
                                <Input 
                                    type="number"
                                    name="height"
                                    id="height"
                                    onChange={handleInputChange}
                                    value={objValues.height}
                                    min="48.26"
                                    max="216.408"
                                    onKeyUp={handleInputValueCheckHeight} 
                                    style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                />
                                    <InputGroupText
                                    addonType="append"
                                    
                                    style={{ backgroundColor:"#992E62", color:"#fff", border: "1px solid #992E62", borderRadius:"0rem"}}
                                    >
                                    {objValues.height!=='' ? (objValues.height/100).toFixed(2) + "m" : "m"}
                                </InputGroupText>
                            </InputGroup>
                            {vitalClinicalSupport.height !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.height}</span>
                            ) : ""}
                            {errors.height !=="" ? (
                                <span className={classes.error}>{errors.height}</span>
                            ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 mt-2 col-md-4">
                            {objValues.weight!=="" && objValues.height!==''&&(
                                <FormGroup>
                                <Label > {" "}</Label>
                                <InputGroup> 
                                <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                    BMI : {Math.round(objValues.weight/((objValues.height * objValues.height)/100))}
                                </InputGroupText>                   
                            
                                </InputGroup>                
                                </FormGroup>
                            )}
                        </div>
                                
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="prepRegimen">Pregnancy Status</Label>
                        <Input
                            type="select"
                            name="pregnancyStatus"
                            id="pregnancyStatus"
                            onChange={handleInputChange}
                            value={objValues.pregnancyStatus}
                            
                        >
                        <option value="1"> </option>
                        {carePoints.map((value) => (
                            <option key={value.id} value={value.id}>
                                {value.display}
                            </option>
                        ))}
                        
                        </Input>
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="">Breast Feeding</Label>
                        <Input
                            type="select"
                            name="breastFeeding"
                            id="breastFeeding"
                            onChange={handleInputChange}
                            value={objValues.breastFeeding}
                            
                        >
                        <option value=""> </option>
                        <option value="Yes"> Yes</option>
                        <option value="No"> No</option>
                        </Input>
                        
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="">History of drug Allergies</Label>
                        <Input
                            type="textarea"
                            name="drugAllergies"
                            id="drugAllergies"
                            onChange={handleInputChange}
                            value={objValues.drugAllergies}
                            
                        />
                      
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="">Urinalysis Result</Label>
                        <Input
                            type="text"
                            name="urinalysisResult"
                            id="urinalysisResult"
                            onChange={handleInputChange}
                            value={objValues.urinalysisResult}
                            
                        />
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="">Referred</Label>
                        <Input
                            type="select"
                            name="reffered"
                            id="reffered"
                            onChange={handleInputChange}
                            value={objValues.reffered}
                            
                        >
                        <option value=""> </option>
                        <option value="Yes"> Yes</option>
                        <option value="No"> No</option>
                        </Input>
                        {errors.reffered !=="" ? (
                                <span className={classes.error}>{errors.reffered}</span>
                            ) : "" } 
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="">Date Referred</Label>
                        <Input
                            type="date"
                            name="dateReferred"
                            id="dateReferred"
                            onChange={handleInputChange}
                            value={objValues.dateReferred}
                            
                        />
                        {errors.dateReferred !=="" ? (
                                <span className={classes.error}>{errors.dateReferred}</span>
                            ) : "" } 
                        </FormGroup>
                        
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="prepRegimen">PrEP Regimen</Label>
                        <Input
                            type="select"
                            name="prepRegimen"
                            id="prepRegimen"
                            onChange={handleInputChange}
                            value={objValues.prepRegimen}
                            
                        >
                        <option value="1"> All Regimen</option>
                        <option value="34"> First Line</option>
                        <option value="34"> Second Line</option>
                        <option value="34"> Third Line</option>
            
                        </Input>
                        {errors.prepRegimen !=="" ? (
                                <span className={classes.error}>{errors.prepRegimen}</span>
                            ) : "" } 
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

export default PrEPCommencementForm;

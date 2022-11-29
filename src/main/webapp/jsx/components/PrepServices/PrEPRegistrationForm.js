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

const PrEPRegistrationForm = (props) => {

    const patientObj = props.patientObj;
    let history = useHistory();
    const classes = useStyles()
    const [objValues, setObjValues] = useState({
        dateEnrolled: "",
        dateReferred: "",
        extra: {},
        personId: 0,
        prepEligibilityUuid: "",
        riskType: "",
        supporterName: "",
        supporterPhone: "",
        supporterRelationshipType: "",
        uniqueId: ""
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [carePoints, setCarePoints] = useState([]);
    const [relatives, setRelatives] = useState([]);
    const [patientDto, setPatientDto] = useState();

    useEffect(() => {         
        GetPatientDTOObj();
        RELATIONSHIP();
      }, []);
      const RELATIONSHIP =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/RELATIONSHIP`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               setRelatives(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });          
    } 
    const GetPatientDTOObj =()=>{
        axios
           .get(`${baseUrl}prep/eligibility/open/patients/${props.patientObj.personId}`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //const patientDTO= response.data.enrollment
               setPatientDto(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });          
    } 
    console.log(patientDto)
    const handleInputChange = e => {        
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
    } 
    
    const validate = () => {
        let temp = { ...errors }
        temp.dateEnrolled = objValues.dateEnrolled ? "" : "This field is required"
        temp.dateReferred = objValues.dateReferred ? "" : "This field is required"
        temp.riskType = objValues.riskType ? "" : "This field is required"
        temp.supporterName = objValues.supporterName ? "" : "This field is required"
        temp.supporterPhone = objValues.supporterPhone ? "" : "This field is required"
        temp.supporterRelationshipType = objValues.supporterRelationshipType ? "" : "This field is required"
        temp.uniqueId = objValues.uniqueId ? "" : "This field is required"
        setErrors({
            ...temp
            })    
        return Object.values(temp).every(x => x == "")
    }
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();
        if(validate) {   
          objValues.personId=props.patientObj.personId
          objValues.prepEligibilityUuid=patientDto.uuid 
          setSaving(true);
          axios.post(`${baseUrl}prep/enrollment`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},
          
          )
              .then(response => {
                  setSaving(false);
                  props.patientObj.prepEnrollmentCount=1
                  toast.success("Prep Enrollment save successful!", {position: toast.POSITION.BOTTOM_CENTER});
                  props.setActiveContent({...props.activeContent, route:'recent-history'})
              })
              .catch(error => {
                  setSaving(false);
                  toast.error("Something went wrong");
              });
        }
    }

  return (      
      <div >                  
        <Card >
            <CardBody>
            <form >
            <div className="row">
                            <h2>PrEP Enrollment </h2>
                            <div className="form-group mb-3 col-md-6">
                                <FormGroup>
                                <Label for="uniqueId">Unique Client's ID  * </Label>
                                <Input
                                    type="text"
                                    name="uniqueId"
                                    id="uniqueId"
                                    onChange={handleInputChange}
                                    value={objValues.uniqueId}
                                    required
                                />
                                {errors.uniqueId !=="" ? (
                                    <span className={classes.error}>{errors.uniqueId}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <FormGroup>
                                <Label for="">Partner ANC/Unique ART No </Label>
                                <Input
                                    type="text"
                                    name="ancUniqueArtNo"
                                    id="ancUniqueArtNo"
                                    onChange={handleInputChange}
                                    value={objValues.ancUniqueArtNo}
                                    required
                                />
                                {errors.ancUniqueArtNo !=="" ? (
                                    <span className={classes.error}>{errors.ancUniqueArtNo}</span>
                                ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <FormGroup>
                                <Label >Date enrolled in PrEP *</Label>
                                <Input
                                    className="form-control"
                                    type="date"
                                    name="dateEnrolled"
                                    id="dateEnrolled"
                                    value={objValues.dateEnrolled}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    min={patientDto && patientDto.visitDate ?patientDto.visitDate :""}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                />
                                    {errors.dateEnrolled !=="" ? (
                                        <span className={classes.error}>{errors.dateEnrolled}</span>
                                    ) : "" } 
                                </FormGroup>
                            </div>

                                <div className="form-group mb-3 col-md-6">
                                <FormGroup>
                                <Label for="entryPointId">PrEP Risk Type*</Label>
                                <Input
                                    type="select"
                                    name="riskType"
                                    id="riskType"
                                    onChange={handleInputChange}
                                    value={objValues.riskType}
                                    required
                                >
                                <option value=""> Select</option>
                    
                                {relatives.map((value) => (
                                    <option key={value.id} value={value.code}>
                                        {value.display}
                                    </option>
                                ))}
                               
                                </Input>
                                 {errors.riskType !=="" ? (
                                        <span className={classes.error}>{errors.riskType}</span>
                                    ) : "" }
                                </FormGroup>
                                
                                </div>
                                {props.patientObj.hivPositive===true && (
                                <div className="form-group mb-3 col-md-6">
                                <FormGroup>
                                <Label >HIV Testing Point </Label>
                                <Input
                                    type="text"
                                    name="hivTestingPoint"
                                    id="hivTestingPoint"
                                    onChange={handleInputChange}
                                    value={"Positive"}
                                    disabled
                                />
                               
                                </FormGroup>
                                </div>
                                )}
                                {props.patientObj.dateHivPositive!==null && (
                                <div className="form-group mb-3 col-md-6">
                                    <FormGroup>
                                    <Label >Date of last HIV Negative test*</Label>
                                    <Input
                                        className="form-control"
                                        type="date"
                                        name="dateOfLastHivNegativeTest"
                                        id="dateOfLastHivNegativeTest"
                                        value={props.patientObj.dateHivPositive}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        max= {moment(new Date()).format("YYYY-MM-DD") }
                                        disabled
                                    />
                                     {errors.dateOfLastHivNegativeTest !=="" ? (
                                        <span className={classes.error}>{errors.dateOfLastHivNegativeTest}</span>
                                    ) : "" }   
                                    </FormGroup>
                                </div>
                                )}
                                <div className="form-group mb-3 col-md-6">
                                    <FormGroup>
                                    <Label >Date Referred for PrEP * </Label>
                                    <Input
                                        className="form-control"
                                        type="date"
                                        name="dateReferred"
                                        id="dateReferred"
                                        value={objValues.dateReferred}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        min={patientDto && patientDto.visitDate ?patientDto.visitDate :""}
                                        max= {moment(new Date()).format("YYYY-MM-DD") }
                                    />
                                    {errors.dateReferred !=="" ? (
                                        <span className={classes.error}>{errors.dateReferred}</span>
                                    ) : "" }
                                    </FormGroup>
                                </div>
                                
                                <div className="form-group mb-3 col-md-6">
                                    <FormGroup>
                                    <Label >PrEP Supporter </Label>
                                    <Input
                                        className="form-control"
                                        type="text"
                                        name="supporterName"
                                        id="supporterName"
                                        value={objValues.supporterName}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        //disabled={locationState.actionType==='update'? false : true}
                                    />
                                    {errors.supporterName !=="" ? (
                                        <span className={classes.error}>{errors.supporterName}</span>
                                    ) : "" }
                                    </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                    <FormGroup>
                                    <Label >Relationship</Label>
                                    <Input
                                        className="form-control"
                                        type="select"
                                        name="supporterRelationshipType"
                                        id="supporterRelationshipType"
                                        value={objValues.supporterRelationshipType}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        //disabled={locationState.actionType==='update'? false : true}
                                    >
                                        <option value=""> Select</option>
                    
                                        {relatives.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}
                                    </Input>
                                    {errors.supporterRelationshipType !=="" ? (
                                        <span className={classes.error}>{errors.supporterRelationshipType}</span>
                                    ) : "" }
                                    </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-6">
                                    <FormGroup>
                                    <Label >PrEP Supporter Phone Number</Label>
                                    <Input
                                        className="form-control"
                                        type="text"
                                        name="supporterPhone"
                                        id="supporterPhone"
                                        value={objValues.supporterPhone}
                                        onChange={handleInputChange}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        //disabled={locationState.actionType==='update'? false : true}
                                    />
                                    {errors.supporterPhone !=="" ? (
                                        <span className={classes.error}>{errors.supporterPhone}</span>
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

export default PrEPRegistrationForm;

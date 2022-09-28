import React, {useState, useEffect} from 'react';
import { Card,CardBody, FormGroup, Label,InputGroup,
        InputGroupText,
        InputGroupButtonDropdown,
        InputGroupAddon,
        Input,
        Dropdown,
        DropdownToggle,
        DropdownMenu,
        DropdownItem} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "../../../api";
//import { useHistory } from "react-router-dom";
import {  Modal, Button } from "react-bootstrap";
import "react-widgets/dist/css/react-widgets.css";
import moment from "moment";
import 'react-summernote/dist/react-summernote.css'; // import styles
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

const ArtCommencement = (props) => {
    const patientObj = props.patientObj;
    //let history = useHistory();
    //console.log(props.activeContent.id)
    let gender=""
    const enrollDate = patientObj && patientObj.enrollment ? patientObj.enrollment.dateOfRegistration : null
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [splitButtonOpen, setSplitButtonOpen] = React.useState(false);
    const toggleDropDown = () => setDropdownOpen(!dropdownOpen);
    const toggleSplit = () => setSplitButtonOpen(!splitButtonOpen);
    const [heightValue, setHeightValue]= useState("cm")
    const classes = useStyles()
    const [clinicalStage, setClinicalStage] = useState([])
    const [values, setValues] = useState([]);
    const [saving, setSaving] = useState(false);
    const [viraLoadStart, setViraLoadStart] = useState(false);
    const [errors, setErrors] = useState({});
    let temp = { ...errors }
    const [tbStatus, setTbStatus] = useState([]);
    const [regimenLine, setRegimenLine] = useState([]);
    const [regimenType, setRegimenType] = useState([]);
    const [pregancyStatus, setPregancyStatus] = useState([]);
    const [functionalStatus, setFunctionalStatus] = useState([]);
    const [objValues, setObjValues] = useState({
                                                personId:props.patientObj.id,
                                                visitDate: "",
                                                viralLoad: "",
                                                whoStagingId:"",
                                                clinicalStageId:"",
                                                cd4: "",
                                                cd4Percentage: "",
                                                isCommencement: true,
                                                functionalStatusId: "",
                                                clinicalNote: "",
                                                hivEnrollmentId: "",
                                                vitalSignDto:"",
                                                facilityId:1,
                                                regimenTypeId: 0,
                                                regimenId:0,
                                                viralLoadAtStartOfArt:"",
                                                isViralLoadAtStartOfArt :null,
                                                dateOfViralLoadAtStartOfArt: null                                                    

                                                });

    const [vital, setVitalSignDto]= useState({
                                                bodyWeight: "",
                                                diastolic:"",
                                                encounterDate: "",
                                                facilityId: 1,
                                                height: "",
                                                personId: props.patientObj.id,
                                                serviceTypeId: 1,
                                                systolic:"",
                                                pulse:"",
                                                temperature:"",
                                                respiratoryRate:""  
                                            })
      //Vital signs clinical decision support 
    const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
                                                                        bodyWeight: "",
                                                                        diastolic: "",
                                                                        height: "",
                                                                        systolic: "",
                                                                        pulse:"",
                                                                        temperature:"",
                                                                        respiratoryRate:"" 
                                                                    })

    useEffect(() => {
        FunctionalStatus();
        WhoStaging();
        TBStatus();
        PreganacyStatus();
        RegimenLine();
        GetARTCommencement();
        gender =props.patientObj.gender && props.patientObj.gender.display ? props.patientObj.gender.display : null
      }, [props.activeContent.id]);
          //Get Mental Health Object
    const GetARTCommencement =()=>{
        axios
           .get(`${baseUrl}hiv/art/commencement/${props.activeContent.id}`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => { 
                //console.log(response.data)           
                setObjValues(response.data)
                if(response.data.isViralLoadAtStartOfArt===true){
                    setViraLoadStart(true)
                }
                RegimenType(response.data.regimenTypeId)
                setVitalSignDto(response.data.vitalSignDto)
           })
           .catch((error) => {
           //console.log(error);
           });
       
        }
      //Get list of WhoStaging
      const WhoStaging =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/CLINICAL_STAGE`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setClinicalStage(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
        }
        //Get list of RegimenLine
        const RegimenLine =()=>{
        axios
           .get(`${baseUrl}hiv/regimen/types`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setRegimenLine(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
        }
         //Get list of RegimenLine
         const RegimenType =(id)=>{
            axios
               .get(`${baseUrl}hiv/regimen/types/${id}`,
                   { headers: {"Authorization" : `Bearer ${token}`} }
               )
               .then((response) => {
                   //console.log(response.data);
                   setRegimenType(response.data);
               })
               .catch((error) => {
               //console.log(error);
               });
           
            }
        //Get list of PREGANACY_STATUS
      const PreganacyStatus =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/PREGANACY_STATUS`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setPregancyStatus(response.data);
           })
           .catch((error) => {
           //console.log(error);
           });
       
        }
        ///GET LIST OF FUNCTIONAL%20_STATUS
        async function FunctionalStatus() {
            axios
                .get(`${baseUrl}application-codesets/v2/FUNCTIONAL%20_STATUS`,
                { headers: {"Authorization" : `Bearer ${token}`} }
                )
                .then((response) => {
                    
                    setFunctionalStatus(response.data);
                    //setValues(response.data)
                })
                .catch((error) => {    
                });        
        }
        // TB STATUS
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

        const handleInputChange = e => {
            setErrors({...temp, [e.target.name]:""})
            setObjValues ({...objValues,  [e.target.name]: e.target.value});
            if(e.target.name==='isViralLoadAtStartOfArt' && e.target.value!==""){
                if(e.target.value==='true'){
                    setViraLoadStart(true)
                    setObjValues ({...objValues,  [e.target.name]: true});
                }else{
                    setObjValues({...objValues, [e.target.name]:false})
                    setViraLoadStart(false)
                }
            }
        }
        const handleInputChangeVitalSignDto = e => { 
            setErrors({...temp, [e.target.name]:""})           
            setVitalSignDto ({...vital,  [e.target.name]: e.target.value});
        }
        const handleSelecteRegimen = e => { 
            let regimenID=  e.target.value
            setObjValues ({...objValues, regimenId:regimenID});
            RegimenType(regimenID)           
            setErrors({...temp, [e.target.name]:""})
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
        const handleInputValueCheckSystolic =(e)=>{
            if(e.target.name==="systolic" && (e.target.value < 90 || e.target.value>240)){      
            const message ="Blood Pressure systolic must not be greater than 240 and less than 90"
            setVitalClinicalSupport({...vitalClinicalSupport, systolic:message})
            }else{
            setVitalClinicalSupport({...vitalClinicalSupport, systolic:""})
            }
        }
        const handleInputValueCheckDiastolic =(e)=>{
            if(e.target.name==="diastolic" && (e.target.value < 60 || e.target.value>140)){      
            const message ="Blood Pressure diastolic must not be greater than 140 and less than 60"
            setVitalClinicalSupport({...vitalClinicalSupport, diastolic:message})
            }else{
            setVitalClinicalSupport({...vitalClinicalSupport, diastolic:""})
            }
        }
        const handleInputValueCheckPulse =(e)=>{
            if(e.target.name==="pulse" && (e.target.value < 40 || e.target.value>120)){      
            const message ="Pulse must not be greater than 120 and less than 40"
            setVitalClinicalSupport({...vitalClinicalSupport, pulse:message})
            }else{
            setVitalClinicalSupport({...vitalClinicalSupport, pulse:""})
            }
        }
        const handleInputValueCheckRespiratoryRate =(e)=>{
            if(e.target.name==="respiratoryRate" && (e.target.value < 10 || e.target.value>70)){      
            const message ="Respiratory Rate must not be greater than 70 and less than 10"
            setVitalClinicalSupport({...vitalClinicalSupport, respiratoryRate:message})
            }else{
            setVitalClinicalSupport({...vitalClinicalSupport, respiratoryRate:""})
            }
        }
        const handleInputValueCheckTemperature =(e)=>{
            if(e.target.name==="temperature" && (e.target.value < 35 || e.target.value>47)){      
            const message ="Temperature must not be greater than 47 and less than 35"
            setVitalClinicalSupport({...vitalClinicalSupport, temperature:message})
            }else{
            setVitalClinicalSupport({...vitalClinicalSupport, temperature:""})
            }
        }
        const handleInputChangeVitalStart =(e)=>{
            if(e.target.value==="YES" ){
                setViraLoadStart(true)
                setObjValues({...objValues, viralLoad:e.target.value})
            }else{
                setObjValues({...objValues, viralLoad:e.target.value})
                setViraLoadStart(false)
            }
        }

        //FORM VALIDATION
        const validate = () => {
            temp.visitDate = objValues.visitDate ? "" : "This field is required"
            temp.regimenId = objValues.regimenId ? "" : "This field is required"
            temp.regimenTypeId = objValues.regimenTypeId ? "" : "This field is required"
            temp.whoStagingId = objValues.whoStagingId ? "" : "This field is required"
            temp.functionalStatusId = objValues.functionalStatusId ? "" : "This field is required"
            //temp.tbStatusId = objValues.tbStatusId ? "" : "This field is required"
            temp.bodyWeight = vital.bodyWeight ? "" : "This field is required"
            temp.height = vital.height ? "" : "This field is required"
            temp.systolic = vital.systolic ? "" : "This field is required"
            temp.diastolic = vital.diastolic ? "" : "This field is required"
            setErrors({
                ...temp
                })    
            return Object.values(temp).every(x => x == "")
        }

        const  heightFunction =(e)=>{
            if(e==='cm'){
                setHeightValue('cm')
                if(vital.height!==""){
                    const newHeightValue= (vital.height * 100)
                    setVitalSignDto ({...vital,  height: newHeightValue});
                }
            }else if(e==='m'){
                setHeightValue('m')
                if(vital.height!==""){
                    const newHeightValue= (vital.height/100)
                    setVitalSignDto ({...vital,  height: newHeightValue});
                }
                
            }

        }
        /**** Submit Button Processing  */
        const handleSubmit = (e) => {                  
            e.preventDefault(); 
            if(validate()){                    
            objValues.personId = props.patientObj.id
            vital.encounterDate = objValues.visitDate
            vital.personId=props.patientObj.id
            objValues.vitalSignDto= vital
            objValues.hivEnrollmentId= props.patientObj.enrollment.id
            objValues.clinicalStageId = objValues.whoStagingId 
            if(heightValue==='m'){//If height is meter convert to centi meter
                vital.height= (vital.height/100).toFixed(2)
            } 
            setSaving(true);
            axios.put(`${baseUrl}hiv/art/commencement/${props.activeContent.id}`,objValues,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
              .then(response => {
                  setSaving(false);
                  props.setArt(true)
                  props.patientObj.commenced=true
                  toast.success("Record save successful");
                  props.setActiveContent({...props.activeContent, route:'recent-history'})

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
            }
          
        }

        

  return (      
      <div >
                  
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                    <div className="col-md-6">
                        <h2>ART Commencement</h2>
                    </div>
                    <div className="col-md-6"></div>
                    <br/>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="artDate">ART Start Date  * </Label>
                            <Input
                                type="date"
                                name="visitDate"
                                id="visitDate"
                                onChange={handleInputChange}
                                value={objValues.visitDate}
                                min={enrollDate}
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                            />
                                {errors.visitDate !=="" ? (
                                <span className={classes.error}>{errors.visitDate}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label for="cd4">CD4 at start of ART </Label>
                            <Input
                                type="number"
                                name="cd4"
                                id="cd4"
                                onChange={handleInputChange}
                                value={objValues.cd4}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                            />
                            
                            </FormGroup>
                        </div>
                    
                        <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label for="cd4Percentage">CD4%</Label>
                        <Input
                            type="number"
                            name="cd4Percentage"
                            id="cd4Percentage"
                            onChange={handleInputChange}
                            value={objValues.cd4Percentage}
                            style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                            disabled={props.activeContent.actionType==='update' ? false :true}
                        />
                        
                        </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Original Regimen Line  </Label>
                        <Input
                                type="select"
                                name="regimenId"
                                id="regimenId"
                                value={objValues.regimenId}
                                onChange={handleSelecteRegimen}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                >
                                    <option value=""> Select</option>
            
                                    {regimenLine.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.description}
                                        </option>
                                    ))}
                            </Input>
                            {errors.regimenId !=="" ? (
                                <span className={classes.error}>{errors.regimenId}</span>
                                ) : "" }
                        </FormGroup>
                        </div>
                        
                        <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Original Regimen</Label>
                        <Input
                                type="select"
                                name="regimenTypeId"
                                id="regimenTypeId"
                                value={objValues.regimenTypeId}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                >
                                    <option value=""> Select</option>
            
                                    {regimenType.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.description}
                                        </option>
                                    ))}
                            </Input>
                            {errors.regimenTypeId !=="" ? (
                                <span className={classes.error}>{errors.regimenTypeId}</span>
                                ) : "" }
                        </FormGroup>
                        </div>
                    
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Viral Load at Start of ART </Label>
                            <Input
                                type="select"
                                name="isViralLoadAtStartOfArt"
                                id="isViralLoadAtStartOfArt"
                                onChange={handleInputChange}                                            
                                value={objValues.isViralLoadAtStartOfArt}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                
                            >
                                <option value=""> Select</option>
                                <option value="true"> YES</option>
                                <option value="false"> NO</option>
                            </Input>
                            
                            </FormGroup>
                        </div>
                        {viraLoadStart && (
                        <>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Viral Load at Start of ART Result</Label>
                            <Input
                                type="number"
                                name="viralLoadAtStartOfArt"
                                id="viralLoadAtStartOfArt"
                                onChange={handleInputChange}
                                value={objValues.viralLoadAtStartOfArt}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                
                            />
                            
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Date of Viral Load at Start of ART</Label>
                            <Input
                                type="date"
                                name="dateOfViralLoadAtStartOfArt"
                                id="dateOfViralLoadAtStartOfArt"
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                onChange={handleInputChange}
                                value={objValues.dateOfViralLoadAtStartOfArt}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                
                            />
                            
                            </FormGroup>
                        </div>
                        </>
                        )}
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >WHO Staging</Label>
                            <Input
                                type="select"
                                name="whoStagingId"
                                id="whoStagingId"
                                value={objValues.whoStagingId}
                                onChange={handleInputChange}
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                
                                >
                                    <option value=""> Select</option>
            
                                    {clinicalStage.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.display}
                                        </option>
                                    ))}
                            </Input>
                            {errors.whoStagingId !=="" ? (
                                <span className={classes.error}>{errors.whoStagingId}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        
                        <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >Functional Status</Label>
                            <Input
                                type="select"
                                name="functionalStatusId"
                                id="functionalStatusId"
                                value={objValues.functionalStatusId}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update' ? false :true}
                                
                                >
                                    <option value=""> Select</option>
            
                                    {functionalStatus.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.display}
                                        </option>
                                    ))}
                            </Input>
                            {errors.functionalStatusId !=="" ? (
                                <span className={classes.error}>{errors.functionalStatusId}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {/* <div className="form-group mb-3 col-md-4">
                            <FormGroup>
                            <Label >TB Status</Label>
                            <Input
                                type="select"
                                name="tbStatusId"
                                id="tbStatusId"
                                value={objValues.tbStatusId}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                required
                                >
                                    <option value=""> Select</option>
            
                                    {tbStatus.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.display}
                                        </option>
                                    ))}
                            </Input>
                            {errors.tbStatusId !=="" ? (
                                <span className={classes.error}>{errors.tbStatusId}</span>
                                ) : "" }
                            </FormGroup>
                        </div> */}
                        <div className="row">
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <Label >Pulse</Label>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="pulse"
                                id="pulse"
                                onChange={handleInputChangeVitalSignDto}
                                min="40"
                                max="120"
                                value={vital.pulse}
                                onKeyUp={handleInputValueCheckPulse} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                bmp
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.pulse !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.pulse}</span>
                        ) : ""}
                        {errors.pulse !=="" ? (
                            <span className={classes.error}>{errors.pulse}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <Label >Respiratory Rate </Label>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="respiratoryRate"
                                id="respiratoryRate"
                                onChange={handleInputChangeVitalSignDto}
                                min="10"
                                max="70"
                                value={vital.respiratoryRate}
                                onKeyUp={handleInputValueCheckRespiratoryRate} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                bmp
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.respiratoryRate !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.respiratoryRate}</span>
                        ) : ""}
                        {errors.respiratoryRate !=="" ? (
                            <span className={classes.error}>{errors.respiratoryRate}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <Label >Temperature </Label>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="temperature"
                                id="temperature"
                                onChange={handleInputChangeVitalSignDto}
                                min="35"
                                max="47"
                                value={vital.temperature}
                                onKeyUp={handleInputValueCheckTemperature} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                <sup>o</sup>c
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.temperature !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.temperature}</span>
                        ) : ""}
                        {errors.temperature !=="" ? (
                            <span className={classes.error}>{errors.temperature}</span>
                        ) : "" }
                        </FormGroup>
                    </div>
                   
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <Label >Body Weight</Label>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="bodyWeight"
                                id="bodyWeight"
                                onChange={handleInputChangeVitalSignDto}
                                min="3"
                                max="150"
                                value={vital.bodyWeight}
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
                        {errors.bodyWeight !=="" ? (
                            <span className={classes.error}>{errors.bodyWeight}</span>
                        ) : "" }
                        </FormGroup>
                    </div>                                   
                    <div className="form-group mb-3 col-md-4">
                        <FormGroup>
                        <Label >Height</Label>
                        <InputGroup> 
                        <InputGroupText
                                addonType="append"
                                isOpen={dropdownOpen}
                                toggle={toggleDropDown}
                                style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}
                                >
                                cm
                        </InputGroupText>
                            <Input 
                                type="number"
                                name="height"
                                id="height"
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.height}
                                min="48.26"
                                max="216.408"
                                onKeyUp={handleInputValueCheckHeight} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                            />
                                <InputGroupText
                                addonType="append"
                                isOpen={dropdownOpen}
                                toggle={toggleDropDown}
                                style={{ backgroundColor:"#992E62", color:"#fff", border: "1px solid #992E62", borderRadius:"0rem"}}
                                >
                                {vital.height!=='' ? (vital.height/100).toFixed(2) + "m" : "m"}
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
                        {vital.bodyWeight!=="" && vital.height!=='' && (
                            <FormGroup>
                            <Label > {" "}</Label>
                            <InputGroup> 
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                BMI : {Math.round(vital.bodyWeight/((vital.height * vital.height)/100))}
                            </InputGroupText>                   
                           
                            </InputGroup>                
                            </FormGroup>
                        )}
                    </div>
                    </div>
                    <div className="row">
                    <div className="form-group mb-3 col-md-8">
                        <FormGroup>
                        <Label >Blood Pressure</Label>
                        <InputGroup>
                        <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                systolic(mmHg)
                        </InputGroupText> 
                            <Input 
                                type="number"
                                name="systolic"
                                id="systolic"
                                min="90"
                                max="240"
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.systolic}
                                onKeyUp={handleInputValueCheckSystolic}
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}} 
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                            diastolic(mmHg)
                            </InputGroupText>
                                <Input 
                                type="number"
                                name="diastolic"
                                id="diastolic"
                                min={0}
                                max={140}
                                onChange={handleInputChangeVitalSignDto}
                                value={vital.diastolic}
                                onKeyUp={handleInputValueCheckDiastolic} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                />
                            
                            
                        </InputGroup>
                        {vitalClinicalSupport.systolic !=="" ? (
                        <span className={classes.error}>{vitalClinicalSupport.systolic}</span>
                        ) : ""}
                        {errors.systolic !=="" ? (
                            <span className={classes.error}>{errors.systolic}</span>
                        ) : "" }  
                        {vitalClinicalSupport.diastolic !=="" ? (
                        <span className={classes.error}>{vitalClinicalSupport.diastolic}</span>
                        ) : ""}
                        {errors.diastolic !=="" ? (
                            <span className={classes.error}>{errors.diastolic}</span>
                        ) : "" }          
                        </FormGroup>
                    </div>

                    </div>
                        {gender==="Female" || gender==="Transgebder(Female)"? (
                            <>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label >Pregnancy Status</Label>
                                <Input
                                    type="select"
                                    name="address"
                                    id="address"
                                    onChange={handleInputChange}
                                    value={objValues.address}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    required
                                    disabled={props.activeContent.actionType==='update' ? false :true}

                                >
                                    <option value=""> Select</option>
            
                                    {pregancyStatus.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.display}
                                        </option>
                                    ))}
                                </Input>
                                </FormGroup>
                            </div>
                            <div className="form-group mb-3 col-md-4">
                                <FormGroup>
                                <Label >LMP</Label>
                                <Input
                                    type="date"
                                    name="LMPDate"
                                    id="LMPDate"
                                    onChange={handleInputChange}
                                    value={values.address}
                                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                    
                                    disabled={props.activeContent.actionType==='update' ? false :true}
                                />
                                </FormGroup>
                            </div>
                            </>
                        ) :
                        ""
                        }
                        <div className="form-group mb-3 col-md-12">
                            <FormGroup>
                            <Label >Clinical Notes</Label>
                            <Input
                                type="textarea"
                                name="clinicalNote"
                                rows="3" cols="50"
                                id="clinicalNote"
                                onChange={handleInputChange}
                                value={objValues.clinicalNote}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                required
                                disabled={props.activeContent.actionType==='update' ? false :true}
                            />
                            </FormGroup>
                        </div>
                    </div>
                    
                    {saving ? <Spinner /> : ""}
                    <br />
                        {props.activeContent.actionType==='update' ? (
                            <>
                            <MatButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            style={{backgroundColor:"#014d88"}}
                            >
                                {!saving ? (
                                <span style={{ textTransform: "capitalize" }}>Update</span>
                                ) : (
                                <span style={{ textTransform: "capitalize" }}>Updating...</span>
                                )}
                            </MatButton>
{/*                         
                            <MatButton
                                variant="contained"
                                className={classes.button}
                                startIcon={<CancelIcon style={{color:'#fff'}}/>}  
                                style={{backgroundColor:'#992E62'}}                              
                            >
                                <span style={{ textTransform: "capitalize" }}>Cancel</span>
                            </MatButton> */}
                            </>
                            ):""}
                
                </form>
                </CardBody>
            </Card> 
                    
    </div>
  );
}

export default ArtCommencement;

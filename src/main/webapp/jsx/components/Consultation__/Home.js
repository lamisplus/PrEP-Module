import React, { useState, useEffect } from "react";
import { Grid, Segment, Label, List,Card } from 'semantic-ui-react'
// Page titie
import { FormGroup, Label as FormLabelName, InputGroup,
          InputGroupText,
          Input,
        } from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Select from 'react-select'

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

const ClinicVisit = (props) => {
  //let patientObj = props.patientObj ? props.patientObj : {}
  const [errors, setErrors] = useState({});
  const [disabledField, setSisabledField] = useState(false);
  const [patientDto, setPatientDto] = useState();
  let temp = { ...errors }
  const classes = useStyles()
  const [saving, setSaving] = useState(false);
  const [adherenceLevel, setAdherenceLevel] = useState([]);
  const [sti, setSti] = useState([]);
  const [prepStatus, setPrepStatus] = useState([]);
  const [prepSideEffect, setPrepSideEffect] = useState([]);
  const [htsResult, setHtsResult] = useState([]);
  const [prepRegimen, setprepRegimen] = useState([]);
  const [whyAdherenceLevelPoor, setWhyAdherenceLevelPoor] = useState([]);
  const [labTestOptions, setLabTestOptions] = useState([]);
  let testsOptions =[]
  //Vital signs clinical decision support 
  const [vitalClinicalSupport, setVitalClinicalSupport] = 
            useState({
              weight: "",
              diastolic: "",
              height: "",
              systolic: "",
              pulse:"",
              temperature:"",
              respiratoryRate:"" 
            })
  //console.log(props.patientObj)
  const [objValues, setObjValues] = useState({
    adherenceLevel: "",
    dateInitialAdherenceCounseling: "",
    datePrepGiven: "",
    datePrepStart: "",
    dateReferre: "",
    diastolic: "",
    encounterDate: "",
    extra: {},
    height: "",
    hepatitis: {},
    nextAppointment: "",
    notedSideEffects: "",
    otherTestsDone: {},
    personId: props.patientObj.personId,
    pregnant: "",
    prepEnrollmentUuid: "",
    pulse: "",
    referred: "",
    regimenId: "",
    respiratoryRate: "",
    riskReductionServices: "",
    stiScreening: "",
    syndromicStiScreening: null,
    syphilis: {},
    systolic: "",
    temperature: "",
    urinalysis: {},
    urinalysisResult: "",
    weight: "",
    why: "",
    otherDrugs:"",
    duration:"",
    prepGiven:""
  });
  const [urinalysisTest, setUrinalysisTest] = useState({
    urinalysisTest: "Yes",
    testDate: "",
    result: "",
  })

  const [syphilisTest, setSyphilisTest] = useState({
    syphilisTest: "Yes",
    testDate: "",
    result: "",
  })
  const [hepatitisTest, setHepatitisTest] = useState({
    hepatitisTest: "Yes",
    testDate: "",
    result: "",
  })
  const [otherTest, setOtherTest] = useState({
    otherTest: "Yes",
    testDate: "",
    result: "",
    name: "",
    labTestGroupId: "",
    labTestId: "",
  })

  useEffect(() => {
    AdherenceLevel();
    SYNDROMIC_STI_SCREENING();
    //PatientDetaild();
    PREP_STATUS();
    HTS_RESULT();
    PREP_SIDE_EFFECTS();
    GetPatientDTOObj();
    WHY_POOR_FAIR_ADHERENCE();
    PrepEligibilityObj();
    PrepRegimen();
    TestGroup();
    if(props.activeContent && props.activeContent.id!=="" && props.activeContent.id!==null){
      GetPatientVisit(props.activeContent.id)
      setSisabledField(props.activeContent.actionType==='view'?true : false)
    }
  }, [props.activeContent]);
  //Get list of Test Group
  const TestGroup =()=>{
      axios
          .get(`${baseUrl}laboratory/labtestgroups`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
            response.data.map((x)=> {                    
              x.labTests.map((x2)=>{
                  testsOptions.push({ value: x2.id, label: x2.labTestName,testGroupId:x.id, testGroupName:x.groupName, sampleType:x2.sampleType },)
              })
              //console.log(testsOptions)
          })
            setLabTestOptions(testsOptions);                
              
          })
          .catch((error) => {
          //console.log(error);
          });
      
  }
  const GetPatientVisit =(id)=>{
    axios
       .get(`${baseUrl}prep-clinic/${props.activeContent.id}`,
           { headers: {"Authorization" : `Bearer ${token}`} }
       )
       .then((response) => {
            //console.log(response.data.find((x)=> x.id===id));
           setObjValues(response.data);
       })
       .catch((error) => {
       //console.log(error);
       });          
}
    const GetPatientDTOObj =()=>{
      axios
        .get(`${baseUrl}prep/enrollment/open/patients/${props.patientObj.personId}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setPatientDto(response.data);
            console.log(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });          
    }
    const PrepEligibilityObj =()=>{
      axios
      .get(`${baseUrl}prep/eligibility/open/patients/${props.patientObj.personId}`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
          //setPrepStatus(response.data);
          objValues.prepEnrollmentUuid="";
      })
      .catch((error) => {
      //console.log(error);
      });    
    }
    const PrepRegimen =()=>{
      axios
      .get(`${baseUrl}prep-regimen`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
        setprepRegimen(response.data);
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
    const PREP_SIDE_EFFECTS =()=>{
      axios
      .get(`${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
        setPrepSideEffect(response.data);
      })
      .catch((error) => {
      //console.log(error);
      });    
    }

    const HTS_RESULT =()=>{
      axios
      .get(`${baseUrl}application-codesets/v2/HTS_RESULT`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
        setHtsResult(response.data);
      })
      .catch((error) => {
      //console.log(error);
      });    
    }
    const WHY_POOR_FAIR_ADHERENCE =()=>{
      axios
      .get(`${baseUrl}application-codesets/v2/WHY_POOR_FAIR_ADHERENCE`,
          { headers: {"Authorization" : `Bearer ${token}`} }
      )
      .then((response) => {
        setWhyAdherenceLevelPoor(response.data);
      })
      .catch((error) => {
      //console.log(error);
      });    
    }
    ///GET LIST OF FUNCTIONAL%20_STATUS
    // TB STATUS
    const SYNDROMIC_STI_SCREENING = () => {
      axios
        .get(`${baseUrl}application-codesets/v2/SYNDROMIC_STI_SCREENING`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          //console.log(response.data);
          setSti(response.data);
        })
        .catch((error) => {
          //console.log(error);
        });

    }
    ///Level of Adherence
    async function AdherenceLevel() {
      axios
        .get(`${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`,
          { headers: { "Authorization": `Bearer ${token}` } }
        )
        .then((response) => {
          setAdherenceLevel(response.data);

        })
        .catch((error) => {
        });
    }
    const handleInputChange = e => {
      setErrors({...errors, [e.target.name]: ""}) 
      setObjValues({ ...objValues, [e.target.name]: e.target.value });
      
    }
    const handleInputChangeUrinalysisTest= e => {
      setErrors({...errors, [e.target.name]: ""}) 
      setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value }); 
    }
    const handleInputChangeOtherTest = e => {
      setOtherTest({ ...otherTest, [e.target.name]: e.target.value }); 
    }
    const handleInputChangeHepatitisTest = e => {
      setErrors({...errors, [e.target.name]: ""}) 
      setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
    }
    const handleInputChangeSyphilisTest = e => {
      setErrors({...errors, [e.target.name]: ""}) 
      setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    }
  //Handle CheckBox 
  const handleCheckBoxSyphilisTest = e => {
    setErrors({...errors, [e.target.name]: ""}) 
    if (e.target.checked) {
      setSyphilisTest({ ...syphilisTest, ["syphilisTest"]: "Yes" })
    } else {
      setSyphilisTest({ ...syphilisTest, ["syphilisTest"]: "No" })
    }
  }
  const handleCheckBoxHepatitisTest = e => {
    setErrors({...errors, [e.target.name]: ""}) 
    if (e.target.checked) {
      setHepatitisTest({ ...hepatitisTest, ["hepatitisTest"]: "Yes" })
    } else {
      setHepatitisTest({ ...syphilisTest, ["syphilisTest"]: "No" })
    }
  }
  const handleCheckBoxOtherTest = e => {
    setErrors({...errors, [e.target.name]: ""}) 
    if (e.target.checked) {
      setOtherTest({ ...otherTest, ["otherTest"]:"Yes" })
    } else {
      setOtherTest({ ...otherTest, ["otherTest"]: "No" })
    }
  }
  const handleCheckBoxUrinalysisTest = e => {
    setErrors({...errors, [e.target.name]: ""}) 
    if (e.target.checked) {
      setUrinalysisTest({ ...urinalysisTest, ["urinalysisTest"]: "Yes" })
    } else {
      setUrinalysisTest({ ...otherTest, ["urinalysisTest"]: "No" })
    }
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
  const handleInputValueCheckweight =(e)=>{
    if(e.target.name==="weight" && (e.target.value < 3 || e.target.value>150)){      
      const message ="Body weight must not be greater than 150 and less than 3"
      setVitalClinicalSupport({...vitalClinicalSupport, weight:message})
    }else{
      setVitalClinicalSupport({...vitalClinicalSupport, weight:""})
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

  //Validations of the forms
  const validate = () => {        
    temp.encounterDate = objValues.encounterDate ? "" : "This field is required"

    temp.nextAppointment = objValues.nextAppointment ? "" : "This field is required"
    temp.adherenceLevel = objValues.adherenceLevel ? "" : "This field is required"

    //temp.systolic = objValues.systolic ? "" : "This field is required"
    temp.height = objValues.height ? "" : "This field is required"
    temp.weight = objValues.weight ? "" : "This field is required"
    temp.urinalysisTest = urinalysisTest.urinalysisTest ? "" : "This field is required"
    temp.testDate = urinalysisTest.testDate ? "" : "This field is required"
    temp.result = urinalysisTest.result ? "" : "This field is required"
    temp.regimenId = objValues.regimenId ? "" : "This field is required"
    temp.duration = objValues.duration ? "" : "This field is required"
    //temp.datePrepGiven = objValues.datePrepGiven ? "" : "This field is required"

    setErrors({
        ...temp
    })
    return Object.values(temp).every(x => x == "")
  }
  /**** Submit Button Processing  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if(validate()){
    setSaving(true)
    //objValues.visitDate = vital.encounterDate
    objValues.syphilis = syphilisTest
    objValues.hepatitis = hepatitisTest
    objValues.urinalysis = urinalysisTest
    objValues.otherTestsDone = otherTest
    objValues.prepEnrollmentUuid= patientDto.uuid
    if(props.activeContent && props.activeContent.actionType==='update'){//Perform operation for updation action
      axios.put(`${baseUrl}prep-clinic/${props.activeContent.id}`, objValues,
        { headers: { "Authorization": `Bearer ${token}` } },

      )
        .then(response => {
          //PatientDetaild();
          setSaving(false);
          toast.success("Clinic Visit save successful", {position: toast.POSITION.BOTTOM_CENTER});
          props.setActiveContent({...props.activeContent, route:'consultation', activeTab:"history", actionType:"vview" })
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

    }else{
      axios.post(`${baseUrl}prep/clinic-visit`, objValues,
      { headers: { "Authorization": `Bearer ${token}` } },

    )
      .then(response => {
        //PatientDetaild();
        setSaving(false);
         setObjValues({
          adherenceLevel: "",
          dateInitialAdherenceCounseling: "",
          datePrepGiven: "",
          datePrepStart: "",
          dateReferre: "",
          diastolic: "",
          encounterDate: "",
          extra: {},
          height: "",
          hepatitis: {},
          nextAppointment: "",
          notedSideEffects: "",
          otherTestsDone: {},
          personId: props.patientObj.personId,
          pregnant: "",
          prepEnrollmentUuid: "",
          pulse: "",
          referred: "",
          regimenId: "",
          respiratoryRate: "",
          riskReductionServices: "",
          stiScreening: "",
          syndromicStiScreening: null,
          syphilis: {},
          systolic: "",
          temperature: "",
          urinalysis: {},
          urinalysisResult: "",
          weight: "",
          why: "",
          otherDrugs:"",
          duration:"",
          prepGiven:""
        });
        toast.success("Clinic Visit save successful", {position: toast.POSITION.BOTTOM_CENTER});
        props.setActiveContent({...props.activeContent, route:'consultation', activeTab:"history", actionType:"vview" })
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
  }

  return (
    <div>
    <div className="row">

      <div className="col-md-6">
        <h2>Clinic Follow-up Visit</h2>
        </div>      
      </div>
      <Grid >

        <Grid.Column >
          <Segment>
            <Label as='a' color='blue'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}>VITAL  SIGNS</h4>
            </Label>
            <br /><br />
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Date of Visit <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="date"
                    name="encounterDate"
                    id="encounterDate"
                    value={objValues.encounterDate}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    onChange={handleInputChange}
                    //min={props.patientDetail && props.patientDetail.dateHivPositive!==null ? props.patientDetail.dateHivPositive : props.patientDetail.personResponseDto.dateOfRegistration}
                    min={patientDto && patientDto.dateEnrolled ?patientDto.dateEnrolled :""}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                 {errors.encounterDate !=="" ? (
                      <span className={classes.error}>{errors.encounterDate}</span>
                  ) : "" }

                </FormGroup>
              </div>
              <div className="row">
                    <div className=" mb-3 col-md-4">
                        <FormGroup>
                        <FormLabelName >Pulse</FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="pulse"
                                id="pulse"
                                onChange={handleInputChange}
                                min="40"
                                max="120"
                                value={objValues.pulse}
                                onKeyUp={handleInputValueCheckPulse} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                disabled={disabledField}
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
                        <FormLabelName >Respiratory Rate </FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="respiratoryRate"
                                id="respiratoryRate"
                                onChange={handleInputChange}
                                min="10"
                                max="70"
                                value={objValues.respiratoryRate}
                                onKeyUp={handleInputValueCheckRespiratoryRate} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                disabled={disabledField}
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
                        <FormLabelName >Temperature </FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="temperature"
                                id="temperature"
                                onChange={handleInputChange}
                                min="35"
                                max="47"
                                value={objValues.temperature}
                                onKeyUp={handleInputValueCheckTemperature} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                disabled={disabledField}
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
                   
                    <div className=" mb-3 col-md-5">
                        <FormGroup>
                        <FormLabelName >Body Weight <span style={{ color:"red"}}> *</span></FormLabelName>
                        <InputGroup> 
                            <Input 
                                type="number"
                                name="weight"
                                id="weight"
                                onChange={handleInputChange}
                                min="3"
                                max="150"
                                value={objValues.weight}
                                onKeyUp={handleInputValueCheckweight} 
                                style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                                disabled={disabledField}
                            />
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                kg
                            </InputGroupText>
                        </InputGroup>
                        {vitalClinicalSupport.weight !=="" ? (
                                <span className={classes.error}>{vitalClinicalSupport.weight}</span>
                        ) : ""}
                        {errors.weight !=="" ? (
                            <span className={classes.error}>{errors.weight}</span>
                        ) : "" }
                        </FormGroup>
                    </div>                                   
                    <div className="form-group mb-3 col-md-5">
                        <FormGroup>
                        <FormLabelName >Height <span style={{ color:"red"}}> *</span></FormLabelName>
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
                                disabled={disabledField}
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
                    <div className="form-group mb-3 mt-2 col-md-2">
                        {objValues.weight!=="" && objValues.height!=='' && (
                            <FormGroup>
                            <Label > {" "}</Label>
                            <InputGroup> 
                            <InputGroupText addonType="append" style={{ backgroundColor:"#014D88", color:"#fff", border: "1px solid #014D88", borderRadius:"0rem"}}>
                                BMI : {(objValues.weight/((objValues.height/100) * (objValues.height/100))).toFixed(2)}
                            </InputGroupText>                   
                           
                            </InputGroup>                
                            </FormGroup>
                        )}
                    </div>
              </div>
              <div className="row">
              <div className="form-group mb-3 col-md-8">
                  <FormGroup>
                  <FormLabelName >Blood Pressure</FormLabelName>
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
                          onChange={handleInputChange}
                          value={objValues.systolic}
                          onKeyUp={handleInputValueCheckSystolic}
                          style={{border: "1px solid #014D88", borderRadius:"0rem"}} 
                          disabled={disabledField}
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
                          onChange={handleInputChange}
                          value={objValues.diastolic}
                          onKeyUp={handleInputValueCheckDiastolic} 
                          style={{border: "1px solid #014D88", borderRadius:"0rem"}}
                          disabled={disabledField}
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
            </div>
            <Label as='a' color='black'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}></h4>
            </Label>
            <br /><br />

            <div className="row">             
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >HIV Test Result </FormLabelName>
                  <Input
                    type="select"
                    name="hivTestResult"
                    id="hivTestResult"
                    value={objValues.hivTestResult}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {htsResult.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                 
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Noted Side Effects </FormLabelName>
                  <Input
                    type="select"
                    name="notedSideEffects"
                    id="notedSideEffects"
                    value={objValues.notedSideEffects}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {prepSideEffect.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                 
                </FormGroup>
              </div>
              {/* <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Regimen at Start of PrEP </FormLabelName>
                  <Input
                    type="select"
                    name="regimenStartPrep"
                    id="regimenStartPrep"
                    value={objValues.regimenStartPrep}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="TDF/FTC">TDF/FTC </option>
                    <option value="TDF/3TC">TDF/3TC </option>
                  </Input>
                 
                </FormGroup>
              </div>
               */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >STI Screening</FormLabelName>
                  <Input
                    type="select"
                    name="stiScreening"
                    id="stiScreening"
                    value={objValues.stiScreening}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="true">Yes </option>
                    <option value="false">No </option>
                  </Input>
                 
                </FormGroup>
              </div>
              {objValues.stiScreening==='true' && (
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Syndromic STI Screening  </FormLabelName>
                  <Input
                    type="select"
                    name="syndromicStiScreening"
                    id="syndromicStiScreening"
                    value={objValues.syndromicStiScreening}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {sti.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                 
                </FormGroup>
              </div> 
              )}
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Level of Adherence <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="select"
                    name="adherenceLevel"
                    id="adherenceLevel"
                    value={objValues.adherenceLevel}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>

                    {adherenceLevel.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.adherenceLevel !=="" ? (
                      <span className={classes.error}>{errors.adherenceLevel}</span>
                  ) : "" } 
                </FormGroup>
              </div>
              {objValues.adherenceLevel==='PREP_LEVEL_OF_ADHERENCE_(POOR)_≥_7_DOSES' && (
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Why Poor/Fair Adherence </FormLabelName>
                  <Input
                    type="select"
                    name="whyAdherenceLevelPoor"
                    id="whyAdherenceLevelPoor"
                    value={objValues.whyAdherenceLevelPoor}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>

                    {whyAdherenceLevelPoor.map((value) => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                 
                </FormGroup>
              </div> 
              )}              
              {/* <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >PrEP Given</FormLabelName>
                  <Input
                    type="select"
                    name="prepGiven"
                    id="prepGiven"
                    value={objValues.prepGiven}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                  >
                    <option value="">Select </option>
                    <option value="Yes">Yes </option>
                    <option value="No">No </option>
                  </Input>
                 
                </FormGroup>
              </div> */} 
              <div className="form-group mb-3 col-md-6">
              <FormGroup>
              <FormLabelName for="">PrEP Regimen <span style={{ color:"red"}}> *</span></FormLabelName>
              <Input
                  type="select"
                  name="regimenId"
                  id="regimenId"
                  onChange={handleInputChange}
                  value={objValues.regimenId}
                  disabled={disabledField}
              >
              <option value=""> Select</option>
              {prepRegimen.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.regimen}
                      </option>
                    ))}
              </Input>
              {errors.regimenId !=="" ? (
                      <span className={classes.error}>{errors.regimenId}</span>
                  ) : "" } 
              </FormGroup>
              
              </div> 
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Duration <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="number"
                    name="duration"
                    id="duration"
                    value={objValues.duration}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                   
                    disabled={disabledField}
                  />
                  {errors.duration !=="" ? (
                      <span className={classes.error}>{errors.duration}</span>
                  ) : "" }   
                </FormGroup>
              </div>     
              {/* <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Date PrEP Given <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="date"
                    name="datePrepGiven"
                    id="datePrepGiven"
                    value={objValues.datePrepGiven}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    min={patientDto && patientDto.dateEnrolled ?patientDto.dateEnrolled :""}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.datePrepGiven !=="" ? (
                      <span className={classes.error}>{errors.datePrepGiven}</span>
                  ) : "" }   
                </FormGroup>
              </div>  */}
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Other Drugs</FormLabelName>
                  <Input
                    type="text"
                    name="otherDrugs"
                    id="otherDrugs"
                    value={objValues.otherDrugs}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                 />
                    
                </FormGroup>
              </div>
              {/* <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >PrEP Status</FormLabelName>
                  <Input
                    type="select"
                    name="prepStatus"
                    id="prepStatus"
                    value={objValues.prepStatus}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
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
              </div> */}
               
              <br /><br />
              <Label as='a' color='teal'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}><input type="checkbox" name="urinalysisTest" value="Yes" onChange={handleCheckBoxUrinalysisTest} checked={urinalysisTest.urinalysisTest=='Yes' ? true : false}/> Urinalysis Test</h4>
              </Label>
              <br /><br />
              {urinalysisTest.urinalysisTest==='Yes' && (<> 
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Urinalysis Test Date <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="date"
                    name="testDate"
                    id="testDate"
                    value={urinalysisTest.testDate}
                    onChange={handleInputChangeUrinalysisTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    min={objValues.encounterDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                   {errors.testDate !=="" ? (
                      <span className={classes.error}>{errors.testDate}</span>
                  ) : "" } 
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Urinalysis Test Result <span style={{ color:"red"}}> *</span></FormLabelName>
                  <Input
                    type="select"
                    name="result"
                    id="result"
                    value={urinalysisTest.result}
                    onChange={handleInputChangeUrinalysisTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                 >
                  <option value="">Select </option>
                    <option value="Positive">Positive </option>
                    <option value="Negative">Negative </option>
                  </Input>
                  {errors.result !=="" ? (
                      <span className={classes.error}>{errors.result}</span>
                  ) : "" }
                </FormGroup>
              </div>
              </>)}
              <br /><br />
              <Label as='a' color='blue'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}><input type="checkbox" name="hepatitisTest" value="Yes" onChange={handleCheckBoxHepatitisTest} checked={hepatitisTest.hepatitisTest==='Yes' ? true : false}/> Hepatitis  Test </h4>
              </Label>
              <br /><br />
              {hepatitisTest.hepatitisTest==='Yes' && (<>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Hepatitis  Test  Date</FormLabelName>
                  <Input
                    type="date"
                    name="testDate"
                    id="testDate"
                    value={hepatitisTest.testDate}
                    onChange={handleInputChangeHepatitisTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    min={objValues.encounterDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Hepatitis  Test  Result</FormLabelName>
                  <Input
                    type="select"
                    name="result"
                    id="result"
                    value={hepatitisTest.result}
                    
                    onChange={handleInputChangeHepatitisTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="Positive">Positive </option>
                    <option value="Negative">Negative </option>
                  </Input>
                 
                </FormGroup>
              </div>
              </>)}
              <br /><br />
              <Label as='a' color='red'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}><input type="checkbox" name="syphilisTest" value="Yes" onChange={handleCheckBoxSyphilisTest} checked={syphilisTest.syphilisTest==='Yes' ? true : false}/> Syphilis Test </h4>
              </Label>
              <br /><br />
              {syphilisTest.syphilisTest==='Yes' && (<>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Syphilis Test  Date</FormLabelName>
                  <Input
                    type="date"
                    name="testDate"
                    id="testDate"
                    value={syphilisTest.testDate}
                    onChange={handleInputChangeSyphilisTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                    min={objValues.encounterDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                  />
                    
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-6">
                <FormGroup>
                  <FormLabelName >Syphilis Test  Result</FormLabelName>
                  <Input
                    type="select"
                    name="result"
                    id="result"
                    value={syphilisTest.result}
                    onChange={handleInputChangeSyphilisTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    <option value="Positive">Positive </option>
                    <option value="Negative">Negative </option>
                  </Input>
                 
                </FormGroup>
              </div>
              </>)}
              <br /><br />
              <Label as='a' color='black'  style={{width:'106%', height:'35px'}} ribbon>
              <h4 style={{color:'#fff'}}><input type="checkbox" name="otherTest" value="Yes" onChange={handleCheckBoxOtherTest} checked={otherTest.otherTest==='Yes' ? true : false}/> Other Test </h4>
              </Label>
              <br /><br />
              {otherTest.otherTest==='Yes' && (<> 
                <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName > Test  Name</FormLabelName>
                  <Input
                    type="select"
                    name="name"
                    id="name"
                    value={otherTest.name}
                    onChange={handleInputChangeOtherTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  >
                    <option value="">Select </option>
                    {labTestOptions.map((value) => (
                        <option key={value.id} value={value.label}>
                            {value.label}
                        </option>
                    ))}
                  </Input>
                   
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName > Test  Date</FormLabelName>
                  <Input
                    type="date"
                    name="testDate"
                    id="testDate"
                    value={otherTest.testDate}
                    onChange={handleInputChangeOtherTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                    min={objValues.encounterDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                  />
                   
                </FormGroup>
              </div>
              <div className=" mb-3 col-md-4">
                <FormGroup>
                  <FormLabelName > Test  Result</FormLabelName>
                  <Input
                    type="text"
                    name="result"
                    id="result"
                    value={otherTest.prepGiven}
                    onChange={handleInputChangeOtherTest}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={disabledField}
                  ></Input>
                 
                </FormGroup>
              </div>
              </>)}
            
            <br />
            <Label as='a' color='blue' style={{width:'106%', height:'35px'}} ribbon>
            <h4 style={{color:'#fff'}}>NEXT APPOINTMENT DATE </h4>
            </Label>
            <br /><br /><br />
            <div className=" mb-3 col-md-12">
                <Input
                  type="date"
                  name="nextAppointment"
                  id="nextAppointment"
                  className="col-md-6"
                  value={objValues.nextAppointment}
                  onChange={handleInputChange}
                  style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                  min={objValues.encounterDate}
                  disabled={disabledField}
                />
                {errors.nextAppointment !=="" ? (
                        <span className={classes.error}>{errors.nextAppointment}</span>
                    ) : "" }
              </div>
           </div>
            <br />
            {props.activeContent && props.activeContent.actionType==="update"? (<>
                        <MatButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        hidden={disabledField}
                        className={classes.button}
                        startIcon={<SaveIcon />}
                        style={{backgroundColor:"#014d88"}}
                        onClick={handleSubmit}
                        disabled={saving}
                        >
                            {!saving ? (
                            <span style={{ textTransform: "capitalize" }}>Update</span>
                            ) : (
                            <span style={{ textTransform: "capitalize" }}>Updating...</span>
                            )}
                    </MatButton>
                    </>):(<>
                        <MatButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            style={{backgroundColor:"#014d88"}}
                            onClick={handleSubmit}
                            disabled={saving}
                            >
                                {!saving ? (
                                <span style={{ textTransform: "capitalize" }}>Save</span>
                                ) : (
                                <span style={{ textTransform: "capitalize" }}>Saving...</span>
                                )}
                    </MatButton>
                    </>)}
          </Segment>
        </Grid.Column>
      </Grid>
      {/* <AddVitals toggle={AddVitalToggle} showModal={addVitalModal} /> */}
      
    </div>
  );
};

export default ClinicVisit;

import React, {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {FormGroup, Label , CardBody, Spinner,Input,Form} from "reactstrap";
import {makeStyles} from "@material-ui/core/styles";
import {Card, Checkbox, FormControl, FormControlLabel, FormLabel, } from "@material-ui/core";
import MatButton from '@material-ui/core/Button'
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
// import {Link, useHistory, useLocation} from "react-router-dom";
// import {TiArrowBack} from 'react-icons/ti'
import {token, url as baseUrl } from "../../../api";
import 'react-phone-input-2/lib/style.css'
import {Label as LabelRibbon, Button, Message, Select, Dropdown} from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import * as moment from 'moment';
import SaveIcon from '@material-ui/icons/Save'


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
        '& > *': {
            margin: theme.spacing(1)
        },
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
    }
}));


const BasicInfo = (props) => {
    const classes = useStyles();
    const [disabledField, setSisabledField] = useState(false);
    const patientID= props.patientDetail && props.patientDetail.personResponseDto ? props.patientDetail.personResponseDto.id : "";
    //const clientId = props.patientObj && props.patientObj ? props.patientObj.id : "";
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [counselingType, setCounselingType] = useState([]);
    const [visitType, setVisitType] = useState([]);
    const [reasonForDecline, setReasonForDecline] = useState([]);
    const [populationType, setPopulationType] = useState([]);
    const [pregnancyStatus, setPregnancyStatus] = useState([]);
    let temp = { ...errors }

    const [objValues, setObjValues]= useState(
            {
                counselingType: "",
                drugUseHistory: {},
                extra: {},
                firstTimeVisit: true,
                hivRisk: {},
                numChildrenLessThanFive: "",
                numWives: "",
                personId: "",
                personalHivRiskAssessment: {},
                sexPartner: "TARGET_GROUP_GEN_POP",
                sexPartnerRisk: {},
                stiScreening: {},
                targetGroup: "TARGET_GROUP_GEN_POP",
                uniqueId: "",
                visitDate:"",
                visitType:"",
                populationType: "",
                pregnancyStatus: "",
                score: 0
            }
    )
    useEffect( async () => { 
        
        CounselingType();
        VisitType();
        await ReasonForDecline();
        PopulationType();
        PregnancyStatus();
        if(props.activeContent.id && props.activeContent.id!=="" && props.activeContent.id!==null){
            GetPatientPrepEligibility(props.activeContent.id)
            setSisabledField(props.activeContent.actionType==='view'?true : false)
        }
    }, [props.patientObj]);
    const GetPatientPrepEligibility =(id)=>{
        axios
           .get(`${baseUrl}prep/eligibility/${id}`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
                // console.log(response.data);
               setObjValues(response.data);
               setRiskAssessment(response.data.personalHivRiskAssessment)
               setRiskAssessmentPartner(response.data.sexPartnerRisk)
               setStiScreening(response.data.stiScreening)
               setDrugHistory(response.data.drugUseHistory)
               setAssessmentForPepIndication(response.data.assessmentForPepIndication)
               setAssessmentForAcuteHivInfection(response.data.assessmentForAcuteHivInfection)
               setServicesReceivedByClient(response.data.servicesReceivedByClient)
               setAssessmentForPrepEligibility(response.data.assessmentForPrepEligibility)
           })
           .catch((error) => {
           //console.log(error);
           });          
    } 
    const CounselingType =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/COUNSELING_TYPE`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setCounselingType(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const VisitType =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PrEP_VISIT_TYPE`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setVisitType(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const ReasonForDecline = async ()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/REASON_PREP_DECLINED`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setReasonForDecline(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const PopulationType =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/POPULATION_TYPE`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setPopulationType(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }
    const PregnancyStatus =()=>{
        axios
        .get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`,
            { headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((response) => {
            setPregnancyStatus(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });    
    }

    const handleInputChange = e => { 
        setErrors({...temp, [e.target.name]:""}) 
        setObjValues ({...objValues,  [e.target.name]: e.target.value});         
    }
    const [riskAssessment, setRiskAssessment]= useState(
        {
            unprotectedVaginalSexCasual:"",
            unprotectedVaginalSexRegular:"",
            uprotectedAnalSexWithCasual:"",
            uprotectedAnalSexWithRegular:"", 
            stiHistory:"",  
            sharedNeedles:"",   
            moreThan1SexPartner:"",
            analSexWithPartner :"",
            unprotectedAnalSexWithPartner:"",
            haveYouPaidForSex:"",
            haveSexWithoutCondom:"",
            experienceCondomBreakage:"",
            takenPartInSexualOrgy:"",
                          
        }
    )
    const handleInputChangeRiskAssessment = e => { 
        //setErrors({...temp, [e.target.name]:""}) 
        setRiskAssessment ({...riskAssessment,  [e.target.name]: e.target.value});                           
    }
    // Getting the number count of riskAssessment True
    const actualRiskCountTrue=Object.values(riskAssessment)
    const riskCount=actualRiskCountTrue.filter((x)=> x==='true')
    const [riskAssessmentPartner, setRiskAssessmentPartner]= useState(
        {
            haveSexWithHIVPositive:"",
            haveSexWithPartnerInjectDrug:"",
            haveSexWithPartnerWhoHasSexWithMen :"",
            haveSexWithPartnerTransgender :"",
            sexWithPartnersWithoutCondoms:"",             
        }
    )
    const handleInputChangeRiskAssessmentPartner = e => { 
        setErrors({...temp, [e.target.name]:""}) 
        setRiskAssessmentPartner ({...riskAssessmentPartner,  [e.target.name]: e.target.value});
                    
    }
    // Getting the number count of sexPartRiskCount True
    const actualSexPartRiskCountTrue=Object.values(riskAssessmentPartner)
    const sexPartRiskCount=actualSexPartRiskCountTrue.filter((x)=> x==='true')
    const [stiScreening, setStiScreening]= useState(
        {
            vaginalDischarge:"",
            lowerAbdominalPains :"",
            urethralDischarge :"",
            complaintsOfScrotal:"", 
            complaintsGenitalSore  :"",
            analDischarge:"",
            analItching:"",
            analpain:"",
            swollenIguinal:"", 
            genitalScore:"",
                
        }
    )
    const handleInputChangeStiScreening = e => { 
        setErrors({...errors, [e.target.name]: ""}) 
        setStiScreening ({...stiScreening,  [e.target.name]: e.target.value});   
                
    }
    // Getting the number count of STI True
    const actualStiTrue=Object.values(stiScreening)
    const stiCount=actualStiTrue.filter((x)=> x==='true')
    const [drugHistory, setDrugHistory]= useState(
        {
            useAnyOfTheseDrugs:"",
            inject:"",
            sniff:"", 
            smoke:"", 
            Snort:"", 
            useDrugSexualPerformance:"",
            hivTestedBefore:"",
            recommendHivRetest:"",
            clinicalSetting:"", 
            reportHivRisk:"",
            hivExposure:"",
            hivTestResultAtvisit:"", //
            lastTest:""
        }
    )
    const handleInputChangeDrugHistory = e => { 
        setErrors({...temp, [e.target.name]:""})
        if(drugHistory.hivTestedBefore==="true"){
            drugHistory.lastTest=""
            setDrugHistory ({...drugHistory,  ['lastTest']: ''}); 
        } 
        setDrugHistory ({...drugHistory,  [e.target.name]: e.target.value});         
    }
    const [assessmentForPepIndication, setAssessmentForPepIndication]= useState(
        {
            unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours:"",
            sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours:"",
        }
    )
    const handleInputChangeAssessmentForPepIndication = e => { 
        setErrors({...temp, [e.target.name]:""})
        setAssessmentForPepIndication ({...assessmentForPepIndication,  [e.target.name]: e.target.value});         
    }
    const [assessmentForAcuteHivInfection, setAssessmentForAcuteHivInfection]= useState(
        {
            acuteHivSymptomsLasttwoWeeks:"",
            unprotectedAnalOrVaginalOrSharedNeedlesLast28Days:"",
        }
    )
    const handleInputChangeAssessmentForAcuteHivInfection = e => { 
        setErrors({...temp, [e.target.name]:""})
        setAssessmentForAcuteHivInfection ({...assessmentForAcuteHivInfection,  [e.target.name]: e.target.value});         
    }
    const [assessmentForPrepEligibility, setAssessmentForPrepEligibility]= useState(
        {
            hivNegative:"",
            hivRiskScore:"",
            noIndicationForPep: "",
            hasNoProteinuria: "",
            noHistoryOrSignsOfLiverAbnormalitiesCabLa: "",
            noHistoryOfDrugToDrugInteractionCabLa: "",
            noHistoryOfDrugHypersensitivityCabLa: "",

        }
    )
    const handleInputChangeAssessmentForPrepEligibility = e => { 
        setErrors({...temp, [e.target.name]:""})
        setAssessmentForPrepEligibility ({...assessmentForPrepEligibility,  [e.target.name]: e.target.value});         
    }
    const [servicesReceivedByClient, setServicesReceivedByClient]= useState(
        {
            willingToCommencePrep:"",
            reasonsForDecline:[],
            otherReasonsForDecline: "",

        }
    )
    const handleInputChangeServicesReceivedByClient = (e, data) => { 
        setErrors({...temp, [e.target.name]:""})
        
        setServicesReceivedByClient ({...servicesReceivedByClient,  [e.target.name]: e.target.value});         
    }

    const handleInputReasonsForDecline = (e, data) => {
        setServicesReceivedByClient({...servicesReceivedByClient, reasonsForDecline: data.value})
    }

    const [assessmentScore, setAssessmentScore] = useState(0);
   

    /*****  Validation  */
     const validate = () => {
        //PREP FORM VALIDATION
           temp.visitDate = objValues.visitDate? "" : "This field is required."
           temp.sexPartner = objValues.sexPartner ? "" : "This field is required."
           temp.hivTestResultAtvisit = drugHistory.hivTestResultAtvisit ? "" : "This field is required."
           
            setErrors({ ...temp })
        return Object.values(temp).every(x => x === "")
    }
    const handleSubmit =(e)=>{
        e.preventDefault();
            
            if(validate()){
                setSaving(true);
            //objValues.htsClientId= clientId
            objValues.drugUseHistory= drugHistory
            objValues.personalHivRiskAssessment= riskAssessment
            objValues.sexPartnerRisk= riskAssessmentPartner
            objValues.stiScreening= stiScreening
            objValues.personId= patientID
            objValues.uniqueId= patientID
            objValues.assessmentForAcuteHivInfection = assessmentForAcuteHivInfection
            objValues.assessmentForPepIndication = assessmentForPepIndication
            objValues.assessmentForPrepEligibility = assessmentForPrepEligibility
            objValues.servicesReceivedByClient = servicesReceivedByClient
            objValues.score = getPrepEligibilityScore();
                if(props.activeContent && props.activeContent.actionType==="update"){//Perform operation for updation action
                    axios.put(`${baseUrl}prep-eligibility/${props.activeContent.id}`,objValues,
                    { headers: {"Authorization" : `Bearer ${token}`}},)
                    .then(response => {
                        setSaving(false);
                        props.patientObj.eligibilityCount= 1
                        props.patientObj.hivresultAtVisit = drugHistory.hivTestResultAtvisit
                        props.PatientObject();
                        toast.success("Prep Eligilibility save successful!", {position: toast.POSITION.BOTTOM_CENTER});
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
                }else{
                    axios.post(`${baseUrl}prep/eligibility`,objValues,
                    { headers: {"Authorization" : `Bearer ${token}`}},)
                    .then(response => {
                        setSaving(false);
                        props.patientObj.eligibilityCount= 1
                        //props.setPatientObj(response.data)
                        props.patientObj.hivresultAtVisit = drugHistory.hivTestResultAtvisit
                        toast.success("Prep Eligilibility save successful!", {position: toast.POSITION.BOTTOM_CENTER});
                        props.setActiveContent({...props.activeContent, route:'recent-history'})
        
                    })
                    .catch(error => {
                        setSaving(false);
                        if(error.response && error.response.data){
                            let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                            if(error.response.data.apierror){
                              toast.error(error.response.data.apierror.message , {position: toast.POSITION.BOTTOM_CENTER});
                            } else {
                              toast.error(errorMessage, {position: toast.POSITION.BOTTOM_CENTER});
                            }
                        } else {
                            toast.error("Something went wrong, please try again...", {position: toast.POSITION.BOTTOM_CENTER});
                        }
                    });
                }
           
            }else{
                setSaving(false);
                toast.error("All field are required ", {position: toast.POSITION.BOTTOM_CENTER});
            }   
    }

    const isFemale = () => {
        return props.patientObj.gender.toLowerCase() === "female";
    }
    
    const is30AndAbove = () => {
        return Number(props.patientObj.age) >= 30;
    }

    const getIndicationForPepResult = () => {
        if (assessmentForPepIndication !== null && assessmentForPepIndication !== undefined){
            return Object.values(assessmentForPepIndication).filter((each) => (each === "true")).length > 0 ? 0 : 1
        }
    }

    const getAcuteHivResult = () => {
        if (assessmentForAcuteHivInfection !== null && assessmentForAcuteHivInfection !== undefined){
            return Object.values(assessmentForAcuteHivInfection).filter((each) => (each === "true")).length > 0 ? 0 : 1
        }
    }

    const getPrepEligibilityScore = () => {
        var score = 0;
        score += drugHistory.hivTestResultAtvisit === "Negative" ? 1 : 0
        score += riskCount.length > 0 ? 1 : 0
        score += getAcuteHivResult()
        score += getIndicationForPepResult()
        if (is30AndAbove() && isFemale() === false) {
            score += assessmentForPrepEligibility?.hasNoProteinuria === "true" ? 1 : 0;
        }
        score += assessmentForPrepEligibility?.noHistoryOrSignsOfLiverAbnormalitiesCabLa === "true" ? 1 : 0;
        score += assessmentForPrepEligibility?.noHistoryOfDrugToDrugInteractionCabLa === "true" ? 1 : 0;
        score += assessmentForPrepEligibility?.noHistoryOfDrugHypersensitivityCabLa === "true" ? 1 : 0;

        if (is30AndAbove() && isFemale() === false) {
            return score >= 8 ? 1 : 0;
        } else {
            return score >= 7 ? 1 : 0;
        }
    }

    return (
        <>
            <Card className={classes.root}>
                <CardBody>
                <h2>PrEP Eligibilty Screening Form</h2>
                    <form >
                        <div className="row">
                        <div className="row">
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Visit Date <span style={{ color:"red"}}> *</span></Label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="visitDate"
                                    id="visitDate"
                                    value={objValues.visitDate}
                                    onChange={handleInputChange}
                                    min={props.patientDetail && props.patientDetail.dateHivPositive!==null ? props.patientDetail.dateHivPositive : props.patientObj.dateOfRegistration}
                                    max= {moment(new Date()).format("YYYY-MM-DD") }
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                />
                                   
                                {errors.visitDate !=="" ? (
                                <span className={classes.error}>{errors.visitDate}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Visit type <span style={{ color:"red"}}> *</span></Label>
                                <select
                                    className="form-control"
                                    name="visitType"
                                    id="visitType"
                                    value={objValues.visitType}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                >
                                     <option value={""}>Select</option>
                                        {visitType.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}
                                </select>
                                {errors.visitType !=="" ? (
                                <span className={classes.error}>{errors.visitType}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Population type <span style={{ color:"red"}}> *</span></Label>
                                <select
                                    className="form-control"
                                    name="populationType"
                                    id="populationType"
                                    value={objValues.populationType}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                >
                                     <option value={""}>Select</option>
                                        {populationType.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}
                                </select>
                                {errors.populationType !=="" ? (
                                <span className={classes.error}>{errors.populationType}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {isFemale() && <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Pregnancy Status <span style={{ color:"red"}}> *</span></Label>
                                <select
                                    className="form-control"
                                    name="pregnancyStatus"
                                    id="pregnancyStatus"
                                    value={objValues.pregnancyStatus}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                >
                                     <option value={""}>Select</option>
                                        {pregnancyStatus.map((value) => (
                                            <option key={value.id} value={value.code}>
                                                {value.display}
                                            </option>
                                        ))}
                                </select>
                                {errors.pregnancyStatus !=="" ? (
                                <span className={classes.error}>{errors.pregnancyStatus}</span>
                                ) : "" }
                            </FormGroup>
                        </div>}
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Sex partners <span style={{ color:"red"}}> *</span></Label>
                                <select
                                    className="form-control"
                                    name="sexPartner"
                                    id="sexPartner"
                                    value={objValues.sexPartner}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                >
                                    <option value={""}></option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Both">Both</option>
                                </select>
                                {errors.sexPartner !=="" ? (
                                <span className={classes.error}>{errors.sexPartner}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        {/* {props.patientDetail!==null && props.patientDetail.personResponseDto.maritalStatus.display==='Married'   && (
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label> Number of own children {"<"}5 years</Label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="numChildrenLessThanFive"
                                    id="numChildrenLessThanFive"
                                    value={objValues.numChildrenLessThanFive}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                />
                                   
                                {errors.numChildrenLessThanFive !=="" ? (
                                <span className={classes.error}>{errors.numChildrenLessThanFive}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        )} */}
                        {props.patientObj.gender==='Male' || props.patientObj.gender==='male'  && (
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Number of wives </Label>
                                <input
                                    className="form-control"
                                    name="numWives"
                                    id="numWives"
                                    value={objValues.numWives}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                />
                                {errors.numWives !=="" ? (
                                <span className={classes.error}>{errors.numWives}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        )}
                        <div className="form-group  col-md-4">
                            <FormGroup>
                                <Label>Type of counseling <span style={{ color:"red"}}> *</span></Label>
                                <select
                                    className="form-control"
                                    name="counselingType"
                                    id="counselingType"
                                    value={objValues.counselingType}
                                    onChange={handleInputChange}
                                    style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                    disabled={disabledField}
                                >
                                     <option value={""}>Select</option>
                                        {counselingType.map((value) => (
                                            <option key={value.id} value={value.id}>
                                                {value.display}
                                            </option>
                                        ))}
                                </select>
                                {errors.counselingType !=="" ? (
                                <span className={classes.error}>{errors.counselingType}</span>
                                ) : "" }
                            </FormGroup>
                        </div>
                        </div>
                        <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#992E62', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >HIV Risk Assessment  (Last 3 months)</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Vaginal sex with casual partner</Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedVaginalSexCasual"
                                        id="unprotectedVaginalSexCasual"
                                        value={riskAssessment.unprotectedVaginalSexCasual}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.unprotectedVaginalSexCasual !=="" ? (
                                    <span className={classes.error}>{errors.unprotectedVaginalSexCasual}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Vaginal sex with regular partner </Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedVaginalSexRegular"
                                        id="unprotectedVaginalSexRegular"
                                        value={riskAssessment.unprotectedVaginalSexRegular}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.unprotectedVaginalSexRegular !=="" ? (
                                    <span className={classes.error}>{errors.unprotectedVaginalSexRegular}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Anal sex with casual partner </Label>
                                    <select
                                        className="form-control"
                                        name="uprotectedAnalSexWithCasual"
                                        id="uprotectedAnalSexWithCasual"
                                        value={riskAssessment.uprotectedAnalSexWithCasual}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.uprotectedAnalSexWithCasual !=="" ? (
                                    <span className={classes.error}>{errors.uprotectedAnalSexWithCasual}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Anal sex with regualar partner </Label>
                                    <select
                                        className="form-control"
                                        name="uprotectedAnalSexWithRegular"
                                        id="uprotectedAnalSexWithRegular"
                                        value={riskAssessment.uprotectedAnalSexWithRegular}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.uprotectedAnalSexWithRegular !=="" ? (
                                    <span className={classes.error}>{errors.uprotectedAnalSexWithRegular}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>History of STI</Label>
                                    <select
                                        className="form-control"
                                        name="stiHistory"
                                        id="stiHistory"
                                        value={riskAssessment.stiHistory}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.stiHistory !=="" ? (
                                    <span className={classes.error}>{errors.stiHistory}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Shared needles/injecting materials</Label>
                                    <select
                                        className="form-control"
                                        name="sharedNeedles"
                                        id="sharedNeedles"
                                        value={riskAssessment.sharedNeedles}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.sharedNeedles !=="" ? (
                                    <span className={classes.error}>{errors.sharedNeedles}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>           
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>More than 1 sex partner </Label>
                                    <select
                                        className="form-control"
                                        name="moreThan1SexPartner"
                                        id="moreThan1SexPartner"
                                        value={riskAssessment.moreThan1SexPartner}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.moreThan1SexPartner !=="" ? (
                                    <span className={classes.error}>{errors.moreThan1SexPartner}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Anal sex with Male/Female partner </Label>
                                    <select
                                        className="form-control"
                                        name="analSexWithPartner"
                                        id="analSexWithPartner"
                                        value={riskAssessment.analSexWithPartner}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.analSexWithPartner !=="" ? (
                                    <span className={classes.error}>{errors.analSexWithPartner}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Unprotected Anal sex with male/female partner </Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedAnalSexWithPartner"
                                        id="unprotectedAnalSexWithPartner"
                                        value={riskAssessment.unprotectedAnalSexWithPartner}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.unprotectedAnalSexWithPartner !=="" ? (
                                    <span className={classes.error}>{errors.unprotectedAnalSexWithPartner}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you paid for sex in the last 6 months?  </Label>
                                    <select
                                        className="form-control"
                                        name="haveYouPaidForSex"
                                        id="haveYouPaidForSex"
                                        value={riskAssessment.haveYouPaidForSex}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveYouPaidForSex !=="" ? (
                                    <span className={classes.error}>{errors.haveYouPaidForSex}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you been paid for sex in the last 6 months </Label>
                                    <select
                                        className="form-control"
                                        name="moreThanOneSexPartnerLastThreeMonths"
                                        id="moreThanOneSexPartnerLastThreeMonths"
                                        value={riskAssessment.moreThanOneSexPartnerLastThreeMonths}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.moreThanOneSexPartnerLastThreeMonths !=="" ? (
                                    <span className={classes.error}>{errors.moreThanOneSexPartnerLastThreeMonths}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you experience condom breakage </Label>
                                    <select
                                        className="form-control"
                                        name="experienceCondomBreakage"
                                        id="experienceCondomBreakage"
                                        value={riskAssessment.experienceCondomBreakage}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.experienceCondomBreakage !=="" ? (
                                    <span className={classes.error}>{errors.experienceCondomBreakage}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you taken part in sexual orgy </Label>
                                    <select
                                        className="form-control"
                                        name="takenPartInSexualOrgy"
                                        id="takenPartInSexualOrgy"
                                        value={riskAssessment.takenPartInSexualOrgy}
                                        onChange={handleInputChangeRiskAssessment}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.takenPartInSexualOrgy !=="" ? (
                                    <span className={classes.error}>{errors.takenPartInSexualOrgy}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <Message warning>
                                <h4>Personal HIV Risk assessment score (sum of all 7 answers)</h4>
                                <b>Score : {riskCount.length}</b>
                            </Message>
                            <hr/>
                            <br/>
                            
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#992E62', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Sex Partner Risk Assessment (Last 3 months)</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had sex with a partner who is HIV positive? </Label>
                                    <select
                                        className="form-control"
                                        name="haveSexWithHIVPositive"
                                        id="haveSexWithHIVPositive"
                                        value={riskAssessmentPartner.haveSexWithHIVPositive}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveSexWithHIVPositive !=="" ? (
                                    <span className={classes.error}>{errors.haveSexWithHIVPositive}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            {/* {riskAssessmentPartner.sexPartnerHivPositive==='true' && (<> */}
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had sex with a partner who inject drug?</Label>
                                    <select
                                        className="form-control"
                                        name="haveSexWithPartnerInjectDrug"
                                        id="haveSexWithPartnerInjectDrug"
                                        value={riskAssessmentPartner.haveSexWithPartnerInjectDrug}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveSexWithPartnerInjectDrug !=="" ? (
                                    <span className={classes.error}>{errors.haveSexWithPartnerInjectDrug}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had sex with a partner who has sex with men ?</Label>
                                    <select
                                        className="form-control"
                                        name="haveSexWithPartnerWhoHasSexWithMen"
                                        id="haveSexWithPartnerWhoHasSexWithMen"
                                        value={riskAssessmentPartner.haveSexWithPartnerWhoHasSexWithMen}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveSexWithPartnerWhoHasSexWithMen !=="" ? (
                                    <span className={classes.error}>{errors.haveSexWithPartnerWhoHasSexWithMen}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had sex with a partner who is a transgender person</Label>
                                    <select
                                        className="form-control"
                                        name="haveSexWithPartnerTransgender"
                                        id="haveSexWithPartnerTransgender"
                                        value={riskAssessmentPartner.haveSexWithPartnerTransgender}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.haveSexWithPartnerTransgender !=="" ? (
                                    <span className={classes.error}>{errors.haveSexWithPartnerTransgender}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had sex with a partner who has sex with multiple partners without condoms</Label>
                                    <select
                                        className="form-control"
                                        name="sexWithPartnersWithoutCondoms"
                                        id="sexWithPartnersWithoutCondoms"
                                        value={riskAssessmentPartner.sexWithPartnersWithoutCondoms}
                                        onChange={handleInputChangeRiskAssessmentPartner}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.sexWithPartnersWithoutCondoms !=="" ? (
                                    <span className={classes.error}>{errors.sexWithPartnersWithoutCondoms}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                         
                            {/* </>)} */}
                            <Message warning>
                                <h4>Sex Partner Risk Assessment score (sum of all 6 answers)</h4>
                                <b>Score :{sexPartRiskCount.length}</b>
                            </Message>        
                            
                            <hr/>
                            <br/>

                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#014D88', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Assessment for PEP Indication</div>        
                            <div className="form-group  col-md-6">
                                <FormGroup>
                                    <Label>In the past 72 hours, have you had sex without a condom with someone whose HIV status is positive or not known to you?  </Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours"
                                        id="unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours"
                                        value={assessmentForPepIndication?.unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours}
                                        onChange={handleInputChangeAssessmentForPepIndication}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours !=="" ? (
                                    <span className={classes.error}>{errors.unprotectedSexWithHivPositiveOrUnknownStatusLast72Hours}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-6">
                                <FormGroup>
                                    <Label>Have you shared injection equipment like needles with someone whose HIV status is positive or unknown to you? </Label>
                                    <select
                                        className="form-control"
                                        name="sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours"
                                        id="sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours"
                                        value={assessmentForPepIndication?.sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours}
                                        onChange={handleInputChangeAssessmentForPepIndication}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours !=="" ? (
                                    <span className={classes.error}>{errors.sharedInjectionOrNeedleWithHivPositiveOrUnknownStatusLast72Hours}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#992E62', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}}  >Assessment for Acute HIV Infection</div>        
                            <div className="form-group  col-md-6">
                                <FormGroup>
                                    <Label>In the past 2 weeks: Have you had a cold or flu such as fever, sore throat, abnormal sweats, swollen lymph nodes, mouth sores, headache or rash?</Label>
                                    <select
                                        className="form-control"
                                        name="acuteHivSymptomsLasttwoWeeks"
                                        id="acuteHivSymptomsLasttwoWeeks"
                                        value={assessmentForAcuteHivInfection?.acuteHivSymptomsLasttwoWeeks}
                                        onChange={handleInputChangeAssessmentForAcuteHivInfection}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.acuteHivSymptomsLasttwoWeeks !=="" ? (
                                    <span className={classes.error}>{errors.acuteHivSymptomsLasttwoWeeks}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-6">
                                <FormGroup>
                                    <Label>Have you had condomless anal or vaginal sex or shared injection materials and/or equipment in the past 28 days?</Label>
                                    <select
                                        className="form-control"
                                        name="unprotectedAnalOrVaginalOrSharedNeedlesLast28Days"
                                        id="unprotectedAnalOrVaginalOrSharedNeedlesLast28Days"
                                        value={assessmentForAcuteHivInfection?.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days}
                                        onChange={handleInputChangeAssessmentForAcuteHivInfection}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days !=="" ? (
                                    <span className={classes.error}>{errors.unprotectedAnalOrVaginalOrSharedNeedlesLast28Days}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#000', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Drug Use History</div>
                            
                            <hr/>
                            <h3>Route of Administration</h3>
                            <h4>Do you use any of these drugs/substances ?</h4>
                            <br/>
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Inject </Label>
                                    <select
                                        className="form-control"
                                        name="inject"
                                        id="inject"
                                        value={drugHistory.inject}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.inject !=="" ? (
                                    <span className={classes.error}>{errors.inject}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Sniff </Label>
                                    <select
                                        className="form-control"
                                        name="sniff"
                                        id="sniff"
                                        value={drugHistory.sniff}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.sniff !=="" ? (
                                    <span className={classes.error}>{errors.sniff}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Snort</Label>
                                    <select
                                        className="form-control"
                                        name="Snort"
                                        id="Snort"
                                        value={drugHistory.fever}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.Snort !=="" ? (
                                    <span className={classes.error}>{errors.Snort}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Smoke</Label>
                                    <select
                                        className="form-control"
                                        name="smoke"
                                        id="smoke"
                                        value={drugHistory.smoke}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.smoke !=="" ? (
                                    <span className={classes.error}>{errors.smoke}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="row">
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you used drugs to enhance sexual performance ? </Label>
                                    <select
                                        className="form-control"
                                        name="useDrugSexualPerformance"
                                        id="useDrugSexualPerformance"
                                        value={drugHistory.useDrugSexualPerformance}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.useDrugSexualPerformance !=="" ? (
                                    <span className={classes.error}>{errors.useDrugSexualPerformance}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Have you had HIV testing before ?</Label>
                                    <select
                                        className="form-control"
                                        name="hivTestedBefore"
                                        id="hivTestedBefore"
                                        value={drugHistory.hivTestedBefore}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.hivTestedBefore !=="" ? (
                                    <span className={classes.error}>{errors.hivTestedBefore}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            {drugHistory.hivTestedBefore==="true" && (
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>When was your last test?    </Label>
                                    <select
                                        className="form-control"
                                        name="lastTest"
                                        id="lastTest"
                                        value={drugHistory.lastTest}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="1 Month">{"<"}1 Month</option>
                                        <option value="1-3 Months">1-3 Months</option>
                                        <option value="4-6Months">4-6 Months</option>
                                        <option value="6Months">{">"}6 months</option>
                                        
                                    </select>
                                    {errors.lastTest !=="" ? (
                                    <span className={classes.error}>{errors.lastTest}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            )}
                            </div>
                            
                            <div className="row">

                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>HIV test result at visit <span style={{ color:"red"}}> *</span></Label>
                                    <select
                                        className="form-control"
                                        name="hivTestResultAtvisit"
                                        id="hivTestResultAtvisit"
                                        value={drugHistory.hivTestResultAtvisit}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="Positive">Positive</option>
                                        <option value="Negative">Negative</option>
                                        
                                    </select>
                                    {errors.hivTestResultAtvisit !=="" ? (
                                    <span className={classes.error}>{errors.hivTestResultAtvisit}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>

                            </div>
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Recommended for HIV Retest ?</Label>
                                    <select
                                        className="form-control"
                                        name="recommendHivRetest"
                                        id="recommendHivRetest"
                                        value={drugHistory.recommendHivRetest}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.recommendHivRetest !=="" ? (
                                    <span className={classes.error}>{errors.recommendHivRetest}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Tested in certain Clinical settings, such as STI clinics?</Label>
                                    <select
                                        className="form-control"
                                        name="clinicalSetting"
                                        id="clinicalSetting"
                                        value={drugHistory.clinicalSetting}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.clinicalSetting !=="" ? (
                                    <span className={classes.error}>{errors.clinicalSetting}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Report ongoing HIV risk behaviors?</Label>
                                    <select
                                        className="form-control"
                                        name="reportHivRisk"
                                        id="reportHivRisk"
                                        value={drugHistory.reportHivRisk}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.reportHivRisk !=="" ? (
                                    <span className={classes.error}>{errors.reportHivRisk}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-3">
                                <FormGroup>
                                    <Label>Report a specific HIV exposure within the last 3 months</Label>
                                    <select
                                        className="form-control"
                                        name="hivExposure"
                                        id="hivExposure"
                                        value={drugHistory.hivExposure}
                                        onChange={handleInputChangeDrugHistory}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.hivExposure !=="" ? (
                                    <span className={classes.error}>{errors.hivExposure}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#014D88', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Syndromic STI Screening</div>
                            {props.patientDetail && props.patientDetail.personResponseDto.sex==='Female' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of vaginal discharge or burning when urinating?</Label>
                                    <select
                                        className="form-control"
                                        name="vaginalDischarge"
                                        id="vaginalDischarge"
                                        value={stiScreening.vaginalDischarge}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.vaginalDischarge !=="" ? (
                                    <span className={classes.error}>{errors.vaginalDischarge}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of lower abdominal pains with or without vaginal discharge?</Label>
                                    <select
                                        className="form-control"
                                        name="lowerAbdominalPains"
                                        id="lowerAbdominalPains"
                                        value={stiScreening.lowerAbdominalPains}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.lowerAbdominalPains !=="" ? (
                                    <span className={classes.error}>{errors.lowerAbdominalPains}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            </>)}
                            {props.patientObj.personResponseDto && props.patientDetail.personResponseDto.sex==='Male' && (
                            <>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of urethral discharge or burning when urinating?</Label>
                                    <select
                                        className="form-control"
                                        name="urethralDischarge"
                                        id="urethralDischarge"
                                        value={stiScreening.urethralDischarge}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.urethralDischarge !=="" ? (
                                    <span className={classes.error}>{errors.urethralDischarge}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of scrotal swelling and pain</Label>
                                    <select
                                        className="form-control"
                                        name="complaintsOfScrotal"
                                        id="complaintsOfScrotal"
                                        value={stiScreening.complaintsOfScrotal}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.complaintsOfScrotal !=="" ? (
                                    <span className={classes.error}>{errors.complaintsOfScrotal}</span>
                                    ) : "" }
                                </FormGroup>
                            </div> 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Complaints of genital sore(s) or swollen inguinal lymph nodes with or without pains?</Label>
                                    <select
                                        className="form-control"
                                        name="complaintsGenitalSore"
                                        id="complaintsGenitalSore"
                                        value={stiScreening.complaintsGenitalSore}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.complaintsGenitalSore !=="" ? (
                                    <span className={classes.error}>{errors.complaintsGenitalSore}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            </>)} 
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Genital score +/-pains?</Label>
                                    <select
                                        className="form-control"
                                        name="genitalScore"
                                        id="genitalScore"
                                        value={stiScreening.genitalScore}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.genitalScore !=="" ? (
                                    <span className={classes.error}>{errors.genitalScore}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Swollen iguinal lymph node +/-pains?</Label>
                                    <select
                                        className="form-control"
                                        name="swollenIguinal"
                                        id="swollenIguinal"
                                        value={stiScreening.swollenIguinal}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.swollenIguinal !=="" ? (
                                    <span className={classes.error}>{errors.swollenIguinal}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Anal pain on stooling?</Label>
                                    <select
                                        className="form-control"
                                        name="analpain"
                                        id="analpain"
                                        value={stiScreening.analpain}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.analpain !=="" ? (
                                    <span className={classes.error}>{errors.analpain}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Anal itching?</Label>
                                    <select
                                        className="form-control"
                                        name="analItching"
                                        id="analItching"
                                        value={stiScreening.analItching}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.analItching !=="" ? (
                                    <span className={classes.error}>{errors.analItching}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>Anal discharge?</Label>
                                    <select
                                        className="form-control"
                                        name="analDischarge"
                                        id="analDischarge"
                                        value={stiScreening.analDischarge}
                                        onChange={handleInputChangeStiScreening}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.analDischarge !=="" ? (
                                    <span className={classes.error}>{errors.analDischarge}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <Message warning>
                                <h4>Calculate the sum of the STI screening. If {">= "}1, should be referred for STI test </h4>
                                <b>Score :{stiCount.length}</b>
                            </Message>
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#014D88', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Assessment for PrEP Eligibilty</div>
                            <div>
                                <FormGroup>
                                    <Label>{`HIV Negative: ${drugHistory.hivTestResultAtvisit === "Negative" ? 1 : 0}`}</Label>
                                </FormGroup>
                            </div>
                            <div>
                                <FormGroup>
                                    <Label>{`HIV Risk Score > 1: ${riskCount.length > 0 ? 1 : 0}`}</Label>
                                </FormGroup>
                            </div>
                            {(is30AndAbove() && isFemale() === false) && <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`Has no proteinuria (>30 Years)`}</Label>
                                    <select
                                        className="form-control"
                                        name="hasNoProteinuria"
                                        id="hasNoProteinuria"
                                        value={assessmentForPrepEligibility?.hasNoProteinuria}
                                        onChange={handleInputChangeAssessmentForPrepEligibility}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.hasNoProteinuria !=="" ? (
                                    <span className={classes.error}>{errors.hasNoProteinuria}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>}
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`No history / signs & symptoms of Liver abnormalities (CAB-LA)`}</Label>
                                    <select
                                        className="form-control"
                                        name="noHistoryOrSignsOfLiverAbnormalitiesCabLa"
                                        id="noHistoryOrSignsOfLiverAbnormalitiesCabLa"
                                        value={assessmentForPrepEligibility?.noHistoryOrSignsOfLiverAbnormalitiesCabLa}
                                        onChange={handleInputChangeAssessmentForPrepEligibility}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.noHistoryOrSignsOfLiverAbnormalitiesCabLa !=="" ? (
                                    <span className={classes.error}>{errors.noHistoryOrSignsOfLiverAbnormalitiesCabLa}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`No history of drug-drug interaction (CAB-LA)`}</Label>
                                    <select
                                        className="form-control"
                                        name="noHistoryOfDrugToDrugInteractionCabLa"
                                        id="noHistoryOfDrugToDrugInteractionCabLa"
                                        value={assessmentForPrepEligibility?.noHistoryOfDrugToDrugInteractionCabLa}
                                        onChange={handleInputChangeAssessmentForPrepEligibility}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.noHistoryOfDrugToDrugInteractionCabLa !=="" ? (
                                    <span className={classes.error}>{errors.noHistoryOfDrugToDrugInteractionCabLa}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`No history of drug hypersensitivity (CAB-LA)`}</Label>
                                    <select
                                        className="form-control"
                                        name="noHistoryOfDrugHypersensitivityCabLa"
                                        id="noHistoryOfDrugHypersensitivityCabLa"
                                        value={assessmentForPrepEligibility?.noHistoryOfDrugHypersensitivityCabLa}
                                        onChange={handleInputChangeAssessmentForPrepEligibility}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.noHistoryOfDrugHypersensitivityCabLa !=="" ? (
                                    <span className={classes.error}>{errors.noHistoryOfDrugHypersensitivityCabLa}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                            <Message warning>
                                <h4>Calculate the sum of PrEP Eligibility. If {"<= "}1 client is Eligible for PrEP.  (Score: Count Yes=1, No=0).</h4>
                                {/* <b>Score :{stiCount.length}</b> */}
                                <h5>{`HIV Negative: ${drugHistory.hivTestResultAtvisit === "Negative" ? 1 : 0}`}</h5>
                                <h5>{`HIV risk score >=1 : ${riskCount.length > 0 ? 1 : 0}`}</h5>
                                <h5>{`No signs & symptoms of acute HIV infection: ${getAcuteHivResult() }`}</h5>
                                <h5>{`No Indication for PEP: ${getIndicationForPepResult()}`}</h5>
                                {(is30AndAbove() && isFemale() === false) && <h5>{`Has no proteinuria: ${assessmentForPrepEligibility?.hasNoProteinuria === "true" ? 1 : 0}`}</h5>}

                            </Message>
                            <Message warning>
                                <h4>Calculate the sum of PrEP Eligibility for CAB-LA regimen. If the following below =1 client is Eligible for CAB-LA. {`(Score: Count Yes=1, No=0)`}</h4>
                                {/* <b>Score :{stiCount.length}</b> */}
                                <h5>{`No history / signs & symptoms of Liver abnormalities (CAB-LA): ${assessmentForPrepEligibility?.noHistoryOrSignsOfLiverAbnormalitiesCabLa === "true" ? 1 : 0}`}</h5>
                                <h5>{`No history of drug-drug interaction (CAB-LA): ${assessmentForPrepEligibility?.noHistoryOfDrugToDrugInteractionCabLa === "true" ? 1 : 0}`}</h5>
                                <h5>{`No history of drug hypersensitivity (CAB-LA): ${assessmentForPrepEligibility?.noHistoryOfDrugHypersensitivityCabLa === "true" ? 1 : 0}`}</h5>

                            </Message>
                            <Message warning>
                                <h3>{`Final Prep Eligibility Score: ${getPrepEligibilityScore()}`}</h3>
                            </Message>
                            <hr/>
                            <br/>
                            <div className="form-group  col-md-12 text-center pt-2 mb-4" style={{backgroundColor:'#014D88', width:'125%', height:'35px', color:'#fff', fontWeight:'bold'}} >Services Received by Client</div>
                            <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`Willing to commence PrEP`}</Label>
                                    <select
                                        className="form-control"
                                        name="willingToCommencePrep"
                                        id="willingToCommencePrep"
                                        value={servicesReceivedByClient?.willingToCommencePrep}
                                        onChange={handleInputChangeServicesReceivedByClient}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    >
                                        <option value={""}></option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                        
                                    </select>
                                    {errors.willingToCommencePrep !=="" ? (
                                    <span className={classes.error}>{errors.willingToCommencePrep}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>
                                     
                                        
                                        {/* <Dropdown placeholder='Skills' fluid multiple selection options={reasonForDecline} /> */}
                            {servicesReceivedByClient?.willingToCommencePrep === 'false' && <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`Reasons for Declining PrEP`}</Label>
                                    <Dropdown value={servicesReceivedByClient?.reasonsForDecline} placeholder='select reasons for decline' onChange={handleInputReasonsForDecline} fluid multiple selection options={reasonForDecline.map((each) => {
                                            return {key: each.code, text:each.display, value:each.code}})} />
                                    {errors.reasonsForDecline !=="" ? (
                                    <span className={classes.error}>{errors.reasonsForDecline}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>}
                            {(servicesReceivedByClient?.reasonsForDecline?.find((one)=> one === "REASON_PREP_DECLINED_OTHERS_(SPECIFY)") !== (null || undefined)) && <div className="form-group  col-md-4">
                                <FormGroup>
                                    <Label>{`Other Reasons for Declining PrEP (Specify)`}</Label>
                                    <Input
                                        className="form-control"
                                        name="otherReasonsForDecline"
                                        id="otherReasonsForDecline"
                                        value={servicesReceivedByClient?.otherReasonsForDecline}
                                        onChange={handleInputChangeServicesReceivedByClient}
                                        style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                                        disabled={disabledField}
                                    />

                                    {errors.reasonsForDecline !=="" ? (
                                    <span className={classes.error}>{errors.reasonsForDecline}</span>
                                    ) : "" }
                                </FormGroup>
                            </div>}
                         
                           
                            {saving ? <Spinner /> : ""}
                            <br />
                            <div className="row">
                            <div className="form-group mb-3 col-md-12">
                            {props.activeContent && props.activeContent.actionType ==="update"? (<>
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
                           
                            </div>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>                                 
        </>
    );
};

export default BasicInfo
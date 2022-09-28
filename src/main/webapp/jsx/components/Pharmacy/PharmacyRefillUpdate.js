import React, {useState, useEffect} from 'react';
import axios from "axios";
import { Input, Label, FormGroup, CardBody, Card } from "reactstrap";
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import "react-widgets/dist/css/react-widgets.css";
import moment from "moment";
import { Spinner } from "reactstrap";
import Select from "react-select";
import { url as baseUrl, token } from "../../../api";
import { toast} from "react-toastify";
import { Button as ButtonSMUI, Icon} from 'semantic-ui-react'
//import { Icon,Button, } from 'semantic-ui-react'


const useStyles = makeStyles(theme => ({ 
    button: {
      margin: theme.spacing(1)
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
let refillPeriodValue=null

const Pharmacy = (props) => {
    const patientObj = props.patientObj;
    const enrollDate = patientObj && patientObj.artCommence ? patientObj.artCommence.visitDate : null
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const [selectedOption, setSelectedOption] = useState([]);
    const [selectedOptionAdr, setSelectedOptionAdr] = useState();
    const [prepSideEffect, setPrepSideEffect] = useState([]);
    const [mmdType, setmmdType]=useState();
    const [enableUpdate, setEnableUpdate]= useState(true) //Enable update for all input field if the user have permission
    const [showmmdType, setShowmmdType]=useState(false);
    const [showDsdModel, setShowDsdModel] = useState(false);
    const [showAdr, setShowAdr] = useState(false);
    const [showRegimen, setShowRegimen] = useState(false);
    const [regimen, setRegimen] = useState([]);
    const [regimenList, setRegimenList] = useState([]);
    const [regimenType, setRegimenType] = useState([]);
    const [objValues, setObjValues] = useState({
                                                adherence: "",
                                                adrScreened: "",
                                                adverseDrugReactions: [],
                                                dsdModel:"",
                                                isDevolve:"",
                                                extra: {},
                                                facilityId: 2,
                                                mmdType:null,
                                                nextAppointment: null,
                                                personId: props.patientObj.id,
                                                refillPeriod:null,
                                                prescriptionError: null,
                                                regimenId: [],
                                                visitDate: null,
                                                visitId: 0
                                            });
    useEffect(() => {
        RegimenLine();
        PrepSideEffect();
        PharmacyRefillDetail(); 
        
        }, [props.activeContent.obj, props.activeContent.id]);

    const EnableUpdateAction =()=>{

        setEnableUpdate(false)
    }
        //Get Pharmacy refill Detail
        const PharmacyRefillDetail =()=>{
            axios
                .get(`${baseUrl}hiv/art/pharmacy/${props.activeContent.id}`,
                    { headers: {"Authorization" : `Bearer ${token}`} }
                )
                .then((response) => {
                    const data=response.data
                    //console.log(response.data);
                    setObjValues(data);
                    //setRegimenList(data.extra.regimens)
                    setRegimenList(data && data.extra ? data.extra.regimens : [])
                    if(data.adrScreened){
                        setShowAdr(true)
                        setSelectedOptionAdr(data.adverseDrugReactions)
                    }
                    if(data.regimen.length > 0){
                        setSelectedOption(
                            Object.entries(data.extra.regimens).map(([key, value]) => ({
                                        label: value.name,
                                        value: value.id
                                    }))
                        )
                        // setRegimenList(
                        //     Object.entries(selectedOption && selectedOption.length>0? selectedOption : []).map(([key, value]) => ({
                        //         id: value.value,
                        //         name: value.label,
                        //         dispenseQuantity:objValues.refillPeriod!==null ? objValues.refillPeriod: ""
                        //     })))
                        setShowRegimen(true)
                    }
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
            
            setRegimen(response.data);
        })
        .catch((error) => {
        //console.log(error);
        });
    
    }
    //Get list of PrepSideEffect
    const PrepSideEffect =()=>{
        axios
           .get(`${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`,
               { headers: {"Authorization" : `Bearer ${token}`} }
           )
           .then((response) => {
               //console.log(response.data);
               setPrepSideEffect(Object.entries(response.data).map(([key, value]) => ({
                label: value.display,
                value: value.id,
              })));
           })
           .catch((error) => {
           //console.log(error);
           });
       
    }
    function RegimenType(id) {
        async function getCharacters() {
            const response = await axios.get(`${baseUrl}hiv/regimen/types/${id}`,
            { headers: {"Authorization" : `Bearer ${token}`} })
            setRegimenType(
                Object.entries(response.data).map(([key, value]) => ({
                  label: value.description,
                  value: value.id,
                })))
        }
        getCharacters();
    }
    const handleInputChange = e => {
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
       
    }
    const handleSelectedRegimen = e => {
        const regimenId= e.target.value
        if(regimenId!==""){
            RegimenType(regimenId)
            setShowRegimen(true)
        }else{
            setRegimenType([])
            setShowRegimen(false)
        }
    }
    const handleCheckBox =e =>{
        if(e.target.checked){
            setShowDsdModel(true)
            setObjValues ({...objValues,  isDevolve: true});
        }else{
            setShowDsdModel(false)
            setObjValues ({...objValues,  isDevolve: false});
        }
    } 
    const handlePrescriptionErrorCheckBox =e =>{
        if(e.target.checked){
            setObjValues ({...objValues,  prescriptionError: true});
        }else{
            setObjValues ({...objValues,  prescriptionError: false});
        }
    } 
    const handleCheckBoxAdverseDrugReactions =e =>{
        if(e.target.checked){
            setShowAdr(true)
            setObjValues ({...objValues,  adrScreened:true});
        }else{
            setShowAdr(false)
            setObjValues ({...objValues,  adrScreened:false});
        }
    } 
    const handlRefillPeriod = e =>{
        const refillcount= e.target.value
        refillPeriodValue=refillcount
        const visitDate = objValues.visitDate
        const nextrefillDate= moment(visitDate, "YYYY-MM-DD").add(refillcount, 'days').toDate();
        const nextDate =moment(nextrefillDate).format("YYYY-MM-DD")
        objValues.refillPeriod= e.target.value
        setObjValues ({...objValues,  nextAppointment: nextDate})

        if(refillcount==="90"){
            setShowmmdType(true)
            setmmdType("MMD-3")
        }else if(refillcount==="120"){
            setShowmmdType(true)
            setmmdType("MMD-4")
        }else if(refillcount==="150"){
            setShowmmdType(true)
            setmmdType("MMD-5")
        }else if(refillcount==="180"){
            setShowmmdType(true)
            setmmdType("MMD-6")
        }else{
            setShowmmdType(false)
            setmmdType("")
        }

    }
    const handleFormChange = (index, event) => {
        let data = [...regimenList];
        data[index][event.target.name] = event.target.value;
        setRegimenList(data);
     }

    console.log(regimenList)
    const handleSubmit = (e) => {        
        e.preventDefault();
        setSaving(true);
        objValues.adverseDrugReactions=selectedOptionAdr
        objValues.personId=props.patientObj.id
        objValues.mmdType=mmdType
        delete regimenList['name']
        objValues.regimen=regimenList

        axios.put(`${baseUrl}hiv/art/pharmacy/${props.activeContent.obj.id}`,objValues,
        { headers: {"Authorization" : `Bearer ${token}`}},)
        .then(response => {
            setSaving(false);
            toast.success("Pharmacy drug refill updated successful");
             props.setActiveContent({...props.activeContent, route:'pharmacy', id:"", activeTab:"history", actionType:"view", obj:{}})
        })
        .catch(error => {
            setSaving(false);
            if(error.response && error.response.data){
                let errorMessage = error.response.data && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage); 
            }
                       
        }); 
    }


  return (      
      <div>
 
        <div className="row">
        <div className="col-md-6">
        <h2>Pharmacy Drug Refill -- Detail</h2> 

        </div>
        <div className="col-md-6">
        {props.activeContent.actionType==='update' ? (
            <ButtonSMUI color='facebook' className={'float-end'} onClick={()=>EnableUpdateAction()}>
                <Icon name='edit' /> Edit Refill 
            </ButtonSMUI>
        ):""}
        </div>
        <br/><br/>
        <Card >
            <CardBody>
            <form >
            <div className="row">
            <div className="form-group mb-3 col-md-12">
                    
                    <div className="form-check custom-checkbox ml-1 ">
                        <input
                        type="checkbox"
                        className="form-check-input"                       
                        name="devolvePatient"
                        id="devolvePatient"
                        onChange={handleCheckBox}
                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                        checked={objValues.isDevolve}
                        disabled={enableUpdate}
                        />
                        <label
                        className="form-check-label"
                        htmlFor="basic_checkbox_1"
                        >
                        Devolve Patient
                        </label>
                    </div>
                </div>
            <div className="form-group mb-3 col-md-4">
                <FormGroup>
                <Label for="artDate">Encounter Date * </Label>
                <Input
                    type="date"
                    name="visitDate"
                    id="visitDate"
                    onChange={handleInputChange}
                    value={objValues.visitDate}
                    min={moment(enrollDate).format("YYYY-MM-DD") }
                    disabled={enableUpdate}
                    max= {moment(new Date()).format("YYYY-MM-DD") }
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                />
                </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-4">
            <FormGroup>
                <Label >Refill Period(days) *</Label>
                <Input
                    type="select"
                    name="refillPeriod"
                    id="refillPeriod"
                    disabled={objValues.visitDate!==null ? false : true}
                    onChange={handlRefillPeriod}   
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}  
                    value={objValues.refillPeriod}               
                    >
                    <option value="">Select </option>
                    <option value="15">15</option>
                    <option value="30">30 </option>
                    <option value="60">60 </option>
                    <option value="90">90 </option>
                    <option value="120">120 </option>
                    <option value="150">150 </option>
                    <option value="180">180 </option>
                </Input>
                
                </FormGroup>
            </div>
        
            <div className="form-group mb-3 col-md-4">
            <FormGroup>
                <Label for="artDate"> Date of Next Appointment* </Label>
                <Input
                    type="date"
                    name="nextAppointment"
                    id="nextAppointment"
                    disabled={objValues.refillPeriod!==null? false : true}
                    onChange={handleInputChange}
                    value={objValues.nextAppointment}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    required
                />
                </FormGroup>
            </div>
            <div className="form-group mb-3 col-md-6">
            <FormGroup>
                <Label >Service Delivery Point *</Label>
                <Input
                    type="select"
                    name="deliveryPoint"
                    id="deliveryPoint"
                    value={objValues.deliveryPoint}
                    onChange={handleInputChange} 
                    disabled={enableUpdate}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}                   
                    >
                    <option value="">Select </option>
                    <option value="Facility">Facility </option>
                    <option value="Community">Community </option>
                    
                </Input>
                
                </FormGroup>
            </div>
            {showmmdType &&(
                    <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                    <Label >MMD Type</Label>
                    <Input
                        type="text"
                        name="mmdType"
                        id="mmdType"
                        disabled="true"
                        value={mmdType}
                        onChange={handleInputChange}
                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    />
                     
                    </FormGroup>
                </div>
            )}
            {showDsdModel && (
            <div className="form-group mb-3 col-md-6">
                <FormGroup>
                <Label >DSD Models*</Label>
                <Input
                    type="select"
                    name="dsdModel"
                    id="dsdModel"
                    disabled={enableUpdate}
                    value={objValues.dsdModel}
                    onChange={handleInputChange}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    >
                    <option value="">Select </option>
                    <option value="CPARP">CPARP </option>
                    <option value="Home Delivery">Home Delivery </option>
                    <option value="One Stop Shop">One Stop Shop </option>
                </Input>
                
                </FormGroup>
            </div>
            )}
            <div className="form-group mb-3 col-md-6">
                    
                    <div className="form-check custom-checkbox ml-1 ">
                        <input
                        type="checkbox"
                        className="form-check-input"
                        
                        name="prescriptionError"
                        id="prescriptionError"
                        onChange={handlePrescriptionErrorCheckBox}
                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                        checked={objValues.prescriptionError}
                        disabled={enableUpdate}
                        />
                        <label
                        className="form-check-label"
                        htmlFor="basic_checkbox_1"
                        >
                        Any Prescription Error?
                        </label>
                    </div>
                    <br/>
                    <div className="form-check custom-checkbox ml-1 ">
                        <input
                        type="checkbox"
                        className="form-check-input"
                        disabled={enableUpdate}
                        name="adverseDrugReactions"
                        id="adverseDrugReactions"
                        onChange={handleCheckBoxAdverseDrugReactions}
                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                        //value={values.ovc_enrolled}
                        checked={objValues.adrScreened}
                        />
                        <label
                        className="form-check-label"
                        htmlFor="basic_checkbox_1"
                        >
                        Advanced Drug Reactions
                        </label>
                    </div>
                </div>
                {showAdr && (
                <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                        <Label >ADR</Label>
                        <Select
                            onChange={setSelectedOptionAdr}
                            value={selectedOptionAdr}
                            options={prepSideEffect}
                            isMulti="true"
                            noOptionsMessage="true"
                            style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                            disabled={enableUpdate}

                        />
                        
                    </FormGroup>
                </div>
            )}
            <hr/>
            <div className="form-group mb-3 col-md-6">
                <FormGroup>
                <Label >Select Regimen Line *</Label>
                <Input
                    type="select"
                    name="regimen"
                    id="regimen"
                    hidden={enableUpdate}
                    value={objValues.drugName}
                    onChange={handleSelectedRegimen}  
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    disabled={objValues.refillPeriod!==null? false : true}                 
                    >
                    <option value="">Select </option>
                                    
                        {regimen.map((value) => (
                            <option key={value.id} value={value.id}>
                                {value.description}
                            </option>
                        ))}
                </Input>
                
                </FormGroup>
            </div>
            {showRegimen && (
            <div className="form-group mb-3 col-md-6">
                <FormGroup>
                <Label >Regimen *</Label>
                <Select
                    onChange={setSelectedOption}
                    value={selectedOption}
                    options={regimenType}
                    style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                    isMulti="true"
                    noOptionsMessage="true"
                    isDisabled={enableUpdate}

                />
                </FormGroup>
            </div>
            )}
            {selectedOption && selectedOption.length >0  ? 

                (
                    <>
                        <Card>
                        <CardBody>
                        <h4>Drugs Information </h4>
                        <div className="row">
                            <div className="form-group mb-3 col-md-8"  >Regimen Name selected </div>
                            <div className="form-group mb-3 col-md-4"  >Quantity </div>
                        </div>
                        {regimenList.length >0 && regimenList.map((input, index) => (
                            <>
                                <div className="row">
                                <div className="form-group mb-3 col-md-8"  >
                                    <FormGroup>
                                    <Label ><b>{input.name}</b></Label>
                                    <Input
                                        type="hidden"
                                        name="id"
                                        id="id"
                                        value={input.id}  
                                        onChange={event => handleFormChange(index, event)}                                    
                                        required
                                        >                                       
                                    </Input>
                                    </FormGroup>
                                </div>

                                <div className="form-group mb-3 col-md-3">
                                    <FormGroup>
                                    <Input
                                        type="number"
                                        name="dispenseQuantity"
                                        id="dispenseQuantity"
                                        value={input.dispenseQuantity}
                                        style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                        onChange={event => handleFormChange(index, event)}
                                        required
                                        >
                                        
                                    </Input>
                                
                                    </FormGroup>
                                </div>
                                <div className="form-group mb-3 col-md-3"></div>
                                </div>
                            </>
                        ))}
                       
                        </CardBody>
                        </Card>
                        <br/>
                    </>                  
                    )
                    :
                    ""
                }
            </div>                              
            {saving ? <Spinner /> : ""}
            <br />
            {regimenList.length >0 && (
                <MatButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    hidden={enableUpdate}
                    style={{backgroundColor:"#014d88"}}
                    disabled={(objValues.visitDate===null && regimenList.length>0) || saving ? true : false}
                    >
                    {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                    ) : (
                    <span style={{ textTransform: "capitalize" }}>Updating...</span>
                    )}
                </MatButton>
            )}
                </form>
            </CardBody>
        </Card> 
    </div>
    </div>
  );
}

export default Pharmacy;

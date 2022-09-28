import React, {useState, useEffect} from 'react';
import { Form,Row, Card,CardBody, FormGroup, Label, Input} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl } from "./../../../api";
import { token as token } from "./../../../api";
import { Spinner } from "reactstrap";
import { Alert } from "react-bootstrap";
import { Icon,Button, } from 'semantic-ui-react'
import moment from "moment";


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

const ViewMentalHealthScreening = (props) => {
    const patientObj = props.patientObj;
    //let history = useHistory();
    const classes = useStyles()
    const [objValues, setObjValues] = useState({mhs1:"",mhs2:"" ,mhs3:"" ,mhs4:"",mhs5:""});
    const [saving, setSaving] = useState(false);
    const [referrer, setReferrer] = useState(false);
    const [errors, setErrors] = useState({});
    const [observation, setObservation]=useState({
                                                    data: {},
                                                    dateOfObservation: "yyyy-MM-dd",
                                                    facilityId: null,
                                                    personId: 0,
                                                    type: "Mental health",
                                                    visitId: null
                                                })
    useEffect(() => {
        GetMHSDetail();
    }, [props.activeContent.id]);
                                                
    //Get Mental Health Object
    const GetMHSDetail =()=>{
    axios
       .get(`${baseUrl}observation/person/${props.patientObj.id}`,
           { headers: {"Authorization" : `Bearer ${token}`} }
       )
       .then((response) => {            
            const mentalObj= response.data.find((x)=> x.type==='Mental health') 
            //console.log(mentalObj)
            setObjValues({...mentalObj.data})
              //setViralLoad(LabObject)
       })
       .catch((error) => {
       //console.log(error);
       });
   
    }
    const handleInputChangeKP = e => {
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
    }
          
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault(); 
          observation.dateOfObservation= moment(new Date()).format("YYYY-MM-DD")       
          observation.personId =patientObj.id
          observation.data=objValues
          setSaving(true);
          axios.post(`${baseUrl}observation`,observation,
           { headers: {"Authorization" : `Bearer ${token}`}},          
          )
              .then(response => {
                  setSaving(false);
                  props.patientObj.mentalHealth=true
                  toast.success("Mental health screening save successful.\nPlease refer patient to psychiatric hospital");
                  if(objValues.mhs1==="YES" || objValues.mhs2==="YES" || objValues.mhs4==="YES" || objValues.mhs4==="YES" || objValues.mhs5==="YES" ){
                    setReferrer(true)
                  }else{
                    setReferrer(false)
                  }
                  props.setActiveContent("recent-history")
                  //history.push("/")
              })
              .catch(error => {
                setSaving(false);
                let errorMessage = error.response.data && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                toast.error(errorMessage);
              });
          
    }

  return (      
        <div>                   
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                    <div className="col-md-6">
                        <h2>Mental Health Screening Form </h2>
                    </div>
                    {/* <div className="col-md-6">
                        <Button icon color='teal' className='float-end'><Icon name='eye' /> Previous History</Button>
                    </div> */}
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    {referrer && (
                        <>
                        <Alert
                        variant="warning"
                        className="alert-dismissible solid fade show"
                        >
                        <p>Please refer patient to psychiatric hospital</p>
                        </Alert>
                        
                        </>
                    )}
                    <div className="m-3 col-md-12"></div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Have you ever been depressed for weeks at a time, lost interest, or pleasure in most activities, had trouble concentrating and making decisions, or thought about killing yourself?</Label>
                            <Input
                                type="select"
                                name="mhs1"
                                id="mhs1"
                                value={objValues.mhs1}
                                onChange={handleInputChangeKP}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                required
                                >
                                <option value=""> Select</option>
                                <option value="YES"> YES</option>
                                <option value="NO"> NO</option>
                            </Input>
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Have you ever had spells or attacks when you suddenly felt anxious, frightened, uneasy to the extent that you began sweating, your heart began to beat rapidly, you were shaking or trembling, your stomach was upset, you felt dizzy or unsteady, as if you would faint? </Label>
                            <Input
                                type="select"
                                name="mhs2"
                                id="mhs2"
                                value={objValues.mhs2}
                                onChange={handleInputChangeKP}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                required
                                >
                                <option value=""> Select</option>
                                <option value="YES"> YES</option>
                                <option value="NO"> NO</option>
                            </Input>
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Have you ever had nightmares or flashbacks because of being involved in some traumatic/terrible event? For example, domestic violence, rape, police raid or arrest, blackmail.</Label>
                        <Input
                            type="select"
                            name="mhs3"
                            id="mhs3"
                            value={objValues.mhs3}
                            onChange={handleInputChangeKP}
                            style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                            required
                            >
                            <option value=""> Select</option>
                            <option value="YES"> YES</option>
                            <option value="NO"> NO</option>
                        </Input>
                        </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >Have you used drugs other than those required for medical reasons? For example, cannabis, cocaine, stimulants, or narcotics (e.g., heroin). May equally ask about the abuse of alcohol and other local drugs or psychoactive substances. </Label>
                            <Input
                                type="select"
                                name="mhs4"
                                id="mhs4"
                                value={objValues.mhs4}
                                onChange={handleInputChangeKP}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                required
                                >
                                <option value=""> Select</option>
                                <option value="YES"> YES</option>
                                <option value="NO"> NO</option>
                            </Input>
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label >In recent time, has any one punched, slapped, kicked, bit, or caused you any type of physical or sexual harm?</Label>
                            <Input
                                type="select"
                                name="mhs5"
                                id="mhs5"
                                value={objValues.mhs5}
                                onChange={handleInputChangeKP}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                required
                                >
                                <option value=""> Select</option>
                                <option value="YES"> YES</option>
                                <option value="NO"> NO</option>
                            </Input>
                            </FormGroup>
                        </div>                        
                    </div>
                    
                    {props.activeContent.actionType ==='update' ?
                        (
                   
                            <MatButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            style={{backgroundColor:"#014d88"}}
                            startIcon={<SaveIcon />}
                            disabled={objValues.mhs1==="" || objValues.mhs2==="" || objValues.mhs4==="" || objValues.mhs4==="" || objValues.mhs5==="" ? true : false}
                            onClick={handleSubmit}
                            
                            >
                            {!saving ? (
                            <span style={{ textTransform: "capitalize" }}>Update</span>
                            ) : (
                            <span style={{ textTransform: "capitalize" }}>Updating...</span>
                            )}
                            </MatButton>
                            )
                        :""
                        }
                
                    </form>
                </CardBody>
            </Card>                    
        </div>
  );
}

export default ViewMentalHealthScreening;

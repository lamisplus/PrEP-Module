import React, {useState, useEffect} from 'react';
import { Card,CardBody, FormGroup, Label, Input} from 'reactstrap';
import MatButton from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import CancelIcon from '@material-ui/icons/Cancel'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl, token } from "./../../../../api";
import "react-widgets/dist/css/react-widgets.css";
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

const EAC = (props) => {
    const patientObj = props.patientObj;
    const enrollDate = patientObj && patientObj.enrollment ? patientObj.enrollment.dateOfRegistration : null
    const classes = useStyles()
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [objValues, setObjValues]=useState({
                                                dateOfEac1: null,
                                                dateOfEac2: null,
                                                dateOfEac3: null,
                                                dateOfLastViralLoad: "",
                                                lastViralLoad:"",
                                                note: "",
                                                personId: props.patientObj.id,
                                                status: "First",
                                                visitId:""
                                            })
    useEffect(() => {
        EACStatus();
        }, [props.activeContent.id]);
    
        ///GET LIST OF FUNCTIONAL%20_STATUS
        // TB STATUS
        const EACStatus = ()=>{
        axios
            .get(`${baseUrl}observation/eac/${props.activeContent.id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                objValues.dateOfEac1=response.data.dateOfEac1
                objValues.dateOfEac2= response.data.dateOfEac2
                objValues.dateOfEac3=response.data.dateOfEac3
                objValues.dateOfLastViralLoad=response.data.dateOfLastViralLoad
                objValues.lastViralLoad=response.data.lastViralLoad
                objValues.note=response.data.note
                objValues.personId=response.data.personId
                objValues.status=response.data.status
                objValues.visitId=response.data.visitId
                setObjValues({...objValues, ...response.data})
            })
            .catch((error) => {
            //console.log(error);
            });
        
        }
 
    const handleInputChange = e => {
        setObjValues ({...objValues,  [e.target.name]: e.target.value});
    }          
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();        
          setSaving(true);
          axios.put(`${baseUrl}observation/eac/${props.activeContent.id}`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},
          
          )
              .then(response => {
                  setSaving(false);
                  props.setEacObj(response.data)
                  props.setHideFirst(true)
                  props.setHideFirst(true)
                  props.setHideSecond(true)
                  toast.success(" Save successful");
                  //props.setActiveContent('recent-history')

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

  return (      
        <div>                   
            <Card >
                <CardBody>
                <form >
                    <div className="row">
                    <h2>Enhanced Adherence Counselling </h2>
                        <br/>
                        <br/>
                        <br/>
                        <br/>

                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Date Of Last Viral Load</Label>
                            <Input
                                type="date"
                                name="dateOfLastViralLoad"
                                id="dateOfLastViralLoad"
                                value={objValues.dateOfLastViralLoad}
                                onChange={handleInputChange}
                                min={enrollDate}
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update'? false : true}
                                required
                            />
                            
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">Date of EAC </Label>
                            <Input
                                type="date"
                                name="dateOfEac1"
                                id="dateOfEac1"
                                value={objValues.dateOfEac1}
                                onChange={handleInputChange}
                                min= {moment(objValues.dateOfLastViralLoad).format("YYYY-MM-DD") }
                                max= {moment(new Date()).format("YYYY-MM-DD") }
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update'? false : true}
                                required
                            />
                            {errors.dateOfEac1 !=="" ? (
                                <span className={classes.error}>{errors.dateOfEac1}</span>
                            ) : "" }
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">lastViralLoad</Label>
                            <Input
                                type="number"
                                name="lastViralLoad"
                                id="lastViralLoad"
                                value={objValues.lastViralLoad}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update'? false : true}
                                required
                            />
                            
                            </FormGroup>
                        </div>
                        <div className="form-group mb-3 col-md-6">
                            <FormGroup>
                            <Label for="">note</Label>
                            <Input
                                type="textarea"
                                name="note"
                                id="note"
                                value={objValues.note}
                                onChange={handleInputChange}
                                style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
                                disabled={props.activeContent.actionType==='update'? false : true}
                            />
                            </FormGroup>
                        </div>
                        
                    </div>
                    <br />
                {props.activeContent.actionType==='update' ? (
                        <MatButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            style={{backgroundColor:"#014d88"}}
                            disabled={objValues.dateOfEac1==="" ? true : false}
                            >
                            {!saving ? (
                            <span style={{ textTransform: "capitalize" }}>Update</span>
                            ) : (
                            <span style={{ textTransform: "capitalize" }}>Updating...</span>
                            )}
                        </MatButton>
                        ): ""
                }
                    </form>
                </CardBody>
            </Card>                    
        </div>
  );
}

export default EAC;

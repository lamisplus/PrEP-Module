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

const PrEPEligibiltyScreeningForm = (props) => {

    const patientObj = props.patientObj;
    let history = useHistory();
    const classes = useStyles()
    const [objValues, setObjValues] = useState({
        eligibilityScreeningClientName: "",
        eligibilityScreeningDateVisit: "",
        eligibilityScreeningDob: "",
        eligibilityScreeningOccupation: "",
        personId: patientObj.id,
        prepClientId: props.prepId
      });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {         

      }, []);
    const handleInputChange = e => {        
        setObjValues ({...objValues,  [e.target.name]: e.target.value});

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

          setSaving(true);
          axios.put(`${baseUrl}prep/${props.prepId}/eligibility-screening`,objValues,
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

  return (      
      <div>                   
        <Card >
            <CardBody>
            <form >
                <div className="row">
                    <h2>PrEP Eligibilty Screening Form</h2>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Client Name * </Label>
                        <Input
                            type="text"
                            name="eligibilityScreeningClientName"
                            id="eligibilityScreeningClientName"
                            onChange={handleInputChange}
                            value={objValues.eligibilityScreeningClientName}
                            required
                        />
                        
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Age * </Label>
                        <Input
                            type="number"
                            name="eligibilityScreeningDob"
                            id="eligibilityScreeningDob"
                            onChange={handleInputChange}
                            value={objValues.eligibilityScreeningDob}
                            required
                        />
                        
                        </FormGroup>
                    </div>
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label >Date Of Visit *</Label>
                        <Input
                            className="form-control"
                            type="date"
                            name="eligibilityScreeningDateVisit"
                            id="eligibilityScreeningDateVisit"
                            //min="1983-12-31"
                            max= {moment(new Date()).format("YYYY-MM-DD") }
                            value={objValues.eligibilityScreeningDateVisit}
                            onChange={handleInputChange}
                            style={{border: "1px solid #014D88", borderRadius:"0.2rem"}}
                        />
                            
                        </FormGroup>
                    </div>
                    {/* <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="uniqueId">Education Level </Label>
                        <Input
                            type="text"
                            name="uniqueId"
                            id="uniqueId"
                            onChange={handleInputChange}
                            value={objValues.uniqueId}
                            required
                        />
                        
                        </FormGroup>
                    </div> */}
                    <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                        <Label for="eligibilityScreeningOccupation">Occupation </Label>
                        <Input
                            type="text"
                            name="eligibilityScreeningOccupation"
                            id="eligibilityScreeningOccupation"
                            onChange={handleInputChange}
                            value={objValues.eligibilityScreeningOccupation}
                            required
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

export default PrEPEligibiltyScreeningForm;

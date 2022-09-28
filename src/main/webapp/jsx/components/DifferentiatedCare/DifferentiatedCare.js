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
import { url as baseUrl } from "../../../api";
import { token as token } from "../../../api";
import { useHistory } from "react-router-dom";
import {  Modal, Button } from "react-bootstrap";
import "react-widgets/dist/css/react-widgets.css";
import { DateTimePicker } from "react-widgets";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
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

const ArtCommencement = (props) => {

    const patientObj = props.patientObj;
    let history = useHistory();
    const classes = useStyles()
    const [transferStatus, setTransferStatus] = useState([])
    const [values, setValues] = useState([]);
    const [objValues, setObjValues] = useState({patient_id: "",current_status:""});
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        patients()
      }, []);
        ///GET LIST OF Patients
        async function patients() {
            axios
                .get(`${baseUrl}covid/patientstatus/current-status-codeset`,
                { headers: {"Authorization" : `Bearer ${token}`} }
                )
                .then((response) => {
                    
                    setTransferStatus(response.data);
                    //setValues(response.data)
                })
                .catch((error) => {    
                });        
        }
        const handleInputChange = e => {
            setObjValues ({...objValues,  [e.target.name]: e.target.value});
          }
          
    /**** Submit Button Processing  */
    const handleSubmit = (e) => {        
        e.preventDefault();
        
          objValues.patient_id= patientObj.id

          setSaving(true);
          axios.post(`${baseUrl}covid/patientstatus`,objValues,
           { headers: {"Authorization" : `Bearer ${token}`}},
          
          )
              .then(response => {
                  setSaving(false);
                  toast.success("Transfer successful");
                  props.toggle()
                  props.loadPatients()
                  //history.push("/")

              })
              .catch(error => {
                  setSaving(false);
                  toast.error("Something went wrong");
              });
          
    }

  return (      
      <div >
         
              <Modal show={props.showModal} toggle={props.toggle} className="fade" size="xl">
             <Modal.Header toggle={props.toggle} style={{backgroundColor:"#eeeeee"}}>
                 Differentiated Care - <b>{patientObj.firstname + " " + patientObj.surname }</b>
                 <Button
                    variant=""
                    className="btn-close"
                    onClick={props.toggle}
                ></Button>
            </Modal.Header>
                <Modal.Body>                   
                        <Card >
                            <CardBody>
                            <form >
                                <div className="row">
                                
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label for="participant_id">Date of Devolvement  * </Label>
                                        <Input
                                            type="text"
                                            name="participant_id"
                                            id="participant_id"
                                            onChange={handleInputChange}
                                            value={values.participant_id}
                                            required
                                        />
                                        {errors.participant_id !=="" ? (
                                            <span className={classes.error}>{errors.participant_id}</span>
                                        ) : "" }
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label for="participant_id">Type of DMOC </Label>
                                        <DateTimePicker
                                            time={false}
                                            name="dateRegistration"
                                            id="dateRegistration"
                                            value={values.regDate}
                                            onChange={value1 =>
                                                setValues({ ...values, dob: moment(value1).format("YYYY-MM-DD") })
                                            }
                                            
                                                max={new Date()}
                                        />
                                        {errors.participant_id !=="" ? (
                                            <span className={classes.error}>{errors.participant_id}</span>
                                        ) : "" }
                                        </FormGroup>
                                    </div>
                              
                                    <div className="form-group mb-3 col-md-4">
                                    <FormGroup>
                                    <Label for="first_name">Type of Scripting</Label>
                                    <Input
                                        type="text"
                                        name="first_name"
                                        id="first_name"
                                        onChange={handleInputChange}
                                        value={values.first_name}
                                        required
                                    />
                                    {errors.first_name !=="" ? (
                                            <span className={classes.error}>{errors.first_name}</span>
                                        ) : "" }
                                    </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                    <FormGroup>
                                    <Label >Viral Load Assessment done </Label>
                                    <Input
                                        type="text"
                                        name="mid_name"
                                        id="mid_name"
                                        onChange={handleInputChange}
                                        value={values.mid_name}
                                        required
                                    />
                                    </FormGroup>
                                    </div>
                                    
                                    <div className="form-group mb-3 col-md-4">
                                    <FormGroup>
                                    <Label >CD4 Count Assessment Done</Label>
                                    <Input
                                        type="text"
                                        name="last_name"
                                        id="last_name"
                                        onChange={handleInputChange}
                                        value={values.last_name}
                                        required
                                    />
                                    {errors.last_name !=="" ? (
                                            <span className={classes.error}>{errors.last_name}</span>
                                        ) : "" }
                                    </FormGroup>
                                    </div>
                                
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Current Viral Load</Label>
                                        <DateTimePicker
                                            time={false}
                                            name="dateRegistration"
                                            id="dateRegistration"
                                            value={values.regDate}
                                            onChange={value1 =>
                                                setValues({ ...values, dob: moment(value1).format("YYYY-MM-DD") })
                                            }
                                            
                                                max={new Date()}
                                        />
                                            {values.dob ==="Invalid date" ? (
                                                <span className={classes.error}>{"This field is required"}</span>
                                            ) : "" }
                                            {errors.dob !=="" ? (
                                            <span className={classes.error}>{errors.dob}</span>
                                        ) : "" }
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Date of Viral Load</Label>
                                        <Input
                                            type="select"
                                            name="gender"
                                            id="gender"
                                            value={values.gender}
                                            onChange={handleInputChange}
                                            required
                                            >
                                            <option value=""> Please Select</option>
                                            <option value="1"> Male</option>
                                            <option value="2"> Female</option>
                                        </Input>
                                        {errors.gender !=="" ? (
                                            <span className={classes.error}>{errors.gender}</span>
                                        ) : "" }
                                        </FormGroup>
                                    </div>
                                    
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Current CD4</Label>
                                        <Input
                                            type="number"
                                            name="phone"
                                            id="phone"
                                            onChange={handleInputChange}
                                            value={values.phone}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Date of CD4</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Current Clinical Stage</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                   
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Date of Clinical Stage</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >ARV Regimen</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Date of Next ARV Refill</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        <FormGroup>
                                        <Label >Date of next Clinic/Lab re-eveluation</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-4">
                                        {/* <FormGroup>
                                        <Label >LMP</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup> */}
                                    </div>
                                    <div className="form-group mb-3 col-md-12">
                                        <FormGroup>
                                        <Input
                                            type="checkbox"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                            className="ms-3"
                                        />
                                        <Label >Click to fill form if patient discontinued DEMOC</Label>
                                        
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Date Discontinued</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
                                            required
                                        />
                                        </FormGroup>
                                    </div>
                                    <div className="form-group mb-3 col-md-6">
                                        <FormGroup>
                                        <Label >Reason for discontinued</Label>
                                        <Input
                                            type="select"
                                            name="address"
                                            id="address"
                                            onChange={handleInputChange}
                                            value={values.address}
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
                                
                            >
                                <span style={{ textTransform: "capitalize" }}>Cancel</span>
                            </MatButton>
                          
                                </form>
                            </CardBody>
                        </Card> 
                    </Modal.Body>
        
      </Modal>
    </div>
  );
}

export default ArtCommencement;

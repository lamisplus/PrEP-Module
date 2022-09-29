import React, {useState} from 'react';
import { Card,CardBody, FormGroup, Label,
        Input,
} from 'reactstrap';
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

const StopEAC = (props) => {

    //const patientObj = props.patientObj;
    const classes = useStyles()
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    let temp = { ...errors }

    const [objValues, setObjValues] = useState({
                                                id:props.eacObj.id,
                                                reason: "",
                                                });


        const handleInputChange = e => {
            setErrors({...temp, [e.target.name]:""})
            setObjValues ({...objValues,  [e.target.name]: e.target.value});
               
        }
        //FORM VALIDATION
        const validate = () => {
            //temp.visitDate = objValues.visitDate ? "" : "This field is required"
            setErrors({
                ...temp
                })    
            return Object.values(temp).every(x => x == "")
        }

        /**** Submit Button Processing  */
        const handleSubmit = (e) => {                  
            e.preventDefault(); 
            if(validate()){ 
            
            setSaving(true);
            axios.put(`${baseUrl}hiv/eac/stop/${props.eacObj.id}`,objValues,
            { headers: {"Authorization" : `Bearer ${token}`}},
            
            )
              .then(response => {
                  setSaving(false);
                  //props.setArt(true)
                  //props.patientObj.commenced=true
                  toast.success("EAC stop successful");
                  props.toggle()
                  props.setActiveContent({...props.activeContent, route:'counseling', activeTab:"home"})

              })
              .catch(error => {
                  setSaving(false);
                  if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    toast.error(errorMessage);
                    props.toggle()
                    //props.setActiveContent({...props.activeContent, route:'counseling', activeTab:"home"})
                  }
                  else{
                    toast.error("Something went wrong. Please try again...");
                    props.toggle()
                    //props.setActiveContent({...props.activeContent, route:'counseling', activeTab:"home"})
                  }
              });
            }
          
        }

        

  return (      
      <div >
         
              <Modal show={props.showModal} toggle={props.toggle} className="fade" size="lg">
             <Modal.Header toggle={props.toggle} style={{backgroundColor:"#014d88"}}>
                <span  style={{color:"#fff"}}> STOP EAC </span>
                 <Button
                    variant=""
                    className="btn-close"
                    onClick={props.toggle}
                    style={{color:'#fff', backgroundColor:'#fff'}}
                ></Button>
            </Modal.Header>
                <Modal.Body>                   
                        <Card >
                            <CardBody>
                            <form >
                                <div className="row">
                                    <div className="form-group mb-3 col-md-12">
                                        <FormGroup>
                                        <Label >Reason to stop EAC</Label>
                                        <Input
                                            type="textarea"
                                            name="reason"
                                            rows="5" cols="100"
                                            id="reason"
                                            onChange={handleInputChange}
                                            value={objValues.reason}
                                            style={{border: "1px solid #014D88", borderRadius:"0.25rem"}}
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
                                style={{backgroundColor:"#014d88"}}
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
                                    startIcon={<CancelIcon style={{color:'#fff'}}/>}  
                                    style={{backgroundColor:'#992E62'}} 
                                    onClick={props.toggle}                             
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

export default StopEAC;

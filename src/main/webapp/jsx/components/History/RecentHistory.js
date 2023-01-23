import React, { Fragment, useState, useEffect } from "react";
// BS
import { Dropdown,} from "react-bootstrap";
/// Scroll
import { makeStyles } from '@material-ui/core/styles';
import PerfectScrollbar from "react-perfect-scrollbar";
//import { Link } from "react-router-dom";
import axios from "axios";
import { url as baseUrl, token } from "../../../api";
//import { Alert } from "react-bootstrap";
import {  Card,Accordion } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "react-widgets/dist/css/react-widgets.css";
import { toast} from "react-toastify";
import PatientChart from './../Patient/PatientChart/Index'

const useStyles = makeStyles((theme) => ({
  root: {
      width: '100%',
  },
  heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: 'bolder',
  },
}));
const RecentHistory = (props) => {
  //console.log(props.patientObj)
  const [recentActivities, setRecentActivities] = useState([])
  //const [loading, setLoading] = useState(true)
  let history = useHistory();
  const [
    activeAccordionHeaderShadow,
    setActiveAccordionHeaderShadow,
  ] = useState(0);

  useEffect(() => {

    RecentActivities();
  }, [props.patientObj.personId]);

  //Get list of LaboratoryHistory
  const RecentActivities =()=>{
    axios
       .get(`${baseUrl}prep/activities/patients/${props.patientObj.personId}?full=true`,
           { headers: {"Authorization" : `Bearer ${token}`} }
       )
       .then((response) => {
          setRecentActivities(response.data[0].activities)
       })
       .catch((error) => {
       //console.log(error);
       });
   
  }


  const labStatus =(status)=> {
      if(status===0){
        return "timeline-badge info"
      }else if(status===1){
        return "timeline-badge warning"
      }else if(status===2){
        return "timeline-badge success"
      }else if(status===3){
        return "timeline-badge danger"
      }else if(status===4){
        return "timeline-badge primary"
      }else if(status===5){
        return "timeline-badge info"
      }else {
        return "timeline-badge secondary"
      }
  }
  const ActivityName =(name)=> {
      if(name==='HIV Enrollment'){
        return "HE"
      }else if(name==='Pharmacy refill'){
        return "PR"
      }else if(name==='Clinical evaluation'){
        return "CE"
      }else if(name==='Clinic visit follow up'){
        return "CV"
      }else if(name==='ART Commencement'){
        return "AC"
      }else {
        return "RA"
      }
  }

  const LoadViewPage =(row,action)=>{
        
    if(row.path==='Mental-health'){        
        props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id, actionType:action})

    }else if(row.path==='Art-commence'){
        props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id, actionType:action})

    }else if(row.path==='Clinical-evaluation'){
        props.setActiveContent({...props.activeContent, route:'adult-clinic-eveluation-view', id:row.id, actionType:action})

    }else if(row.path==='eac1'){
        props.setActiveContent({...props.activeContent, route:'first-eac-history', id:row.id, actionType:action})
    }
    else if(row.path==='eac2'){
        props.setActiveContent({...props.activeContent, route:'second-eac-history', id:row.id, actionType:action})
    }
    else if(row.path==='eac3'){
        props.setActiveContent({...props.activeContent, route:'completed-eac-history', id:row.id, actionType:action})
    }else if(row.path==='hiv-enrollment'){
        history.push({
            pathname: '/update-patient',
            state: { id: row.id, patientObj:props.patientObj, actionType:action }
        });
        //props.setActiveContent({...props.activeContent, route:'mental-health-history', id:row.id})
    }else if(row.path==='pharmacy'){
        //props.setActiveContent({...props.activeContent, route:'mental-health-history', id:row.id})
        props.setActiveContent({...props.activeContent, route:'pharmacy-update', id:row.id, activeTab:"history", actionType:action, obj:row})

    }else if(row.path==='Laboratory'){
        props.setActiveContent({...props.activeContent, route:'mental-health-history', id:row.id, actionType:action})

    }else if(row.path==='clinic-visit'){
      props.setActiveContent({...props.activeContent, route:'consultation', id:row.id, activeTab:"history",actionType:action, })

  }else{

    }
    
  }
  const LoadDeletePage =(row)=>{
      
      if(row.path==='Mental-health'){        
          //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
          axios
          .delete(`${baseUrl}observation/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });  
      }else if(row.path==='Art-commence'){
          //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
          axios
          .delete(`${baseUrl}hiv/art/commencement/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });

      }else if(row.path==='Clinical-evaluation'){
          //props.setActiveContent({...props.activeContent, route:'adult-clinic-eveluation-view', id:row.id})
          axios
          .delete(`${baseUrl}observation/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });

      }else if(row.path==='eac1'){
          //props.setActiveContent({...props.activeContent, route:'first-eac-history', id:row.id})
          axios
          .delete(`${baseUrl}observation/eac/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });  
      }
      else if(row.path==='eac2'){
          //props.setActiveContent({...props.activeContent, route:'second-eac-history', id:row.id})
          axios
          .delete(`${baseUrl}observation/eac/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });  
      }
      else if(row.path==='eac3'){
          //props.setActiveContent({...props.activeContent, route:'completed-eac-history', id:row.id})
          axios
          .delete(`${baseUrl}observation/eac/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });  
      }else if(row.path==='hiv-enrollment'){
          axios
          .delete(`${baseUrl}hiv/enrollment/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          });  
          //props.setActiveContent({...props.activeContent, route:'mental-health-history', id:row.id})
      }else if(row.path==='pharmacy'){
          //props.setActiveContent({...props.activeContent, route:'mental-health-history', id:row.id})
          //props.setActiveContent({...props.activeContent, route:'pharmacy', id:row.id, activeTab:"home", actionType:"update", obj:row})
          axios
          .delete(`${baseUrl}art/pharmacy/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          }); 

      }else if(row.path==='clinic-visit'){
          //props.setActiveContent({...props.activeContent, route:'mental-health-history', id:row.id})
          axios
          .delete(`${baseUrl}hiv/art/clinic-visit/${row.id}`,
              { headers: {"Authorization" : `Bearer ${token}`} }
          )
          .then((response) => {
              toast.success("Record Deleted Successfully");
              RecentActivities()
          })
          .catch((error) => {
              if(error.response && error.response.data){
                  let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                  toast.error(errorMessage);
                }
                else{
                  toast.error("Something went wrong. Please try again...");
                }
          }); 
      }else{

      }
      
  }
  const redirectLink=()=>{
    props.setActiveContent({...props.activeContent, route:'recent-history'})
  }
  const index= 1

  return (
    <Fragment>
      {/* <Ext /> */}
     
      <div className="row">
      <div className="col-xl-4 col-xxl-4 col-lg-4">
          <div className="card">
            <div className="card-header  border-0 pb-0" >
              <h4 className="card-title"> Recent Activities</h4>
            </div>
            <div className="card-body">
              <PerfectScrollbar
                style={{ height: "370px" }}
                id="DZ_W_Todo1"
                className="widget-media dz-scroll ps ps--active-y"
              >
                <Accordion
                    className="accordion accordion-header-bg accordion-header-shadow accordion-rounded "
                    defaultActiveKey="0"
                  >
                    <>
                    {recentActivities.map((data, i)=>
                    <div className="accordion-item" key={i}>
                      <Accordion.Toggle
                          as={Card.Text}
                          eventKey={`${i}`}
                          className={`accordion-header ${
                            activeAccordionHeaderShadow === 1 ? "" : "collapsed"
                          } accordion-header-info`}
                          onClick={() =>
                            setActiveAccordionHeaderShadow(
                              activeAccordionHeaderShadow === 1 ? -1 : i
                            )
                          }
                      >
                      <span className="accordion-header-icon"></span>
                      <span className="accordion-header-text">Encounter Date : <span className="">{data.date}</span> </span>
                      <span className="accordion-header-indicator"></span>
                    </Accordion.Toggle>
                    <Accordion.Collapse
                      eventKey={`${i}`}
                      className="accordion__body"
                    >
                      <div className="accordion-body-text">
                      <ul className="timeline">

                            <li>
                              <div className="timeline-panel">
                              <div className={i % 2 == 0 ? "media me-2 media-info" : "media me-2 media-success"}>{ActivityName(data.name)}</div>
                              <div className="media-body">
                                <h5 className="mb-1">{data.name}</h5>
                                <small className="d-block">
                                {data.date}
                                </small>
                              </div>
                              <Dropdown className="dropdown">
                                <Dropdown.Toggle
                                variant=" light"
                                className="i-false p-0 btn-info sharp"
                                >
                                <svg
                                  width="18px"
                                  height="18px"
                                  viewBox="0 0 24 24"
                                  version="1.1"
                                >
                                  <g
                                  stroke="none"
                                  strokeWidth="1"
                                  fill="none"
                                  fillRule="evenodd"
                                  >
                                  <rect x="0" y="0" width="24" height="24" />
                                  <circle fill="#000000" cx="5" cy="12" r="2" />
                                  <circle fill="#000000" cx="12" cy="12" r="2" />
                                  <circle fill="#000000" cx="19" cy="12" r="2" />
                                  </g>
                                </svg>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu">
                                {data.viewable && ( <Dropdown.Item
                                  className="dropdown-item"
                                  onClick={()=>LoadViewPage(data,'view')}
                                  >
                                  View
                                  </Dropdown.Item>
                                )}
                                {data.viewable && ( <Dropdown.Item
                                  className="dropdown-item"
                                  onClick={()=>LoadViewPage(data,'update')}
                                  >
                                  Update
                                  </Dropdown.Item>
                                )}
                                  {data.deletable && (<Dropdown.Item
                                  className="dropdown-item"
                                  to="/widget-basic"
                                  onClick={()=>LoadDeletePage(data)}
                                  >
                                  Delete
                                  </Dropdown.Item>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                              </div>
                            </li>
                                                   
                      </ul>
                      </div>
                    </Accordion.Collapse>
                  </div>
                )}
                </>
                </Accordion>
                
              </PerfectScrollbar>
            </div>
          </div>
      </div>
      <div className="col-xl-8 col-xxl-8 col-lg-8">
        <div className="card">
          <div className="card-header border-0  pb-2" style={{backgroundColor:"#EEEEEE"}}>
            <h4 className="card-title">Summary </h4>
          </div>
          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-6">
            <div className="card-body">
              <div className="col-xl-12 col-lg-12 col-sm-12">
              <div className="widget-stat card">
                <div className="card-body p-4" style={{backgroundColor:"#E8F0FD"}}>
                  <h4 className="card-title">Current Regimen Given</h4>
                  <h3 class="text-info ">TDF(300mg)+3TC(150mg)</h3>
                  <div className="progress mb-2">
                    <div
                      className="progress-bar progress-animated bg-primary"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <p class="text-success ">Next Appointment Date : 03/03/2023</p>
                </div>
              </div>
              </div>
              <div className="col-sm-12 col-md-12 col-lg-12">
                <div className="widget-stat card">
                  <div className="card-body p-4" >
                  <div className="media ai-icon">
                    <span className="me-3 bgl-primary text-primary">
                      <svg
                        id="icon-customers"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-user"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <div className="media-body">
                      <p className="mb-1" ><span style={{fontSize:"14px"}} >Total Visit :</span> <span className="badge badge-primary">4</span></p>
                      <p><span style={{fontSize:"10px", fontWeight:"bolder"}} >Last Visit Date : </span><span className="badge badge-dark">04/011/2022</span></p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-6">
            <div className="card-body">
                <PatientChart />
            </div>
            </div>
          </div>
        </div>
      </div>
     
 </div>
      
    </Fragment>
  );
};

export default RecentHistory;

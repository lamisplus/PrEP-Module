import React, { Fragment, useState, useEffect } from 'react';
// BS
import { Dropdown } from 'react-bootstrap';
/// Scroll
import { makeStyles } from '@material-ui/core/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
//import { Link } from "react-router-dom";
import axios from 'axios';
import { url as baseUrl, token } from '../../../api';
//import { Alert } from "react-bootstrap";
import { Card, Accordion } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import 'react-widgets/dist/css/react-widgets.css';
import { toast } from 'react-toastify';

import { Button } from 'semantic-ui-react';

const RecentHistory = props => {
  //console.log(props.patientObj)
  const [recentActivities, setRecentActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [record, setRecord] = useState(null);
  const toggle = () => setOpen(!open);
  const [activeAccordionHeaderShadow, setActiveAccordionHeaderShadow] =
    useState(0);

  useEffect(() => {
    Summary();
    RecentActivities();
  }, [props.patientObj.personId]);

  const RecentActivities = () => {
    axios
      .get(
        `${baseUrl}prep/activities/patients/${props.patientObj.personId}?full=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setRecentActivities(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const Summary = () => {
    axios
      .get(
        `${baseUrl}prep-clinic/person/${props.patientObj.personId}?full=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        console.log('sumry: ', response.data[0]);
        setSummary(response.data[0]);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  function countPrepEligibility(data) {
    let count = 0;
    let relevantActivities = ['Prep Commencement', 'Prep Clinic'];
    data.forEach(entry => {
      entry?.activities?.forEach(activity => {
        if (relevantActivities.includes(activity?.name)) {
          count++;
        }
      });
    });

    return count;
  }

  const ActivityName = name => {
    if (name === 'HIV Enrollment') {
      return 'HE';
    } else if (name === 'Prep Clinic') {
      return 'PC';
    } else if (name === 'Prep Enrollment') {
      return 'PE';
    } else if (name === 'Prep Eligibility') {
      return 'PE';
    } else if (name === 'ART Commencement') {
      return 'AC';
    } else {
      return 'RA';
    }
  };

  const LoadViewPage = (row, action) => {
    if (row.path === 'prep-eligibility') {
      props.setActiveContent({
        ...props.activeContent,
        route: 'prep-screening',
        id: row.id,
        actionType: action,
      });
    } else if (row.path === 'prep-enrollment') {
      props.setActiveContent({
        ...props.activeContent,
        route: 'prep-registration',
        id: row.id,
        actionType: action,
      });
    } else if (row.path === 'prep-clinic') {
      //prep-commencement
      props.setActiveContent({
        ...props.activeContent,
        route: 'consultation',
        id: row.id,
        actionType: action,
      });
    } else if (row.path === 'prep-commencement') {
      props.setActiveContent({
        ...props.activeContent,
        route: 'prep-commencement',
        id: row.id,
        actionType: action,
      });
    } else if (row.path === 'prep-interruption') {
      props.setActiveContent({
        ...props.activeContent,
        route: 'prep-interruptions',
        id: row.id,
        actionType: action,
      });
    } else {
    }
  };
  const LoadModal = row => {
    toggle();
    setRecord(row);
  };
  const LoadDeletePage = row => {
    if (row.path === 'prep-eligibility') {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-eligibility/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success('Record Deleted Successfully');
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ''
                ? error.response.data.apierror.message
                : 'Something went wrong, please try again';
            toast.error(errorMessage);
          } else {
            toast.error('Something went wrong. Please try again...');
          }
        });
    } else if (row.path === 'prep-clinic') {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-clinic/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success('Record Deleted Successfully');
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ''
                ? error.response.data.apierror.message
                : 'Something went wrong, please try again';
            toast.error(errorMessage);
          } else {
            toast.error('Something went wrong. Please try again...');
          }
        });
    } else if (row.path === 'prep-enrollment') {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-enrollment/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success('Record Deleted Successfully');
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ''
                ? error.response.data.apierror.message
                : 'Something went wrong, please try again';
            toast.error(errorMessage);
          } else {
            toast.error('Something went wrong. Please try again...');
          }
        });
    } else if (row.path === 'prep-commencement') {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-clinic/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success('Record Deleted Successfully');
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ''
                ? error.response.data.apierror.message
                : 'Something went wrong, please try again';
            toast.error(errorMessage);
          } else {
            toast.error('Something went wrong. Please try again...');
          }
        });
    } else if (row.path === 'prep-interruption') {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-interruption/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success('Record Deleted Successfully');
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          if (error.response && error.response.data) {
            let errorMessage =
              error.response.data.apierror &&
              error.response.data.apierror.message !== ''
                ? error.response.data.apierror.message
                : 'Something went wrong, please try again';
            toast.error(errorMessage);
          } else {
            toast.error('Something went wrong. Please try again...');
          }
        });
    } else {
    }
  };
  // const redirectLink=()=>{
  //   props.setActiveContent({...props.activeContent, route:'recent-history'})
  // }
  //const index= 1

  function joinActivities(data) {
    return data.reduce((acc, item) => {
      return acc.concat(item.activities);
    }, []);
  }
  return (
    <Fragment>
      {/* <Ext /> */}
      <div className="row">
        <div className="col-xl-4 col-xxl-4 col-lg-4">
          <div className="card">
            <div className="card-header  border-0 pb-0">
              <h4 className="card-title">Recent Activities</h4>
            </div>
            <div className="card-body">
              <PerfectScrollbar
                style={{ height: '370px' }}
                id="DZ_W_Todo1"
                className="widget-media dz-scroll ps ps--active-y"
              >
                <Accordion
                  className="accordion accordion-header-bg accordion-header-shadow accordion-rounded "
                  defaultActiveKey="0"
                >
                  <>
                    {recentActivities.map((data, i) => (
                      <div className="accordion-item" key={i}>
                        <Accordion.Toggle
                          as={Card.Text}
                          eventKey={`${i}`}
                          className={`accordion-header ${
                            activeAccordionHeaderShadow === 1 ? '' : 'collapsed'
                          } accordion-header-info`}
                          onClick={() =>
                            setActiveAccordionHeaderShadow(
                              activeAccordionHeaderShadow === 1 ? -1 : i
                            )
                          }
                        >
                          <span className="accordion-header-icon"></span>
                          <span className="accordion-header-text">
                            Encounter Date :{' '}
                            <span className="">{data.date}</span>{' '}
                          </span>
                          <span className="accordion-header-indicator"></span>
                        </Accordion.Toggle>
                        <Accordion.Collapse
                          eventKey={`${i}`}
                          className="accordion__body"
                        >
                          <div className="accordion-body-text">
                            <ul className="timeline">
                              {data.activities &&
                                data.activities.map((activity, index) => (
                                  <>
                                    <li key={activity + index}>
                                      <div className="timeline-panel">
                                        <div
                                          className={
                                            i % 2 == 0
                                              ? 'media me-2 media-info'
                                              : 'media me-2 media-success'
                                          }
                                        >
                                          {ActivityName(data.name)}
                                        </div>
                                        <div className="media-body">
                                          <h5 className="mb-1">
                                            {activity.name}
                                          </h5>
                                          <small className="d-block">
                                            {activity.date}
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
                                                <rect
                                                  x="0"
                                                  y="0"
                                                  width="24"
                                                  height="24"
                                                />
                                                <circle
                                                  fill="#000000"
                                                  cx="5"
                                                  cy="12"
                                                  r="2"
                                                />
                                                <circle
                                                  fill="#000000"
                                                  cx="12"
                                                  cy="12"
                                                  r="2"
                                                />
                                                <circle
                                                  fill="#000000"
                                                  cx="19"
                                                  cy="12"
                                                  r="2"
                                                />
                                              </g>
                                            </svg>
                                          </Dropdown.Toggle>
                                          <Dropdown.Menu className="dropdown-menu">
                                            <Dropdown.Item
                                              className="dropdown-item"
                                              onClick={() =>
                                                LoadViewPage(activity, 'view')
                                              }
                                            >
                                              View
                                            </Dropdown.Item>

                                            <Dropdown.Item
                                              className="dropdown-item"
                                              onClick={() =>
                                                LoadViewPage(activity, 'update')
                                              }
                                            >
                                              Update
                                            </Dropdown.Item>

                                            <Dropdown.Item
                                              className="dropdown-item"
                                              to="/widget-basic"
                                              onClick={() =>
                                                LoadModal(activity)
                                              }
                                            >
                                              Delete
                                            </Dropdown.Item>
                                          </Dropdown.Menu>
                                        </Dropdown>
                                      </div>
                                    </li>
                                  </>
                                ))}
                            </ul>
                          </div>
                        </Accordion.Collapse>
                      </div>
                    ))}
                  </>
                </Accordion>
              </PerfectScrollbar>
            </div>
          </div>
        </div>
        <div className="col-xl-8 col-xxl-8 col-lg-8">
          <div className="card">
            <div
              className="card-header border-0  pb-2"
              style={{ backgroundColor: '#EEEEEE' }}
            >
              <h4 className="card-title">Summary </h4>
            </div>
            <div className="row">
              {
                <>
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    <div className="card-body">
                      <div className="col-sm-12 col-md-12 col-lg-12">
                        <div className="card overflow-hidden">
                          <div className="social-graph-wrapper widget-facebook">
                            <span className="s-icon">
                              <span style={{ fontSize: '16px' }}>
                                Total Clinic Visit :{' '}
                                {countPrepEligibility(recentActivities)}
                              </span>
                            </span>
                          </div>
                          <div className="row">
                            <div className="col-6 border-right">
                              <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                                <h4 className="m-1">
                                  <span className="counter">
                                    <b>{summary?.encounterDate}</b>
                                  </span>
                                </h4>
                                {summary && (
                                  <p className="m-0">
                                    <b>Last Visit </b>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                                <h4 className="m-1">
                                  <span className="counter">
                                    <b>{summary?.nextAppointment}</b>
                                  </span>
                                </h4>
                                {summary && (
                                  <p className="m-0">
                                    <b>Next Visit</b>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-12 col-lg-12 col-sm-12">
                        <div className="widget-stat card">
                          <div
                            className="card-body p-4"
                            style={{ backgroundColor: '#fff' }}
                          >
                            <h4
                              className="card-title"
                              style={{ fontSize: '15px' }}
                            >
                              <b>Current Regimen Given</b>
                            </h4>
                            <h4 class="text-info ">
                              {summary ? summary?.regimen : 'NIL'}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    <div className="card-body">
                      <div className="card overflow-hidden">
                        <div className="social-graph-wrapper widget-linkedin">
                          <span className="s-icon">
                            <span style={{ fontSize: '16px' }}>
                              {
                                <>
                                  BMI :{' '}
                                  {summary
                                    ? (
                                        summary?.weight /
                                        ((summary?.height / 100) *
                                          (summary?.height / 100))
                                      ).toFixed(2)
                                    : 'NIL'}{' '}
                                  {summary && (
                                    <>
                                      kg/m<sup>2</sup>
                                      <span></span>
                                    </>
                                  )}
                                </>
                              }
                            </span>
                          </span>
                        </div>
                        <div className="row">
                          <div className="col-6 border-right">
                            <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                              {summary && (
                                <>
                                  <h4 className="m-1">
                                    <span className="counter">
                                      {summary ? summary.weight : '0'} Kg
                                    </span>
                                  </h4>
                                  <p className="m-0">
                                    <b>Weight </b>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="pt-3 pb-3 ps-0 pe-0 text-center">
                              {summary && (
                                <>
                                  <h4 className="m-1">
                                    <span className="counter">
                                      {summary ? summary.height : '0'} cm
                                    </span>
                                  </h4>
                                  <p className="m-0">
                                    <b>Height </b>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              }
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            Are you Sure you want to delete <b>{record && record.name}</b>
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => LoadDeletePage(record)}
            style={{ backgroundColor: 'red', color: '#fff' }}
            disabled={saving}
          >
            {saving === false ? 'Yes' : 'Deleting...'}
          </Button>
          <Button
            onClick={toggle}
            style={{ backgroundColor: '#014d88', color: '#fff' }}
            disabled={saving}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default RecentHistory;

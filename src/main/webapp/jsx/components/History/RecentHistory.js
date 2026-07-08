import React, { Fragment, useState, useEffect } from "react";
// BS
import { Dropdown } from "react-bootstrap";
/// Scroll
import { makeStyles } from "@material-ui/core/styles";
import PerfectScrollbar from "react-perfect-scrollbar";
//import { Link } from "react-router-dom";
import axios from "axios";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
import { url as baseUrl, token } from "../../../api";
import { ENROLLMENT_TYPE_PREP, ENROLLMENT_TYPE_PEP } from "../../constants/enrollmentType";
//import { Alert } from "react-bootstrap";
import { Card, Accordion } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import "react-widgets/dist/css/react-widgets.css";
import { toast } from "react-toastify";

import { Button } from "semantic-ui-react";

import { displayRegimen } from "../../../Utils/regimenDisplay";
import useRegimenLookup from "../../../hooks/useRegimenLookup";

const RecentHistory = props => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summarySource, setSummarySource] = useState(null); // "prep" or "pep"
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [record, setRecord] = useState(null);
  const toggle = () => setOpen(!open);
  const [activeAccordionHeaderShadow, setActiveAccordionHeaderShadow] =
    useState(0);
  // Live PREP_REGIMEN + PEP_REGIMEN codesets keyed by row id, so the
  // Current Regimen chip renders the display name regardless of whether
  // the value persisted on the record is the canonical code or a legacy
  // codeset row id.
  const { idMap: regimenById } = useRegimenLookup();

  useEffect(() => {
    Summary();
    RecentActivities();
  }, [props?.patientObj?.personId]);

  const RecentActivities = () => {
    axios
      .get(
        `${baseUrl}prep/activities/patients/${
          props.patientObj.personId || props.patientObj.id
        }?full=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setRecentActivities(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };
  console.log("props.patientObj recent history: ", props.patientObj.id);
  const Summary = () => {
    // Person UUID (stable on every grid row) keys all these reads now — the
    // bigint person id could be stale/absent and 404 the person lookup.
    const personUuid = props.patientObj.personUuid || props.patientObj.uuid;
    const headers = { Authorization: `Bearer ${token}` };

    // Pull the latest PrEP/PEP follow-up visit AND the latest PrEP/PEP initiation.
    // Summary is built from the latest of all four — falling back to the initiation
    // when no follow-up exists, and merging fields so a missing weight/regimen on
    // the latest follow-up is still served from the initiation.
    Promise.all([
      axios.get(`${baseUrl}prep-followup-visit/person/${personUuid}?full=true`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${baseUrl}pep-followup-visit/person/${personUuid}?full=true`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${baseUrl}prep/initiation/latest/${personUuid}?enrollmentType=${ENROLLMENT_TYPE_PREP}`, { headers }).catch(() => ({ data: {} })),
      axios.get(`${baseUrl}prep/initiation/latest/${personUuid}?enrollmentType=${ENROLLMENT_TYPE_PEP}`, { headers }).catch(() => ({ data: {} })),
    ]).then(([prepFollowupRes, pepFollowupRes, prepInitRes, pepInitRes]) => {
      const prepVisit = prepFollowupRes.data[0];
      const pepVisit = pepFollowupRes.data[0];
      const prepInit = prepInitRes.data && prepInitRes.data.uuid ? prepInitRes.data : null;
      const pepInit = pepInitRes.data && pepInitRes.data.uuid ? pepInitRes.data : null;

      // Fall back to initiation values for any field the follow-up didn't capture.
      const prepBlend = prepVisit
        ? { ...(prepInit || {}), ...prepVisit, encounterDate: prepVisit.encounterDate }
        : prepInit
        ? { ...prepInit, encounterDate: prepInit.dateEnrolled }
        : null;
      const pepBlend = pepVisit
        ? { ...(pepInit || {}), ...pepVisit, encounterDate: pepVisit.encounterDate }
        : pepInit
        ? { ...pepInit, encounterDate: pepInit.dateEnrolled }
        : null;

      const prepDate = prepBlend?.encounterDate ? new Date(prepBlend.encounterDate) : null;
      const pepDate = pepBlend?.encounterDate ? new Date(pepBlend.encounterDate) : null;

      if (prepBlend && pepBlend) {
        const pepIsNewer = pepDate > prepDate;
        setSummary(pepIsNewer ? pepBlend : prepBlend);
        setSummarySource(pepIsNewer ? "pep" : "prep");
      } else if (pepBlend) {
        setSummary(pepBlend);
        setSummarySource("pep");
      } else if (prepBlend) {
        setSummary(prepBlend);
        setSummarySource("prep");
      } else {
        setSummary(null);
        setSummarySource(null);
      }
    });
  };

  function countPrepEligibility(data) {
    let count = 0;
    let relevantActivities = [
      "Prep Commencement", "Prep Clinic", "PEP Clinic",
      "PrEP Initiation", "PEP Initiation",
      "PrEP Discontinuation/Interruption", "PEP Completion"
    ];
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
    if (name === "HIV Enrollment") {
      return "HE";
    } else if (name === "Prep Clinic") {
      return "PC";
    } else if (name === "PEP Clinic") {
      return "PPC";
    } else if (name === "PrEP Initiation" || name === "Prep Enrollment" || name === "PrEP & PEP Initiation") {
      return "PI";
    } else if (name === "PEP Initiation") {
      return "PPI";
    } else if (name === "PrEP Eligibility Screening" || name === "PEP Eligibility Screening" || name === "Prep Eligibility") {
      return "PE";
    } else if (name === "ART Commencement" || name === "Prep Commencement") {
      return "AC";
    } else if (name === "PrEP Discontinuation/Interruption") {
      return "PD";
    } else if (name === "PEP Completion") {
      return "PPC";
    } else {
      return "RA";
    }
  };

  const LoadViewPage = (row, action) => {
    if (row.path === "prep-eligibility-screening") {
      props.setActiveContent({
        ...props.activeContent,
        route: "prep-screening",
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "prep-pep-initiation") {
      props.setActiveContent({
        ...props.activeContent,
        route: "prep-registration",
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "prep-followup-visit" || row.path === "prep-commencement") {
      // Legacy "PrEP Commencement" records live in the same prep_followup_visit
      // table as regular follow-up visits (the standalone commencement form was
      // removed). Route both to the consultation (PrEP follow-up) view so old
      // commencement records can still be viewed/edited instead of rendering a
      // missing component.
      props.setActiveContent({
        ...props.activeContent,
        route: "consultation",
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "pep-followup-visit") {
      props.setActiveContent({
        ...props.activeContent,
        route: "pep-followup",
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "prep-completion") {
      props.setActiveContent({
        ...props.activeContent,
        route: "prep-interruptions",
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
    if (row.path === "prep-eligibility-screening") {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-eligibility-screening/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-followup-visit") {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-followup-visit/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-pep-initiation") {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-pep-initiation/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "pep-followup-visit") {
      setSaving(true);
      axios
        .delete(`${baseUrl}pep-followup-visit/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-commencement") {
      setSaving(true);
      axios
        .delete(`${baseUrl}prep-followup-visit/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-completion") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-completion/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          RecentActivities();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
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
                style={{ height: "370px" }}
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
                            activeAccordionHeaderShadow === 1 ? "" : "collapsed"
                          } accordion-header-info`}
                          onClick={() =>
                            setActiveAccordionHeaderShadow(
                              activeAccordionHeaderShadow === 1 ? -1 : i
                            )
                          }
                        >
                          <span className="accordion-header-icon"></span>
                          <span className="accordion-header-text">
                            Encounter Date :{" "}
                            <span className="">{data.date}</span>{" "}
                          </span>
                          <span className="accordion-header-indicator"></span>
                        </Accordion.Toggle>
                        <Accordion.Collapse
                          eventKey={`${i}`}
                          className="accordion__body"
                        >
                          <div className="accordion-body-text">
                            <ul className="timeline">
                              {data?.activities &&
                                data?.activities.map((activity, index) => (
                                  <li key={activity.id}>
                                    <div className="timeline-panel">
                                      <div
                                        key={0}
                                        className={
                                          index % 2 === 0
                                            ? "media me-2 media-info"
                                            : "media me-2 media-success"
                                        }
                                      >
                                        {ActivityName(activity.name)}
                                      </div>
                                      <div key={1} className="media-body">
                                        <h5 className="mb-1">
                                          {activity.name}
                                        </h5>
                                        <small className="d-block">
                                          {activity.date}
                                        </small>
                                      </div>
                                      <Dropdown className="dropdown">
                                        <Dropdown.Toggle
                                          variant="light"
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
                                              LoadViewPage(activity, "view")
                                            }
                                          >
                                            View
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            className="dropdown-item"
                                            onClick={() =>
                                              LoadViewPage(activity, "update")
                                            }
                                          >
                                            Update
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            className="dropdown-item"
                                            to="/widget-basic"
                                            onClick={() => LoadModal(activity)}
                                          >
                                            Delete
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    </div>
                                  </li>
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
              style={{ backgroundColor: "#EEEEEE" }}
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
                              <span style={{ fontSize: "16px" }}>
                                Total Clinic Visit :{" "}
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
                            style={{ backgroundColor: "#fff" }}
                          >
                            <h4
                              className="card-title"
                              style={{ fontSize: "15px" }}
                            >
                              <b>Current Regimen Given</b>
                            </h4>
                            <h4 className="text-info ">
                              {summary
                                ? displayRegimen(summary?.regimen, regimenById) ||
                                  displayRegimen(summary?.pepRegimen, regimenById) ||
                                  displayRegimen(summary?.prepRegimen, regimenById) ||
                                  displayRegimen(summary?.regimenId, regimenById) ||
                                  "NIL"
                                : "NIL"}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-6">
                    <div className="card-body">
                      <div className="card overflow-hidden">
                        <>
                          <div className="social-graph-wrapper widget-linkedin">
                            <span className="s-icon">
                              <span style={{ fontSize: "16px" }}>
                                BMI :{" "}
                                {/* Same formula as the initiation form: height is
                                    captured in cm, BMI = weight(kg) / height(m)^2. */}
                                {summary && summary.weight && summary.height
                                  ? (
                                      Number(summary.weight) /
                                      (Number(summary.height) / 100) ** 2
                                    ).toFixed(2)
                                  : "NIL"}{" "}
                                {summary && summary.weight && summary.height && (
                                  <>
                                    kg/cm<sup>2</sup>
                                  </>
                                )}
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
                                        {summary ? summary.weight : "0"} Kg
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
                                        {summary ? summary.height : "0"} cm
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
                        </>
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
            style={{ backgroundColor: "red", color: "#fff" }}
            disabled={saving}
          >
            {saving === false ? "Yes" : "Deleting..."}
          </Button>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
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

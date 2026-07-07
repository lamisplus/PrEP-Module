import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import { Link } from "react-router-dom";
import ButtonMui from "@material-ui/core/Button";
import { TiArrowBack } from "react-icons/ti";
import Divider from "@material-ui/core/Divider";
import { Label } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { Col, Row } from "reactstrap";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import moment from "moment";
import Typography from "@material-ui/core/Typography";
import { AccordionSummary } from "@material-ui/core";
import { Alert as Reminder } from "../Consultation/Alert/Alert";
import { useGetAddress } from "../../../hooks/patientCard/useGetAddress";
import useGetPhoneNumber from "../../../hooks/patientCard/useGetPhoneNumber";
import useCalculateAge from "../../../hooks/patientCard/useCalculateAge";
import useGetReminderAlert from "../../../hooks/patientCard/useGetReminderAlert";
import useBasicPatientDetails from "../../../hooks/patientCard/useBasicPatientDetails";
import {
  isTargetDetected,
  viralLoadDisplay,
} from "../../constants/viralLoad";
Moment.locale("en");
momentLocalizer();

const styles = theme => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  column: {
    flexBasis: "20.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing}px ${theme.spacing(2)}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

function PatientCard(props) {
  const { classes } = props;
  const { patientObj, patientDetail } = props;

  const { getAddress } = useGetAddress();
  const { getPhoneNumber } = useGetPhoneNumber();
  const { calculateAge } = useCalculateAge();
  const { getReminderAlert } = useGetReminderAlert();
  const { getSex, getUniqueId, getDateOfBirth, getFirstName, getSurname } =
    useBasicPatientDetails();
  const [showReminder, setShowReminder] = useState(0);
  const toggleModal = () => setShowReminder(0);
  const genderRaw =
    patientObj?.gender || patientObj?.sex || getSex(patientDetail);
  const isFemale = (genderRaw || "").toLowerCase() === "female";

  useEffect(() => {
    setShowReminder(getReminderAlert(parseInt(patientObj?.sendCabLaAlert)));
  }, []);

  return (
    <div className={classes.root}>
      <Reminder
        show={showReminder}
        title={showReminder?.title}
        body={showReminder?.body}
        patientObj={patientObj}
        onClose={toggleModal}
      />
      <Accordion>
        <AccordionSummary>
          <Row>
            <Col md={12}>
              {patientObj && patientObj !== null ? (
                <>
                  <Row className={"mt-1"}>
                    <Col md={12} className={classes?.root2}>
                      <b
                        style={{ fontSize: "25px", color: "rgb(153, 46, 98)" }}
                      >
                        {(patientObj?.firstName || getFirstName()) +
                          " " +
                          (patientObj?.surname || getSurname())}
                      </b>
                      <Link to={"/"}>
                        <ButtonMui
                          variant="contained"
                          color="primary"
                          className=" float-end ms-2 mr-2 mt-2"
                          startIcon={<TiArrowBack />}
                          style={{
                            backgroundColor: "rgb(153, 46, 98)",
                            color: "#fff",
                            height: "35px",
                          }}
                        >
                          <span style={{ textTransform: "capitalize" }}>
                            Back
                          </span>
                        </ButtonMui>
                      </Link>
                      {(patientDetail?.currentRegimen ||
                        (isFemale && patientDetail?.pregnant)) && (
                        <div className="mt-2" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {isFemale && patientDetail?.pregnant && (
                            <Label color={"pink"} size={"small"}>
                              Pregnancy Status:&nbsp;<b>{patientDetail.pregnant}</b>
                            </Label>
                          )}
                          {/* Breast Feeding — a chip alongside Pregnancy Status
                              (same row/height, second position). */}
                          {isFemale && patientDetail?.pregnant && (
                            <Label color={"purple"} size={"small"}>
                              Breast Feeding:&nbsp;
                              <b>
                                {(patientDetail.pregnant || "")
                                  .toString()
                                  .toLowerCase()
                                  .replace(/\s|-/g, "") === "breastfeeding"
                                  ? "Yes"
                                  : "No"}
                              </b>
                            </Label>
                          )}
                        </div>
                      )}
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {" "}
                        Patient ID :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {patientObj?.hospitalNumber ||
                            getUniqueId(props?.patientDetail)}
                        </b>
                      </span>
                    </Col>

                    <Col md={4} className={classes.root2}>
                      <span>
                        Date Of Birth :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {patientObj?.dateOfBirth ||
                            getDateOfBirth(props?.patientDetail)}
                        </b>
                      </span>
                    </Col>
                    {/* Latest viral load — shown for every PrEP/PEP patient once
                        the VL lookup has run. When there is no result, we show
                        "No record found" (grey) rather than hiding it or implying
                        a result. Wording comes from the shared viralLoad constants. */}
                    {props.viralLoad && (
                      <Col md={4} className={classes.root2}>
                        <span>
                          {" "}
                          Viral Load :{" "}
                          <b
                            style={{
                              color: !props.viralLoad.viralLoadResult
                                ? "#6c757d"
                                : isTargetDetected(props.viralLoad.viralLoadResult)
                                ? "#dc3545"
                                : "#28a745",
                            }}
                          >
                            {props.viralLoad.viralLoadResult
                              ? viralLoadDisplay(props.viralLoad.viralLoadResult)
                              : "No record found"}
                          </b>
                        </span>
                      </Col>
                    )}
                    <Col md={4} className={classes.root2}>
                      <span>
                        {" "}
                        Age :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {calculateAge(
                            moment(
                              patientObj?.dateOfBirth ||
                                getDateOfBirth(props?.patientDetail)
                            ).format("DD-MM-YYYY")
                          )}
                        </b>
                      </span>
                    </Col>
                    <Col md={4}>
                      <span>
                        {" "}
                        Gender :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {patientObj?.gender || getSex(props?.patientDetail)}
                        </b>
                      </span>
                    </Col>
                    <Col md={4}>
                      <span>
                        {" "}
                        Sex at Birth :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {patientObj?.sexAtBirth ||
                            patientObj?.gender ||
                            getSex(props?.patientDetail)}
                        </b>
                      </span>
                    </Col>
                    <Col md={4} className={classes.root2}>
                      <span>
                        {" "}
                        Phone Number :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {patientObj?.phoneNumber ||
                            getPhoneNumber(props?.patientDetail)}
                        </b>
                      </span>
                    </Col>
                    <Col md={6} className={classes.root2}>
                      <span>
                        {" "}
                        Address :{" "}
                        <b style={{ color: "#0B72AA" }}>
                          {patientObj?.address ||
                            getAddress(props?.patientDetail)}{" "}
                        </b>
                      </span>
                    </Col>
                    {(patientObj?.prepStatus || patientDetail?.prepStatus) && (
                      <Col md={12}>
                        <div>
                          <Typography variant="caption">
                            <Label color={"teal"} size={"mini"}>
                              STATUS :{" "}
                              {/* Prefer the grid's status (patientObj) — it is
                                  arm-specific (PrEP vs PEP), matching the grid.
                                  patientDetail's status mixes arms, so it can
                                  disagree (e.g. shows "Default" for a PrEP-active
                                  client who completed PEP). Fall back to it only
                                  when the grid didn't ship a status. */}
                              {patientObj?.prepStatus ||
                                patientDetail?.prepStatus}
                            </Label>
                          </Typography>
                        </div>
                      </Col>
                    )}
                    {/* PEP due-for-completion warning: past 28 days since the last
                        PEP visit with no completion form. The client is NOT auto-
                        completed — this just reminds staff to fill the PEP
                        Completion form. Only shown on the PEP arm. */}
                    {patientDetail?.pepDueForCompletion &&
                      props.screeningType === "PEP" && (
                        <Col md={12}>
                          <div>
                            <Typography variant="caption">
                              <Label color={"orange"} size={"mini"}>
                                ⚠ PEP completion due — 28+ days since last visit;
                                fill the PEP Completion form.
                              </Label>
                            </Typography>
                          </div>
                        </Col>
                      )}
                  </Row>
                </>
              ) : (
                <>
                  <p>Loading please wait..</p>
                </>
              )}
            </Col>
          </Row>
        </AccordionSummary>
        <Divider />
      </Accordion>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);

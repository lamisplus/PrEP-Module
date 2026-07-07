import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import MuiButton from "@material-ui/core/Button";
import PatientCardDetail from "./PatientCard";
import { useHistory } from "react-router-dom";
import SubMenu from "./SubMenu";
import RecentHistory from "./../History/RecentHistory";
import PatientHistory from "./../History/PatientHistory";
import ClinicVisit from "../Consultation/Index";
import PrEPDiscontinuationsInterruptions from "./../PrepServices/PrEPDiscontinuationsInterruptions";
import PrEPEligibilityScreeningForm from "./../PrepServices/PrEPEligibilityScreeningForm";
import PrEPInitialVisitForm from "./../PrepServices/PrEPInitialVisitForm";
import PEPFollowupVisitIndex from "./../Consultation/PEPFollowupIndex";
import Biometrics from "./Biometric";
import axios from "axios";
import { url as baseUrl, token } from "./../../../api";
import { useAuth } from "../../../context/AuthProvider/AuthProvider";
import ProtectedComponent from "../PrepServices/ProtectedComponent";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import PatientVisits from "./PatientVisits";
import ViralLoadWarningModal from "../../../Reusables/ViralLoadWarningModal";

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
  let history = useHistory();
  let location = useLocation();
  const [patientDetail, setPatientDetail] = useState("");
  const [activeContent, setActiveContent] = useState({
    route: "recent-history",
    id: "",
    activeTab: "home",
    actionType: "create",
    obj: {},
  });
  const { classes } = props;

  const patientObjLocation =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};
  const prepId =
    history.location && history.location.state
      ? history.location.state.prepId
      : {};
  const screeningTypeFromRoute =
    history.location && history.location.state
      ? history.location.state.screeningType
      : "";
  const freshEnrollFromRoute =
    history.location && history.location.state
      ? !!history.location.state.freshEnroll
      : false;

  // Persist screeningType in state so it survives internal navigation
  const [screeningType, setScreeningType] = useState(screeningTypeFromRoute || "");

  // Workflow staging: walk through screening -> initiation -> all
  // freshWorkflow = true ONLY when user clicked Enroll on Patient Tab (freshEnroll flag set)
  const freshWorkflow = freshEnrollFromRoute;
  const [sessionStage, setSessionStage] = useState(freshWorkflow ? "screening" : "all");
  // Tracks whether the patient has a saved screening that hasn't been initiated yet —
  // so that even after the user leaves and returns (losing freshEnroll), the SubMenu
  // can still expose the Initiation step from that pending screening.
  const [hasOpenScreening, setHasOpenScreening] = useState(false);

  // One-shot modal shown on dashboard entry when the patient is currently
  // active on the OTHER arm — surfaces the lockout instead of relying on
  // the muted notice inside the SubMenu strip.
  const [otherArmModalOpen, setOtherArmModalOpen] = useState(false);
  const [otherArmModalShownFor, setOtherArmModalShownFor] = useState(null);

  const { userPermissions } = useAuth();

  // Latest viral load for this patient — fetched once on dashboard entry and
  // shared with the PatientCard (chip display) and SubMenu (hides PEP service
  // forms when Target Detected). Shape: { viralLoad, viralLoadResult }.
  const [viralLoad, setViralLoad] = useState(null);
  // Shown once when the VL lookup returns no record. A missing VL is NOT treated
  // as "Target Detected" — it is simply surfaced as a dismissible warning.
  const [showVlWarning, setShowVlWarning] = useState(false);

  useEffect(() => {
    PatientObject();
    ViralLoadObject();
  }, []);

  // Every form (PrEP follow-up, screening, initiation, interruption…) returns to
  // the "recent-history" home view after saving. Refresh patientDetail whenever
  // we land back there so the STATUS on the card/menu reflects the just-saved
  // record immediately — not only after leaving and re-opening the dashboard.
  // Skip the initial mount (handled by the effect above).
  const didMountRef = React.useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (activeContent.route === "recent-history") {
      PatientObject();
    }
  }, [activeContent.route]);

  function ViralLoadObject() {
    const personId = patientObjLocation?.personId || patientObjLocation?.id;
    if (!personId) return;
    return axios
      .get(`${baseUrl}prep/viral-load/latest/${personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setViralLoad(response.data);
        // No result on the record → warn the user (non-blocking).
        if (!response.data?.viralLoadResult) setShowVlWarning(true);
      })
      .catch(() => setViralLoad(null));
  }

  // Once patientDetail loads, derive screeningType from enrollmentType ONLY if not set from route
  // (route-passed screeningType always wins so PrEP enrollment tab shows PrEP forms even if patient is also enrolled in PEP)
  useEffect(() => {
    if (!screeningTypeFromRoute && patientDetail?.enrollmentType) {
      setScreeningType(patientDetail.enrollmentType);
    }
  }, [patientDetail]);

  // Show the cross-arm lockout modal once per patient+arm. Triggers as soon as
  // patientDetail and screeningType are both available and the patient is
  // currently on the opposite arm.
  useEffect(() => {
    if (!patientDetail || !screeningType) return;
    const personId = patientObjLocation?.personId || patientObjLocation?.id;
    if (!personId) return;
    const isActivePrep = !!patientDetail.isCurrentStatusInterruptedPrep;
    const isActivePep = !!patientDetail.isCurrentStatusInterruptedPep;
    const blockedByOtherArm =
      (screeningType === "PrEP" && isActivePep) ||
      (screeningType === "PEP" && isActivePrep);
    const key = `${personId}:${screeningType}`;
    if (blockedByOtherArm && otherArmModalShownFor !== key) {
      setOtherArmModalOpen(true);
      setOtherArmModalShownFor(key);
    }
  }, [patientDetail, screeningType, patientObjLocation?.personId, patientObjLocation?.id, otherArmModalShownFor]);

  const activeOtherArmLabel =
    patientDetail?.isCurrentStatusInterruptedPrep ? "PrEP" :
    patientDetail?.isCurrentStatusInterruptedPep ? "PEP" : "";
  const requestedArmLabel = screeningType === "PEP" ? "PEP" : "PrEP";

  // After tab-switch + return: resume the workflow if the *open* (not-yet-completed)
  // record matches the enrollment type the user just selected on the Patient List.
  // Switching from PrEP → PEP must restart at screening (not jump to a stale PrEP initiation).
  //
  // This effect runs for both fresh enrolments and returning users so that a user who
  // left mid-flow (screening saved, initiation not yet entered) can pick up where they
  // stopped when they navigate back to the patient.
  useEffect(() => {
    // Person UUID keys the read endpoints below (stable on every grid row); the
    // bigint person id could be stale/absent and 404 the person lookup.
    const personUuid = patientObjLocation?.personUuid || patientObjLocation?.uuid;
    if (!personUuid) return;
    let cancelled = false;

    // Normalize either short labels ("PrEP"/"PEP") or canonical codeset codes
    // (PREP_PEP_ENROLLMENT_TYPE_PEP / _PREP) to a single short token. Both
    // canonical codes contain "PEP" AND "PREP" as substrings, so naive
    // includes() checks misclassify PEP records as PrEP. Check the suffix
    // instead — that's the actual disambiguator. Without this fix, a saved
    // PEP screening would look like a "PrEP" record on return and bounce
    // the user back to the screening form to redo it.
    const normalizeArm = (value) => {
      if (!value) return "";
      const v = String(value).toUpperCase().trim();
      if (v === "PEP" || v.endsWith("_PEP")) return "PEP";
      if (v === "PREP" || v.endsWith("_PREP")) return "PREP";
      return v;
    };
    const matches = (recordType, target) => {
      if (!recordType || !target) return false;
      return normalizeArm(recordType) === normalizeArm(target);
    };

    (async () => {
      try {
        // Type-filtered lookup: we need the latest screening AND initiation of
        // the SELECTED arm (PEP vs PrEP), not the latest of any type. The
        // "open" endpoints return whichever is latest by date, which is wrong
        // when the patient has activity on both arms.
        //
        // 1) Pull all initiations for this person, keep the ones whose
        //    enrollment type matches the selected arm, pick the most recent.
        //    If that initiation exists AND isn't archived/stopped, the
        //    workflow is past initiation → show the full menu.
        // 2) Otherwise pull all screenings and find the latest of the matching
        //    arm that hasn't yet been linked to an initiation. That's the
        //    "open screening" — surface the Initiation menu item.
        const target = normalizeArm(screeningType);

        const sortByDateDesc = (arr, key) =>
          [...(arr || [])].sort((a, b) => {
            const da = a?.[key] ? new Date(a[key]).getTime() : 0;
            const db = b?.[key] ? new Date(b[key]).getTime() : 0;
            return db - da;
          });

        const initsResp = await axios
          .get(`${baseUrl}prep-pep-initiation/person/${personUuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] }));
        if (cancelled) return;
        const initsOfArm = (initsResp?.data || []).filter(
          row => !row.archived && normalizeArm(row.enrollmentType) === target
        );
        if (initsOfArm.length > 0) {
          // Workflow is past initiation for this arm.
          setHasOpenScreening(false);
          if (freshWorkflow) setSessionStage("all");
          return;
        }

        const screeningsResp = await axios
          .get(`${baseUrl}prep-eligibility-screening/person/${personUuid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] }));
        if (cancelled) return;
        const screeningsOfArm = sortByDateDesc(
          (screeningsResp?.data || []).filter(
            row => !row.archived && normalizeArm(row.category) === target
          ),
          "visitDate"
        );
        // The latest screening of this arm exists → expose Initiation entry.
        if (screeningsOfArm.length > 0) {
          setHasOpenScreening(true);
          if (freshWorkflow) setSessionStage("initiation");
          return;
        }

        setHasOpenScreening(false);
        if (freshWorkflow) setSessionStage("screening");
      } catch (_e) {
        if (!cancelled) {
          setHasOpenScreening(false);
          if (freshWorkflow) setSessionStage("screening");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [freshWorkflow, screeningType, patientObjLocation?.personUuid, patientObjLocation?.uuid]);

  // Callbacks to advance the workflow stage after each form is saved
  const onScreeningSaved = () => {
    PatientObject();
    // A newly saved screening is, by definition, an open screening with no
    // initiation yet — expose the Initiation entry on return visits too.
    setHasOpenScreening(true);
    if (freshWorkflow && sessionStage === "screening") {
      setSessionStage("initiation");
    }
  };
  const onInitiationSaved = async () => {
    setHasOpenScreening(false);
    if (freshWorkflow && sessionStage === "initiation") {
      setSessionStage("all");
    }
    // Await so the freshly-saved initiation is reflected in patientDetail
    // before the dashboard re-renders the STATUS line. Without await, the
    // chip can stay on the pre-save status until the next manual refresh.
    await PatientObject();
  };

  async function PatientObject() {
    // Returns the axios promise so callers (form save handlers) can `await`
    // it and ensure patientDetail is fresh before navigating away — without
    // the await, the dashboard would render stale prepStatus right after
    // a discontinuation save.
    return axios
      .get(
        // Pass the arm being viewed so the backend computes the SAME
        // arm-specific status the grid shows (PrEP vs PEP), not an arm-mixed one.
        `${baseUrl}prep/persons/${
          patientObjLocation.personId || patientObjLocation.id
        }?enrollmentType=${encodeURIComponent(screeningType || "")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setPatientDetail(response.data);
      })
      .catch(error => {});
  }

  return (
    <div className={classes.root}>
      {/* Viral load is a PEP-only feature — only warn on the PEP arm. */}
      <ViralLoadWarningModal
        isOpen={showVlWarning && screeningType === "PEP"}
        onClose={() => setShowVlWarning(false)}
      />
      <Dialog
        open={otherArmModalOpen}
        onClose={() => setOtherArmModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { borderRadius: "0.5rem" } }}
      >
        <DialogTitle
          disableTypography
          style={{
            background: "#b91c1c",
            color: "#fff",
            padding: "0.75rem 1rem",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 600 }}>
            {requestedArmLabel} services unavailable
          </span>
        </DialogTitle>
        <DialogContent style={{ padding: "1.25rem", fontSize: "0.95rem" }}>
          {requestedArmLabel} services are not available for this patient because
          they are currently receiving {activeOtherArmLabel} service. Discontinue
          the active {activeOtherArmLabel} enrollment before starting any
          {" "}{requestedArmLabel} form.
        </DialogContent>
        <DialogActions style={{ padding: "0.5rem 1rem" }}>
          <MuiButton
            onClick={() => setOtherArmModalOpen(false)}
            variant="contained"
            style={{
              backgroundColor: "rgb(153, 46, 98)",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            Okay
          </MuiButton>
        </DialogActions>
      </Dialog>
      <div
        className="row page-titles mx-0"
        style={{ marginTop: "0px", marginBottom: "-10px" }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <h4>
              {" "}
              <Link to={"/"}>HIV Prevention /</Link> Patient Dashboard
            </h4>
          </li>
        </ol>
      </div>
      <Card>
        <CardContent>
          <PatientCardDetail
            patientObj={patientObjLocation}
            setActiveContent={setActiveContent}
            activeContent={activeContent}
            patientDetail={patientDetail}
            viralLoad={viralLoad}
            screeningType={screeningType}
          />
          <SubMenu
            patientObj={patientObjLocation}
            setActiveContent={setActiveContent}
            patientDetail={patientDetail}
            screeningType={screeningType}
            freshWorkflow={freshWorkflow}
            sessionStage={sessionStage}
            hasOpenScreening={hasOpenScreening}
            viralLoad={viralLoad}
          />
          <br />

          {activeContent.route === "recent-history" && (
            <RecentHistory
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
            />
          )}
          {activeContent.route === "biometrics" && (
            <ProtectedComponent
              privateComponent={Biometrics}
              isAuthorized={userPermissions.biometrics}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
            />
          )}
          {activeContent.route === "consultation" && (
            <ProtectedComponent
              privateComponent={ClinicVisit}
              isAuthorized={userPermissions.visit}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              PatientObject={() => PatientObject()}
            />
          )}
          {activeContent.route === "pep-followup" && (
            <ProtectedComponent
              privateComponent={PEPFollowupVisitIndex}
              isAuthorized={userPermissions.visit}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              PatientObject={() => PatientObject()}
            />
          )}
          {activeContent.route === "prep-interruptions" && (
            <ProtectedComponent
              privateComponent={PrEPDiscontinuationsInterruptions}
              isAuthorized={userPermissions.discontinuation}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              viralLoad={viralLoad}
              PatientObject={() => PatientObject()}
            />
          )}
          {activeContent.route === "prep-screening" && (
            <ProtectedComponent
              privateComponent={PrEPEligibilityScreeningForm}
              isAuthorized={userPermissions?.eligibility}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              patientDetail={patientDetail}
              PatientObject={() => onScreeningSaved()}
            />
          )}
          {activeContent.route === "patient-visits" && (
            <ProtectedComponent
              privateComponent={PatientVisits}
              isAuthorized={userPermissions?.patientVisits}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              patientDetail={patientDetail}
              PatientObject={() => PatientObject()}
            />
          )}
          {activeContent.route === "prep-registration" && (
            <ProtectedComponent
              privateComponent={PrEPInitialVisitForm}
              isAuthorized={userPermissions.registration}
              patientObj={patientObjLocation || location?.state?.patientObj}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
              prepId={prepId}
              patientDetail={patientDetail}
              PatientObject={() => onInitiationSaved()}
            />
          )}
          {activeContent.route === "patient-history" && (
            <PatientHistory
              patientObj={patientObjLocation}
              setActiveContent={setActiveContent}
              activeContent={activeContent}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

PatientCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PatientCard);

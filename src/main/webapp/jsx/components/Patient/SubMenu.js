import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Menu, Popup } from "semantic-ui-react";
import ProtectedComponent from "../PrepServices/ProtectedComponent";
import { useAuth } from "../../../context/AuthProvider/AuthProvider";

function SubMenu(props) {
  const { userPermissions } = useAuth();
  let { patientObj, patientDetail, screeningType, freshWorkflow, sessionStage, hasOpenScreening } = props;

  useEffect(() => {
    //Observation();
  }, [props.patientObj]);

  const loadPrEPDiscontinuationsInterruptions = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "prep-interruptions",
      screeningType: effectiveType,
    });
  };
  const loadPrEPInitialVisitForm = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "prep-registration",
      screeningType: effectiveType,
    });
  };
  const loadPrEPEligibilityScreeningForm = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "prep-screening",
      screeningType: effectiveType,
    });
  };
  const onClickConsultation = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "consultation",
      screeningType: effectiveType,
    });
  };
  const loadPEPFollowupVisit = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "pep-followup",
      screeningType: effectiveType,
    });
  };
  const onClickHome = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "recent-history",
    });
  };
  const loadPatientHistory = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "patient-history",
    });
  };
  const loadPatientVisits = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: "patient-visits",
    });
  };

  const history = useHistory();
  let patientDetailCopy = { ...patientDetail };
  patientObj = {
    ...patientObj,
    hivresultAtVisit:
      patientDetailCopy.hivPositive === false ? "Negative" : "Positive",
    prepCount: patientDetailCopy.prepEnrollmentCount?.toString() ?? "0",
    eligibilityCount: patientDetailCopy.prepEligibilityCount?.toString() ?? "0",
    commencementCount: patientDetailCopy.prepCommencementCount ?? 0,
    enrollmentType: patientDetailCopy.enrollmentType || "",
  };

  // Effective type: screeningType from Patient Tab takes priority, then fall back to enrollmentType
  const effectiveType = screeningType || patientObj?.enrollmentType || "";
  const isPEP = effectiveType === "PEP";
  const isPrEP = effectiveType === "PrEP";
  const typeLabel = isPEP ? "PEP" : "PrEP";

  // Cross-arm exclusivity. The two flags arrive on patientDetail; "true" means the
  // patient is currently active on that arm. If the user is browsing the OTHER arm's
  // tab, hide all PrEP/PEP service entry points so they can't accidentally start work
  // on a wrong-arm form. (Discontinuation stays available so the user can interrupt.)
  const isActivePrep = !!patientDetail?.isCurrentStatusInterruptedPrep;
  const isActivePep = !!patientDetail?.isCurrentStatusInterruptedPep;
  const blockedByOtherArm =
    (isPrEP && isActivePep) || (isPEP && isActivePrep);

  // Terminal / interrupted PrEP-PEP statuses. When the patient is in one of
  // these states the dashboard must offer only (re)Eligibility screening — all
  // service forms (Initiation, Follow-up, Discontinuation, Patient Visits) are
  // hidden until a new eligibility screening re-opens the workflow.
  const TERMINAL_PREP_STATUSES = [
    "discontinued", "stopped", "seroconverted",
    "dead", "referred", "default", "completed",
  ];

  const renderMenuItems = () => {
    const isNegative = patientObj?.hivresultAtVisit === "Negative" || patientObj?.hivresultAtVisit === null;

    // R2: client has discontinued/terminated PrEP or PEP.
    const statusText = (patientDetail?.prepStatus || "").toLowerCase();
    const isDiscontinued = TERMINAL_PREP_STATUSES.some(s => statusText.includes(s));
    // R3: an HIV-positive client that nonetheless reached the grid.
    const isPositive = patientObj?.hivresultAtVisit === "Positive";

    // For both cases the only allowed action is eligibility screening; every
    // other service form is removed so a discontinued or positive client cannot
    // be (re)initiated or followed up without first re-screening.
    if (isDiscontinued || isPositive) {
      return (
        <>
          <Menu.Item onClick={onClickHome}>Home</Menu.Item>
          <ProtectedComponent
            isAuthorized={userPermissions.eligibility}
            privateComponent={() => (
              <Menu.Item onClick={loadPrEPEligibilityScreeningForm}>
                {typeLabel} Eligibility Screening
              </Menu.Item>
            )}
          />
          <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
        </>
      );
    }

    // If the patient is currently active on the OTHER arm, lock down this tab to
    // a notice + History only. The user must visit the other arm's tab and
    // discontinue first.
    if (blockedByOtherArm) {
      const activeArm = isActivePrep ? "PrEP" : "PEP";
      return (
        <>
          <Menu.Item onClick={onClickHome}>Home</Menu.Item>
          <Menu.Item disabled style={{ color: "#b91c1c", fontWeight: 600 }}>
            Patient is currently on {activeArm}. Discontinue {activeArm} before
            using {typeLabel} forms.
          </Menu.Item>
          <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
        </>
      );
    }

    // Fresh workflow (came from Patient Tab): walk the user through Screening -> Initiation -> All forms
    if (freshWorkflow && sessionStage === "screening") {
      return (
        <>
          <Menu.Item onClick={onClickHome}>Home</Menu.Item>
          <ProtectedComponent
            isAuthorized={userPermissions.eligibility}
            privateComponent={() => (
              <Menu.Item onClick={loadPrEPEligibilityScreeningForm}>
                {typeLabel} Eligibility Screening
              </Menu.Item>
            )}
          />
          <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
        </>
      );
    }

    if (freshWorkflow && sessionStage === "initiation") {
      return (
        <>
          <Menu.Item onClick={onClickHome}>Home</Menu.Item>
          <ProtectedComponent
            isAuthorized={userPermissions.enrollment}
            privateComponent={() => (
              <Menu.Item onClick={loadPrEPInitialVisitForm}>
                {typeLabel} Initiation
              </Menu.Item>
            )}
          />
          <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
        </>
      );
    }

    // sessionStage === "all" OR returning client (not fresh workflow): show full menu
    return (
      <>
        <Menu.Item onClick={onClickHome}>Home</Menu.Item>

        <ProtectedComponent
          isAuthorized={userPermissions.eligibility}
          privateComponent={() => (
            <Menu.Item onClick={loadPrEPEligibilityScreeningForm}>
              {typeLabel} Eligibility Screening
            </Menu.Item>
          )}
        />

        {isNegative && (freshWorkflow || hasOpenScreening) && (
          <ProtectedComponent
            isAuthorized={userPermissions.enrollment}
            privateComponent={() => (
              <Menu.Item onClick={loadPrEPInitialVisitForm}>
                {typeLabel} Initiation
              </Menu.Item>
            )}
          />
        )}

        {isNegative && isPrEP && (
          <ProtectedComponent
            isAuthorized={userPermissions.visit}
            privateComponent={() => (
              <Menu.Item onClick={onClickConsultation}>
                PrEP Follow-up Visit
              </Menu.Item>
            )}
          />
        )}
        {isNegative && isPEP && (
          <ProtectedComponent
            isAuthorized={userPermissions.visit}
            privateComponent={() => (
              <Menu.Item onClick={loadPEPFollowupVisit}>
                PEP Follow-up Visit
              </Menu.Item>
            )}
          />
        )}

        {isNegative && (
          <ProtectedComponent
            isAuthorized={userPermissions.discontinuation}
            privateComponent={() => (
              <Menu.Item onClick={loadPrEPDiscontinuationsInterruptions}>
                {isPEP ? "PEP Completion" : "PrEP Discontinuation/Interruption"}
              </Menu.Item>
            )}
          />
        )}

        <ProtectedComponent
          isAuthorized={userPermissions.patientVisits}
          privateComponent={() => (
            <Menu.Item onClick={loadPatientVisits}>
              Patient Visits
            </Menu.Item>
          )}
        />
        <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
      </>
    );
  };

  return (
    <div>
      <Menu size="large" color={"black"} inverted>
        {renderMenuItems()}
      </Menu>
    </div>
  );
}

export default SubMenu;

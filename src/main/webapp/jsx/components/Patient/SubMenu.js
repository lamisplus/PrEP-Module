import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Menu, Popup } from "semantic-ui-react";
import ProtectedComponent from "../PrepServices/ProtectedComponent";
import { useAuth } from "../../../context/AuthProvider/AuthProvider";
import { isTargetDetected } from "../../constants/viralLoad";

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

  const effectiveType = screeningType || patientObj?.enrollmentType || "";
  const isPEP = effectiveType === "PEP";
  const isPrEP = effectiveType === "PrEP";
  const typeLabel = isPEP ? "PEP" : "PrEP";
  const isActivePrep = !!patientDetail?.isCurrentStatusInterruptedPrep;
  const isActivePep = !!patientDetail?.isCurrentStatusInterruptedPep;
  const blockedByOtherArm =
    (isPrEP && isActivePep) || (isPEP && isActivePrep);

  // Statuses that end the current course and restrict the menu to Eligibility
  // Screening (until a fresh screening re-opens the workflow → re-initiation).
  //   • PrEP: discontinuation/interruption outcomes, incl. Default/Defaulted.
  //   • PEP: ONLY 'Completed'. PEP 'Default' is a TRANSIENT "overdue for next
  //     visit" state (toggles back to Active once seen) — it must NOT lock the
  //     client out of the PEP Follow-up form, so it is intentionally excluded.
  const DISCONTINUED_STATUSES_PREP = [
    "discontinued",
    "stopped",
    "default",
    "defaulted",
    "dead",
    "referred",
    "seroconverted",
    "completed",
    "pep completion",
    "pep completed",
  ];
  const DISCONTINUED_STATUSES_PEP = [
    "completed",
    "pep completion",
    "pep completed",
    "seroconverted",
    "dead",
    "referred",
    "stopped",
  ];
  // Prefer patientDetail (re-fetched after every form save, and arm-aware so it
  // matches the grid) so the menu's gating updates immediately post-save. The
  // grid row (patientObj) is only a fallback until patientDetail loads.
  const prepStatusValue = (patientDetail?.prepStatus || patientObj?.prepStatus || "")
    .toString()
    .trim()
    .toLowerCase();
  const hasDiscontinued = (isPEP ? DISCONTINUED_STATUSES_PEP : DISCONTINUED_STATUSES_PREP)
    .includes(prepStatusValue);

  // Latest viral load (shared with the dashboard chip). When it's Detected
  // (> 1000) for a PEP client, PEP was not completed successfully — the menu
  // surfaces ONLY the PEP Completion form (handled in renderMenuItems), which
  // auto-fills PEP Completion = YES and the HIV Result from the latest HTS.
  const viralLoadTargetDetected = isTargetDetected(props.viralLoad?.viralLoadResult);

  const renderMenuItems = () => {
    const isNegative = patientObj?.hivresultAtVisit === "Negative" || patientObj?.hivresultAtVisit === null;

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

    // PEP client with a Detected viral load (> 1000) whose PEP is NOT yet
    // completed: surface ONLY the PEP Completion form (it auto-fills PEP
    // Completion = YES and the HIV Result) to force completion. Once the
    // completion form has been filled the status becomes 'Completed'
    // (hasDiscontinued), so we STOP forcing completion and fall through to the
    // discontinued → re-screen → re-initiate cycle below — otherwise the client
    // would be stuck on the completion form forever and the cycle never resets.
    if (isPEP && viralLoadTargetDetected && !hasDiscontinued) {
      return (
        <>
          <Menu.Item onClick={onClickHome}>Home</Menu.Item>
          <ProtectedComponent
            isAuthorized={userPermissions.discontinuation}
            privateComponent={() => (
              <Menu.Item onClick={loadPrEPDiscontinuationsInterruptions}>
                PEP Completion
              </Menu.Item>
            )}
          />
          <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
        </>
      );
    }

    // Restrict to Eligibility Screening only when:
    //   • the client is HIV-positive (can never be provided PrEP/PEP), OR
    //   • the client is discontinued/stopped/defaulted/completed AND has not yet
    //     re-screened. A discontinued client is allowed to RESTART: once they
    //     fill a fresh Eligibility Screening (hasOpenScreening becomes true), we
    //     fall through to the normal menu so Initiation and the service forms
    //     appear again. This applies to every such client, not just one.
    const needsReScreenBeforeRestart = hasDiscontinued && !hasOpenScreening;
    if (!isNegative || needsReScreenBeforeRestart) {
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
        
        {isNegative && hasOpenScreening && (
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

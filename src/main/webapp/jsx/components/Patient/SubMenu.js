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

  const DISCONTINUED_STATUSES = [
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
  const prepStatusValue = (patientDetail?.prepStatus || patientObj?.prepStatus || "")
    .toString()
    .trim()
    .toLowerCase();
  const hasDiscontinued = DISCONTINUED_STATUSES.includes(prepStatusValue);

  // Latest viral load (shared with the dashboard chip). When Target Detected we
  // hide the PEP service forms — a client with a detectable viral load should
  // not be continuing PEP. Only affects the PEP arm; PrEP entries are unaffected.
  const viralLoadTargetDetected = isTargetDetected(props.viralLoad?.viralLoadResult);
  const hidePepServiceForms = isPEP && viralLoadTargetDetected;

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

    if (hasDiscontinued || !isNegative) {
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
        
        {isNegative && hasOpenScreening && !hidePepServiceForms && (
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
        {isNegative && isPEP && !hidePepServiceForms && (
          <ProtectedComponent
            isAuthorized={userPermissions.visit}
            privateComponent={() => (
              <Menu.Item onClick={loadPEPFollowupVisit}>
                PEP Follow-up Visit
              </Menu.Item>
            )}
          />
        )}

        {isNegative && !hidePepServiceForms && (
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

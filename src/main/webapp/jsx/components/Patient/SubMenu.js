import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Menu, Popup } from "semantic-ui-react";
import ProtectedComponent from "../PrepServices/ProtectedComponent";
import { useAuth } from "../../../context/AuthProvider/AuthProvider";

function SubMenu(props) {
  const { userPermissions } = useAuth();
  let { patientObj, patientDetail } = props;

  useEffect(() => {
    //Observation();
  }, [props.patientObj]);

  const loadPrEPDiscontinuationsInterruptions = row => {
    props.setActiveContent({
      ...props.activeContent,
      route: "prep-interruptions",
    });
  };
  const loadPrEPInitialVisitForm = row => {
    props.setActiveContent({
      ...props.activeContent,
      route: "prep-registration",
    });
  };
  const loadPrEPCommencementForm = row => {
    props.setActiveContent({
      ...props.activeContent,
      route: "prep-commencement",
    });
  };
  const loadPrEPEligibilityScreeningForm = row => {
    props.setActiveContent({ ...props.activeContent, route: "prep-screening" });
  };

  const onClickConsultation = row => {
    props.setActiveContent({ ...props.activeContent, route: "consultation" });
  };
  const loadPEPFollowupVisit = row => {
    props.setActiveContent({ ...props.activeContent, route: "pep-followup" });
  };
  const onClickHome = row => {
    props.setActiveContent({ ...props.activeContent, route: "recent-history" });
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
  console.log("patientObj,patientDetail: ", patientObj, patientDetail);
  const history = useHistory();
  let patientDetailCopy = { ...patientDetail };
  patientObj = {
    ...patientObj,
    hivresultAtVisit:
      patientDetailCopy.hivPositive === false ? "Negative" : "Positive",
    prepCount: patientDetailCopy.prepEnrollmentCount?.toString() ?? "0",
    eligibilityCount: patientDetailCopy.prepEligibilityCount?.toString() ?? "0",
    commencementCount: patientDetailCopy.prepCommencementCount ?? 0,
  };

  return (
    <div>
      <Menu size="large" color={"black"} inverted>
        {patientObj?.createdBy !== "ETL" ? ( //The menu will show if the patient is not migrated
          <>
            <Menu.Item
              onClick={() => {
                onClickHome();
              }}
            >
              Home
            </Menu.Item>

            {patientObj?.eligibilityCount <= 0 ||
            patientObj?.eligibilityCount === null ? (
              <ProtectedComponent
                isAuthorized={userPermissions.eligibility}
                privateComponent={() => (
                  <Menu.Item onClick={loadPrEPEligibilityScreeningForm}>
                    PrEP Eligibility Screening
                  </Menu.Item>
                )}
              />
            ) : (
              <>
                {/* check if the patient has done prep commencement */}
                {patientObj?.prepCount === "0" ||
                patientObj?.commencementCount === null ? (
                  <>
                    {patientObj?.prepCount === "0" &&
                      patientObj?.hivresultAtVisit === "Negative" && (
                        <ProtectedComponent
                          isAuthorized={userPermissions.enrollment}
                          privateComponent={() => (
                            <Menu.Item onClick={loadPrEPInitialVisitForm}>
                              PrEP/PEP Initial
                            </Menu.Item>
                          )}
                        />
                      )}
                    {(patientObj?.commencementCount === null ||
                      patientObj?.commencementCount <= 0) &&
                      patientObj?.hivresultAtVisit === "Negative" && (
                        <ProtectedComponent
                          isAuthorized={userPermissions.commencement}
                          privateComponent={() => (
                            <Menu.Item onClick={loadPrEPCommencementForm}>
                              PrEP Commencement
                            </Menu.Item>
                          )}
                        />
                      )}
                  </>
                ) : (
                  <>
                    <ProtectedComponent
                      isAuthorized={userPermissions.eligibility}
                      privateComponent={() => (
                        <Menu.Item onClick={loadPrEPEligibilityScreeningForm}>
                          PrEP Eligibility Screening
                        </Menu.Item>
                      )}
                    />
                    {(patientObj?.prepCount === null ||
                      patientObj?.prepCount < 0) &&
                      patientObj?.hivresultAtVisit === "Negative" && (
                        <ProtectedComponent
                          isAuthorized={userPermissions.enrollment}
                          privateComponent={() => (
                            <Menu.Item onClick={loadPrEPInitialVisitForm}>
                              PrEP/PEP Initial
                            </Menu.Item>
                          )}
                        />
                      )}
                    {(patientObj?.commencementCount === null ||
                      patientObj?.commencementCount <= 0) &&
                      patientObj?.hivresultAtVisit === "Negative" && (
                        <ProtectedComponent
                          isAuthorized={userPermissions.commencement}
                          privateComponent={() => (
                            <Menu.Item onClick={loadPrEPCommencementForm}>
                              PrEP Commencement
                            </Menu.Item>
                          )}
                        />
                      )}
                    {patientObj?.hivresultAtVisit === "Negative" && (
                      <ProtectedComponent
                        isAuthorized={userPermissions.visit}
                        privateComponent={() => (
                          <Menu.Item onClick={onClickConsultation}>
                            PrEP Follow-up Visit
                          </Menu.Item>
                        )}
                      />
                    )}
                    {patientObj?.hivresultAtVisit === "Negative" && (
                      <ProtectedComponent
                        isAuthorized={userPermissions.visit}
                        privateComponent={() => (
                          <Menu.Item onClick={loadPEPFollowupVisit}>
                            PEP Follow-up Visit
                          </Menu.Item>
                        )}
                      />
                    )}
                    {patientObj?.hivresultAtVisit === "Negative" && (
                      <ProtectedComponent
                        isAuthorized={userPermissions.discontinuation}
                        privateComponent={() => (
                          <Menu.Item
                            onClick={loadPrEPDiscontinuationsInterruptions}
                          >
                            PrEP Discontinuations & Interruptions
                          </Menu.Item>
                        )}
                      />
                    )}
                  </>
                )}
              </>
            )}
            <ProtectedComponent
              isAuthorized={userPermissions.patientVisits}
              privateComponent={() => (
                <Menu.Item onClick={loadPatientVisits}>
                  Patient Visits
                </Menu.Item>
              )}
            />
            <Menu.Item onClick={() => loadPatientHistory(patientObj)}>
              History
            </Menu.Item>
          </>
        ) : (
          <>
            {/* This menu will show only if the patient is migrated  and check if the patient last HIV test result is not positive*/}
            <Menu.Item onClick={() => onClickHome()}>Home</Menu.Item>
            {(patientObj?.hivresultAtVisit === "Negative" ||
              patientObj?.hivresultAtVisit === null) && (
              <ProtectedComponent
                isAuthorized={userPermissions.eligibility}
                privateComponent={() => (
                  <Menu.Item onClick={loadPrEPEligibilityScreeningForm}>
                    PrEP Eligibility Screening
                  </Menu.Item>
                )}
              />
            )}
            {(patientObj?.hivresultAtVisit === "Negative" ||
              patientObj?.hivresultAtVisit === null) &&
              patientObj?.prepCount === "0" && (
                <ProtectedComponent
                  isAuthorized={userPermissions.enrollment}
                  privateComponent={() => (
                    <Menu.Item onClick={loadPrEPInitialVisitForm}>
                      PrEP/PEP Initial
                    </Menu.Item>
                  )}
                />
              )}
            {(patientObj?.hivresultAtVisit === "Negative" ||
              patientObj?.hivresultAtVisit === null) &&
              (patientObj?.commencementCount === null ||
                patientObj?.commencementCount <= 0) && (
                <ProtectedComponent
                  isAuthorized={userPermissions.commencement}
                  privateComponent={() => (
                    <Menu.Item onClick={loadPrEPCommencementForm}>
                      PrEP Commencement
                    </Menu.Item>
                  )}
                />
              )}
            {(patientObj?.hivresultAtVisit === "Negative" ||
              patientObj?.hivresultAtVisit === null) && (
              <ProtectedComponent
                isAuthorized={userPermissions.visit}
                privateComponent={() => (
                  <Menu.Item onClick={onClickConsultation}>
                    PrEP Follow-up Visit
                  </Menu.Item>
                )}
              />
            )}
            {(patientObj?.hivresultAtVisit === "Negative" ||
              patientObj?.hivresultAtVisit === null) && (
              <ProtectedComponent
                isAuthorized={userPermissions.visit}
                privateComponent={() => (
                  <Menu.Item onClick={loadPEPFollowupVisit}>
                    PEP Follow-up Visit
                  </Menu.Item>
                )}
              />
            )}
            {(patientObj?.hivresultAtVisit === "Negative" ||
              patientObj?.hivresultAtVisit === null) && (
              <ProtectedComponent
                isAuthorized={userPermissions.discontinuation}
                privateComponent={() => (
                  <Menu.Item onClick={loadPrEPDiscontinuationsInterruptions}>
                    PrEP Discontinuations & Interruptions
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
            <Menu.Item onClick={() => loadPatientHistory(patientObj)}>
              History
            </Menu.Item>
          </>
        )}
      </Menu>
    </div>
  );
}

export default SubMenu;

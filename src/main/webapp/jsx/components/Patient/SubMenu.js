import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { Menu } from 'semantic-ui-react';
import { useAuth } from '../../../context/AuthProvider/AuthProvider';
import ProtectedComponent from '../PrepServices/PrivateComponent';

function SubMenu(props) {
  const patientObj = props.patientObj;
  const { userPermissions } = useAuth();

  useEffect(() => {
    // Observation();
  }, [props.patientObj]);

  const loadPrEPDiscontinuationsInterruptions = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-interruptions',
    });
  };

  const loadPrEPRegistrationForm = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-registration',
    });
  };

  const loadPrEPCommencementForm = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-commencement',
    });
  };

  const loadPrEPEligibiltyScreeningForm = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-screening',
    });
  };

  const onClickConsultation = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'consultation',
    });
  };

  const onClickHome = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'recent-history',
    });
  };

  const loadPatientHistory = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'patient-history',
    });
  };

  const history = useHistory();

  return (
    <div>
      <Menu size="large" color={'black'} inverted>
        {patientObj?.createdBy !== 'ETL' ? (
          <>
            <Menu.Item onClick={onClickHome}>Home</Menu.Item>
            <ProtectedComponent
              privateComponent={() => (
                <>
                  {patientObj?.eligibilityCount <= 0 ||
                  patientObj?.eligibilityCount === null ? (
                    <Menu.Item onClick={loadPrEPEligibiltyScreeningForm}>
                      PrEP Eligibility Screening
                    </Menu.Item>
                  ) : (
                    <>
                      {patientObj?.prepCount === '0' ||
                      patientObj?.commencementCount === null ? (
                        <>
                          {patientObj?.prepCount === '0' &&
                            patientObj?.hivresultAtVisit === 'Negative' && (
                              <Menu.Item onClick={loadPrEPRegistrationForm}>
                                PrEP Enrollment
                              </Menu.Item>
                            )}
                          {(patientObj?.commencementCount === null ||
                            patientObj?.commencementCount <= 0) &&
                            patientObj?.hivresultAtVisit === 'Negative' && (
                              <Menu.Item onClick={loadPrEPCommencementForm}>
                                PrEP Commencement
                              </Menu.Item>
                            )}
                        </>
                      ) : (
                        <>
                          <ProtectedComponent
                            privateComponent={() => (
                              <Menu.Item
                                onClick={loadPrEPEligibiltyScreeningForm}
                              >
                                PrEP Eligibility Screening
                              </Menu.Item>
                            )}
                            isAuthorized={userPermissions?.visit}
                          />
                          {(patientObj?.prepCount === null ||
                            patientObj?.prepCount < 0) &&
                            patientObj?.hivresultAtVisit === 'Negative' && (
                              <Menu.Item onClick={loadPrEPRegistrationForm}>
                                PrEP Enrollment
                              </Menu.Item>
                            )}
                          {(patientObj?.commencementCount === null ||
                            patientObj?.commencementCount <= 0) &&
                            patientObj?.hivresultAtVisit === 'Negative' && (
                              <Menu.Item onClick={loadPrEPCommencementForm}>
                                PrEP Commencement
                              </Menu.Item>
                            )}
                          {patientObj?.hivresultAtVisit === 'Negative' && (
                            <Menu.Item onClick={onClickConsultation}>
                              PrEP Visit
                            </Menu.Item>
                          )}
                          {patientObj?.hivresultAtVisit === 'Negative' && (
                            <Menu.Item
                              onClick={loadPrEPDiscontinuationsInterruptions}
                            >
                              PrEP Discontinuations & Interruptions
                            </Menu.Item>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
              isAuthorized={userPermissions?.visit}
            />
            <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item onClick={onClickHome}>Home</Menu.Item>
            <ProtectedComponent
              privateComponent={() => (
                <>
                  {(patientObj?.hivresultAtVisit === 'Negative' ||
                    patientObj?.hivresultAtVisit === null) && (
                    <Menu.Item onClick={loadPrEPEligibiltyScreeningForm}>
                      PrEP Eligibility Screening
                    </Menu.Item>
                  )}
                  {(patientObj?.hivresultAtVisit === 'Negative' ||
                    patientObj?.hivresultAtVisit === null) &&
                    patientObj?.prepCount === '0' && (
                      <Menu.Item onClick={loadPrEPRegistrationForm}>
                        PrEP Enrollment
                      </Menu.Item>
                    )}
                  {(patientObj?.hivresultAtVisit === 'Negative' ||
                    patientObj?.hivresultAtVisit === null) &&
                    (patientObj?.commencementCount === null ||
                      patientObj?.commencementCount <= 0) && (
                      <Menu.Item onClick={loadPrEPCommencementForm}>
                        PrEP Commencement
                      </Menu.Item>
                    )}
                  {(patientObj?.hivresultAtVisit === 'Negative' ||
                    patientObj?.hivresultAtVisit === null) && (
                    <Menu.Item onClick={onClickConsultation}>
                      PrEP Visit
                    </Menu.Item>
                  )}
                  {(patientObj?.hivresultAtVisit === 'Negative' ||
                    patientObj?.hivresultAtVisit === null) && (
                    <Menu.Item onClick={loadPrEPDiscontinuationsInterruptions}>
                      PrEP Discontinuations & Interruptions
                    </Menu.Item>
                  )}
                </>
              )}
              isAuthorized={userPermissions?.visit}
            />
            <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
          </>
        )}
      </Menu>
    </div>
  );
}

export default SubMenu;

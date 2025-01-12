import React, { useState, useEffect } from 'react';
import { Menu } from 'semantic-ui-react';
import ProtectedComponent from '../PrepServices/PrivateComponent';
import { useAuth } from '../../../context/AuthProvider/AuthProvider';
import axios from 'axios';
import { token, url as baseUrl } from '../../../api';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import ContentLoader from 'react-content-loader';

function SubMenuSkeleton() {
  return (
    <ContentLoader
      speed={2}
      width={1000}
      height={50}
      viewBox="0 0 1000 50"
      backgroundColor="#333"
      foregroundColor="#555"
    >
      <rect x="0" y="15" rx="5" ry="5" width="100" height="20" />
      <rect x="120" y="15" rx="5" ry="5" width="200" height="20" />
      <rect x="330" y="15" rx="5" ry="5" width="150" height="20" />
      <rect x="490" y="15" rx="5" ry="5" width="100" height="20" />
      <rect x="610" y="15" rx="5" ry="5" width="200" height="20" />
      <rect x="820" y="15" rx="5" ry="5" width="150" height="20" />
    </ContentLoader>
  );
}

function SubMenu(props) {
  const { patientObj, patientDetail } = props;
  const { userPermissions } = useAuth();
  const history = useLocation();
  const patientObjLocation =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      try {
        // Simulate a delay
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    props.setActiveContent({ ...props.activeContent, route: 'prep-screening' });
  };

  const onClickConsultation = () => {
    props.setActiveContent({ ...props.activeContent, route: 'consultation' });
  };

  const onClickHome = () => {
    props.setActiveContent({ ...props.activeContent, route: 'recent-history' });
  };

  const loadPatientHistory = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'patient-history',
    });
  };

  const loadPatientVisits = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'patient-visits',
    });
  };

  return (
    <div>
      <Menu size="large" color={'black'} inverted>
        {!patientDetail || !patientObj ? (
          <div className="mx-3">
            <SubMenuSkeleton />
          </div>
        ) : (
          <>
            <Menu.Item onClick={onClickHome}>Home</Menu.Item>
            {patientObj?.createdBy !== 'ETL' ||
            patientDetail?.createdBy !== 'ETL' ? (
              patientDetail && (
                <>
                  {patientObj?.eligibilityCount <= 0 ||
                  patientDetail?.prepEligibilityCount <= 0 ||
                  patientObj?.eligibilityCount === null ||
                  patientDetail?.prepEligibilityCount === null ? (
                    <ProtectedComponent
                      isAuthorized={userPermissions.eligibility}
                      privateComponent={() => (
                        <Menu.Item onClick={loadPrEPEligibiltyScreeningForm}>
                          PrEP Eligibility Screening
                        </Menu.Item>
                      )}
                    />
                  ) : (
                    <>
                      {patientObj?.prepCount === '0' ||
                      patientDetail?.prepCount === 0 ||
                      patientObj?.commencementCount === null ||
                      patientDetail?.prepCommencementCount === null ? (
                        <>
                          {(patientObj?.prepCount === '0' ||
                            patientDetail?.prepCount === 0) &&
                            (patientObj?.hivresultAtVisit === 'Negative' ||
                              !patientDetail?.hivPositive ||
                              patientDetail?.hivPositive === null) && (
                              <ProtectedComponent
                                isAuthorized={userPermissions.enrollment}
                                privateComponent={() => (
                                  <Menu.Item onClick={loadPrEPRegistrationForm}>
                                    PrEP Enrollment
                                  </Menu.Item>
                                )}
                              />
                            )}
                          {(patientObj?.commencementCount === null ||
                            patientObj?.commencementCount <= 0 ||
                            patientDetail?.prepCommencementCount === null ||
                            patientDetail?.prepCommencementCount <= 0) &&
                            (patientObj?.hivresultAtVisit === 'Negative' ||
                              !patientDetail?.hivPositive ||
                              patientDetail?.hivPositive === null) && (
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
                              <Menu.Item
                                onClick={loadPrEPEligibiltyScreeningForm}
                              >
                                PrEP Eligibility Screening
                              </Menu.Item>
                            )}
                          />
                          {(patientObj?.prepCount === null ||
                            patientDetail?.prepCount === null ||
                            patientObj?.prepCount < 0 ||
                            patientDetail?.prepCount < 0) &&
                            (patientObj?.hivresultAtVisit === 'Negative' ||
                              !patientDetail?.hivPositive ||
                              patientDetail?.hivPositive === null) && (
                              <ProtectedComponent
                                isAuthorized={userPermissions.enrollment}
                                privateComponent={() => (
                                  <Menu.Item onClick={loadPrEPRegistrationForm}>
                                    PrEP Enrollment
                                  </Menu.Item>
                                )}
                              />
                            )}
                          {(patientObj?.commencementCount === null ||
                            patientObj?.commencementCount <= 0 ||
                            patientDetail?.prepCommencementCount === null ||
                            patientDetail?.prepCommencementCount <= 0) &&
                            (patientObj?.hivresultAtVisit === 'Negative' ||
                              !patientDetail?.hivPositive ||
                              patientDetail?.hivPositive === null) && (
                              <ProtectedComponent
                                isAuthorized={userPermissions.commencement}
                                privateComponent={() => (
                                  <Menu.Item onClick={loadPrEPCommencementForm}>
                                    PrEP Commencement
                                  </Menu.Item>
                                )}
                              />
                            )}
                          {(patientObj?.hivresultAtVisit === 'Negative' ||
                            !patientDetail?.hivPositive ||
                            patientDetail?.hivPositive === null) && (
                            <ProtectedComponent
                              isAuthorized={userPermissions.visit}
                              privateComponent={() => (
                                <Menu.Item onClick={onClickConsultation}>
                                  PrEP Visit
                                </Menu.Item>
                              )}
                            />
                          )}
                          {(patientObj?.hivresultAtVisit === 'Negative' ||
                            !patientDetail?.hivPositive ||
                            patientDetail?.hivPositive === null) && (
                            <ProtectedComponent
                              isAuthorized={userPermissions.discontinuation}
                              privateComponent={() => (
                                <Menu.Item
                                  onClick={
                                    loadPrEPDiscontinuationsInterruptions
                                  }
                                >
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
                        </>
                      )}
                    </>
                  )}
                  <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
                </>
              )
            ) : (
              <>
                <Menu.Item onClick={onClickHome}>Home</Menu.Item>
                {(patientObj?.hivresultAtVisit === 'Negative' ||
                  !patientDetail?.hivPositive ||
                  patientDetail?.hivPositive === null ||
                  patientObj?.hivresultAtVisit === null) && (
                  <ProtectedComponent
                    isAuthorized={userPermissions.eligibility}
                    privateComponent={() => (
                      <Menu.Item onClick={loadPrEPEligibiltyScreeningForm}>
                        PrEP Eligibility Screening
                      </Menu.Item>
                    )}
                  />
                )}
                {(patientObj?.hivresultAtVisit === 'Negative' ||
                  !patientDetail?.hivPositive ||
                  patientDetail?.hivPositive === null ||
                  patientObj?.hivresultAtVisit === null) &&
                  (patientObj?.prepCount === '0' ||
                    patientDetail?.prepCount === 0) && (
                    <ProtectedComponent
                      isAuthorized={userPermissions.enrollment}
                      privateComponent={() => (
                        <Menu.Item onClick={loadPrEPRegistrationForm}>
                          PrEP Enrollment
                        </Menu.Item>
                      )}
                    />
                  )}
                {(patientObj?.hivresultAtVisit === 'Negative' ||
                  !patientDetail?.hivPositive ||
                  patientDetail?.hivPositive === null ||
                  patientObj?.hivresultAtVisit === null) &&
                  (patientObj?.commencementCount === null ||
                    patientObj?.commencementCount <= 0 ||
                    patientDetail?.prepCommencementCount === null ||
                    patientDetail?.prepCommencementCount <= 0) && (
                    <ProtectedComponent
                      isAuthorized={userPermissions.commencement}
                      privateComponent={() => (
                        <Menu.Item onClick={loadPrEPCommencementForm}>
                          PrEP Commencement
                        </Menu.Item>
                      )}
                    />
                  )}
                {(patientObj?.hivresultAtVisit === 'Negative' ||
                  !patientDetail?.hivPositive ||
                  patientDetail?.hivPositive === null ||
                  patientObj?.hivresultAtVisit === null) && (
                  <ProtectedComponent
                    isAuthorized={userPermissions.visit}
                    privateComponent={() => (
                      <Menu.Item onClick={onClickConsultation}>
                        PrEP Visit
                      </Menu.Item>
                    )}
                  />
                )}
                {(patientObj?.hivresultAtVisit === 'Negative' ||
                  !patientDetail?.hivPositive ||
                  patientDetail?.hivPositive === null ||
                  patientObj?.hivresultAtVisit === null) && (
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
            )}
          </>
        )}
      </Menu>
    </div>
  );
}

export default SubMenu;

import React, { useState, useEffect } from 'react';
import { Menu } from 'semantic-ui-react';
import ProtectedComponent from '../PrepServices/PrivateComponent';
import { useAuth } from '../../../context/AuthProvider/AuthProvider';
import axios from 'axios';
import { token, url as baseUrl } from '../../../api';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';

function SubMenu(props) {
  const patientObj = props.patientObj;
  const [patientDetail, setPatientDetail] = useState();
  const { userPermissions } = useAuth();
  const history = useLocation();
  const patientObjLocation =
    history.location && history.location.state
      ? history.location.state.patientObj
      : {};

  useEffect(() => {
    PatientObject();
  }, []);

  async function PatientObject() {
    axios
      .get(
        `${baseUrl}prep/persons/${
          patientObjLocation.personId || history?.state?.patientObj?.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        console.log('response.data: ', response.data);
        setPatientDetail(response.data);
      })
      .catch(error => {});
  }

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
        {patientObj?.createdBy !== 'ETL' ||
        patientDetail?.createdBy !== 'ETL' ? (
          patientDetail && (
            <>
              <Menu.Item onClick={onClickHome}>Home</Menu.Item>

              {patientObj?.eligibilityCount <= 0 ||
              patientDetail?.prepEligibilityCount <= 0 ||
              patientObj?.eligibilityCount === null ||
              patientDetail?.prepEligibilityCount === null ? (
                <ProtectedComponent
                  isAuthorized={userPermissions.eligibility || true}
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
                            isAuthorized={userPermissions.enrollment || true}
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
                            isAuthorized={userPermissions.commencement || true}
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
                        isAuthorized={userPermissions.eligibility || true}
                        privateComponent={() => (
                          <Menu.Item onClick={loadPrEPEligibiltyScreeningForm}>
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
                            isAuthorized={userPermissions.enrollment || true}
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
                            isAuthorized={userPermissions.commencement || true}
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
                          isAuthorized={userPermissions.visit || true}
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
                          isAuthorized={userPermissions.discontinuation || true}
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
                        isAuthorized={userPermissions.patientVisits || true}
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
                isAuthorized={userPermissions.eligibility || true}
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
                  isAuthorized={userPermissions.enrollment || true}
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
                  isAuthorized={userPermissions.commencement || true}
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
                isAuthorized={userPermissions.visit || true}
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
                isAuthorized={userPermissions.discontinuation || true}
                privateComponent={() => (
                  <Menu.Item onClick={loadPrEPDiscontinuationsInterruptions}>
                    PrEP Discontinuations & Interruptions
                  </Menu.Item>
                )}
              />
            )}
            <ProtectedComponent
              isAuthorized={userPermissions.patientVisits || true}
              privateComponent={() => (
                <Menu.Item onClick={loadPatientVisits}>
                  Patient Visits
                </Menu.Item>
              )}
            />
            <Menu.Item onClick={loadPatientHistory}>History</Menu.Item>
          </>
        )}
      </Menu>
    </div>
  );
}

export default SubMenu;

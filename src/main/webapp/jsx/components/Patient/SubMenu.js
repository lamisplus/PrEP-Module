import React, { useState, useEffect } from 'react';
import { Menu, Popup } from 'semantic-ui-react';

function SubMenu(props) {
  const patientObj = props.patientObj;
  useEffect(() => {
    //Observation();
  }, [props.patientObj]);

  const loadPrEPDiscontinuationsInterruptions = row => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-interruptions',
    });
  };
  const loadPrEPRegistrationForm = row => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-registration',
    });
  };
  const loadPrEPCommencementForm = row => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'prep-commencement',
    });
  };
  const loadPrEPEligibiltyScreeningForm = row => {
    props.setActiveContent({ ...props.activeContent, route: 'prep-screening' });
  };

  const onClickConsultation = row => {
    props.setActiveContent({ ...props.activeContent, route: 'consultation' });
  };
  const onClickHome = row => {
    props.setActiveContent({ ...props.activeContent, route: 'recent-history' });
  };
  const loadPatientHistory = () => {
    props.setActiveContent({
      ...props.activeContent,
      route: 'patient-history',
    });
  };

  return (
    <div>
      <Menu size="large" color={'black'} inverted>
        {patientObj.createdBy !== 'ETL' ? ( //The menu will show if the patient is not migrated
          <>
            <Menu.Item onClick={() => onClickHome()}>Home</Menu.Item>

            {patientObj.eligibilityCount <= 0 ||
            patientObj.eligibilityCount === null ? (
              <>
                <Menu.Item onClick={() => loadPrEPEligibiltyScreeningForm()}>
                  PrEP Eligibility Screening
                </Menu.Item>
              </>
            ) : (
              <>
                {/* check if the patient has done prep commencement */}
                {patientObj.prepCount === '0' ||
                patientObj.commencementCount === null ? (
                  <>
                    {patientObj.prepCount === '0' &&
                      patientObj.hivresultAtVisit === 'Negative' && (
                        <Menu.Item onClick={() => loadPrEPRegistrationForm()}>
                          PrEP Enrollment
                        </Menu.Item>
                      )}
                    {(patientObj.commencementCount === null ||
                      patientObj.commencementCount <= 0) &&
                      patientObj.hivresultAtVisit === 'Negative' && (
                        <Menu.Item onClick={() => loadPrEPCommencementForm()}>
                          PrEP Commencement
                        </Menu.Item>
                      )}
                  </>
                ) : (
                  <>
                    <Menu.Item
                      onClick={() => loadPrEPEligibiltyScreeningForm()}
                    >
                      {' '}
                      PrEP Eligibility Screening{' '}
                    </Menu.Item>
                    {(patientObj.prepCount === null ||
                      patientObj.prepCount < 0) &&
                      patientObj.hivresultAtVisit === 'Negative' && (
                        <Menu.Item onClick={() => loadPrEPRegistrationForm()}>
                          PrEP Enrollment
                        </Menu.Item>
                      )}
                    {(patientObj.commencementCount === null ||
                      patientObj.commencementCount <= 0) &&
                      patientObj.hivresultAtVisit === 'Negative' && (
                        <Menu.Item onClick={() => loadPrEPCommencementForm()}>
                          PrEP Commencement
                        </Menu.Item>
                      )}
                    {patientObj.hivresultAtVisit === 'Negative' && (
                      <Menu.Item onClick={() => onClickConsultation()}>
                        {' '}
                        PrEP Visit
                      </Menu.Item>
                    )}
                    {patientObj.hivresultAtVisit === 'Negative' && (
                      <Menu.Item
                        onClick={() => loadPrEPDiscontinuationsInterruptions()}
                      >
                        PrEP Discontinuations & Interruptions
                      </Menu.Item>
                    )}
                  </>
                )}
              </>
            )}
            <Menu.Item onClick={() => loadPatientHistory(patientObj)}>
              History
            </Menu.Item>
          </>
        ) : (
          <>
            {/* This menu will show only if the patient is migrated  and check if the patient last HIV test result is not positive*/}
            <Menu.Item onClick={() => onClickHome()}>Home</Menu.Item>
            {(patientObj.hivresultAtVisit === 'Negative' ||
              patientObj.hivresultAtVisit === null) && (
              <Menu.Item onClick={() => loadPrEPEligibiltyScreeningForm()}>
                PrEP Eligibility Screening
              </Menu.Item>
            )}
            {(patientObj.hivresultAtVisit === 'Negative' ||
              patientObj.hivresultAtVisit === null) &&
              patientObj.prepCount === '0' && (
                <Menu.Item onClick={() => loadPrEPRegistrationForm()}>
                  PrEP Enrollment
                </Menu.Item>
              )}
            {(patientObj.hivresultAtVisit === 'Negative' ||
              patientObj.hivresultAtVisit === null) &&
              (patientObj.commencementCount === null ||
                patientObj.commencementCount <= 0) && (
                <Menu.Item onClick={() => loadPrEPCommencementForm()}>
                  PrEP Commencement
                </Menu.Item>
              )}
            {(patientObj.hivresultAtVisit === 'Negative' ||
              patientObj.hivresultAtVisit === null) && (
              <Menu.Item onClick={() => onClickConsultation()}>
                {' '}
                PrEP Visit
              </Menu.Item>
            )}
            {(patientObj.hivresultAtVisit === 'Negative' ||
              patientObj.hivresultAtVisit === null) && (
              <Menu.Item
                onClick={() => loadPrEPDiscontinuationsInterruptions()}
              >
                PrEP Discontinuations & Interruptions
              </Menu.Item>
            )}
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

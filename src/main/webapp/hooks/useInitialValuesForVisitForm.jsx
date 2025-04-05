import React, { useState } from 'react';
import momentLocalizer from 'react-widgets-moment';

export function getCurrentDateFormatted() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Assuming patientObj is the only necessary parameter
const useInitialValuesForVisitForm = (patientObj, objValues) => {
  const [initialValues, setInitialValues] = useState({
    adherenceLevel: '',
    dateInitialAdherenceCounseling: '',
    datePrepGiven: '',
    datePrepStart: '',
    dateReferre: '',
    diastolic: '',
    encounterDate: getCurrentDateFormatted(),
    extra: {},
    height: '',
    hepatitis: {},
    nextAppointment: '',
    prepNotedSideEffects: [],
    notedSideEffects: '',
    wasPrepAdministered: '',
    otherTestsDone: [],
    personId: patientObj?.personId || '', // Use patientObj parameter
    pregnancyStatus: '',
    prepEnrollmentUuid: '',
    pulse: '',
    referred: '',
    regimenId: '',
    otherRegimenId: '',
    otherPrepGiven: '',
    respiratoryRate: '',
    riskReductionServices: '',
    healthCareWorkerSignature: '',
    stiScreening: '',
    syndromicStiScreening: null,
    syphilis: {},
    systolic: '',
    temperature: '',
    urinalysis: {},
    creatinine: {},
    urinalysisResult: '',
    creatinineResult: '',
    weight: '',
    why: '',
    otherDrugs: '',
    prepGiven: '',
    hivTestResult: '',
    hivTestResultDate: '',
    prepType: '',
    otherPrepType: '',
    populationType: '',
    prepDistributionSetting: '',
    familyPlanning: '',
    dateOfFamilyPlanning: '',
    monthsOfRefill: '',
    visitType: '',
    reasonForSwitch: '',
    dateLiverFunctionTestResults: '',
    liverFunctionTestResults: '',
  });

  return { initialValues };
};

export default useInitialValuesForVisitForm;

// Assuming patientObj is the only necessary parameter
import React, { useState, useEffect } from 'react';
export const getCurrentDateFormatted = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const useInitialValuesForVisitForm = (patientObj, objValues) => {
  const [initialValues, setInitialValues] = useState(() => ({
    adherenceLevel: '',
    dateInitialAdherenceCounseling: '',
    datePrepGiven: '',
    datePrepStart: '',
    dateReferre: '',
    diastolic: '',
    encounterDate: '',
    extra: {},
    height: '',
    hepatitis: {},
    nextAppointment: '',
    prepNotedSideEffects: [],
    notedSideEffects: '',
    wasPrepAdministered: '',
    otherTestsDone: [],
    personId: patientObj?.personId || '',
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
    hivTestValue: '',
    hivTestResultDate: '',
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
  }));

  useEffect(() => {
    setInitialValues(prevValues => ({
      ...prevValues,
      encounterDate: getCurrentDateFormatted(),
    }));
  }, [patientObj, objValues]);
  return { initialValues };
};

export default useInitialValuesForVisitForm;

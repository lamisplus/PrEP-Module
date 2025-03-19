import axios from 'axios';
import { token, url as baseUrl } from '../../../api';

export const getPregnancyStatus = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPrepEntryPoint = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PrEP_ENTRY_POINT`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPrepType = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PrEP_TYPE`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTestGroup = async () => {
  return await axios.get(`${baseUrl}laboratory/labtestgroups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getReasonForSwitch = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/REASON_METHOD_SWITCH`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const checkEligibleForCabLa = async (personId, currentDate) => {
  return await axios.get(
    `${baseUrl}prep-clinic/checkEnableCab/${personId}/${currentDate}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPatientVisit = async id => {
  return await axios.get(`${baseUrl}prep-clinic/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getHivResult = async personId => {
  return await axios.get(`${baseUrl}prep-clinic/hts-record/${personId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPatientDtoObj = async personId => {
  return await axios.get(
    `${baseUrl}prep/enrollment/open/patients/${personId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPrepEligibilityObj = async personId => {
  return await axios.get(
    `${baseUrl}prep/eligibility/open/patients/${personId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPrepRegimen = async () => {
  return await axios.get(`${baseUrl}prep-regimen`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPrepStatus = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PREP_STATUS`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPrepRiskReductionPlan = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/PrEP_RISK_REDUCTION_PLAN`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPrepSideEffects = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getHts = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/HTS_RESULT`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getLatestFromEligibility = async personId => {
  return await axios.get(`${baseUrl}prep-eligibility/person/${personId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPopulationType = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/POPULATION_TYPE`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVisitType = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PrEP_VISIT_TYPE`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getWhyPoorFairAdherence = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/WHY_POOR_FAIR_ADHERENCE`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getSyndromicStiScreening = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/SYNDROMIC_STI_SCREENING`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPrepUrinalysisResult = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/PREP_URINALYSIS_RESULT`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getCreatinineTestResultOptions = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/CREATININE_TEST_RESULT`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPrepOtherTests = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PREP_OTHER_TEST`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSyphilisResult = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/SYPHILIS_RESULT`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getHapetitisScreeningResult = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/HEPATITIS_SCREENING_RESULT`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getFamilyPlanningMethod = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/FAMILY_PLANNING_METHOD`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getAdherenceLevel = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getRecentActivities = async personId => {
  return await axios.get(
    `${baseUrl}prep/activities/patients/${personId}?full=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getLiverFunctionTestResult = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/LIVER_FUNCTION_TEST_RESULT`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const saveClinicVisit = async (id, objValues, actionType) => {
  const url =
    actionType === 'update'
      ? `${baseUrl}prep-clinic/${id}`
      : `${baseUrl}prep/clinic-visit`;
  const method = actionType === 'update' ? 'put' : 'post';
  return await axios[method](url, objValues, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

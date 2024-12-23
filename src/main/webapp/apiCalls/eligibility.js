import axios from 'axios';
import { token, url as baseUrl } from '../api';

export const getPatientPrepEligibility = async id => {
  return await axios.get(`${baseUrl}prep/eligibility/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCounselingType = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/COUNSELING_TYPE`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVisitType = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PrEP_VISIT_TYPE`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getReasonForDecline = async () => {
  return await axios.get(
    `${baseUrl}application-codesets/v2/REASON_PREP_DECLINED`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getPopulationType = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/POPULATION_TYPE`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPregnancyStatus = async () => {
  return await axios.get(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export const savePrepEligibility = async (id, objValues, actionType) => {
  const url =
    actionType === 'update'
      ? `${baseUrl}prep-eligibility/${id}`
      : `${baseUrl}prep/eligibility`;
  const method = actionType === 'update' ? 'put' : 'post';
  return await axios[method](url, objValues, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

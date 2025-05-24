import axios from 'axios';
import { token, url as baseUrl } from '../../../api';

export const getTestGroup = async () => {
  return await axios.get(`${baseUrl}laboratory/labtestgroups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export const getLatestFromEligibility = async personId => {
  return await axios.get(`${baseUrl}prep-eligibility/person/${personId}`, {
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

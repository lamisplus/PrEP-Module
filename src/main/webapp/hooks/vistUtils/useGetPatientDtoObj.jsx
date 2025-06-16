import axios from 'axios';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useGetPatientDtoObj = () => {
  const getPatientDtoObj = useCallback(async (personId, baseUrl, token) => {
    return await axios.get(
      `${baseUrl}prep/enrollment/open/patients/${personId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }, []);
  return { getPatientDtoObj };
};

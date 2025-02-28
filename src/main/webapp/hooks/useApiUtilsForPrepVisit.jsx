import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url as baseUrl, token } from '../api';

const useApiDataWithLogic = (url, initialState, logicFunction) => {
  const [data, setData] = useState(initialState);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const processedData = logicFunction(response.data);
      setData(processedData);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [url, logicFunction]);

  return { data, setData };
};

export const useLatestFromEligibility = personId => {
  const sortByVisitDateDescending = data => {
    return data.sort((a, b) => {
      const dateA = new Date(a.visitDate);
      const dateB = new Date(b.visitDate);
      return dateB - dateA;
    });
  };

  const logicFunction = useCallback(data => {
    const latestEligibility = sortByVisitDateDescending(data)[0];
    return latestEligibility;
  }, []);

  return useApiDataWithLogic(
    `${baseUrl}prep-eligibility/person/${personId}`,
    null,
    logicFunction
  );
};

export const usePrepEligibilityObj = personId => {
  const logicFunction = useCallback(
    data => {
      return data;
    },
    [personId]
  );

  return useApiDataWithLogic(
    `${baseUrl}prep/eligibility/open/patients/${personId}`,
    null,
    logicFunction
  );
};

export const usePatientDtoObj = personId => {
  const logicFunction = useCallback(
    data => {
      return data;
    },
    [personId]
  );

  return useApiDataWithLogic(
    `${baseUrl}prep/enrollment/open/patients/${personId}`,
    null,
    logicFunction
  );
};

export const useHivResult = personId => {
  const logicFunction = useCallback(
    data => {
      const hivTestValue = data[0]?.hivTestResult;
      const hivTestResultDate = data[0]?.visitDate;
      return { hivTestValue, hivTestResultDate };
    },
    [personId]
  );

  return useApiDataWithLogic(
    `${baseUrl}prep-clinic/hts-record/${personId}`,
    {},
    logicFunction
  );
};

export const usePatientVisit = (id, setOtherTest) => {
  const logicFunction = useCallback(
    data => {
      const parsedData = JSON.parse(JSON.stringify(data));
      const otherTestsDone = parsedData.otherTestsDone;
      setOtherTest(otherTestsDone);
      return parsedData;
    },
    [id, setOtherTest]
  );

  return useApiDataWithLogic(
    `${baseUrl}prep-clinic/${id}`,
    null,
    logicFunction
  );
};

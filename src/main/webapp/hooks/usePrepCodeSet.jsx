import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { url as baseUrl, token } from '../api';

const useApiData = (url, initialState = []) => {
  const [data, setData] = useState(initialState);
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return { data, setData };
};

export const usePregnancyStatus = () =>
  useApiData(`${baseUrl}application-codesets/v2/PREGNANCY_STATUS`);
export const usePrepEntryPoint = () =>
  useApiData(`${baseUrl}application-codesets/v2/PrEP_ENTRY_POINT`);
export const usePrepType = () =>
  useApiData(`${baseUrl}application-codesets/v2/PrEP_TYPE`);
export const useTestGroup = () =>
  useApiData(`${baseUrl}laboratory/labtestgroups`);
export const useReasonForSwitch = () =>
  useApiData(`${baseUrl}application-codesets/v2/REASON_METHOD_SWITCH`);
export const usePrepStatus = () =>
  useApiData(`${baseUrl}application-codesets/v2/PREP_STATUS`);
export const usePrepRiskReductionPlan = () =>
  useApiData(`${baseUrl}application-codesets/v2/PrEP_RISK_REDUCTION_PLAN`);
export const usePrepSideEffects = () =>
  useApiData(`${baseUrl}application-codesets/v2/PREP_SIDE_EFFECTS`);
export const useHts = () =>
  useApiData(`${baseUrl}application-codesets/v2/HTS_RESULT`);
export const usePopulationType = () =>
  useApiData(`${baseUrl}application-codesets/v2/POPULATION_TYPE`);
export const useVisitType = () =>
  useApiData(`${baseUrl}application-codesets/v2/PrEP_VISIT_TYPE`);
export const useWhyPoorFairAdherence = () =>
  useApiData(`${baseUrl}application-codesets/v2/WHY_POOR_FAIR_ADHERENCE`);
export const useSyndromicStiScreening = () =>
  useApiData(`${baseUrl}application-codesets/v2/SYNDROMIC_STI_SCREENING`);
export const usePrepUrinalysisResult = () =>
  useApiData(`${baseUrl}application-codesets/v2/PREP_URINALYSIS_RESULT`);
export const useCreatinineTestResultOptions = () =>
  useApiData(`${baseUrl}application-codesets/v2/CREATININE_TEST_RESULT`);
export const usePrepOtherTests = () =>
  useApiData(`${baseUrl}application-codesets/v2/PREP_OTHER_TEST`);
export const useSyphilisResult = () =>
  useApiData(`${baseUrl}application-codesets/v2/SYPHILIS_RESULT`);
export const useHepatitisScreeningResult = () =>
  useApiData(`${baseUrl}application-codesets/v2/HEPATITIS_SCREENING_RESULT`);
export const useFamilyPlanningMethod = () =>
  useApiData(`${baseUrl}application-codesets/v2/FAMILY_PLANNING_METHOD`);
export const useAdherenceLevel = () =>
  useApiData(`${baseUrl}application-codesets/v2/PrEP_LEVEL_OF_ADHERENCE`);
export const usePrepRegimen = () => useApiData(`${baseUrl}prep-regimen`);
export const useLiverFunctionTestResult = () =>
  useApiData(`${baseUrl}application-codesets/v2/LIVER_FUNCTION_TEST_RESULT`);
export const useRecentActivities = personId =>
  useApiData(`${baseUrl}prep/activities/patients/${personId}?full=true`);

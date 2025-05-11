import { useEffect, useMemo } from 'react';
import useCheckDateMismatch from './useCheckDateMismatch';
import useVisitTypeDurationMapping from './vistUtils/useVisitTypeDurationMapping';

const useSetPrepVisitAutopopulatedValues = (
  formik,
  localEncounterDate,
  latestFromEligibility,
  latestHtsResult,
  isInitialValues
) => {
  const { checkDateMismatch } = useCheckDateMismatch();
  const { visitTypeDurationMapping } = useVisitTypeDurationMapping();
  useEffect(() => {
    const isMatchedDate = checkDateMismatch(
      localEncounterDate,
      latestFromEligibility?.visitDate,
      isInitialValues
    );

    const getValue = (matchedValue, defaultValue = '') =>
      isMatchedDate ? matchedValue : defaultValue;

    formik.setValues(prevs => ({
      ...prevs,
      hivTestValue: getValue(latestHtsResult?.hivTestValue),
      hivTestResult: getValue(latestHtsResult?.hivTestValue),
      hivTestResultDate: getValue(latestHtsResult?.hivTestResultDate),
      populationType: getValue(latestFromEligibility?.populationType),
      visitType: getValue(latestFromEligibility?.visitType),
      monthsOfRefill: getValue(
        visitTypeDurationMapping[latestFromEligibility?.visitType]
      ),
      liverFunctionTestResults: getValue(
        latestFromEligibility?.liverFunctionTestResults
      ),
      dateLiverFunctionTestResults: getValue(
        latestFromEligibility?.dateLiverFunctionTestResults
      ),
      pregnancyStatus: getValue(latestFromEligibility?.pregnancyStatus),
      pregnant: getValue(latestFromEligibility?.pregnancyStatus),
    }));
  }, [localEncounterDate]);
};

export default useSetPrepVisitAutopopulatedValues;

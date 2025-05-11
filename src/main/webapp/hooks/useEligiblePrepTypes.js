import { useMemo } from 'react';

const useEligiblePrepTypes = (isEligibleForCabLa, actionType, prepType) => {
  return useMemo(() => {
    return isEligibleForCabLa || actionType === 'update'
      ? [...prepType]
      : [...prepType].filter(({ id }) => ![1373, 1726].includes(id));
  }, [isEligibleForCabLa, actionType, prepType]);
};

export default useEligiblePrepTypes;

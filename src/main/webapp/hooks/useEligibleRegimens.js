import { useMemo } from 'react';

const useEligibleRegimens = (isEligibleForCabLa, actionType, prepRegimen) => {
  return useMemo(() => {
    return isEligibleForCabLa || actionType === 'update'
      ? [...prepRegimen]
      : [...prepRegimen].filter(({ id }) => id !== 2);
  }, [isEligibleForCabLa, actionType, prepRegimen]);
};

export default useEligibleRegimens;

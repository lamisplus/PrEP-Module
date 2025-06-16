import { useCallback } from 'react';

const useIsLastVisitTypeMethodSwitch = currentVisitType => {
  const isLastVisitTypeMethodSwitch = useCallback(() => {
    const testCode = 'PREP_VISIT_TYPE_METHOD_SWITCH';
    return currentVisitType === testCode;
  }, [currentVisitType]);

  return { isLastVisitTypeMethodSwitch };
};

export default useIsLastVisitTypeMethodSwitch;

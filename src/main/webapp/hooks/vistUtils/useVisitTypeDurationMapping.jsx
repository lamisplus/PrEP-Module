import React from 'react';

const useVisitTypeDurationMapping = () => {
  const visitTypeDurationMapping = {
    PREP_VISIT_TYPE_DISCONTINUATION: undefined,
    'PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP': undefined,
    PREP_VISIT_TYPE_INITIATION: 30,
    PREP_VISIT_TYPE_METHOD_SWITCH: undefined,
    PREP_VISIT_TYPE_NO_PREP_PROVIDED: undefined,
    'PREP_VISIT_TYPE_REFILL_RE-INJECTION': 60,
    PREP_VISIT_TYPE_RESTART: 30,
    PREP_VISIT_TYPE_SECOND_INITIATION: 60,
    PREP_VISIT_TYPE_TRANSFER_IN: undefined,
  };

  return { visitTypeDurationMapping };
};

export default useVisitTypeDurationMapping;

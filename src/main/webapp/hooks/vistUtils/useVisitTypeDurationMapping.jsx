import React from 'react';

const useVisitTypeDurationMapping = () => {
  const visitTypeDurationMapping = {
    PREP_VISIT_TYPE_DISCONTINUATION: null,
    'PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP': null,
    PREP_VISIT_TYPE_INITIATION: 30,
    PREP_VISIT_TYPE_METHOD_SWITCH: null,
    PREP_VISIT_TYPE_NO_PREP_PROVIDED: null,
    'PREP_VISIT_TYPE_REFILL_RE-INJECTION': 60,
    PREP_VISIT_TYPE_RESTART: 30,
    PREP_VISIT_TYPE_SECOND_INITIATION: 60,
    PREP_VISIT_TYPE_TRANSFER_IN: null,
  };

  return { visitTypeDurationMapping };
};

export default useVisitTypeDurationMapping;

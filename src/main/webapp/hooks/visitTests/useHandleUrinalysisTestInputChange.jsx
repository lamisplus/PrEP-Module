import React from 'react';

export const useHandleUrinalysisTestInputChange = (
  setErrors,
  setUrinalysisTest,
  urinalysisTest,
  errors
) => {
  const handleUrinalysisTestInputChange = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };

  return { handleUrinalysisTestInputChange };
};

import React from 'react';

export const useHandleCheckboxUrinalysisTest = (
  setErrors,
  setUrinalysisTest,
  urinalysisTest,
  errors
) => {
  const handleCheckboxUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (urinalysisTest?.urinalysisTest === 'Yes') {
      setUrinalysisTest({ urinalysisTest: 'No', testDate: '', result: '' });
    } else {
      setUrinalysisTest({ ...urinalysisTest, urinalysisTest: 'Yes' });
    }
  };

  return { handleCheckboxUrinalysisTest };
};

import React from 'react';

export const useHandleCheckboxCreatinineTest = (
  setErrors,
  setCreatinineTest,
  creatinineTest,
  errors
) => {
  const handleCheckboxCreatinineTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (creatinineTest?.creatinineTest === 'Yes') {
      setCreatinineTest({ creatinineTest: 'No', testDate: '', result: '' });
    } else {
      setCreatinineTest({ ...creatinineTest, creatinineTest: 'Yes' });
    }
  };

  return { handleCheckboxCreatinineTest };
};

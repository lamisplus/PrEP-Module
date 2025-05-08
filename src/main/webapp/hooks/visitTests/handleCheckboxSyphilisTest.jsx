import React from 'react';

export const useHandleCheckboxSyphilisTest = (
  setErrors,
  setSyphilisTest,
  syphilisTest,
  errors
) => {
  const handleCheckboxSyphilisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (syphilisTest?.syphilisTest === 'Yes') {
      setSyphilisTest({
        syphilisTest: 'No',
        testDate: '',
        result: '',
        others: '',
      });
    } else {
      setSyphilisTest({ ...syphilisTest, syphilisTest: 'Yes' });
    }
  };

  return { handleCheckboxSyphilisTest };
};

import React from 'react';

export const useHandleCheckboxOtherTest = (
  setErrors,
  setOtherTest,
  otherTest,
  objValues,
  errors
) => {
  const handleCheckboxOtherTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (otherTest.length > 0) {
      setOtherTest([]);
    } else {
      setOtherTest([
        ...otherTest,
        ...objValues.otherTestsDone,
        {
          localId: objValues.otherTestsDone?.length || 0,
          otherTest: 'Yes',
          testDate: '',
          result: '',
          name: '',
          otherTestName: '',
        },
      ]);
    }
  };

  return { handleCheckboxOtherTest };
};

import React from 'react';

const useTestCleanup = (
  setHepatitisTest,
  setUrinalysisTest,
  setSyphilisTest
) => {
  const resetHepatitisTest = () => {
    setHepatitisTest({
      hepatitisTest: 'No',
      testDate: '',
      result: '',
    });
  };
  const resetUrinalysisTest = () => {
    setUrinalysisTest({
      urinalysisTest: 'No',
      testDate: '',
      result: '',
    });
  };
  const resetSyphilisTest = () => {
    setSyphilisTest({
      syphilisTest: 'No',
      testDate: '',
      result: '',
      others: '',
    });
  };

  return {
    resetHepatitisTest,
    resetUrinalysisTest,
    resetSyphilisTest,
  };
};

export default useTestCleanup;

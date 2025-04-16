import React from 'react';

const useUpdateTestResults = objValues => {
  const updateTest = (testType, setTestFunction) => {
    const testData = objValues[testType];
    if (
      testData?.testDate &&
      testData?.result &&
      testData?.[`${testType}Test`]
    ) {
      setTestFunction({
        ...testData,
        testDate: testData.testDate,
        result: testData.result,
        [`${testType}Test`]: testData[`${testType}Test`],
      });
    }
  };
  return {
    updateTest,
  };
};

export default useUpdateTestResults;

import { useCallback } from 'react';

const useCreateNewTest = setOtherTest => {
  const handleCreateNewTest = useCallback(() => {
    setOtherTest(prevTests => [
      ...prevTests,
      {
        localId: prevTests.length,
        otherTest: 'Yes',
        testDate: '',
        result: '',
        name: '',
        otherTestName: '',
      },
    ]);
  }, []);

  return { handleCreateNewTest };
};

export default useCreateNewTest;

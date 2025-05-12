import { useCallback } from 'react';

const useRemoveTest = setOtherTest => {
  const handleRemoveTest = useCallback(
    localId => {
      setOtherTest(prev => prev?.filter(test => test.localId !== localId));
    },
    [setOtherTest]
  );

  return { handleRemoveTest };
};

export default useRemoveTest;

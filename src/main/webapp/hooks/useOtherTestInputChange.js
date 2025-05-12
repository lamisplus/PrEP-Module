import { useCallback } from 'react';

const useOtherTestInputChange = (setOtherTest, otherTest) => {
  const handleInputChangeOtherTest = useCallback(
    (e, localId) => {
      let temp = [...otherTest];
      let index = temp.findIndex(x => Number(x.localId) === Number(localId));
      temp[index][e.target.name] = e.target.value;
      setOtherTest(temp);
    },
    [setOtherTest, otherTest]
  );

  const handleRemoveTest = useCallback(
    localId => {
      setOtherTest(prev => prev?.filter(test => test.localId !== localId));
    },
    [setOtherTest]
  );

  return { handleInputChangeOtherTest, handleRemoveTest };
};

export default useOtherTestInputChange;

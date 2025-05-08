import React from 'react';

export const useHandleOtherTestInputChange = (setOtherTest, otherTest) => {
  const handleOtherTestInputChange = (e, localId) => {
    let temp = [...otherTest];
    let index = temp.findIndex(x => Number(x.localId) === Number(localId));
    temp[index][e.target.name] = e.target.value;
    setOtherTest(temp);
  };

  return { handleOtherTestInputChange };
};

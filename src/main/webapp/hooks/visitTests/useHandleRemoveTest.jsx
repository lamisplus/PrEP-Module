import React from 'react';

export const useHandleRemoveTest = setOtherTest => {
  const handleRemoveTest = localId => {
    setOtherTest(prev => prev?.filter(test => test.localId !== localId));
  };

  return { handleRemoveTest };
};

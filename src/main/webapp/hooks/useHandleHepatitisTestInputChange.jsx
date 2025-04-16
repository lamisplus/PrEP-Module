import React from 'react';

export const useHandleHepatitisTestInputChange = (
  setErrors,
  setHepatitisTest,
  hepatitisTest,
  errors
) => {
  const handleHepatitisTestInputChange = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
  };

  return { handleHepatitisTestInputChange };
};

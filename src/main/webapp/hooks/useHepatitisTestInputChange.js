import { useCallback } from 'react';

const useHepatitisTestInputChange = (
  setErrors,
  setHepatitisTest,
  hepatitisTest,
  errors
) => {
  const handleInputChangeHepatitisTest = useCallback(
    e => {
      setErrors({ ...errors, [e.target.name]: '' });
      setHepatitisTest({ ...hepatitisTest, [e.target.name]: e.target.value });
    },
    [setErrors, setHepatitisTest, hepatitisTest, errors]
  );

  return { handleInputChangeHepatitisTest };
};

export default useHepatitisTestInputChange;

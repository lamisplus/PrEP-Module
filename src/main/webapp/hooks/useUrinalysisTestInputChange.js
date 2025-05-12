import { useCallback } from 'react';

const useUrinalysisTestInputChange = (
  setErrors,
  setUrinalysisTest,
  urinalysisTest,
  errors
) => {
  const handleInputChangeUrinalysisTest = useCallback(
    e => {
      setErrors({ ...errors, [e.target.name]: '' });
      setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
    },
    [setErrors, setUrinalysisTest, urinalysisTest, errors]
  );

  return { handleInputChangeUrinalysisTest };
};

export default useUrinalysisTestInputChange;

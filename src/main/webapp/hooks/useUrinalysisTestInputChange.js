const useUrinalysisTestInputChange = (
  setErrors,
  setUrinalysisTest,
  urinalysisTest,
  errors
) => {
  const handleInputChangeUrinalysisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setUrinalysisTest({ ...urinalysisTest, [e.target.name]: e.target.value });
  };

  return { handleInputChangeUrinalysisTest };
};

export default useUrinalysisTestInputChange;

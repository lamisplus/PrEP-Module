export const useHandleCreatinineTestInputChange = (
  setErrors,
  setCreatinineTest,
  creatinineTest,
  errors
) => {
  const handleCreatinineTestInputChange = e => {
    setErrors({
      ...errors,
      creatinineResult: '',
      creatinineTestDate: '',
    });
    setCreatinineTest({ ...creatinineTest, [e.target.name]: e.target.value });
  };

  return { handleCreatinineTestInputChange };
};

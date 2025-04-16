export const useHandleCheckboxHepatitisTest = (
  setErrors,
  setHepatitisTest,
  hepatitisTest,
  errors
) => {
  const handleCheckboxHepatitisTest = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    if (hepatitisTest?.hepatitisTest === 'Yes') {
      setHepatitisTest({ hepatitisTest: 'No', testDate: '', result: '' });
    } else {
      setHepatitisTest({ ...hepatitisTest, hepatitisTest: 'Yes' });
    }
  };

  return { handleCheckboxHepatitisTest };
};

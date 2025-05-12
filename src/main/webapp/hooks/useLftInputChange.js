import { useCallback } from 'react';

const useLftInputChange = formik => {
  const handleLftInputChange = useCallback(
    event => {
      const { name, value } = event.target;
      formik.setValues(prevValues => ({
        ...prevValues,
        [name]: value,
      }));
    },
    [formik]
  );

  return { handleLftInputChange };
};

export default useLftInputChange;

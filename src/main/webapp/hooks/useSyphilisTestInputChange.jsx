import React from 'react';

export const useSyphilisTestInputChange = (
  setSyphilisTest,
  setErrors,
  syphilisTest,
  errors
) => {
  const handleSyphilisTestInputChange = e => {
    setErrors({ ...errors, [e.target.name]: '' });
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    if (e.target.name === 'result' && e.target.value !== 'Others') {
      syphilisTest.others = '';
      setSyphilisTest({ ...syphilisTest, ['others']: '' });
      setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
    }
    setSyphilisTest({ ...syphilisTest, [e.target.name]: e.target.value });
  };
  return { handleSyphilisTestInputChange };
};

import React from 'react';

export const useCalculateAge = () => {
  const calculateAge = dob => {
    const today = new Date();
    const dateParts = dob.split('-');
    const dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    const birthDate = new Date(dateObject);
    let ageNow = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageNow--;
    }

    if (ageNow === 0) {
      return m + ' month(s)';
    }
    return ageNow + ' year(s)';
  };
  return { calculateAge };
};

export default useCalculateAge;

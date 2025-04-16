import React from 'react';

export const useHandleWeightInputValueCheck = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handleWeightInputValueCheck = e => {
    if (
      e.target.name === 'weight' &&
      (e.target.value < 3 || e.target.value > 150)
    ) {
      const message =
        '⚠ Body weight must not be greater than 150 and less than 3';
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, weight: '' });
    }
  };

  return { handleWeightInputValueCheck };
};

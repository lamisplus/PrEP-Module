import React from 'react';

export const useHandleDiastolicInputValueCheck = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handleDiastolicInputValueCheck = e => {
    if (
      e.target.name === 'diastolic' &&
      (e.target.value < 60 || e.target.value > 140)
    ) {
      const message =
        '⚠ Blood Pressure diastolic must not be greater than 140 and less than 60';
      setVitalClinicalSupport({ ...vitalClinicalSupport, diastolic: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, diastolic: '' });
    }
  };

  return { handleDiastolicInputValueCheck };
};

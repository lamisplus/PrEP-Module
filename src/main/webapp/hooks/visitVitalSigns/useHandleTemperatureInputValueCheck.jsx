import React from 'react';

export const useHandleTemperatureInputValueCheck = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handleTemperatureInputValueCheck = e => {
    if (
      e.target.name === 'temperature' &&
      (e.target.value < 35 || e.target.value > 47)
    ) {
      const message =
        '⚠ Temperature must not be greater than 47 and less than 35';
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        temperature: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, temperature: '' });
    }
  };

  return { handleTemperatureInputValueCheck };
};

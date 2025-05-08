import React from 'react';

export const useHandleRespiratoryRateInputValueCheck = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handleRespiratoryRateInputValueCheck = e => {
    if (
      e.target.name === 'respiratoryRate' &&
      (e.target.value < 10 || e.target.value > 70)
    ) {
      const message =
        '⚠ Respiratory Rate must not be greater than 70 and less than 10';
      setVitalClinicalSupport({
        ...vitalClinicalSupport,
        respiratoryRate: message,
      });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, respiratoryRate: '' });
    }
  };

  return { handleRespiratoryRateInputValueCheck };
};

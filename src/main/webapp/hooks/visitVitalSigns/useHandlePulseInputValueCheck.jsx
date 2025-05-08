import React from 'react';

export const useHandlePulseInputValueCheck = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handlePulseInputValueCheck = e => {
    if (
      e.target.name === 'pulse' &&
      (e.target.value < 40 || e.target.value > 120)
    ) {
      const message = '⚠ Pulse must not be greater than 120 and less than 40';
      setVitalClinicalSupport({ ...vitalClinicalSupport, pulse: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, pulse: '' });
    }
  };

  return { handlePulseInputValueCheck };
};

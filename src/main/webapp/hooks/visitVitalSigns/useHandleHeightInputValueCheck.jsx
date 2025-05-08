import React from 'react';

export const useHandleHeightInputValueChange = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handleHeightInputValueCheck = e => {
    if (
      e.target.name === 'height' &&
      (e.target.value < 48.26 || e.target.value > 216.408)
    ) {
      const message =
        '⚠ Height cannot be greater than 216.408 and less than 48.26';
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, height: '' });
    }
  };
  return { handleHeightInputValueCheck };
};

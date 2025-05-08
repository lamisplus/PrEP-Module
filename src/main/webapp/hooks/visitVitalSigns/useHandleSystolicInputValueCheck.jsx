export const useHandleSystolicInputValueCheck = (
  setVitalClinicalSupport,
  vitalClinicalSupport
) => {
  const handleSystolicInputValueCheck = e => {
    if (
      e.target.name === 'systolic' &&
      (e.target.value < 90 || e.target.value > 240)
    ) {
      const message =
        '⚠ Blood Pressure systolic must not be greater than 240 and less than 90';
      setVitalClinicalSupport({ ...vitalClinicalSupport, systolic: message });
    } else {
      setVitalClinicalSupport({ ...vitalClinicalSupport, systolic: '' });
    }
  };

  return { handleSystolicInputValueCheck };
};

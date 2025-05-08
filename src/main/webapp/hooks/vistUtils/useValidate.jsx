import React from 'react';

const useValidate = () => {
  const validate = (
    temp,
    objValues,
    hasPrepEligibility,
    encounters,
    hivTestValue,
    isFemale,
    setErrors
  ) => {
    temp.lastHts = hivTestValue
      ? ''
      : '⚠ Atleast, 1 HIV test result is required';
    temp.monthsOfRefill = objValues.monthsOfRefill
      ? ''
      : '⚠ This field is required';
    temp.wasPrepAdministered = objValues.wasPrepAdministered
      ? ''
      : '⚠ This field is required';
    hasPrepEligibility(temp.encounterDate, encounters);
    temp.encounterDate = objValues.encounterDate
      ? ''
      : '⚠ This field is required';
    if (isFemale()) {
      temp.pregnant = objValues.pregnant ? '' : '⚠ This field is required';
    }
    temp.nextAppointment = objValues.nextAppointment
      ? ''
      : '⚠ This field is required';

    temp.height = objValues.height ? '' : '⚠ This field is required';
    if (objValues.prepType === 'PREP_TYPE_INJECTIBLES') {
      temp.otherPrepGiven = objValues.otherPrepGiven
        ? ''
        : '⚠ This field is required';
    }
    temp.weight = objValues.weight ? '' : '⚠ This field is required';
    temp.regimenId = objValues.regimenId ? '' : '⚠ This field is required';
    temp.prepDistributionSetting = objValues.prepDistributionSetting
      ? ''
      : '⚠ This field is required';
    temp.populationType = objValues.populationType
      ? ''
      : '⚠ This field is required';
    temp.visitType = objValues.visitType ? '' : '⚠ This field is required';

    if (objValues.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH') {
      temp.reasonForSwitch = objValues.reasonForSwitch
        ? ''
        : '⚠ This field is required';
    } else {
      temp.reasonForSwitch = '';
    }

    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x === '');
  };
  return { validate };
};

export default useValidate;

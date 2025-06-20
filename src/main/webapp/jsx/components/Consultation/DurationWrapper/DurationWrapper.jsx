import React from 'react';
import InjectiblesDurationInput from '../InjectiblesDurationInput/InjectiblesDurationInput';
import OralsDurationInput from '../OralsDurationInput/OralsDurationInput';

const DurationWrapper = ({
  isCabLaEligible,
  isSelectedRegimenCabLa,
  name,
  value,
  handleInputChange,
  style,
  disabledField,
  setObjValues,
  ...restOfProps
}) => {
  const inputField =
    isCabLaEligible && isSelectedRegimenCabLa
      ? props => <InjectiblesDurationInput {...props} />
      : props => <OralsDurationInput {...props} />;

  return inputField
    ? inputField({
        name,
        value,
        handleInputChange,
        style,
        disabledField,
        setObjValues,
        ...restOfProps,
      })
    : null;
};

export default DurationWrapper;

import React from 'react';
import InjectiblesDurationInput from '../InjectiblesDurationInput/InjectiblesDurationInput';
import OralsDurationInput from '../OralsDurationInput/OralsDurationInput';

const durationInputMap = {
  PREP_TYPE_INJECTIBLES: props => <InjectiblesDurationInput {...props} />,
  PREP_TYPE_ORAL: props => <OralsDurationInput {...props} />,
  DEFAULT: props => <OralsDurationInput {...props} />,
};

const DurationWrapper = ({
  prepType,
  name,
  value,
  handleInputChange,
  style,
  disabledField,
  ...restOfProps
}) => {
  const inputField = durationInputMap[prepType];

  return inputField
    ? inputField({
        name,
        value,
        handleInputChange,
        style,
        disabledField,
        ...restOfProps,
      })
    : null;
};

export default DurationWrapper;

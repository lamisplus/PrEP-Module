import React from 'react';
import { Label as FormLabelName, Input } from 'reactstrap';
const OralsDurationInput = ({
  name,
  value,
  handleInputChange,
  style,
  disabledField,
}) => {
  return (
    <Input
      type={'number'}
      name={name}
      id={name}
      value={value}
      min={0}
      onChange={handleInputChange}
      style={style}
      disabled={disabledField}
    />
  );
};

export default OralsDurationInput;

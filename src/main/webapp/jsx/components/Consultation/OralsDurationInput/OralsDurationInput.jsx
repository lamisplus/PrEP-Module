import React from 'react';
import { Label as FormLabelName, Input } from 'reactstrap';
import { CleanupWrapper } from '../Home';
const OralsDurationInput = ({
  name,
  value,
  handleInputChange,
  style,
  disabledField,
  setObjValues,
}) => {
  return (
    <CleanupWrapper
      cleanup={() =>
        setObjValues(prev => ({ ...prev, monthsOfRefill: '', duration: '' }))
      }
    >
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
    </CleanupWrapper>
  );
};

export default OralsDurationInput;

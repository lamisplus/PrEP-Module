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
        // REPLACED monthsOfRefill/duration with the canonical refillDays.
        setObjValues(prev => ({ ...prev, refillDays: '' }))
      }
    >
      <Input
        type={'number'}
        name={name}
        id={name}
        value={value}
        min={1}
        onChange={handleInputChange}
        style={style}
        disabled={disabledField}
      />
    </CleanupWrapper>
  );
};

export default OralsDurationInput;

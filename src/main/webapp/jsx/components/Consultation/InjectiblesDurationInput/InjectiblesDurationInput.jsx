import React from 'react';
import { Input } from 'reactstrap';

const InjectiblesDurationInput = ({
  name,
  value,
  handleInputChange,
  style,
  disabledField,
}) => {
  return (
    <div>
      <Input
        type={'select'}
        name={name}
        id={name}
        value={value}
        onChange={handleInputChange}
        style={style}
        disabled={disabledField}
      >
        <option value={''}>Select Duration</option>
        {[30, 60].map(option => (
          <option key={option} value={option}>{`${option} days`}</option>
        ))}
      </Input>
    </div>
  );
};

export default InjectiblesDurationInput;

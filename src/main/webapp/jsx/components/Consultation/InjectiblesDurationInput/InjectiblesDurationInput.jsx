import React, { useEffect, useState } from 'react';
import { Input } from 'reactstrap';
import { url as baseUrl, token } from '../../../../api';
import axios from 'axios';

const InjectiblesDurationInput = ({
  name,
  value,
  handleInputChange,
  style,
  disabledField,
}) => {
  const [durationOfRefillOptions, setDurationOfRefillOptions] = useState([]);

  const getDurationOfRill = () => {
    axios
      .get(
        `${baseUrl}application-codesets/v2/DURATION_OF_CAB-LA_INJECTABLE_REFILL`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setDurationOfRefillOptions(response.data);
      })
      .catch(error => {});
  };

  useEffect(() => getDurationOfRill(), []);

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
        {durationOfRefillOptions.map(({ display, code }) => (
          <option key={code} value={code}>{`${display} days`}</option>
        ))}
      </Input>
    </div>
  );
};

export default InjectiblesDurationInput;

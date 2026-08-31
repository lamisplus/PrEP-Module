import React, { useEffect, useState } from 'react';
import { Input } from 'reactstrap';
import { CleanupWrapper } from '../Home';
import { fetchCabLaRefillDurations } from '../codesets';

const InjectiblesDurationInput = ({
  name,
  value,
  handleInputChange,
  style,
  disabledField,
  setObjValues,
}) => {
  const [durationOfRefillOptions, setDurationOfRefillOptions] = useState([]);

  useEffect(() => {
    fetchCabLaRefillDurations().then(setDurationOfRefillOptions).catch(() => {});
  }, []);

  return (
    <CleanupWrapper
      cleanup={() =>
        // REPLACED monthsOfRefill/duration with the canonical refillDays.
        setObjValues(prev => ({ ...prev, refillDays: '' }))
      }
    >
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
            <option key={code} value={code}>{display}</option>
          ))}
        </Input>
      </div>
    </CleanupWrapper>
  );
};

export default InjectiblesDurationInput;

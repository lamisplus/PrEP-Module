import React from 'react';
import { Label as FormLabelName, Input } from 'reactstrap';
import { CleanupWrapper } from '../Home';
import {
  MAX_REFILL_DAYS,
  MIN_REFILL_DAYS,
  blockNonNumericRefillDaysKeys,
  withRefillDaysGuard,
  withRefillDaysPasteGuard,
} from '../../../constants/refillDays';
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
        min={MIN_REFILL_DAYS}
        max={MAX_REFILL_DAYS}
        step={1}
        inputMode={'numeric'}
        // Digits only, no negatives, capped at MAX_REFILL_DAYS.
        onKeyDown={blockNonNumericRefillDaysKeys}
        onPaste={withRefillDaysPasteGuard(handleInputChange)}
        onChange={withRefillDaysGuard(handleInputChange)}
        style={style}
        disabled={disabledField}
      />
    </CleanupWrapper>
  );
};

export default OralsDurationInput;

import { useState } from 'react';
import { toast } from 'react-toastify';

const useCheckDateMismatch = () => {
  const checkDateMismatch = (visitDate, eligibilityDate, isInitialValues) => {
    if (isInitialValues) return;
    if (!eligibilityDate || (visitDate && visitDate !== eligibilityDate)) {
      toast.error(
        '⚠ Please enter a date that matches the latest eligibility date!'
      );
      return false;
    } else {
      toast.success(
        'The visit date matches the latest eligibility date. Great job! 👍'
      );
      return true;
    }
  };

  return { checkDateMismatch };
};

export default useCheckDateMismatch;

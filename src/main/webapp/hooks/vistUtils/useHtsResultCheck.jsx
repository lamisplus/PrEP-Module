import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

const useHtsResultCheck = () => {
  const isHtsFound = useCallback(latestHtsResult => {
    if (!latestHtsResult) {
      toast.error(
        '⚠ No HTS record found. At least, 1 test result is required to proceed'
      );
    } else {
      toast.success('👍 HTS record found. You may proceed ✔');
    }
  }, []);
  return { isHtsFound };
};

export default useHtsResultCheck;

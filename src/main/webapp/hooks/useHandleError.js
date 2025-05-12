import { useCallback } from 'react';
import { toast } from 'react-toastify';

const useHandleError = setSaving => {
  const handleError = useCallback(
    error => {
      setSaving(false);
      if (error.response && error.response.data) {
        let errorMessage =
          error.response.data.apierror &&
          error.response.data.apierror.message !== ''
            ? error.response.data.apierror.message
            : '❌ Something went wrong. Please try again';
        toast.error(errorMessage, {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      } else {
        toast.error('Something went wrong ❌ please try again...', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
    },
    [setSaving]
  );

  return { handleError };
};

export default useHandleError;

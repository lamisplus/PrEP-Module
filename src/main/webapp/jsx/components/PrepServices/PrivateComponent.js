import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const ProtectedComponent = ({
  privateComponent: PrivateComponent,
  isAuthorized,
  ...props
}) => {
  useEffect(() => {
    if (!isAuthorized) {
      toast.warn('⚠ Authorization Failed');
    }
  }, [isAuthorized]);

  return isAuthorized ? <PrivateComponent {...props} /> : null;
};

export default ProtectedComponent;

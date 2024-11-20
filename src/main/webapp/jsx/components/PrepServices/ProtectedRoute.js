import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedComponent = ({
  privateComponent: PrivateComponent,
  isAuthorized,
  ...props
}) => {
  useEffect(
    () =>
      isAuthorized
        ? toast.success('Authorization was successfull ✔')
        : toast.warning('⚠ Failed Authorization'),
    []
  );
  return isAuthorized ? (
    <PrivateComponent {...props} />
  ) : (
    <Redirect to="/dashboard" />
  );
};

export default ProtectedComponent;

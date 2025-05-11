import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const ConditionalFieldWrapper = ({ setFieldValue, fieldId, children }) => {
  useEffect(() => {
    return () => {
      setFieldValue(fieldId, '');
    };
  }, [setFieldValue, fieldId]);
  return children;
};

export default ConditionalFieldWrapper;

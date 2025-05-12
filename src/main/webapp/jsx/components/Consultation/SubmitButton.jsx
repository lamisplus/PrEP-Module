import React from 'react';
import { Button as MatButton } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';

const SubmitButton = ({ disabledField, actionType, saving, classes }) => {
  if (disabledField) return null;

  const buttonText = saving
    ? actionType === 'update'
      ? 'Updating...'
      : 'Saving...'
    : actionType === 'update'
    ? 'Update'
    : 'Save';

  return (
    <div>
      <MatButton
        type="submit"
        variant="contained"
        color="primary"
        hidden={disabledField}
        className={classes.button}
        startIcon={<SaveIcon />}
        style={{ backgroundColor: '#014d88' }}
        disabled={saving}
      >
        <span style={{ textTransform: 'capitalize' }}>{buttonText}</span>
      </MatButton>
    </div>
  );
};

export default SubmitButton;

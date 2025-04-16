import { useState } from 'react';

const useUpdatePreviousPrepStatus = props => {
  const [saving, setSaving] = useState(false);

  const updatePreviousPrepStatus = (objValues, patientDto) => {
    objValues.previousPrepStatus = props.patientObj?.prepStatus;
    objValues.prepEnrollmentUuid = patientDto.uuid;
    objValues.prepNotedSideEffects = objValues.notedSideEffects;
    objValues.notedSideEffects = '';
  };

  return { updatePreviousPrepStatus, saving, setSaving };
};

export default useUpdatePreviousPrepStatus;

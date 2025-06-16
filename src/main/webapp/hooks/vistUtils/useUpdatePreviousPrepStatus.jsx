import { useState } from 'react';
import usePrepClinicState from '../usePrepClinicState';

const useUpdatePreviousPrepStatus = props => {
  const formik = usePrepClinicState(props);
  console.log('formikssss: ', formik);
  const [saving, setSaving] = useState(false);

  const updatePreviousPrepStatus = (objValues, patientDto) => {
    console.log('par3: ', objValues, patientDto);
    objValues.previousPrepStatus = props.patientObj?.prepStatus;
    console.log('par4: ', objValues, patientDto);

    objValues.prepEnrollmentUuid = patientDto.uuid;

    objValues.prepNotedSideEffects = objValues.notedSideEffects;
    objValues.notedSideEffects = '';
  };

  return { updatePreviousPrepStatus, saving, setSaving };
};

export default useUpdatePreviousPrepStatus;

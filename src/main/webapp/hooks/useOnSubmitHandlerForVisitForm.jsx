import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useSubmitHandlerForVisitForm = (props, dependencies) => {
  const [saving, setSaving] = useState(false);

  const onSubmit = async values => {
    const {
      validate,
      hivTestResultDate,
      hivTestValue,
      syphilisTest,
      hepatitisTest,
      urinalysisTest,
      creatinineTest,
      otherTest,
      patientDto,
      notedSideEffects,
      baseUrl,
      token,
      handleError,
    } = dependencies;

    if (validate()) {
      setSaving(true);
      values.duration = values.monthsOfRefill;
      values.hivTestResultDate = hivTestResultDate;
      values.hivTestResult = hivTestValue;
      values.syphilis = syphilisTest;
      values.hepatitis = hepatitisTest;
      values.urinalysis = urinalysisTest;
      values.creatinine = creatinineTest;
      values.otherTestsDone = otherTest;
      values.prepEnrollmentUuid = patientDto.uuid;
      values.prepNotedSideEffects = notedSideEffects;
      values.notedSideEffects = '';
      values.previousPrepStatus = props.patientObj?.prepStatus;

      try {
        if (
          props.activeContent &&
          props.activeContent.actionType === 'update'
        ) {
          await axios.put(
            `${baseUrl}prep-clinic/${props.activeContent.id}`,
            values,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success('Clinic visit updated successfully! ✔', {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        } else {
          await axios.post(`${baseUrl}prep/clinic-visit`, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success('Clinic Visit saved successfully! ✔', {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        }
        setSaving(false);
        props.setActiveContent({
          ...props.activeContent,
          route: 'consultation',
          activeTab: 'history',
          actionType: 'view',
        });
      } catch (error) {
        handleError(error);
      }
    }
  };

  return { onSubmit, saving };
};

export default useSubmitHandlerForVisitForm;

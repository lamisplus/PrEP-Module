import React, { useState } from 'react';
import * as Yup from 'yup';

export const useValidation = () => {
  const [validationSchema, setValidationSchema] = useState(
    Yup.object({
      hivTestResult: Yup.string().required(
        'At least, 1 HIV test result is required'
      ),
      monthsOfRefill: Yup.string().required('This field is required'),
      prepType: Yup.string().required('This field is required'),
      wasPrepAdministered: Yup.string().required('This field is required'),
      encounterDate: Yup.string().required('This field is required'),
      nextAppointment: Yup.string().required('This field is required'),
      height: Yup.string().required('This field is required'),
      weight: Yup.string().required('This field is required'),
      regimenId: Yup.string().required('This field is required'),
      prepDistributionSetting: Yup.string().required('This field is required'),
      populationType: Yup.string().required('This field is required'),
      visitType: Yup.string().required('This field is required'),
    })
  );

  return { validationSchema };
};

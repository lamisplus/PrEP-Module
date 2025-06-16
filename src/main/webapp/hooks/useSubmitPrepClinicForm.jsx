import axios from 'axios';
import { toast } from 'react-toastify';
import { useGetPatientDtoObj } from './vistUtils/useGetPatientDtoObj';

const useSubmitPrepClinicForm = (props, baseUrl, token) => {
  const { getPatientDtoObj } = useGetPatientDtoObj();
  const submitForm = async objValues => {
    const {
      data: { uuid: enrollmentUuid },
    } = await getPatientDtoObj(props.patientObj?.personId, baseUrl, token);
    console.log('enrollmentUuid: ', enrollmentUuid);
    const payload = JSON.parse(
      JSON.stringify({
        ...objValues,
        prepStatus: props.patientObj?.prepStatus,
        personId: props.patientObj?.personId,
        prepEnrollmentUuid: enrollmentUuid,
        urinalysisResult: '',
      })
    );

    try {
      if (props.activeContent && props.activeContent.actionType === 'update') {
        await axios.put(
          `${baseUrl}prep-clinic/${props.activeContent.id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Clinic visit updated successfully! ✔', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      } else {
        await axios.post(`${baseUrl}prep/clinic-visit`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Clinic Visit saved successfully! ✔', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
      props.setActiveContent({
        ...props.activeContent,
        route: 'consultation',
        activeTab: 'history',
        actionType: 'view',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return { submitForm };
};

export default useSubmitPrepClinicForm;

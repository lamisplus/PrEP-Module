import axios from 'axios';
import { toast } from 'react-toastify';
import useUpdatePreviousPrepStatus from './vistUtils/useUpdatePreviousPrepStatus';

const useSubmitPrepClinicForm = (props, baseUrl, token) => {
  const {} = useUpdatePreviousPrepStatus(props);
  const submitForm = async objValues => {
    // return console.log('works: ', objValues);

    try {
      if (props.activeContent && props.activeContent.actionType === 'update') {
        await axios.put(
          `${baseUrl}prep-clinic/${props.activeContent.id}`,
          objValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Clinic visit updated successfully! ✔', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      } else {
        await axios.post(`${baseUrl}prep/clinic-visit`, objValues, {
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

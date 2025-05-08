import { useEffect, useState } from 'react';
import { useEligibilityCheckApi } from './useEligibilityCheckApi';
import { usePrepType } from './usePrepCodeSet';

const usePermittedPrepTypes = (props, dependencies) => {
  const [prepType, setPrepType] = useState([]);
  const { data: allPrepTypes } = usePrepType();

  const { isEligibleForCabLa } = useEligibilityCheckApi(
    dependencies.baseUrl,
    props.patientObj.personId,
    dependencies.visitDate,
    dependencies.token
  );

  console.log(
    'params form useElig: ',
    dependencies.baseUrl,
    props.patientObj.personId,
    dependencies.visitDate,
    dependencies.token
  );
  const getPermittedPrepTypes = async () => {
    const { objValues } = dependencies;

    try {
      if (
        !isEligibleForCabLa &&
        !(objValues?.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH') &&
        ['update'].includes(props.activeContent.actionType)
      ) {
        const types = allPrepTypes?.filter(
          each => each.code !== 'PREP_TYPE_INJECTIBLES'
        );
        setPrepType(types);
      }
    } catch (error) {
      console.error('Error checking prep type eligibility:', error);
    }
  };

  useEffect(() => setPrepType(allPrepTypes), []);
  useEffect(() => {
    getPermittedPrepTypes();
  }, [dependencies.visitDate]);

  return { prepType, setPrepType };
};

export default usePermittedPrepTypes;

import { useEffect, useState } from 'react';
import { useEligibilityCheckApi } from './useEligibilityCheckApi';
import { usePrepRegimen } from './usePrepCodeSet';

const usePermittedRegimens = (props, dependencies) => {
  const [prepRegimen, setPrepRegimen] = useState([]);
  const { data: allRegimens } = usePrepRegimen();
  const { isEligibleForCabLa } = useEligibilityCheckApi(
    dependencies.baseUrl,
    props.patientObj.personId,
    dependencies.visitDate,
    dependencies.token
  );

  const getPermittedRegimens = async () => {
    const { objValues } = dependencies;

    try {
      if (
        !isEligibleForCabLa &&
        !(objValues?.visitType === 'PREP_VISIT_TYPE_METHOD_SWITCH') &&
        ['update'].includes(props.activeContent.actionType)
      ) {
        const reg = allRegimens?.filter(
          each => each.code !== 'CAB-LA(600mg/3mL)'
        );
        setPrepRegimen(reg);
      }
    } catch (error) {
      console.error('Error checking regimen eligibility:', error);
    }
  };

  useEffect(() => setPrepRegimen(allRegimens), []);
  useEffect(() => {
    getPermittedRegimens();
  }, [dependencies.visitDate]);

  return { prepRegimen, setPrepRegimen };
};

export default usePermittedRegimens;

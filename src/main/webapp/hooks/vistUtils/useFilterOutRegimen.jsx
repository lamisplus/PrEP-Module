import { useCallback } from 'react';

const useFilterOutRegimen = (codeSet, regimenId) => {
  const filterOutRegimen = useCallback(() => {
    return codeSet?.filter(regimen => regimen.id !== regimenId);
  }, [codeSet, regimenId]);
  return { filterOutRegimen };
};

export default useFilterOutRegimen;

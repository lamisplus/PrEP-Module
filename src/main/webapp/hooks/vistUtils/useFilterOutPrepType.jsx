import { useCallback } from 'react';

const useFilterOutPrepType = (codeSet, prepTypeId) => {
  const filterOutPrepType = useCallback(() => {
    return codeSet?.filter(prepType => prepType.code !== prepTypeId);
  }, [codeSet, prepTypeId]);
  return { filterOutPrepType };
};

export default useFilterOutPrepType;

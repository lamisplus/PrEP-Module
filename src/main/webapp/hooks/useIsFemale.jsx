import { useMemo } from 'react';

const useIsFemale = gender => {
  return useMemo(() => {
    return gender.toLowerCase() === 'female';
  }, [gender]);
};

export default useIsFemale;

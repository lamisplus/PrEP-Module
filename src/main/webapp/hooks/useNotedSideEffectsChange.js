import { useCallback } from 'react';

const useNotedSideEffectsChange = setNotedSideEffects => {
  const handleNotedSideEffectsChange = useCallback(
    selected => {
      setNotedSideEffects(selected);
    },
    [setNotedSideEffects]
  );

  return { handleNotedSideEffectsChange };
};

export default useNotedSideEffectsChange;

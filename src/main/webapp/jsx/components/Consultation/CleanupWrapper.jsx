export const CleanupWrapper = ({ isVisible, cleanup, children }) => {
  useEffect(() => {
    return () => {
      if (!isVisible) {
        cleanup();
      }
    };
  }, [isVisible, cleanup]);
  return isVisible ? children : null;
};

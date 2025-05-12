import React from 'react';

const useOtherPrepTypeOptions = otherPrepType => {
  return React.useMemo(() => {
    switch (otherPrepType) {
      case 'PREP_TYPE_ORAL':
        return <option value="1">TDF(300mg)+3TC(300mg)</option>;
      case 'PREP_TYPE_INJECTIBLES':
        return <option value="2">IM CAB-LA(600mg/3mL)</option>;
      case 'PREP_TYPE_ED_PREP':
        return (
          <>
            <option value="2">IM CAB-LA(600mg/3mL)</option>
            <option value="1">TDF(300mg)+3TC(300mg)</option>
          </>
        );
      default:
        return null;
    }
  }, [otherPrepType]);
};

export default useOtherPrepTypeOptions;

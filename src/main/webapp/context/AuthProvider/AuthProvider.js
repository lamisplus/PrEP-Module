import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import {
  useCommencementConditions,
  useDiscontinuationConditions,
  useEligibilityConditions,
  useEnrollmentConditions,
  useVisitConditions,
} from '../../hooks/useFormConditions';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();
  const [userPermissions, setUserPermissions] = useState(null);
  const isEnrollmentAccessible = useEnrollmentConditions();
  const isCommencementAccessible = useCommencementConditions();
  const isVisitAccessible = useVisitConditions();
  const isDiscontinuationAccessible = useDiscontinuationConditions();
  const isEligibilityAccessible = useEligibilityConditions();

  const getFormPermissions = () => {
    const formPermissions = {
      eligibility:
        hasAnyPermission('PrEP eligibility forms', 'PrEP Care Card') &&
        isEligibilityAccessible,
      enrollment: hasAnyPermission('PrEP Care Card') && isEnrollmentAccessible,
      commencement: hasPermission('PrEP Care Card') && isCommencementAccessible,
      visit: hasPermission('PrEP Care Card') && isVisitAccessible,
      discontinuation:
        hasPermission('PrEP Care Card') && isDiscontinuationAccessible,
    };
    return formPermissions;
  };

  useEffect(() => {
    setUserPermissions(getFormPermissions());
  }, [
    hasPermission,
    hasAnyPermission,
    isEnrollmentAccessible,
    isCommencementAccessible,
    isVisitAccessible,
    isDiscontinuationAccessible,
    isEligibilityAccessible,
  ]);

  return (
    <AuthContext.Provider value={{ userPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

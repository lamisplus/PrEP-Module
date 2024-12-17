import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import {
  useCommencementConditions,
  useDiscontinuationConditions,
  useEligibilityConditions,
  useEnrollmentConditions,
  usePatientVisitsConditions,
  useRegistrationConditions,
  useVisitConditions,
} from '../../hooks/useFormConditions';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();
  const [userPermissions, setUserPermissions] = useState(null);
  const isRegistrationAccessible = useRegistrationConditions();
  const isEnrollmentAccessible = useEnrollmentConditions();
  const isCommencementAccessible = useCommencementConditions();
  const isVisitAccessible = useVisitConditions();
  const isDiscontinuationAccessible = useDiscontinuationConditions();
  const isEligibilityAccessible = useEligibilityConditions();
  const isPatientVisitsAccessible = usePatientVisitsConditions();

  const getFormPermissions = () => {
    const formPermissions = {
      registration:
        hasAnyPermission('PrEP Care Card') && isRegistrationAccessible,
      eligibility:
        hasAnyPermission('PrEP eligibility forms', 'PrEP Care Card') &&
        isEligibilityAccessible,
      enrollment: hasAnyPermission('PrEP Care Card') && isEnrollmentAccessible,
      commencement: hasPermission('PrEP Care Card') && isCommencementAccessible,
      visit: hasPermission('PrEP Care Card') && isVisitAccessible,
      discontinuation:
        hasPermission('PrEP Care Card') && isDiscontinuationAccessible,
      patientVisits:
        hasPermission('PrEP Care Card') && isPatientVisitsAccessible,
    };
    return formPermissions;
  };

  useEffect(() => {
    setUserPermissions(getFormPermissions());
  }, [
    hasPermission,
    hasAnyPermission,
    isRegistrationAccessible,
    isEnrollmentAccessible,
    isCommencementAccessible,
    isVisitAccessible,
    isDiscontinuationAccessible,
    isEligibilityAccessible,
    isPatientVisitsAccessible,
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

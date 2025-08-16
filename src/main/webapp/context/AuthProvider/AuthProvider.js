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
        (hasAnyPermission('prep_care_card') || true) &&
        isRegistrationAccessible,
      eligibility:
        (hasAnyPermission('prep_care_card', 'prep_eligibility_forms') ||
          true) &&
        isEligibilityAccessible,
      enrollment:
        (hasAnyPermission('prep_care_card', 'prep_register') || true) &&
        isEnrollmentAccessible,
      commencement:
        (hasPermission('prep_care_card') || true) && isCommencementAccessible,
      visit: (hasPermission('prep_care_card') || true) && isVisitAccessible,
      discontinuation:
        (hasPermission('prep_care_card') || true) &&
        isDiscontinuationAccessible,
      patientVisits:
        hasAnyPermission('view_patient', 'all_permissions') &&
        isPatientVisitsAccessible,
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

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
        hasAnyPermission('prep_care_card') && isRegistrationAccessible,
      eligibility:
        hasAnyPermission('prep_care_card') && isEligibilityAccessible,
      enrollment: hasAnyPermission('prep_care_card') && isEnrollmentAccessible,
      commencement: hasPermission('prep_care_card') && isCommencementAccessible,
      visit: hasPermission('prep_care_card') && isVisitAccessible,
      discontinuation:
        hasPermission('prep_care_card') && isDiscontinuationAccessible,
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

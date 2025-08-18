import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { usePermissions } from "../../hooks/usePermissions";
import {
  useCommencementConditions,
  useDiscontinuationConditions,
  useEligibilityConditions,
  useEnrollmentConditions,
  usePatientVisitsConditions,
  useRegistrationConditions,
  useVisitConditions,
} from "../../hooks/useFormConditions";
import { useRoles } from "../../hooks/useRoles";

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
  const { hasRole } = useRoles();

  const getFormPermissions = () => {
    const hasRdePermission = hasRole("RDE");
    const formPermissions = {
      registration:
        hasRdePermission ||
        (hasAnyPermission("prep_care_card") && isRegistrationAccessible),

      eligibility:
        hasRdePermission ||
        (hasAnyPermission("prep_care_card", "prep_eligibility_forms") &&
          isEligibilityAccessible),

      enrollment:
        hasRdePermission ||
        (hasAnyPermission("prep_care_card", "prep_register") &&
          isEnrollmentAccessible),

      commencement:
        hasRdePermission ||
        (hasPermission("prep_care_card") && isCommencementAccessible),

      visit:
        hasRdePermission ||
        (hasPermission("prep_care_card") && isVisitAccessible),

      discontinuation:
        hasRdePermission ||
        (hasPermission("prep_care_card") && isDiscontinuationAccessible),

      patientVisits: hasRdePermission
        ? false
        : hasAnyPermission("view_patient", "all_permissions") &&
          isPatientVisitsAccessible,
    };

    return formPermissions;
  };

  useEffect(() => {
    const permissions = getFormPermissions();
    setUserPermissions(permissions);
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
    hasRole("RDE"),
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

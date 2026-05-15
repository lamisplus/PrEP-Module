// Canonical codeset codes stored in prophylaxis_initiation.enrollment_type.
// Never send the short labels ("PrEP" / "PEP") to the backend — use these
// constants. UI display can still use the short labels.

export const ENROLLMENT_TYPE_PREP = "PREP_PEP_ENROLLMENT_TYPE_PREP";
export const ENROLLMENT_TYPE_PEP = "PREP_PEP_ENROLLMENT_TYPE_PEP";

export const ENROLLMENT_LABEL_PREP = "PrEP";
export const ENROLLMENT_LABEL_PEP = "PEP";

// Convert a UI label or already-canonical value to the canonical code.
export const toEnrollmentTypeCode = (value) => {
  if (!value) return value;
  if (value === ENROLLMENT_LABEL_PREP || value === ENROLLMENT_TYPE_PREP) {
    return ENROLLMENT_TYPE_PREP;
  }
  if (value === ENROLLMENT_LABEL_PEP || value === ENROLLMENT_TYPE_PEP) {
    return ENROLLMENT_TYPE_PEP;
  }
  return value;
};

// Convert a canonical code back to the short UI label.
export const fromEnrollmentTypeCode = (value) => {
  if (value === ENROLLMENT_TYPE_PREP) return ENROLLMENT_LABEL_PREP;
  if (value === ENROLLMENT_TYPE_PEP) return ENROLLMENT_LABEL_PEP;
  return value;
};

export const isPrep = (value) =>
  value === ENROLLMENT_TYPE_PREP || value === ENROLLMENT_LABEL_PREP;

export const isPep = (value) =>
  value === ENROLLMENT_TYPE_PEP || value === ENROLLMENT_LABEL_PEP;

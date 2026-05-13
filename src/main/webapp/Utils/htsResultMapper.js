// Maps HTS module canonical HIV result codes (STI_HIV_RESULT codeset) to the
// codeset families used by the HIV Prevention forms. Two target families:
//
//   • HIV_TEST_RESULT_*  — used by the screening + initiation forms.
//   • HTS_RESULT_HIV_*   — used by the PrEP follow-up visit form.
//
// Keeping these mappings in one place means a future codeset rename touches a
// single file, and the auto-pop logic on each form can stay terse.
//
// Reference (from base_application_codeset):
//   STI_HIV_RESULT_NEGATIVE  → HIV_TEST_RESULT_NEGATIVE | HTS_RESULT_HIV_NEGATIVE
//   STI_HIV_RESULT_POSITIVE  → HIV_TEST_RESULT_POSITIVE | HTS_RESULT_HIV_POSITIVE
// If a value falls outside that set (e.g. empty string), the mapper returns the
// raw value unchanged so callers can still use `|| prev.field` fallbacks.

export const STI_HIV_RESULT = {
  NEGATIVE: "STI_HIV_RESULT_NEGATIVE",
  POSITIVE: "STI_HIV_RESULT_POSITIVE",
};

export const HIV_TEST_RESULT = {
  NEGATIVE: "HIV_TEST_RESULT_NEGATIVE",
  POSITIVE: "HIV_TEST_RESULT_POSITIVE",
  NOT_DONE: "HIV_TEST_RESULT_NOT_DONE",
  EARLY_DETECT: "HIV_TEST_RESULT_EARLY_DETECT",
};

export const HTS_RESULT = {
  NEGATIVE: "HTS_RESULT_HIV_NEGATIVE",
  POSITIVE: "HTS_RESULT_HIV_POSITIVE",
  NOT_DONE: "HTS_RESULT_NOT_DONE",
};

/**
 * STI_HIV_RESULT_* → HIV_TEST_RESULT_*  (used by screening + initiation forms).
 * Returns the input unchanged when it doesn't match a known STI code.
 */
export const toHivTestResultCode = (stiCode) => {
  if (!stiCode) return stiCode;
  switch (stiCode) {
    case STI_HIV_RESULT.NEGATIVE:
      return HIV_TEST_RESULT.NEGATIVE;
    case STI_HIV_RESULT.POSITIVE:
      return HIV_TEST_RESULT.POSITIVE;
    default:
      return stiCode;
  }
};

/**
 * STI_HIV_RESULT_* → HTS_RESULT_HIV_*  (used by the PrEP follow-up form).
 * Returns the input unchanged when it doesn't match a known STI code.
 */
export const toHtsResultCode = (stiCode) => {
  if (!stiCode) return stiCode;
  switch (stiCode) {
    case STI_HIV_RESULT.NEGATIVE:
      return HTS_RESULT.NEGATIVE;
    case STI_HIV_RESULT.POSITIVE:
      return HTS_RESULT.POSITIVE;
    default:
      return stiCode;
  }
};

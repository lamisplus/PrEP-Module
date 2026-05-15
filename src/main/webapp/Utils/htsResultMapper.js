// Maps HTS-source codes (STI_HIV_RESULT_* on `initialHivTest`,
// HIV_CONFIRMATORY_TEST_RESULT_* on `confirmatoryHivTest`) to the codeset
// families used by the HIV Prevention forms:
//
//   • HIV_TEST_RESULT_*  — used by the screening + initiation forms.
//   • HTS_RESULT_HIV_*   — used by the PrEP follow-up visit form.
//
// Keeping these mappings in one place means a future codeset rename touches a
// single file, and the auto-pop logic on each form can stay terse.
//
// Source codes recognised:
//   STI_HIV_RESULT_NEGATIVE              ┐
//   STI_HIV_RESULT_POSITIVE              │
//   HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE ├─► HIV_TEST_RESULT_* | HTS_RESULT_*
//   HIV_CONFIRMATORY_TEST_RESULT_POSITIVE ┘
// Anything else (empty, NULL, unknown code) is returned unchanged so callers
// can still use `|| prev.field` fallbacks.

export const STI_HIV_RESULT = {
  NEGATIVE: "STI_HIV_RESULT_NEGATIVE",
  POSITIVE: "STI_HIV_RESULT_POSITIVE",
};

export const CONFIRMATORY_HIV_TEST_RESULT = {
  NEGATIVE: "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE",
  POSITIVE: "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE",
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

// Internal: collapse any known "negative" source code to a sentinel; ditto
// "positive". Lets the two public mappers share one switch.
const NEGATIVE_CODES = new Set([
  STI_HIV_RESULT.NEGATIVE,
  CONFIRMATORY_HIV_TEST_RESULT.NEGATIVE,
]);
const POSITIVE_CODES = new Set([
  STI_HIV_RESULT.POSITIVE,
  CONFIRMATORY_HIV_TEST_RESULT.POSITIVE,
]);

// When typeOfHivTestDone on the HTS observation is this value, the HIV result
// field on prep forms should reflect "early detect" instead of the
// initial/confirmatory test result.
const TYPE_HIV_EARLY_DETECT = "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT";

/**
 * Source HIV-result code → HIV_TEST_RESULT_*  (screening + initiation forms).
 * Accepts both STI_HIV_RESULT_* and HIV_CONFIRMATORY_TEST_RESULT_*.
 *
 * When `testType === TYPE_OF_HIV_TEST_HIV_EARLY_DETECT`, the test was an
 * early-detect run and the form's HIV-result field should auto-populate to
 * "Early Detect" — overriding whatever initial/confirmatory codes were
 * collected on the same encounter.
 */
export const toHivTestResultCode = (sourceCode, testType) => {
  if (testType === TYPE_HIV_EARLY_DETECT) return HIV_TEST_RESULT.EARLY_DETECT;
  if (!sourceCode) return sourceCode;
  if (NEGATIVE_CODES.has(sourceCode)) return HIV_TEST_RESULT.NEGATIVE;
  if (POSITIVE_CODES.has(sourceCode)) return HIV_TEST_RESULT.POSITIVE;
  return sourceCode;
};

/**
 * Source HIV-result code → HTS_RESULT_HIV_*  (PrEP follow-up form).
 * Accepts both STI_HIV_RESULT_* and HIV_CONFIRMATORY_TEST_RESULT_*.
 *
 * HTS_RESULT codeset has no early-detect entry — when `testType ===
 * TYPE_OF_HIV_TEST_HIV_EARLY_DETECT` we leave the field blank so the user can
 * pick the right option manually instead of pre-filling with a code that
 * isn't in the dropdown.
 */
export const toHtsResultCode = (sourceCode, testType) => {
  if (testType === TYPE_HIV_EARLY_DETECT) return "";
  if (!sourceCode) return sourceCode;
  if (NEGATIVE_CODES.has(sourceCode)) return HTS_RESULT.NEGATIVE;
  if (POSITIVE_CODES.has(sourceCode)) return HTS_RESULT.POSITIVE;
  return sourceCode;
};

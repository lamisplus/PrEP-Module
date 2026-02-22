/**
 * Hardcoded codeset options for PrEP Follow-Up Visit form.
 * TODO: Replace each getter with an API call when codeset endpoints are available.
 * Each function returns an array of { value, label } objects.
 */

export function getVisitTypeOptions() {
  return [
    { value: "PREP_VISIT_TYPE_INITIATION", label: "Initiation" },
    { value: "PREP_VISIT_TYPE_SECOND_INITIATION", label: "Second Initiation" },
    { value: "PREP_VISIT_TYPE_REFILL_RE-INJECTION", label: "Refill/Re-injection" },
    { value: "PREP_VISIT_TYPE_METHOD_SWITCH", label: "Method Switch" },
    { value: "PREP_VISIT_TYPE_RESTART", label: "Restart" },
    { value: "PREP_VISIT_TYPE_DISCONTINUATION", label: "Discontinuation" },
    { value: "PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP", label: "Discontinuation Follow-up" },
    { value: "PREP_VISIT_TYPE_TRANSFER_IN", label: "Transfer In" },
    { value: "PREP_VISIT_TYPE_NO_PREP_PROVIDED", label: "No PrEP Provided" },
  ];
}

export function getPregnancyStatusOptions() {
  return [
    { value: "PREGNANCY_STATUS_PREGNANT", label: "Pregnant" },
    { value: "PREGNANCY_STATUS_NOT_PREGNANT", label: "Not Pregnant" },
    { value: "PREGNANCY_STATUS_BREASTFEEDING", label: "Breastfeeding" },
  ];
}

export function getHTSResultOptions() {
  return [
    { value: "POSITIVE", label: "Positive" },
    { value: "NEGATIVE", label: "Negative" },
    { value: "NOT DONE", label: "Not Done" },
  ];
}

export function getNotedSideEffectOptions() {
  return [
    { value: "PREP_SIDE_EFFECTS_NAUSEA", label: "Nausea" },
    { value: "PREP_SIDE_EFFECTS_HEADACHE", label: "Headache" },
    { value: "PREP_SIDE_EFFECTS_DIZZINESS", label: "Dizziness" },
    { value: "PREP_SIDE_EFFECTS_FATIGUE", label: "Fatigue" },
    { value: "PREP_SIDE_EFFECTS_STOMACH_PAIN", label: "Stomach Pain" },
    { value: "PREP_SIDE_EFFECTS_DIARRHEA", label: "Diarrhea" },
    { value: "PREP_SIDE_EFFECTS_RASH", label: "Rash" },
    { value: "PREP_SIDE_EFFECTS_INJECTION_SITE_REACTION", label: "Injection Site Reaction" },
    { value: "PREP_SIDE_EFFECTS_NONE", label: "None" },
    { value: "PREP_SIDE_EFFECTS_OTHER", label: "Other" },
  ];
}

export function getSyndromicSTIOptions() {
  return [
    { value: "SYNDROMIC_STI_SCREENING_VAGINAL_DISCHARGE", label: "Vaginal Discharge" },
    { value: "SYNDROMIC_STI_SCREENING_URETHRAL_DISCHARGE", label: "Urethral Discharge" },
    { value: "SYNDROMIC_STI_SCREENING_GENITAL_ULCER", label: "Genital Ulcer" },
    { value: "SYNDROMIC_STI_SCREENING_LOWER_ABDOMINAL_PAIN", label: "Lower Abdominal Pain" },
    { value: "SYNDROMIC_STI_SCREENING_NONE", label: "None" },
  ];
}

export function getRiskReductionOptions() {
  return [
    { value: "PrEP_RISK_REDUCTION_PLAN_CONDOM_USE", label: "Condom Use" },
    { value: "PrEP_RISK_REDUCTION_PLAN_STI_TREATMENT", label: "STI Treatment" },
    { value: "PrEP_RISK_REDUCTION_PLAN_PARTNER_TESTING", label: "Partner Testing" },
    { value: "PrEP_RISK_REDUCTION_PLAN_HARM_REDUCTION", label: "Harm Reduction" },
    { value: "PrEP_RISK_REDUCTION_PLAN_REFERRAL", label: "Referral" },
    { value: "PrEP_RISK_REDUCTION_PLAN_OTHER", label: "Other" },
  ];
}

export function getAdherenceOptions() {
  return [
    { value: "PREP_LEVEL_OF_ADHERENCE_(GOOD)_≤_2_DOSES", label: "Good (≤ 2 doses missed)" },
    { value: "PREP_LEVEL_OF_ADHERENCE_(FAIR)_3-7_DOSES", label: "Fair (3-7 doses missed)" },
    { value: "PREP_LEVEL_OF_ADHERENCE_(POOR)_≥_7_DOSES", label: "Poor (≥ 7 doses missed)" },
  ];
}

export function getReasonPoorFairAdherenceOptions() {
  return [
    { value: "WHY_POOR_FAIR_ADHERENCE_FORGOT", label: "Forgot" },
    { value: "WHY_POOR_FAIR_ADHERENCE_SIDE_EFFECTS", label: "Side Effects" },
    { value: "WHY_POOR_FAIR_ADHERENCE_PILLS_RAN_OUT", label: "Pills Ran Out" },
    { value: "WHY_POOR_FAIR_ADHERENCE_FELT_WELL", label: "Felt Well" },
    { value: "WHY_POOR_FAIR_ADHERENCE_TRAVEL", label: "Travel" },
    { value: "WHY_POOR_FAIR_ADHERENCE_STIGMA", label: "Stigma" },
    { value: "WHY_POOR_FAIR_ADHERENCE_OTHER", label: "Other" },
  ];
}

export function getPrepTypeOptions() {
  return [
    { value: "PREP_TYPE_ORAL", label: "Oral" },
    { value: "PREP_TYPE_INJECTIBLES", label: "Injectables (CAB-LA)" },
    { value: "PREP_TYPE_ED_PREP", label: "ED-PrEP" },
    { value: "PREP_TYPE_OTHERS", label: "Others" },
  ];
}

export function getPrepRegimenOptions() {
  return [
    { value: "1", label: "TDF(300mg)+3TC(300mg)" },
    { value: "2", label: "CAB-LA(600mg/3mL)" },
  ];
}

export function getUrinalysisResultOptions() {
  return [
    { value: "Normal", label: "Normal" },
    { value: "Abnormal", label: "Abnormal" },
  ];
}

export function getHepatitisResultOptions() {
  return [
    { value: "Positive", label: "Positive" },
    { value: "Negative", label: "Negative" },
    { value: "Not Done", label: "Not Done" },
  ];
}

export function getSyphilisResultOptions() {
  return [
    { value: "Reactive", label: "Reactive" },
    { value: "Non-Reactive", label: "Non-Reactive" },
    { value: "Not Done", label: "Not Done" },
    { value: "Others", label: "Others" },
  ];
}

export function getLiverFunctionTestOptions() {
  return [
    { value: "LIVER_FUNCTION_TEST_RESULT_NORMAL", label: "Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_ABNORMAL", label: "Abnormal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_NOT_DONE", label: "Not Done" },
  ];
}

export function getOtherTestOptions() {
  return [
    { value: "PREP_OTHER_TEST_CREATININE", label: "Creatinine" },
    { value: "PREP_OTHER_TEST_HEP_B", label: "Hepatitis B" },
    { value: "PREP_OTHER_TEST_HEP_C", label: "Hepatitis C" },
    { value: "PREP_OTHER_TEST_OTHER_(SPECIFY)", label: "Other (Specify)" },
  ];
}

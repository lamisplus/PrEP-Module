/**
 * Hardcoded codeset options for PrEP Follow-Up Visit form.
 * TODO: Replace each getter with an API call when codeset endpoints are available.
 * Each function returns an array of { value, label } objects.
 */

export function getVisitTypeOptions() {
  return [
    { value: "PREP_VISIT_TYPE_INITIATION", label: "Initiation" },
    { value: "PREP_VISIT_TYPE_SECOND_INITIATION", label: "Second Initiation" },
    { value: "PREP_VISIT_TYPE_REFILL_RE-INJECTION", label: "Refill / Re-Injection" },
    { value: "PREP_VISIT_TYPE_METHOD_SWITCH", label: "Method Switch" },
    { value: "PREP_VISIT_TYPE_RESTART", label: "Restart" },
    { value: "PREP_VISIT_TYPE_TRANSFER_IN", label: "Transfer In" },
    { value: "PREP_VISIT_TYPE_NO_PREP_PROVIDED", label: "No PrEP Provided" },
    { value: "PREP_VISIT_TYPE_DISCONTINUATION", label: "Discontinuation" },
    { value: "PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP", label: "Discontinuation Follow-up" },
  ];
}

export function getPregnancyStatusOptions() {
  return [
    { value: "PREGNANCY_STATUS_PREGNANT", label: "Pregnant" },
    { value: "PREGNANCY_STATUS_BREASTFEEDING", label: "Breastfeeding" },
    { value: "PREGNANCY_STATUS_NOT_PREGNANT", label: "Non-Pregnant" },
  ];
}

export function getHTSResultOptions() {
  return [
    { value: "HIV positive", label: "HIV positive" },
    { value: "HIV Negative", label: "HIV Negative" },
    { value: "NOT DONE", label: "Not Done" },
  ];
}

export function getNotedSideEffectOptions() {
  return [
    { value: "PREP_SIDE_EFFECTS_NO_SIDE_EFFECT", label: "No Side effect" },
    { value: "PREP_SIDE_EFFECTS_NAUSEA", label: "Nauseas/vomitting" },
    { value: "PREP_SIDE_EFFECTS_HEADACHE", label: "Headache" },
    { value: "PREP_SIDE_EFFECTS_INSOMNIA", label: "Insomnia/bad dreams" },
    { value: "PREP_SIDE_EFFECTS_FATIGUE", label: "Fatigue/weakness" },
    { value: "PREP_SIDE_EFFECTS_ABDOMINAL_PAIN", label: "Abdominal Pain" },
    { value: "PREP_SIDE_EFFECTS_DIARRHEA", label: "Diarrhea" },
    { value: "PREP_SIDE_EFFECTS_FEVER", label: "Fever" },
    { value: "PREP_SIDE_EFFECTS_RASH", label: "Rash" },
    { value: "PREP_SIDE_EFFECTS_ANAEMIA", label: "Anaemia" },
    { value: "PREP_SIDE_EFFECTS_STEVENS_JOHNSON", label: "Stevens Johnson syndrome" },
    { value: "PREP_SIDE_EFFECTS_HYPERGLYCEMIA", label: "Hyperglycemia" },
    { value: "PREP_SIDE_EFFECTS_OTHER", label: "Others" },
  ];
}

export function getSyndromicSTIOptions() {
  return [
    { value: "SYNDROMIC_STI_SCREENING_NO_SYMPTOMS", label: "No STI symptoms/signs" },
    { value: "SYNDROMIC_STI_SCREENING_URETHRAL_DISCHARGE", label: "Urethral discharge" },
    { value: "SYNDROMIC_STI_SCREENING_GENITAL_ULCERS", label: "Genital Ulcers" },
    { value: "SYNDROMIC_STI_SCREENING_VAGINAL_DISCHARGE", label: "Vaginal discharge" },
    { value: "SYNDROMIC_STI_SCREENING_LOWER_ABDOMINAL_PAIN", label: "Lower Abdominal Pain" },
    { value: "SYNDROMIC_STI_SCREENING_SCROTAL_SWELLING", label: "Scrotal Swelling" },
    { value: "SYNDROMIC_STI_SCREENING_ANAL_WARTS", label: "Anal Warts" },
    { value: "SYNDROMIC_STI_SCREENING_GENITAL_WARTS", label: "Genital Warts" },
    { value: "SYNDROMIC_STI_SCREENING_INGUINAL_BUBO", label: "Inguinal bubo" },
    { value: "SYNDROMIC_STI_SCREENING_OTHERS", label: "Others" },
  ];
}

export function getRiskReductionOptions() {
  return [
    { value: "PrEP_RISK_REDUCTION_PLAN_1", label: "Risk reduction strategies discussed" },
    { value: "PrEP_RISK_REDUCTION_PLAN_2", label: "Plan 1 plus correct condom use demonstrated" },
    { value: "PrEP_RISK_REDUCTION_PLAN_3", label: "Plan 1&2 plus lubricant provided" },
  ];
}

export function getAdherenceOptions() {
  return [
    { value: "PREP_LEVEL_OF_ADHERENCE_(GOOD)", label: "G (Good) >= 95% <= 1 doses" },
    { value: "PREP_LEVEL_OF_ADHERENCE_(FAIR)", label: "F (Fair) 85-94% 2-5 doses" },
    { value: "PREP_LEVEL_OF_ADHERENCE_(POOR)", label: "P (Poor) < 85% >= 6 doses" },
  ];
}

export function getReasonPoorFairAdherenceOptions() {
  return [
    { value: "WHY_POOR_FAIR_ADHERENCE_FORGOT", label: "Forgot" },
    { value: "WHY_POOR_FAIR_ADHERENCE_FELL_ASLEEP", label: "Fell asleep/slept through dose" },
    { value: "WHY_POOR_FAIR_ADHERENCE_CHANGE_IN_ROUTINE", label: "Change in routine/away from home" },
    { value: "WHY_POOR_FAIR_ADHERENCE_BUSY", label: "Busy/working/at school" },
    { value: "WHY_POOR_FAIR_ADHERENCE_PATIENT_MOVED", label: "Patient moved" },
    { value: "WHY_POOR_FAIR_ADHERENCE_RAN_OUT", label: "Ran out of medications" },
    { value: "WHY_POOR_FAIR_ADHERENCE_DRUG_STOCK_OUT", label: "Drug stock-out" },
    { value: "WHY_POOR_FAIR_ADHERENCE_NOT_ABLE_TO_PAY", label: "Not able to pay" },
    { value: "WHY_POOR_FAIR_ADHERENCE_PARTNER_INFLUENCE", label: "Partner Influence" },
    { value: "WHY_POOR_FAIR_ADHERENCE_OTHER", label: "Others" },
  ];
}

export function getPrepTypeOptions() {
  return [
    { value: "PREP_TYPE_ORAL", label: "Oral" },
    { value: "PREP_TYPE_INJECTIBLES", label: "Injectable" },
    { value: "PREP_TYPE_RING", label: "Ring" },
    { value: "PREP_TYPE_OTHERS", label: "Others" },
  ];
}

export function getPrepRegimenOptions() {
  return [
    { value: "1", label: "TDF/FTC" },
    { value: "2", label: "TDF/3TC" },
    { value: "3", label: "Cabotegravir" },
    { value: "4", label: "Lenacapavir" },
  ];
}

export function getUrinalysisResultOptions() {
  return [
    { value: "No proteinuria", label: "No proteinuria" },
    { value: "Proteinuria Present - One +", label: "Proteinuria Present - One +" },
    { value: "Proteinuria Present - Two ++", label: "Proteinuria Present - Two ++" },
    { value: "Proteinuria Present - Three +++", label: "Proteinuria Present - Three +++" },
  ];
}

export function getHepatitisResultOptions() {
  return [
    { value: "Hepatitis B Positive", label: "Hepatitis B Positive" },
    { value: "Hepatitis B Negative", label: "Hepatitis B Negative" },
    { value: "Hepatitis C Positive", label: "Hepatitis C Positive" },
    { value: "Hepatitis C Negative", label: "Hepatitis C Negative" },
    { value: "HIV/HBV Coinfected", label: "HIV/HBV Coinfected" },
    { value: "HIV/HCV Coinfected", label: "HIV/HCV Coinfected" },
  ];
}

export function getSyphilisResultOptions() {
  return [
    { value: "Negative", label: "Negative" },
    { value: "Positive", label: "Positive" },
    { value: "Not Done", label: "Not Done" },
    { value: "Others", label: "Others" },
  ];
}

export function getLiverFunctionTestOptions() {
  return [
    { value: "LIVER_FUNCTION_TEST_RESULT_ALT_NORMAL", label: "ALT Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_ALT_DERANGED", label: "ALT Deranged" },
    { value: "LIVER_FUNCTION_TEST_RESULT_ALP_NORMAL", label: "ALP Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_ALP_DERANGED", label: "ALP Deranged" },
    { value: "LIVER_FUNCTION_TEST_RESULT_AST_NORMAL", label: "AST Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_AST_DERANGED", label: "AST Deranged" },
    { value: "LIVER_FUNCTION_TEST_RESULT_GGT_NORMAL", label: "GGT Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_GGT_DERANGED", label: "GGT Deranged" },
    { value: "LIVER_FUNCTION_TEST_RESULT_BILIRUBIN_NORMAL", label: "Bilirubin Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_BILIRUBIN_DERANGED", label: "Bilirubin Deranged" },
    { value: "LIVER_FUNCTION_TEST_RESULT_ALBUMIN_NORMAL", label: "Albumin Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_ALBUMIN_DERANGED", label: "Albumin Deranged" },
    { value: "LIVER_FUNCTION_TEST_RESULT_TOTAL_PROTEIN_NORMAL", label: "Total protein Normal" },
    { value: "LIVER_FUNCTION_TEST_RESULT_TOTAL_PROTEIN_DERANGED", label: "Total protein Deranged" },
  ];
}

export function getOtherTestOptions() {
  return [
    { value: "PREP_OTHER_TEST_HB_PCV", label: "HB/PCV" },
    { value: "PREP_OTHER_TEST_WBC_DIFF", label: "WBC + Diff" },
    { value: "PREP_OTHER_TEST_ALT", label: "ALT" },
    { value: "PREP_OTHER_TEST_AST", label: "AST" },
    { value: "PREP_OTHER_TEST_CREATININE", label: "Creatinine" },
    { value: "PREP_OTHER_TEST_LIPID_PROFILE", label: "Lipid Profile" },
    { value: "PREP_OTHER_TEST_HBSAG", label: "HBsAg" },
    { value: "PREP_OTHER_TEST_URINALYSIS", label: "Urinalysis" },
    { value: "PREP_OTHER_TEST_SPUTUM_AFB", label: "Sputum AFB" },
    { value: "PREP_OTHER_TEST_CHEST_XRAY", label: "Chest Xray" },
  ];
}

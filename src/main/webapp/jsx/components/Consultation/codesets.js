/**
 * Abstracted codeset / lookup data for PrEP forms.
 *
 * Every function below returns hardcoded data shaped exactly like the API
 * responses so the rest of the application is unaffected.  When the real
 * endpoints are ready, replace the Promise.resolve(...) bodies with the
 * corresponding axios calls — no changes needed in consuming components.
 *
 * Codeset items use { id, code, display } to match the API contract.
 * Regimen  items use { id, regimen, code }   to match the API contract.
 */

import axios from "axios";
import { token, url as baseUrl } from "../../../api";

// ---------------------------------------------------------------------------
// Codeset helpers  (sync – kept for any code that still calls them directly)
// ---------------------------------------------------------------------------

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
    { value: "HTS_RESULT_HIV_POSITIVE", label: "HIV Positive" },
    { value: "HTS_RESULT_HIV_NEGATIVE", label: "HIV Negative" },
    { value: "HTS_RESULT_NOT_DONE", label: "Not Done" },
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

// Canonical codeset: PrEP_LEVEL_OF_ADHERENCE_REASONS (replaces the deprecated
// WHY_POOR_FAIR_ADHERENCE codeset). Codes match the application-codeset feed.
export function getReasonPoorFairAdherenceOptions() {
  return [
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_FORGOT", label: "Forgot" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_FELL_ASLEEPSLEPT_THROUGH_DOSE", label: "Fell asleep/slept through dose" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_CHANGE_IN_ROUTINEAWAY_FROM_HOME", label: "Change in routine/away from home" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_BUSYWORKINGAT_SCHOOL", label: "Busy/working/at school" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_PATIENT_MOVED", label: "Patient moved" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_RAN_OUT_OF_MEDICATIONS", label: "Ran out of medications" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_DRUG_STOCK-OUT", label: "Drug stock-out" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_NOT_ABLE_TO_PAY", label: "Not able to pay" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_PARTNER_INFLUENCE", label: "Partner Influence" },
    { value: "PREP_LEVEL_OF_ADHERENCE_REASONS_OTHERS", label: "Others" },
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

// Canonical codeset: PREP_REGIMEN. Codes match the application-codeset feed.
// Filtering rule from the data dictionary:
//   PREP_TYPE_ORAL        -> TDF/FTC, TDF/3TC
//   PREP_TYPE_INJECTIBLES -> Cabotegravir, Lenacapavir
//   PREP_TYPE_RING        -> (no regimens defined in the codeset yet)
export function getPrepRegimenOptions() {
  return [
    { value: "PREP_REGIMEN_TDF_FTC", label: "TDF/FTC" },
    { value: "PREP_REGIMEN_TDF_3TC", label: "TDF/3TC" },
    { value: "PREP_REGIMEN_CABOTEGRAVIR", label: "Cabotegravir" },
    { value: "PREP_REGIMEN_LENACAPAVIR", label: "Lenacapavir" },
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
    { value: "PREP_OTHER_TEST_OTHER_(SPECIFY)", label: "Other(specify)" },
  ];
}

// ---------------------------------------------------------------------------
// PEP-specific codeset helpers
// ---------------------------------------------------------------------------

export function getPepModeOfExposureOptions() {
  return [
    { value: "PEP_MODE_OF_EXPOSURE_OCCUPATIONAL", label: "Occupational" },
    { value: "PEP_MODE_OF_EXPOSURE_NON_OCCUPATIONAL", label: "Non-Occupational" },
    { value: "PEP_MODE_OF_EXPOSURE_SUSPECTED_ACUTE_HIV", label: "Suspected Acute HIV Infection" },
  ];
}

export function getPepDurationBeforePepOptions() {
  return [
    { value: "PEP_DURATION_BEFORE_PEP_LT_24", label: "<24 Hrs" },
    { value: "PEP_DURATION_BEFORE_PEP_LT_48", label: "<48 Hrs" },
    { value: "PEP_DURATION_BEFORE_PEP_LT_72", label: "<72 Hrs" },
    { value: "PEP_DURATION_BEFORE_PEP_GT_72", label: ">72 Hrs" },
  ];
}

export function getPepHivStatusAtExposureOptions() {
  return [
    { value: "PEP_HIV_STATUS_POSITIVE", label: "Positive" },
    { value: "PEP_HIV_STATUS_NEGATIVE", label: "Negative" },
  ];
}

// Synchronous variant — kept for callers (like fetchAllCodesets toApiShape)
// that need data immediately on first render. Live PEP regimens from the API
// are fetched via fetchPepRegimens() below.
export function getPepRegimenOptions() {
  return ALL_REGIMENS
    .filter(r => r.enrollmentType === "PEP")
    .map(r => ({ value: r.code, label: r.regimen }));
}

/**
 * Live PEP regimens preferring the PEP_REGIMEN codeset, falling back to the
 * hardcoded PEP subset of ALL_REGIMENS. Shape mirrors getPepRegimenOptions().
 */
export async function fetchPepRegimens() {
  const live = await fetchRegimenCodesetGroup("PEP_REGIMEN");
  if (live) return live.map(r => ({ value: r.code, label: r.regimen }));
  return getPepRegimenOptions();
}

export function getPepFollowupHivTestResultOptions() {
  return [
    { value: "PEP_FOLLOWUP_HIV_1ST_VISIT_6_WEEKS", label: "1st Visit (6 Weeks)" },
    { value: "PEP_FOLLOWUP_HIV_2ND_VISIT_3_MONTHS", label: "2nd Visit (3 Months)" },
    { value: "PEP_FOLLOWUP_HIV_3RD_VISIT_6_MONTHS", label: "3rd Visit (6 Months)" },
    { value: "PEP_FOLLOWUP_HIV_REFER_IF_POSITIVE", label: "Refer (If Positive)" },
  ];
}

// ---------------------------------------------------------------------------
// Async abstractions — shaped to match the API responses exactly
// ---------------------------------------------------------------------------

/** Helper: turn { value, label } into API-shaped { id, code, display }. */
function toApiShape(arr) {
  return arr.map((item, i) => ({
    id: i + 1,
    code: item.value,
    display: item.label,
  }));
}

/**
 * Replaces: GET /application-codesets/v2/codeSets?codes=...
 * Returns an object keyed by codeset name, each value is an array of
 * { id, code, display }.
 * @returns {Promise<Object>}
 */
export function fetchAllCodesets() {
  const data = {
    PrEP_VISIT_TYPE: toApiShape(getVisitTypeOptions()),
    PREGNANCY_STATUS: toApiShape(getPregnancyStatusOptions()),
    HTS_RESULT: toApiShape(getHTSResultOptions()),
    // Shared HIV result codeset used by the screening, initiation and both
    // follow-up forms. Offline fallback for when the codeset API is down.
    HIV_TEST_RESULT: toApiShape([
      { value: "HIV_TEST_RESULT_NEGATIVE", label: "Negative" },
      { value: "HIV_TEST_RESULT_POSITIVE", label: "Positive" },
      { value: "HIV_TEST_RESULT_NOT_DONE", label: "Not done" },
      { value: "HIV_TEST_RESULT_EARLY_DETECT", label: "Early detect" },
    ]),
    PREP_SIDE_EFFECTS: toApiShape(getNotedSideEffectOptions()),
    SYNDROMIC_STI_SCREENING: toApiShape(getSyndromicSTIOptions()),
    PrEP_RISK_REDUCTION_PLAN: toApiShape(getRiskReductionOptions()),
    PrEP_LEVEL_OF_ADHERENCE: toApiShape(getAdherenceOptions()),
    PrEP_LEVEL_OF_ADHERENCE_REASONS: toApiShape(getReasonPoorFairAdherenceOptions()),
    PrEP_TYPE: toApiShape(getPrepTypeOptions()),
    PREP_URINALYSIS_RESULT: toApiShape(getUrinalysisResultOptions()),
    HEPATITIS_SCREENING_RESULT: toApiShape(getHepatitisResultOptions()),
    SYPHILIS_RESULT: toApiShape(getSyphilisResultOptions()),
    LIVER_FUNCTION_TEST_RESULT: toApiShape(getLiverFunctionTestOptions()),
    PREP_OTHER_TEST: toApiShape(getOtherTestOptions()),
    // Codesets used by PrEP Initial Visit form
    HTS_ENTRY_POINT: toApiShape([
      { value: "HTS_ENTRY_POINT_VCT", label: "VCT" },
      { value: "HTS_ENTRY_POINT_OPD", label: "OPD" },
      { value: "HTS_ENTRY_POINT_PMTCT", label: "PMTCT" },
      { value: "HTS_ENTRY_POINT_COMMUNITY", label: "Community" },
      { value: "HTS_ENTRY_POINT_OTHERS", label: "Others" },
    ]),
    RELATIONSHIP: toApiShape([
      { value: "RELATIONSHIP_SPOUSE", label: "Spouse/Partner" },
      { value: "RELATIONSHIP_PARENT", label: "Parent" },
      { value: "RELATIONSHIP_SIBLING", label: "Sibling" },
      { value: "RELATIONSHIP_FRIEND", label: "Friend" },
      { value: "RELATIONSHIP_OTHER", label: "Other" },
    ]),
    PREP_RISK_TYPE: toApiShape([
      { value: "PREP_RISK_TYPE_MSM", label: "MSM" },
      { value: "PREP_RISK_TYPE_FSW", label: "FSW" },
      { value: "PREP_RISK_TYPE_PWID", label: "PWID" },
      { value: "PREP_RISK_TYPE_SERO_DISCORDANT", label: "Sero-discordant couple" },
      { value: "PREP_RISK_TYPE_TRANSGENDER", label: "Transgender" },
      { value: "PREP_RISK_TYPE_AGYW", label: "AGYW" },
      { value: "PREP_RISK_TYPE_OTHER", label: "Other" },
    ]),
    PREP_HISTORY_OF_DRUG_INTERACTIONS: toApiShape([
      { value: "PREP_DRUG_INTERACTION_NONE", label: "None" },
      { value: "PREP_DRUG_INTERACTION_RIFAMPICIN", label: "Rifampicin" },
      { value: "PREP_DRUG_INTERACTION_CARBAMAZEPINE", label: "Carbamazepine" },
      { value: "PREP_DRUG_INTERACTION_PHENYTOIN", label: "Phenytoin" },
      { value: "PREP_DRUG_INTERACTION_OTHER", label: "Others" },
    ]),
    // Codesets used by Commencement form
    PrEP_ENTRY_POINT: toApiShape([
      { value: "PrEP_ENTRY_POINT_OUTREACH", label: "Outreach" },
      { value: "PrEP_ENTRY_POINT_FACILITY_WALK_IN", label: "In-facility/Walk-in" },
      { value: "PrEP_ENTRY_POINT_TRANSFER_IN", label: "Transfer In" },
    ]),
    // Codesets used by Eligibility Screening form
    // Drives the "Referred From" / entry-point select. Offline fallback only —
    // when the codeset API is reachable, the seeded PREP_SOURCE_REFERRAL group
    // is the source of truth. Codes here MUST match the seeded codeset so a
    // value picked offline still resolves to a label later.
    PREP_SOURCE_REFERRAL: toApiShape([
      { value: "PREP_SOURCE_REFERRAL_COMMUNITY", label: "Community" },
      { value: "PREP_SOURCE_REFERRAL_FACILITY", label: "Facility" },
      { value: "PREP_SOURCE_REFERRAL_OUTREACH", label: "Outreach" },
      { value: "PREP_SOURCE_REFERRAL_INDEX_TESTING", label: "Index Testing" },
      { value: "PREP_SOURCE_REFERRAL_SELF_REFERRAL", label: "Self Referral" },
      { value: "PREP_SOURCE_REFERRAL_OTHER", label: "Other" },
    ]),
    COUNSELING_TYPE: toApiShape([
      { value: "COUNSELING_TYPE_PRE_TEST", label: "Pre-test counselling" },
      { value: "COUNSELING_TYPE_POST_TEST", label: "Post-test counselling" },
    ]),
    REASON_PREP_DECLINED: toApiShape([
      { value: "REASON_PREP_DECLINED_NO_NEED", label: "No need for PrEP" },
      { value: "REASON_PREP_DECLINED_DAILY_MEDICATION", label: "Does not wish to take daily medication" },
      { value: "REASON_PREP_DECLINED_SIDE_EFFECTS", label: "Concerns about side effects" },
      { value: "REASON_PREP_DECLINED_OTHERS_THINK", label: "Concerns about what others think" },
      { value: "REASON_PREP_DECLINED_TIME", label: "Concerns about time required for clinic follow-up" },
      { value: "REASON_PREP_DECLINED_SAFETY", label: "Concerns about safety of medication" },
      { value: "REASON_PREP_DECLINED_EFFECTIVENESS", label: "Concerns about effectiveness of medication" },
      { value: "REASON_PREP_DECLINED_OTHER", label: "Others" },
    ]),
    POPULATION_TYPE: toApiShape([
      { value: "POPULATION_TYPE_GEN_POP", label: "GenPop" },
      { value: "POPULATION_TYPE_KEY_POP", label: "Key Population" },
      { value: "POPULATION_TYPE_PRIORITY_POP", label: "Priority Population" },
    ]),
    // Codesets used by PEP Follow-up Visit form
    PEP_MODE_OF_EXPOSURE: toApiShape(getPepModeOfExposureOptions()),
    PEP_DURATION_BEFORE_PEP: toApiShape(getPepDurationBeforePepOptions()),
    PEP_HIV_STATUS_AT_EXPOSURE: toApiShape(getPepHivStatusAtExposureOptions()),
    PEP_REGIMEN: toApiShape(getPepRegimenOptions()),
    PEP_FOLLOWUP_HIV_TEST_RESULT: toApiShape(getPepFollowupHivTestResultOptions()),
    // Other keys referenced by various forms
    REASON_METHOD_SWITCH: [],
    CREATININE_TEST_RESULT: [],
    PREP_STATUS: [],
    FAMILY_PLANNING_METHOD: [],
  };
  return Promise.resolve(data);
}

/**
 * Master regimen list backed by the PREP_REGIMEN + PEP_REGIMEN codesets,
 * joined into a single source of truth so callers don't have to reconcile
 * two lists. The `id` values feed the regimenId form field; `code` is the
 * canonical codeset code that gets persisted. `enrollmentType` lets callers
 * pick the right subset for PrEP or PEP; `types` drives the per-PrEP-Type
 * filter (see fetchPrepRegimenByType — oral vs injectible).
 */
const ALL_REGIMENS = [
  { id: 1, regimen: "TDF/FTC",      code: "PREP_REGIMEN_TDF_FTC",      enrollmentType: "PrEP", types: ["PREP_TYPE_ORAL"] },
  { id: 2, regimen: "TDF/3TC",      code: "PREP_REGIMEN_TDF_3TC",      enrollmentType: "PrEP", types: ["PREP_TYPE_ORAL"] },
  { id: 3, regimen: "Cabotegravir", code: "PREP_REGIMEN_CABOTEGRAVIR", enrollmentType: "PrEP", types: ["PREP_TYPE_INJECTIBLES"] },
  { id: 4, regimen: "Lenacapavir",  code: "PREP_REGIMEN_LENACAPAVIR",  enrollmentType: "PrEP", types: ["PREP_TYPE_INJECTIBLES"] },
  // PEP regimens. Joint into the same list so the master is single-source.
  { id: 5, regimen: "TDF/FTC",      code: "PEP_REGIMEN_TDF_FTC",       enrollmentType: "PEP",  types: [] },
];

/** Strip the internal `types`/`enrollmentType` keys before returning to callers. */
function stripInternal(list) {
  return list.map(({ types, enrollmentType, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// Live regimen fetching from the application-codesets API
// ---------------------------------------------------------------------------
//
// fetchPrepRegimens / fetchPrepRegimenByType / getPepRegimenOptions all hit
// the codesets API (PREP_REGIMEN, PEP_REGIMEN) when available, falling back
// to the hardcoded ALL_REGIMENS list above when the API errors out or returns
// nothing. The "Injectibles vs Orals" filter is derived from the canonical
// code (Cabotegravir/Lenacapavir → injectibles), since the codeset itself
// doesn't expose that classification.

const INJECTIBLE_CODE_FRAGMENTS = ["CABOTEGRAVIR", "LENACAPAVIR"];

// The Ring PrEP type maps to the Dapivirine vaginal ring regimen. That regimen
// is not in the PREP_REGIMEN codeset yet, but we know its code/display will
// contain "dapivirine" (the spec also wrote it "dapvirine"), so we match on
// either fragment ahead of the codeset entry being added. Matching by name —
// rather than a hardcoded code — keeps this working once the real code lands.
const RING_REGIMEN_FRAGMENTS = ["DAPIVIRINE", "DAPVIRINE"];

function containsAnyFragment(text, fragments) {
  if (!text) return false;
  const upper = String(text).toUpperCase();
  return fragments.some(frag => upper.includes(frag));
}

function isInjectibleCode(code) {
  return containsAnyFragment(code, INJECTIBLE_CODE_FRAGMENTS);
}

/** True when a regimen (by code or display) is the Ring / Dapivirine regimen. */
export function isRingRegimen(regimen) {
  if (!regimen) return false;
  return (
    containsAnyFragment(regimen.code, RING_REGIMEN_FRAGMENTS) ||
    containsAnyFragment(regimen.regimen, RING_REGIMEN_FRAGMENTS) ||
    containsAnyFragment(regimen.display, RING_REGIMEN_FRAGMENTS)
  );
}

/**
 * Skip-logic helper: from a list of regimens, return those that map to the
 * "Ring" PrEP type (i.e. the Dapivirine ring). Encapsulated so callers don't
 * re-derive the dapivirine matching rule.
 */
export function getRingRegimens(regimens) {
  return (regimens || []).filter(isRingRegimen);
}

function typesForCode(code) {
  if (isInjectibleCode(code)) return ["PREP_TYPE_INJECTIBLES"];
  if (containsAnyFragment(code, RING_REGIMEN_FRAGMENTS)) return ["PREP_TYPE_RING"];
  return ["PREP_TYPE_ORAL"];
}

async function fetchRegimenCodesetGroup(group) {
  try {
    const res = await axios.get(
      `${baseUrl}application-codesets/v2/codeSets?codes=${encodeURIComponent(group)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const rows = res?.data?.[group];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(r => ({
      id: r.id,
      regimen: r.display,
      code: r.code,
      types: typesForCode(r.code),
    }));
  } catch (_err) {
    return null;
  }
}

/**
 * Returns PrEP regimens, preferring the live PREP_REGIMEN codeset and
 * falling back to the hardcoded list above when the API is unreachable.
 * Shape: { id, regimen, code }.
 */
export async function fetchPrepRegimens() {
  const live = await fetchRegimenCodesetGroup("PREP_REGIMEN");
  if (live) return stripInternal(live);
  return stripInternal(ALL_REGIMENS.filter(r => r.enrollmentType === "PrEP"));
}

/**
 * Live-filtered PrEP regimens by PrEP type (oral vs injectibles vs ring).
 * Ring uses the encapsulated dapivirine matcher (getRingRegimens) so it keeps
 * working before the Dapivirine regimen is added to the PREP_REGIMEN codeset.
 */
export async function fetchPrepRegimenByType(prepType) {
  const all = await fetchPrepRegimens();
  if (prepType === "PREP_TYPE_RING") {
    return getRingRegimens(all);
  }
  return all.filter(r => (r.types || typesForCode(r.code)).includes(prepType));
}

/**
 * Replaces: GET /application-codesets/v2/DURATION_OF_CAB-LA_INJECTABLE_REFILL
 * @returns {Promise<Array<{code: string, display: string}>>}
 */
export function getInterruptionTypeOptions() {
  return [
    { value: "Stopped", label: "Stopped" },
    { value: "Default", label: "Default" },
    { value: "Dead", label: "Dead" },
    { value: "Referred", label: "Referred" },
  ];
}

// Returns CAB-LA refill durations keyed by the canonical codeset code so the
// dropdown value matches what's persisted on prep_followup_visit.months_of_refill
// and view/edit autopopulates instead of going blank. `months` lets the
// next-appointment math add the right number of months (30 days = 1 month,
// 60 days = 2 months, 90 days = 3 months).
export function fetchCabLaRefillDurations() {
  return Promise.resolve([
    { code: "DURATION_OF_CAB-LA_INJECTABLE_REFILL_30", display: "1 month (30 days)", months: 1 },
    { code: "DURATION_OF_CAB-LA_INJECTABLE_REFILL_60", display: "2 months (60 days)", months: 2 },
    { code: "DURATION_OF_CAB-LA_INJECTABLE_REFILL_90", display: "3 months (90 days)", months: 3 },
  ]);
}

/**
 * Abstract fetch function for the "Setting" field options.
 * Returns options for Facility and Community settings.
 * Replace Promise.resolve with API call when endpoint is ready.
 * @returns {Promise<Array<{value: string, label: string}>>}
 */
export function fetchSettingOptions() {
  return Promise.resolve([
    { value: "CT", label: "CT" },
    { value: "FP", label: "FP" },
    { value: "TB", label: "TB" },
    { value: "STI", label: "STI" },
    { value: "OPD", label: "OPD" },
    { value: "Ward", label: "Ward" },
    { value: "Outreach", label: "Outreach" },
    { value: "Standalone HTS", label: "Standalone HTS" },
    { value: "Others", label: "Others" },
  ]);
}

/**
 * Per-form codeset fetch functions for HIV Prevention (PrEP/PEP) forms.
 *
 * Each function calls GET /application-codesets/v2/codeSets with only the
 * codes needed by that form.  Keys returned by the API are remapped where the
 * API group name differs from the key the form already expects (e.g.
 * PREP_PEP_SIDE_EFFECTS → PREP_SIDE_EFFECTS).
 *
 * On network error every function falls back to the hardcoded data in
 * jsx/components/Consultation/codesets so the UI never breaks.
 */

import axios from "axios";
import { token, url as baseUrl } from "../api";
import {
  fetchAllCodesets as hardcodedFallback,
  fetchSettingOptions as hardcodedSettingOptions,
} from "../jsx/components/Consultation/codesets";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function buildUrl(codes) {
  return (
    `${baseUrl}application-codesets/v2/codeSets?` +
    codes.map(c => `codes=${encodeURIComponent(c)}`).join("&")
  );
}

async function callApi(codes) {
  const res = await axios.get(buildUrl(codes), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { GROUP_KEY: [{ id, code, display }] }
}

/**
 * Add aliased keys so forms that reference e.g. codeset.PREP_SIDE_EFFECTS
 * still work even though the API group is PREP_PEP_SIDE_EFFECTS.
 */
function remap(data, aliasMap) {
  const result = { ...data };
  for (const [apiKey, formKey] of Object.entries(aliasMap)) {
    if (Array.isArray(data[apiKey]) && data[apiKey].length > 0) {
      result[formKey] = data[apiKey];
    }
  }
  return result;
}

// Drop entries that are missing or empty so they don't overwrite richer
// fallback values when merged.
function pruneEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (Array.isArray(v) ? v.length > 0 : v != null) {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Eligibility Screening form
// API codes: PrEP_VISIT_TYPE, POPULATION_TYPE, COUNSELING_TYPE,
//            REASON_PREP_DECLINED, PREP_SETTINGS (→ settingOptions),
//            PREP_SOURCE_REFERRAL (drives the "Referred From" / entry-point
//            select).
// ---------------------------------------------------------------------------

export async function fetchEligibilityScreeningCodesets() {
  try {
    const data = await callApi([
      "PrEP_VISIT_TYPE",
      "POPULATION_TYPE",
      "COUNSELING_TYPE",
      "REASON_PREP_DECLINED",
      "PREP_SETTINGS",
      "PREP_SERVICE_STATUS",
      "PREGNANCY_STATUS",
      "TIME_LAST_NEGATIVE_TEST_RESULT",
      "HIV_TEST_RESULT",
      "PREP_SOURCE_REFERRAL",
      "SEX",
      "YES_NO",
    ]);

    // Convert PREP_SETTINGS to the { value, label } shape the form uses
    const settingOptions = (data.PREP_SETTINGS || []).map(item => ({
      value: item.display,
      label: item.display,
    }));

    return { codeset: data, settingOptions };
  } catch (_err) {
    const [codeset, settingOptions] = await Promise.all([
      hardcodedFallback(),
      hardcodedSettingOptions(),
    ]);
    return { codeset, settingOptions };
  }
}

// ---------------------------------------------------------------------------
// Initial Visit (Initiation) form
// API codes: RELATIONSHIP, PREGNANCY_STATUS, PREP_HISTORY_OF_DRUG_INTERACTIONS,
//            PREP_URINALYSIS_RESULT, LIVER_FUNCTION_TEST_RESULT,
//            HTS_ENTRY_POINT, PREP_RISK_TYPE
// ---------------------------------------------------------------------------

export async function fetchInitialVisitCodesets() {
  try {
    return await callApi([
      "RELATIONSHIP",
      "PREGNANCY_STATUS",
      "PREP_HISTORY_OF_DRUG_INTERACTIONS",
      "PREP_URINALYSIS_RESULT",
      "LIVER_FUNCTION_TEST_RESULT",
      "HTS_ENTRY_POINT",
      "PREP_RISK_TYPE",
      "POPULATION_TYPE",
      "HIV_TEST_RESULT",
      "PrEP_TYPE",
      "YES_NO",
    ]);
  } catch (_err) {
    return hardcodedFallback();
  }
}

// ---------------------------------------------------------------------------
// Commencement form
// API codes: PREGNANCY_STATUS, PREP_URINALYSIS_RESULT,
//            PREP_HISTORY_OF_DRUG_INTERACTIONS, LIVER_FUNCTION_TEST_RESULT,
//            PrEP_TYPE, PrEP_ENTRY_POINT
// ---------------------------------------------------------------------------

export async function fetchCommencementCodesets() {
  try {
    return await callApi([
      "PREGNANCY_STATUS",
      "PREP_URINALYSIS_RESULT",
      "PREP_HISTORY_OF_DRUG_INTERACTIONS",
      "LIVER_FUNCTION_TEST_RESULT",
      "PrEP_TYPE",
      "PrEP_ENTRY_POINT",
      "YES_NO",
    ]);
  } catch (_err) {
    return hardcodedFallback();
  }
}

// ---------------------------------------------------------------------------
// PrEP Follow-up Visit form (Consultation/Home.js)
// API codes: PrEP_VISIT_TYPE,
//            PREP_PEP_SIDE_EFFECTS → PREP_SIDE_EFFECTS,
//            SYNDROMIC_STI_SCREENING,
//            PREP_PEP_RISK_REDUCTION_PLAN → PrEP_RISK_REDUCTION_PLAN,
//            PREP_PEP_LEVEL_OF_ADHERENCE → PrEP_LEVEL_OF_ADHERENCE,
//            WHY_POOR_FAIR_ADHERENCE, PrEP_TYPE, PREP_URINALYSIS_RESULT,
//            HEPATITIS_SCREENING_RESULT, SYPHILIS_RESULT,
//            LIVER_FUNCTION_TEST_RESULT, PREP_OTHER_TEST,
//            REASON_METHOD_SWITCH, FAMILY_PLANNING_METHOD
// ---------------------------------------------------------------------------

export async function fetchFollowupVisitCodesets() {
  const fallback = hardcodedFallback();
  try {
    const data = await callApi([
      "PrEP_VISIT_TYPE",
      "PREP_SIDE_EFFECTS",
      "SYNDROMIC_STI_SCREENING",
      "PREP_PEP_RISK_REDUCTION_PLAN",
      "PREP_PEP_LEVEL_OF_ADHERENCE",
      "PrEP_LEVEL_OF_ADHERENCE_REASONS",
      "PrEP_TYPE",
      "PREP_REGIMEN",
      "PREP_URINALYSIS_RESULT",
      "HEPATITIS_SCREENING_RESULT",
      "SYPHILIS_RESULT",
      "LIVER_FUNCTION_TEST_RESULT",
      "PREP_OTHER_TEST",
      "REASON_METHOD_SWITCH",
      "FAMILY_PLANNING_METHOD",
      "PREGNANCY_STATUS",
      "HIV_TEST_RESULT",
      "YES_NO",
    ]);
    // Forms reference PrEP_RISK_REDUCTION_PLAN / PrEP_LEVEL_OF_ADHERENCE; alias from the
    // PREP_PEP_* group names that the API actually exposes.
    const remapped = remap(data, {
      PREP_PEP_RISK_REDUCTION_PLAN: "PrEP_RISK_REDUCTION_PLAN",
      PREP_PEP_LEVEL_OF_ADHERENCE: "PrEP_LEVEL_OF_ADHERENCE",
    });
    return { ...fallback, ...pruneEmpty(remapped) };
  } catch (_err) {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// PEP Follow-up Visit form (Consultation/PEPFollowupVisit.js)
// API codes: PEP_MODE_OF_EXPOSURE,
//            DURATION_BEFORE_PEP_PROVIDED → PEP_DURATION_BEFORE_PEP,
//            HIV_STATUS_AT_EXPOSURE → PEP_HIV_STATUS_AT_EXPOSURE,
//            PREP_PEP_SIDE_EFFECTS → PREP_SIDE_EFFECTS,
//            SYNDROMIC_STI_SCREENING,
//            PREP_PEP_RISK_REDUCTION_PLAN → PrEP_RISK_REDUCTION_PLAN,
//            PREP_PEP_LEVEL_OF_ADHERENCE → PrEP_LEVEL_OF_ADHERENCE,
//            WHY_POOR_FAIR_ADHERENCE, PEP_REGIMEN,
//            PEP_FOLLOW_UP_HIV_TEST_RESULT → PEP_FOLLOWUP_HIV_TEST_RESULT
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Discontinuation / Interruption form
// API codes: PREP_DISCONTINUATION_TYPE, PREP_DISCONTINUATION_REASON,
//            HIV_TEST_RESULT, EARLY_DETECT_VIRAL_LOAD_RESULT
// ---------------------------------------------------------------------------

// Fallback PREP_DISCONTINUATION_TYPE entries we hardcode so the form keeps
// working before the new server-side codeset entries are seeded. We only
// inject codes that the API didn't already return, so the API stays the
// source of truth once Dead/Referred/Seroconverted are added there.
const FALLBACK_DISCONTINUATION_TYPES = [
  { code: "PREP_DISCONTINUATION_TYPE_DEAD",          display: "Dead" },
  { code: "PREP_DISCONTINUATION_TYPE_REFERRED",      display: "Referred" },
  { code: "PREP_DISCONTINUATION_TYPE_SEROCONVERTED", display: "Seroconverted" },
];

function withFallbackDiscontinuationTypes(data) {
  const existing = Array.isArray(data?.PREP_DISCONTINUATION_TYPE)
    ? data.PREP_DISCONTINUATION_TYPE : [];
  const existingCodes = new Set(existing.map(e => e?.code));
  const merged = [...existing];
  let nextId = (existing.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0)) + 1;
  for (const fb of FALLBACK_DISCONTINUATION_TYPES) {
    if (!existingCodes.has(fb.code)) {
      merged.push({ id: nextId++, code: fb.code, display: fb.display });
    }
  }
  return { ...(data || {}), PREP_DISCONTINUATION_TYPE: merged };
}

export async function fetchDiscontinuationCodesets() {
  try {
    const data = await callApi([
      "PREP_DISCONTINUATION_TYPE",
      "PREP_DISCONTINUATION_REASON",
      "HIV_TEST_RESULT",
      "EARLY_DETECT_VIRAL_LOAD_RESULT",
      // Drives the PEP Completion select (Yes / No). We persist the codeset
      // code (YES_NO_YES / YES_NO_NO) so server-side queries can match exact
      // strings without resorting to fuzzy ILIKE.
      "YES_NO",
    ]);
    return withFallbackDiscontinuationTypes(data);
  } catch (_err) {
    return withFallbackDiscontinuationTypes(await hardcodedFallback());
  }
}

export async function fetchPEPFollowupCodesets() {
  const fallback = hardcodedFallback();
  try {
    const data = await callApi([
      "PEP_MODE_OF_EXPOSURE",
      "DURATION_BEFORE_PEP_PROVIDED",
      "HIV_STATUS_AT_EXPOSURE",
      "PREP_SIDE_EFFECTS",
      "SYNDROMIC_STI_SCREENING",
      "PREP_PEP_RISK_REDUCTION_PLAN",
      "PREP_PEP_LEVEL_OF_ADHERENCE",
      "PrEP_LEVEL_OF_ADHERENCE_REASONS",
      "PEP_REGIMEN",
      "PEP_FOLLOW_UP_HIV_TEST_RESULT",
      // Used by the "Result" select on Follow-up HIV Test Results — the
      // "Test" select uses PEP_FOLLOW_UP_HIV_TEST_RESULT (remapped to
      // PEP_FOLLOWUP_HIV_TEST_RESULT below) but the "Result" select uses
      // the canonical HIV_TEST_RESULT codeset.
      "HIV_TEST_RESULT",
      "PREGNANCY_STATUS",
      "YES_NO",
    ]);
    const remapped = remap(data, {
      DURATION_BEFORE_PEP_PROVIDED: "PEP_DURATION_BEFORE_PEP",
      HIV_STATUS_AT_EXPOSURE: "PEP_HIV_STATUS_AT_EXPOSURE",
      PREP_PEP_RISK_REDUCTION_PLAN: "PrEP_RISK_REDUCTION_PLAN",
      PREP_PEP_LEVEL_OF_ADHERENCE: "PrEP_LEVEL_OF_ADHERENCE",
      PEP_FOLLOW_UP_HIV_TEST_RESULT: "PEP_FOLLOWUP_HIV_TEST_RESULT",
    });
    return { ...fallback, ...pruneEmpty(remapped) };
  } catch (_err) {
    return fallback;
  }
}

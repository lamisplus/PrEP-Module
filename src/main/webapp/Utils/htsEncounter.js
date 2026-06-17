/**
 * Helpers for the linked HTS encounter that PrEP/PEP forms auto-populate from.
 *
 * Per the bootcamp requirement a valid HTS record is required for PrEP/PEP
 * screening. Records migrated from the old PrEP tables frequently have no
 * hts_encounter, a dangling hts_encounter_uuid, or a malformed encounter
 * payload — in those cases the form hard-blocks (see HtsWarningModal): the user
 * is told to provide HTS service in the HTS module before continuing.
 */

import { isRecognizedHivResultCode } from "./htsResultMapper";

// Canonical PREGNANCY_STATUS codeset values used by the HIV Prevention forms.
const PREGNANCY_STATUS_PREGNANT = "PREGNANCY_STATUS_PREGNANT";
const PREGNANCY_STATUS_BREASTFEEDING = "PREGNANCY_STATUS_BREASTFEEDING";
const PREGNANCY_STATUS_NOT_PREGNANT = "PREGNANCY_STATUS_NOT_PREGNANT";

/**
 * A "valid" HTS encounter is a non-null, non-array object that carries a
 * `uuid` and a structured `observation` object (where pregnancy status / HIV
 * result live). Anything else — null, a primitive, an array, or a record
 * missing its observation — is treated as "no valid HTS record found".
 *
 * @param {*} hts the resolved hts_encounter object (or null)
 * @returns {boolean}
 */
export function isValidHtsEncounter(hts) {
  return !!(
    hts &&
    typeof hts === "object" &&
    !Array.isArray(hts) &&
    hts.uuid &&
    hts.observation &&
    typeof hts.observation === "object"
  );
}

/** Message shown in the hard-block modal when no valid HTS encounter is found. */
export const NO_VALID_HTS_MESSAGE =
  "No valid HTS record was found for this client. Please go to the HTS module " +
  "and provide an HTS service for the client before you continue";

/**
 * Collapse the HTS observation's pregnancy/breastfeeding flags into a single
 * mutually-exclusive PREGNANCY_STATUS_* codeset value (the screening/initiation
 * dropdowns are single-select).
 *
 * Migrated/community HTS records store this as a space-joined, sometimes
 * misspelled string, e.g. "PREGANACY_STATUS_PREGNANT BREASTFEEDING_NO"
 * (note PREGANACY). We scan the whole repaired string for intent rather than
 * relying on token positions, and — per product decision — pregnancy wins when
 * a record is flagged both pregnant and breastfeeding.
 *
 * @param {*} raw the observation's pregnancyStatus value
 * @returns {string} a canonical PREGNANCY_STATUS_* code, or "" when unknown
 */
export function normalizePregnancyStatus(raw) {
  if (!raw || typeof raw !== "string") return "";
  // Repair the legacy "PREGANACY" misspelling so the keyword scan is uniform.
  const s = raw.toUpperCase().replace(/PREGANACY/g, "PREGNANCY");

  const isNotPregnant = /NOT[_ ]PREGNANT/.test(s);
  const isPregnant = !isNotPregnant && /STATUS_PREGNANT\b/.test(s);
  // "BREASTFEEDING_YES"/"BREASTFEEDING YES" on the flag form, or the bare
  // codeset value "...STATUS_BREASTFEEDING".
  const isBreastfeeding =
    /BREASTFEEDING[_ ]YES/.test(s) || /STATUS_BREASTFEEDING\b/.test(s);

  if (isPregnant) return PREGNANCY_STATUS_PREGNANT;
  if (isBreastfeeding) return PREGNANCY_STATUS_BREASTFEEDING;
  if (isNotPregnant) return PREGNANCY_STATUS_NOT_PREGNANT;
  return "";
}

/**
 * Return a copy of an HTS `observation` with the fields the PrEP/PEP forms
 * auto-populate from normalised, so the existing mapping logic works for
 * migrated/community records as well as natively-captured ones:
 *
 *   • HIV result — when neither `confirmatoryHivTest` nor `initialHivTest`
 *     carries a recognised result code (migrated records often hold "No" or
 *     null there), fall back to the plain `finalHivTestResult` ("Negative"/
 *     "Positive") by seeding `confirmatoryHivTest`, which every consumer reads
 *     first via `confirmatoryHivTest || initialHivTest`.
 *   • Pregnancy status — collapse the legacy space-joined / misspelled value to
 *     a single canonical PREGNANCY_STATUS_* code (see normalizePregnancyStatus).
 *
 * Pure and cheap (a handful of string checks on one object); callers should
 * memoise on the encounter uuid so it runs once per record, not per render.
 *
 * @param {*} observation the hts_encounter `observation` object (or null)
 * @returns {object} a normalised shallow copy (or {} when absent)
 */
export function normalizeHtsObservation(observation) {
  if (!observation || typeof observation !== "object" || Array.isArray(observation))
    return {};

  const normalized = { ...observation };

  // HIV result fallback: only synthesise when the coded fields don't already
  // carry a usable result, so natively-captured encounters are untouched.
  const hasCodedResult =
    isRecognizedHivResultCode(observation.confirmatoryHivTest) ||
    isRecognizedHivResultCode(observation.initialHivTest);
  if (!hasCodedResult && isRecognizedHivResultCode(observation.finalHivTestResult)) {
    normalized.confirmatoryHivTest = observation.finalHivTestResult;
  }

  // Pregnancy status: normalise to a single canonical codeset value when a raw
  // value is present. Leave empty/absent values as-is so the field stays open.
  if (observation.pregnancyStatus) {
    normalized.pregnancyStatus =
      normalizePregnancyStatus(observation.pregnancyStatus) ||
      observation.pregnancyStatus;
  }

  return normalized;
}

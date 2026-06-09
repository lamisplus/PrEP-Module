/**
 * Helpers for the linked HTS encounter that PrEP/PEP forms auto-populate from.
 *
 * Per the bootcamp requirement a valid HTS record is required for PrEP/PEP
 * screening. Records migrated from the old PrEP tables frequently have no
 * hts_encounter, a dangling hts_encounter_uuid, or a malformed encounter
 * payload — in those cases the form hard-blocks (see HtsWarningModal): the user
 * is told to provide HTS service in the HTS module before continuing.
 */

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

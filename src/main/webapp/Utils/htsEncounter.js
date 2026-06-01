/**
 * Helpers for the linked HTS encounter that PrEP/PEP forms auto-populate from.
 *
 * Records migrated from the old PrEP tables frequently have no hts_encounter,
 * a dangling hts_encounter_uuid, or a malformed encounter payload. We therefore
 * treat HTS as a *soft* dependency: the form should warn the user that HTS
 * information may not populate or save, but must never block submission and
 * must never validate HTS-sourced fields as required.
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

/** Warning shown (once) when a form cannot find a valid linked HTS encounter. */
export const NO_VALID_HTS_WARNING =
  "No valid HTS Record was found. Please confirm that the patient has a recent, " +
  "valid HTS encounter before proceeding — you may not be able to view or save " +
  "the client's HTS information properly.";

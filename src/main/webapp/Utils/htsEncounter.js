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
 * A "complete" HTS observation carries at least one HIV-result field saved with
 * its codeset prefix — the shape current HTS service produces. Records migrated
 * from the old hts_client table store the outcome only as a plain
 * `finalHivTestResult` ("Negative"/"Positive") with `initialHivTest` left as the
 * literal "No"/"Yes", no `confirmatoryHivTest` and no `typeOfHivTestDone`; those
 * are treated as incomplete so the form hard-blocks and the user is sent back to
 * HTS to provide a fresh, fully-coded service (i.e. a retake).
 *
 * @param {Object} observation the hts_encounter.observation object
 * @returns {boolean}
 */
function hasRecognizedHivResult(observation) {
  const startsWith = (value, prefix) =>
    typeof value === "string" && value.indexOf(prefix) === 0;
  return (
    startsWith(observation.initialHivTest, "STI_HIV_RESULT_") ||
    startsWith(observation.confirmatoryHivTest, "HIV_CONFIRMATORY_TEST_RESULT_") ||
    startsWith(observation.hivEarlyDetectResult, "HIV_EARLY_DETECT_RESULT_") ||
    startsWith(observation.typeOfHivTestDone, "TYPE_OF_HIV_TEST_")
  );
}

/**
 * A "valid" HTS encounter is a non-null, non-array object that carries a
 * `uuid` and a structured `observation` object (where pregnancy status / HIV
 * result live) AND a recognised, codeset-coded HIV result. Anything else —
 * null, a primitive, an array, a record missing its observation, or a legacy
 * migrated record whose HIV result was never coded — is treated as "no valid
 * HTS record found" and the service forms hard-block on it.
 *
 * Note this gates the service forms only; the dashboard Patient Card reads
 * pregnancy status from a separate field, so it stays visible for these clients.
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
    typeof hts.observation === "object" &&
    hasRecognizedHivResult(hts.observation)
  );
}

/** Message shown in the hard-block modal when no valid HTS encounter is found. */
export const NO_VALID_HTS_MESSAGE =
  "No valid HTS record was found for this client. Please go to the HTS module " +
  "and provide an HTS service for the client before you continue";

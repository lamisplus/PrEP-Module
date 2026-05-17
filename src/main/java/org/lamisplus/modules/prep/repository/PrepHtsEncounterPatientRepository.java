package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.HtsEncounterRow;
import org.lamisplus.modules.prep.domain.entity.PrepHtsPatient;
import org.lamisplus.modules.prep.util.HtsObservationKeys;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * Queries that drive the HIV Prevention "Patients" tab off of {@code hts_encounter}
 * rather than {@code prophylaxis_initiation}. Bound to {@link Person} because the
 * result rows are patient-shaped; this repo never touches the prophylaxis tables
 * directly except via LEFT JOINs to derive the existing status / counts the UI
 * still depends on.
 */
public interface PrepHtsEncounterPatientRepository extends JpaRepository<Person, Long> {

    String BASE_SELECT =
            "SELECT DISTINCT ON (p.id)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    COALESCE(init_count.enrollment_count, 0) AS enrollmentCount,\n" +
            "    COALESCE(el.eligibility_count, 0) AS eligibilityCount,\n" +
            "    p.id AS personId,\n" +
            "    CAST(p.uuid AS text) AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    hts.client_code AS htsClientCode,\n" +
            "    hts.id AS latestHtsId,\n" +
            "    CAST(hts.uuid AS text) AS latestHtsUuid,\n" +
            "    hts.patient_id AS latestHtsPatientId,\n" +
            "    CAST(hts.patient_uuid AS text) AS latestHtsPatientUuid,\n" +
            "    hts.date_of_visit AS latestHtsDateOfVisit,\n" +
            "    hts.setting AS latestHtsSetting,\n" +
            "    CAST(hts.observation AS text) AS latestHtsObservation,\n" +
            "    hts.facility_id AS latestHtsFacilityId,\n" +
            "    preg_codeset.display AS pregnancyStatusDisplay,\n" +
            // PEP-only flag: true when the early-detect result indicates acute
            // infection (antigen reactive or antigen + antibody reactive) AND
            // the test type is HIV early detect. Drives the frontend Enroll
            // modal to hide the PrEP option for these patients.
            "    CASE WHEN hts.observation->>'" + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE + "' = '"
                    + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE_VALUE_HIV_EARLY_DETECT + "'\n" +
            "         AND hts.observation->>'" + HtsObservationKeys.KEY_HIV_EARLY_DETECT_RESULT + "' IN ('"
                    + HtsObservationKeys.EARLY_DETECT_ANTIGEN_REACTIVE + "', '"
                    + HtsObservationKeys.EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE + "')\n" +
            "         THEN true ELSE false END AS pepOnly,\n" +
            "    CASE\n" +
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'\n" +
            "        WHEN prepi.interruption_date IS NOT NULL AND (prepc.encounter_date IS NULL OR prepi.interruption_date >= prepc.encounter_date) THEN COALESCE(bac.display,\n" +
            "             CASE prepi.interruption_type \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' \n" +
            "               ELSE prepi.interruption_type \n" +
            "             END) \n" +
            "        WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV'\n" +
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled'\n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted'\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 59 THEN 'Discontinued'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 37 THEN 'Delayed Injection'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 89 THEN 'Discontinued'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 67 THEN 'Delayed Injection'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "            CASE\n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "            CASE\n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "            CASE\n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        ELSE prepc.status\n" +
            "    END AS prepStatus\n";

    String FROM_AND_JOINS =
            "FROM hts_encounter hts\n" +
            "INNER JOIN (\n" +
            "    SELECT patient_id, MAX(date_of_visit) AS max_date\n" +
            "    FROM hts_encounter\n" +
            "    WHERE archived = false\n" +
            "    GROUP BY patient_id\n" +
            ") latest_hts ON latest_hts.patient_id = hts.patient_id\n" +
            "          AND latest_hts.max_date = hts.date_of_visit\n" +
            "INNER JOIN patient_person p ON p.id = hts.patient_id\n" +
            "LEFT JOIN (\n" +
            "    SELECT COUNT(el.person_uuid) AS eligibility_count, el.person_uuid\n" +
            "    FROM prophylaxis_screening el\n" +
            "    WHERE CAST(el.archived AS BOOLEAN) = false\n" +
            "    GROUP BY el.person_uuid\n" +
            ") el ON el.person_uuid = p.uuid\n" +
            "LEFT JOIN (\n" +
            "    SELECT COUNT(*) AS enrollment_count, person_uuid\n" +
            "    FROM prophylaxis_initiation\n" +
            "    WHERE CAST(archived AS BOOLEAN) = false\n" +
            "    GROUP BY person_uuid\n" +
            ") init_count ON init_count.person_uuid = p.uuid\n" +
            "LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false\n" +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = CAST(?1 AS INTEGER)\n" +
            "LEFT JOIN (\n" +
            "    SELECT pc.person_uuid,\n" +
            "           MAX(pc.encounter_date) AS encounter_date, pc.duration,\n" +
            "           pc.visit_type AS visit_type, pc.prep_type AS prep_type, pc.previous_prep_status AS previous_prep_status,\n" +
            "           CASE WHEN (pc.encounter_date + pc.duration) > CAST(NOW() AS DATE) THEN 'Active' ELSE 'Defaulted' END AS status\n" +
            "    FROM prep_followup_visit pc\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(pc.encounter_date) AS encounter_date, pc.person_uuid\n" +
            "        FROM prep_followup_visit pc\n" +
            "        WHERE CAST(pc.archived AS BOOLEAN) = false\n" +
            "        GROUP BY pc.person_uuid\n" +
            "    ) max_p ON max_p.encounter_date = pc.encounter_date AND max_p.person_uuid = pc.person_uuid\n" +
            "    WHERE CAST(pc.archived AS BOOLEAN) = false\n" +
            "    GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status, status\n" +
            ") prepc ON prepc.person_uuid = p.uuid\n" +
            // The form persists the type-specific date into its own column
            // (date_defaulted for Default, date_client_died for Dead, etc.),
            // so COALESCE these into a single effective_interruption_date that
            // the main CASE compares against the latest encounter date. This
            // is the same fix applied to findPersonPrepAndStatusByPatientUuid
            // so the Patient tab and dashboard agree.
            // DISTINCT ON picks the latest interruption per person, COALESCE
            // over the type-specific date columns. Simpler + avoids the
            // INNER-JOIN-on-MAX trap where rows silently disappear if the
            // GROUP BY fingerprint doesn't round-trip.
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (pi.person_uuid) pi.id, pi.person_uuid, \n" +
            "           COALESCE(pi.interruption_date, pi.date_defaulted, pi.date_client_died, pi.date_client_referred_out, pi.date_sero_converted) AS interruption_date, \n" +
            "           pi.interruption_type\n" +
            "    FROM prophylaxis_interruptions pi\n" +
            "    WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "    ORDER BY pi.person_uuid,\n" +
            "             COALESCE(pi.interruption_date, pi.date_defaulted, pi.date_client_died, pi.date_client_referred_out, pi.date_sero_converted) DESC NULLS LAST,\n" +
            "             pi.id DESC\n" +
            ") prepi ON prepi.person_uuid = p.uuid\n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type\n" +
            "LEFT JOIN base_application_codeset preg_codeset\n" +
            "    ON preg_codeset.code = hts.observation->>'" + HtsObservationKeys.KEY_PREGNANCY_STATUS + "'\n";

    // Hard exclusion (highest precedence, AND-ed on top of the inclusion):
    //   confirmatoryHivTest = STI_HIV_RESULT_POSITIVE  -> always exclude.
    //
    // NULL and empty-string both PASS this check — when the user records a
    // negative initialHivTest they don't fill the confirmatory field at all,
    // so observation->>'confirmatoryHivTest' comes back as NULL (key absent)
    // or '' (key present but empty). Those rows are still candidates; only
    // an explicit "STI_HIV_RESULT_POSITIVE" string disqualifies.
    //
    // Inclusion has two branches keyed on typeOfHivTestDone:
    //   ── Branch A: TYPE_OF_HIV_TEST_RAPID_ANTIBODY (or unset / unknown) ──
    //   Any one of:
    //     1. confirmatoryHivTest = NEGATIVE
    //     2. initialHivTest      = NEGATIVE
    //     3. hivEarlyDetectResult IN (ANTIBODY_REACTIVE, ANTIGEN_REACTIVE,
    //                                 ANTIGEN_+_ANTIBODY_REACTIVE)
    //
    //   ── Branch B: TYPE_OF_HIV_TEST_HIV_EARLY_DETECT ──
    //   Must have hivEarlyDetectResult IN (ANTIBODY_REACTIVE, ANTIGEN_REACTIVE,
    //   ANTIGEN_+_ANTIBODY_REACTIVE) AND confirmatoryHivTest = NEGATIVE.
    //   When the early-detect result is antigen-only or antigen+antibody, the
    //   row is still kept but the SELECT-side `pepOnly` flag tells the UI to
    //   restrict enrollment to PEP only.
    String WHERE_FILTERS =
            "WHERE hts.archived = false\n" +
            "AND p.archived = CAST(?1 AS INTEGER)\n" +
            "AND hts.facility_id = ?2\n" +
            // Hard exclusion: confirmed-positive is a permanent disqualifier.
            // Reads as "confirmatoryHivTest is anything other than the literal
            // POSITIVE code" — NULL and '' (both produced when the user didn't
            // fill the field because initialHivTest was already negative)
            // satisfy the check and the row stays.
            "AND COALESCE(hts.observation->>'" + HtsObservationKeys.KEY_CONFIRMATORY_HIV_TEST + "', '') <> '"
                    + HtsObservationKeys.CONFIRMATORY_HIV_TEST_POSITIVE + "'\n" +
            // Two-branch inclusion.
            "AND (\n" +
            // ── Branch A: rapid antibody (or unset) — OR of three positives ──
            "  ( (hts.observation->>'" + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE + "' IS NULL\n" +
            "      OR hts.observation->>'" + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE + "' = ''\n" +
            "      OR hts.observation->>'" + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE + "' = '"
                    + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE_VALUE_RAPID_ANTIBODY + "')\n" +
            "    AND (\n" +
            "         hts.observation->>'" + HtsObservationKeys.KEY_CONFIRMATORY_HIV_TEST + "' = '"
                    + HtsObservationKeys.CONFIRMATORY_HIV_TEST_NEGATIVE + "'\n" +
            "      OR hts.observation->>'" + HtsObservationKeys.KEY_INITIAL_HIV_TEST + "' = '"
                    + HtsObservationKeys.INITIAL_HIV_TEST_NEGATIVE + "'\n" +
            "      OR hts.observation->>'" + HtsObservationKeys.KEY_HIV_EARLY_DETECT_RESULT + "' IN ('"
                    + HtsObservationKeys.EARLY_DETECT_ANTIBODY_REACTIVE + "', '"
                    + HtsObservationKeys.EARLY_DETECT_ANTIGEN_REACTIVE + "', '"
                    + HtsObservationKeys.EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE + "')\n" +
            "    )\n" +
            "  )\n" +
            "  OR\n" +
            // ── Branch B: early-detect — reactive marker, confirmatory not positive ──
            // We only require a reactive early-detect marker here; the
            // "confirmatory is not positive" guarantee is already enforced
            // by the hard-exclusion clause above (COALESCE(…) <> POSITIVE).
            // This lets empty / unset confirmatoryHivTest (the common case for
            // early-detect patients — the form doesn't always capture it)
            // still pass.
            "  ( hts.observation->>'" + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE + "' = '"
                    + HtsObservationKeys.KEY_TYPE_OF_HIV_TEST_DONE_VALUE_HIV_EARLY_DETECT + "'\n" +
            "    AND hts.observation->>'" + HtsObservationKeys.KEY_HIV_EARLY_DETECT_RESULT + "' IN ('"
                    + HtsObservationKeys.EARLY_DETECT_ANTIBODY_REACTIVE + "', '"
                    + HtsObservationKeys.EARLY_DETECT_ANTIGEN_REACTIVE + "', '"
                    + HtsObservationKeys.EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE + "')\n" +
            "  )\n" +
            ")\n";

    String GROUP_BY =
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    p.date_of_registration,\n" +
            "    init_count.enrollment_count, el.eligibility_count,\n" +
            "    p.id, p.uuid, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled,\n" +
            "    hts.client_code, hts.id, hts.uuid, hts.patient_id, hts.patient_uuid,\n" +
            "    hts.date_of_visit, hts.setting, hts.observation, hts.facility_id,\n" +
            "    preg_codeset.display\n";

    @Query(value =
            BASE_SELECT +
            FROM_AND_JOINS +
            WHERE_FILTERS +
            GROUP_BY +
            "ORDER BY p.id, hts.date_of_visit DESC NULLS LAST",
            countQuery =
                    "SELECT COUNT(DISTINCT p.id)\n" +
                    FROM_AND_JOINS +
                    WHERE_FILTERS,
            nativeQuery = true)
    Page<PrepHtsPatient> findAllPatients(Boolean archived, Long facilityId, Pageable pageable);

    @Query(value =
            BASE_SELECT +
            FROM_AND_JOINS +
            WHERE_FILTERS +
            "AND (p.first_name ILIKE ?3\n" +
            "     OR p.full_name ILIKE ?3\n" +
            "     OR p.surname ILIKE ?3\n" +
            "     OR p.other_name ILIKE ?3\n" +
            "     OR p.hospital_number ILIKE ?3\n" +
            "     OR hts.client_code ILIKE ?3)\n" +
            GROUP_BY +
            "ORDER BY p.id, hts.date_of_visit DESC NULLS LAST",
            countQuery =
                    "SELECT COUNT(DISTINCT p.id)\n" +
                    FROM_AND_JOINS +
                    WHERE_FILTERS +
                    "AND (p.first_name ILIKE ?3\n" +
                    "     OR p.full_name ILIKE ?3\n" +
                    "     OR p.surname ILIKE ?3\n" +
                    "     OR p.other_name ILIKE ?3\n" +
                    "     OR p.hospital_number ILIKE ?3\n" +
                    "     OR hts.client_code ILIKE ?3)",
            nativeQuery = true)
    Page<PrepHtsPatient> searchPatients(Boolean archived, Long facilityId, String search, Pageable pageable);

    /**
     * Fetches a single {@code hts_encounter} row by its uuid — used when a
     * PrEP form (screening / initiation / followup / clinic) is loaded for
     * view/edit and needs to rehydrate the HTS values it linked via
     * {@code hts_encounter_uuid}. JSON columns are cast to text and parsed in the
     * service layer.
     */
    @Query(value =
            "SELECT hts.id              AS id,\n" +
            "       CAST(hts.uuid AS text)         AS uuid,\n" +
            "       hts.patient_id      AS patientId,\n" +
            "       CAST(hts.patient_uuid AS text) AS patientUuid,\n" +
            "       hts.client_code     AS clientCode,\n" +
            "       hts.date_of_visit   AS dateOfVisit,\n" +
            "       hts.setting         AS setting,\n" +
            "       CAST(hts.observation AS text)  AS observation,\n" +
            "       hts.facility_id     AS facilityId\n" +
            "FROM hts_encounter hts\n" +
            "WHERE CAST(hts.uuid AS text) = ?1\n" +
            "  AND hts.archived = false",
            nativeQuery = true)
    Optional<HtsEncounterRow> findHtsEncounterByUuid(String uuid);

    /**
     * Returns the codeset display for the {@code pregnancyStatus} value on the
     * patient's most recent non-archived hts_encounter. Used to keep the Patient
     * Card on the dashboard populated now that {@code prophylaxis_initiation}
     * no longer stores pregnancy status directly.
     */
    @Query(value =
            "SELECT preg.display\n" +
            "FROM hts_encounter hts\n" +
            "INNER JOIN patient_person p ON p.id = hts.patient_id\n" +
            "LEFT JOIN base_application_codeset preg\n" +
            "    ON preg.code = hts.observation->>'" + HtsObservationKeys.KEY_PREGNANCY_STATUS + "'\n" +
            "WHERE hts.archived = false\n" +
            "  AND CAST(p.uuid AS text) = ?1\n" +
            "ORDER BY hts.date_of_visit DESC NULLS LAST, hts.id DESC\n" +
            "LIMIT 1",
            nativeQuery = true)
    String findLatestPregnancyStatusDisplay(String personUuid);
}

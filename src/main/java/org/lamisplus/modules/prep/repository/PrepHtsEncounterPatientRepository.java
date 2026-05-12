package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepHtsPatient;
import org.lamisplus.modules.prep.util.HtsObservationKeys;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    CAST(p.uuid AS text) AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
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
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'\n" +
            "        WHEN prepi.interruption_date > prepc.encounter_date THEN bac.display\n" +
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
            "LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false\n" +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = CAST(?1 AS INTEGER)\n" +
            "LEFT JOIN (\n" +
            "    SELECT pc.person_uuid, COUNT(pc.person_uuid) AS commencementCount,\n" +
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
            "LEFT JOIN (\n" +
            "    SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "    FROM prophylaxis_interruptions pi\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) AS interruption_date\n" +
            "        FROM prophylaxis_interruptions pi\n" +
            "        WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "        GROUP BY pi.person_uuid\n" +
            "    ) pit ON pit.interruption_date = pi.interruption_date AND pit.person_uuid = pi.person_uuid\n" +
            "    WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "    GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            ") prepi ON prepi.person_uuid = p.uuid\n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type\n" +
            "LEFT JOIN (\n" +
            "    WITH latest_hts_client AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hc.person_uuid, hc.date_visit AS visitDate, hc.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hc\n" +
            "    JOIN latest_hts_client ON hc.person_uuid = latest_hts_client.person_uuid\n" +
            "                          AND hc.date_visit = latest_hts_client.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n";

    // initialHivTest must be NEGATIVE; confirmatoryHivTest must NOT be POSITIVE
    // (empty / null / NEGATIVE all pass); early-detect must indicate acute infection.
    String WHERE_FILTERS =
            "WHERE hts.archived = false\n" +
            "AND p.archived = CAST(?1 AS INTEGER)\n" +
            "AND hts.facility_id = ?2\n" +
            "AND hts.observation->>'" + HtsObservationKeys.KEY_INITIAL_HIV_TEST + "' = '"
                    + HtsObservationKeys.HIV_RESULT_NEGATIVE + "'\n" +
            "AND (hts.observation->>'" + HtsObservationKeys.KEY_CONFIRMATORY_HIV_TEST + "' IS NULL\n" +
            "     OR hts.observation->>'" + HtsObservationKeys.KEY_CONFIRMATORY_HIV_TEST + "' <> '"
                    + HtsObservationKeys.HIV_RESULT_POSITIVE + "')\n" +
            "AND hts.observation->>'" + HtsObservationKeys.KEY_HIV_EARLY_DETECT_RESULT + "' IN (\n" +
            "    '" + HtsObservationKeys.EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE + "',\n" +
            "    '" + HtsObservationKeys.EARLY_DETECT_ANTIGEN_REACTIVE + "'\n" +
            ")\n";

    String GROUP_BY =
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.uuid, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled,\n" +
            "    hts.client_code, hts.id, hts.uuid, hts.patient_id, hts.patient_uuid,\n" +
            "    hts.date_of_visit, hts.setting, hts.observation, hts.facility_id\n";

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
            "     OR pet.unique_id ILIKE ?3\n" +
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
                    "     OR pet.unique_id ILIKE ?3\n" +
                    "     OR hts.client_code ILIKE ?3)",
            nativeQuery = true)
    Page<PrepHtsPatient> searchPatients(Boolean archived, Long facilityId, String search, Pageable pageable);
}

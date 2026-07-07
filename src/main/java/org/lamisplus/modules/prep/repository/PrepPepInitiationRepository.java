package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.lamisplus.modules.prep.domain.entity.PrepHtsPatient;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepPepInitiationRepository extends JpaRepository<PrepPepInitiation, Long>, JpaSpecificationExecutor<PrepPepInitiation> {
    List<PrepPepInitiation> findAllByPersonOrderByIdDesc(Person person);
    Optional<PrepPepInitiation> findByIdAndArchivedAndFacilityId(Long id, Boolean archived, Long facilityId);
    Optional<PrepPepInitiation> findByProphylaxisScreeningUuid(String prophylaxisScreeningUuid);
    Optional<PrepPepInitiation> findByProphylaxisScreeningUuidAndArchived(String prophylaxisScreeningUuid, Boolean archived);

    /**
     * Arm-scoped variant of the above. A single eligibility screening may
     * legitimately seed both a PrEP and a PEP initiation (the client switches
     * arms), so the duplicate-check on save must be per-enrollment-type.
     * `enrollmentType` is matched case-insensitively to tolerate legacy short
     * labels ("PrEP" / "PEP") and the canonical PREP_PEP_ENROLLMENT_TYPE_*.
     */
    Optional<PrepPepInitiation> findByProphylaxisScreeningUuidAndEnrollmentTypeIgnoreCaseAndArchived(
            String prophylaxisScreeningUuid, String enrollmentType, Boolean archived);
    Optional<PrepPepInitiation> findByUuid(String uuid);

    @Query(value = "SELECT * FROM prophylaxis_initiation pe WHERE pe.person_uuid=?1 AND CAST(pe.archived AS BOOLEAN)=?2 AND " +
            "pe.facility_id=?3 ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepPepInitiation> findByPersonUuidAndArchived(String personUuid, Boolean archived, Long facilityId);

    Optional<PrepPepInitiation> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, Boolean archived);

    @Query(value = "SELECT * FROM prophylaxis_initiation pe WHERE pe.person_uuid=?1 AND CAST(pe.archived AS BOOLEAN)=?2 ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepPepInitiation> findTopByPersonUuidAndArchived(String personUuid, Boolean archived);

    @Query(value = "SELECT * FROM prophylaxis_initiation pe WHERE pe.person_uuid=?1 AND CAST(pe.archived AS BOOLEAN)=?2 AND " +
            "LOWER(pe.enrollment_type)=LOWER(?3) ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepPepInitiation> findLatestByPersonUuidAndEnrollmentType(String personUuid, Boolean archived, String enrollmentType);

    List<PrepPepInitiation> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, Boolean archived);
    Optional<PrepPepInitiation> findByDateEnrolledAndPersonUuid(LocalDate dateEnrolled, String personUuid);
    Optional<PrepPepInitiation> findByDateEnrolledAndPersonUuidAndArchived(LocalDate dateEnrolled, String personUuid, Boolean archived);

    /**
     * Arm-scoped variant — two initiations on the same day are legitimate when
     * they live on different arms (e.g. a client switching from PEP to PrEP).
     */
    Optional<PrepPepInitiation> findByDateEnrolledAndPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
            LocalDate dateEnrolled, String personUuid, String enrollmentType, Boolean archived);
    Integer countAllByPersonUuid(String personUuid);
    Integer countAllByPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(String personUuid, String enrollmentType, Boolean archived);
    List<PrepPepInitiation> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prophylaxis_initiation WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PrepPepInitiation> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);

    List<PrepPepInitiation> findFirstByPersonOrderByIdDesc(Person person);
    List<PrepPepInitiation> findAllByUniqueIdOrderByIdDesc(String code);
    List<PrepPepInitiation> findAllByPerson(Person person);
    List<PrepPepInitiation> findAllByPersonAndArchived(Person person, Boolean archived);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount " +
            "FROM patient_person p " +
            "LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false " +
            "WHERE p.archived = CAST(?1 AS INTEGER) AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR pet.unique_id ILIKE ?3) " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth, pet.person_uuid, pet.date_enrolled ", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepBySearchParam(Boolean archived, Long facilityId, String search, Pageable pageable);


    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount " +
            "FROM patient_person p " +
            "LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false " +
            "WHERE p.archived = CAST(?1 AS INTEGER) AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR pet.unique_id ILIKE ?3) " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth, pet.person_uuid, pet.date_enrolled ", nativeQuery = true)
    List<PrepClient> findAllPersonPrepBySearchParam(Boolean archived, Long facilityId, String search);


    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount " +
            "FROM patient_person p  LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false  " +
            "WHERE p.archived = CAST(?1 AS INTEGER) AND p.facility_id=?2  " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth, pet.person_uuid, pet.date_enrolled", nativeQuery = true)
    Page<PrepClient> findAllPersonPrep(Boolean archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount " +
            "FROM patient_person p  LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false  " +
            "WHERE p.archived = CAST(?1 AS INTEGER) AND p.facility_id=?2  " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth, pet.person_uuid, pet.date_enrolled", nativeQuery = true)
    List<PrepClient> findAllPersonPrep(Boolean archived, Long facilityId);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
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
            "    END AS prepStatus\n " +
            "FROM  patient_person p\n" +
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
            "    WITH latest_hts AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hts\n" +
            "    JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "AND (p.first_name ILIKE ?3\n" +
            "     OR p.full_name ILIKE ?3\n" +
            "     OR p.surname ILIKE ?3\n" +
            "     OR p.other_name ILIKE ?3\n" +
            "     OR p.hospital_number ILIKE ?3\n" +
            "     OR pet.unique_id ILIKE ?3)\n" +
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepAndStatusBySearchParam(Boolean archived, Long facilityId, String search, Pageable pageable);

    @Query(value = "SELECT * FROM (SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
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
            "    END AS prepStatus\n " +
            "FROM  patient_person p\n" +
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
            "    WITH latest_hts AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hts\n" +
            "    JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "AND pet.person_uuid IS NOT NULL\n" +
            "AND (p.first_name ILIKE ?3\n" +
            "     OR p.full_name ILIKE ?3\n" +
            "     OR p.surname ILIKE ?3\n" +
            "     OR p.other_name ILIKE ?3\n" +
            "     OR p.hospital_number ILIKE ?3\n" +
            "     OR pet.unique_id ILIKE ?3)\n" +
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST) res where res.prepStatus = 'Not Enrolled' ", nativeQuery = true)
    Page<PrepClient> findAllNotEnrolledPersonPrepAndStatusBySearchParam(Boolean archived, Long facilityId, String search, Pageable pageable);

    @Query(value = "SELECT * FROM (SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
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
            "    END AS prepStatus\n " +
            "FROM  patient_person p\n" +
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
            "    WITH latest_hts AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hts\n" +
            "    JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "AND pet.person_uuid IS NOT NULL\n" +
            "AND (p.first_name ILIKE ?3\n" +
            "     OR p.full_name ILIKE ?3\n" +
            "     OR p.surname ILIKE ?3\n" +
            "     OR p.other_name ILIKE ?3\n" +
            "     OR p.hospital_number ILIKE ?3\n" +
            "     OR pet.unique_id ILIKE ?3)\n" +
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST) res WHERE prepStatus IN ('Stopped', 'Discontinued', 'Death')\n" +
            "   OR prepi.interruption_type IS NOT NULL", nativeQuery = true)
    Page<PrepClient> findAllInterruptedPersonPrepAndStatusBySearchParam(Boolean archived, Long facilityId, String search, Pageable pageable);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number) p.hospital_number as hospitalNumber,  " +
            "el_max.HIVResultAtVisit, p.date_of_registration AS dateOfRegistration, prepc.commencementCount,  " +
            "el.eligibility_count as eligibilityCount, pet.created_by as createdBy,  " +
            "pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName,  " +
            "p.surname as surname, p.other_name as otherName,      " +
            "pet.date_created, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,      " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth,  " +
            "he.date_confirmed_hiv as dateConfirmedHiv,   CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,   " +
            "(CASE WHEN el_max.HIVResultAtVisit ILIKE '%Positive%'  " +
            "THEN 'HIV Positive' WHEN prepi.interruption_date IS NOT NULL AND (prepc.encounter_date IS NULL OR prepi.interruption_date >= prepc.encounter_date) THEN COALESCE(bac.display, CASE prepi.interruption_type WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' ELSE prepi.interruption_type END)  " +
            "WHEN pet.person_uuid IS NULL  " +
            "THEN 'Not Enrolled' WHEN prepc.person_uuid IS NULL  " +
            "THEN 'Not Commenced' ELSE prepc.status END) prepStatus " +
            "FROM patient_person p   LEFT JOIN (SELECT COUNT(el.person_uuid) as eligibility_count,  " +
            "el.person_uuid FROM prophylaxis_screening el WHERE CAST(el.archived AS BOOLEAN) = false  " +
            "GROUP BY person_uuid) el ON el.person_uuid = p.uuid  " +
            "LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid  " +
            "AND CAST(pet.archived AS BOOLEAN) = false LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid  " +
            "AND he.archived = CAST(?1 AS INTEGER) LEFT JOIN (SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount,  " +
            "MAX(pc.encounter_date) as encounter_date, pc.duration,   " +
            " (CASE WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'  " +
            " ELSE  'Defaulted' END) status FROM prep_followup_visit pc  " +
            " INNER JOIN (SELECT DISTINCT MAX(pc.encounter_date) encounter_date,  " +
            " pc.person_uuid FROM prep_followup_visit pc GROUP BY pc.person_uuid) max_p  " +
            " ON max_p.encounter_date=pc.encounter_date  AND max_p.person_uuid=pc.person_uuid  " +
            " WHERE CAST(pc.archived AS BOOLEAN) = false  GROUP BY pc.person_uuid, pc.duration, status ) prepc  " +
            " ON prepc.person_uuid=p.uuid  LEFT JOIN (SELECT pi.id, pi.person_uuid,  " +
            " pi.interruption_date , pi.interruption_type  " +
            " FROM prophylaxis_interruptions pi  " +
            " INNER JOIN (SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date)interruption_date  " +
            " FROM prophylaxis_interruptions pi WHERE CAST(pi.archived AS BOOLEAN) = false  " +
            " GROUP BY pi.person_uuid)pit ON pit.interruption_date=pi.interruption_date  " +
            " AND pit.person_uuid=pi.person_uuid WHERE CAST(pi.archived AS BOOLEAN) = false  " +
            " GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi  " +
            " ON prepi.person_uuid = p.uuid LEFT JOIN base_application_codeset bac  " +
            " ON bac.code=prepi.interruption_type LEFT JOIN (SELECT pel.max_date, el.person_uuid,  " +
            " el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit   " +
            " FROM prophylaxis_screening el INNER JOIN (SELECT DISTINCT MAX(el.visit_date) as max_date,  " +
            " el.person_uuid FROM prophylaxis_screening el WHERE CAST(el.archived AS BOOLEAN)=false GROUP BY person_uuid)pel  " +
            " ON pel.max_date=el.visit_date AND el.person_uuid=pel.person_uuid) el_max  " +
            " ON el_max.person_uuid = p.uuid  WHERE p.archived = CAST(?1 AS INTEGER) AND p.facility_id=?2  " +
            " AND he.person_uuid IS NULL AND (el_max.HIVResultAtVisit NOT ILIKE '%Positive%'  " +
            " OR el_max.HIVResultAtVisit is NULL)  " +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display,  " +
            " el_max.HIVResultAtVisit, p.date_of_registration, prepc.commencementCount,  " +
            " el.eligibility_count, pet.created_by, pet.unique_id, p.id, p.first_name,  " +
            " p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, pet.date_created,  " +
            " p.other_name, p.hospital_number, p.date_of_birth, prepc.status, he.person_uuid,  " +
            " he.date_confirmed_hiv, pet.id, pet.date_enrolled ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findOnlyPersonPrepAndStatusBySearchParam(Boolean archived, Long facilityId, String search, Pageable pageable);

    // Returns the patient's PrEP status using the SAME CASE branches as the
    // PrEP Patients list query (`findAllPersonPrepAndStatus`) so the dashboard
    // and the list always agree. Without this, a patient whose latest
    // interruption was a "Default" would show "Default" on the PrEP Patients
    // grid but "Active" on the dashboard (the old simpler CASE fell through
    // to prepc.status whenever bac.display was NULL — e.g. for codes seeded
    // only in the frontend fallback). The COALESCE in the bac.display
    // expression guarantees a sensible label even if the codeset row is
    // missing in base_application_codeset.
    @Query(value = "SELECT DISTINCT ON (el_max.HIVResultAtVisit) \n" +
            "    pet.date_created, \n" +
            "    p.date_of_registration AS dateOfRegistration, \n" +
            "    prepc.commencementCount, \n" +
            "    el.eligibility_count as eligibilityCount, \n" +
            "    pet.created_by as createdBy, \n" +
            "    pet.unique_id as uniqueId, \n" +
            "    p.id as personId, \n" +
            "    p.first_name as firstName, \n" +
            "    p.surname as surname, \n" +
            "    p.other_name as otherName,    \n" +
            "    p.hospital_number as hospitalNumber, \n" +
            "    CAST (EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) AS INTEGER) as age,    \n" +
            "    INITCAP(p.sex) as gender, \n" +
            "    p.date_of_birth as dateOfBirth, \n" +
            "    he.date_confirmed_hiv as dateConfirmedHiv,  \n" +
            "    CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  \n" +
            "    (CASE \n" +
            "        WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' \n" +
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart' \n" +
            "        WHEN prepi.interruption_date IS NOT NULL AND (prepc.encounter_date IS NULL OR prepi.interruption_date >= prepc.encounter_date) THEN COALESCE(bac.display,\n" +
            "             CASE prepi.interruption_type \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' \n" +
            "               ELSE prepi.interruption_type \n" +
            "             END) \n" +
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' \n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' \n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped' \n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted' \n" +
            // Worst-case on null: a followup exists but the date/duration needed to
            // compute a real status is missing — don't fall through to 'Active'.
            "        WHEN prepc.encounter_date IS NULL OR prepc.duration IS NULL THEN 'Defaulted' \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued' \n" +
            "                WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued' \n" +
            "                WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        ELSE prepc.status \n" +
            "     END) prepStatus\n " +
            "FROM  patient_person p  \n" +
            "LEFT JOIN (\n" +
            "    SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid \n" +
            "    FROM prophylaxis_screening el \n" +
            "    WHERE CAST(el.archived AS BOOLEAN) = false \n" +
            "    GROUP BY person_uuid\n" +
            ") el ON el.person_uuid = p.uuid\n" +
            "LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false\n" +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = CAST(?1 AS INTEGER)\n" +
            "LEFT JOIN (\n" +
            "    SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, \n" +
            "           pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status,  \n" +
            "           (CASE WHEN (pc.encounter_date + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'\n" +
            "                ELSE  'Defaulted' END) status \n" +
            "    FROM prep_followup_visit pc\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(pc.encounter_date) encounter_date, pc.person_uuid\n" +
            "        FROM prep_followup_visit pc \n" +
            "        GROUP BY pc.person_uuid\n" +
            "    ) max_p ON max_p.encounter_date = pc.encounter_date \n" +
            "            AND max_p.person_uuid=pc.person_uuid \n" +
            "    WHERE CAST(pc.archived AS BOOLEAN) = false \n" +
            "    GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status, status \n" +
            ") prepc ON prepc.person_uuid=p.uuid  \n" +
            // Picks the latest interruption per person using DISTINCT ON +
            // COALESCE over the type-specific date columns. The previous
            // INNER JOIN approach silently dropped rows when MAX returned
            // NULL or the date didn't round-trip cleanly through GROUP BY.
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (pi.person_uuid) pi.id, pi.person_uuid, \n" +
            "           COALESCE(pi.interruption_date, pi.date_defaulted, pi.date_client_died, pi.date_client_referred_out, pi.date_sero_converted) AS interruption_date, \n" +
            "           pi.interruption_type \n" +
            "    FROM prophylaxis_interruptions pi \n" +
            "    WHERE CAST(pi.archived AS BOOLEAN) = false \n" +
            "    ORDER BY pi.person_uuid, \n" +
            "             COALESCE(pi.interruption_date, pi.date_defaulted, pi.date_client_died, pi.date_client_referred_out, pi.date_sero_converted) DESC NULLS LAST, \n" +
            "             pi.id DESC \n" +
            ") prepi ON prepi.person_uuid = p.uuid \n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type \n" +
            "LEFT JOIN (\n" +
            "    SELECT pel.max_date, el.person_uuid, el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit  \n" +
            "    FROM prophylaxis_screening el \n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(el.visit_date) as max_date, el.person_uuid \n" +
            "        FROM prophylaxis_screening el \n" +
            "        WHERE CAST(el.archived AS BOOLEAN)=false \n" +
            "        GROUP BY el.person_uuid\n" +
            "    ) pel ON pel.max_date = el.visit_date \n" +
            "         AND el.person_uuid = pel.person_uuid\n" +
            ") el_max ON el_max.person_uuid = p.uuid \n" +
            "WHERE p.archived = CAST(?1 AS INTEGER) AND p.facility_id=?2 AND p.uuid=?3\n" +
            "GROUP BY prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, bac.display, he.person_uuid, he.date_confirmed_hiv, \n" +
            "         el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration, prepc.commencementCount, el.eligibility_count, pet.created_by, pet.unique_id, \n" +
            "         p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, \n" +
            "         p.other_name, p.hospital_number, p.date_of_birth, prepc.status, pet.id, pet.date_enrolled \n" +
            "ORDER BY el_max.HIVResultAtVisit, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Optional<PrepClient> findPersonPrepAndStatusByPatientUuid(Boolean archived, Long facilityId, String personUuid);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
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
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled'\n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted'\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION'" +
            "           AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN" +
            "           CASE" +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued'" +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection'" +
            "               ELSE 'Active' " +
            "           END " +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' " +
            "           AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN " +
            "           CASE " +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued' " +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection' " +
            "               ELSE 'Active' " +
            "           END " +
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
            "    END AS prepStatus,\n" +
            "    CASE\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 36 THEN 1\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 38 THEN 2\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 66 THEN 1\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 68 THEN 2\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ELSE 0\n" +
            "    END AS sendCabLaAlert\n " +
            "FROM  patient_person p\n" +
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
            "    WITH latest_hts AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hts\n" +
            "    JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepAndStatus(Boolean archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT *\n " +
            "FROM (\n" +
            "    SELECT DISTINCT ON (p.hospital_number)\n" +
            "        p.hospital_number AS hospitalNumber,\n" +
            "        el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "        p.date_of_registration AS dateOfRegistration,\n" +
            "        prepc.commencementCount,\n" +
            "        el.eligibility_count AS eligibilityCount,\n" +
            "        pet.created_by AS createdBy,\n" +
            "        pet.unique_id AS uniqueId,\n" +
            "        p.id AS personId,\n" +
            "        p.uuid AS personUuid,\n" +
            "        p.first_name AS firstName,\n" +
            "        p.surname AS surname,\n" +
            "        p.other_name AS otherName,\n" +
            "        pet.date_created,\n" +
            "        CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "        INITCAP(p.sex) AS gender,\n" +
            "        p.date_of_birth AS dateOfBirth,\n" +
            "        he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "        CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "        prepi.interruption_type,  -- ✅ Exposed here\n" +
            "        CASE\n" +
            "            WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
            "            WHEN prepc.previous_prep_status IN ('Stopped', 'Discontinued') THEN 'Restart'\n" +
            "            WHEN prepi.interruption_date IS NOT NULL AND (prepc.encounter_date IS NULL OR prepi.interruption_date >= prepc.encounter_date) THEN COALESCE(bac.display, CASE prepi.interruption_type WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' ELSE prepi.interruption_type END)\n" +
            "            WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            "            WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "            WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted'\n" +
            "            WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29 days' THEN 'Discontinued'\n" +
            "                    WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7 days' THEN 'Delayed Injection'\n" +
            "                    ELSE 'Active'\n" +
            "                END\n" +
            "            WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29 days' THEN 'Discontinued'\n" +
            "                    WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7 days' THEN 'Delayed Injection'\n" +
            "                    ELSE 'Active'\n" +
            "                END\n" +
            "            WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE > (prepc.encounter_date + prepc.duration) THEN 'Discontinued'\n" +
            "                    ELSE 'Active'\n" +
            "                END\n" +
            "            WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE > (prepc.encounter_date + prepc.duration) THEN 'Discontinued'\n" +
            "                    ELSE 'Active'\n" +
            "                END\n" +
            "            WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE > (prepc.encounter_date + prepc.duration) THEN 'Stopped'\n" +
            "                    ELSE 'Active'\n" +
            "                END\n" +
            "            ELSE prepc.status\n" +
            "        END AS prepStatus,\n" +
            "        CASE\n" +
            "            WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE - prepc.encounter_date = 36 THEN 1\n" +
            "                    WHEN CURRENT_DATE - prepc.encounter_date = 38 THEN 2\n" +
            "                    ELSE 0\n" +
            "                END\n" +
            "            WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                CASE\n" +
            "                    WHEN CURRENT_DATE - prepc.encounter_date = 66 THEN 1\n" +
            "                    WHEN CURRENT_DATE - prepc.encounter_date = 68 THEN 2\n" +
            "                    ELSE 0\n" +
            "                END\n" +
            "            ELSE 0\n" +
            "        END AS sendCabLaAlert\n" +
            "    FROM  prophylaxis_initiation pet\n" +
            "    JOIN patient_person p ON pet.person_uuid = p.uuid\n" +
            "    LEFT JOIN (\n" +
            "        SELECT COUNT(el.person_uuid) AS eligibility_count, el.person_uuid\n" +
            "        FROM prophylaxis_screening el\n" +
            "        WHERE CAST(el.archived AS BOOLEAN) = false\n" +
            "        GROUP BY el.person_uuid\n" +
            "    ) el ON el.person_uuid = pet.person_uuid\n" +
            "    LEFT JOIN hiv_enrollment he ON he.person_uuid = pet.person_uuid AND he.archived = CAST(?1 AS INTEGER)\n" +
            "    LEFT JOIN (\n" +
            "        SELECT pc.person_uuid, COUNT(pc.person_uuid) AS commencementCount,\n" +
            "               MAX(pc.encounter_date) AS encounter_date, pc.duration,\n" +
            "               pc.visit_type, pc.prep_type, pc.previous_prep_status,\n" +
            "               CASE WHEN (pc.encounter_date + pc.duration) > CURRENT_DATE THEN 'Active' ELSE 'Defaulted' END AS status\n" +
            "        FROM prep_followup_visit pc\n" +
            "        INNER JOIN (\n" +
            "            SELECT MAX(encounter_date) AS encounter_date, person_uuid\n" +
            "            FROM prep_followup_visit\n" +
            "            WHERE CAST(archived AS BOOLEAN) = false\n" +
            "            GROUP BY person_uuid\n" +
            "        ) max_pc ON max_pc.encounter_date = pc.encounter_date AND max_pc.person_uuid = pc.person_uuid\n" +
            "        WHERE CAST(pc.archived AS BOOLEAN) = false\n" +
            "        GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status, status\n" +
            "    ) prepc ON prepc.person_uuid = pet.person_uuid\n" +
            "    LEFT JOIN (\n" +
            "        SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "        FROM prophylaxis_interruptions pi\n" +
            "        INNER JOIN (\n" +
            "            SELECT MAX(interruption_date) AS interruption_date, person_uuid\n" +
            "            FROM prophylaxis_interruptions\n" +
            "            WHERE CAST(archived AS BOOLEAN) = false\n" +
            "            GROUP BY person_uuid\n" +
            "        ) max_pi ON max_pi.interruption_date = pi.interruption_date AND max_pi.person_uuid = pi.person_uuid\n" +
            "        WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "    ) prepi ON prepi.person_uuid = pet.person_uuid\n" +
            "    LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type\n" +
            "    LEFT JOIN (\n" +
            "        SELECT hts.person_uuid, hts.hiv_test_result AS hivTestResult\n" +
            "        FROM hts_client hts\n" +
            "        INNER JOIN (\n" +
            "            SELECT MAX(date_visit) AS max_date, person_uuid\n" +
            "            FROM hts_client\n" +
            "            GROUP BY person_uuid\n" +
            "        ) latest_hts ON latest_hts.person_uuid = hts.person_uuid AND latest_hts.max_date = hts.date_visit\n" +
            "    ) el_max ON el_max.person_uuid = pet.person_uuid\n" +
            "    WHERE CAST(pet.archived AS BOOLEAN) = false\n" +
            "      AND p.facility_id = ?2\n" +
            "    GROUP BY\n" +
            "        p.hospital_number, el_max.hivTestResult, p.date_of_registration,\n" +
            "        prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "        pet.unique_id, p.id, p.uuid, p.first_name, p.surname, p.other_name,\n" +
            "        pet.date_created, p.date_of_birth, p.sex, he.date_confirmed_hiv,\n" +
            "        prepc.previous_prep_status, prepi.interruption_date, prepc.encounter_date,\n" +
            "        bac.display, prepi.interruption_type, he.person_uuid,\n" +
            "        prepc.person_uuid, prepc.visit_type, prepc.prep_type, prepc.duration,\n" +
            "        prepc.status, pet.date_enrolled\n" +
            "    ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST\n" +
            ") res\n" +
            "WHERE res.prepStatus IN ('Stopped', 'Discontinued', 'Death')\n" +
            "   OR res.interruption_type IS NOT NULL\n", nativeQuery = true)
    Page<PrepClient> findAllInterruptedPersonPrepAndStatus(Boolean archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT * FROM (SELECT DISTINCT ON (p.hospital_number)\n" +
            "                p.hospital_number AS hospitalNumber,\n" +
            "                el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "                p.date_of_registration AS dateOfRegistration,\n" +
            "                prepc.commencementCount,\n" +
            "                el.eligibility_count AS eligibilityCount,\n" +
            "                pet.created_by AS createdBy,\n" +
            "                pet.unique_id AS uniqueId,\n" +
            "                p.id AS personId,\n" +
            "                p.uuid AS personUuid,\n" +
            "                p.first_name AS firstName,\n" +
            "                p.surname AS surname,\n" +
            "                p.other_name AS otherName,\n" +
            "                pet.date_created,\n" +
            "                CAST(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) AS INTEGER) AS age,\n" +
            "                INITCAP(p.sex) AS gender,\n" +
            "                p.date_of_birth AS dateOfBirth,\n" +
            "                he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "                CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "                CASE\n" +
            "                    WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
            "                    WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'\n" +
            "                    WHEN prepi.interruption_date IS NOT NULL AND (prepc.encounter_date IS NULL OR prepi.interruption_date >= prepc.encounter_date) THEN COALESCE(bac.display, CASE prepi.interruption_type WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' ELSE prepi.interruption_type END)\n" +
            "                    WHEN pet.person_uuid IS NULL THEN 'Not Enrolled'\n" +
            "                    WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            "                    WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "                    WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted'\n" +
            "                    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION'\n" +
            "                       AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                       CASE\n" +
            "                           WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued'\n" +
            "                           WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection'\n" +
            "                           ELSE 'Active'\n" +
            "                       END\n" +
            "                    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION'\n" +
            "                       AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES'THEN\n" +
            "                       CASE\n" +
            "                           WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued'\n" +
            "                           WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection'\n" +
            "                           ELSE 'Active'\n" +
            "                       END\n" +
            "                    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "                        CASE\n" +
            "                            WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued'\n" +
            "                            ELSE 'Active'\n" +
            "                        END\n" +
            "                    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "                        CASE\n" +
            "                            WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued'\n" +
            "                            ELSE 'Active'\n" +
            "                        END\n" +
            "                    WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "                        CASE\n" +
            "                            WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped'\n" +
            "                            ELSE 'Active'\n" +
            "                        END\n" +
            "                    ELSE prepc.status\n" +
            "                END AS prepStatus,\n" +
            "                CASE\n" +
            "                    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                        CASE\n" +
            "                            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 36 THEN 1\n" +
            "                            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 38 THEN 2\n" +
            "                            ELSE 0\n" +
            "                        END\n" +
            "                    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "                        CASE\n" +
            "                            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 66 THEN 1\n" +
            "                            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 68 THEN 2\n" +
            "                            ELSE 0\n" +
            "                        END\n" +
            "                    ELSE 0\n" +
            "                END AS sendCabLaAlert\n" +
            "            FROM  patient_person p\n" +
            "            LEFT JOIN (\n" +
            "                SELECT COUNT(el.person_uuid) AS eligibility_count, el.person_uuid\n" +
            "                FROM prophylaxis_screening el\n" +
            "                WHERE CAST(el.archived AS BOOLEAN) = false\n" +
            "                GROUP BY el.person_uuid\n" +
            "            ) el ON el.person_uuid = p.uuid\n" +
            "            LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false\n" +
            "            LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = CAST(?1 AS INTEGER)\n" +
            "            LEFT JOIN (\n" +
            "                SELECT pc.person_uuid, COUNT(pc.person_uuid) AS commencementCount,\n" +
            "                       MAX(pc.encounter_date) AS encounter_date, pc.duration,\n" +
            "                       pc.visit_type AS visit_type, pc.prep_type AS prep_type, pc.previous_prep_status AS previous_prep_status,\n" +
            "                       CASE WHEN (pc.encounter_date + pc.duration) > CAST(NOW() AS DATE) THEN 'Active' ELSE 'Defaulted' END AS status\n" +
            "                FROM prep_followup_visit pc\n" +
            "                INNER JOIN (\n" +
            "                    SELECT DISTINCT MAX(pc.encounter_date) AS encounter_date, pc.person_uuid\n" +
            "                    FROM prep_followup_visit pc\n" +
            "                    WHERE CAST(pc.archived AS BOOLEAN) = false\n" +
            "                    GROUP BY pc.person_uuid\n" +
            "                ) max_p ON max_p.encounter_date = pc.encounter_date AND max_p.person_uuid = pc.person_uuid\n" +
            "                WHERE CAST(pc.archived AS BOOLEAN) = false\n" +
            "                GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status, status\n" +
            "            ) prepc ON prepc.person_uuid = p.uuid\n" +
            "            LEFT JOIN (\n" +
            "                SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "                FROM prophylaxis_interruptions pi\n" +
            "                INNER JOIN (\n" +
            "                    SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) AS interruption_date\n" +
            "                    FROM prophylaxis_interruptions pi\n" +
            "                    WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "                    GROUP BY pi.person_uuid\n" +
            "                ) pit ON pit.interruption_date = pi.interruption_date AND pit.person_uuid = pi.person_uuid\n" +
            "                WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "                GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "            ) prepi ON prepi.person_uuid = p.uuid\n" +
            "            LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type\n" +
            "            LEFT JOIN (\n" +
            "                WITH latest_hts AS (\n" +
            "                    SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "                    FROM hts_client\n" +
            "                    GROUP BY person_uuid\n" +
            "                )\n" +
            "                SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "                FROM hts_client hts\n" +
            "                JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            "            ) el_max ON el_max.person_uuid = p.uuid\n" +
            "            WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "            AND p.facility_id = ?2\n" +
            "            AND he.person_uuid IS NULL\n" +
            "            AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "            GROUP BY\n" +
            "                prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "                el_max.hivTestResult, p.date_of_registration,\n" +
            "                prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "                pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "                pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "                p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "                prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "                pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "            ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST) res where res.prepStatus = 'Not Enrolled' ", nativeQuery = true)
    Page<PrepClient> findAllNotEnrolledPersonPrepAndStatus(Boolean archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT el_max.HIVResultAtVisit, p.date_of_registration AS dateOfRegistration, prepc.commencementCount, el.eligibility_count as eligibilityCount, " +
            "pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
            " pet.date_created, p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
            "(CASE " +
            "WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' " +
            "WHEN prepi.interruption_date IS NOT NULL AND (prepc.encounter_date IS NULL OR prepi.interruption_date >= prepc.encounter_date) THEN COALESCE(bac.display, CASE prepi.interruption_type WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' ELSE prepi.interruption_type END) " +
            "WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' " +
            "WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' " +
            "ELSE prepc.status END) prepStatus" +
            "CASE\n" +
            "    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "        CASE\n" +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 36 THEN 1" +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 38 THEN 2" +
            "            ELSE 0\n" +
            "        END\n" +
            "    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "        CASE\n" +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 66 THEN 1" +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 68 THEN 2" +
            "            ELSE 0\n" +
            "        END\n" +
            "    ELSE 0\n" +
            "            END AS sendCabLaAlert" +
            " FROM patient_person p  " +
            " INNER JOIN (SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid FROM prophylaxis_screening el " +
            "WHERE CAST(el.archived AS BOOLEAN) = false GROUP BY person_uuid) el ON el.person_uuid = p.uuid" +
            " LEFT JOIN prophylaxis_initiation pet ON pet.person_uuid = p.uuid AND CAST(pet.archived AS BOOLEAN) = false" +
            " LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = CAST(?1 AS INTEGER)" +
            " LEFT JOIN (SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, pc.duration,   " +
            " (CASE WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'" +
            " ELSE  'Defaulted' END) status FROM prep_followup_visit pc" +
            " INNER JOIN (SELECT DISTINCT MAX(pc.encounter_date) encounter_date, pc.person_uuid" +
            " FROM prep_followup_visit pc GROUP BY pc.person_uuid) max_p ON max_p.encounter_date=pc.encounter_date " +
            " AND max_p.person_uuid=pc.person_uuid WHERE CAST(pc.archived AS BOOLEAN) = false " +
            " GROUP BY pc.person_uuid, pc.duration, status ) prepc ON prepc.person_uuid=p.uuid  " +
            "LEFT JOIN (" +
            "SELECT pi.id, pi.person_uuid, pi.interruption_date , pi.interruption_type " +
            "FROM prophylaxis_interruptions pi " +
            "INNER JOIN (SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date)interruption_date " +
            "FROM prophylaxis_interruptions pi WHERE CAST(pi.archived AS BOOLEAN) = false " +
            "GROUP BY pi.person_uuid)pit ON pit.interruption_date=pi.interruption_date " +
            "AND pit.person_uuid=pi.person_uuid " +
            "WHERE CAST(pi.archived AS BOOLEAN) = false " +
            "GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi ON prepi.person_uuid = p.uuid " +
            "LEFT JOIN base_application_codeset bac ON bac.code=prepi.interruption_type " +
            "LEFT JOIN (SELECT pel.max_date, el.person_uuid, el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit  " +
            "FROM prophylaxis_screening el " +
            "INNER JOIN (SELECT DISTINCT MAX(el.visit_date) as max_date, el.person_uuid " +
            "FROM prophylaxis_screening el WHERE CAST(el.archived AS BOOLEAN)=false " +
            "GROUP BY person_uuid)pel ON pel.max_date=el.visit_date AND el.person_uuid=pel.person_uuid) el_max ON el_max.person_uuid = p.uuid " +
            " WHERE p.archived = CAST(?1 AS INTEGER) AND p.facilityId=?2 " +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display, " +
            "el_max.HIVResultAtVisit, p.date_of_registration, prepc.commencementCount, el.eligibility_count, pet.created_by, " +
            "pet.unique_id, p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
            "pet.date_created, p.other_name, p.hospital_number, p.date_of_birth, " +
            "prepc.status, he.person_uuid, he.date_confirmed_hiv, pet.id, pet.date_enrolled ORDER BY pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findOnlyPersonPrepAndStatus(Boolean archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
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
            "    END AS prepStatus\n " +
            "FROM  patient_person p\n" +
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
            "    WITH latest_hts AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hts\n" +
            "    JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "AND pet.enrollment_type = '" + EnrollmentType.PEP + "'\n" +
            "AND (p.first_name ILIKE ?3\n" +
            "     OR p.full_name ILIKE ?3\n" +
            "     OR p.surname ILIKE ?3\n" +
            "     OR p.other_name ILIKE ?3\n" +
            "     OR p.hospital_number ILIKE ?3\n" +
            "     OR pet.unique_id ILIKE ?3)\n" +
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findAllPepEnrolledPersonPrepAndStatusBySearchParam(Boolean archived, Long facilityId, String search, Pageable pageable);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.hivTestResult AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid,\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    CASE\n" +
            "        WHEN el_max.hivTestResult ILIKE '%Positive%' THEN 'HIV Positive'\n" +
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
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled'\n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted'\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION'" +
            "           AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN" +
            "           CASE" +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued'" +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection'" +
            "               ELSE 'Active' " +
            "           END " +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' " +
            "           AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN " +
            "           CASE " +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '29' DAY THEN 'Discontinued' " +
            "               WHEN CURRENT_DATE > prepc.encounter_date + prepc.duration + INTERVAL '7' DAY THEN 'Delayed Injection' " +
            "               ELSE 'Active' " +
            "           END " +
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
            "    END AS prepStatus,\n" +
            "    CASE\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 36 THEN 1\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 38 THEN 2\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 66 THEN 1\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) = 68 THEN 2\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ELSE 0\n" +
            "    END AS sendCabLaAlert\n " +
            "FROM  patient_person p\n" +
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
            "    WITH latest_hts AS (\n" +
            "        SELECT person_uuid, MAX(date_visit) AS max_date_visit\n" +
            "        FROM hts_client\n" +
            "        GROUP BY person_uuid\n" +
            "    )\n" +
            "    SELECT hts.person_uuid, hts.date_visit AS visitDate, hts.hiv_test_result AS hivTestResult\n" +
            "    FROM hts_client hts\n" +
            "    JOIN latest_hts ON hts.person_uuid = latest_hts.person_uuid AND hts.date_visit = latest_hts.max_date_visit\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = CAST(?1 AS INTEGER)\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (COALESCE(el_max.hivTestResult, '') NOT ILIKE '%Positive%')\n" +
            "AND pet.enrollment_type = '" + EnrollmentType.PEP + "'\n" +
            "GROUP BY\n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.hivTestResult, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration, pet.date_enrolled\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findAllPepEnrolledPersonPrepAndStatus(Boolean archived, Long facilityId, Pageable pageable);

    // ─── Arm-aware enrollment-tab queries projecting PrepHtsPatient ────────────
    //
    // Driven directly by `prophylaxis_initiation` so the result naturally
    // excludes "Not Enrolled" patients. Projection is `PrepHtsPatient` (the
    // same shape the Patient tab ships) so the enrollment grids have every
    // field a row can reach for: HTS encounter fields, pregnancyStatusDisplay,
    // eligibilityCount / enrollmentCount, plus the new `isInterrupted` flag
    // resolved off `prophylaxis_initiation.is_interrupted`.
    //
    // Status precedence (top wins):
    //   1. is_interrupted = true        -> codeset display of the latest
    //                                       interruption_type on the SAME arm.
    //   2. previous_prep_status flips   -> 'Restart'
    //   3. prepc.person_uuid IS NULL    -> 'Not Commenced'
    //   4. PrEP CASE (Injectibles bands / Oral duration) — used by findPrepEnrolled
    //      PEP CASE  (28-day window after latest PEP visit) — used by findPepEnrolled
    // ('Enrolled into HIV' branch removed — the grid no longer special-cases
    //  hiv_enrollment; HIV status is sourced from hts_encounter.)
    //
    // Arm filtering uses prophylaxis_interruptions.prophylaxis_initiation_uuid
    // joined to prophylaxis_initiation.enrollment_type so a patient's PrEP
    // interruption never spills into PEP and vice versa.

    String COMMON_SELECT_HEAD =
            "SELECT DISTINCT ON (p.id)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    NULL AS HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    COALESCE(prepc.commencementCount, 0) AS commencementCount,\n" +
            "    COALESCE(el.eligibility_count, 0) AS eligibilityCount,\n" +
            "    COALESCE(init_count.enrollment_count, 0) AS enrollmentCount,\n" +
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
            "    CAST(NULL AS DATE) AS dateConfirmedHiv,\n" +
            "    CAST(1 AS INTEGER) AS prepCount,\n" +
            "    pet.is_interrupted AS isInterrupted,\n" +
            // HTS encounter projection — same column aliases the Patient tab ships
            "    latest_hts.client_code AS htsClientCode,\n" +
            "    latest_hts.id AS latestHtsId,\n" +
            "    CAST(latest_hts.uuid AS text) AS latestHtsUuid,\n" +
            "    latest_hts.patient_id AS latestHtsPatientId,\n" +
            "    CAST(latest_hts.patient_uuid AS text) AS latestHtsPatientUuid,\n" +
            "    latest_hts.date_of_visit AS latestHtsDateOfVisit,\n" +
            "    latest_hts.setting AS latestHtsSetting,\n" +
            "    CAST(latest_hts.observation AS text) AS latestHtsObservation,\n" +
            "    latest_hts.facility_id AS latestHtsFacilityId,\n" +
            "    preg_codeset.display AS pregnancyStatusDisplay,\n";

    String PREP_STATUS_CASE =
            "    CASE\n" +
            // ── Top-precedence: an explicit interruption flagged on the
            //    enrollment row (Stopped / Dead / Seroconverted / Transfer out /
            //    Default / Referred). Displays the codeset label.
            "        WHEN pet.is_interrupted = true THEN COALESCE(bac.display, \n" +
            "             CASE prepi.interruption_type \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_DEFAULT' THEN 'Default' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_STOPPED' THEN 'Stopped' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_DEAD' THEN 'Dead' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_REFERRED' THEN 'Referred' \n" +
            "               WHEN 'PREP_DISCONTINUATION_TYPE_SEROCONVERTED' THEN 'Seroconverted' \n" +
            "               ELSE prepi.interruption_type \n" +
            "             END)\n" +
            // ── Restart flag from the latest followup
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'\n" +
            // ── No followup visit yet
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            // ── Worst-case on null: a followup row exists but the visit date it
            //    needs to compute a real status is missing. Never let a null
            //    comparison fall through to a falsely-optimistic 'Active'.
            "        WHEN prepc.encounter_date IS NULL THEN 'Defaulted'\n" +

            // ── INJECTIBLES: Early bands ─────────────────────────────────────
            //   Visits: Initiation, Restart, Transfer In
            //   Schedule anchor: 28-day second dose
            //   0-23 = Active, 24-37 = Active (Due), 38-59 = Delayed Injection,
            //   >60 = Discontinued
            "        WHEN prepc.prep_type = 'PREP_TYPE_INJECTIBLES'\n" +
            "             AND prepc.visit_type IN ('PREP_VISIT_TYPE_INITIATION',\n" +
            "                                       'PREP_VISIT_TYPE_RESTART',\n" +
            "                                       'PREP_VISIT_TYPE_TRANSFER_IN') THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 59 THEN 'Discontinued'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 37 THEN 'Delayed Injection'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 23 THEN 'Active (Due)'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +

            // ── INJECTIBLES: Late bands ─────────────────────────────────────
            //   Visits: Second Initiation, Method Switch, Refill / Re-injection
            //   Schedule anchor: 8-week third dose
            //   0-53 = Active, 54-67 = Active (Due), 68-89 = Delayed Injection,
            //   >90 = Discontinued
            "        WHEN prepc.prep_type = 'PREP_TYPE_INJECTIBLES'\n" +
            "             AND prepc.visit_type IN ('PREP_VISIT_TYPE_SECOND_INITIATION',\n" +
            "                                       'PREP_VISIT_TYPE_METHOD_SWITCH',\n" +
            "                                       'PREP_VISIT_TYPE_REFILL_RE-INJECTION') THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 89 THEN 'Discontinued'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 67 THEN 'Delayed Injection'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 53 THEN 'Active (Due)'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +

            // ── INJECTIBLES: No PrEP Provided / Discontinuation Followup ────
            //   60-day cutoff
            "        WHEN prepc.prep_type = 'PREP_TYPE_INJECTIBLES'\n" +
            "             AND prepc.visit_type = 'PREP_VISIT_TYPE_NO_PREP_PROVIDED' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 60 THEN 'Defaulted'\n" +
            "                ELSE 'Pending'\n" +
            "            END\n" +
            "        WHEN prepc.prep_type = 'PREP_TYPE_INJECTIBLES'\n" +
            "             AND prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 60 THEN 'Defaulted'\n" +
            "                ELSE 'Restart Pending'\n" +
            "            END\n" +

            // ── ORAL: No PrEP Provided / Discontinuation Followup ───────────
            //   30-day cutoff
            "        WHEN prepc.prep_type = 'PREP_TYPE_ORAL'\n" +
            "             AND prepc.visit_type = 'PREP_VISIT_TYPE_NO_PREP_PROVIDED' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 30 THEN 'Defaulted'\n" +
            "                ELSE 'Pending'\n" +
            "            END\n" +
            "        WHEN prepc.prep_type = 'PREP_TYPE_ORAL'\n" +
            "             AND prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION_FOLLOW-UP' THEN\n" +
            "            CASE\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 30 THEN 'Defaulted'\n" +
            "                ELSE 'Restart Pending'\n" +
            "            END\n" +

            // ── ORAL: regular duration-based status ──────────────────────────
            //   Within duration -> Active; past duration -> Discontinued for
            //   closing visit types (Method Switch, Discontinuation), Stopped
            //   for everything else.
            "        WHEN prepc.prep_type = 'PREP_TYPE_ORAL' THEN\n" +
            "            CASE\n" +
            // Missing duration → unknown supply window → cannot prove the client
            // is still covered, so assume worst case instead of 'Active'.
            "                WHEN prepc.duration IS NULL THEN 'Defaulted'\n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER))\n" +
            "                     AND prepc.visit_type IN ('PREP_VISIT_TYPE_METHOD_SWITCH', 'PREP_VISIT_TYPE_DISCONTINUATION') THEN 'Discontinued'\n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +

            "        ELSE prepc.status\n" +
            "    END AS prepStatus\n";

    // PEP status precedence (per spec):
    //   1. Completed — ONLY when a PEP completion form exists (latest PEP
    //      interruption has pep_completion = 'YES_NO_YES') AND that completion is
    //      the latest event (on/after the latest PEP follow-up visit). Same
    //      pattern the PrEP status uses for discontinuation. Time alone (28 days)
    //      never completes a client — it only makes them *due* for completion,
    //      which the UI surfaces as a warning.
    //   2. No PEP follow-up visit at all  → 'Enrolled'.
    //   3. Otherwise → 'Active'.
    String PEP_STATUS_CASE =
            "    CASE\n" +
            "        WHEN latest_pep_interruption.pep_completion = 'YES_NO_YES'\n" +
            "             AND (latest_pep_visit.visit_date IS NULL\n" +
            "                  OR latest_pep_interruption.completion_date IS NULL\n" +
            "                  OR latest_pep_interruption.completion_date >= latest_pep_visit.visit_date) THEN 'Completed'\n" +
            "        WHEN latest_pep_visit.pep_start_date IS NULL THEN 'Enrolled'\n" +
            "        ELSE 'Active'\n" +
            "    END AS prepStatus\n";

    // FROM + JOIN block common to both arms. The arm-specific filter is passed
    // as ?3 and applied to (a) the WHERE on pet, (b) the prepi subselect that
    // resolves the latest interruption for that arm, and (c) the prepc
    // subselect that resolves the latest followup visit for that arm.
    String ENROLLED_JOINS =
            "FROM prophylaxis_initiation pet\n" +
            "INNER JOIN patient_person p ON p.uuid = pet.person_uuid\n" +
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
            // (hiv_enrollment join removed — 'Enrolled into HIV' status branch
            //  has been dropped from both PREP_STATUS_CASE and PEP_STATUS_CASE.)
            // Latest followup visit on the SAME arm as ?3.
            // Latest follow-up per person in ONE scan: DISTINCT ON picks the most
            // recent row; a window COUNT keeps commencementCount. Replaces the old
            // MAX-self-join (which scanned prep_followup_visit twice).
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (pc.person_uuid)\n" +
            "           pc.person_uuid,\n" +
            "           COUNT(*) OVER (PARTITION BY pc.person_uuid) AS commencementCount,\n" +
            "           pc.encounter_date AS encounter_date, pc.duration,\n" +
            "           pc.visit_type, pc.prep_type, pc.previous_prep_status,\n" +
            "           CASE WHEN (pc.encounter_date + pc.duration) > CURRENT_DATE THEN 'Active' ELSE 'Defaulted' END AS status\n" +
            "    FROM prep_followup_visit pc\n" +
            "    JOIN prophylaxis_initiation pip_c ON pip_c.uuid = pc.prophylaxis_initiation_uuid\n" +
            "    WHERE CAST(pc.archived AS BOOLEAN) = false\n" +
            "      AND pip_c.enrollment_type = ?3\n" +
            "    ORDER BY pc.person_uuid, pc.encounter_date DESC NULLS LAST, pc.id DESC\n" +
            ") prepc ON prepc.person_uuid = pet.person_uuid\n" +
            // Latest interruption on the SAME arm as ?3.
            // Latest interruption per person in ONE scan (was a MAX-self-join).
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (pi.person_uuid)\n" +
            "           pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "    FROM prophylaxis_interruptions pi\n" +
            "    JOIN prophylaxis_initiation pip_i ON pip_i.uuid = pi.prophylaxis_initiation_uuid\n" +
            "    WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "      AND pip_i.enrollment_type = ?3\n" +
            "    ORDER BY pi.person_uuid, pi.interruption_date DESC NULLS LAST, pi.id DESC\n" +
            ") prepi ON prepi.person_uuid = pet.person_uuid\n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type\n" +
            // Latest hts_encounter for this patient (for the new HTS fields)
            // Latest HTS per patient in ONE scan (was a MAX-self-join).
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (he2.patient_id) he2.*\n" +
            "    FROM hts_encounter he2\n" +
            "    WHERE he2.archived = false\n" +
            "    ORDER BY he2.patient_id, he2.date_of_visit DESC NULLS LAST, he2.id DESC\n" +
            ") latest_hts ON latest_hts.patient_id = p.id\n" +
            "LEFT JOIN base_application_codeset preg_codeset\n" +
            "    ON preg_codeset.code = latest_hts.observation->>'pregnancyStatus'\n";

    // PEP-only joins:
    //   • latest_pep_visit: drives the 28-day Active/Completed window.
    //       Anchor date = MAX(date_start_pep), falling back to encounter_date.
    //       Sourced from pep_followup_visit (the dedicated PEP table).
    //   • latest_pep_interruption: exposes pep_completion of the most recent
    //       PEP interruption row so the CASE can short-circuit to 'Completed'
    //       when pep_completion = 'YES_NO_YES'.
    String PEP_LATEST_VISIT_JOIN =
            "LEFT JOIN (\n" +
            "    SELECT pv.person_uuid,\n" +
            "           MAX(COALESCE(pv.date_start_pep, pv.encounter_date)) AS pep_start_date,\n" +
            "           MAX(pv.encounter_date) AS visit_date\n" +
            "    FROM pep_followup_visit pv\n" +
            "    WHERE CAST(pv.archived AS BOOLEAN) = false\n" +
            "    GROUP BY pv.person_uuid\n" +
            ") latest_pep_visit ON latest_pep_visit.person_uuid = pet.person_uuid\n" +
            // Latest PEP interruption per person in ONE scan (was a MAX-self-join),
            // keyed off follow_up_visit_date — the date the client was actually
            // seen for the completion entry.
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (pi.person_uuid) pi.person_uuid, pi.pep_completion,\n" +
            "           pi.follow_up_visit_date AS completion_date\n" +
            "    FROM prophylaxis_interruptions pi\n" +
            "    JOIN prophylaxis_initiation pip_pep_i ON pip_pep_i.uuid = pi.prophylaxis_initiation_uuid\n" +
            "    WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "      AND pip_pep_i.enrollment_type = ?3\n" +
            // Only actual completion rows, so completion_date is the LATEST PEP
            // completion — the thing we compare against the latest PEP visit.
            "      AND pi.pep_completion = 'YES_NO_YES'\n" +
            "    ORDER BY pi.person_uuid, pi.follow_up_visit_date DESC NULLS LAST, pi.id DESC\n" +
            ") latest_pep_interruption ON latest_pep_interruption.person_uuid = pet.person_uuid\n";

    String ENROLLED_WHERE =
            "WHERE CAST(pet.archived AS BOOLEAN) = ?1\n" +
            "  AND pet.facility_id = ?2\n" +
            "  AND pet.enrollment_type = ?3\n" +
            // Exclude clients whose latest interruption on this arm is
            // Seroconverted — they should not surface on the Enrolled grid for
            // either PrEP or PEP. prepi is LEFT-JOINed and pre-scoped to the
            // current arm (?3), so this WHERE works for both queries; clients
            // with no interruption at all keep flowing through because
            // prepi.interruption_type IS NULL.
            "  AND (prepi.interruption_type IS NULL\n" +
            "       OR prepi.interruption_type NOT IN ('PREP_DISCONTINUATION_TYPE_SEROCONVERTED',\n" +
            "                                          'PREP_STATUS_SEROCONVERTED'))\n";

    String SEARCH_PREDICATE =
            "  AND (p.first_name ILIKE ?4\n" +
            "       OR p.surname ILIKE ?4\n" +
            "       OR p.other_name ILIKE ?4\n" +
            "       OR p.hospital_number ILIKE ?4\n" +
            "       OR pet.unique_id ILIKE ?4)\n";

    String ORDER_BY = "ORDER BY p.id, pet.date_enrolled DESC NULLS LAST";

    // Lean FROM for the enrolled COUNT queries. COUNT(DISTINCT p.id) only needs
    // the driver (pet ⋈ p) plus the one join the WHERE actually references —
    // `prepi` (the latest-interruption subquery used by the Seroconverted
    // exclusion in ENROLLED_WHERE). Every other join in ENROLLED_JOINS /
    // PEP_LATEST_VISIT_JOIN is a LEFT JOIN feeding only the SELECT, so it can't
    // change which p.id match and is pure waste in the count. Dropping them
    // removes a full O(n·log n) pass from each enrolled tab's page load.
    String ENROLLED_COUNT_FROM =
            "FROM prophylaxis_initiation pet\n" +
            "INNER JOIN patient_person p ON p.uuid = pet.person_uuid\n" +
            // Latest interruption per person in ONE scan (was a MAX-self-join).
            "LEFT JOIN (\n" +
            "    SELECT DISTINCT ON (pi.person_uuid)\n" +
            "           pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "    FROM prophylaxis_interruptions pi\n" +
            "    JOIN prophylaxis_initiation pip_i ON pip_i.uuid = pi.prophylaxis_initiation_uuid\n" +
            "    WHERE CAST(pi.archived AS BOOLEAN) = false\n" +
            "      AND pip_i.enrollment_type = ?3\n" +
            "    ORDER BY pi.person_uuid, pi.interruption_date DESC NULLS LAST, pi.id DESC\n" +
            ") prepi ON prepi.person_uuid = pet.person_uuid\n";

    // ── PrEP-Enrolled tab ─────────────────────────────────────────────────────
    @Query(value =
            COMMON_SELECT_HEAD + PREP_STATUS_CASE +
            ENROLLED_JOINS +
            ENROLLED_WHERE + ORDER_BY,
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) " +
                    ENROLLED_COUNT_FROM + ENROLLED_WHERE,
            nativeQuery = true)
    Page<PrepHtsPatient> findPrepEnrolled(
            Boolean archived, Long facilityId, String enrollmentType, Pageable pageable);

    @Query(value =
            COMMON_SELECT_HEAD + PREP_STATUS_CASE +
            ENROLLED_JOINS +
            ENROLLED_WHERE + SEARCH_PREDICATE + ORDER_BY,
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) " +
                    ENROLLED_COUNT_FROM + ENROLLED_WHERE + SEARCH_PREDICATE,
            nativeQuery = true)
    Page<PrepHtsPatient> findPrepEnrolledBySearchParam(
            Boolean archived, Long facilityId, String enrollmentType, String search, Pageable pageable);

    // ── PEP-Enrolled tab ──────────────────────────────────────────────────────
    @Query(value =
            COMMON_SELECT_HEAD + PEP_STATUS_CASE +
            ENROLLED_JOINS + PEP_LATEST_VISIT_JOIN +
            ENROLLED_WHERE + ORDER_BY,
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) " +
                    ENROLLED_COUNT_FROM + ENROLLED_WHERE,
            nativeQuery = true)
    Page<PrepHtsPatient> findPepEnrolled(
            Boolean archived, Long facilityId, String enrollmentType, Pageable pageable);

    @Query(value =
            COMMON_SELECT_HEAD + PEP_STATUS_CASE +
            ENROLLED_JOINS + PEP_LATEST_VISIT_JOIN +
            ENROLLED_WHERE + SEARCH_PREDICATE + ORDER_BY,
            countQuery =
                    "SELECT COUNT(DISTINCT p.id) " +
                    ENROLLED_COUNT_FROM + ENROLLED_WHERE + SEARCH_PREDICATE,
            nativeQuery = true)
    Page<PrepHtsPatient> findPepEnrolledBySearchParam(
            Boolean archived, Long facilityId, String enrollmentType, String search, Pageable pageable);

    // ── Single-person, arm-specific status (dashboard == grid) ─────────────────
    // Same SELECT / STATUS CASE / joins the PrEP and PEP grids use, but scoped to
    // one person (?4) and one arm (?3). Lets the dashboard (prep/persons/{id})
    // show the exact status the grid shows, instead of the arm-mixed
    // findPersonPrepAndStatusByPatientUuid. No Seroconverted exclusion here — the
    // dashboard must show that status, not hide the row.
    @Query(value =
            COMMON_SELECT_HEAD + PREP_STATUS_CASE +
            ENROLLED_JOINS +
            "WHERE CAST(pet.archived AS BOOLEAN) = ?1\n" +
            "  AND pet.facility_id = ?2\n" +
            "  AND pet.enrollment_type = ?3\n" +
            "  AND CAST(p.uuid AS text) = ?4\n" +
            "ORDER BY p.id, pet.date_enrolled DESC NULLS LAST",
            nativeQuery = true)
    Optional<PrepHtsPatient> findPrepEnrolledStatusForPerson(
            Boolean archived, Long facilityId, String enrollmentType, String personUuid);

    @Query(value =
            COMMON_SELECT_HEAD + PEP_STATUS_CASE +
            ENROLLED_JOINS + PEP_LATEST_VISIT_JOIN +
            "WHERE CAST(pet.archived AS BOOLEAN) = ?1\n" +
            "  AND pet.facility_id = ?2\n" +
            "  AND pet.enrollment_type = ?3\n" +
            "  AND CAST(p.uuid AS text) = ?4\n" +
            "ORDER BY p.id, pet.date_enrolled DESC NULLS LAST",
            nativeQuery = true)
    Optional<PrepHtsPatient> findPepEnrolledStatusForPerson(
            Boolean archived, Long facilityId, String enrollmentType, String personUuid);

}

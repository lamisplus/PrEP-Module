package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepEnrollmentRepository extends JpaRepository<PrepEnrollment, Long>, JpaSpecificationExecutor<PrepEnrollment> {
    List<PrepEnrollment> findAllByPersonOrderByIdDesc(Person person);

    List<PrepEnrollment> findFirstByPersonOrderByIdDesc(Person person);

    List<PrepEnrollment> findAllByUniqueIdOrderByIdDesc(String code);

    List<PrepEnrollment> findAllByPerson(Person person);

    Optional<PrepEnrollment> findByIdAndArchivedAndFacilityId(Long id, int archived, Long currentUserOrganization);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    Optional<PrepEnrollment> findByPrepEligibilityUuid(String prepEligibilityUuid);

    Optional<PrepEnrollment> findByUuid(String enrollmentUuid);

    List<PrepEnrollment> findAllByPersonAndArchived(Person person, int archived);

    @Query(value = "SELECT * FROM prep_enrollment pe WHERE pe.person_uuid=?1 AND pe.archived=?2 AND " +
            "pe.status NOT IN (?4) AND pe.facility_id=?3 ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepEnrollment> findByPersonUuidAndArchived(String personUuid, int archived, Long facilityId, String status);

    Optional<PrepEnrollment> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount  " +
            "FROM patient_person p " +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1 " +
            "WHERE p.archived=?1 AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR pet.unique_id ILIKE ?3) " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth ", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount  " +
            "FROM patient_person p " +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1 " +
            "WHERE p.archived=?1 AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR pet.unique_id ILIKE ?3) " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth ", nativeQuery = true)
    List<PrepClient> findAllPersonPrepBySearchParam(Integer archived, Long facilityId, String search);


    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount  " +
            "FROM patient_person p  LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1  " +
            "WHERE p.archived=?1 AND p.facility_id=?2  " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    Page<PrepClient> findAllPersonPrep(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,   " +
            "p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,   " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, " +
            "CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount  " +
            "FROM patient_person p  LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1  " +
            "WHERE p.archived=?1 AND p.facility_id=?2  " +
            "GROUP BY pet.unique_id, p.id, p.first_name, p.first_name, p.surname, p.other_name, p.hospital_number, p.date_of_birth", nativeQuery = true)
    List<PrepClient> findAllPersonPrep(Integer archived, Long facilityId);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number)\n" +
            "    p.hospital_number AS hospitalNumber,\n" +
            "    el_max.HIVResultAtVisit,\n" +
            "    p.date_of_registration AS dateOfRegistration,\n" +
            "    prepc.commencementCount,\n" +
            "    el.eligibility_count AS eligibilityCount,\n" +
            "    pet.created_by AS createdBy,\n" +
            "    pet.unique_id AS uniqueId,\n" +
            "    p.id AS personId,\n" +
            "    p.uuid AS personUuid, -- Ensure this is the correct column\n" +
            "    p.first_name AS firstName,\n" +
            "    p.surname AS surname,\n" +
            "    p.other_name AS otherName,\n" +
            "    pet.date_created,\n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.date_of_birth)) AS INTEGER) AS age,\n" +
            "    INITCAP(p.sex) AS gender,\n" +
            "    p.date_of_birth AS dateOfBirth,\n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv,\n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount,\n" +
            "    (CASE \n" +
            "        WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive'\n" +
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'" +
            "        WHEN prepi.interruption_date > prepc.encounter_date THEN bac.display\n" +
            "        WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV'\n" +
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled'\n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted'\n" +
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN \n" +
            "            CASE \n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 59 THEN 'Discontinued'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 37 THEN 'Delayed Injection'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN \n" +
            "            CASE \n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 89 THEN 'Discontinued'\n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 67 THEN 'Delayed Injection'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped'\n" +
            "                ELSE 'Active'\n" +
            "            END\n" +
            "        ELSE prepc.status\n" +
            "    END) AS prepStatus\n" +
            "FROM patient_person p\n" +
            "LEFT JOIN (\n" +
            "    SELECT COUNT(el.person_uuid) AS eligibility_count, el.person_uuid\n" +
            "    FROM prep_eligibility el\n" +
            "    WHERE el.archived = ?1\n" +
            "    GROUP BY el.person_uuid\n" +
            ") el ON el.person_uuid = p.uuid\n" +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived = ?1\n" +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = ?1\n" +
            "LEFT JOIN (\n" +
            "    SELECT pc.person_uuid, COUNT(pc.person_uuid) AS commencementCount,\n" +
            "           MAX(pc.encounter_date) AS encounter_date, pc.duration,\n" +
            "           pc.visit_type AS visit_type, pc.prep_type AS prep_type, pc.previous_prep_status AS previous_prep_status,\n" +
            "           (CASE WHEN (pc.encounter_date + pc.duration) > CAST(NOW() AS DATE) THEN 'Active' ELSE 'Defaulted' END) AS status\n" +
            "    FROM prep_clinic pc\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(pc.encounter_date) AS encounter_date, pc.person_uuid\n" +
            "        FROM prep_clinic pc\n" +
            "        WHERE pc.archived = ?1\n" +
            "        GROUP BY pc.person_uuid\n" +
            "    ) max_p ON max_p.encounter_date = pc.encounter_date AND max_p.person_uuid = pc.person_uuid\n" +
            "    WHERE pc.archived = ?1\n" +
            "    GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status, status\n" +
            ") prepc ON prepc.person_uuid = p.uuid\n" +
            "LEFT JOIN (\n" +
            "    SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            "    FROM prep_interruption pi\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) AS interruption_date\n" +
            "        FROM prep_interruption pi\n" +
            "        WHERE pi.archived = ?1\n" +
            "        GROUP BY pi.person_uuid\n" +
            "    ) pit ON pit.interruption_date = pi.interruption_date AND pit.person_uuid = pi.person_uuid\n" +
            "    WHERE pi.archived = ?1\n" +
            "    GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type\n" +
            ") prepi ON prepi.person_uuid = p.uuid\n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type\n" +
            "LEFT JOIN (\n" +
            "    SELECT pel.max_date, el.person_uuid,\n" +
            "           el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit\n" +
            "    FROM prep_eligibility el\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(el.visit_date) AS max_date, el.person_uuid\n" +
            "        FROM prep_eligibility el\n" +
            "        WHERE el.archived = ?1\n" +
            "        GROUP BY el.person_uuid\n" +
            "    ) pel ON pel.max_date = el.visit_date AND el.person_uuid = pel.person_uuid\n" +
            ") el_max ON el_max.person_uuid = p.uuid\n" +
            "WHERE p.archived = ?1\n" +
            "AND p.facility_id = ?2\n" +
            "AND he.person_uuid IS NULL\n" +
            "AND (el_max.HIVResultAtVisit NOT ILIKE '%Positive%' OR el_max.HIVResultAtVisit IS NULL)\n" +
            "AND (p.first_name ILIKE ?3\n" +
            "     OR p.full_name ILIKE ?3\n" +
            "     OR p.surname ILIKE ?3\n" +
            "     OR p.other_name ILIKE ?3\n" +
            "     OR p.hospital_number ILIKE ?3\n" +
            "     OR pet.unique_id ILIKE ?3)\n" +
            "GROUP BY \n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display,\n" +
            "    el_max.HIVResultAtVisit, p.date_of_registration,\n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by,\n" +
            "    pet.unique_id, p.id, p.first_name, p.surname,\n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created,\n" +
            "    p.other_name, p.hospital_number, p.date_of_birth,\n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv,\n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration\n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepAndStatusBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


    //    @Query(value = "SELECT el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration AS dateOfRegistration, prepc.commencementCount, el.eligibility_count as eligibilityCount, pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
//            " p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
//            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
//            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
//            "(CASE " +
//            "WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' " +
//            "WHEN prepi.interruption_date  > prepc.encounter_date THEN bac.display " +
//            "WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' " +
//            "WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' " +
//            "WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' " +
//            "ELSE prepc.status END) prepStatus" +
//            " FROM patient_person p  " +
//            " INNER JOIN (SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid FROM prep_eligibility el " +
//            "WHERE el.archived=?1 GROUP BY person_uuid) el ON el.person_uuid = p.uuid" +
//            " LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1" +
//            " LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived=?1" +
//            " LEFT JOIN (SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, pc.duration,   " +
//            " (CASE WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'" +
//            " ELSE  'Defaulted' END) status FROM prep_clinic pc" +
//            " INNER JOIN (SELECT DISTINCT MAX(pc.encounter_date) encounter_date, pc.person_uuid" +
//            " FROM prep_clinic pc GROUP BY pc.person_uuid) max_p ON max_p.encounter_date=pc.encounter_date " +
//            " AND max_p.person_uuid=pc.person_uuid WHERE pc.archived=?1 " +
//            " GROUP BY pc.person_uuid, pc.duration, status ) prepc ON prepc.person_uuid=p.uuid  " +
//            "LEFT JOIN (" +
//            "SELECT pi.id, pi.person_uuid, pi.interruption_date , pi.interruption_type " +
//            "FROM prep_interruption pi " +
//            "INNER JOIN (SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date)interruption_date " +
//            "FROM prep_interruption pi WHERE pi.archived=?1 " +
//            "GROUP BY pi.person_uuid)pit ON pit.interruption_date=pi.interruption_date " +
//            "AND pit.person_uuid=pi.person_uuid " +
//            "WHERE pi.archived=?1 " +
//            "GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi ON prepi.person_uuid = p.uuid " +
//            "LEFT JOIN base_application_codeset bac ON bac.code=prepi.interruption_type " +
//            "LEFT JOIN (SELECT pel.max_date, el.person_uuid, el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit  " +
//            "FROM prep_eligibility el " +
//            "INNER JOIN (SELECT DISTINCT MAX(el.visit_date) as max_date, el.person_uuid " +
//            "FROM prep_eligibility el WHERE el.archived=0 " +
//            "GROUP BY person_uuid)pel ON pel.max_date=el.visit_date AND el.person_uuid=pel.person_uuid) el_max ON el_max.person_uuid = p.uuid " +
//            " WHERE p.archived=?1 AND p.facility_id=?2 AND (p.first_name ILIKE ?3 OR p.full_name ILIKE ?3 " +
//            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
//            "OR p.hospital_number ILIKE ?3 OR pet.unique_id ILIKE ?3) " +
//            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display, " +
//            "el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration, prepc.commencementCount, el.eligibility_count, " +
//            "pet.created_by, pet.unique_id, p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
//            "p.other_name, p.hospital_number, p.date_of_birth, prepc.status, he.person_uuid, " +
//            "he.date_confirmed_hiv, pet.id ORDER BY pet.date_created DESC NULLS LAST", nativeQuery = true)
    @Query(value = "SELECT DISTINCT ON (p.hospital_number) p.hospital_number as hospitalNumber,  " +
            "el_max.HIVResultAtVisit, p.date_of_registration AS dateOfRegistration, prepc.commencementCount,  " +
            "el.eligibility_count as eligibilityCount, pet.created_by as createdBy,  " +
            "pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName,  " +
            "p.surname as surname, p.other_name as otherName,      " +
            "pet.date_created, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,      " +
            "INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth,  " +
            "he.date_confirmed_hiv as dateConfirmedHiv,   CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,   " +
            "(CASE WHEN el_max.HIVResultAtVisit ILIKE '%Positive%'  " +
            "THEN 'HIV Positive' WHEN prepi.interruption_date  > prepc.encounter_date THEN bac.display  " +
            "WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' WHEN pet.person_uuid IS NULL  " +
            "THEN 'Not Enrolled' WHEN prepc.person_uuid IS NULL  " +
            "THEN 'Not Commenced' ELSE prepc.status END) prepStatus  " +
            "FROM patient_person p   LEFT JOIN (SELECT COUNT(el.person_uuid) as eligibility_count,  " +
            "el.person_uuid FROM prep_eligibility el WHERE el.archived=?1  " +
            "GROUP BY person_uuid) el ON el.person_uuid = p.uuid  " +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid  " +
            "AND pet.archived=?1 LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid  " +
            "AND he.archived=?1 LEFT JOIN (SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount,  " +
            "MAX(pc.encounter_date) as encounter_date, pc.duration,   " +
            " (CASE WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'  " +
            " ELSE  'Defaulted' END) status FROM prep_clinic pc  " +
            " INNER JOIN (SELECT DISTINCT MAX(pc.encounter_date) encounter_date,  " +
            " pc.person_uuid FROM prep_clinic pc GROUP BY pc.person_uuid) max_p  " +
            " ON max_p.encounter_date=pc.encounter_date  AND max_p.person_uuid=pc.person_uuid  " +
            " WHERE pc.archived=?1  GROUP BY pc.person_uuid, pc.duration, status ) prepc  " +
            " ON prepc.person_uuid=p.uuid  LEFT JOIN (SELECT pi.id, pi.person_uuid,  " +
            " pi.interruption_date , pi.interruption_type  " +
            " FROM prep_interruption pi  " +
            " INNER JOIN (SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date)interruption_date  " +
            " FROM prep_interruption pi WHERE pi.archived=?1  " +
            " GROUP BY pi.person_uuid)pit ON pit.interruption_date=pi.interruption_date  " +
            " AND pit.person_uuid=pi.person_uuid WHERE pi.archived=?1  " +
            " GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi  " +
            " ON prepi.person_uuid = p.uuid LEFT JOIN base_application_codeset bac  " +
            " ON bac.code=prepi.interruption_type LEFT JOIN (SELECT pel.max_date, el.person_uuid,  " +
            " el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit   " +
            " FROM prep_eligibility el INNER JOIN (SELECT DISTINCT MAX(el.visit_date) as max_date,  " +
            " el.person_uuid FROM prep_eligibility el WHERE el.archived=0 GROUP BY person_uuid)pel  " +
            " ON pel.max_date=el.visit_date AND el.person_uuid=pel.person_uuid) el_max  " +
            " ON el_max.person_uuid = p.uuid  WHERE p.archived=?1 AND p.facility_id=?2  " +
            " AND he.person_uuid IS NULL AND (el_max.HIVResultAtVisit NOT ILIKE '%Positive%'  " +
            " OR el_max.HIVResultAtVisit is NULL)  " +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display,  " +
            " el_max.HIVResultAtVisit, p.date_of_registration, prepc.commencementCount,  " +
            " el.eligibility_count, pet.created_by, pet.unique_id, p.id, p.first_name,  " +
            " p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, pet.date_created,  " +
            " p.other_name, p.hospital_number, p.date_of_birth, prepc.status, he.person_uuid,  " +
            " he.date_confirmed_hiv, pet.id ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findOnlyPersonPrepAndStatusBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


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
            "        WHEN prepi.interruption_date > prepc.encounter_date THEN bac.display \n" +
            "        WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' \n" +
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' \n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' \n" +
            "        ELSE prepc.status \n" +
            "     END) prepStatus\n" +
            "FROM patient_person p  \n" +
            "LEFT JOIN (\n" +
            "    SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid \n" +
            "    FROM prep_eligibility el \n" +
            "    WHERE el.archived=?1 \n" +
            "    GROUP BY person_uuid\n" +
            ") el ON el.person_uuid = p.uuid\n" +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1\n" +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived=?1\n" +
            "LEFT JOIN (\n" +
            "    SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, \n" +
            "           pc.duration,   \n" +
            "           (CASE WHEN (pc.encounter_date + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'\n" +
            "                ELSE  'Defaulted' END) status \n" +
            "    FROM prep_clinic pc\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(pc.encounter_date) encounter_date, pc.person_uuid\n" +
            "        FROM prep_clinic pc \n" +
            "        GROUP BY pc.person_uuid\n" +
            "    ) max_p ON max_p.encounter_date = pc.encounter_date \n" +
            "            AND max_p.person_uuid=pc.person_uuid \n" +
            "    WHERE pc.archived=?1 \n" +
            "    GROUP BY pc.person_uuid, pc.duration, status \n" +
            ") prepc ON prepc.person_uuid=p.uuid  \n" +
            "LEFT JOIN (\n" +
            "    SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type \n" +
            "    FROM prep_interruption pi \n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) interruption_date \n" +
            "        FROM prep_interruption pi \n" +
            "        WHERE pi.archived=?1 \n" +
            "        GROUP BY pi.person_uuid\n" +
            "    ) pit ON pit.interruption_date = pi.interruption_date \n" +
            "          AND pit.person_uuid = pi.person_uuid \n" +
            "    WHERE pi.archived=?1 \n" +
            "    GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type \n" +
            ") prepi ON prepi.person_uuid = p.uuid \n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type \n" +
            "LEFT JOIN (\n" +
            "    SELECT pel.max_date, el.person_uuid, el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit  \n" +
            "    FROM prep_eligibility el \n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(el.visit_date) as max_date, el.person_uuid \n" +
            "        FROM prep_eligibility el \n" +
            "        WHERE el.archived=0 \n" +
            "        GROUP BY el.person_uuid\n" +
            "    ) pel ON pel.max_date = el.visit_date \n" +
            "         AND el.person_uuid = pel.person_uuid\n" +
            ") el_max ON el_max.person_uuid = p.uuid \n" +
            "WHERE p.archived=?1 AND p.facility_id=?2 AND p.uuid=?3\n" +
            "GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display, he.person_uuid, he.date_confirmed_hiv, \n" +
            "         el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration, prepc.commencementCount, el.eligibility_count, pet.created_by, pet.unique_id, \n" +
            "         p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, \n" +
            "         p.other_name, p.hospital_number, p.date_of_birth, prepc.status, pet.id \n" +
            "ORDER BY el_max.HIVResultAtVisit, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Optional<PrepClient> findPersonPrepAndStatusByPatientUuid(Integer archived, Long facilityId, String personUuid);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number) \n" +
            "    p.hospital_number AS hospitalNumber, \n" +
            "    el_max.HIVResultAtVisit, \n" +
            "    p.date_of_registration AS dateOfRegistration, \n" +
            "    prepc.commencementCount, \n" +
            "    el.eligibility_count AS eligibilityCount, \n" +
            "    pet.created_by AS createdBy, \n" +
            "    pet.unique_id AS uniqueId, \n" +
            "    p.id AS personId, \n" +
            "    p.uuid AS personUuid, \n" +
            "    p.first_name AS firstName, \n" +
            "    p.surname AS surname, \n" +
            "    p.other_name AS otherName, \n" +
            "    pet.date_created, \n" +
            "    CAST(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) AS INTEGER) AS age, \n" +
            "    INITCAP(p.sex) AS gender, \n" +
            "    p.date_of_birth AS dateOfBirth, \n" +
            "    he.date_confirmed_hiv AS dateConfirmedHiv, \n" +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount, \n" +
            "    CASE \n" +
            "        WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' \n" +
            "        WHEN prepc.previous_prep_status = 'Stopped' OR prepc.previous_prep_status = 'Discontinued' THEN 'Restart'\n" +
            "        WHEN prepi.interruption_date > prepc.encounter_date THEN bac.display \n" +
            "        WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' \n" +
            "        WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' \n" +
            "        WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' \n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped'\n" +
            "        WHEN prepi.interruption_type = 'PREP_STATUS_SEROCONVERTED' THEN 'Seroconverted' \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN \n" +
            "            CASE \n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 59 THEN 'Discontinued' \n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 37 THEN 'Delayed Injection' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN \n" +
            "            CASE \n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 89 THEN 'Discontinued' \n" +
            "                WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 67 THEN 'Delayed Injection' \n" +
            "                ELSE 'Active' \n" +
            "            END \n" +
            "        WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN \n" +
            "            CASE \n" +
            "                WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' \n" +
            "                ELSE 'Active' \n" +
            "            END\n" +
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
            "    END AS sendCabLaAlert\n" +
            "FROM patient_person p \n" +
            "LEFT JOIN (\n" +
            "    SELECT COUNT(el.person_uuid) AS eligibility_count, el.person_uuid \n" +
            "    FROM prep_eligibility el \n" +
            "    WHERE el.archived = ?1 \n" +
            "    GROUP BY el.person_uuid \n" +
            ") el ON el.person_uuid = p.uuid \n" +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived = ?1 \n" +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = ?1 \n" +
            "LEFT JOIN (\n" +
            "    SELECT pc.person_uuid, COUNT(pc.person_uuid) AS commencementCount,\n" +
            "           MAX(pc.encounter_date) AS encounter_date, pc.duration,\n" +
            "           pc.visit_type AS visit_type, pc.prep_type AS prep_type, pc.previous_prep_status AS previous_prep_status,\n" +
            "           CASE WHEN (pc.encounter_date + pc.duration) > CAST(NOW() AS DATE) THEN 'Active' ELSE 'Defaulted' END AS status\n" +
            "    FROM prep_clinic pc\n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(pc.encounter_date) AS encounter_date, pc.person_uuid\n" +
            "        FROM prep_clinic pc\n" +
            "        WHERE pc.archived = ?1\n" +
            "        GROUP BY pc.person_uuid\n" +
            "    ) max_p ON max_p.encounter_date = pc.encounter_date AND max_p.person_uuid = pc.person_uuid\n" +
            "    WHERE pc.archived = ?1\n" +
            "    GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, pc.previous_prep_status, status\n" +
            ") prepc ON prepc.person_uuid = p.uuid \n" +
            "LEFT JOIN (\n" +
            "    SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type \n" +
            "    FROM prep_interruption pi \n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) AS interruption_date \n" +
            "        FROM prep_interruption pi \n" +
            "        WHERE pi.archived = ?1 \n" +
            "        GROUP BY pi.person_uuid \n" +
            "    ) pit ON pit.interruption_date = pi.interruption_date AND pit.person_uuid = pi.person_uuid \n" +
            "    WHERE pi.archived = ?1 \n" +
            "    GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type \n" +
            ") prepi ON prepi.person_uuid = p.uuid \n" +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type \n" +
            "LEFT JOIN (\n" +
            "    SELECT pel.max_date, el.person_uuid, \n" +
            "           el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit \n" +
            "    FROM prep_eligibility el \n" +
            "    INNER JOIN (\n" +
            "        SELECT DISTINCT MAX(el.visit_date) AS max_date, el.person_uuid \n" +
            "        FROM prep_eligibility el \n" +
            "        WHERE el.archived = ?1 \n" +
            "        GROUP BY el.person_uuid \n" +
            "    ) pel ON pel.max_date = el.visit_date AND el.person_uuid = pel.person_uuid \n" +
            ") el_max ON el_max.person_uuid = p.uuid \n" +
            "WHERE p.archived = ?1 \n" +
            "AND p.facility_id = ?2 \n" +
            "AND he.person_uuid IS NULL \n" +
            "AND (el_max.HIVResultAtVisit NOT ILIKE '%Positive%' OR el_max.HIVResultAtVisit IS NULL) \n" +
            "GROUP BY \n" +
            "    prepi.interruption_date, prepi.interruption_type, prepc.encounter_date, bac.display, \n" +
            "    el_max.HIVResultAtVisit, p.date_of_registration, \n" +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by, \n" +
            "    pet.unique_id, p.id, p.first_name, p.surname, \n" +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created, \n" +
            "    p.other_name, p.hospital_number, p.date_of_birth, \n" +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv, \n" +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.previous_prep_status, prepc.duration \n" +
            "ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepAndStatus(Integer archived, Long facilityId, Pageable pageable);

    @Query(value = "SELECT el_max.HIVResultAtVisit, p.date_of_registration AS dateOfRegistration, prepc.commencementCount, el.eligibility_count as eligibilityCount, " +
            "pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
            " pet.date_created, p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
            "(CASE " +
            "WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' " +
            "WHEN prepi.interruption_date  > prepc.encounter_date THEN bac.display " +
            "WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' " +
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
            "            END AS sendCabLaAlert," +
            " FROM patient_person p  " +
            " INNER JOIN (SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid FROM prep_eligibility el " +
            "WHERE el.archived=?1 GROUP BY person_uuid) el ON el.person_uuid = p.uuid" +
            " LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived=?1" +
            " LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived=?1" +
            " LEFT JOIN (SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, pc.duration,   " +
            " (CASE WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active'" +
            " ELSE  'Defaulted' END) status FROM prep_clinic pc" +
            " INNER JOIN (SELECT DISTINCT MAX(pc.encounter_date) encounter_date, pc.person_uuid" +
            " FROM prep_clinic pc GROUP BY pc.person_uuid) max_p ON max_p.encounter_date=pc.encounter_date " +
            " AND max_p.person_uuid=pc.person_uuid WHERE pc.archived=?1 " +
            " GROUP BY pc.person_uuid, pc.duration, status ) prepc ON prepc.person_uuid=p.uuid  " +
            "LEFT JOIN (" +
            "SELECT pi.id, pi.person_uuid, pi.interruption_date , pi.interruption_type " +
            "FROM prep_interruption pi " +
            "INNER JOIN (SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date)interruption_date " +
            "FROM prep_interruption pi WHERE pi.archived=?1 " +
            "GROUP BY pi.person_uuid)pit ON pit.interruption_date=pi.interruption_date " +
            "AND pit.person_uuid=pi.person_uuid " +
            "WHERE pi.archived=?1 " +
            "GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi ON prepi.person_uuid = p.uuid " +
            "LEFT JOIN base_application_codeset bac ON bac.code=prepi.interruption_type " +
            "LEFT JOIN (SELECT pel.max_date, el.person_uuid, el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit  " +
            "FROM prep_eligibility el " +
            "INNER JOIN (SELECT DISTINCT MAX(el.visit_date) as max_date, el.person_uuid " +
            "FROM prep_eligibility el WHERE el.archived=0 " +
            "GROUP BY person_uuid)pel ON pel.max_date=el.visit_date AND el.person_uuid=pel.person_uuid) el_max ON el_max.person_uuid = p.uuid " +
            " WHERE p.archived=?1 AND p.facilityId=?2 " +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display, " +
            "el_max.HIVResultAtVisit, p.date_of_registration, prepc.commencementCount, el.eligibility_count, pet.created_by, " +
            "pet.unique_id, p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
            "pet.date_created, p.other_name, p.hospital_number, p.date_of_birth, " +
            "prepc.status, he.person_uuid, he.date_confirmed_hiv, pet.id ORDER BY pet.date_created DESC NULLS LAST", nativeQuery = true)
    Page<PrepClient> findOnlyPersonPrepAndStatus(Integer archived, Long facilityId, Pageable pageable);

    List<PrepEnrollment> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);

    Optional<PrepEnrollment> findByDateEnrolledAndPersonUuid(LocalDate dateEnrolled, String personUuid);

    //For central sync
    List<PrepEnrollment> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prep_enrollment WHERE date_modified > ?1 AND facility_id=?2 ",
            nativeQuery = true
    )
    List<PrepEnrollment> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}
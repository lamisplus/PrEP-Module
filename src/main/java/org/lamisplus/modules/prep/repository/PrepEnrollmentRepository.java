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

    @Query(value = " SELECT DISTINCT ON (p.hospital_number)" +
            "    p.hospital_number as hospitalNumber," +
            "    el_max.HIVResultAtVisit," +
            "    pet.date_created," +
            "    p.date_of_registration AS dateOfRegistration, " +
            "    contact_point->'contactPoint'->0->>'value' as phoneNumber, " +
            "    address->'address'->0->>'city' as address, " +
            "    p.uuid," +
            "    prepc.commencementCount, " +
            "    el.eligibility_count as eligibilityCount, " +
            "    pet.created_by as createdBy, " +
            "    pet.unique_id as uniqueId, " +
            "    p.id as personId, " +
            "    p.first_name as firstName, " +
            "    p.surname as surname, " +
            "    p.other_name as otherName, " +
            "    CAST(EXTRACT(YEAR from AGE(NOW(), date_of_birth)) AS INTEGER) as age, " +
            "    INITCAP(p.sex) as gender, " +
            "    p.date_of_birth as dateOfBirth, " +
            "    he.date_confirmed_hiv as dateConfirmedHiv, " +
            "    CAST(COUNT(pet.person_uuid) AS INTEGER) as prepCount, " +
            "    (CASE " +
            "     WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' " +
            "     WHEN prepi.interruption_date > prepc.encounter_date THEN bac.display " +
            "     WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' " +
            "     WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' " +
            "     WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' " +
            "     WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped' " +
            "     WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN " +
            "     CASE " +
            "     WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 59 THEN 'Discontinued' " +
            "     WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 23 THEN 'Delayed Injection' " +
            "   ELSE 'Active' " +
            "     END " +
            "     WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN " +
            "     CASE " +
            "     WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 89 THEN 'Discontinued' " +
            "     WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 53 THEN 'Delayed Injection' " +
            "     ELSE 'Active' " +
            "     END " +
            "     WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN " +
            "     CASE " +
            "     WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' " +
            "     ELSE 'Active' " +
            "     END " +
            "     WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN " +
            "     CASE " +
            "     WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' " +
            "     ELSE 'Active' " +
            "     END " +
            "     WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN " +
            "     CASE " +
            "     WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped' " +
            "     ELSE 'Active' " +
            "     END " +
            "     ELSE prepc.status " +
            "    END) prepStatus " +
            "    FROM patient_person p " +
            "    LEFT JOIN ( " +
            "     SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid " +
            "     FROM prep_eligibility el " +
            "     WHERE el.archived = ?1 " +
            "     GROUP BY person_uuid " +
            "    ) el ON el.person_uuid = p.uuid " +
            "    LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived = ?1 " +
            "    LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = ?1 " +
            "    LEFT JOIN ( " +
            "     SELECT pc.person_uuid, COUNT(pc.person_uuid) commencementCount, " +
            "     MAX(pc.encounter_date) as encounter_date, pc.duration, " +
            "     pc.visit_type, pc.prep_type, " +
            "     (CASE WHEN (pc.encounter_date + pc.duration) > CAST(NOW() AS DATE) THEN 'Active' " +
            "     ELSE 'Defaulted' END) status " +
            "     FROM prep_clinic pc " +
            "     INNER JOIN ( " +
            "     SELECT DISTINCT MAX(pc.encounter_date) encounter_date, pc.person_uuid " +
            "     FROM prep_clinic pc " +
            "     GROUP BY pc.person_uuid " +
            "     ) max_p ON max_p.encounter_date = pc.encounter_date " +
            "     AND max_p.person_uuid = pc.person_uuid " +
            "     WHERE pc.archived = ?1 " +
            "     GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, status " +
            "    ) prepc ON prepc.person_uuid = p.uuid " +
            "    LEFT JOIN ( " +
            "     SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type " +
            "     FROM prep_interruption pi " +
            "     INNER JOIN ( " +
            "     SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) interruption_date " +
            "     FROM prep_interruption pi " +
            "     WHERE pi.archived = ?1 " +
            "     GROUP BY pi.person_uuid " +
            "     ) pit ON pit.interruption_date = pi.interruption_date " +
            "     AND pit.person_uuid = pi.person_uuid " +
            "     WHERE pi.archived = ?1 " +
            "     GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type " +
            "    ) prepi ON prepi.person_uuid = p.uuid " +
            "    LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type " +
            "    LEFT JOIN ( " +
            "     SELECT pel.max_date, el.person_uuid, " +
            "     el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit " +
            "     FROM prep_eligibility el " +
            "     INNER JOIN ( " +
            "     SELECT DISTINCT MAX(el.visit_date) as max_date, el.person_uuid " +
            "     FROM prep_eligibility el " +
            "     WHERE el.archived = ?1" +
            "     GROUP BY person_uuid " +
            "     ) pel ON pel.max_date = el.visit_date AND el.person_uuid = pel.person_uuid " +
            "    ) el_max ON el_max.person_uuid = p.uuid " +
            "    WHERE p.archived = ?1 " +
            "    AND p.facility_id = ?2 " +
            "    AND (p.first_name ILIKE ?3 " +
            "     OR p.full_name ILIKE ?3 " +
            "     OR p.surname ILIKE ?3 " +
            "     OR p.other_name ILIKE ?3 " +
            "     OR p.hospital_number ILIKE ?3 " +
            "     OR pet.unique_id ILIKE ?3) " +
            "    AND he.person_uuid IS NULL " +
            "    AND (el_max.HIVResultAtVisit NOT ILIKE '%Positive%' OR el_max.HIVResultAtVisit IS NULL) " +
            "    GROUP BY " +
            "     prepi.interruption_date,prepi.interruption_type, prepc.encounter_date, bac.display, " +
            "     el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration, " +
            "     prepc.commencementCount, el.eligibility_count, pet.created_by, " +
            "     pet.unique_id, p.id, p.first_name, p.surname, pet.person_uuid, " +
            "     prepc.person_uuid, p.other_name, p.hospital_number, p.date_of_birth, " +
            "     prepc.status, he.person_uuid, he.date_confirmed_hiv, pet.id, " +
            "     p.uuid, contact_point, address, prepc.visit_type, prepc.prep_type, " +
            "     prepc.duration " +
            "    ORDER BY p.hospital_number, pet.date_created DESC NULLS LAST", nativeQuery = true)
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


    @Query(value = "SELECT el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration AS dateOfRegistration, prepc.commencementCount, el.eligibility_count as eligibilityCount, pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
            " p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
            "(CASE " +
            "WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' " +
            "WHEN prepi.interruption_date  > prepc.encounter_date THEN bac.display " +
            "WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' " +
            "WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' " +
            "WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' " +
            "ELSE prepc.status END) prepStatus" +
            " FROM patient_person p  " +
            " LEFT JOIN (SELECT COUNT(el.person_uuid) as eligibility_count, el.person_uuid FROM prep_eligibility el " +
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
            " WHERE p.archived=?1 AND p.facility_id=?2 AND p.uuid=?3" +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display,he.person_uuid, he.date_confirmed_hiv, " +
            "el_max.HIVResultAtVisit, pet.date_created, p.date_of_registration, prepc.commencementCount, el.eligibility_count, pet.created_by, pet.unique_id, " +
            "p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
            "p.other_name, p.hospital_number, p.date_of_birth, prepc.status, pet.id ORDER BY pet.date_created DESC NULLS LAST", nativeQuery = true)
    Optional<PrepClient> findPersonPrepAndStatusByPatientUuid(Integer archived, Long facilityId, String personUuid);

    @Query(value = "SELECT DISTINCT ON (p.hospital_number) " +
            "p.hospital_number AS hospitalNumber, " +
            "el_max.HIVResultAtVisit, " +
            "p.date_of_registration AS dateOfRegistration, " +
            "prepc.commencementCount, " +
            "el.eligibility_count AS eligibilityCount, " +
            "pet.created_by AS createdBy, " +
            "pet.unique_id AS uniqueId, " +
            "p.id AS personId, " +
            "p.first_name AS firstName, " +
            "p.surname AS surname, " +
            "p.other_name AS otherName, " +
            "pet.date_created, " +
            "CAST(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth)) AS INTEGER) AS age, " +
            "INITCAP(p.sex) AS gender, " +
            "p.date_of_birth AS dateOfBirth, " +
            "he.date_confirmed_hiv AS dateConfirmedHiv, " +
            "CAST(COUNT(pet.person_uuid) AS INTEGER) AS prepCount, " +
            "(CASE " +
            "    WHEN el_max.HIVResultAtVisit ILIKE '%Positive%' THEN 'HIV Positive' " +
            "    WHEN prepi.interruption_date > prepc.encounter_date THEN bac.display " +
            "    WHEN he.person_uuid IS NOT NULL THEN 'Enrolled into HIV' " +
            "    WHEN pet.person_uuid IS NULL THEN 'Not Enrolled' " +
            "    WHEN prepc.person_uuid IS NULL THEN 'Not Commenced' " +
            "    WHEN prepi.interruption_type = 'PREP_STATUS_STOPPED' THEN 'Stopped' " +
            "    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN " +
            "        CASE " +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 59 THEN 'Discontinued' " +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 23 THEN 'Delayed Injection' " +
            "            ELSE 'Active' " +
            "        END " +
            "    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' AND prepc.prep_type = 'PREP_TYPE_INJECTIBLES' THEN " +
            "        CASE " +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 89 THEN 'Discontinued' " +
            "            WHEN (CURRENT_DATE - CAST(prepc.encounter_date AS DATE)) > 53 THEN 'Delayed Injection' " +
            "            ELSE 'Active' " +
            "        END " +
            "    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_METHOD_SWITCH' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN " +
            "                    CASE " +
            "                        WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' " +
            "                        ELSE 'Active' " +
            "                    END" +
            "    WHEN prepc.visit_type = 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN " +
            "        CASE " +
            "            WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Discontinued' " +
            "            ELSE 'Active' " +
            "        END " +
            "    WHEN prepc.visit_type <> 'PREP_VISIT_TYPE_DISCONTINUATION' AND prepc.prep_type = 'PREP_TYPE_ORAL' THEN " +
            "        CASE " +
            "            WHEN CURRENT_DATE > (CAST(prepc.encounter_date AS DATE) + CAST(prepc.duration AS INTEGER)) THEN 'Stopped' " +
            "            ELSE 'Active' " +
            "        END " +
            "    ELSE prepc.status " +
            "END) AS prepStatus " +
            "FROM patient_person p " +
            "LEFT JOIN ( " +
            "    SELECT COUNT(el.person_uuid) AS eligibility_count, el.person_uuid " +
            "    FROM prep_eligibility el " +
            "    WHERE el.archived = ?1 " +
            "    GROUP BY el.person_uuid " +
            ") el ON el.person_uuid = p.uuid " +
            "LEFT JOIN prep_enrollment pet ON pet.person_uuid = p.uuid AND pet.archived = ?1 " +
            "LEFT JOIN hiv_enrollment he ON he.person_uuid = p.uuid AND he.archived = ?1 " +
            "LEFT JOIN ( " +
            "    SELECT pc.person_uuid, COUNT(pc.person_uuid) AS commencementCount, " +
            "    MAX(pc.encounter_date) AS encounter_date, pc.duration, " +
            "    pc.visit_type AS visit_type, pc.prep_type AS prep_type, " +
            "    (CASE WHEN (pc.encounter_date + pc.duration) > CAST(NOW() AS DATE) THEN 'Active' ELSE 'Defaulted' END) AS status " +
            "    FROM prep_clinic pc " +
            "    INNER JOIN ( " +
            "        SELECT DISTINCT MAX(pc.encounter_date) AS encounter_date, pc.person_uuid " +
            "        FROM prep_clinic pc " +
            "        GROUP BY pc.person_uuid " +
            "    ) max_p ON max_p.encounter_date = pc.encounter_date AND max_p.person_uuid = pc.person_uuid " +
            "    WHERE pc.archived = ?1 " +
            "    GROUP BY pc.person_uuid, pc.duration, pc.visit_type, pc.prep_type, status " +
            ") prepc ON prepc.person_uuid = p.uuid " +
            "LEFT JOIN ( " +
            "    SELECT pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type " +
            "    FROM prep_interruption pi " +
            "    INNER JOIN ( " +
            "        SELECT DISTINCT pi.person_uuid, MAX(pi.interruption_date) AS interruption_date " +
            "        FROM prep_interruption pi " +
            "        WHERE pi.archived = ?1 " +
            "        GROUP BY pi.person_uuid " +
            "    ) pit ON pit.interruption_date = pi.interruption_date AND pit.person_uuid = pi.person_uuid " +
            "    WHERE pi.archived = ?1 " +
            "    GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type " +
            ") prepi ON prepi.person_uuid = p.uuid " +
            "LEFT JOIN base_application_codeset bac ON bac.code = prepi.interruption_type " +
            "LEFT JOIN ( " +
            "    SELECT pel.max_date, el.person_uuid, " +
            "    el.drug_use_history->>'hivTestResultAtvisit' AS HIVResultAtVisit " +
            "    FROM prep_eligibility el " +
            "    INNER JOIN ( " +
            "        SELECT DISTINCT MAX(el.visit_date) AS max_date, el.person_uuid " +
            "        FROM prep_eligibility el " +
            "        WHERE el.archived = ?1 " +
            "        GROUP BY el.person_uuid " +
            "    ) pel ON pel.max_date = el.visit_date AND el.person_uuid = pel.person_uuid " +
            ") el_max ON el_max.person_uuid = p.uuid " +
            "WHERE p.archived = ?1 " +
            "AND p.facility_id = ?2 " +
            "AND he.person_uuid IS NULL " +
            "AND (el_max.HIVResultAtVisit NOT ILIKE '%Positive%' OR el_max.HIVResultAtVisit IS NULL) " +
            "GROUP BY " +
            "    prepi.interruption_date,prepi.interruption_type, prepc.encounter_date, bac.display, " +
            "    el_max.HIVResultAtVisit, p.date_of_registration, " +
            "    prepc.commencementCount, el.eligibility_count, pet.created_by, " +
            "    pet.unique_id, p.id, p.first_name, p.surname, " +
            "    pet.person_uuid, prepc.person_uuid, pet.date_created, " +
            "    p.other_name, p.hospital_number, p.date_of_birth, " +
            "    prepc.status, he.person_uuid, he.date_confirmed_hiv, " +
            "    pet.id, prepc.visit_type, prepc.prep_type, prepc.duration " +
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
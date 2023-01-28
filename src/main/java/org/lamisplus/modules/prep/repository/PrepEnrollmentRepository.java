package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

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
    @Query(value = "SELECT prepc.commencementCount, el.eligibility_count as eligibilityCount, pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
            " p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
            "(CASE " +
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
            " LEFT JOIN (SELECT pc.id, pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, pc.duration, " +
            "(CASE " +
            "WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active' " +
            "ELSE" +
            " 'Defaulted' " +
            "END) status " +
            "FROM prep_clinic pc " +
            "WHERE pc.archived=0 " +
            "GROUP BY id, person_uuid, duration, status ) prepc ON prepc.person_uuid=p.uuid " +
            "LEFT JOIN (" +
            "SELECT pi.id, pi.person_uuid, MAX(pi.interruption_date)interruption_date , pi.interruption_type " +
            "FROM prep_interruption pi WHERE pi.archived=?1 " +
            "GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi ON prepi.person_uuid = p.uuid " +
            "LEFT JOIN base_application_codeset bac ON bac.code=prepi.interruption_type" +
            " WHERE p.archived=?1 AND p.facility_id=?2 AND (p.first_name ILIKE ?3 " +
            "OR p.surname ILIKE ?3 OR p.other_name ILIKE ?3 " +
            "OR p.hospital_number ILIKE ?3 OR pet.unique_id ILIKE ?3) " +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display, " +
            "prepc.commencementCount, el.eligibility_count, pet.created_by, pet.unique_id, p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
            "p.other_name, p.hospital_number, p.date_of_birth, prepc.status, he.person_uuid, he.date_confirmed_hiv ", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepAndStatusBySearchParam(Integer archived, Long facilityId, String search, Pageable pageable);


    @Query(value = "SELECT prepc.commencementCount, el.eligibility_count as eligibilityCount, pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
            " p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
            "(CASE " +
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
            " LEFT JOIN (SELECT pc.id, pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, pc.duration, " +
            "(CASE " +
            "WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active' " +
            "ELSE" +
            " 'Defaulted' " +
            "END) status " +
            "FROM prep_clinic pc " +
            "WHERE pc.archived=0 " +
            "GROUP BY id, person_uuid, duration, status ) prepc ON prepc.person_uuid=p.uuid " +
            "LEFT JOIN (" +
            "SELECT pi.id, pi.person_uuid, MAX(pi.interruption_date)interruption_date , pi.interruption_type " +
            "FROM prep_interruption pi WHERE pi.archived=?1 " +
            "GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi ON prepi.person_uuid = p.uuid " +
            "LEFT JOIN base_application_codeset bac ON bac.code=prepi.interruption_type" +
            " WHERE p.archived=?1 AND p.facility_id=?2 AND p.uuid=?3" +
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display,he.person_uuid, he.date_confirmed_hiv, " +
            "prepc.commencementCount, el.eligibility_count, pet.created_by, pet.unique_id, p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
            "p.other_name, p.hospital_number, p.date_of_birth, prepc.status ", nativeQuery = true)
    Optional<PrepClient> findPersonPrepAndStatusByPatientUuid(Integer archived, Long facilityId, String personUuid);
    @Query(value = "SELECT prepc.commencementCount, el.eligibility_count as eligibilityCount, pet.created_by as createdBy, pet.unique_id as uniqueId, p.id as personId, p.first_name as firstName, p.surname as surname, p.other_name as otherName,    " +
            " p.hospital_number as hospitalNumber, CAST (EXTRACT(YEAR from AGE(NOW(),  date_of_birth)) AS INTEGER) as age,    " +
            " INITCAP(p.sex) as gender, p.date_of_birth as dateOfBirth, he.date_confirmed_hiv as dateConfirmedHiv,  " +
            " CAST (COUNT(pet.person_uuid) AS INTEGER) as prepCount,  " +
            "(CASE " +
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
            " LEFT JOIN (SELECT pc.id, pc.person_uuid, COUNT(pc.person_uuid) commencementCount, MAX(pc.encounter_date) as encounter_date, pc.duration, " +
            "(CASE " +
            "WHEN (pc.encounter_date  + pc.duration) > CAST (NOW() AS DATE) THEN 'Active' " +
            "ELSE" +
            " 'Defaulted' " +
            "END) status " +
            "FROM prep_clinic pc " +
            "WHERE pc.archived=0 " +
            "GROUP BY id, person_uuid, duration, status ) prepc ON prepc.person_uuid=p.uuid " +
            "LEFT JOIN (" +
            "SELECT pi.id, pi.person_uuid, MAX(pi.interruption_date)interruption_date , pi.interruption_type " +
            "FROM prep_interruption pi WHERE pi.archived=?1 " +
            "GROUP BY pi.id, pi.person_uuid, pi.interruption_date, pi.interruption_type )prepi ON prepi.person_uuid = p.uuid " +
            "LEFT JOIN base_application_codeset bac ON bac.code=prepi.interruption_type" +
            " WHERE p.archived=?1 AND p.facility_id=?2 "+
            " GROUP BY prepi.interruption_date, prepc.encounter_date, bac.display, " +
            "prepc.commencementCount, el.eligibility_count, pet.created_by, pet.unique_id, p.id, p.first_name, p.first_name, p.surname, pet.person_uuid, prepc.person_uuid, " +
            "p.other_name, p.hospital_number, p.date_of_birth, prepc.status, he.person_uuid, he.date_confirmed_hiv ", nativeQuery = true)
    Page<PrepClient> findAllPersonPrepAndStatus(Integer archived, Long facilityId, Pageable pageable);

    List<PrepEnrollment> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);
}
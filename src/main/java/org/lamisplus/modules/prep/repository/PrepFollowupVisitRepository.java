package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
import org.lamisplus.modules.prep.domain.entity.PrepFollowupVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepFollowupVisitRepository extends JpaRepository<PrepFollowupVisit, Long>, JpaSpecificationExecutor<PrepFollowupVisit> {
    List<PrepFollowupVisit> findAllByPersonAndIsCommencement(Person person, boolean isCommenced);
    List<PrepFollowupVisit> findAllByPersonAndIsCommencementAndArchived(Person person, Boolean isCommencement, Boolean archived);
    Integer countAllByPersonUuid(String personUuid);
    Optional<PrepFollowupVisit> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, Boolean archived);
    List<PrepFollowupVisit> findAllByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(String personUuid, Long facilityId, Boolean archived, Boolean isCommenced);
    List<PrepFollowupVisit> findAllByProphylaxisInitiationUuid(String uuid);
    List<PrepFollowupVisit> findAllByProphylaxisInitiationUuidAndArchived(String uuid, Boolean archived);
    List<PrepFollowupVisit> findTopByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(String personUuid, Long facilityId, Boolean archived, Boolean isCommenced);
    Optional<PrepFollowupVisit> findByEncounterDateAndPersonUuid(LocalDate encounterDate, String uuid);
    Optional<PrepFollowupVisit> findByEncounterDateAndPersonUuidAndIsCommencementAndArchived(LocalDate encounterDate, String uuid, Boolean isCommencement, Boolean archived);
    Optional<PrepFollowupVisit> findByUuid(String uuid);

    // CAB-LA eligibility: a patient becomes injectable-eligible after they
    // have had an initiation visit on the long-acting injectable regimen.
    // Compare on the canonical codes (Cabotegravir / Lenacapavir) since
    // `regimen_id` is now a varchar holding the codeset code, not a numeric id.
    @Query(value = "SELECT enableCab FROM (" +
            "SELECT person_uuid, p.id, regimen_id, next_appointment, encounter_date, " +
            "CASE " +
            "WHEN (?2 - encounter_date) >= 23 AND pc.regimen_id IN ('PREP_REGIMEN_CABOTEGRAVIR','PREP_REGIMEN_LENACAPAVIR') AND pc.visit_type = 'PREP_VISIT_TYPE_INITIATION' THEN true " +
            "WHEN (?2 - encounter_date) >= 53 AND pc.regimen_id IN ('PREP_REGIMEN_CABOTEGRAVIR','PREP_REGIMEN_LENACAPAVIR') AND pc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' THEN true " +
            "ELSE false END AS enableCab, " +
            "ROW_NUMBER() OVER (PARTITION BY person_uuid ORDER BY next_appointment DESC) AS rowNums " +
            "FROM prep_followup_visit pc " +
            "JOIN patient_person p ON p.uuid = pc.person_uuid " +
            "WHERE CAST(pc.archived AS BOOLEAN)=false AND p.archived=0 " +
            "AND is_commencement = false " +
            "AND regimen_id IN ('PREP_REGIMEN_CABOTEGRAVIR','PREP_REGIMEN_LENACAPAVIR') " +
            ") sub " +
            "WHERE id = ?1 AND rowNums = 1", nativeQuery = true)
    Boolean checkEnableCabaL(Long id, LocalDate currentVisitDate);

    @Query(value = "select p.id FROM prep_followup_visit pc JOIN patient_person p ON p.uuid = pc.person_uuid " +
            "where is_commencement = false AND p.id = ?1 LIMIT 1", nativeQuery = true)
    Optional<Long> checkHasClinicalVisit(Long id);

    @Query(value = "WITH RankedVisits AS (" +
            "SELECT p.id, hts.date_visit, hts.hiv_test_result, " +
            "ROW_NUMBER() OVER (PARTITION BY hts.person_uuid ORDER BY hts.date_visit DESC) AS rowNum " +
            "FROM hts_client hts JOIN patient_person p ON p.uuid = hts.person_uuid) " +
            "SELECT date_visit AS visitDate, hiv_test_result AS hivTestResult " +
            "FROM RankedVisits WHERE id = ?1 AND rowNum = 1", nativeQuery = true)
    List<PrepPreviousVisitHtsRecord> getPreviousHtsRecord(Long id);

    @Query(value = "SELECT CURRENT_DATE", nativeQuery = true)
    Optional<java.sql.Date> getCurrentDate();

    @Query(value = "SELECT COUNT(*) FROM prep_followup_visit pc WHERE pc.person_uuid = ?1 AND pc.is_commencement = true", nativeQuery = true)
    int countCommencementRecords(String personUuid);

    @Query(value = "SELECT COUNT(*) FROM prep_followup_visit pc " +
            "WHERE pc.person_uuid = ?1 AND pc.is_commencement = false " +
            "AND pc.encounter_date = (SELECT MAX(pc2.encounter_date) FROM prep_followup_visit pc2 " +
            "WHERE pc2.person_uuid = ?1 AND pc2.is_commencement = false)", nativeQuery = true)
    int countEligibleRecordsForUpdate(String personUuid);

    @Modifying
    @Query(value = "UPDATE prep_followup_visit pc SET previous_prep_status = ?2 " +
            "WHERE pc.person_uuid = ?1 AND pc.is_commencement = false " +
            "AND pc.encounter_date = (SELECT MAX(pc2.encounter_date) FROM prep_followup_visit pc2 " +
            "WHERE pc2.person_uuid = ?1 AND pc2.is_commencement = false)", nativeQuery = true)
    int updateLastEncounterPrevStatusByPersonUuid(String personUuid, String previousStatus);

    List<PrepFollowupVisit> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prep_followup_visit WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PrepFollowupVisit> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

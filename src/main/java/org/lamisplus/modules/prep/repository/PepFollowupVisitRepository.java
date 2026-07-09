package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.FollowupHtsResult;
import org.lamisplus.modules.prep.domain.entity.PepFollowupVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.lamisplus.modules.patient.domain.entity.Person;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PepFollowupVisitRepository extends JpaRepository<PepFollowupVisit, Long>, JpaSpecificationExecutor<PepFollowupVisit> {
    Optional<PepFollowupVisit> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, Boolean archived);
    List<PepFollowupVisit> findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
            String personUuid, Long facilityId, Boolean archived);
    List<PepFollowupVisit> findAllByProphylaxisInitiationUuid(String uuid);
    List<PepFollowupVisit> findAllByProphylaxisInitiationUuidAndArchived(String uuid, Boolean archived);
    Optional<PepFollowupVisit> findByEncounterDateAndPersonUuidAndArchived(
            LocalDate encounterDate, String personUuid, Boolean archived);
            
    @Query(value = "SELECT pfv.* FROM pep_followup_visit pfv " +
            "JOIN prophylaxis_initiation pi ON pi.uuid = pfv.prophylaxis_initiation_uuid " +
            "WHERE pfv.person_uuid = ?1 AND pfv.facility_id = ?2 " +
            "AND CAST(pfv.archived AS BOOLEAN) = false " +
            "AND LOWER(pi.enrollment_type) = LOWER(?3) " +
            "ORDER BY pfv.encounter_date DESC NULLS LAST, pfv.id DESC LIMIT 1",
            nativeQuery = true)
    Optional<PepFollowupVisit> findLatestByPersonUuidAndEnrollmentType(
            String personUuid, Long facilityId, String enrollmentType);

    /**
     * The first three PEP follow-up visits (chronologically) anchored to the
     * given initiation, with the HTS encounter attached to each. Drives the
     * auto-populated 1st/2nd/3rd follow-up HIV result list.
     */
    @Query(nativeQuery = true, value =
            "SELECT pfv.id AS followupId,\n" +
            "       pfv.encounter_date AS encounterDate,\n" +
            "       pfv.hts_encounter_uuid AS htsEncounterUuid,\n" +
            "       CAST(hts.observation AS text) AS htsObservation\n" +
            "FROM pep_followup_visit pfv\n" +
            "JOIN prophylaxis_initiation pi ON pi.uuid = pfv.prophylaxis_initiation_uuid\n" +
            "JOIN hts_encounter hts ON CAST(hts.uuid AS text) = pfv.hts_encounter_uuid\n" +
            "WHERE pfv.prophylaxis_initiation_uuid = :initiationUuid\n" +
            "  AND CAST(pfv.archived AS BOOLEAN) = false\n" +
            // Only HTS strictly AFTER the initiation date count — a follow-up visit
            // happens after initiation. Ordered by HTS date so the 1st row is the
            // 1st result after initiation, the 2nd the next, and so on.
            "  AND hts.date_of_visit > pi.date_enrolled\n" +
            "ORDER BY hts.date_of_visit ASC NULLS LAST, pfv.encounter_date ASC, pfv.id ASC\n" +
            "LIMIT 3")
    List<FollowupHtsResult> findFirstThreeFollowupHtsResults(
            @Param("initiationUuid") String initiationUuid);
    /** Visit date of an hts_encounter by its uuid — used to validate PEP follow-up HTS ordering. */
    @Query(nativeQuery = true, value =
            "SELECT CAST(hts.date_of_visit AS date) FROM hts_encounter hts " +
            "WHERE CAST(hts.uuid AS text) = :uuid LIMIT 1")
    java.sql.Date findHtsVisitDate(@Param("uuid") String uuid);

    /**
     * The HTS date of the latest existing (non-archived) PEP follow-up under the
     * given initiation — the value a new follow-up's HTS must come strictly after.
     */
    @Query(nativeQuery = true, value =
            "SELECT CAST(hts.date_of_visit AS date) " +
            "FROM pep_followup_visit pfv " +
            "JOIN hts_encounter hts ON CAST(hts.uuid AS text) = pfv.hts_encounter_uuid " +
            "WHERE pfv.prophylaxis_initiation_uuid = :initiationUuid " +
            "  AND CAST(pfv.archived AS BOOLEAN) = false " +
            "ORDER BY hts.date_of_visit DESC NULLS LAST, pfv.id DESC LIMIT 1")
    java.sql.Date findLatestFollowupHtsDate(@Param("initiationUuid") String initiationUuid);

    /** Latest PEP follow-up visit date for a person — the "latest visit" the discontinuation check compares against. */
    @Query(nativeQuery = true, value =
            "SELECT MAX(f.encounter_date) FROM pep_followup_visit f " +
            "WHERE CAST(f.person_uuid AS text) = :personUuid AND CAST(f.archived AS BOOLEAN) = false")
    java.sql.Date findLatestFollowupDate(@Param("personUuid") String personUuid);

    Optional<PepFollowupVisit> findByUuid(String uuid);
    Integer countAllByPersonUuid(String personUuid);
    List<PepFollowupVisit> findAllByFacilityId(Long facilityId);
    List<PepFollowupVisit> findAllByPersonAndArchived(Person person, Boolean archived);

    @Query(value = "SELECT * FROM pep_followup_visit WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PepFollowupVisit> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

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
            "LEFT JOIN hts_encounter hts ON CAST(hts.uuid AS text) = pfv.hts_encounter_uuid\n" +
            "WHERE pfv.prophylaxis_initiation_uuid = :initiationUuid\n" +
            "  AND CAST(pfv.archived AS BOOLEAN) = false\n" +
            "ORDER BY pfv.encounter_date ASC NULLS LAST, pfv.id ASC\n" +
            "LIMIT 3")
    List<FollowupHtsResult> findFirstThreeFollowupHtsResults(
            @Param("initiationUuid") String initiationUuid);
    Optional<PepFollowupVisit> findByUuid(String uuid);
    Integer countAllByPersonUuid(String personUuid);
    List<PepFollowupVisit> findAllByFacilityId(Long facilityId);
    List<PepFollowupVisit> findAllByPersonAndArchived(Person person, Boolean archived);

    @Query(value = "SELECT * FROM pep_followup_visit WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PepFollowupVisit> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

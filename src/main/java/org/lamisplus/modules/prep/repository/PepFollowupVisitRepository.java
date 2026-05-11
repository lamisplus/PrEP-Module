package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PepFollowupVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

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
    Optional<PepFollowupVisit> findByUuid(String uuid);
    Integer countAllByPersonUuid(String personUuid);
    List<PepFollowupVisit> findAllByFacilityId(Long facilityId);
    List<PepFollowupVisit> findAllByPersonAndArchived(Person person, Boolean archived);

    @Query(value = "SELECT * FROM pep_followup_visit WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PepFollowupVisit> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PepClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface PepClinicRepository extends JpaRepository<PepClinic, Long>, JpaSpecificationExecutor<PepClinic> {

    Optional<PepClinic> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    List<PepClinic> findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
            String personUuid, Long facilityId, int archived);

    List<PepClinic> findAllByPrepEnrollmentUuid(String uuid);

    Optional<PepClinic> findByEncounterDateAndPersonUuidAndArchived(
            LocalDate encounterDate, String personUuid, Integer archived);

    Optional<PepClinic> findByUuid(String uuid);

    List<PepClinic> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM pep_clinic WHERE date_modified > ?1 AND facility_id=?2",
            nativeQuery = true)
    List<PepClinic> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

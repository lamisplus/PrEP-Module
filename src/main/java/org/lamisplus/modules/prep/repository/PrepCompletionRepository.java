package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepCompletionRepository extends JpaRepository<PrepCompletion, Long>, JpaSpecificationExecutor<PrepCompletion> {
    Optional<PrepCompletion> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);
    List<PrepCompletion> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);
    List<PrepCompletion> findAllByPersonAndArchived(Person person, int archived);
    Optional<PrepCompletion> findByInterruptionDateAndPersonUuid(LocalDate interruptionDate, String personUuid);

    @Query(value = "SELECT * FROM prep_completion WHERE interruption_date = ?1 AND person_uuid = ?2 AND archived = ?3 ORDER BY id LIMIT 1", nativeQuery = true)
    Optional<PrepCompletion> findFirstByInterruptionDateAndPersonUuidAndArchived(LocalDate interruptionDate, String personUuid, int archived);

    Optional<PrepCompletion> findByInterruptionDateAndPersonUuidAndArchived(LocalDate interruptionDate, String personUuid, int archived);
    Optional<PrepCompletion> findByUuid(String uuid);
    List<PrepCompletion> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prep_completion WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PrepCompletion> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

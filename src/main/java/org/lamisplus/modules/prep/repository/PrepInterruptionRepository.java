package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepInterruption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepInterruptionRepository extends JpaRepository<PrepInterruption, Long>, JpaSpecificationExecutor<PrepInterruption> {
    Optional<PrepInterruption> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    List<PrepInterruption> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);

    List<PrepInterruption> findAllByPersonAndAndArchived(Person person, int archived);

    List<PrepInterruption> findAllByPersonAndArchived(Person person, int archived);

    Optional<PrepInterruption> findByInterruptionDateAndPersonUuid(LocalDate interruptionDate, String personUuid);

    @Query(value = "SELECT * FROM prep_interruption WHERE interruption_date = ?1 AND person_uuid = ?2 AND archived = ?3 ORDER BY id LIMIT 1", nativeQuery = true)
    Optional<PrepInterruption> findFirstByInterruptionDateAndPersonUuidAndArchived(LocalDate interruption_date, String person_uuid, int archived);

    Optional<PrepInterruption> findByInterruptionDateAndPersonUuidAndArchived(LocalDate interruptionDate, String personUuid, int archived);

    //For central sync
    List<PrepInterruption> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prep_interruption WHERE date_modified > ?1 AND facility_id=?2 ",
            nativeQuery = true
    )
    List<PrepInterruption> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);

    Optional<PrepInterruption> findByUuid(String uuid);
}
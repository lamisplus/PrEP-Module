package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.ProphylaxisInterruption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProphylaxisInterruptionRepository extends JpaRepository<ProphylaxisInterruption, Long> {
    Optional<ProphylaxisInterruption> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, Boolean archived);
    List<ProphylaxisInterruption> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, Boolean archived);
    List<ProphylaxisInterruption> findAllByPersonAndArchived(Person person, Boolean archived);
    Optional<ProphylaxisInterruption> findByUuid(String uuid);
    Optional<ProphylaxisInterruption> findFirstByInterruptionDateAndPersonUuidAndArchivedOrderByIdAsc(LocalDate interruptionDate, String personUuid, Boolean archived);
}

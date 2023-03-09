package org.lamisplus.modules.prep.repository;

import io.micrometer.core.instrument.Tags;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepInterruption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PrepInterruptionRepository extends JpaRepository<PrepInterruption, Long>, JpaSpecificationExecutor<PrepInterruption> {
    Optional<PrepInterruption> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);
    List<PrepInterruption> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);

    List<PrepInterruption> findAllByPersonAndAndArchived(Person person, int archived);

    List<PrepInterruption> findAllByPersonAndArchived(Person person, int archived);

    Optional<PrepInterruption> findByInterruptionDateAndPersonUuid(LocalDate interruptionDate, String personUuid);
}
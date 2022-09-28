package org.lamisplus.modules.hiv.repositories;

import org.lamisplus.modules.hiv.domain.entity.HIVStatusTracker;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HIVStatusTrackerRepository extends JpaRepository<HIVStatusTracker, Long>, JpaSpecificationExecutor<HIVStatusTracker> {

    List<HIVStatusTracker> findAllByPersonAndArchived(Person person, Integer archived);

    HIVStatusTracker findDistinctFirstByPersonAndStatusDate(Person person, LocalDate statusDate);
}

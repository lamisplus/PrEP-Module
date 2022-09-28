package org.lamisplus.modules.hiv.repositories;

import org.lamisplus.modules.hiv.domain.entity.Observation;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ObservationRepository extends JpaRepository<Observation, Long> {
    Optional<Observation> getAllByTypeAndPersonAndFacilityId(String type, Person person, Long facilityId);
    List<Observation> getAllByPersonAndFacilityId(Person person, Long facilityId);
    List<Observation> getAllByPersonAndArchived(Person person, Integer archived);

}

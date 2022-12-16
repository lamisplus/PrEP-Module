package org.lamisplus.modules.prep.repository;

import io.micrometer.core.instrument.Tags;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PrepClinicRepository extends JpaRepository<PrepClinic, Long>, JpaSpecificationExecutor<PrepClinic> {
    List<PrepClinic> findAllByPersonAndIsCommencement(Person person, boolean isCommenced);

    List<PrepClinic> findAllByPersonAndIsCommencementAndArchived(Person person, Boolean isCommencement, int archived);

    Integer countAllByPersonUuid(String personUuid);

    Optional<PrepClinic> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);
}
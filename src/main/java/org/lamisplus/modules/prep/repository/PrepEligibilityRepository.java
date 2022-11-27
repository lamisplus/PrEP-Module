package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.dto.PrepEligibilityDto;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PrepEligibilityRepository extends JpaRepository<PrepEligibility, Long>, JpaSpecificationExecutor<PrepEligibility> {
    Optional<PrepEligibility> findByUuid(String eligibilityUuid);

    List<PrepEligibility> findAllByUuid(String uuid);

    List<PrepEligibility> findAllByPersonUuid(String uuid);
}
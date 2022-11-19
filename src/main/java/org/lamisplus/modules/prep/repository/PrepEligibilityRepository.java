package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PrepEligibilityRepository extends JpaRepository<PrepEligibility, Long>, JpaSpecificationExecutor<PrepEligibility> {
    Optional<PrepEligibility> findByUuid(String eligibilityUuid);
}
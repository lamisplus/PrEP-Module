package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PrepInterruption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PrepInterruptionRepository extends JpaRepository<PrepInterruption, Long>, JpaSpecificationExecutor<PrepInterruption> {
}
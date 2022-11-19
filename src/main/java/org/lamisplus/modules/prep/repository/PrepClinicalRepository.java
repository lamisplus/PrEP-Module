package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PrepClinical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PrepClinicalRepository extends JpaRepository<PrepClinical, Long>, JpaSpecificationExecutor<PrepClinical> {
}
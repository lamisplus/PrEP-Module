package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PrepRegimen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrepRegimenRepository extends JpaRepository<PrepRegimen, Long> {
    List<PrepRegimen> findAllByPrepType(String prepType);
}
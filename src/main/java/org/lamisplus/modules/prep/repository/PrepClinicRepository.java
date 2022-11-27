package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PrepClinicRepository extends JpaRepository<PrepClinic, Long>, JpaSpecificationExecutor<PrepClinic> {
    List<PrepClinic> findAllByPersonAndIsCommencement(Person person, boolean isCommenced);
}
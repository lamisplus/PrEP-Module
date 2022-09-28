package org.lamisplus.modules.hiv.repositories;

import org.lamisplus.modules.hiv.domain.entity.PatientTracker;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;

public interface PatientTrackerRepository extends JpaRepository<PatientTracker, Long> {
	List<PatientTracker> getPatientTrackerByPerson(Person patient);
}

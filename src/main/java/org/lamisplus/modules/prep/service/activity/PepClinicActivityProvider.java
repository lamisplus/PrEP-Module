package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PepFollowupVisit;
import org.lamisplus.modules.prep.repository.PepFollowupVisitRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PepClinicActivityProvider implements PatientActivityProvider {

	private final PepFollowupVisitRepository pepFollowupVisitRepository;

	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return pepFollowupVisitRepository.findAllByPersonAndArchived(person, 0)
				.stream()
				.filter(v -> v.getIsCommencement() == null || !v.getIsCommencement())
				.map(this::buildPatientActivity)
				.collect(Collectors.toList());
	}

	@NotNull
	private PatientActivity buildPatientActivity(PepFollowupVisit pepClinic) {
		String name = "PEP Clinic";
		assert pepClinic.getId() != null;
		return new PatientActivity(pepClinic.getId(), name, pepClinic.getEncounterDate(), "", "pep-followup-visit");
	}
}

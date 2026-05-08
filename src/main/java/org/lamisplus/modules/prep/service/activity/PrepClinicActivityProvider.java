package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepFollowupVisit;
import org.lamisplus.modules.prep.repository.PrepFollowupVisitRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepClinicActivityProvider implements PatientActivityProvider {
	
	private final PrepFollowupVisitRepository prepFollowupVisitRepository;
	
	
	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return prepFollowupVisitRepository.findAllByPersonAndIsCommencementAndArchived(person, false, false)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}
	
	@NotNull
	private PatientActivity buildPatientActivity(PrepFollowupVisit prepClinic) {
		String name = "Prep Clinic";
		assert prepClinic.getId() != null;
		return new PatientActivity(prepClinic.getId(), name, prepClinic.getEncounterDate(), "", "prep-followup-visit");
	}
}

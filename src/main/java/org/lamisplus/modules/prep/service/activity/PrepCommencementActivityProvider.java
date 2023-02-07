package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepCommencementActivityProvider implements PatientActivityProvider {
	
	private final PrepClinicRepository prepClinicRepository;
	
	
	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return prepClinicRepository.findAllByPersonAndIsCommencementAndArchived(person, true, 0)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}
	
	@NotNull
	private PatientActivity buildPatientActivity(PrepClinic prepClinic) {
		String name = "Prep Commencement";
		assert prepClinic.getId() != null;
		return new PatientActivity(prepClinic.getId(), name, prepClinic.getEncounterDate(), "", "prep-commencement");
	}
}

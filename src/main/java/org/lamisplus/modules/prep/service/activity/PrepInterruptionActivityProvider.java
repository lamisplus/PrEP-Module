package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepCompletion;
import org.lamisplus.modules.prep.repository.PrepCompletionRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepInterruptionActivityProvider implements PatientActivityProvider {
	private final PrepCompletionRepository interruptionRepository;
	
	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return interruptionRepository.findAllByPersonAndArchived(person, 0)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}
	
	@NotNull
	private PatientActivity buildPatientActivity(PrepCompletion interruption) {
		String name = "Prep interruption & Discontinuation";
		assert interruption.getId() != null;
		return new PatientActivity(interruption.getId(), name, interruption.getInterruptionDate(), "", "prep-completion");
	}
}

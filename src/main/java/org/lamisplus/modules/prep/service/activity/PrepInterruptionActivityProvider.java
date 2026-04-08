package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.domain.entity.ProphylaxisInterruption;
import org.lamisplus.modules.prep.repository.ProphylaxisInterruptionRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepInterruptionActivityProvider implements PatientActivityProvider {
	private final ProphylaxisInterruptionRepository interruptionRepository;

	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return interruptionRepository.findAllByPersonAndArchived(person, 0)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}

	@NotNull
	private PatientActivity buildPatientActivity(ProphylaxisInterruption interruption) {
		String name;
		// Prefer the stored enrollmentType (set when the form was saved); fall back to the joined initiation
		String type = interruption.getEnrollmentType();
		if (type == null || type.isEmpty()) {
			PrepPepInitiation initiation = interruption.getPrepPepInitiation();
			type = initiation != null ? initiation.getEnrollmentType() : null;
		}
		if ("PEP".equals(type)) {
			name = "PEP Completion";
		} else {
			name = "PrEP Discontinuation/Interruption";
		}
		assert interruption.getId() != null;
		return new PatientActivity(interruption.getId(), name, interruption.getInterruptionDate(), "", "prep-completion");
	}
}

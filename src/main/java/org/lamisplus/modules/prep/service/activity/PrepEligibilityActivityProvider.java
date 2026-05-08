package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepEligibilityScreening;
import org.lamisplus.modules.prep.repository.PrepEligibilityScreeningRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepEligibilityActivityProvider implements PatientActivityProvider {
	private final PrepEligibilityScreeningRepository eligibilityRepository;

	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return eligibilityRepository.findAllByPersonAndArchived(person, false)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}
	
	@NotNull
	private PatientActivity buildPatientActivity(PrepEligibilityScreening prepEligibility) {
		String category = prepEligibility.getCategory();
		String name = "PEP".equals(category) ? "PEP Eligibility Screening" : "PrEP Eligibility Screening";
		assert prepEligibility.getId() != null;
		return new PatientActivity(prepEligibility.getId(), name, prepEligibility.getVisitDate(), "", "prep-eligibility-screening");
	}
}

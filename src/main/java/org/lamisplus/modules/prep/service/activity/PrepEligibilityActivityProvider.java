package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityDto;
import org.lamisplus.modules.prep.domain.dto.PrepEnrollmentDto;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepEligibilityActivityProvider implements PatientActivityProvider {
	private final PrepEligibilityRepository eligibilityRepository;

	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return eligibilityRepository.findAllByPersonAndArchived(person, 0)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}
	
	@NotNull
	private PatientActivity buildPatientActivity(PrepEligibility prepEligibility) {
		String name = "Prep Eligibility";
		assert prepEligibility.getId() != null;
		return new PatientActivity(prepEligibility.getId(), name, prepEligibility.getVisitDate(), "", "prep-eligibility");
	}
}

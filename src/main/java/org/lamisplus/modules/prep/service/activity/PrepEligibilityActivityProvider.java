package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepEligibilityScreening;
import org.lamisplus.modules.prep.repository.PrepEligibilityScreeningRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.lamisplus.modules.prep.util.EnrollmentType;
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
		// `category` stores the canonical PREP_PEP_ENROLLMENT_TYPE code; older rows
		// may still carry the short "PEP" / "PrEP" label, so check both forms.
		String category = prepEligibility.getCategory();
		boolean isPep = "PEP".equalsIgnoreCase(category) || EnrollmentType.isPep(category);
		String name = isPep ? "PEP Eligibility Screening" : "PrEP Eligibility Screening";
		assert prepEligibility.getId() != null;
		return new PatientActivity(prepEligibility.getId(), name, prepEligibility.getVisitDate(), "", "prep-eligibility-screening");
	}
}

package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepEligibilityScreening;
import org.lamisplus.modules.prep.repository.PrepEligibilityScreeningRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepEligibilityActivityProvider implements PatientActivityProvider {
	private final PrepEligibilityScreeningRepository eligibilityRepository;

	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return eligibilityRepository.findAllByPersonAndArchived(person, false)
				.stream().map(this::buildPatientActivity)
				.filter(Objects::nonNull).collect(Collectors.toList());
	}

	private PatientActivity buildPatientActivity(PrepEligibilityScreening prepEligibility) {
		// `category` stores the canonical PREP_PEP_ENROLLMENT_TYPE code; older rows
		// may still carry the short "PEP" / "PrEP" label, so check both forms.
		String category = prepEligibility.getCategory();
		boolean isPep = "PEP".equalsIgnoreCase(category) || EnrollmentType.isPep(category);
		String name = isPep ? "PEP Eligibility Screening" : "PrEP Eligibility Screening";
		assert prepEligibility.getId() != null;
		// Migrated rows may have a null visit_date; fall back to dateCreated.
		LocalDate date = PatientActivityProvider.resolveActivityDate(
				prepEligibility.getVisitDate(), prepEligibility.getDateCreated());
		if (date == null) {
			return null;
		}
		return new PatientActivity(prepEligibility.getId(), name, date, "", "prep-eligibility-screening");
	}
}

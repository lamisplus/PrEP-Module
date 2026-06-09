package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepEnrollmentActivityProvider implements PatientActivityProvider {

	private final PrepPepInitiationRepository prepPepInitiationRepository;


	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return prepPepInitiationRepository.findAllByPersonAndArchived(person, false)
				.stream().map(this::buildPatientActivity)
				.filter(Objects::nonNull).collect(Collectors.toList());
	}

	private PatientActivity buildPatientActivity(PrepPepInitiation prepEnrollment) {
		// `type` is either the short legacy label ("PEP" / "PrEP") or the
		// canonical codeset code (PREP_PEP_ENROLLMENT_TYPE_PEP / _PREP). Both
		// must map to the same activity name on the History tab.
		String type = prepEnrollment.getEnrollmentType();
		boolean isPep = "PEP".equalsIgnoreCase(type) || EnrollmentType.isPep(type);
		String name = isPep ? "PEP Initiation" : "PrEP Initiation";
		assert prepEnrollment.getId() != null;
		// Migrated rows may have a null date_enrolled; fall back to dateCreated.
		LocalDate date = PatientActivityProvider.resolveActivityDate(
				prepEnrollment.getDateEnrolled(), prepEnrollment.getDateCreated());
		if (date == null) {
			return null;
		}
		return new PatientActivity(prepEnrollment.getId(), name, date, "", "prep-pep-initiation");
	}
}

package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.domain.entity.ProphylaxisInterruption;
import org.lamisplus.modules.prep.repository.ProphylaxisInterruptionRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepInterruptionActivityProvider implements PatientActivityProvider {
	private final ProphylaxisInterruptionRepository interruptionRepository;

	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return interruptionRepository.findAllByPersonAndArchived(person, false)
				.stream()
				.map(this::buildPatientActivity)
				.filter(Objects::nonNull)
				.collect(Collectors.toList());
	}

	private PatientActivity buildPatientActivity(ProphylaxisInterruption interruption) {
		String name;
		// Prefer the stored enrollmentType (set when the form was saved); fall back to the joined initiation
		String type = interruption.getEnrollmentType();
		if (type == null || type.isEmpty()) {
			PrepPepInitiation initiation = interruption.getPrepPepInitiation();
			type = initiation != null ? initiation.getEnrollmentType() : null;
		}
		// `type` can be either the short label ("PEP" / "PrEP") from legacy
		// records or the canonical codeset code (PREP_PEP_ENROLLMENT_TYPE_PEP
		// / _PREP) saved by the current form. Route both through EnrollmentType
		// so the activity label is always correct on the History tab.
		if ("PEP".equalsIgnoreCase(type) || EnrollmentType.isPep(type)) {
			name = "PEP Completion";
		} else {
			name = "PrEP Discontinuation/Interruption";
		}
		// PEP completion may not set interruptionDate; fall back to
		// followUpVisitDate, then to dateCreated for migrated rows that have
		// neither (previously these were dropped from the timeline entirely).
		LocalDate clinicalDate = interruption.getInterruptionDate() != null
				? interruption.getInterruptionDate()
				: interruption.getFollowUpVisitDate();
		LocalDate date = PatientActivityProvider.resolveActivityDate(
				clinicalDate, interruption.getDateCreated());
		if (date == null) {
			return null;
		}
		assert interruption.getId() != null;
		return new PatientActivity(interruption.getId(), name, date, "", "prep-completion");
	}
}

package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepFollowupVisit;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PrepFollowupVisitRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepClinicActivityProvider implements PatientActivityProvider {
	
	private final PrepFollowupVisitRepository prepFollowupVisitRepository;
	
	
	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return prepFollowupVisitRepository.findAllByPersonAndIsCommencementAndArchived(person, false, false)
				.stream().map(this::buildPatientActivity)
				.filter(Objects::nonNull).collect(Collectors.toList());
	}

	private PatientActivity buildPatientActivity(PrepFollowupVisit prepClinic) {
		// Discriminate label by the linked initiation's enrollment_type so PEP
		// follow-up visits show as "PEP Clinic" rather than the generic "Prep Clinic".
		PrepPepInitiation init = prepClinic.getPrepPepInitiation();
		String enrollmentType = init != null ? init.getEnrollmentType() : null;
		String name = EnrollmentType.isPep(enrollmentType) ? "PEP Clinic" : "Prep Clinic";
		assert prepClinic.getId() != null;
		// Migrated rows may have a null encounter_date; fall back to dateCreated.
		LocalDate date = PatientActivityProvider.resolveActivityDate(
				prepClinic.getEncounterDate(), prepClinic.getDateCreated());
		if (date == null) {
			return null;
		}
		return new PatientActivity(prepClinic.getId(), name, date, "", "prep-followup-visit");
	}
}

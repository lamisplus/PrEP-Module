package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PrepEnrollmentActivityProvider implements PatientActivityProvider {
	
	private final PrepEnrollmentRepository prepEnrollmentRepository;
	
	
	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return prepEnrollmentRepository.findAllByPersonAndArchived(person, 0)
				.stream().map(this::buildPatientActivity).collect(Collectors.toList());
	}
	
	@NotNull
	private PatientActivity buildPatientActivity(PrepEnrollment prepEnrollment) {
		String name = "Prep Enrollment";
		assert prepEnrollment.getId() != null;
		return new PatientActivity(prepEnrollment.getId(), name, prepEnrollment.getDateEnrolled(), "", "prep-enrollment");
	}
}

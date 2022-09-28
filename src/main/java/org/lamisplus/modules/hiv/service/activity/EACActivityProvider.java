package org.lamisplus.modules.hiv.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hiv.domain.dto.PatientActivity;
import org.lamisplus.modules.hiv.service.PatientActivityProvider;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EACActivityProvider implements PatientActivityProvider {
	
	
	@Override
	public List<PatientActivity> getActivitiesFor(Person person) {
		return new ArrayList<>();
	}
}

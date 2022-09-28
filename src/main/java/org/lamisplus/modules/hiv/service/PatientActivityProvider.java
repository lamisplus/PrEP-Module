package org.lamisplus.modules.hiv.service;

import com.foreach.across.core.annotations.Exposed;
import org.lamisplus.modules.hiv.domain.dto.PatientActivity;
import org.lamisplus.modules.patient.domain.entity.Person;

import java.util.List;

@Exposed
public interface PatientActivityProvider {
    List<PatientActivity> getActivitiesFor(Person person);
}

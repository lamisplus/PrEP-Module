package org.lamisplus.modules.prep.service;

import com.foreach.across.core.annotations.Exposed;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.patient.domain.entity.Person;

import java.util.List;

@Exposed
public interface PatientActivityProvider {
    List<PatientActivity> getActivitiesFor(Person person);
}

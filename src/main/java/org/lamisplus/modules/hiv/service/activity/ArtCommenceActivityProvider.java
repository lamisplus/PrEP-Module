package org.lamisplus.modules.hiv.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hiv.domain.dto.PatientActivity;
import org.lamisplus.modules.hiv.domain.entity.ARTClinical;
import org.lamisplus.modules.hiv.repositories.ARTClinicalRepository;
import org.lamisplus.modules.hiv.service.PatientActivityProvider;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ArtCommenceActivityProvider implements PatientActivityProvider {
    private final ARTClinicalRepository artClinicalRepository;

    @Override
    public List<PatientActivity> getActivitiesFor(Person person) {
        Optional<ARTClinical> artCommencement = artClinicalRepository.findByPersonAndIsCommencementIsTrueAndArchived (person, 0);
        String name = "ART Commencement";
        PatientActivity patientActivity = artCommencement
                .map (artPharmacy -> new PatientActivity (artPharmacy.getId (), name, artPharmacy.getVisitDate (), "", "Art-commence")).orElse (null);
        ArrayList<PatientActivity> patientActivities = new ArrayList<> ();
        patientActivities.add (patientActivity);
        return patientActivities;
    }
}

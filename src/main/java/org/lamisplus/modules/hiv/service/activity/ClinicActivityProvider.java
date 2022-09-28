package org.lamisplus.modules.hiv.service.activity;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.hiv.domain.dto.PatientActivity;
import org.lamisplus.modules.hiv.domain.entity.ARTClinical;
import org.lamisplus.modules.hiv.repositories.ARTClinicalRepository;
import org.lamisplus.modules.hiv.service.PatientActivityProvider;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ClinicActivityProvider implements PatientActivityProvider {

    private final ARTClinicalRepository artClinicalRepository;

        @Override
        public List<PatientActivity> getActivitiesFor(Person person) {
            List<ARTClinical> clinicVisits = artClinicalRepository.findAllByPersonAndIsCommencementIsFalseAndArchived (person, 0);
            String name = "Clinic visit follow up";
            return clinicVisits.stream ()
                    .map (artPharmacy ->  new PatientActivity (artPharmacy.getId (), name, artPharmacy.getVisitDate (), "", "clinic-visit"))
                    .collect(Collectors.toList());
        }
}

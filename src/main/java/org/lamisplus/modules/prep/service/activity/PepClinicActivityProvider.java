package org.lamisplus.modules.prep.service.activity;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.prep.domain.entity.PepFollowupVisit;
import org.lamisplus.modules.prep.repository.PepFollowupVisitRepository;
import org.lamisplus.modules.prep.service.PatientActivityProvider;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Surfaces PEP follow-up visits in the dashboard's Recent Activities + History.
 * PrEP visits already surface via {@link PrepClinicActivityProvider} (which
 * reads from {@code prep_followup_visit}); PEP visits live in the dedicated
 * {@code pep_followup_visit} table and were missing from the activity feed.
 */
@Component
@RequiredArgsConstructor
public class PepClinicActivityProvider implements PatientActivityProvider {

    private final PepFollowupVisitRepository pepFollowupVisitRepository;

    @Override
    public List<PatientActivity> getActivitiesFor(Person person) {
        return pepFollowupVisitRepository.findAllByPersonAndArchived(person, false)
                .stream()
                .map(this::buildPatientActivity)
                .collect(Collectors.toList());
    }

    @NotNull
    private PatientActivity buildPatientActivity(PepFollowupVisit visit) {
        assert visit.getId() != null;
        return new PatientActivity(
                visit.getId(),
                "PEP Clinic",
                visit.getEncounterDate(),
                "",
                "pep-followup-visit");
    }
}

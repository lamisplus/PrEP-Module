package org.lamisplus.modules.prep.service;

import com.foreach.across.core.annotations.Exposed;
import org.lamisplus.modules.prep.domain.dto.PatientActivity;
import org.lamisplus.modules.patient.domain.entity.Person;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Exposed
public interface PatientActivityProvider {
    List<PatientActivity> getActivitiesFor(Person person);

    /**
     * Resolve a non-null activity date for the timeline. {@link PatientActivity}
     * requires a non-null {@code date} (it is sorted/grouped by date), but
     * records migrated from the old PrEP tables often have null clinical dates
     * (date_enrolled / encounter_date / visit_date), which previously crashed
     * the whole recent-history response with a NullPointerException.
     *
     * <p>We prefer the clinical date, fall back to the audit {@code dateCreated}
     * so the migrated record still appears, and return {@code null} only when
     * neither is available — providers must filter those out rather than
     * constructing a {@link PatientActivity} with a null date.
     */
    static LocalDate resolveActivityDate(LocalDate primary, LocalDateTime createdFallback) {
        if (primary != null) {
            return primary;
        }
        if (createdFallback != null) {
            return createdFallback.toLocalDate();
        }
        return null;
    }
}

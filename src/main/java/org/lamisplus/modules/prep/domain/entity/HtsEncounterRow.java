package org.lamisplus.modules.prep.domain.entity;

import java.time.LocalDate;

/**
 * Spring Data projection for a single row of {@code hts_encounter}, used when
 * a PrEP form needs to rehydrate the HTS values it once linked via
 * {@code hts_encounter_uuid}. JSON-typed columns are exposed as text and parsed in the
 * service layer.
 */
public interface HtsEncounterRow {
    Long getId();
    String getUuid();
    Long getPatientId();
    String getPatientUuid();
    String getClientCode();
    LocalDate getDateOfVisit();
    String getSetting();
    String getObservation();
    Long getFacilityId();
}

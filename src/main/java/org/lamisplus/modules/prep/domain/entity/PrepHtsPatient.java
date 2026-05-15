package org.lamisplus.modules.prep.domain.entity;

import java.time.LocalDate;

public interface PrepHtsPatient extends PrepClient {

    String getHtsClientCode();

    Long getLatestHtsId();

    String getLatestHtsUuid();

    Long getLatestHtsPatientId();

    String getLatestHtsPatientUuid();

    LocalDate getLatestHtsDateOfVisit();

    String getLatestHtsSetting();

    String getLatestHtsObservation();

    Long getLatestHtsFacilityId();

    Integer getEnrollmentCount();

    String getPregnancyStatusDisplay();

    /**
     * True when the patient's latest HTS encounter has
     * {@code typeOfHivTestDone = TYPE_OF_HIV_TEST_HIV_EARLY_DETECT} and the
     * {@code hivEarlyDetectResult} is antigen-only or antigen + antibody
     * reactive — both clinically indicative of acute infection, in which case
     * PrEP is contra-indicated and only PEP may be initiated.
     */
    Boolean getPepOnly();
}

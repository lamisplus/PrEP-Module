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
}

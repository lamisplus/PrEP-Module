package org.lamisplus.modules.prep.domain.entity;

import java.time.LocalDate;

public interface PrepClient {
    Long getPersonId();
    String getFirstName();
    String getSurname();
    String getOtherName();
    String getHospitalNumber();
    Integer getAge();
    String getGender();
    LocalDate getDateOfBirth();
    String getPrepCount();
    String getPrepStatus();
    String getUniqueId();
    LocalDate getDateConfirmedHiv();
    String getCreatedBy();
    Integer getEligibilityCount();
    Integer getCommencementCount();
    LocalDate getDateOfRegistration();
}

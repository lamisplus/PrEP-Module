package org.lamisplus.modules.prep.domain.entity;

import java.time.LocalDate;

public interface PrepClient {
    Long getPersonId();

    String getFirstName();

    String getSendCabLaAlert();

    String getPersonUuid();

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

    String getPhoneNumber();

    String getAddress();

    String getHIVResultAtVisit();

    String getPreviousProphylaxis();

    /**
     * Reflects {@code prophylaxis_initiation.is_interrupted}. When true, the
     * patient's most recent enrollment on the relevant arm has been flagged
     * as interrupted (Stopped / Dead / Seroconverted / Transfer out / …) and
     * the status column resolves to the interruption type's codeset display.
     */
    Boolean getIsInterrupted();
}

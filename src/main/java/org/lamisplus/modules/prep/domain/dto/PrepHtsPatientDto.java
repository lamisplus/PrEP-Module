package org.lamisplus.modules.prep.domain.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PrepHtsPatientDto {
    private Long personId;
    private String personUuid;
    private String firstName;
    private String surname;
    private String otherName;
    private String hospitalNumber;
    private Integer age;
    private String gender;
    private LocalDate dateOfBirth;
    private String prepCount;
    private String prepStatus;
    private Integer eligibilityCount;
    private Integer enrollmentCount;
    private LocalDate dateOfRegistration;
    private String phoneNumber;
    private String address;
    private String previousProphylaxis;
    private String sendCabLaAlert;
    private String pregnancyStatusDisplay;
    private Boolean isInterrupted;
    /**
     * True when the linked HTS encounter restricts the patient to PEP only
     * (early-detect test type + antigen-reactive marker). Drives the Patient
     * tab "Enroll" modal to hide / disable the PrEP option.
     */
    private Boolean pepOnly;

    /**
     * True when the patient is currently active on PrEP / PEP respectively (their
     * latest initiation of that arm is not interrupted, after PEP auto-expiry).
     * Returned on every grid row so the Patient List "Enroll" modal can decide
     * the blocked arm WITHOUT a per-row {@code prep/persons/{id}} call.
     */
    private Boolean isCurrentStatusInterruptedPrep;
    private Boolean isCurrentStatusInterruptedPep;

    private String htsClientCode;
    private LatestHtsResultDto latestHtsResult;
}

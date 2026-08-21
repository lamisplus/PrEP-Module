package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PepFollowupVisitDto implements Serializable {
    private Long id;
    private LocalDate dateInitialAdherenceCounseling;
    private Double weight;
    private Double height;
    private String htsEncounterUuid;
    private String prophylaxisInitiationUuid;
    private String regimenId;
    private Long personId;
    private LocalDate nextAppointment;
    private LocalDate encounterDate;
    private Boolean isCommencement;
    private LocalDate datePrepStart;
    private Double pulse;
    private Double respiratoryRate;
    private Double temperature;
    private Double systolic;
    private Double diastolic;
    private String adherenceLevel;
    private Boolean stiScreening;
    private LocalDate datePrepGiven;
    private Object urinalysis;
    private Object syndromicStiScreening;
    private String syndromicScreening;
    private String riskReductionServices;
    private String healthCareWorkerSignature;
    private Integer duration;
    private String otherPrepGiven;
    private String otherPrepType;
    private String otherRegimenId;
    private String prepDistributionSetting;
    private String prepType;
    private String populationType;
    private String reasonForSwitch;
    private String wasPrepAdministered;
    /** Refill supply in DAYS. Replaces the ambiguous monthsOfRefill/duration pair. */
    private Integer refillDays;
    private String previousPrepStatus;
    private String whyAdherenceLevelPoor;
    private String otherReasonForPoorFairAdherence;
    private String otherSyndromicStiScreening;
    // PEP-specific fields
    private String modeOfExposure;
    private String durationBeforePep;
    private String hivStatusAtExposure;
    private Object pepNotedSideEffects;
    private String pepRegimen;
    private LocalDate dateStartPep;
    private LocalDate dateStopPep;
    private Object followupHivTestResults;
}

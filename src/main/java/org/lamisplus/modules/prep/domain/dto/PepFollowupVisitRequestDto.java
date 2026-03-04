package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PepFollowupVisitRequestDto implements Serializable {
    private LocalDate dateInitialAdherenceCounseling;
    private Double weight;
    private Double height;
    private String pregnant;
    private String prepEnrollmentUuid;
    private Long regimenId;
    private String urinalysisResult;
    private Boolean referred;
    private LocalDate dateReferred;
    private Long personId;
    private LocalDate nextAppointment;
    private LocalDate encounterDate;
    private Object extra;
    private LocalDate datePrepStart;
    private Double pulse;
    private Double respiratoryRate;
    private Double temperature;
    private Double systolic;
    private Double diastolic;
    private String adherenceLevel;
    private Boolean stiScreening;
    private Boolean why;
    private LocalDate datePrepGiven;
    private Object urinalysis;
    private Object creatinine;
    private String creatinineResult;
    private Object hepatitis;
    private Object syphilis;
    private Object otherTestsDone;
    private Object syndromicStiScreening;
    private String syndromicScreening;
    private String riskReductionServices;
    private String notedSideEffects;
    private Object prepNotedSideEffects;
    private String healthCareWorkerSignature;
    private Integer duration;
    private String prepGiven;
    private String otherPrepGiven;
    private String otherPrepType;
    private String otherRegimenId;
    private String prepDistributionSetting;
    private String familyPlanning;
    private LocalDate dateOfFamilyPlanning;
    private String otherDrugs;
    private String hivTestResult;
    private String prepType;
    private String populationType;
    private String visitType;
    private LocalDate dateLiverFunctionTestResults;
    private Object liverFunctionTestResults;
    private String reasonForSwitch;
    private String wasPrepAdministered;
    private String historyOfDrugToDrugInteraction;
    private String historyOfDrugAllergies;
    private LocalDate hivTestResultDate;
    private Integer monthsOfRefill;
    private String comment;
    private String previousPrepStatus;
    private String whyAdherenceLevelPoor;
    private String otherReasonForPoorFairAdherence;
    private String otherNotedSideEffects;
    private String otherSyndromicStiScreening;
    // PEP-specific fields
    private String modeOfExposure;
    private String durationBeforePep;
    private String hivStatusAtExposure;
    private Object pepNotedSideEffects;
    private String pepRegimen;
    private String otherPepRegimen;
    private LocalDate dateStartPep;
    private LocalDate dateStopPep;
    private Object followupHivTestResults;
}

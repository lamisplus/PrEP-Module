package org.lamisplus.modules.prep.domain.dto;


import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;


/**
 * DTO shared between two save paths that both write a "clinic visit":
 *   * the legacy {@code /api/v1/prep-clinic} endpoint (PrepClinicService → PrepClinic entity)
 *   * the new commencement / clinic mappers on PrepService that write the
 *     PrepFollowupVisit entity (prep_followup_visit table).
 *
 * Fields used only by the legacy PrepClinic entity stay on this DTO so the
 * legacy endpoint keeps compiling — the PrepFollowupVisit mappers on
 * PrepService simply don't reference them anymore.
 */
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepClinicDto implements Serializable {

    private Long id;

    private LocalDate dateInitialAdherenceCounseling;

    private Double weight;

    private Double height;

    private String htsEncounterUuid;

    private String prepEnrollmentUuid;

    private long regimenId;

    private String urinalysisResult;

    private Boolean referred;

    private LocalDate dateReferred;

    private Long personId;

    private LocalDate nextAppointment;

    private Boolean isCommencement;

    private LocalDate datePrepStart;

    private LocalDate encounterDate;

    //For clinic
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

    private Integer duration;

    private String otherPrepGiven;
    private String otherPrepType;
    private String otherRegimenId;
    private String prepGiven;
    private String prepDistributionSetting;
    private String familyPlanning;
    private LocalDate dateOfFamilyPlanning;
    private String otherDrugs;
    private String prepType;
    private String populationType;
    private String visitType;
    private String healthCareWorkerSignature;
    private LocalDate dateLiverFunctionTestResults;
    private Object liverFunctionTestResults;
    private Object prepNotedSideEffects;
    private String reasonForSwitch;
    private String wasPrepAdministered;

    private String historyOfDrugToDrugInteraction;
    private String historyOfDrugAllergies;
    private Integer monthsOfRefill;
    private String comment;
    private String previousPrepStatus;
    private String whyAdherenceLevelPoor;
    private String otherReasonForPoorFairAdherence;
    private String otherNotedSideEffects;
    private String otherSyndromicStiScreening;
}

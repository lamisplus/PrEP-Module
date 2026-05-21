package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepFollowupVisitDto implements Serializable {
    private Long id;
    private Double weight;
    private Double height;
    private String htsEncounterUuid;
    private String prophylaxisInitiationUuid;
    private Long regimenId;
    private Long regimenTypeId;
    private Long personId;
    private LocalDate nextAppointment;
    private LocalDate encounterDate;
    private Boolean isCommencement;
    private Double pulse;
    private Double respiratoryRate;
    private Double temperature;
    private Double systolic;
    private Double diastolic;
    private String adherenceLevel;
    private Boolean stiScreening;
    private Object urinalysis;
    private Object hepatitis;
    private Object syphilis;
    private Object otherTestsDone;
    private Object syndromicStiScreening;
    private String riskReductionServices;
    private Object prepNotedSideEffects;
    private String healthCareWorkerSignature;
    private Integer duration;
    private String regimen;
    private String otherRegimenId;
    private Integer visitCount;
    private String otherDrugs;
    private String prepType;
    private String populationType;
    private String visitType;
    private String reasonForSwitch;
    private Integer monthsOfRefill;
    private String previousPrepStatus;
    private String whyAdherenceLevelPoor;
    private String otherReasonForPoorFairAdherence;
    private String otherNotedSideEffects;
    private String otherSyndromicStiScreening;
}

package org.lamisplus.modules.prep.domain.dto;


import lombok.*;
import org.codehaus.jackson.JsonNode;
import org.hibernate.annotations.Type;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.FetchType;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;


@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepClinicDto implements Serializable{

    private Long id;

    private LocalDate  dateInitialAdherenceCounseling;

    private Double weight;

    private Double height;

    private String pregnant;

    private String prepEnrollmentUuid;

    private long regimenId;

    private long regimenTypeId;

    private String urinalysisResult;

    private Boolean referred;

    private LocalDate dateReferred;

    private Long personId;

    private LocalDate nextAppointment;

    private Object extra;

    //private String status;

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

    private Object hepatitis;

    private Object syphilis;

    private Object otherTestsDone;

    private Object syndromicStiScreening ;

    private String riskReductionServices;

    private String notedSideEffects;

    private Integer duration;

    private String regimen;
    private String otherPrepGiven;
    private String otherPrepType;
    private String otherRegimenId;
    private int visitCount;

    private String prepGiven;
    private String prepDistributionSetting;
    private String familyPlanning;
    private LocalDate dateOfFamilyPlanning;
    private String otherDrugs;
    private String hivTestResult;
    private String prepType;
    private String populationType;
    private String visitType;
    private String healthCareWorkerSignature;
    private LocalDate dateLiverFunctionTestResults;
    private JsonNode liverFunctionTestResults;
    private String reasonForSwitch;
    private String wasPrepAdministered;

    private String historyOfDrugToDrugInteraction;
    private String historyOfDrugAllergies;
    private LocalDate hivTestResultDate;
    private Integer monthsOfRefill;

}


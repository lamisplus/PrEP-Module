package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepPepInitiationRequestDto implements Serializable {
    private Long personId;
    private String uniqueId;
    private String prepEligibilityUuid;
    private LocalDate dateEnrolled;
    private LocalDate dateReferred;
    private String riskType;
    private Object extra;
    private String supporterName;
    private String supporterRelationshipType;
    private String supporterPhone;
    private String ancUniqueArtNo;
    private String hivTestingPoint;
    private LocalDate dateOfLastHivNegativeTest;
    private String targetGroup;
    private String enrollmentType;
    private String populationType;
    private Double weight;
    private Double height;
    private String pregnancyStatus;
    private String historyOfDrugAllergies;
    private String historyOfDrugToDrugInteraction;
    private String urinalysisResult;
    private Object liverFunctionTestResults;
    private LocalDate dateOfHivTest;
    private String resultOfHivTest;
    private LocalDate dateOfInitialAdherenceCounseling;
    private LocalDate datePrepStarted;
    private String prepTypeAtStart;
    private String prepTypeAtStartOthersSpecify;
    private String prepRegimen;
    private Integer monthsOfRefill;
    private String hivTestingPointOthersSpecify;
}

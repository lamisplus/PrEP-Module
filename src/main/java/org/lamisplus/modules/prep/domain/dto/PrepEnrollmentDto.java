package org.lamisplus.modules.prep.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEnrollmentDto implements Serializable {
    private Long id;

    private String uniqueId;

    //@NotBlank(message = "prepEligibilityUuid is mandatory")
    public String prepEligibilityUuid;

    //@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateEnrolled;

    private LocalDate dateReferred;

    private String riskType; //applicationCodeSet

    private String uuid;

    private String supporterName;

    private String supporterRelationshipType;

    private String supporterPhone;

    private boolean isCommenced;

    private String status;

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
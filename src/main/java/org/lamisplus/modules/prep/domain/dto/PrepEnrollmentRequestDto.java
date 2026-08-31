package org.lamisplus.modules.prep.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEnrollmentRequestDto implements Serializable {
    //@NotNull(message = "personId is mandatory")
    private Long personId;
    /** Stable person UUID (preferred over personId for robust person resolution). */
    private String personUuid;

    private String uniqueId;

    //@NotBlank(message = "prepEligibilityUuid is mandatory")
    public String prepEligibilityUuid;

    //@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    //@NotNull(message = "dateEnrolled is mandatory")
    private LocalDate dateEnrolled;

    private LocalDate dateReferred;

    private String supporterName;

    private String supporterRelationshipType;

    private String supporterPhone;

    private String htsEncounterUuid;

    private String enrollmentType;

    private String populationType;

    private Double weight;

    private Double height;

    private String historyOfDrugAllergies;

    private String historyOfDrugToDrugInteraction;

    private String urinalysisResult;

    private Object liverFunctionTestResults;

    private LocalDate dateOfInitialAdherenceCounseling;

    private LocalDate datePrepStarted;

    private String prepTypeAtStart;

    private String prepTypeAtStartOthersSpecify;

    private String prepRegimen;

    private Integer monthsOfRefill;

    /** Refill supply in DAYS. Replaces the ambiguous monthsOfRefill/duration pair. */
    private Integer refillDays;
}
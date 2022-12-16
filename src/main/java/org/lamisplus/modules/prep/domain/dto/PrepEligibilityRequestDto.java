package org.lamisplus.modules.prep.domain.dto;

import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEligibilityRequestDto implements Serializable {
    @NotNull(message = "hivRisk is mandatory")
    private Object hivRisk;
    private Object stiScreening;
    private Object drugUseHistory;
    @NotNull(message = "personalHivRiskAssessment is mandatory")
    private Object personalHivRiskAssessment;
    private Object sexPartnerRisk;
    @NotNull(message = "personId is mandatory")
    private Long personId;
    private String sexPartner;
    private String counselingType;
    @NotNull(message = "firstTimeVisit is mandatory")
    private Boolean firstTimeVisit;
    private Integer numChildrenLessThanFive;
    private Integer numWives;
    @NotBlank(message = "targetGroup is mandatory")
    private String targetGroup;
    private Object extra;
    @NotBlank(message = "uniqueId is mandatory")
    private String uniqueId;
    private Integer score;
    @NotNull(message = "visitDate is mandatory")
    private LocalDate visitDate;
}
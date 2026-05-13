package org.lamisplus.modules.prep.domain.dto;

import lombok.*;
import org.codehaus.jackson.JsonNode;
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
    private Object stiScreening;
    private Object drugUseHistory;
    @NotNull(message = "personalHivRiskAssessment is mandatory")
    private Object personalHivRiskAssessment;
    private Object sexPartnerRisk;
    @NotNull(message = "personId is mandatory")
    private Long personId;
    private String sexPartner;
    @NotNull(message = "firstTimeVisit is mandatory")
    private Boolean firstTimeVisit;
    private Integer numChildrenLessThanFive;
    @NotBlank(message = "targetGroup is mandatory")
    private String targetGroup;
    private Integer score;
    @NotNull(message = "visitDate is mandatory")
    private LocalDate visitDate;
    private  Object assessmentForPepIndication;
    private  Object assessmentForAcuteHivInfection;
    private  Object assessmentForPrepEligibility;
    private String reasonForSwitch;
    private  Object servicesReceivedByClient;
    private Object considerationForInjections;
    private Object reasonForDecliningPrep;
    private String populationType;
    private String visitType;
    private String uniqueClientId;
    private String htsUuid;
    private String referredFrom;
    private String setting;
    private String serviceStatus;
    private String typeOfSession;
}
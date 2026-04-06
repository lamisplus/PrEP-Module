package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEligibilityScreeningRequestDto implements Serializable {
    private Long personId;
    private Object hivRisk;
    private Object stiScreening;
    private Object drugUseHistory;
    private Object personalHivRiskAssessment;
    private Object sexPartnerRisk;
    private String sexPartner;
    private Boolean firstTimeVisit;
    private Integer numChildrenLessThanFive;
    private String targetGroup;
    private Integer score;
    private LocalDate visitDate;
    private Object assessmentForPepIndication;
    private Object assessmentForAcuteHivInfection;
    private Object assessmentForPrepEligibility;
    private Object servicesReceivedByClient;
    private Object considerationForInjections;
    private Object reasonForDecliningPrep;
    private String reasonForSwitch;
    private String populationType;
    private String visitType;
    private String pregnancyStatus;
    private String uniqueClientId;
    private String clientHtsCode;
    private String referredFrom;
    private String setting;
    private String serviceStatus;
    private String typeOfSession;
    private String category;
}

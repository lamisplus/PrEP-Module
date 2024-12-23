package org.lamisplus.modules.prep.domain.dto;

import lombok.*;
import org.codehaus.jackson.JsonNode;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.FetchType;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEligibilityDto implements Serializable {
    private Long id;
    private String uuid;
    private Object hivRisk;
    private Object stiScreening;
    private Object drugUseHistory;
    private Object personalHivRiskAssessment;
    private Object sexPartnerRisk;
    private String personUuid;
    private String sexPartner;
    private String counselingType;
    private Boolean firstTimeVisit;
    private Integer numChildrenLessThanFive;
    private Integer numWives;
    private String targetGroup;
    private String uniqueId;
    private Integer score;

    private Object extra;
    private String prepStatus;
    private Integer prepEligibilityCount;

    private  Object assessmentForPepIndication;
    private  Object assessmentForAcuteHivInfection;
    private  Object assessmentForPrepEligibility;
    private  Object servicesReceivedByClient;
    private String populationType;
    private String visitType;
    private String lftConducted;
    private String reasonForSwitch;
    private LocalDate dateLiverFunctionTestResults;
    private Object liverFunctionTestResults;
    private String pregnancyStatus;

    //private PersonResponseDto personResponseDto;

    private LocalDate visitDate;
}
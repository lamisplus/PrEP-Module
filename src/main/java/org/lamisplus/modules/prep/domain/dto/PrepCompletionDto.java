package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepCompletionDto implements Serializable {
    private Long id;
    private String interruptionType;
    private LocalDate interruptionDate;
    private LocalDate dateDefaulted;
    private LocalDate dateClientDied;
    private String causeOfDeath;
    private String sourceOfDeathInfo;
    private LocalDate dateClientReferredOut;
    private String facilityReferredTo;
    private String interruptionReason;
    private Long personId;
    private LocalDate dateSeroConverted;
    private LocalDate dateRestartPlacedBackMedication;
    private Boolean linkToArt;
    private String reasonForPrepDiscontinuation;
    private String reasonStopped;
    private String reasonStoppedOthers;
    private String previousPrepStatus;
    private String why;
    private String pepCompletion;
    private LocalDate followUpVisitDate;
    private String hivResult;
    private String earlyDetectViralLoadResult;
    private String prepEnrollmentUuid;
    private String enrollmentType;
}

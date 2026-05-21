package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ProphylaxisInterruptionDto implements Serializable {
    private Long id;
    private String uuid;
    private String personUuid;
    private Long personId;
    private String prophylaxisInitiationUuid;
    private String interruptionType;
    private LocalDate interruptionDate;
    private LocalDate dateDefaulted;
    private String interruptionReason;
    private LocalDate dateClientDied;
    private String causeOfDeath;
    private String sourceOfDeathInfo;
    private LocalDate dateClientReferredOut;
    private String facilityReferredTo;
    private LocalDate dateSeroConverted;
    private LocalDate dateRestartPlacedBackMedication;
    private Boolean linkToArt;
    private String reasonStopped;
    private String reasonStoppedOthers;
    private String reasonForPrepDiscontinuation;
    private String previousPrepStatus;
    private String previousPepStatus;
    private String enrollmentType;
    private String why;
    private String pepCompletion;
    private LocalDate followUpVisitDate;
    private String htsEncounterUuid;
    private String earlyDetectViralLoadResult;
}

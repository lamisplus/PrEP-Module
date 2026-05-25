package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepInterruptionDto implements Serializable {
    private Long id;
    private String interruptionType;
    private LocalDate interruptionDate;
    private LocalDate dateClientDied;
    private String causeOfDeath;
    private String sourceOfDeathInfo;
    private LocalDate dateClientReferredOut;
    private String facilityReferredTo;
    private String interruptionReason;
    private LocalDate dateSeroConverted;
    private LocalDate dateRestartPlacedBackMedication;
    private String reasonForPrepDiscontinuation;

    private Boolean linkToArt;

    private String reasonStopped;
    private String reasonStoppedOthers;
    private String previousPrepStatus;
    private String enrollmentType;
    private String prepEnrollmentUuid;

    private String previousPepStatus;
    private String why;
    private String pepCompletion;
    private LocalDate followUpVisitDate;
    /** Legacy: still written on the {@code prep_interruption} (PrepInterruption) path. */
    private String hivResult;
    /** Used by the {@code prophylaxis_interruptions} (ProphylaxisInterruption) path; HIV result is resolved via this uuid. */
    private String htsEncounterUuid;
    private String earlyDetectViralLoadResult;
}
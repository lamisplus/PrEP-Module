package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepInterruptionRequestDto implements Serializable {
    //@NotBlank(message = "Interruption type is mandatory")
    //@NotNull(message = "Interruption type is mandatory")
    private String interruptionType;
    //@NotNull(message = "Interruption date is mandatory")
    private LocalDate interruptionDate;
    private LocalDate dateClientDied;
    private String causeOfDeath;
    private String sourceOfDeathInfo;
    private LocalDate dateClientReferredOut;
    private String facilityReferredTo;
    private String interruptionReason;
    //@NotNull(message = "PersonId is mandatory")
    private Long personId;
    private LocalDate dateSeroConverted;
    private LocalDate dateRestartPlacedBackMedication;
    private Boolean linkToArt;
    private String reasonForPrepDiscontinuation;
    private String reasonStopped;
    private String reasonStoppedOthers;
    private String previousPrepStatus;
    private String previousPepStatus;
    private String enrollmentType;
    private String prepEnrollmentUuid;

    private String why;
    private String pepCompletion;
    private LocalDate followUpVisitDate;
    /** Legacy: still written on the {@code prep_interruption} (PrepInterruption) path. */
    private String hivResult;
    /** Used by the {@code prophylaxis_interruptions} (ProphylaxisInterruption) path; HIV result is resolved via this uuid. */
    private String htsEncounterUuid;
    private String earlyDetectViralLoadResult;
}
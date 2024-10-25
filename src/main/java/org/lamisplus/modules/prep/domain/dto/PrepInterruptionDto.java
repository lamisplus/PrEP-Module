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
}
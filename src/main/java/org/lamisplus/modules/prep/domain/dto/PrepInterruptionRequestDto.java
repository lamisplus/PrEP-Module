package org.lamisplus.modules.prep.domain.dto;

import lombok.*;
import org.lamisplus.modules.prep.domain.entity.PrepInterruption;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepInterruptionRequestDto implements Serializable {
    @NotBlank(message = "interruptionType is mandatory")
    private String interruptionType;
    private LocalDate interruptionDate;
    private LocalDate dateClientDied;
    private String causeOfDeath;
    private String sourceOfDeathInfo;
    private LocalDate dateClientReferredOut;
    private String facilityReferredTo;
    private String interruptionReason;
    @NotNull(message = "personId is mandatory")
    private Long personId;
    private LocalDate dateSeroConverted;
    private LocalDate dateRestartPlacedBackMedication;
    private Boolean linkToArt;
    private String reasonForPrepDiscontinuation;
    private String reasonStopped;
    private String reasonStoppedOthers;
}
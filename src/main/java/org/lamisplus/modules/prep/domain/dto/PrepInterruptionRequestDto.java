package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

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
    @NotBlank(message = "Interruption type is mandatory")
    @NotNull(message = "Interruption type is mandatory")
    private String interruptionType;
    @NotNull(message = "Interruption date is mandatory")
    private LocalDate interruptionDate;
    private LocalDate dateClientDied;
    private String causeOfDeath;
    private String sourceOfDeathInfo;
    private LocalDate dateClientReferredOut;
    private String facilityReferredTo;
    private String interruptionReason;
    @NotNull(message = "PersonId is mandatory")
    private Long personId;
    private LocalDate dateSeroConverted;
    private LocalDate dateRestartPlacedBackMedication;
    private Boolean linkToArt;
    private String reasonForPrepDiscontinuation;
    private String reasonStopped;
    private String reasonStoppedOthers;
    private String previousPrepStatus;
}
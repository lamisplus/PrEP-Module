package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepClientDiscontinuationInterruptionDto implements Serializable {
    @NotNull(message = "prepClientId is mandatory")
    private Long prepClientId;
    @NotNull(message = "personId is mandatory")
    private  Long personId;

    /*prep_discontinuations_interruptions
- interruption_type - codeset
- date_interruption - date
- why - codeset
- date_restart_placed_back_medication*/

    //Prep Discontinuations & Interruptions
    @NotNull(message = "interruptionType is mandatory")
    private String interruptionType;

    @NotNull(message = "dateInterruption is mandatory")
    private LocalDate dateInterruption;

    @NotNull(message = "why is mandatory")
    private String why;

    private LocalDate dateRestartPlacedBackMedication;
}
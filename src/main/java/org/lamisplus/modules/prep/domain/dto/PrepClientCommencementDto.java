package org.lamisplus.modules.prep.domain.dto;

import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepClientCommencementDto implements Serializable {
    @NotNull(message = "prepClientId is mandatory")
    private Long prepClientId;
    @NotNull(message = "personId is mandatory")
    private  Long personId;

    /*prep_commencement
- commencement_date_initial_adherence_counseling - date
- commencement_date_prep_start - date
- commencement_prep_regimen - bigint
- commencement_transfer_in - codeset
- commencement_weight - double
- commencement_height - double*/

    //prep Commencement
    @NotNull(message = "dateInitialAdherenceCounseling is mandatory")
    private LocalDate dateInitialAdherenceCounseling;

    @NotNull(message = "datePrepStart is mandatory")
    private LocalDate datePrepStart;

    @NotNull(message = "prepRegimen is mandatory")
    private Long prepRegimen;

    @NotNull(message = "transferIn is mandatory")
    private String transferIn;

    @NotNull(message = "weight is mandatory")
    private Double weight;

    @NotNull(message = "height is mandatory")
    private Double height;
}
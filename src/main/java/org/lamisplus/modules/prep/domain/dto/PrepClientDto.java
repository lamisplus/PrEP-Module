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
public class PrepClientDto implements Serializable {
    @NotNull(message = "id is mandatory")
    private Long id;
    @NotNull(message = "uniqueClientId is mandatory")
    private String uniqueClientId;
    @NotNull(message = "dateEnrolled is mandatory")
    private LocalDate dateEnrolled;
    @NotNull(message = "populationType is mandatory")
    private String populationType;
    @NotNull(message = "partnerType is mandatory")
    private String partnerType;
    @NotNull(message = "hivTestingPoint is mandatory")
    private String hivTestingPoint;
    @NotNull(message = "dateOfLastHivNegativeTest is mandatory")
    private LocalDate dateOfLastHivNegativeTest;
    private LocalDate dateReferredForPrep;
    @NotNull(message = "personResponseDto is mandatory")
    private PersonResponseDto personResponseDto;
    private Object extra;

    //prep Commencement
    private Boolean prepCommenced; //-- checking is prep has commenced
    private LocalDate dateInitialAdherenceCounseling;

    private LocalDate datePrepStart;

    private Long prepRegimen;

    private String transferIn;

    private Double weight;

    private Double height;
}
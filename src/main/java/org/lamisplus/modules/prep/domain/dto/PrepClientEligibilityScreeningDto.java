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
public class PrepClientEligibilityScreeningDto implements Serializable {
    @NotNull(message = "prepClientId is mandatory")
    private Long prepClientId;
    @NotNull(message = "personId is mandatory")
    private  Long personId;

    //Prep Client Eligibility Screening
    private String eligibilityScreeningClientName;

    private LocalDate eligibilityScreeningDob;

    private LocalDate eligibilityScreeningDateVisit;

    private String eligibilityScreeningOccupation;
}
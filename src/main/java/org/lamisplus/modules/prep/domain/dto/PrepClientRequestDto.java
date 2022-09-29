package org.lamisplus.modules.prep.domain.dto;

import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * A DTO for the {@link org.lamisplus.modules.prep.domain.entity.PrepClient} entity
 */
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepClientRequestDto implements Serializable {
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
    private Long personId;
    private PersonDto personDto;
    private Object extra;
}
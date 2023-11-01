package org.lamisplus.modules.prep.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEnrollmentRequestDto implements Serializable {
    @NotNull(message = "personId is mandatory")
    private Long personId;

    private String uniqueId;

    @NotBlank(message = "prepEligibilityUuid is mandatory")
    public String prepEligibilityUuid;

    //@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @NotNull(message = "dateEnrolled is mandatory")
    private LocalDate dateEnrolled;

    private LocalDate dateReferred;

    private String riskType; //applicationCodeSet

    private Object extra;

    private String supporterName;

    private String supporterRelationshipType;

    private String supporterPhone;

    private String ancUniqueArtNo;

    private String hivTestingPoint;

    private LocalDate dateOfLastHivNegativeTest;

    private String targetGroup;
}
package org.lamisplus.modules.prep.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepEnrollmentDto implements Serializable {
    private Long id;

    private String uniqueId;

    private LocalDate dateOfRegistration;

    //@NotBlank(message = "prepEligibilityUuid is mandatory")
    public String prepEligibilityUuid;

    //@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateEnrolled;

    private LocalDate dateReferred;

    private String riskType; //applicationCodeSet

    private Object extra;

    private String uuid;

    private String supporterName;

    private String supporterRelationshipType;

    private String supporterPhone;

    private boolean isCommenced;

    private String status;

    private String ancUniqueArtNo;

    private String hivTestingPoint;

    private LocalDate dateOfLastHivNegativeTest;
}
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
    private String uniqueId;

    private String entryPoint;

    private String targetGroup;

    private String sourceOfReferrer;

    private Boolean pregnant;

    private Boolean breastfeeding;

    private LocalDate dateOfRegistration;

    private String statusAtRegistration;

    private Long enrollmentSetting;

    @NotBlank(message = "prepEligibilityUuid is mandatory")
    public String prepEligibilityUuid;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateStarted;

    private int archived;

    private String facilityName;

    private String careEntryPointOther;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfLpm;

    private String pregnancyStatus;

    private Object extra;

    //public PersonDto personDto;
}
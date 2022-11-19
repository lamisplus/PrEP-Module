package org.lamisplus.modules.prep.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepDto implements Serializable {

    private Long id;

    private String uniqueId;

    private String entryPoint;

    private String targetGroup;

    private String sourceOfReferrer;

    private Boolean pregnant;

    private Boolean breastfeeding;

    private LocalDate dateOfRegistration;

    private String statusAtRegistration;

    private String enrollmentSetting;

    private LocalDate dateStarted;

    private String facilityName;

    private String careEntryPointOther;

    private LocalDate dateOfLpm;

    private String pregnancyStatus;

    private Object extra;

    private PersonResponseDto personResponseDto;

//    //prep Discontinuations Interruptions
//    private String interruptionType;
//
//    private LocalDate dateInterruption;
//
//    private LocalDate dateRestartPlacedBackMedication;
//
//    public Boolean prepCommenced;
}
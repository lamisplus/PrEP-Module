package org.lamisplus.modules.prep.domain.dto;


import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;


@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepClinicDto implements Serializable{

    private Long id;

    private LocalDate  dateInitialAdherenceCounseling;

    private Double weight;

    private Double height;

    private String pregnant;

    private String prepEnrollmentUuid;

    private long regimenId;

    private long regimenTypeId;

    private String urinalysisResult;

    private Boolean referred;

    private LocalDate dateReferred;

    private Long personId;

    private LocalDate nextAppointment;

    private Object extra;

    //private String status;

    private Boolean isCommencement;

    private LocalDate datePrepStart;
}


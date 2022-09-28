package org.lamisplus.modules.hiv.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonDto;

@Data
public class HivPatientEnrollmentDto {
    private  PersonDto person;
    private  HivEnrollmentDto hivEnrollment;
}

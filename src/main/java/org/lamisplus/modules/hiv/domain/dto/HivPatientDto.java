package org.lamisplus.modules.hiv.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.io.Serializable;
import java.util.List;

@Data
public class HivPatientDto extends PersonResponseDto  implements Serializable {
    private boolean isEnrolled;
    private boolean isCommenced;
    private boolean isClinicalEvaluation;
    private boolean isMentalHealth;
    private String currentStatus;
    private HivEnrollmentDto enrollment;
    private ARTClinicalCommenceDto artCommence;
    private List<ARTClinicVisitDto> artClinicVisits;
    private List<ResponseArtPharmacyDto> artPharmacyRefills;
}

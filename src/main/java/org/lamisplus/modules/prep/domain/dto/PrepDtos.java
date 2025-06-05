package org.lamisplus.modules.prep.domain.dto;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import java.time.LocalDate;
import java.util.List;

@Data
public class PrepDtos {
    private Long personId;
    private Integer prepEnrollmentCount;
    private Integer prepEligibilityCount;
    private Integer prepCommencementCount;
    private String prepStatus;
    private LocalDate dateConfirmedHiv;
    private String createdBy;
    private String uniqueId;
    private PersonResponseDto personResponseDto;
    private List<PrepDto> prepDtoList;
    private boolean isCommenced;
    //private List<PrepEligibilityDto> prepEligibilityDtos;
    private Boolean hivPositive;
    private LocalDate dateHivPositive;
}

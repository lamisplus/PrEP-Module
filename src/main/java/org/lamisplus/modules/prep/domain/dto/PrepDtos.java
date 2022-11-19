package org.lamisplus.modules.prep.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.time.LocalDate;
import java.util.List;

@Data
public class PrepDtos {
    private Long personId;
    private Integer prepCount;
    private String uniqueId;
    private PersonResponseDto personResponseDto;
    private List<PrepDto> prepDtoList;
    private Boolean hivPositive;
    private LocalDate dateHivPositive;
}

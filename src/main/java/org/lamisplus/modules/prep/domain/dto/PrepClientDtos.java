package org.lamisplus.modules.prep.domain.dto;

import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;

import java.util.List;

@Data
public class PrepClientDtos {
    private Long personId;
    private Integer prepCount;
    private String uniqueClientId;
    private Long currentPrepId;
    private PersonResponseDto personResponseDto;
    private List<PrepClientDto> prepClientDtoList;
}

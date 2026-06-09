package org.lamisplus.modules.prep.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LatestHtsResultDto {
    private Long id;
    private String uuid;
    private Long patientId;
    private String patientUuid;
    private String clientCode;
    private LocalDate dateOfVisit;
    private String setting;
    private JsonNode observation;
    private Long facilityId;
}

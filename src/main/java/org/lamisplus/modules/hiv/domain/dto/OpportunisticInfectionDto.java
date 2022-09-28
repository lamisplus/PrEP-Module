package org.lamisplus.modules.hiv.domain.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class OpportunisticInfectionDto implements Serializable {
    private final String description;
    private final String clinicStage;
}

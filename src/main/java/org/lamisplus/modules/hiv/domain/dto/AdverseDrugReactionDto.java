package org.lamisplus.modules.hiv.domain.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class AdverseDrugReactionDto implements Serializable {
    private final String description;
    private final String organ;
}

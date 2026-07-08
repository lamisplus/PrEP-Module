package org.lamisplus.modules.prep.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Latest viral load for a patient, plus its interpreted label. {@code viralLoad}
 * is the raw result; {@code viralLoadResult} is one of the
 * {@code ViralLoadConstants} labels (Target Detected / Target NO Detected), or
 * null when no viral load exists.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViralLoadResultDto {
    private String viralLoad;
    private String viralLoadResult;
}

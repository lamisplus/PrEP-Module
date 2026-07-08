package org.lamisplus.modules.prep.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * One of the first three PEP follow-up visits after the latest PEP initiation,
 * with the HTS encounter used to resolve its HIV result on the frontend.
 * {@code visitNumber} is 1-based (1st / 2nd / 3rd).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowupHtsResultDto {
    private Integer visitNumber;
    private Long followupId;
    private LocalDate encounterDate;
    private String htsEncounterUuid;
    private String htsObservation;
}

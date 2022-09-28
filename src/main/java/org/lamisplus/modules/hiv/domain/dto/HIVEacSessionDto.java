package org.lamisplus.modules.hiv.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;



/**
 * A DTO for the {@link HIVEacSession} entity
 */

@Data
@Builder
public class HIVEacSessionDto implements Serializable {
	private final Long facilityId;
	private final Long id;
	private final Long eacId;
	private final Long personId;
	private final Long visitId;
	private final JsonNode barriers;
	private final JsonNode intervention;
	private final String barriersOthers;
	private final String interventionOthers;
	private final String comment;
	private final LocalDate followUpDate;
	private final String referral;
	private final String adherence;
	private final String status;
	private final String uuid;
}
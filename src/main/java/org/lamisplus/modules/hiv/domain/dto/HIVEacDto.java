package org.lamisplus.modules.hiv.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HIVEacDto implements Serializable {
	private Long id;
	private Long visitId;
	private Long personId;
	private Double lastViralLoad;
	private String note;
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
	private LocalDate dateOfLastViralLoad;
	@Column(name = "uuid", nullable = false, unique = true, updatable = false)
	private String uuid;
	private String status;
	private int archived;
	private Long testResultId;
	private String testGroup;
	private String testName;
	private String reasonStopped;
	private String labNumber;
}

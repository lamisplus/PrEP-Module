package org.lamisplus.modules.hiv.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lamisplus.modules.hiv.utility.LocalDateConverter;
import org.lamisplus.modules.triage.domain.dto.VitalSignRequestDto;

import javax.persistence.Convert;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ARTClinicalCommenceDto implements Serializable {
    private  Long id;
    @Convert(converter = LocalDateConverter.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate visitDate;
    private  Long cd4;
    private  Long cd4Percentage;
    private Boolean isCommencement;
    private Long functionalStatusId;
    private  String clinicalNote;
    private  String uuid;
    private  Long hivEnrollmentId;
    @JsonIgnore
    private  Long artStatusId;
    private  Long whoStagingId;
    private Long regimenId;
    private Long regimenTypeId;
    @NotNull
    private  Long vitalSignId;
    @NotNull
    private Long facilityId;
    @NotNull
    private Long personId;
    @NotNull
    private Long clinicalStageId;
    @PastOrPresent
    @Convert(converter = LocalDateConverter.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lmpDate;
    @NotNull
    private Long visitId;
    private VitalSignRequestDto vitalSignDto;
    private  Boolean isViralLoadAtStartOfArt;
    private  Double  viralLoadAtStartOfArt;
    private LocalDate dateOfViralLoadAtStartOfArt;


}

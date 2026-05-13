package org.lamisplus.modules.prep.domain.dto;
import lombok.Data;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import java.time.LocalDate;
import java.util.List;

@Data
public class PrepDtos {
    private Long personId;
    private Integer prepEnrollmentCount;
    private Integer prepEligibilityCount;
    private Integer prepCommencementCount;
    private String prepStatus;
    private LocalDate dateConfirmedHiv;
    private String createdBy;
    private String uniqueId;
    private PersonResponseDto personResponseDto;
    private List<PrepDto> prepDtoList;
    private boolean isCommenced;
    //private List<PrepEligibilityDto> prepEligibilityDtos;
    private Boolean hivPositive;
    private String enrollmentType;
    private String previousProphylaxis;
    // Latest pregnancy / breastfeeding status pulled from the most recent
    // screening or initiation record. Used by the Patient Card.
    private String pregnant;
    private String breastfeeding;
    /** Display name of the patient's current regimen (latest prep_followup_visit). */
    private String currentRegimen;

    /**
     * TRUE when the patient is currently active on PrEP — i.e. their latest
     * {@code prophylaxis_initiation} has
     * {@code enrollment_type=PREP_PEP_ENROLLMENT_TYPE_PREP} AND
     * {@code is_interrupted=false}. Used by the Patient List "Enroll" modal
     * (block re-enrollment) and by the SubMenu (cross-arm form lockout).
     */
    private Boolean isCurrentStatusInterruptedPrep = false;
    /** Same semantics for PEP. */
    private Boolean isCurrentStatusInterruptedPep = false;

    /** Total interruptions/discontinuations on file for the patient. */
    private Integer interruptionCount = 0;
    /** Initiations on file with enrollment_type = PrEP. */
    private Integer prepInitiationCount = 0;
    /** Initiations on file with enrollment_type = PEP. */
    private Integer pepInitiationCount = 0;
}

package org.lamisplus.modules.prep.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.commons.lang3.StringUtils;
import org.lamisplus.modules.base.domain.entities.Audit;
import org.lamisplus.modules.patient.domain.entity.Person;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "prophylaxis_interruptions")
public class ProphylaxisInterruption extends Audit implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "prep_enrollment_uuid")
    private String prepEnrollmentUuid;

    /**
     * Canonical FK to the {@code prophylaxis_initiation} record this interruption belongs to.
     * Populated by the service on save (latest active initiation for the person + enrollment type).
     */
    @Column(name = "prophylaxis_initiation_uuid")
    private String prophylaxisInitiationUuid;

    @Column(name = "interruption_type")
    private String interruptionType;

    @Column(name = "interruption_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate interruptionDate;

    @Column(name = "interruption_reason")
    private String interruptionReason;

    @Column(name = "date_client_died")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateClientDied;

    @Column(name = "cause_of_death")
    private String causeOfDeath;

    @Column(name = "source_of_death_info")
    private String sourceOfDeathInfo;

    @Column(name = "date_client_referred_out")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateClientReferredOut;

    @Column(name = "facility_referred_to")
    private String facilityReferredTo;

    @Column(name = "date_sero_converted")
    private LocalDate dateSeroConverted;

    @Column(name = "date_restart_placed_back_medication")
    private LocalDate dateRestartPlacedBackMedication;

    @Column(name = "link_to_art")
    private Boolean linkToArt;

    @Column(name = "reason_stopped")
    private String reasonStopped;

    @Column(name = "reason_stopped_others")
    private String reasonStoppedOthers;

    @Column(name = "reason_for_prep_discontinuation")
    private String reasonForPrepDiscontinuation;

    @Column(name = "previous_prep_status")
    private String previousPrepStatus;

    @Column(name = "previous_pep_status")
    private String previousPepStatus;

    @Column(name = "enrollment_type")
    private String enrollmentType;

    @Column(name = "why")
    private String why;

    @Column(name = "pep_completion")
    private String pepCompletion;

    @Column(name = "follow_up_visit_date")
    private LocalDate followUpVisitDate;

    @Column(name = "hiv_result")
    private String hivResult;

    @Column(name = "early_detect_viral_load_result")
    private String earlyDetectViralLoadResult;

    @Column(name = "archived")
    private Boolean archived = false;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

    @ManyToOne
    @JoinColumn(name = "prep_enrollment_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private PrepPepInitiation prepPepInitiation;

    @PrePersist
    public void setFields() {
        if (StringUtils.isEmpty(uuid)) {
            uuid = UUID.randomUUID().toString();
        }
        if (archived == null) {
            archived = false;
        }
    }
}

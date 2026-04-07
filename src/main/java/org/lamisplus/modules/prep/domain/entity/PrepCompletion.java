package org.lamisplus.modules.prep.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
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
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepCompletion extends Audit implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "prep_enrollment_uuid")
    private String prepEnrollmentUuid;

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
    private Integer archived = 0;

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
            archived = 0;
        }
    }
}

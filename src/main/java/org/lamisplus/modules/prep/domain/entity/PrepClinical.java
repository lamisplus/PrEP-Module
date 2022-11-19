package org.lamisplus.modules.prep.domain.entity;



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
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.triage.domain.entity.VitalSign;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;


@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "prep_clinical")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepClinical extends Audit implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Column(name = "is_commencement")
    private Boolean isCommencement;

    @Column(name = "functional_status_uuid")
    private String functionalStatusUuid;

    @Column(name = "clinical_stage_uuid")
    private String clinicalStageUuid;

    @Column(name = "clinical_note")
    private String clinicalNote;

    @Column(name = "prep_enrollment_uuid")
    private String prepEnrollmentUuid;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "prep_enrollment_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private PrepEnrollment prepEnrollment;

    @Column(name = "regimen_id")
    private long regimenId;

    @Column(name = "regimen_type_id")
    private long regimenTypeId;

    @Column(name = "archived")
    private Integer archived;

    @Column(name = "vital_sign_uuid")
    private String vitalSignUuid;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "visit_uuid")
    private String visitUuid;

    @OneToOne
    @JoinColumn(name = "vital_sign_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private VitalSign vitalSign;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

    @OneToOne
    @JoinColumn(name = "visit_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Visit visit;

    @Column(name = "oi_screened")
    private String oiScreened;

    @Column(name = "sti_ids")
    private String stiIds;

    @Column(name = "sti_treated")
    private String stiTreated;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "opportunistic_infections", columnDefinition = "jsonb")
    private Object opportunisticInfections;

    @Column(name = "adherence_level")
    private String adherenceLevel;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "adheres", columnDefinition = "jsonb")
    private Object adheres;

    @Column(name = "next_appointment")
    private LocalDate nextAppointment;

    @Column(name = "lmp_date")
    private LocalDate lmpDate;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "tb_screen", columnDefinition = "jsonb")
    private Object tbScreen;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
    }
}


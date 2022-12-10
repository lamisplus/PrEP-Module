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
@Table(name = "prep_clinic")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepClinic extends Audit implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = " date_initial_adherence_counseling")
    private LocalDate  dateInitialAdherenceCounseling;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "height")
    private Double height;

    @Column(name = "pregnant")
    private String pregnant;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @ManyToOne
    @JoinColumn(name = "prep_enrollment_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private PrepEnrollment prepEnrollment;

    @Column(name = "prep_enrollment_uuid")
    private String prepEnrollmentUuid;

    @Column(name = "date_prep_start")
    private LocalDate datePrepStart;

    @Column(name = "regimen_id")
    private long regimenId;

    @Column(name = "regimen_type_id")
    private long regimenTypeId;

    @Column(name = "archived")
    private Integer archived;

    //Urinalysis Result
    @Column(name = "urinalysis_result")
    private String urinalysisResult;

    @Column(name = "referred")
    private Boolean referred;

    @Column(name = "date_referred")
    private LocalDate dateReferred;

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

    @Column(name = "next_appointment")
    private LocalDate nextAppointment;

    @Column(name = "encounter_date")
    private LocalDate encounterDate;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "is_commencement")
    private Boolean isCommencement;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

    //For clinic
    @Column(name = "pulse")
    private Double pulse;
    @Column(name = "respiratory_rate")
    private Double respiratoryRate;
    @Column(name = "temperature")
    private Double temperature;
    @Column(name = "systolic")
    private Double systolic;
    @Column(name = "diastolic")
    private Double diastolic;
    @Column(name = "adherence_level")
    private String adherenceLevel;
    @Column(name = "sti_screening")
    private Boolean stiScreening;

    @Column(name = "why")
    private Boolean why;

    @Column(name = "date_prep_given")
    private LocalDate datePrepGiven;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "urinalysis", columnDefinition = "jsonb")
    private Object urinalysis;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "hepatitis", columnDefinition = "jsonb")
    private Object hepatitis;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "syphilis", columnDefinition = "jsonb")
    private Object syphilis;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "other_tests_done", columnDefinition = "jsonb")
    private Object otherTestsDone;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "syndromic_sti_screening", columnDefinition = "jsonb")
    private Object syndromicStiScreening ;


    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
        if(archived == null){
            archived=0;
        }
    }
}


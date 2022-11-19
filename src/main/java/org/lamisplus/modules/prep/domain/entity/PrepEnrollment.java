package org.lamisplus.modules.prep.domain.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.*;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.lamisplus.modules.base.domain.entities.Audit;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;


@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "prep_enrollment")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepEnrollment extends Audit implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unique_id")
    private String uniqueId;

    @Column(name = "entry_point")
    private String entryPoint;

    @Column(name = "target_group")
    private String targetGroup;

    @Column(name = "source_of_referrer")
    private String sourceOfReferrer;

    @Column(name = "pregnant")
    private Boolean pregnant;

    @Column(name = "breastfeeding")
    private Boolean breastfeeding;

    @Column(name = "date_of_registration")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfRegistration;

    @Column(name = "status_at_registration")
    private String statusAtRegistration;

    @Basic
    @Column(name = "enrollment_setting")
    private String enrollmentSetting;

    @Column(name = "date_started")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateStarted;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

    @ManyToOne
    @JoinColumn(name = "visit_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Visit visit;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(name = "archived")
    private int archived;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "facility_name")
    private String facilityName;

    @Column(name = "care_entry_point_other")
    private String careEntryPointOther;

    @Column(name = "date_of_lpm")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfLpm;

    @Column(name = "pregnancy_status")
    private String pregnancyStatus;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

    @Column(name = "facility_id")
    public Long facilityId;

    @Column(name = "prep_eligibility_uuid")
    public String prepEligibilityUuid;

    @OneToOne
    @JoinColumn(name = "prep_eligibility_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private PrepEligibility prepEligibility;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
    }

}

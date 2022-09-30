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
import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "prep_client")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepClient extends Audit implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic
    @Column(name = "unique_client_id")
    private String uniqueClientId;

    @Basic
    @Column(name = "date_enrolled")
    private LocalDate dateEnrolled;

    @Basic
    @Column(name = "population_type")
    private String populationType;

    @Basic
    @Column(name = "partner_type")
    private String partnerType;

    @Basic
    @Column(name = "hiv_testing_point")
    private String hivTestingPoint;

    @Basic
    @Column(name = "date_of_last_hiv_negative_test")
    private LocalDate dateOfLastHivNegativeTest;

    @Basic
    @Column(name = "date_referred_for_prep")
    private LocalDate dateReferredForPrep;

    @Basic
    @Column(name = "person_uuid")
    private String personUuid;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private  Object extra;

    @Basic
    @Column(name = "facility_id")
    private Long facilityId;

    @Basic
    @Column(name = "uuid")
    private String uuid;

    @Basic
    @Column(name = "archived")
    private Integer archived;


    //prep Commencement
    @Basic
    @Column(name = "date_initial_adherence_counseling")
    private LocalDate dateInitialAdherenceCounseling;

    @Basic
    @Column(name = "date_prep_start")
    private LocalDate datePrepStart;

    @Basic
    @Column(name = "prep_regimen")
    private Long prepRegimen;

    @Basic
    @Column(name = "transferIn")
    private String transferIn;   //-- codeSet

    @Basic
    @Column(name = "weight")
    private Double weight;

    @Basic
    @Column(name = "height")
    private Double height;

    @PrePersist
    public void setFields(){
        if(StringUtils.isEmpty(uuid)){
            uuid = UUID.randomUUID().toString();
        }
        if(archived == null){
            archived = 0;
        }
    }
}

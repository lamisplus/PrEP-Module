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
@Table(name = "prep_eligibility")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepEligibility  extends Audit implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "unique_id")
    private String uniqueId;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Column(name = "score")
    private Integer score;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "hiv_risk", columnDefinition = "jsonb")
    private  Object hivRisk;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sti_screening", columnDefinition = "jsonb")
    private  Object stiScreening;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "drug_use_history", columnDefinition = "jsonb")
    private  Object drugUseHistory;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "personal_hiv_risk_assessment", columnDefinition = "jsonb")
    private  Object personalHivRiskAssessment;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sex_partner_risk", columnDefinition = "jsonb")
    private  Object sexPartnerRisk;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "assessment_for_pep_indication", columnDefinition = "jsonb")
    private  Object assessmentForPepIndication;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "assessment_for_acute_hiv_infection", columnDefinition = "jsonb")
    private  Object assessmentForAcuteHivInfection;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "assessment_for_prep_eligibility", columnDefinition = "jsonb")
    private  Object assessmentForPrepEligibility;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "services_received_by_client", columnDefinition = "jsonb")
    private  Object servicesReceivedByClient;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "sex_partner")
    private String sexPartner;

    @Column(name = "counseling_type")
    private String counselingType;

    @Column(name = "first_time_visit")
    private Boolean firstTimeVisit;

    @Column(name = "num_children_less_than_five")
    private Integer numChildrenLessThanFive;

    @Column(name = "num_wives")
    private Integer numWives;

    @Column(name = "target_group")
    private String targetGroup;

    @Column(name = "population_type")
    private String populationType;
    @Column(name = "visit_type")
    private String visitType;
    @Column(name = "pregnancy_status")
    private String pregnancyStatus;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private  Object extra;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(name = "archived")
    private Integer archived;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

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

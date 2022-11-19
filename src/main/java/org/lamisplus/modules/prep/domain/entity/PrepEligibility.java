package org.lamisplus.modules.prep.domain.entity;

import com.vladmihalcea.hibernate.type.array.IntArrayType;
import com.vladmihalcea.hibernate.type.array.StringArrayType;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType;
import com.vladmihalcea.hibernate.type.json.JsonNodeStringType;
import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.lamisplus.modules.base.domain.entities.Audit;

import javax.persistence.*;
import java.io.Serializable;

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

    @Column(name = "person_uuid")
    private String person_uuid;

    @Column(name = "sex_partner")
    private String sex_partner;

    @Column(name = "counseling_type")
    private String counseling_type;

    @Column(name = "first_time_visit")
    private Boolean first_time_visit;

    @Column(name = "num_children_less_than_five")
    private Integer num_children_less_than_five;

    @Column(name = "num_wives")
    private Integer num_wives;

    @Column(name = "target_group")
    private String target_group;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private  Object extra;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "uuid")
    private String uuid;

    @Column(name = "archived")
    private Integer archived;
}

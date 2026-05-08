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
@Table(name = "prophylaxis_initiation")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PrepPepInitiation extends Audit implements Serializable {
    @Id
    @Column(name = "id", updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "facility_id")
    public Long facilityId;

    @Column(name = "prophylaxis_screening_uuid")
    public String prophylaxisScreeningUuid;

    @Column(name = "unique_id")
    private String uniqueId;

    @Column(name = "status")
    private String status;

    @Column(name = "enrollment_type")
    private String enrollmentType;

    @Column(name = "date_enrolled")
    private LocalDate dateEnrolled;

    @Column(name = "date_referred")
    private LocalDate dateReferred;

    @Column(name = "population_type")
    private String populationType;

    @Column(name = "supporter_name")
    private String supporterName;

    @Column(name = "supporter_relationship_type")
    private String supporterRelationshipType;

    @Column(name = "supporter_phone")
    private String supporterPhone;

    @Column(name = "hiv_testing_point")
    private String hivTestingPoint;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "height")
    private Double height;

    @Column(name = "pregnancy_status")
    private String pregnancyStatus;

    @Column(name = "breast_feeding")
    private String breastFeeding;

    @Column(name = "history_of_drug_allergies")
    private String historyOfDrugAllergies;

    @Column(name = "history_of_drug_to_drug_interaction")
    private String historyOfDrugToDrugInteraction;

    @Column(name = "urinalysis_result")
    private String urinalysisResult;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "liver_function_test_results", columnDefinition = "jsonb")
    private Object liverFunctionTestResults;

    @Column(name = "date_of_hiv_test")
    private LocalDate dateOfHivTest;

    @Column(name = "result_of_hiv_test")
    private String resultOfHivTest;

    @Column(name = "date_of_initial_adherence_counseling")
    private LocalDate dateOfInitialAdherenceCounseling;

    @Column(name = "date_prep_started")
    private LocalDate datePrepStarted;

    @Column(name = "prep_type_at_start")
    private String prepTypeAtStart;

    @Column(name = "prep_type_at_start_others_specify")
    private String prepTypeAtStartOthersSpecify;

    @Column(name = "prep_regimen")
    private String prepRegimen;

    @Column(name = "months_of_refill")
    private Integer monthsOfRefill;

    /**
     * Whether this initiation has been discontinued / interrupted. Set to false on creation.
     * Flipped to true when a discontinuation/interruption is saved against this initiation,
     * or automatically 28 days after a PEP initiation date.
     */
    @Column(name = "is_interrupted")
    private Boolean isInterrupted = false;

    @Column(name = "archived")
    private Boolean archived = false;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

    @OneToOne
    @JoinColumn(name = "prophylaxis_screening_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private PrepEligibilityScreening prophylaxisScreening;

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

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
@Table(name = "pep_followup_visit")
@TypeDefs({
        @TypeDef(name = "string-array", typeClass = StringArrayType.class),
        @TypeDef(name = "int-array", typeClass = IntArrayType.class),
        @TypeDef(name = "json", typeClass = JsonStringType.class),
        @TypeDef(name = "jsonb", typeClass = JsonBinaryType.class),
        @TypeDef(name = "jsonb-node", typeClass = JsonNodeBinaryType.class),
        @TypeDef(name = "json-node", typeClass = JsonNodeStringType.class),
})
public class PepFollowupVisit extends Audit implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false)
    private String uuid;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "prep_enrollment_uuid")
    private String prepEnrollmentUuid;

    @Column(name = "encounter_date")
    private LocalDate encounterDate;

    @Column(name = "visit_type")
    private String visitType;

    @Column(name = "is_commencement")
    private Boolean isCommencement;

    @Column(name = "next_appointment")
    private LocalDate nextAppointment;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "height")
    private Double height;

    @Column(name = "pulse")
    private Double pulse;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "respiratory_rate")
    private Double respiratoryRate;

    @Column(name = "systolic")
    private Double systolic;

    @Column(name = "diastolic")
    private Double diastolic;

    @Column(name = "pregnant")
    private String pregnant;

    @Column(name = "population_type")
    private String populationType;

    @Column(name = "prep_type")
    private String prepType;

    @Column(name = "regimen_id")
    private Long regimenId;

    @Column(name = "other_regimen_id")
    private String otherRegimenId;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "date_prep_start")
    private LocalDate datePrepStart;

    @Column(name = "date_prep_given")
    private LocalDate datePrepGiven;

    @Column(name = "prep_given")
    private String prepGiven;

    @Column(name = "other_prep_given")
    private String otherPrepGiven;

    @Column(name = "other_prep_type")
    private String otherPrepType;

    @Column(name = "was_prep_administered")
    private String wasPrepAdministered;

    @Column(name = "prep_distribution_setting")
    private String prepDistributionSetting;

    @Column(name = "months_of_refill")
    private Integer monthsOfRefill;

    @Column(name = "reason_for_switch")
    private String reasonForSwitch;

    @Column(name = "adherence_level")
    private String adherenceLevel;

    @Column(name = "why_adherence_level_poor")
    private String whyAdherenceLevelPoor;

    @Column(name = "other_reason_for_poor_fair_adherence")
    private String otherReasonForPoorFairAdherence;

    @Column(name = "date_initial_adherence_counseling")
    private LocalDate dateInitialAdherenceCounseling;

    @Column(name = "hiv_test_result")
    private String hivTestResult;

    @Column(name = "hiv_test_result_date")
    private LocalDate hivTestResultDate;

    @Column(name = "sti_screening")
    private Boolean stiScreening;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "syndromic_sti_screening", columnDefinition = "jsonb")
    private Object syndromicStiScreening;

    @Column(name = "syndromic_screening")
    private String syndromicScreening;

    @Column(name = "other_syndromic_sti_screening")
    private String otherSyndromicStiScreening;

    @Column(name = "risk_reduction_services")
    private String riskReductionServices;

    @Column(name = "noted_side_effects")
    private String notedSideEffects;

    @Column(name = "other_noted_side_effects")
    private String otherNotedSideEffects;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "prep_noted_side_effects", columnDefinition = "jsonb")
    private Object prepNotedSideEffects;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "pep_noted_side_effects", columnDefinition = "jsonb")
    private Object pepNotedSideEffects;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "urinalysis", columnDefinition = "jsonb")
    private Object urinalysis;

    @Column(name = "urinalysis_result")
    private String urinalysisResult;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "creatinine", columnDefinition = "jsonb")
    private Object creatinine;

    @Column(name = "creatinine_result")
    private String creatinineResult;

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

    @Column(name = "date_of_liver_function_test_results")
    private LocalDate dateLiverFunctionTestResults;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "liver_function_test_results", columnDefinition = "jsonb")
    private Object liverFunctionTestResults;

    @Column(name = "family_planning")
    private String familyPlanning;

    @Column(name = "date_of_family_planning")
    private LocalDate dateOfFamilyPlanning;

    @Column(name = "other_drugs")
    private String otherDrugs;

    @Column(name = "history_of_drug_to_drug_interaction")
    private String historyOfDrugToDrugInteraction;

    @Column(name = "history_of_drug_allergies")
    private String historyOfDrugAllergies;

    @Column(name = "health_care_worker_signature")
    private String healthCareWorkerSignature;

    @Column(name = "comment")
    private String comment;

    @Column(name = "previous_prep_status")
    private String previousPrepStatus;

    @Column(name = "why")
    private Boolean why;

    @Column(name = "referred")
    private Boolean referred;

    @Column(name = "date_referred")
    private LocalDate dateReferred;

    // PEP-specific fields
    @Column(name = "mode_of_exposure")
    private String modeOfExposure;

    @Column(name = "duration_before_pep")
    private String durationBeforePep;

    @Column(name = "hiv_status_at_exposure")
    private String hivStatusAtExposure;

    @Column(name = "pep_regimen")
    private String pepRegimen;

    @Column(name = "other_pep_regimen")
    private String otherPepRegimen;

    @Column(name = "date_start_pep")
    private LocalDate dateStartPep;

    @Column(name = "date_stop_pep")
    private LocalDate dateStopPep;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "followup_hiv_test_results", columnDefinition = "jsonb")
    private Object followupHivTestResults;

    @Type(type = "jsonb")
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "extra", columnDefinition = "jsonb")
    private Object extra;

    @Column(name = "archived")
    private Integer archived;

    @ManyToOne
    @JoinColumn(name = "prep_enrollment_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private PrepPepInitiation prepPepInitiation;

    @OneToOne
    @JoinColumn(name = "person_uuid", referencedColumnName = "uuid", insertable = false, updatable = false)
    private Person person;

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

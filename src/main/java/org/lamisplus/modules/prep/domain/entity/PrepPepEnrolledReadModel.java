package org.lamisplus.modules.prep.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PROTOTYPE read model for the PEP Patients tab. One pre-computed row per
 * PEP-enrolled patient per facility — mirrors the fields {@code PrepHtsPatientDto}
 * exposes so the keyset endpoint can serve the list without running the heavy
 * multi-join query on every page load. Rebuilt by
 * {@code PepEnrolledReadModelService#refresh}.
 */
@Entity
@Table(name = "prep_pep_enrolled_read_model")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrepPepEnrolledReadModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "facility_id")
    private Long facilityId;

    /** Keyset cursor — unique within a facility (one row per person). */
    @Column(name = "person_id")
    private Long personId;

    @Column(name = "person_uuid")
    private String personUuid;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "surname")
    private String surname;

    @Column(name = "other_name")
    private String otherName;

    @Column(name = "hospital_number")
    private String hospitalNumber;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender")
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "prep_count")
    private String prepCount;

    @Column(name = "prep_status")
    private String prepStatus;

    @Column(name = "eligibility_count")
    private Integer eligibilityCount;

    @Column(name = "enrollment_count")
    private Integer enrollmentCount;

    @Column(name = "date_of_registration")
    private LocalDate dateOfRegistration;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "previous_prophylaxis")
    private String previousProphylaxis;

    @Column(name = "send_cab_la_alert")
    private String sendCabLaAlert;

    @Column(name = "pregnancy_status_display")
    private String pregnancyStatusDisplay;

    @Column(name = "is_interrupted")
    private Boolean isInterrupted;

    @Column(name = "pep_only")
    private Boolean pepOnly;

    @Column(name = "hts_client_code")
    private String htsClientCode;

    @Column(name = "hts_id")
    private Long htsId;

    @Column(name = "hts_uuid")
    private String htsUuid;

    @Column(name = "hts_patient_id")
    private Long htsPatientId;

    @Column(name = "hts_patient_uuid")
    private String htsPatientUuid;

    @Column(name = "hts_date_of_visit")
    private LocalDate htsDateOfVisit;

    @Column(name = "hts_setting")
    private String htsSetting;

    @Column(name = "hts_observation", columnDefinition = "text")
    private String htsObservation;

    @Column(name = "hts_facility_id")
    private Long htsFacilityId;

    @Column(name = "date_refreshed")
    private LocalDateTime dateRefreshed;
}

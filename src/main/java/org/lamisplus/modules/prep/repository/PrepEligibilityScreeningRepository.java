package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepEligibilityScreening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepEligibilityScreeningRepository extends JpaRepository<PrepEligibilityScreening, Long>, JpaSpecificationExecutor<PrepEligibilityScreening> {
    Optional<PrepEligibilityScreening> findByUuid(String uuid);
    List<PrepEligibilityScreening> findAllByPersonUuid(String uuid);
    Integer countAllByPersonUuid(String personUuid);
    List<PrepEligibilityScreening> findAllByPersonAndArchived(Person person, Boolean archived);

    @Query(value = "SELECT * FROM prophylaxis_screening pe WHERE pe.person_uuid=?1 AND pe.archived=?2 AND " +
            "pe.uuid NOT IN (SELECT prophylaxis_screening_uuid FROM prophylaxis_initiation peu WHERE peu.person_uuid=?1 " +
            "AND peu.archived=?2 ) ORDER BY pe.visit_date ASC LIMIT 1", nativeQuery = true)
    PrepEligibilityScreening findByPersonUuidAndArchived(String personUuid, Boolean archived);

    Optional<PrepEligibilityScreening> findByVisitDateAndPersonUuidAndArchived(LocalDate visitDate, String personUuid, Boolean archived);
    Optional<PrepEligibilityScreening> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, Boolean archived);
    List<PrepEligibilityScreening> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, Boolean archived);
    List<PrepEligibilityScreening> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prophylaxis_screening WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PrepEligibilityScreening> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

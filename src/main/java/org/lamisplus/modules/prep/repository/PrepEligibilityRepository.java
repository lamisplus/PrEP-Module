package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PrepEligibilityRepository extends JpaRepository<PrepEligibility, Long>, JpaSpecificationExecutor<PrepEligibility> {
    Optional<PrepEligibility> findByUuid(String eligibilityUuid);

    List<PrepEligibility> findAllByUuid(String uuid);

    List<PrepEligibility> findAllByPersonUuid(String uuid);

    Integer countAllByPersonUuid(String personUuid);

    List<PrepEligibility> findAllByPersonAndArchived(Person person, int archived);

    @Query(value = "SELECT * FROM prep_eligibility pe WHERE pe.person_uuid=?1 AND pe.archived=?2 AND " +
            "pe.uuid NOT IN (SELECT prep_eligibility_uuid FROM prep_enrollment peu WHERE peu.person_uuid=?1 " +
            "AND peu.archived=?2 ) ORDER BY pe.visit_date ASC LIMIT 1", nativeQuery = true)
    PrepEligibility findByPersonUuidAndArchived(String personUuid, int archived);

    Optional<PrepEligibility> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    List<PrepEligibility> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);
}
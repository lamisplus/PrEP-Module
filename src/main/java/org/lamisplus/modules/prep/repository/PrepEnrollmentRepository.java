package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PrepEnrollmentRepository extends JpaRepository<PrepEnrollment, Long>, JpaSpecificationExecutor<PrepEnrollment> {
    List<PrepEnrollment> findAllByPersonOrderByIdDesc(Person person);
    List<PrepEnrollment> findAllByUniqueIdOrderByIdDesc(String code);
    List<PrepEnrollment> findAllByPerson(Person person);
    Optional<PrepEnrollment> findByIdAndArchivedAndFacilityId(Long id, int archived, Long currentUserOrganization);

    @Query(value = "SELECT uuid FROM hiv_enrollment where person_uuid=?1", nativeQuery = true)
    Optional<String> findInHivEnrollmentByUuid(String uuid);

    Optional<PrepEnrollment> findByPrepEligibilityUuid(String prepEligibilityUuid);

    Optional<PrepEnrollment> findByUuid(String enrollmentUuid);

    List<PrepEnrollment> findAllByPersonAndArchived(Person person, int archived);

    @Query(value = "SELECT * FROM prep_enrollment pe WHERE pe.person_uuid=?1 AND pe.archived=?2 AND " +
            "pe.status NOT IN (?4) AND pe.facility_id=?3 ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepEnrollment> findByPersonUuidAndArchived(String personUuid, int archived, Long facilityId, String status);
}
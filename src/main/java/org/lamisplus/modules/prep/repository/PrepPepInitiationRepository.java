package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepPepInitiationRepository extends JpaRepository<PrepPepInitiation, Long>, JpaSpecificationExecutor<PrepPepInitiation> {
    List<PrepPepInitiation> findAllByPersonOrderByIdDesc(Person person);
    Optional<PrepPepInitiation> findByIdAndArchivedAndFacilityId(Long id, int archived, Long facilityId);
    Optional<PrepPepInitiation> findByPrepEligibilityUuid(String prepEligibilityUuid);
    Optional<PrepPepInitiation> findByUuid(String uuid);

    @Query(value = "SELECT * FROM prep_pep_initiation pe WHERE pe.person_uuid=?1 AND pe.archived=?2 AND " +
            "pe.status NOT IN (?4) AND pe.facility_id=?3 ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepPepInitiation> findByPersonUuidAndArchived(String personUuid, int archived, Long facilityId, String status);

    Optional<PrepPepInitiation> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    @Query(value = "SELECT * FROM prep_pep_initiation pe WHERE pe.person_uuid=?1 AND pe.archived=?2 ORDER BY pe.date_enrolled DESC LIMIT 1", nativeQuery = true)
    Optional<PrepPepInitiation> findTopByPersonUuidAndArchived(String personUuid, int archived);

    List<PrepPepInitiation> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, int archived);
    Optional<PrepPepInitiation> findByDateEnrolledAndPersonUuid(LocalDate dateEnrolled, String personUuid);
    Integer countAllByPersonUuid(String personUuid);
    List<PrepPepInitiation> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prep_pep_initiation WHERE date_modified > ?1 AND facility_id=?2", nativeQuery = true)
    List<PrepPepInitiation> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
}

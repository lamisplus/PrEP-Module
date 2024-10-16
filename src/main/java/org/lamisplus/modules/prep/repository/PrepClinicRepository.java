package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PrepClinicRepository extends JpaRepository<PrepClinic, Long>, JpaSpecificationExecutor<PrepClinic> {
    List<PrepClinic> findAllByPersonAndIsCommencement(Person person, boolean isCommenced);

    List<PrepClinic> findAllByPersonAndIsCommencementAndArchived(Person person, Boolean isCommencement, int archived);

    Integer countAllByPersonUuid(String personUuid);

    Optional<PrepClinic> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, int archived);

    List<PrepClinic> findAllByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(String personUuid, Long facilityId, int archived, Boolean isCommenced);

    List<PrepClinic> findAllByPrepEnrollmentUuid(String uuid);

    List<PrepClinic> findTopByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(String personUuid, Long facilityId, int archived, Boolean isCommenced);

    Optional<PrepClinic> findByEncounterDateAndPersonUuid(LocalDate encounterDate, String uuid);
    Optional<PrepClinic> findByEncounterDateAndPersonUuidAndIsCommencement(LocalDate encounterDate, String uuid, Boolean bool);

    //For central sync
    List<PrepClinic> findAllByFacilityId(Long facilityId);
    @Query(value = "SELECT * FROM prep_clinic WHERE date_modified > ?1 AND facility_id=?2 ",
            nativeQuery = true
    )
    List<PrepClinic> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);
    Optional<PrepClinic> findByUuid(String uuid);
}
package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.ProphylaxisInterruption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProphylaxisInterruptionRepository extends JpaRepository<ProphylaxisInterruption, Long> {
    Optional<ProphylaxisInterruption> findByIdAndFacilityIdAndArchived(Long id, Long facilityId, Boolean archived);

    /**
     * The latest interruption/discontinuation/completion date for a person on the
     * given arm — a COALESCE over every outcome date column so PrEP
     * discontinuations (interruption_date) and PEP completions (follow_up_visit_date)
     * are both covered. Used to decide "discontinued" (latest interruption date is
     * on/after the latest follow-up visit).
     */
    @Query(nativeQuery = true, value =
            "SELECT MAX(COALESCE(i.interruption_date, i.follow_up_visit_date, i.date_defaulted, " +
            "                    i.date_sero_converted, i.date_client_died, i.date_client_referred_out)) " +
            "FROM prophylaxis_interruptions i " +
            "WHERE CAST(i.person_uuid AS text) = :personUuid " +
            "  AND LOWER(i.enrollment_type) = LOWER(:enrollmentType) " +
            "  AND CAST(i.archived AS BOOLEAN) = false")
    java.sql.Date findLatestInterruptionDate(@Param("personUuid") String personUuid,
                                             @Param("enrollmentType") String enrollmentType);
    List<ProphylaxisInterruption> findAllByPersonUuidAndFacilityIdAndArchived(String personUuid, Long facilityId, Boolean archived);
    List<ProphylaxisInterruption> findAllByPersonAndArchived(Person person, Boolean archived);
    Optional<ProphylaxisInterruption> findByUuid(String uuid);
    Optional<ProphylaxisInterruption> findFirstByInterruptionDateAndPersonUuidAndArchivedOrderByIdAsc(LocalDate interruptionDate, String personUuid, Boolean archived);
    Integer countAllByPersonUuid(String personUuid);
    Integer countAllByPersonUuidAndArchived(String personUuid, Boolean archived);
}

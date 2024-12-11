package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
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

    Optional<PrepClinic> findByEncounterDateAndPersonUuidAndIsCommencementAndArchived(LocalDate encounterDate, String uuid, Boolean bool, Integer archived);

    //For central sync
    List<PrepClinic> findAllByFacilityId(Long facilityId);

    @Query(value = "SELECT * FROM prep_clinic WHERE date_modified > ?1 AND facility_id=?2 ",
            nativeQuery = true
    )
    List<PrepClinic> getAllDueForServerUpload(LocalDateTime dateLastSync, Long facilityId);

    Optional<PrepClinic> findByUuid(String uuid);

    @Query(value = "SELECT enableCab FROM (\n" +
            "SELECT person_uuid, p.id,regimen_id,next_appointment, \n" +
            "CASE WHEN ((next_appointment <=  ?2) AND pc.regimen_id = 2) THEN true else false END AS enableCab, ROW_NUMBER() OVER (PARTITION BY person_uuid ORDER BY next_appointment DESC) AS rowNums\n" +
            "FROM prep_clinic pc\n" +
            "JOIN patient_person p ON p.uuid = pc.person_uuid \n" +
            "WHERE pc.archived = 0 AND p.archived = 0\n" +
            "AND is_commencement= false\n" +
            "AND regimen_id = 2\n" +
            ") sub\n" +
            "WHERE id = ?1 AND rowNums = 1", nativeQuery = true)
    Boolean checkEnableCabaL(Long id, LocalDate currentVisitDate);

    @Query(value = "select p.id FROM prep_clinic pc JOIN patient_person p ON p.uuid = pc.person_uuid \n" +
            "where is_commencement = false\n" +
            "AND p.id = ?1 LIMIT 1", nativeQuery = true)
    Optional<Long> checkHasClinicalVisit(Long id); //checks if has visit


    @Query(value = "WITH RankedVisits AS (\n" +
            "    SELECT \n" +
            "        p.id, \n" +
            "        hts.date_visit, \n" +
            "        hts.hiv_test_result,\n" +
            "        ROW_NUMBER() OVER (PARTITION BY hts.person_uuid ORDER BY hts.date_visit DESC) AS rowNum\n" +
            "    FROM hts_client hts\n" +
            "    JOIN patient_person p ON p.uuid = hts.person_uuid\n" +
            ")\n" +
            "SELECT\n" +
            "    date_visit AS visitDate, \n" +
            "    hiv_test_result AS hivTestResult\n" +
            "FROM RankedVisits\n" +
            "WHERE \n" +
            "id = ?1 AND \n" +
            "rowNum = 1", nativeQuery = true)
    List<PrepPreviousVisitHtsRecord> getPreviousHtsRecord(Long id);

    @Query(value = "SELECT CURRENT_DATE", nativeQuery = true)
    Optional<java.sql.Date> getCurrentDate();


}
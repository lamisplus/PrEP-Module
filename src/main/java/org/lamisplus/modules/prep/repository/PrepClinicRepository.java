package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

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

    //    @Query(value = "SELECT enableCab FROM (\n" +
//            "SELECT person_uuid, p.id,regimen_id,next_appointment, \n" +
//            "CASE WHEN ((next_appointment <=  ?2) AND pc.regimen_id = 2) THEN true else false END AS enableCab, ROW_NUMBER() OVER (PARTITION BY person_uuid ORDER BY next_appointment DESC) AS rowNums\n" +
//            "FROM prep_clinic pc\n" +
//            "JOIN patient_person p ON p.uuid = pc.person_uuid \n" +
//            "WHERE pc.archived = 0 AND p.archived = 0\n" +
//            "AND is_commencement= false\n" +
//            "AND regimen_id = 2\n" +
//            ") sub\n" +
//            "WHERE id = ?1 AND rowNums = 1", nativeQuery = true)
//    Boolean checkEnableCabaL(Long id, LocalDate currentVisitDate);
    @Query(value = "SELECT enableCab FROM (" +
            "SELECT person_uuid, p.id, regimen_id, next_appointment, encounter_date, " +
            "CASE " +
            "WHEN (?2 - encounter_date) >= 23 AND pc.regimen_id = 2 AND pc.visit_type = 'PREP_VISIT_TYPE_INITIATION' THEN true " +
            "WHEN (?2 - encounter_date) >= 53 AND pc.regimen_id = 2 AND pc.visit_type = 'PREP_VISIT_TYPE_SECOND_INITIATION' THEN true " +
            "ELSE false END AS enableCab, " +
            "ROW_NUMBER() OVER (PARTITION BY person_uuid ORDER BY next_appointment DESC) AS rowNums " +
            "FROM prep_clinic pc " +
            "JOIN patient_person p ON p.uuid = pc.person_uuid " +
            "WHERE pc.archived = 0 AND p.archived = 0 " +
            "AND is_commencement = false " +
            "AND regimen_id = 2 " +
            ") sub " +
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

    @Query(value = "SELECT COUNT(*) FROM prep_clinic pc WHERE pc.person_uuid = ?1 AND pc.is_commencement = true", nativeQuery = true)
    int countCommencementRecords(String personUuid);

    @Query(value = "SELECT COUNT(*) FROM prep_clinic pc " +
            "WHERE pc.person_uuid = ?1 " +
            "AND pc.is_commencement = false " +
            "AND pc.encounter_date = (" +
            "  SELECT MAX(pc2.encounter_date) " +
            "  FROM prep_clinic pc2 " +
            "  WHERE pc2.person_uuid = ?1 " +
            "  AND pc2.is_commencement = false " +
            ")", nativeQuery = true)
    int countEligibleRecordsForUpdate(String personUuid);

    @Modifying
    @Query(value = "UPDATE prep_clinic pc " +
            "SET previous_prep_status = ?2 " +
            "WHERE pc.person_uuid = ?1 " +
            "AND pc.is_commencement = false " +
            "AND pc.encounter_date = (" +
            " SELECT MAX(pc2.encounter_date) " +
            " FROM prep_clinic pc2 " +
            " WHERE pc2.person_uuid = ?1 " +
            " AND pc2.is_commencement = false " +
            ")", nativeQuery = true)
    int updateLastEncounterPrevStatusByPersonUuid(String personUuid, String previousStatus);

    @Modifying
    @Transactional
    @Query(value =
            "WITH target AS ( " +
                    "SELECT id FROM prep_clinic " +
                    "WHERE encounter_date = ?1 " +
                    "AND is_commencement = false " +
                    "AND person_uuid = ?2 " +
                    "ORDER BY id ASC " +
                    "LIMIT 1 " +
                    ") " +
                    "UPDATE prep_clinic " +
                    "SET visit_type = ?3, " +
                    "population_type = ?4, " +
                    "pregnant = ?5, " +
                    "liver_function_test_results = CAST(?6 AS jsonb), " +  // ✅ This cast is essential
                    "reason_for_switch = ?7, " +
                    "date_of_liver_function_test_results = ?8 " +
                    "WHERE id = (SELECT id FROM target)", nativeQuery = true)
    int updateFirstPrepClinicMatchViaCte(
            LocalDate encounterDate,
            String personUuid,
            String visitType,
            String populationType,
            String pregnant,
            String liverFunctionTestResults, // ✅ must be a JSON string
            String reasonForSwitch,
            LocalDate dateOfLiverFunctionTestResults
    );


}
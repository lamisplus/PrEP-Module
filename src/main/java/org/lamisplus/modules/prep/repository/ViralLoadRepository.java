package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.LatestViralLoad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Reads the patient's latest viral load from the HIV/laboratory tables. Bound to
 * {@link Person} purely because a JpaRepository needs a managed entity; the
 * native query never touches the Person table directly.
 *
 * <p>Derived from the larger transfer-patient query — slimmed down to return only
 * the single most-recent viral load result for one patient (ordered by sample
 * collection date). lab_test_id = 16 is the Viral Load test; indication 719 is
 * excluded exactly as the source query does.
 */
public interface ViralLoadRepository extends JpaRepository<Person, Long> {

    @Query(nativeQuery = true, value =
            "SELECT sm.result_reported AS viralLoad\n" +
            "FROM public.laboratory_result sm\n" +
            "INNER JOIN public.laboratory_test lt ON sm.test_id = lt.id\n" +
            "INNER JOIN public.laboratory_sample ls ON ls.test_id = lt.id\n" +
            "INNER JOIN public.base_application_codeset acode ON acode.id = lt.viral_load_indication\n" +
            "WHERE lt.lab_test_id = 16\n" +
            "  AND (sm.archived = 0 OR sm.archived IS NULL)\n" +
            "  AND lt.viral_load_indication != 719\n" +
            "  AND sm.date_result_reported IS NOT NULL\n" +
            "  AND sm.result_reported IS NOT NULL\n" +
            "  AND CAST(sm.patient_uuid AS text) = :uuid\n" +
            "ORDER BY ls.date_sample_collected DESC NULLS LAST\n" +
            "LIMIT 1")
    Optional<LatestViralLoad> findLatestViralLoad(@Param("uuid") String uuid);
}

package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.prep.domain.entity.PrepPepEnrolledReadModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Keyset (seek) pagination over the PEP-enrolled read model. Each page is a
 * single index range scan on the unique (facility_id, person_id) index —
 * O(log n + page_size), no sort of the full set, no joins.
 */
public interface PrepPepEnrolledReadModelRepository
        extends JpaRepository<PrepPepEnrolledReadModel, Long> {

    @Modifying
    @Query(value = "DELETE FROM prep_pep_enrolled_read_model WHERE facility_id = ?1",
            nativeQuery = true)
    void deleteByFacility(Long facilityId);

    /** First page (no cursor). ?2 = search pattern (nullable), ?3 = limit. */
    @Query(value =
            "SELECT * FROM prep_pep_enrolled_read_model\n" +
            "WHERE facility_id = ?1\n" +
            "  AND (CAST(?2 AS text) IS NULL\n" +
            "       OR first_name ILIKE ?2 OR surname ILIKE ?2 OR other_name ILIKE ?2\n" +
            "       OR hospital_number ILIKE ?2)\n" +
            "ORDER BY person_id DESC\n" +
            "LIMIT ?3",
            nativeQuery = true)
    List<PrepPepEnrolledReadModel> findFirstPage(Long facilityId, String search, int limit);

    /** Next page — seek past the previous page's last person_id (?2 = cursor). */
    @Query(value =
            "SELECT * FROM prep_pep_enrolled_read_model\n" +
            "WHERE facility_id = ?1\n" +
            "  AND person_id < ?2\n" +
            "  AND (CAST(?3 AS text) IS NULL\n" +
            "       OR first_name ILIKE ?3 OR surname ILIKE ?3 OR other_name ILIKE ?3\n" +
            "       OR hospital_number ILIKE ?3)\n" +
            "ORDER BY person_id DESC\n" +
            "LIMIT ?4",
            nativeQuery = true)
    List<PrepPepEnrolledReadModel> findAfter(Long facilityId, Long afterId, String search, int limit);
}

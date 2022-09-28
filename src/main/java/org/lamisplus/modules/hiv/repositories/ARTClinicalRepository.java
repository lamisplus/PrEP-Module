package org.lamisplus.modules.hiv.repositories;

import com.foreach.across.modules.hibernate.jpa.repositories.CommonJpaRepository;
import org.lamisplus.modules.hiv.domain.entity.ARTClinical;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ARTClinicalRepository extends CommonJpaRepository<ARTClinical, Long> {
    List<ARTClinical> findByArchivedAndIsCommencementIsTrue(int i);

    List<ARTClinical> findByArchivedAndIsCommencementIsFalse(int i);

    Optional<ARTClinical> findByPersonAndIsCommencementIsTrueAndArchived(Person person, Integer archived);

    List<ARTClinical> findAllByPersonAndIsCommencementIsFalseAndArchived(Person person, Integer archived);
    Page<ARTClinical> findAllByPersonAndIsCommencementIsFalseAndArchived(Person person, Integer archived, Pageable pageable);
    Page<ARTClinical> findAllByPersonAndArchived(Person person, Integer archived, Pageable pageable);

}

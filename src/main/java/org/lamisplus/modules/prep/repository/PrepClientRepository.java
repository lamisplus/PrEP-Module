package org.lamisplus.modules.prep.repository;

import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PrepClientRepository extends JpaRepository<PrepClient, Long>, JpaSpecificationExecutor<PrepClient> {
    List<PrepClient> findAllByPersonOrderByIdDesc(Person person);
    List<PrepClient> findAllByUniqueClientId(String code);
    List<PrepClient> findAllByPerson(Person person);
    Optional<PrepClient> findByIdAndArchivedAndFacilityId(Long id, int archived, Long currentUserOrganization);
}
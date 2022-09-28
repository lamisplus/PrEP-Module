package org.lamisplus.modules.hiv.repositories;

import org.lamisplus.modules.hiv.domain.entity.Regimen;
import org.lamisplus.modules.hiv.domain.entity.RegimenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegimenRepository extends JpaRepository<Regimen, Long> {
    List<Regimen> getAllByRegimenType(RegimenType regimenType);

}

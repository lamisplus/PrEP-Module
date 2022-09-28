package org.lamisplus.modules.hiv.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hiv.domain.entity.Regimen;
import org.lamisplus.modules.hiv.domain.entity.RegimenType;
import org.lamisplus.modules.hiv.repositories.RegimenRepository;
import org.lamisplus.modules.hiv.repositories.RegimenTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegimenService {

    private final RegimenRepository regimenRepository;
    private final RegimenTypeRepository regimenTypeRepository;


   public List<Regimen> getRegimenByTypeId(Long typeId) {
        RegimenType regimenType = regimenTypeRepository
                .findById (typeId)
                .orElseThrow (() -> new EntityNotFoundException (RegimenType.class, "id ", String.valueOf (typeId)));
        return regimenRepository.getAllByRegimenType (regimenType);
    }

    public Regimen getRegimenBy(Long id){
      return regimenRepository.findById (id).orElseThrow (() -> new EntityNotFoundException (Regimen.class, "id", Long.toString (id)));
    }
}

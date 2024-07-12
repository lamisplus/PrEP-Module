package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.prep.domain.entity.*;
import org.lamisplus.modules.prep.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepRegimenService {
    private final PrepRegimenRepository prepRegimenRepository;

   public List<PrepRegimen> getAllPrepRegimen(){
       return prepRegimenRepository.findAll();
   }

   public List<PrepRegimen> getAllPrepRegimenByPrepType(String prepType){
       return prepRegimenRepository.findAllByPrepType(prepType);
   }
}

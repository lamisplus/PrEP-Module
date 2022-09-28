package org.lamisplus.modules.hiv.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hiv.domain.dto.EacOutComeDto;
import org.lamisplus.modules.hiv.domain.entity.EacOutCome;
import org.lamisplus.modules.hiv.domain.entity.HIVEac;
import org.lamisplus.modules.hiv.domain.entity.HIVEacSession;
import org.lamisplus.modules.hiv.repositories.EacOutComeRepository;
import org.lamisplus.modules.hiv.repositories.HIVEacRepository;
import org.lamisplus.modules.hiv.repositories.HIVEacSessionRepository;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EACOutComeService {
	
	private final EacOutComeRepository eacOutComeRepository;
	private final HIVEacRepository hivEacRepository;
	
	private final HIVEacSessionRepository hivEacSessionRepository;
	
	private final HandleHIVVisitEncounter hivVisitEncounter;
	
	
	public EacOutComeDto registerEACOutcome(Long id, EacOutComeDto dto) {
		HIVEac eac = getEac(id);
		EacOutCome eacOutCome = mapDtoEntity(dto);
		eacOutCome.setEac(eac);
		eacOutCome.setPerson(eac.getPerson());
		eacOutCome.setFacilityId(eac.getPerson().getFacilityId());
		Visit visit = hivVisitEncounter.processAndCreateVisit(eac.getPerson().getId(), dto.getOutComeDate());
		eacOutCome.setVisit(visit);
		List<HIVEacSession> eacSessionList = hivEacSessionRepository.getHIVEacSesByEac(eac);
		if (!eacSessionList.isEmpty() && eacSessionList.size() >= 3) {
			EacOutCome outcome = eacOutComeRepository.save(eacOutCome);
			eac.setStatus("COMPLETED");
			hivEacRepository.save(eac);
			return mapEntityDto(outcome);
		} else throw new IllegalArgumentException("You must have at least 3 EAC sessions");
	}
	
	private HIVEac getEac(Long eacId) {
		return hivEacRepository
				.findById(eacId)
				.orElseThrow(() -> new EntityNotFoundException(HIVEac.class, "id", String.valueOf(eacId)));
	}
	
	
	private EacOutComeDto mapEntityDto(EacOutCome entity) {
		return EacOutComeDto.builder()
				.id(entity.getId())
				.eacId(entity.getEac().getId())
				.personId(entity.getPerson().getId())
				.visitId(entity.getVisit().getId())
				.repeatViralLoader(entity.getRepeatViralLoader())
				.outcome(entity.getOutcome())
				.plan(entity.getPlan())
				.currentRegimen(entity.getCurrentRegimen())
				.switchRegimen(entity.getSwitchRegimen())
				.planAction(entity.getPlanAction())
				.build();
		
	}
	
	private EacOutCome mapDtoEntity(EacOutComeDto dto) {
		EacOutCome eacOutCome = new EacOutCome();
		eacOutCome.setId(dto.getId());
		eacOutCome.setRepeatViralLoader(dto.getRepeatViralLoader());
		eacOutCome.setOutcome(dto.getOutcome());
		eacOutCome.setPlan(dto.getPlan());
		eacOutCome.setCurrentRegimen(dto.getCurrentRegimen());
		eacOutCome.setSwitchRegimen(dto.getSwitchRegimen());
		eacOutCome.setPlanAction(dto.getPlanAction());
		eacOutCome.setArchived(0);
		return eacOutCome;
		
	}
	
	
}

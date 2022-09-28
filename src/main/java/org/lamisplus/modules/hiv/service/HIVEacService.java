package org.lamisplus.modules.hiv.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.audit4j.core.util.Log;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.hiv.domain.dto.EACStopDto;
import org.lamisplus.modules.hiv.domain.dto.HIVEacDto;
import org.lamisplus.modules.hiv.domain.dto.LabEacInfo;
import org.lamisplus.modules.hiv.domain.entity.HIVEac;
import org.lamisplus.modules.hiv.repositories.HIVEacRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.springframework.stereotype.Service;
import reactor.util.UUIDUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HIVEacService {
	
	private final HIVEacRepository hivEacRepository;
	
	private final PersonRepository personRepository;
	
	private final HandleHIVVisitEncounter handleHIVisitEncounter;
	
	
	private final ModuleService moduleService;
	
	
	public List<HIVEacDto> getPatientEAcs(Long patientId) {
		Person person = personRepository.findById(patientId)
				.orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(patientId)));
		if (moduleService.exist("Lab")) {
			Log.info("Lab module is installed {}", true);
			List<LabEacInfo> patientAllEacs = hivEacRepository.getPatientAllEacs(patientId);
			List<HIVEac> hivEacList = patientAllEacs
					.stream()
					.map(labEacInfo -> HIVEacDto.builder()
							.labNumber(labEacInfo.getLabNumber())
							.dateOfLastViralLoad(labEacInfo.getResultDate())
							.testGroup(labEacInfo.getTestGroup())
							.testName(labEacInfo.getTestName())
							.lastViralLoad(Double.valueOf(labEacInfo.getResult()))
							.testResultId(labEacInfo.getPatientId())
							.status("NOT COMMENCED")
							.personId(patientId).build()
					)
					.filter(ln -> !(hivEacRepository.getHIVEacByPersonAndLabNumber(person, ln.getLabNumber()).isPresent()))
					.map(this::mapDtoEntity)
					.map(hivEacRepository::save)
					.collect(Collectors.toList());
			Log.info("new list {}", hivEacList);
			
		}
		return hivEacRepository.getAllByPersonAndArchived(person, 0)
				.stream().map(this::mapEntityDto)
				.collect(Collectors.toList());
	}
	
	public HIVEacDto stopEac(Long id, EACStopDto data) {
		HIVEac exists = hivEacRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException(HIVEac.class, "id", String.valueOf(id)));
		exists.setReasonToStopEac(data.getReason());
		exists.setStatus("STOPPED");
		hivEacRepository.save(exists);
		return mapEntityDto(exists);
		
	}
	
	
	private HIVEac mapDtoEntity(HIVEacDto dto) {
		HIVEac hIVEac = new HIVEac();
		Long personId = dto.getPersonId();
		Person person = getPerson(personId);
		Visit visit = handleHIVisitEncounter.processAndCreateVisit(personId, dto.getDateOfLastViralLoad());
		hIVEac.setVisit(visit);
		hIVEac.setPerson(person);
		hIVEac.setLastViralLoad(dto.getLastViralLoad());
		hIVEac.setDateOfLastViralLoad(dto.getDateOfLastViralLoad());
		hIVEac.setUuid(UUIDUtils.random().toString());
		hIVEac.setStatus(dto.getStatus());
		hIVEac.setArchived(dto.getArchived());
		hIVEac.setTestResultId(dto.getTestResultId());
		hIVEac.setTestGroup(dto.getTestGroup());
		hIVEac.setTestName(dto.getTestName());
		hIVEac.setLabNumber(dto.getLabNumber());
		hIVEac.setArchived(0);
		hIVEac.setFacilityId(person.getFacilityId());
		return hIVEac;
		
	}
	
	
	private HIVEacDto mapEntityDto(HIVEac entity) {
		HIVEacDto hIVEacDto = new HIVEacDto();
		hIVEacDto.setId(entity.getId());
		hIVEacDto.setVisitId(entity.getVisit().getId());
		hIVEacDto.setPersonId(entity.getPerson().getId());
		hIVEacDto.setLastViralLoad(entity.getLastViralLoad());
		hIVEacDto.setDateOfLastViralLoad(entity.getDateOfLastViralLoad());
		hIVEacDto.setUuid(entity.getUuid());
		hIVEacDto.setStatus(entity.getStatus());
		hIVEacDto.setArchived(entity.getArchived());
		hIVEacDto.setTestResultId(entity.getTestResultId());
		hIVEacDto.setTestGroup(entity.getTestGroup());
		hIVEacDto.setTestName(entity.getTestName());
		hIVEacDto.setLabNumber(entity.getLabNumber());
		hIVEacDto.setReasonStopped(entity.getReasonToStopEac());
		return hIVEacDto;
		
	}
	
	private Person getPerson(Long personId) {
		return personRepository.findById(personId).orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
	}
	
	
	public void deleteEac(Long id) {
		HIVEac hivEac = hivEacRepository
				.findById(id)
				.orElseThrow(() -> new EntityNotFoundException(HIVEac.class, "id", String.valueOf(id)));
		hivEac.setArchived(1);
	}
}

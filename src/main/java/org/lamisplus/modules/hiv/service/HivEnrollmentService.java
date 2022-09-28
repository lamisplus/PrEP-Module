package org.lamisplus.modules.hiv.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.audit4j.core.util.Log;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.domain.entities.ApplicationCodeSet;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.hiv.domain.dto.HivEnrollmentDto;
import org.lamisplus.modules.hiv.domain.dto.HivPatientDto;
import org.lamisplus.modules.hiv.domain.entity.HivEnrollment;
import org.lamisplus.modules.hiv.repositories.HivEnrollmentRepository;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Encounter;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.EncounterRepository;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class HivEnrollmentService {
	
	private final PersonService personService;
	private final HivEnrollmentRepository hivEnrollmentRepository;
	
	private final ApplicationCodesetRepository applicationCodesetRepository;
	
	private final PersonRepository personRepository;
	
	private final CurrentUserOrganizationService currentUserOrganizationService;
	
	private final HandleHIVVisitEncounter hivVisitEncounter;
	
	
	public HivEnrollmentDto createHivEnrollment(HivEnrollmentDto hivEnrollmentDto) {
		final Long personId = hivEnrollmentDto.getPersonId();
		Person person = getPerson(personId);
		if (hivEnrollmentRepository.getHivEnrollmentByPersonAndArchived(person, 0).isPresent())
			throw new RecordExistException(HivEnrollment.class, "person", String.valueOf(person.getId()));
		HivEnrollment hivEnrollment = convertToEntity(hivEnrollmentDto);
		hivEnrollment.setPerson(person);
		Visit visit = hivVisitEncounter.processAndCreateVisit(personId, hivEnrollmentDto.getDateOfRegistration());
		if (visit != null) {
			hivEnrollment.setVisit(visit);
		}
		hivEnrollment.setUuid(UUID.randomUUID().toString());
		return convertToDto(hivEnrollmentRepository.save(hivEnrollment));
	}
	
	
	public HivEnrollmentDto updateHivEnrollment(Long id, HivEnrollmentDto hivEnrollmentDto) {
		HivEnrollment existHivEnrollment = getExistEnrollmentById(id);
		HivEnrollment hivEnrollment = convertToEntity(hivEnrollmentDto);
		hivEnrollment.setId(existHivEnrollment.getId());
		hivEnrollment.setPerson(existHivEnrollment.getPerson());
		hivEnrollment.setVisit(existHivEnrollment.getVisit());
		hivEnrollment.setArchived(0);
		return convertToDto(hivEnrollmentRepository.save(hivEnrollment));
	}
	
	
	public List<HivPatientDto> getAll() {
		return hivEnrollmentRepository.getHivEnrollmentByArchived(0)
				.stream()
				.filter(hivEnrollment -> hivEnrollment.getFacilityId().equals(currentUserOrganizationService.getCurrentUserOrganization()))
				.map(this::convertHivEnrollmentToHivPatientDto)
				.collect(Collectors.toList());
		
	}
	
	public HivEnrollmentDto getHivEnrollmentById(Long id) {
		return convertToDto(getExistEnrollmentById(id));
	}
	
	
	public void deleteHivEnrollment(Long id) {
		HivEnrollment hivEnrollment = getExistEnrollmentById(id);
		hivEnrollment.setArchived(1);
		hivEnrollmentRepository.save(hivEnrollment);
	}
	
	
	private HivEnrollment getExistEnrollmentById(Long id) {
		return hivEnrollmentRepository
				.findById(id)
				.orElseThrow(() -> new EntityNotFoundException(HivEnrollment.class, "id", "" + id));
	}
	
	private HivEnrollment convertToEntity(HivEnrollmentDto dto) {
		HivEnrollment hivEnrollment = new HivEnrollment();
		BeanUtils.copyProperties(dto, hivEnrollment);
		log.info("entity converted {} ", hivEnrollment);
		hivEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
		return hivEnrollment;
	}
	
	private HivEnrollmentDto convertToDto(HivEnrollment entity) {
		HivEnrollmentDto hivEnrollmentDto = new HivEnrollmentDto();
		BeanUtils.copyProperties(entity, hivEnrollmentDto);
		hivEnrollmentDto.setPersonId(entity.getPerson().getId());
		log.info("dto converted {} ", hivEnrollmentDto);
		hivEnrollmentDto.setVisitId(entity.getVisit().getId());
		return hivEnrollmentDto;
	}
	
	
	private HivPatientDto convertHivEnrollmentToHivPatientDto(HivEnrollment entity) {
		Person person = entity.getPerson();
		PersonResponseDto bioData = personService.getPersonById(person.getId());
		HivEnrollmentDto hivEnrollmentDto = convertToDto(entity);
		HivPatientDto hivPatientDto = new HivPatientDto();
		BeanUtils.copyProperties(bioData, hivPatientDto);
		hivPatientDto.setEnrolled(true);
		Long statusAtRegistrationId = entity.getStatusAtRegistrationId();
		Optional<ApplicationCodeSet> status = applicationCodesetRepository.findById(statusAtRegistrationId);
		status.ifPresent(applicationCodeSet -> hivPatientDto.setCurrentStatus(applicationCodeSet.getDisplay()));
		hivPatientDto.setEnrollment(hivEnrollmentDto);
		return hivPatientDto;
	}
	
	
	public Optional<HivEnrollmentDto> getHivEnrollmentByPersonIdAndArchived(Long personId) {
		Person person = getPerson(personId);
		Optional<HivEnrollment> hivEnrollment = hivEnrollmentRepository.getHivEnrollmentByPersonAndArchived(person, 0);
		return hivEnrollment.map(this::convertToDto);
	}
	
	public Person getPerson(Long personId) {
		return personRepository.findById(personId)
				.orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
	}
	
	
}



package org.lamisplus.modules.hiv.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.hiv.domain.dto.HIVStatusTrackerDto;
import org.lamisplus.modules.hiv.domain.entity.ArtPharmacy;
import org.lamisplus.modules.hiv.domain.entity.HIVStatusTracker;
import org.lamisplus.modules.hiv.repositories.ArtPharmacyRepository;
import org.lamisplus.modules.hiv.repositories.HIVStatusTrackerRepository;
import org.lamisplus.modules.patient.controller.exception.NoRecordFoundException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HIVStatusTrackerService {
	
	private final HIVStatusTrackerRepository hivStatusTrackerRepository;
	
	
	private final CurrentUserOrganizationService organizationUtil;
	
	private final PersonRepository personRepository;
	
	private final ArtPharmacyRepository artPharmacyRepository;
	
	private final HandleHIVVisitEncounter hivVisitEncounter;
	
	
	public HIVStatusTrackerDto registerHIVStatusTracker(HIVStatusTrackerDto hivStatusTrackerDto) {
		Long personId = hivStatusTrackerDto.getPersonId();
		Person existPerson = getPerson(personId);
		log.info("person   from status status {}", existPerson.getSurname());
		HIVStatusTracker hivStatusTracker = convertDtoToEntity(hivStatusTrackerDto);
		Visit visit = hivVisitEncounter.processAndCreateVisit(personId, hivStatusTrackerDto.getStatusDate());
		hivStatusTracker.setVisit(visit);
		hivStatusTracker.setArchived(0);
		hivStatusTracker.setUuid(UUID.randomUUID().toString());
		hivStatusTracker.setAuto(false);
		hivStatusTracker.setPerson(existPerson);
		return convertEntityToDto(hivStatusTrackerRepository.save(hivStatusTracker));
	}
	
	
	public HIVStatusTrackerDto updateHIVStatusTracker(Long id, HIVStatusTrackerDto hivStatusTrackerDto) {
		HIVStatusTracker existingHivStatusTracker = getExistingHivStatusTracker(id);
		HIVStatusTracker hivStatusTracker = convertDtoToEntity(hivStatusTrackerDto);
		hivStatusTracker.setId(id);
		hivStatusTracker.setArchived(0);
		hivStatusTracker.setUuid(existingHivStatusTracker.getUuid());
		hivStatusTracker.setCreatedBy(existingHivStatusTracker.getCreatedBy());
		hivStatusTracker.setCreatedDate(existingHivStatusTracker.getCreatedDate());
		hivStatusTracker.setAuto(false);
		return convertEntityToDto(hivStatusTrackerRepository.save(hivStatusTracker));
	}
	
	
	public HIVStatusTrackerDto getHIVStatusTrackerById(Long id) {
		return convertEntityToDto(getExistingHivStatusTracker(id));
	}
	
	public String getPersonCurrentHIVStatusByPersonId(Long personId) {
		Person person = getPerson(personId);
		Comparator<HIVStatusTracker> personStatusDateComparator = Comparator.comparing(HIVStatusTracker::getStatusDate);
		Optional<HIVStatusTracker> currentStatus = hivStatusTrackerRepository.findAllByPersonAndArchived(person, 0)
				.stream()
				.max(personStatusDateComparator);
		List<ArtPharmacy> pharmacyRefills = artPharmacyRepository.getArtPharmaciesByPersonAndArchived(person, 0);
		if (!pharmacyRefills.isEmpty()) {
			return currentStatus.map(this::calculatePatientCurrentStatus).orElse("HIV+ NON ART");
		}
		return currentStatus.map(HIVStatusTracker::getHivStatus).orElse("HIV+ NON ART");
	}
	
	@NotNull
	private String calculatePatientCurrentStatus(HIVStatusTracker statusTracker) {
		AtomicReference<LocalDate> statusDate = new AtomicReference<>(statusTracker.getStatusDate());
		Visit visit = statusTracker.getVisit();
		Optional<ArtPharmacy> artPharmacy =
				artPharmacyRepository
						.getArtPharmaciesByVisitAndPerson(visit, statusTracker.getPerson())
						.stream()
						.findAny();
		artPharmacy.ifPresent(p -> statusDate.set(p.getNextAppointment()));
		List<String> staticStatus = Arrays.asList("Stopped Treatment", "Died (Confirmed)", "ART Transfer Out");
		if (staticStatus.contains(statusTracker.getHivStatus())) {
			return statusTracker.getHivStatus();
		}
		int months = Period.between(statusDate.get(), LocalDate.now()).getMonths();
		log.info("month {}", months);
		if (months > 0) {
			return "IIT";
		}
		return "ACTIVE ON ART";
	}
	
	public List<HIVStatusTrackerDto> getPersonHIVStatusByPersonId(Long personId) {
		Person person = getPerson(personId);
		return hivStatusTrackerRepository.findAllByPersonAndArchived(person, 0)
				.stream()
				.map(this::convertEntityToDto)
				.collect(Collectors.toList());
		
		
	}
	
	public List<HIVStatusTrackerDto> getAllHIVStatusTracker() {
		return hivStatusTrackerRepository.findAll()
				.stream()
				.map(this::convertEntityToDto)
				.collect(Collectors.toList());
	}
	
	public void archivedHIVStatusTracker(Long id) {
		HIVStatusTracker existingHivStatusTracker = getExistingHivStatusTracker(id);
		existingHivStatusTracker.setArchived(1);
		hivStatusTrackerRepository.save(existingHivStatusTracker);
	}
	
	
	private HIVStatusTracker getExistingHivStatusTracker(Long id) {
		return hivStatusTrackerRepository.findById(id)
				.orElseThrow(() -> new NoRecordFoundException("Status find for this id " + id));
	}
	
	public HIVStatusTracker convertDtoToEntity(HIVStatusTrackerDto hivStatusTrackerDto) {
		HIVStatusTracker hivStatusTracker = new HIVStatusTracker();
		BeanUtils.copyProperties(hivStatusTrackerDto, hivStatusTracker);
		hivStatusTracker.setFacilityId(organizationUtil.getCurrentUserOrganization());
		return hivStatusTracker;
	}
	
	public HIVStatusTrackerDto convertEntityToDto(HIVStatusTracker hivStatusTracker) {
		HIVStatusTrackerDto hivStatusTrackerDto = new HIVStatusTrackerDto();
		BeanUtils.copyProperties(hivStatusTracker, hivStatusTrackerDto);
		return hivStatusTrackerDto;
		
	}
	
	
	public HIVStatusTracker findDistinctFirstByPersonAndStatusDate(Person person, LocalDate visitDate) {
		return hivStatusTrackerRepository.findDistinctFirstByPersonAndStatusDate(person, visitDate);
	}
	
	private Person getPerson(Long personId) {
		return personRepository.findById(personId).orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
		
	}
	
	
}

package org.lamisplus.modules.hiv.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.audit4j.core.util.Log;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.hiv.domain.dto.HIVStatusTrackerDto;
import org.lamisplus.modules.hiv.domain.dto.RegimenRequestDto;
import org.lamisplus.modules.hiv.domain.dto.RegisterArtPharmacyDto;
import org.lamisplus.modules.hiv.domain.entity.ArtPharmacy;
import org.lamisplus.modules.hiv.domain.entity.Regimen;
import org.lamisplus.modules.hiv.repositories.ArtPharmacyRepository;
import org.lamisplus.modules.hiv.repositories.RegimenRepository;
import org.lamisplus.modules.patient.domain.dto.EncounterResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.service.EncounterService;
import org.lamisplus.modules.patient.service.VisitService;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArtPharmacyService {
	private final ArtPharmacyRepository artPharmacyRepository;
	private final PersonRepository personRepository;
	private final RegimenRepository regimenRepository;
	private final CurrentUserOrganizationService organizationUtil;
	private final HandleHIVVisitEncounter handleHIVisitEncounter;
	
	private final HIVStatusTrackerService hIVStatusTrackerService;
	
	private final EncounterService encounterService;
	private final VisitService visitService;
	
	private final VisitRepository visitRepository;
	
	private static final String REGIMEN = "regimens";
	
	public RegisterArtPharmacyDto registerArtPharmacy(RegisterArtPharmacyDto dto) throws IOException {
		Visit visit = handleHIVisitEncounter.processAndCreateVisit(dto.getPersonId(), dto.getVisitDate());
		dto.setVisitId(visit.getId());
		if (dto.getVisitId() == null)
			throw new IllegalTypeException(Visit.class, "visit date", "kindly create a clinic visit for this patient");
		ArtPharmacy artPharmacy = convertRegisterDtoToEntity(dto);
		artPharmacy.setUuid(UUID.randomUUID().toString());
		artPharmacy.setVisit(visit);
		artPharmacy.setArchived(0);
		ArtPharmacy save = artPharmacyRepository.save(artPharmacy);
		processAndSaveHIVStatus(dto);
		processAndCheckoutHivVisit(dto.getPersonId(), visit);
		return convertEntityToRegisterDto(save);
	}
	
	
	private void processAndCheckoutHivVisit(Long personId, Visit visit) {
		List<EncounterResponseDto> nonHIVEncounters =
				encounterService.getAllEncounterByPerson(personId).stream()
						.filter(e -> e.getStatus().equalsIgnoreCase("PENDING") && !(e.getServiceCode().equalsIgnoreCase("hiv-code")))
						.collect(Collectors.toList());
		log.info("nonHIVEncounters {}", nonHIVEncounters + " visit: " + visit.getId());
		if (nonHIVEncounters.isEmpty()) {
			visitService.checkOutVisitById(visit.getId());
			LocalDateTime visitStartDate = visit.getVisitStartDate();
			visit.setVisitEndDate(visitStartDate.plusHours(24));
			visitRepository.save(visit);
		}
	}
	
	public RegisterArtPharmacyDto updateArtPharmacy(Long id, RegisterArtPharmacyDto dto) throws IOException {
		ArtPharmacy existArtPharmacy = getArtPharmacy(id);
		ArtPharmacy artPharmacy = convertRegisterDtoToEntity(dto);
		artPharmacy.setId(existArtPharmacy.getId());
		artPharmacy.setPerson(existArtPharmacy.getPerson());
		artPharmacy.setVisit(existArtPharmacy.getVisit());
		artPharmacy.setArchived(0);
		return convertEntityToRegisterDto(artPharmacyRepository.save(artPharmacy));
	}
	
	
	public RegisterArtPharmacyDto getPharmacyById(Long id) {
		ArtPharmacy artPharmacy = getArtPharmacy(id);
		return getRegisterArtPharmacyDtoWithName(artPharmacy);
		
	}
	
	
	public String deleteById(Long id) {
		ArtPharmacy artPharmacy = getArtPharmacy(id);
		artPharmacy.setArchived(1);
		artPharmacyRepository.save(artPharmacy);
		return "Successful";
		
	}
	
	
	private ArtPharmacy getArtPharmacy(Long id) {
		return artPharmacyRepository
				.findById(id)
				.orElseThrow(() -> getArtPharmacyEntityNotFoundException(id));
	}
	
	public List<RegisterArtPharmacyDto> getPharmacyByPersonId(Long personId, int pageNo, int pageSize) {
		Person person = getPerson(personId);
		Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by("visitDate").descending());
		Page<ArtPharmacy> artPharmaciesByPerson = artPharmacyRepository.getArtPharmaciesByPersonAndArchived(person, 0, paging);
		if (artPharmaciesByPerson.hasContent()) {
			return artPharmaciesByPerson.getContent().stream().map(this::getRegisterArtPharmacyDtoWithName).collect(Collectors.toList());
		}
		return new ArrayList<>();
	}
	
	
	public Regimen getCurrentRegimenByPersonId(Long personId) {
		Person person = getPerson(personId);
		Optional<Set<Regimen>> regimen =
				artPharmacyRepository.getArtPharmaciesByPersonAndArchived(person, 0)
						.stream().max(Comparator.comparing(ArtPharmacy::getVisitDate))
						.map(ArtPharmacy::getRegimens);
		if (regimen.isPresent()) {
			Set<Regimen> regimen1 = regimen.get();
			Log.info("regimen: {}", regimen1.size());
			Optional<Regimen> currentRegimen =
					regimen1.stream()
							.filter(regimen3 -> regimen3.getRegimenType().getDescription().contains("ART")
									|| regimen3.getRegimenType().getDescription().contains("Third Line"))
							.findAny();
			return currentRegimen.orElse(null);
		} else throw new IllegalArgumentException("No current regimen found");
	}
	
	
	@Nullable
	private RegisterArtPharmacyDto getRegisterArtPharmacyDtoWithName(ArtPharmacy artPharmacy) {
		try {
			RegisterArtPharmacyDto responseDto = convertEntityToRegisterDto(artPharmacy);
			JsonNode extra = responseDto.getExtra();
			
			if (extra.hasNonNull(REGIMEN)) {
				JsonNode jsonNode = extra.get(REGIMEN);
				for (JsonNode regimen : jsonNode) {
					if (regimen.hasNonNull("id")) {
						JsonNode regimenId = regimen.get("id");
						long id = regimenId.asLong();
						Optional<Regimen> optionalRegimen = regimenRepository.findById(id);
						optionalRegimen.ifPresent(regimen1 -> {
							String description = regimen1.getDescription();
							((ObjectNode) regimen).put("name", description);
							responseDto.setExtra(extra);
						});
					}
					
				}
			}
			return responseDto;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	
	private ArtPharmacy convertRegisterDtoToEntity(RegisterArtPharmacyDto dto) throws JsonProcessingException {
		ArtPharmacy artPharmacy = new ArtPharmacy();
		BeanUtils.copyProperties(dto, artPharmacy);
		log.info(" entity 1st:  {}", artPharmacy);
		Long personId = dto.getPersonId();
		Set<RegimenRequestDto> regimen = dto.getRegimen();
		Person person = getPerson(personId);
		List<ArtPharmacy> existDrugRefills = artPharmacyRepository.getArtPharmaciesByVisitAndPerson(artPharmacy.getVisit(), person);
		log.info("existDrugRefills:  {}", existDrugRefills + " " + dto.getId());
		if (!existDrugRefills.isEmpty() && dto.getId() == null) {
			throw new IllegalTypeException(ArtPharmacy.class, "visitId", "Regimen is already dispense for this visit " + dto.getVisitId());
		}
		Set<Regimen> regimenList = regimen.stream()
				.map(regimenId -> regimenRepository.findById(regimenId.getId()).orElse(null))
				.collect(Collectors.toSet());
		artPharmacy.setPerson(person);
		artPharmacy.setRegimens(regimenList);
		processAndSetDispenseRegimenInExtra(dto, artPharmacy);
		artPharmacy.setFacilityId(organizationUtil.getCurrentUserOrganization());
		log.info(" entity 2nd:  {}", artPharmacy);
		return artPharmacy;
	}
	
	private Person getPerson(Long personId) {
		return personRepository.findById(personId).orElseThrow(() -> getPersonEntityNotFoundException(personId));
	}
	
	private RegisterArtPharmacyDto convertEntityToRegisterDto(ArtPharmacy entity) throws IOException {
		RegisterArtPharmacyDto dto = new RegisterArtPharmacyDto();
		BeanUtils.copyProperties(entity, dto);
		log.info(" dto 1st:  {}", dto);
		JsonNode extra = entity.getExtra();
		
		if (extra.hasNonNull(REGIMEN)) {
			JsonNode regimens = extra.get(REGIMEN);
			ObjectMapper mapper = new ObjectMapper();
			ObjectReader reader = mapper.readerFor(new TypeReference<Set<RegimenRequestDto>>() {
			});
			Set<RegimenRequestDto> result = reader.readValue(regimens);
			dto.setRegimen(result);
		}
		log.info(" dto 1st:  {}", dto);
		dto.setPersonId(entity.getPerson().getId());
		return dto;
	}
	
	
	private void processAndSetDispenseRegimenInExtra(RegisterArtPharmacyDto dto, ArtPharmacy artPharmacy) {
		ObjectMapper objectMapper = new ObjectMapper();
		ArrayNode regimens = objectMapper.valueToTree(dto.getRegimen());
		JsonNode extra = dto.getExtra();
		((ObjectNode) extra).set(REGIMEN, regimens);
		artPharmacy.setExtra(extra);
	}
	
	
	@NotNull
	private EntityNotFoundException getArtPharmacyEntityNotFoundException(Long id) {
		return new EntityNotFoundException(ArtPharmacy.class, "id ", "" + id);
	}
	
	@NotNull
	private EntityNotFoundException getPersonEntityNotFoundException(Long personId) {
		return new EntityNotFoundException(Person.class, "id ", "" + personId);
	}
	
	private void processAndSaveHIVStatus(RegisterArtPharmacyDto dto) {
		HIVStatusTrackerDto statusTracker = new HIVStatusTrackerDto();
		statusTracker.setHivStatus("ART Start");
		statusTracker.setStatusDate(dto.getVisitDate());
		statusTracker.setVisitId(dto.getVisitId());
		statusTracker.setPersonId(dto.getPersonId());
		hIVStatusTrackerService.registerHIVStatusTracker(statusTracker);
	}
	
	
}

package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityScreeningDto;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityScreeningRequestDto;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.lamisplus.modules.prep.domain.entity.PrepEligibilityScreening;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PrepEligibilityScreeningRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepEligibilityScreeningService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepEligibilityScreeningRepository prepEligibilityScreeningRepository;
    private final PrepPepInitiationRepository prepPepInitiationRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    /** Prefer the stable person UUID over the bigint id when resolving for a write. */
    private Person resolvePersonForWrite(String personUuid, Long personId) {
        if (personUuid != null && !personUuid.trim().isEmpty()) {
            java.util.Optional<Person> byUuid = personRepository.findByUuidAndFacilityId(
                    personUuid, currentUserOrganizationService.getCurrentUserOrganization());
            if (byUuid.isPresent()) return byUuid.get();
        }
        return getPerson(personId);
    }

    public PrepEligibilityScreeningDto save(PrepEligibilityScreeningRequestDto requestDto) {
        Person person = this.resolvePersonForWrite(requestDto.getPersonUuid(), requestDto.getPersonId());
        PrepEligibilityScreening entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setUuid(UUID.randomUUID().toString());

        prepEligibilityScreeningRepository
                .findByVisitDateAndPersonUuidAndArchived(requestDto.getVisitDate(), person.getUuid(), false)
                .ifPresent(existing -> {
                    throw PrepErrors.screeningAlreadyExists(requestDto.getVisitDate());
                });

        entity = prepEligibilityScreeningRepository.save(entity);
        entity.setPerson(person);
        PrepEligibilityScreeningDto dto = entityToDto(entity);
        dto.setPrepEligibilityCount(prepEligibilityScreeningRepository.findAllByPersonUuid(person.getUuid()).size());
        return dto;
    }

    public void delete(Long id) {
        PrepEligibilityScreening entity = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));
        if (prepPepInitiationRepository.findByProphylaxisScreeningUuidAndArchived(entity.getUuid(), false).isPresent()) {
            throw PrepErrors.eligibilityHasDependentInitiation();
        }
        entity.setArchived(true);
        prepEligibilityScreeningRepository.save(entity);
    }

    public PrepEligibilityScreeningDto getById(Long id) {
        PrepEligibilityScreening entity = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public PrepEligibilityScreeningDto update(Long id, PrepEligibilityScreeningDto dto) {
        PrepEligibilityScreening entity = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));
        entity = dtoToEntity(dto, entity.getPersonUuid());
        entity.setArchived(false);
        entity.setId(id);
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity = prepEligibilityScreeningRepository.save(entity);
        return entityToDto(entity);
    }

    public List<PrepEligibilityScreeningDto> getByPersonUuid(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<PrepEligibilityScreening> list = prepEligibilityScreeningRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(personUuid,
                        currentUserOrganizationService.getCurrentUserOrganization(), false);
        return list.stream().map(this::entityToDto).collect(Collectors.toList());
    }

    public PrepEligibilityScreeningDto getOpenEligibility(Long personId) {
        Person person = this.getPerson(personId);
        return entityToDto(prepEligibilityScreeningRepository
                .findByPersonUuidAndArchived(person.getUuid(), false));
    }

    private PrepEligibilityScreening requestDtoToEntity(PrepEligibilityScreeningRequestDto dto, String personUuid) {
        if (dto == null) return null;
        PrepEligibilityScreening e = new PrepEligibilityScreening();
        e.setPersonUuid(personUuid);
        e.setScore(dto.getScore());
        e.setStiScreening(dto.getStiScreening());
        e.setDrugUseHistory(dto.getDrugUseHistory());
        e.setHivTesting(dto.getHivTesting());
        e.setUseDrugSexualPerformance(dto.getUseDrugSexualPerformance());
        e.setPersonalHivRiskAssessment(dto.getPersonalHivRiskAssessment());
        e.setSexPartnerRisk(dto.getSexPartnerRisk());
        e.setSexPartner(dto.getSexPartner());
        e.setFirstTimeVisit(dto.getFirstTimeVisit());
        e.setNumChildrenLessThanFive(dto.getNumChildrenLessThanFive());
        e.setTargetGroup(dto.getTargetGroup());
        e.setAssessmentForPepIndication(dto.getAssessmentForPepIndication());
        e.setAssessmentForAcuteHivInfection(dto.getAssessmentForAcuteHivInfection());
        e.setAssessmentForPrepEligibility(dto.getAssessmentForPrepEligibility());
        e.setServicesReceivedByClient(dto.getServicesReceivedByClient());
        e.setConsiderationForInjections(dto.getConsiderationForInjections());
        e.setReasonForDecliningPrep(dto.getReasonForDecliningPrep());
        e.setPopulationType(dto.getPopulationType());
        e.setVisitType(dto.getVisitType());
        e.setReasonForSwitch(dto.getReasonForSwitch());
        e.setVisitDate(dto.getVisitDate());
        e.setUniqueClientId(dto.getUniqueClientId());
        e.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        e.setReferredFrom(dto.getReferredFrom());
        e.setSetting(dto.getSetting());
        e.setServiceStatus(dto.getServiceStatus());
        e.setTypeOfSession(dto.getTypeOfSession());
        e.setCategory(dto.getCategory());
        e.setReceivedPrepFirstTimeThisYear(dto.getReceivedPrepFirstTimeThisYear());
        return e;
    }

    private PrepEligibilityScreening dtoToEntity(PrepEligibilityScreeningDto dto, String personUuid) {
        if (dto == null) return null;
        PrepEligibilityScreening e = new PrepEligibilityScreening();
        e.setId(dto.getId());
        e.setPersonUuid(personUuid);
        e.setScore(dto.getScore());
        e.setStiScreening(dto.getStiScreening());
        e.setDrugUseHistory(dto.getDrugUseHistory());
        e.setHivTesting(dto.getHivTesting());
        e.setUseDrugSexualPerformance(dto.getUseDrugSexualPerformance());
        e.setPersonalHivRiskAssessment(dto.getPersonalHivRiskAssessment());
        e.setSexPartnerRisk(dto.getSexPartnerRisk());
        e.setSexPartner(dto.getSexPartner());
        e.setFirstTimeVisit(dto.getFirstTimeVisit());
        e.setNumChildrenLessThanFive(dto.getNumChildrenLessThanFive());
        e.setTargetGroup(dto.getTargetGroup());
        e.setAssessmentForPepIndication(dto.getAssessmentForPepIndication());
        e.setAssessmentForAcuteHivInfection(dto.getAssessmentForAcuteHivInfection());
        e.setAssessmentForPrepEligibility(dto.getAssessmentForPrepEligibility());
        e.setServicesReceivedByClient(dto.getServicesReceivedByClient());
        e.setConsiderationForInjections(dto.getConsiderationForInjections());
        e.setReasonForDecliningPrep(dto.getReasonForDecliningPrep());
        e.setPopulationType(dto.getPopulationType());
        e.setVisitType(dto.getVisitType());
        e.setReasonForSwitch(dto.getReasonForSwitch());
        e.setVisitDate(dto.getVisitDate());
        e.setUniqueClientId(dto.getUniqueClientId());
        e.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        e.setReferredFrom(dto.getReferredFrom());
        e.setSetting(dto.getSetting());
        e.setServiceStatus(dto.getServiceStatus());
        e.setTypeOfSession(dto.getTypeOfSession());
        e.setCategory(dto.getCategory());
        e.setReceivedPrepFirstTimeThisYear(dto.getReceivedPrepFirstTimeThisYear());
        return e;
    }

    private PrepEligibilityScreeningDto entityToDto(PrepEligibilityScreening e) {
        if (e == null) return null;
        PrepEligibilityScreeningDto dto = new PrepEligibilityScreeningDto();
        dto.setId(e.getId());
        dto.setUuid(e.getUuid());
        dto.setPersonUuid(e.getPersonUuid());
        dto.setStiScreening(e.getStiScreening());
        dto.setDrugUseHistory(e.getDrugUseHistory());
        dto.setHivTesting(e.getHivTesting());
        dto.setUseDrugSexualPerformance(e.getUseDrugSexualPerformance());
        dto.setPersonalHivRiskAssessment(e.getPersonalHivRiskAssessment());
        dto.setSexPartnerRisk(e.getSexPartnerRisk());
        dto.setSexPartner(e.getSexPartner());
        dto.setFirstTimeVisit(e.getFirstTimeVisit());
        dto.setNumChildrenLessThanFive(e.getNumChildrenLessThanFive());
        dto.setTargetGroup(e.getTargetGroup());
        dto.setScore(e.getScore());
        dto.setAssessmentForPepIndication(e.getAssessmentForPepIndication());
        dto.setAssessmentForAcuteHivInfection(e.getAssessmentForAcuteHivInfection());
        dto.setAssessmentForPrepEligibility(e.getAssessmentForPrepEligibility());
        dto.setServicesReceivedByClient(e.getServicesReceivedByClient());
        dto.setConsiderationForInjections(e.getConsiderationForInjections());
        dto.setReasonForDecliningPrep(e.getReasonForDecliningPrep());
        dto.setPopulationType(e.getPopulationType());
        dto.setVisitType(e.getVisitType());
        dto.setReasonForSwitch(e.getReasonForSwitch());
        dto.setVisitDate(e.getVisitDate());
        dto.setUniqueClientId(e.getUniqueClientId());
        dto.setHtsEncounterUuid(e.getHtsEncounterUuid());
        dto.setReferredFrom(e.getReferredFrom());
        dto.setSetting(e.getSetting());
        dto.setServiceStatus(e.getServiceStatus());
        dto.setTypeOfSession(e.getTypeOfSession());
        dto.setCategory(e.getCategory());
        dto.setReceivedPrepFirstTimeThisYear(e.getReceivedPrepFirstTimeThisYear());
        return dto;
    }
}

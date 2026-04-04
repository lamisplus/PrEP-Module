package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityScreeningDto;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityScreeningRequestDto;
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

    public PrepEligibilityScreeningDto save(PrepEligibilityScreeningRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());
        PrepEligibilityScreening entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setUuid(UUID.randomUUID().toString());

        prepEligibilityScreeningRepository
                .findByVisitDateAndPersonUuidAndArchived(requestDto.getVisitDate(), person.getUuid(), 0)
                .ifPresent(existing -> {
                    if (existing.getArchived() == 0) {
                        throw new RecordExistException(PrepEligibilityScreening.class, "Visit date", String.valueOf(requestDto.getVisitDate()));
                    }
                });

        entity = prepEligibilityScreeningRepository.save(entity);
        entity.setPerson(person);
        PrepEligibilityScreeningDto dto = entityToDto(entity);
        dto.setPrepEligibilityCount(prepEligibilityScreeningRepository.findAllByPersonUuid(person.getUuid()).size());
        return dto;
    }

    public void delete(Long id) {
        PrepEligibilityScreening entity = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));
        if (prepPepInitiationRepository.findByPrepEligibilityUuid(entity.getUuid()).isPresent()) {
            throw new RecordExistException(PrepPepInitiation.class, "PrepPepInitiation", "exist for eligibility");
        }
        entity.setArchived(ARCHIVED);
        prepEligibilityScreeningRepository.save(entity);
    }

    public PrepEligibilityScreeningDto getById(Long id) {
        PrepEligibilityScreening entity = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public PrepEligibilityScreeningDto update(Long id, PrepEligibilityScreeningDto dto) {
        PrepEligibilityScreening entity = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));
        entity = dtoToEntity(dto, entity.getPersonUuid());
        entity.setArchived(UN_ARCHIVED);
        entity.setId(id);
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity = prepEligibilityScreeningRepository.save(entity);
        return entityToDto(entity);
    }

    public List<PrepEligibilityScreeningDto> getByPersonId(Long personId) {
        List<PrepEligibilityScreening> list = prepEligibilityScreeningRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED);
        return list.stream().map(this::entityToDto).collect(Collectors.toList());
    }

    public PrepEligibilityScreeningDto getOpenEligibility(Long personId) {
        Person person = this.getPerson(personId);
        return entityToDto(prepEligibilityScreeningRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED));
    }

    private PrepEligibilityScreening requestDtoToEntity(PrepEligibilityScreeningRequestDto dto, String personUuid) {
        if (dto == null) return null;
        PrepEligibilityScreening e = new PrepEligibilityScreening();
        e.setPersonUuid(personUuid);
        e.setHivRisk(dto.getHivRisk());
        e.setUniqueId(dto.getUniqueId());
        e.setScore(dto.getScore());
        e.setStiScreening(dto.getStiScreening());
        e.setDrugUseHistory(dto.getDrugUseHistory());
        e.setPersonalHivRiskAssessment(dto.getPersonalHivRiskAssessment());
        e.setSexPartnerRisk(dto.getSexPartnerRisk());
        e.setSexPartner(dto.getSexPartner());
        e.setCounselingType(dto.getCounselingType());
        e.setFirstTimeVisit(dto.getFirstTimeVisit());
        e.setNumChildrenLessThanFive(dto.getNumChildrenLessThanFive());
        e.setNumWives(dto.getNumWives());
        e.setTargetGroup(dto.getTargetGroup());
        e.setExtra(dto.getExtra());
        e.setAssessmentForPepIndication(dto.getAssessmentForPepIndication());
        e.setAssessmentForAcuteHivInfection(dto.getAssessmentForAcuteHivInfection());
        e.setAssessmentForPrepEligibility(dto.getAssessmentForPrepEligibility());
        e.setServicesReceivedByClient(dto.getServicesReceivedByClient());
        e.setConsiderationForInjections(dto.getConsiderationForInjections());
        e.setReasonForDecliningPrep(dto.getReasonForDecliningPrep());
        e.setPopulationType(dto.getPopulationType());
        e.setVisitType(dto.getVisitType());
        e.setPregnancyStatus(dto.getPregnancyStatus());
        e.setReasonForSwitch(dto.getReasonForSwitch());
        e.setVisitDate(dto.getVisitDate());
        e.setLftConducted(dto.getLftConducted());
        e.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        e.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        e.setUniqueClientId(dto.getUniqueClientId());
        e.setClientHtsCode(dto.getClientHtsCode());
        e.setReferredFrom(dto.getReferredFrom());
        e.setSetting(dto.getSetting());
        e.setServiceStatus(dto.getServiceStatus());
        e.setTypeOfSession(dto.getTypeOfSession());
        e.setCategory(dto.getCategory());
        return e;
    }

    private PrepEligibilityScreening dtoToEntity(PrepEligibilityScreeningDto dto, String personUuid) {
        if (dto == null) return null;
        PrepEligibilityScreening e = new PrepEligibilityScreening();
        e.setId(dto.getId());
        e.setPersonUuid(personUuid);
        e.setHivRisk(dto.getHivRisk());
        e.setUniqueId(dto.getUniqueId());
        e.setScore(dto.getScore());
        e.setStiScreening(dto.getStiScreening());
        e.setDrugUseHistory(dto.getDrugUseHistory());
        e.setPersonalHivRiskAssessment(dto.getPersonalHivRiskAssessment());
        e.setSexPartnerRisk(dto.getSexPartnerRisk());
        e.setSexPartner(dto.getSexPartner());
        e.setCounselingType(dto.getCounselingType());
        e.setFirstTimeVisit(dto.getFirstTimeVisit());
        e.setNumChildrenLessThanFive(dto.getNumChildrenLessThanFive());
        e.setNumWives(dto.getNumWives());
        e.setTargetGroup(dto.getTargetGroup());
        e.setExtra(dto.getExtra());
        e.setAssessmentForPepIndication(dto.getAssessmentForPepIndication());
        e.setAssessmentForAcuteHivInfection(dto.getAssessmentForAcuteHivInfection());
        e.setAssessmentForPrepEligibility(dto.getAssessmentForPrepEligibility());
        e.setServicesReceivedByClient(dto.getServicesReceivedByClient());
        e.setConsiderationForInjections(dto.getConsiderationForInjections());
        e.setReasonForDecliningPrep(dto.getReasonForDecliningPrep());
        e.setPopulationType(dto.getPopulationType());
        e.setVisitType(dto.getVisitType());
        e.setPregnancyStatus(dto.getPregnancyStatus());
        e.setReasonForSwitch(dto.getReasonForSwitch());
        e.setVisitDate(dto.getVisitDate());
        e.setLftConducted(dto.getLftConducted());
        e.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        e.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        e.setUniqueClientId(dto.getUniqueClientId());
        e.setClientHtsCode(dto.getClientHtsCode());
        e.setReferredFrom(dto.getReferredFrom());
        e.setSetting(dto.getSetting());
        e.setServiceStatus(dto.getServiceStatus());
        e.setTypeOfSession(dto.getTypeOfSession());
        e.setCategory(dto.getCategory());
        return e;
    }

    private PrepEligibilityScreeningDto entityToDto(PrepEligibilityScreening e) {
        if (e == null) return null;
        PrepEligibilityScreeningDto dto = new PrepEligibilityScreeningDto();
        dto.setId(e.getId());
        dto.setUuid(e.getUuid());
        dto.setPersonUuid(e.getPersonUuid());
        dto.setUniqueId(e.getUniqueId());
        dto.setHivRisk(e.getHivRisk());
        dto.setStiScreening(e.getStiScreening());
        dto.setDrugUseHistory(e.getDrugUseHistory());
        dto.setPersonalHivRiskAssessment(e.getPersonalHivRiskAssessment());
        dto.setSexPartnerRisk(e.getSexPartnerRisk());
        dto.setSexPartner(e.getSexPartner());
        dto.setCounselingType(e.getCounselingType());
        dto.setFirstTimeVisit(e.getFirstTimeVisit());
        dto.setNumChildrenLessThanFive(e.getNumChildrenLessThanFive());
        dto.setNumWives(e.getNumWives());
        dto.setTargetGroup(e.getTargetGroup());
        dto.setExtra(e.getExtra());
        dto.setScore(e.getScore());
        dto.setAssessmentForPepIndication(e.getAssessmentForPepIndication());
        dto.setAssessmentForAcuteHivInfection(e.getAssessmentForAcuteHivInfection());
        dto.setAssessmentForPrepEligibility(e.getAssessmentForPrepEligibility());
        dto.setServicesReceivedByClient(e.getServicesReceivedByClient());
        dto.setConsiderationForInjections(e.getConsiderationForInjections());
        dto.setReasonForDecliningPrep(e.getReasonForDecliningPrep());
        dto.setPopulationType(e.getPopulationType());
        dto.setVisitType(e.getVisitType());
        dto.setPregnancyStatus(e.getPregnancyStatus());
        dto.setReasonForSwitch(e.getReasonForSwitch());
        dto.setVisitDate(e.getVisitDate());
        dto.setLftConducted(e.getLftConducted());
        dto.setDateLiverFunctionTestResults(e.getDateLiverFunctionTestResults());
        dto.setLiverFunctionTestResults(e.getLiverFunctionTestResults());
        dto.setUniqueClientId(e.getUniqueClientId());
        dto.setClientHtsCode(e.getClientHtsCode());
        dto.setReferredFrom(e.getReferredFrom());
        dto.setSetting(e.getSetting());
        dto.setServiceStatus(e.getServiceStatus());
        dto.setTypeOfSession(e.getTypeOfSession());
        dto.setCategory(e.getCategory());
        return dto;
    }
}

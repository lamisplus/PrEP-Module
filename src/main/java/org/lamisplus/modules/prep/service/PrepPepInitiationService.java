package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PrepPepInitiationDto;
import org.lamisplus.modules.prep.domain.dto.PrepPepInitiationRequestDto;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.lamisplus.modules.prep.domain.entity.PrepFollowupVisit;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PrepEligibilityScreeningRepository;
import org.lamisplus.modules.prep.repository.PrepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepPepInitiationService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepPepInitiationRepository prepPepInitiationRepository;
    private final PrepEligibilityScreeningRepository prepEligibilityScreeningRepository;
    private final PrepFollowupVisitRepository prepFollowupVisitRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    private PrepPepInitiation getByInitiationById(Long id) {
        return prepPepInitiationRepository
                .findByIdAndArchivedAndFacilityId(id, false, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class, "id", "" + id));
    }

    public PrepPepInitiationDto save(PrepPepInitiationRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());
        PrepPepInitiation entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setUuid(UUID.randomUUID().toString());

        if (requestDto.getDateEnrolled() != null) {
            prepPepInitiationRepository
                    .findByDateEnrolledAndPersonUuidAndArchived(requestDto.getDateEnrolled(), person.getUuid(), false)
                    .ifPresent(existing -> {
                        throw PrepErrors.initiationVisitAlreadyExists(requestDto.getDateEnrolled());
                    });
        }

        entity = prepPepInitiationRepository.save(entity);
        entity.setPerson(person);
        return entityToDto(entity);
    }

    public void delete(Long id) {
        PrepPepInitiation entity = this.getByInitiationById(id);

        if (!prepFollowupVisitRepository.findAllByProphylaxisInitiationUuidAndArchived(entity.getUuid(), false).isEmpty()) {
            throw PrepErrors.enrollmentHasDependentRecords("follow-up visit");
        }

        entity.setArchived(true);
        prepPepInitiationRepository.save(entity);
    }

    public PrepPepInitiationDto update(Long id, PrepPepInitiationDto dto) {
        PrepPepInitiation entity = prepPepInitiationRepository
                .findByIdAndArchivedAndFacilityId(id, false, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class, "id", "" + id));
        String prophylaxisScreeningUuid = entity.getProphylaxisScreeningUuid();
        entity = dtoToEntity(dto, entity.getPersonUuid());
        entity.setArchived(false);
        entity.setProphylaxisScreeningUuid(prophylaxisScreeningUuid);
        entity.setId(id);
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return entityToDto(prepPepInitiationRepository.save(entity));
    }

    public PrepPepInitiationDto getById(Long id) {
        PrepPepInitiation entity = prepPepInitiationRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public List<PrepPepInitiationDto> getByPersonUuid(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<PrepPepInitiation> list = prepPepInitiationRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(personUuid,
                        currentUserOrganizationService.getCurrentUserOrganization(), false);
        return list.stream()
                .map(entity -> entityToDto(entity))
                .collect(Collectors.toList());
    }

    public PrepPepInitiationDto getOpenEnrollment(Long personId) {
        Person person = this.getPerson(personId);

        Optional<PrepPepInitiation> entityOptional = prepPepInitiationRepository
                .findByPersonUuidAndArchived(person.getUuid(), false, currentUserOrganizationService.getCurrentUserOrganization());
        if (entityOptional.isPresent()) return entityToDto(entityOptional.get());
        return new PrepPepInitiationDto();
    }

    private PrepPepInitiation requestDtoToEntity(PrepPepInitiationRequestDto dto, String personUuid) {
        if (dto == null) {
            return null;
        }

        PrepPepInitiation entity = new PrepPepInitiation();

        entity.setPersonUuid(personUuid);
        entity.setUniqueId(dto.getUniqueId());
        entity.setProphylaxisScreeningUuid(dto.getProphylaxisScreeningUuid());

        entity.setDateEnrolled(dto.getDateEnrolled());
        entity.setDateReferred(dto.getDateReferred());
        entity.setSupporterName(dto.getSupporterName());
        entity.setSupporterRelationshipType(dto.getSupporterRelationshipType());
        entity.setSupporterPhone(dto.getSupporterPhone());

        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());

        entity.setEnrollmentType(dto.getEnrollmentType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        entity.setDateOfInitialAdherenceCounseling(dto.getDateOfInitialAdherenceCounseling());
        entity.setDatePrepStarted(dto.getDatePrepStarted());
        entity.setPrepTypeAtStart(dto.getPrepTypeAtStart());
        entity.setPrepTypeAtStartOthersSpecify(dto.getPrepTypeAtStartOthersSpecify());
        entity.setPrepRegimen(dto.getPrepRegimen());
        entity.setRefillDays(dto.getRefillDays());

        return entity;
    }

    private PrepPepInitiation dtoToEntity(PrepPepInitiationDto dto, String personUuid) {
        if (dto == null) {
            return null;
        }

        PrepPepInitiation entity = new PrepPepInitiation();

        entity.setPersonUuid(personUuid);
        entity.setUniqueId(dto.getUniqueId());
        entity.setProphylaxisScreeningUuid(dto.getProphylaxisScreeningUuid());

        entity.setDateEnrolled(dto.getDateEnrolled());
        entity.setDateReferred(dto.getDateReferred());
        entity.setSupporterName(dto.getSupporterName());
        entity.setSupporterRelationshipType(dto.getSupporterRelationshipType());
        entity.setSupporterPhone(dto.getSupporterPhone());

        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());

        entity.setEnrollmentType(dto.getEnrollmentType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        entity.setDateOfInitialAdherenceCounseling(dto.getDateOfInitialAdherenceCounseling());
        entity.setDatePrepStarted(dto.getDatePrepStarted());
        entity.setPrepTypeAtStart(dto.getPrepTypeAtStart());
        entity.setPrepTypeAtStartOthersSpecify(dto.getPrepTypeAtStartOthersSpecify());
        entity.setPrepRegimen(dto.getPrepRegimen());
        entity.setRefillDays(dto.getRefillDays());

        return entity;
    }

    private PrepPepInitiationDto entityToDto(PrepPepInitiation entity) {
        if (entity == null) {
            return null;
        }

        PrepPepInitiationDto dto = new PrepPepInitiationDto();

        dto.setId(entity.getId());
        dto.setUniqueId(entity.getUniqueId());
        dto.setUuid(entity.getUuid());

        dto.setDateEnrolled(entity.getDateEnrolled());
        dto.setDateReferred(entity.getDateReferred());
        dto.setSupporterName(entity.getSupporterName());
        dto.setSupporterRelationshipType(entity.getSupporterRelationshipType());
        dto.setSupporterPhone(entity.getSupporterPhone());
        dto.setProphylaxisScreeningUuid(entity.getProphylaxisScreeningUuid());
        dto.setCommenced(true);

        dto.setHtsEncounterUuid(entity.getHtsEncounterUuid());

        dto.setEnrollmentType(entity.getEnrollmentType());
        dto.setPopulationType(entity.getPopulationType());
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setHistoryOfDrugAllergies(entity.getHistoryOfDrugAllergies());
        dto.setHistoryOfDrugToDrugInteraction(entity.getHistoryOfDrugToDrugInteraction());
        dto.setUrinalysisResult(entity.getUrinalysisResult());
        dto.setLiverFunctionTestResults(entity.getLiverFunctionTestResults());
        dto.setDateOfInitialAdherenceCounseling(entity.getDateOfInitialAdherenceCounseling());
        dto.setDatePrepStarted(entity.getDatePrepStarted());
        dto.setPrepTypeAtStart(entity.getPrepTypeAtStart());
        dto.setPrepTypeAtStartOthersSpecify(entity.getPrepTypeAtStartOthersSpecify());
        dto.setPrepRegimen(entity.getPrepRegimen());
        dto.setRefillDays(entity.getRefillDays());

        return dto;
    }
}

package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PrepCompletionDto;
import org.lamisplus.modules.prep.domain.dto.PrepCompletionRequestDto;
import org.lamisplus.modules.prep.domain.entity.PrepCompletion;
import org.lamisplus.modules.prep.repository.PrepCompletionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepCompletionService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepCompletionRepository prepCompletionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepCompletionDto save(PrepCompletionRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());
        PrepCompletion entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setUuid(UUID.randomUUID().toString());

        prepCompletionRepository
                .findByInterruptionDateAndPersonUuidAndArchived(requestDto.getInterruptionDate(), person.getUuid(), 0)
                .ifPresent(existing -> {
                    throw new RecordExistException(PrepCompletion.class, "Interruption date",
                            String.valueOf(requestDto.getInterruptionDate()));
                });

        entity = prepCompletionRepository.save(entity);
        return entityToDto(entity);
    }

    public void delete(Long id) {
        PrepCompletion entity = prepCompletionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepCompletion.class, "id", String.valueOf(id)));
        entity.setArchived(ARCHIVED);
        prepCompletionRepository.save(entity);
    }

    public PrepCompletionDto update(Long id, PrepCompletionDto dto) {
        PrepCompletion entity = prepCompletionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepCompletion.class, "id", String.valueOf(id)));
        String uuid = entity.getUuid();
        entity = dtoToEntity(dto, entity.getPersonUuid());
        entity.setArchived(UN_ARCHIVED);
        entity.setUuid(uuid);
        entity.setId(id);
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return entityToDto(prepCompletionRepository.save(entity));
    }

    public PrepCompletionDto getById(Long id) {
        Long userOrgId = currentUserOrganizationService.getCurrentUserOrganization();
        log.info("USER ORG UNIT ID :" + userOrgId);
        PrepCompletion entity = prepCompletionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepCompletion.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public List<PrepCompletionDto> getByPersonId(Long personId) {
        List<PrepCompletion> list = prepCompletionRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED);

        return list.stream()
                .map(entity -> entityToDto(entity))
                .collect(Collectors.toList());
    }

    public PrepCompletion requestDtoToEntity(PrepCompletionRequestDto dto, String personUuid) {
        if (dto == null) {
            return null;
        }

        PrepCompletion entity = new PrepCompletion();

        entity.setInterruptionType(dto.getInterruptionType());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setInterruptionDate(dto.getInterruptionDate());
        entity.setDateClientDied(dto.getDateClientDied());
        entity.setCauseOfDeath(dto.getCauseOfDeath());
        entity.setSourceOfDeathInfo(dto.getSourceOfDeathInfo());
        entity.setDateClientReferredOut(dto.getDateClientReferredOut());
        entity.setFacilityReferredTo(dto.getFacilityReferredTo());
        entity.setInterruptionReason(dto.getInterruptionReason());
        entity.setDateSeroConverted(dto.getDateSeroConverted());
        entity.setPersonUuid(personUuid);
        entity.setDateRestartPlacedBackMedication(dto.getDateRestartPlacedBackMedication());
        entity.setLinkToArt(dto.getLinkToArt());

        entity.setReasonStopped(dto.getReasonStopped());
        entity.setReasonStoppedOthers(dto.getReasonStoppedOthers());
        entity.setReasonForPrepDiscontinuation(dto.getReasonForPrepDiscontinuation());

        entity.setWhy(dto.getWhy());
        entity.setPepCompletion(dto.getPepCompletion());
        entity.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        entity.setHivResult(dto.getHivResult());
        entity.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        entity.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());

        return entity;
    }

    public PrepCompletion dtoToEntity(PrepCompletionDto dto, String personUuid) {
        if (dto == null) {
            return null;
        }

        PrepCompletion entity = new PrepCompletion();

        entity.setId(dto.getId());
        entity.setInterruptionType(dto.getInterruptionType());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setInterruptionDate(dto.getInterruptionDate());
        entity.setDateClientDied(dto.getDateClientDied());
        entity.setCauseOfDeath(dto.getCauseOfDeath());
        entity.setSourceOfDeathInfo(dto.getSourceOfDeathInfo());
        entity.setDateClientReferredOut(dto.getDateClientReferredOut());
        entity.setFacilityReferredTo(dto.getFacilityReferredTo());
        entity.setInterruptionReason(dto.getInterruptionReason());
        entity.setDateSeroConverted(dto.getDateSeroConverted());
        entity.setPersonUuid(personUuid);
        entity.setDateRestartPlacedBackMedication(dto.getDateRestartPlacedBackMedication());
        entity.setLinkToArt(dto.getLinkToArt());

        entity.setReasonStopped(dto.getReasonStopped());
        entity.setReasonStoppedOthers(dto.getReasonStoppedOthers());
        entity.setReasonForPrepDiscontinuation(dto.getReasonForPrepDiscontinuation());

        entity.setWhy(dto.getWhy());
        entity.setPepCompletion(dto.getPepCompletion());
        entity.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        entity.setHivResult(dto.getHivResult());
        entity.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        entity.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());

        return entity;
    }

    public PrepCompletionDto entityToDto(PrepCompletion entity) {
        if (entity == null) {
            return null;
        }

        PrepCompletionDto dto = new PrepCompletionDto();

        dto.setId(entity.getId());
        dto.setInterruptionType(entity.getInterruptionType());
        dto.setPreviousPrepStatus(entity.getPreviousPrepStatus());
        dto.setInterruptionDate(entity.getInterruptionDate());
        dto.setDateClientDied(entity.getDateClientDied());
        dto.setCauseOfDeath(entity.getCauseOfDeath());
        dto.setSourceOfDeathInfo(entity.getSourceOfDeathInfo());
        dto.setDateClientReferredOut(entity.getDateClientReferredOut());
        dto.setFacilityReferredTo(entity.getFacilityReferredTo());
        dto.setInterruptionReason(entity.getInterruptionReason());
        dto.setDateSeroConverted(entity.getDateSeroConverted());
        dto.setDateRestartPlacedBackMedication(entity.getDateRestartPlacedBackMedication());
        dto.setLinkToArt(entity.getLinkToArt());

        dto.setReasonStopped(entity.getReasonStopped());
        dto.setReasonStoppedOthers(entity.getReasonStoppedOthers());
        dto.setReasonForPrepDiscontinuation(entity.getReasonForPrepDiscontinuation());

        dto.setWhy(entity.getWhy());
        dto.setPepCompletion(entity.getPepCompletion());
        dto.setFollowUpVisitDate(entity.getFollowUpVisitDate());
        dto.setHivResult(entity.getHivResult());
        dto.setEarlyDetectViralLoadResult(entity.getEarlyDetectViralLoadResult());
        dto.setPrepEnrollmentUuid(entity.getPrepEnrollmentUuid());

        return dto;
    }
}

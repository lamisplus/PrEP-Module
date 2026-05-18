package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PrepCompletionDto;
import org.lamisplus.modules.prep.domain.dto.PrepCompletionRequestDto;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.lamisplus.modules.prep.domain.entity.ProphylaxisInterruption;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.repository.ProphylaxisInterruptionRepository;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepCompletionService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final ProphylaxisInterruptionRepository prophylaxisInterruptionRepository;
    private final PrepPepInitiationRepository prepPepInitiationRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepCompletionDto save(PrepCompletionRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());
        ProphylaxisInterruption entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setUuid(UUID.randomUUID().toString());

        prophylaxisInterruptionRepository
                .findFirstByInterruptionDateAndPersonUuidAndArchivedOrderByIdAsc(requestDto.getInterruptionDate(), person.getUuid(), false)
                .ifPresent(existing -> {
                    throw PrepErrors.interruptionAlreadyExists(requestDto.getInterruptionDate());
                });

        // Resolve the matching prophylaxis_initiation (by enrollment type, latest first) and
        // 1) link this completion to it via prophylaxis_initiation_uuid; 2) flip is_interrupted
        // on the initiation so the patient's current status is now "interrupted on that arm".
        String enrollmentType = EnrollmentType.toCanonical(requestDto.getEnrollmentType());
        Optional<PrepPepInitiation> latestInitiation = (enrollmentType != null && !enrollmentType.isEmpty())
                ? prepPepInitiationRepository.findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, enrollmentType)
                : prepPepInitiationRepository.findTopByPersonUuidAndArchived(person.getUuid(), false);
        if (!latestInitiation.isPresent()
                && requestDto.getPrepEnrollmentUuid() != null
                && !requestDto.getPrepEnrollmentUuid().isEmpty()) {
            latestInitiation = prepPepInitiationRepository.findByUuid(requestDto.getPrepEnrollmentUuid());
        }
        PrepPepInitiation init = latestInitiation.orElseThrow(() -> new EntityNotFoundException(
                PrepPepInitiation.class, "PersonUuid/EnrollmentType",
                person.getUuid() + "/" + enrollmentType));
        if (!init.getPersonUuid().equals(person.getUuid())) {
            throw PrepErrors.personMismatch("initiation");
        }
        entity.setProphylaxisInitiationUuid(init.getUuid());
        init.setIsInterrupted(true);
        prepPepInitiationRepository.save(init);

        entity = prophylaxisInterruptionRepository.save(entity);
        return entityToDto(entity);
    }

    public void delete(Long id) {
        ProphylaxisInterruption entity = prophylaxisInterruptionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(ProphylaxisInterruption.class, "id", String.valueOf(id)));
        entity.setArchived(true);
        prophylaxisInterruptionRepository.save(entity);
    }

    public PrepCompletionDto update(Long id, PrepCompletionDto dto) {
        ProphylaxisInterruption existing = prophylaxisInterruptionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(ProphylaxisInterruption.class, "id", String.valueOf(id)));

        String existingUuid = existing.getUuid();
        String existingProphylaxisInitiationUuid = existing.getProphylaxisInitiationUuid();
        String existingEnrollmentType = existing.getEnrollmentType();

        ProphylaxisInterruption entity = dtoToEntity(dto, existing.getPersonUuid());
        entity.setArchived(false);
        entity.setUuid(existingUuid);
        entity.setId(id);
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());

        if (entity.getProphylaxisInitiationUuid() == null || entity.getProphylaxisInitiationUuid().isEmpty()) {
            entity.setProphylaxisInitiationUuid(existingProphylaxisInitiationUuid);
        }
        if (entity.getEnrollmentType() == null || entity.getEnrollmentType().isEmpty()) {
            entity.setEnrollmentType(existingEnrollmentType);
        }

        return entityToDto(prophylaxisInterruptionRepository.save(entity));
    }

    public PrepCompletionDto getById(Long id) {
        ProphylaxisInterruption entity = prophylaxisInterruptionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(ProphylaxisInterruption.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public List<PrepCompletionDto> getByPersonId(Long personId) {
        List<ProphylaxisInterruption> list = prophylaxisInterruptionRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(), false);
        return list.stream().map(this::entityToDto).collect(Collectors.toList());
    }

    private ProphylaxisInterruption requestDtoToEntity(PrepCompletionRequestDto dto, String personUuid) {
        if (dto == null) return null;
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setPersonUuid(personUuid);
        e.setInterruptionType(dto.getInterruptionType());
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setInterruptionDate(dto.getInterruptionDate());
        e.setDateDefaulted(dto.getDateDefaulted());
        e.setInterruptionReason(dto.getInterruptionReason());
        e.setDateClientDied(dto.getDateClientDied());
        e.setCauseOfDeath(dto.getCauseOfDeath());
        e.setSourceOfDeathInfo(dto.getSourceOfDeathInfo());
        e.setDateClientReferredOut(dto.getDateClientReferredOut());
        e.setFacilityReferredTo(dto.getFacilityReferredTo());
        e.setDateSeroConverted(dto.getDateSeroConverted());
        e.setDateRestartPlacedBackMedication(dto.getDateRestartPlacedBackMedication());
        e.setLinkToArt(dto.getLinkToArt());
        e.setReasonStopped(dto.getReasonStopped());
        e.setReasonStoppedOthers(dto.getReasonStoppedOthers());
        e.setReasonForPrepDiscontinuation(dto.getReasonForPrepDiscontinuation());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHivResult(dto.getHivResult());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        e.setProphylaxisInitiationUuid(dto.getPrepEnrollmentUuid());
        e.setEnrollmentType(dto.getEnrollmentType());
        return e;
    }

    private ProphylaxisInterruption dtoToEntity(PrepCompletionDto dto, String personUuid) {
        if (dto == null) return null;
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setId(dto.getId());
        e.setPersonUuid(personUuid);
        e.setInterruptionType(dto.getInterruptionType());
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setInterruptionDate(dto.getInterruptionDate());
        e.setDateDefaulted(dto.getDateDefaulted());
        e.setInterruptionReason(dto.getInterruptionReason());
        e.setDateClientDied(dto.getDateClientDied());
        e.setCauseOfDeath(dto.getCauseOfDeath());
        e.setSourceOfDeathInfo(dto.getSourceOfDeathInfo());
        e.setDateClientReferredOut(dto.getDateClientReferredOut());
        e.setFacilityReferredTo(dto.getFacilityReferredTo());
        e.setDateSeroConverted(dto.getDateSeroConverted());
        e.setDateRestartPlacedBackMedication(dto.getDateRestartPlacedBackMedication());
        e.setLinkToArt(dto.getLinkToArt());
        e.setReasonStopped(dto.getReasonStopped());
        e.setReasonStoppedOthers(dto.getReasonStoppedOthers());
        e.setReasonForPrepDiscontinuation(dto.getReasonForPrepDiscontinuation());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHivResult(dto.getHivResult());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        e.setProphylaxisInitiationUuid(dto.getPrepEnrollmentUuid());
        e.setEnrollmentType(dto.getEnrollmentType());
        return e;
    }

    private PrepCompletionDto entityToDto(ProphylaxisInterruption e) {
        if (e == null) return null;
        PrepCompletionDto dto = new PrepCompletionDto();
        dto.setId(e.getId());
        dto.setInterruptionType(e.getInterruptionType());
        dto.setPreviousPrepStatus(e.getPreviousPrepStatus());
        dto.setInterruptionDate(e.getInterruptionDate());
        dto.setDateDefaulted(e.getDateDefaulted());
        dto.setInterruptionReason(e.getInterruptionReason());
        dto.setDateClientDied(e.getDateClientDied());
        dto.setCauseOfDeath(e.getCauseOfDeath());
        dto.setSourceOfDeathInfo(e.getSourceOfDeathInfo());
        dto.setDateClientReferredOut(e.getDateClientReferredOut());
        dto.setFacilityReferredTo(e.getFacilityReferredTo());
        dto.setDateSeroConverted(e.getDateSeroConverted());
        dto.setDateRestartPlacedBackMedication(e.getDateRestartPlacedBackMedication());
        dto.setLinkToArt(e.getLinkToArt());
        dto.setReasonStopped(e.getReasonStopped());
        dto.setReasonStoppedOthers(e.getReasonStoppedOthers());
        dto.setReasonForPrepDiscontinuation(e.getReasonForPrepDiscontinuation());
        dto.setWhy(e.getWhy());
        dto.setPepCompletion(e.getPepCompletion());
        dto.setFollowUpVisitDate(e.getFollowUpVisitDate());
        dto.setHivResult(e.getHivResult());
        dto.setEarlyDetectViralLoadResult(e.getEarlyDetectViralLoadResult());
        dto.setPrepEnrollmentUuid(e.getProphylaxisInitiationUuid());
        dto.setEnrollmentType(e.getEnrollmentType());
        return dto;
    }
}

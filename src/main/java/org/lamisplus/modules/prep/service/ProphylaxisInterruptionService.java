package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.ProphylaxisInterruptionDto;
import org.lamisplus.modules.prep.domain.dto.ProphylaxisInterruptionRequestDto;
import org.lamisplus.modules.prep.domain.entity.ProphylaxisInterruption;
import org.lamisplus.modules.prep.repository.ProphylaxisInterruptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProphylaxisInterruptionService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final ProphylaxisInterruptionRepository repository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public ProphylaxisInterruptionDto save(ProphylaxisInterruptionRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());
        ProphylaxisInterruption entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setUuid(UUID.randomUUID().toString());
        entity = repository.save(entity);
        entity.setPerson(person);
        return entityToDto(entity);
    }

    public ProphylaxisInterruptionDto update(Long id, ProphylaxisInterruptionDto dto) {
        ProphylaxisInterruption entity = repository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(ProphylaxisInterruption.class, "id", String.valueOf(id)));
        ProphylaxisInterruption updated = dtoToEntity(dto, entity.getPersonUuid());
        updated.setId(id);
        updated.setUuid(entity.getUuid());
        updated.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        updated.setArchived(false);
        updated = repository.save(updated);
        return entityToDto(updated);
    }

    public void delete(Long id) {
        ProphylaxisInterruption entity = repository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(ProphylaxisInterruption.class, "id", String.valueOf(id)));
        entity.setArchived(true);
        repository.save(entity);
    }

    public ProphylaxisInterruptionDto getById(Long id) {
        ProphylaxisInterruption entity = repository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(ProphylaxisInterruption.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public List<ProphylaxisInterruptionDto> getByPersonId(Long personId) {
        Person person = getPerson(personId);
        return repository
                .findAllByPersonUuidAndFacilityIdAndArchived(person.getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(), false)
                .stream().map(this::entityToDto).collect(Collectors.toList());
    }

    private ProphylaxisInterruption requestDtoToEntity(ProphylaxisInterruptionRequestDto dto, String personUuid) {
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setPersonUuid(personUuid);
        e.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());
        e.setInterruptionType(dto.getInterruptionType());
        e.setInterruptionDate(dto.getInterruptionDate());
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
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setPreviousPepStatus(dto.getPreviousPepStatus());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHivResult(dto.getHivResult());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        return e;
    }

    private ProphylaxisInterruption dtoToEntity(ProphylaxisInterruptionDto dto, String personUuid) {
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setId(dto.getId());
        e.setPersonUuid(personUuid);
        e.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());
        e.setInterruptionType(dto.getInterruptionType());
        e.setInterruptionDate(dto.getInterruptionDate());
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
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setPreviousPepStatus(dto.getPreviousPepStatus());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHivResult(dto.getHivResult());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        return e;
    }

    private ProphylaxisInterruptionDto entityToDto(ProphylaxisInterruption e) {
        if (e == null) return null;
        return ProphylaxisInterruptionDto.builder()
                .id(e.getId())
                .uuid(e.getUuid())
                .personUuid(e.getPersonUuid())
                .prepEnrollmentUuid(e.getPrepEnrollmentUuid())
                .interruptionType(e.getInterruptionType())
                .interruptionDate(e.getInterruptionDate())
                .interruptionReason(e.getInterruptionReason())
                .dateClientDied(e.getDateClientDied())
                .causeOfDeath(e.getCauseOfDeath())
                .sourceOfDeathInfo(e.getSourceOfDeathInfo())
                .dateClientReferredOut(e.getDateClientReferredOut())
                .facilityReferredTo(e.getFacilityReferredTo())
                .dateSeroConverted(e.getDateSeroConverted())
                .dateRestartPlacedBackMedication(e.getDateRestartPlacedBackMedication())
                .linkToArt(e.getLinkToArt())
                .reasonStopped(e.getReasonStopped())
                .reasonStoppedOthers(e.getReasonStoppedOthers())
                .reasonForPrepDiscontinuation(e.getReasonForPrepDiscontinuation())
                .previousPrepStatus(e.getPreviousPrepStatus())
                .previousPepStatus(e.getPreviousPepStatus())
                .why(e.getWhy())
                .pepCompletion(e.getPepCompletion())
                .followUpVisitDate(e.getFollowUpVisitDate())
                .hivResult(e.getHivResult())
                .earlyDetectViralLoadResult(e.getEarlyDetectViralLoadResult())
                .build();
    }
}

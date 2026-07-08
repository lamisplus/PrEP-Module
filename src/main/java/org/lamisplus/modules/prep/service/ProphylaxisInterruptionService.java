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

    /** Prefer the stable person UUID over the bigint id when resolving for a write. */
    private Person resolvePersonForWrite(String personUuid, Long personId) {
        if (personUuid != null && !personUuid.trim().isEmpty()) {
            java.util.Optional<Person> byUuid = personRepository.findByUuidAndFacilityId(
                    personUuid, currentUserOrganizationService.getCurrentUserOrganization());
            if (byUuid.isPresent()) return byUuid.get();
        }
        return getPerson(personId);
    }

    public ProphylaxisInterruptionDto save(ProphylaxisInterruptionRequestDto requestDto) {
        Person person = this.resolvePersonForWrite(requestDto.getPersonUuid(), requestDto.getPersonId());
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

    public List<ProphylaxisInterruptionDto> getByPersonUuid(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return repository
                .findAllByPersonUuidAndFacilityIdAndArchived(personUuid,
                        currentUserOrganizationService.getCurrentUserOrganization(), false)
                .stream().map(this::entityToDto).collect(Collectors.toList());
    }

    private ProphylaxisInterruption requestDtoToEntity(ProphylaxisInterruptionRequestDto dto, String personUuid) {
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setPersonUuid(personUuid);
        e.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        e.setInterruptionType(dto.getInterruptionType());
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
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setPreviousPepStatus(dto.getPreviousPepStatus());
        e.setEnrollmentType(dto.getEnrollmentType());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        return e;
    }

    private ProphylaxisInterruption dtoToEntity(ProphylaxisInterruptionDto dto, String personUuid) {
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setId(dto.getId());
        e.setPersonUuid(personUuid);
        e.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        e.setInterruptionType(dto.getInterruptionType());
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
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setPreviousPepStatus(dto.getPreviousPepStatus());
        e.setEnrollmentType(dto.getEnrollmentType());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        return e;
    }

    private ProphylaxisInterruptionDto entityToDto(ProphylaxisInterruption e) {
        if (e == null) return null;
        return ProphylaxisInterruptionDto.builder()
                .id(e.getId())
                .uuid(e.getUuid())
                .personUuid(e.getPersonUuid())
                .prophylaxisInitiationUuid(e.getProphylaxisInitiationUuid())
                .interruptionType(e.getInterruptionType())
                .interruptionDate(e.getInterruptionDate())
                .dateDefaulted(e.getDateDefaulted())
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
                .enrollmentType(e.getEnrollmentType())
                .why(e.getWhy())
                .pepCompletion(e.getPepCompletion())
                .followUpVisitDate(e.getFollowUpVisitDate())
                .htsEncounterUuid(e.getHtsEncounterUuid())
                .earlyDetectViralLoadResult(e.getEarlyDetectViralLoadResult())
                .build();
    }
}

package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.domain.entity.*;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.lamisplus.modules.prep.repository.PrepInterruptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepInterruptionService {
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepEnrollmentRepository prepEnrollmentRepository;
    private final PrepEligibilityRepository prepEligibilityRepository;

    private final VisitService visitService;
    private final VisitRepository visitRepository;
    private final PrepClinicRepository prepClinicRepository;
    private final PatientActivityService patientActivityService;

    private ModuleService moduleService;

    private final PrepInterruptionRepository prepInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }

    public void delete(Long id){
        PrepInterruption interruption = prepInterruptionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(PrepInterruption.class, "id", String.valueOf(id)));
        interruption.setArchived(ARCHIVED);
        prepInterruptionRepository.save(interruption);
    }

    public PrepInterruptionDto update(Long id, PrepInterruptionDto interruptionDto){
        PrepInterruption interruption = prepInterruptionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(PrepInterruption.class, "id", String.valueOf(id)));
        String uuid = interruption.getUuid();
        interruption = interruptionDtoInterruption(interruptionDto, interruption.getPersonUuid());
        interruption.setArchived(UN_ARCHIVED);
        interruption.setUuid(uuid);
        interruption.setId(id);
        interruption.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return interruptionToInterruptionDto(prepInterruptionRepository.save(interruption));
    }

    public PrepInterruptionDto getInterruptionById(Long id){
        Long userOrgId = currentUserOrganizationService.getCurrentUserOrganization();
        log.info("USER ORG UNIT ID :" + userOrgId);
        Optional<PrepInterruption> interruption = prepInterruptionRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED);
                if (!interruption.isPresent()) {
                    throw new EntityNotFoundException(PrepInterruption.class, "id", String.valueOf(id));
                }
        return interruptionToInterruptionDto(interruption.get());
    }

    public List<PrepInterruptionDto> getInterruptionByPersonId(Long personId){
        List<PrepInterruption> interruptions = prepInterruptionRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED);

        return interruptions.stream()
                .map(interruption-> interruptionToInterruptionDto(interruption))
                .collect(Collectors.toList());
    }

    public PrepInterruption interruptionRequestDtoInterruption(PrepInterruptionRequestDto interruptionRequestDto, String personUuid) {
        if ( interruptionRequestDto == null ) {
            return null;
        }

        PrepInterruption prepInterruption = new PrepInterruption();

        prepInterruption.setInterruptionType( interruptionRequestDto.getInterruptionType() );
        prepInterruption.setInterruptionDate( interruptionRequestDto.getInterruptionDate() );
        prepInterruption.setDateClientDied( interruptionRequestDto.getDateClientDied() );
        prepInterruption.setCauseOfDeath( interruptionRequestDto.getCauseOfDeath() );
        prepInterruption.setSourceOfDeathInfo( interruptionRequestDto.getSourceOfDeathInfo() );
        prepInterruption.setDateClientReferredOut( interruptionRequestDto.getDateClientReferredOut() );
        prepInterruption.setFacilityReferredTo( interruptionRequestDto.getFacilityReferredTo() );
        prepInterruption.setInterruptionReason( interruptionRequestDto.getInterruptionReason() );
        prepInterruption.setDateSeroConverted(interruptionRequestDto.getDateSeroConverted());
        prepInterruption.setPersonUuid(personUuid);
        prepInterruption.setDateRestartPlacedBackMedication(interruptionRequestDto.getDateRestartPlacedBackMedication());
        prepInterruption.setLinkToArt(interruptionRequestDto.getLinkToArt());

        prepInterruption.setReasonStopped(interruptionRequestDto.getReasonStopped());
        prepInterruption.setReasonStoppedOthers(interruptionRequestDto.getReasonStoppedOthers());
        prepInterruption.setReasonForPrepDiscontinuation(interruptionRequestDto.getReasonForPrepDiscontinuation());

        return prepInterruption;
    }

    public PrepInterruption interruptionDtoInterruption(PrepInterruptionDto interruptionDto, String personUuid) {
        if ( interruptionDto == null ) {
            return null;
        }

        PrepInterruption prepInterruption = new PrepInterruption();

        prepInterruption.setId(interruptionDto.getId());
        prepInterruption.setInterruptionType( interruptionDto.getInterruptionType() );
        prepInterruption.setInterruptionDate( interruptionDto.getInterruptionDate() );
        prepInterruption.setDateClientDied( interruptionDto.getDateClientDied() );
        prepInterruption.setCauseOfDeath( interruptionDto.getCauseOfDeath() );
        prepInterruption.setSourceOfDeathInfo( interruptionDto.getSourceOfDeathInfo() );
        prepInterruption.setDateClientReferredOut( interruptionDto.getDateClientReferredOut() );
        prepInterruption.setFacilityReferredTo( interruptionDto.getFacilityReferredTo() );
        prepInterruption.setInterruptionReason( interruptionDto.getInterruptionReason() );
        prepInterruption.setDateSeroConverted(interruptionDto.getDateSeroConverted());
        prepInterruption.setPersonUuid(personUuid);
        prepInterruption.setDateRestartPlacedBackMedication(interruptionDto.getDateRestartPlacedBackMedication());
        prepInterruption.setLinkToArt(interruptionDto.getLinkToArt());

        prepInterruption.setReasonStopped(interruptionDto.getReasonStopped());
        prepInterruption.setReasonStoppedOthers(interruptionDto.getReasonStoppedOthers());

        return prepInterruption;
    }


    public PrepInterruptionDto interruptionToInterruptionDto(PrepInterruption prepInterruption) {
        if ( prepInterruption == null ) {
            return null;
        }

        PrepInterruptionDto prepInterruptionDto = new PrepInterruptionDto();

        prepInterruptionDto.setId(prepInterruption.getId());
        prepInterruptionDto.setInterruptionType( prepInterruption.getInterruptionType() );
        prepInterruptionDto.setInterruptionDate( prepInterruption.getInterruptionDate() );
        prepInterruptionDto.setDateClientDied( prepInterruption.getDateClientDied() );
        prepInterruptionDto.setCauseOfDeath( prepInterruption.getCauseOfDeath() );
        prepInterruptionDto.setSourceOfDeathInfo( prepInterruption.getSourceOfDeathInfo() );
        prepInterruptionDto.setDateClientReferredOut( prepInterruption.getDateClientReferredOut() );
        prepInterruptionDto.setFacilityReferredTo( prepInterruption.getFacilityReferredTo() );
        prepInterruptionDto.setInterruptionReason( prepInterruption.getInterruptionReason() );
        prepInterruptionDto.setDateSeroConverted(prepInterruption.getDateSeroConverted());
        prepInterruptionDto.setDateRestartPlacedBackMedication(prepInterruption.getDateRestartPlacedBackMedication());
        prepInterruptionDto.setLinkToArt(prepInterruption.getLinkToArt());

        prepInterruptionDto.setReasonStopped(prepInterruption.getReasonStopped());
        prepInterruptionDto.setReasonStoppedOthers(prepInterruption.getReasonStoppedOthers());


        return prepInterruptionDto;
    }

}

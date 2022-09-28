package org.lamisplus.modules.hiv.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.hiv.domain.dto.ObservationDto;
import org.lamisplus.modules.hiv.domain.entity.Observation;
import org.lamisplus.modules.hiv.repositories.ObservationRepository;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ObservationService {

    private final ObservationRepository observationRepository;
    private final PersonRepository personRepository;

    private final CurrentUserOrganizationService currentUserOrganizationService;
    
   private final HandleHIVVisitEncounter handleHIVisitEncounter;

    public ObservationDto createAnObservation(ObservationDto observationDto) {
        Long personId = observationDto.getPersonId ();
        Person person = getPerson (personId);
        Long orgId = currentUserOrganizationService.getCurrentUserOrganization ();
        if (getAnExistingObservationType (observationDto, person, orgId).isPresent ()) {
            throw new RecordExistException (Observation.class, "type", observationDto.getType ());
        }
        observationDto.setFacilityId (orgId);
        Visit visit = handleHIVisitEncounter.processAndCreateVisit (personId, observationDto.getDateOfObservation());
        if (visit != null) {
            observationDto.setVisitId (visit.getId ());
        }
        Observation observation = new Observation ();
        BeanUtils.copyProperties (observationDto, observation);
        observation.setPerson (person);
        observation.setUuid (UUID.randomUUID ().toString ());
        observation.setVisit (visit);
        observation.setArchived (0);
        Observation saveObservation = observationRepository.save (observation);
        observationDto.setId (saveObservation.getId ());
        return observationDto;
    }

    private Optional<Observation> getAnExistingObservationType(ObservationDto observationDto, Person person, Long orgId) {
        return observationRepository.getAllByTypeAndPersonAndFacilityId (observationDto.getType (), person, orgId);
    }


    public ObservationDto updateObservation(Long id, ObservationDto observationDto) {
        Observation existingObservation = observationRepository.findById (id)
                .orElseThrow (() -> new EntityNotFoundException (Observation.class, "id", String.valueOf (id)));
        existingObservation.setType (observationDto.getType ());
        existingObservation.setDateOfObservation (observationDto.getDateOfObservation ());
        existingObservation.setData (observationDto.getData ());
        Observation saveObservation = observationRepository.save (existingObservation);
        observationDto.setId (saveObservation.getId ());
        observationDto.setFacilityId (saveObservation.getFacilityId ());
        return observationDto;
    }

    public ObservationDto getObservationById(Long id) {
        return convertObservationToDto (getObservation (id));
    }

    public String deleteById(Long id) {
        Observation observation = getObservation (id);
        observation.setArchived (1);
        observationRepository.save (observation);
        return "successfully";
    }

    private Observation getObservation(Long id) {
        return observationRepository.findById (id).orElseThrow (() -> new EntityNotFoundException (Observation.class, "id", Long.toString (id)));
    }

    public List<ObservationDto> getAllObservationByPerson(Long personId) {
        Person person = getPerson (personId);
        Long currentUserOrganization = currentUserOrganizationService.getCurrentUserOrganization ();
        List<Observation> observations = observationRepository.getAllByPersonAndFacilityId (person, currentUserOrganization);
        return observations.stream ()
                .filter (observation -> observation.getArchived () == 0)
                .map (this::convertObservationToDto).collect (Collectors.toList ());


    }

    private ObservationDto convertObservationToDto(Observation observation) {
        return ObservationDto
                .builder ()
                .dateOfObservation (observation.getDateOfObservation ())
                .data (observation.getData ())
                .personId (observation.getPerson ().getId ())
                .facilityId (observation.getFacilityId ())
                .type (observation.getType ())
                .visitId (observation.getVisit ().getId ())
                .id (observation.getId ())
                .build ();
    }

    private Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException (Person.class, "id", String.valueOf (personId)));

    }
}

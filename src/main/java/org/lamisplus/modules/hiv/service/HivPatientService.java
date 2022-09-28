package org.lamisplus.modules.hiv.service;

import lombok.RequiredArgsConstructor;
import org.audit4j.core.util.Log;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.entities.ApplicationCodeSet;
import org.lamisplus.modules.base.domain.repositories.ApplicationCodesetRepository;
import org.lamisplus.modules.hiv.domain.dto.HivEnrollmentDto;
import org.lamisplus.modules.hiv.domain.dto.HivPatientDto;
import org.lamisplus.modules.hiv.domain.dto.HivPatientEnrollmentDto;
import org.lamisplus.modules.hiv.domain.dto.PatientActivity;
import org.lamisplus.modules.hiv.domain.entity.ARTClinical;
import org.lamisplus.modules.hiv.domain.entity.Observation;
import org.lamisplus.modules.hiv.repositories.ARTClinicalRepository;
import org.lamisplus.modules.hiv.repositories.ObservationRepository;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HivPatientService {
    private final ARTClinicalRepository artClinicalRepository;

    private final ArtCommenceService commenceService;

    private final ArtClinicVisitService artClinicVisitService;

    private final HIVStatusTrackerService statusTrackerService;


    private final PersonService personService;

    private final PersonRepository personRepository;

    private final HivEnrollmentService hivEnrollmentService;

    private final ApplicationCodesetRepository applicationCodesetRepository;

    private final CurrentUserOrganizationService currentUserOrganizationService;

    private final ObservationRepository observationRepository;

    private final  PatientActivityService patientActivityService;

    public HivEnrollmentDto registerAndEnrollHivPatient(HivPatientEnrollmentDto hivPatientEnrollmentDto) {
        HivEnrollmentDto hivEnrollmentDto = hivPatientEnrollmentDto.getHivEnrollment ();
        Long personId = hivPatientEnrollmentDto.getPerson ().getId ();
        processAndSavePatient (hivPatientEnrollmentDto, hivEnrollmentDto, personId);
        hivEnrollmentDto.setFacilityId (currentUserOrganizationService.getCurrentUserOrganization ());
        return hivEnrollmentService.createHivEnrollment (hivEnrollmentDto);
    }


    private void processAndSavePatient(HivPatientEnrollmentDto hivPatientEnrollmentDto, HivEnrollmentDto hivEnrollmentDto, Long personId) {
        if (personId == null) {
            PersonResponseDto person = personService.createPerson (hivPatientEnrollmentDto.getPerson ());
            hivEnrollmentDto.setPersonId (person.getId ());
        } else {
            hivEnrollmentDto.setPersonId (personId);
        }
    }

    public List<HivPatientDto> getHivCheckedInPatients() {
        return personService.getCheckedInPersonsByServiceCodeAndVisitId ("hiv-code")
                .stream ()
                .map (p -> convertPersonHivPatientDto (p.getId ()))
                .collect (Collectors.toList ());
    }


    public List<HivPatientDto> getHivPatients() {
        return personService.getAllPerson ()
                .stream ()
                .sorted (Comparator.comparing (PersonResponseDto::getId).reversed ())
                .map (p -> convertPersonHivPatientDto (p.getId ()))
                .collect (Collectors.toList ());
    }
    
    public List<HivPatientDto> getIITHivPatients() {
        return personService.getAllPerson()
                .stream()
                .sorted(Comparator.comparing(PersonResponseDto::getId).reversed())
                .map(p -> convertPersonHivPatientDto(p.getId()))
                .filter(Objects::nonNull)
                .filter(p -> p.getCurrentStatus().equalsIgnoreCase("IIT"))
                .collect (Collectors.toList ());
    }

    public HivPatientDto getHivPatientById(Long personId) {
        return convertPersonHivPatientDto (personId);
    }


    private HivPatientDto convertPersonHivPatientDto(Long personId) {
        if (Boolean.TRUE.equals (personService.isPersonExist (personId))) {
            Person person = getPerson (personId);
            PersonResponseDto bioData = personService.getPersonById (personId);
            Optional<HivEnrollmentDto> enrollment = hivEnrollmentService.getHivEnrollmentByPersonIdAndArchived (bioData.getId ());
            Optional<ARTClinical> artCommencement = artClinicalRepository.findByPersonAndIsCommencementIsTrueAndArchived (person, 0);
            List<ARTClinical> artClinics = artClinicalRepository.findAllByPersonAndIsCommencementIsFalseAndArchived (person, 0);
            HivPatientDto hivPatientDto = new HivPatientDto ();
            BeanUtils.copyProperties (bioData, hivPatientDto);
            processAndSetObservationStatus(person, hivPatientDto);
            addEnrollmentInfo (enrollment, hivPatientDto);
            addArtCommencementInfo (person.getId (), artCommencement, hivPatientDto);
            addArtClinicalInfo (artClinics, hivPatientDto);
            return hivPatientDto;
        }
        return null;
    }


    private void addArtClinicalInfo(List<ARTClinical> artClinics, HivPatientDto hivPatientDto) {
        hivPatientDto.setArtClinicVisits (artClinics.stream ().map (artClinicVisitService::convertToClinicVisitDto).collect (Collectors.toList ()));
    }


    private void addArtCommencementInfo(Long personId, Optional<ARTClinical> artCommencement, HivPatientDto hivPatientDto) {
        if (artCommencement.isPresent ()) {
            hivPatientDto.setCommenced (true);
            hivPatientDto.setArtCommence (commenceService.convertArtToResponseDto (artCommencement.get ()));
            hivPatientDto.setCurrentStatus (statusTrackerService.getPersonCurrentHIVStatusByPersonId (personId));
        }
    }


    private void addEnrollmentInfo(Optional<HivEnrollmentDto> enrollment, HivPatientDto hivPatientDto) {
        if (enrollment.isPresent ()) {
            hivPatientDto.setEnrolled (true);
            hivPatientDto.setEnrollment (enrollment.get ());
            Optional<ApplicationCodeSet> status = applicationCodesetRepository.findById (enrollment.get ().getStatusAtRegistrationId ());
            if (status.isPresent ()) {
                hivPatientDto.setCurrentStatus (status.get ().getDisplay ());
            }
        } else {
            hivPatientDto.setCurrentStatus ("Not Enrolled");
        }
    }

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException (Person.class, "id", String.valueOf (personId)));
    }

    private void processAndSetObservationStatus(Person person, HivPatientDto hivPatientDto) {
        Long orgId = currentUserOrganizationService.getCurrentUserOrganization ();
        Log.info ("orgId {}", orgId);
        List<Observation> observationList = observationRepository.getAllByPersonAndFacilityId (person, orgId);
        Log.info ("observationList {}", observationList);
        if (!observationList.isEmpty ()) {
            observationList
                    .stream ()
                    .filter (observation -> observation.getArchived () != 1)
                    .forEach (observation -> {
                if (observation.getType ().contains ("Clinical")) {
                    hivPatientDto.setClinicalEvaluation (true);
                }
                if (observation.getType ().contains ("Mental")) {
                    hivPatientDto.setMentalHealth (true);
                }
            });
        }
    }

    public List<PatientActivity> getHivPatientActivitiesById(Long id) {
        return   patientActivityService.getActivities(id);


    }
}

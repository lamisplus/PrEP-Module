package org.lamisplus.modules.prep.service;



import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityDto;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityRequestDto;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.lamisplus.modules.prep.repository.PrepInterruptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepEligibilityService {
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepEnrollmentRepository prepEnrollmentRepository;
    private final PrepEligibilityRepository prepEligibilityRepository;
    private final PrepClinicService prepClinicService;
    private final VisitService visitService;
    private final VisitRepository visitRepository;
    private final PrepClinicRepository prepClinicRepository;
    private final PatientActivityService patientActivityService;
    @Autowired
    private ModuleService moduleService;

    private PrepInterruptionRepository prepInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepEligibilityDto save(PrepEligibilityRequestDto prepEligibilityRequestDto) {
        Person person = this.getPerson(prepEligibilityRequestDto.getPersonId());
        PrepEligibility prepEligibility = eligibilityRequestDtoToEligibility(prepEligibilityRequestDto, person.getUuid());
        prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility.setUuid(UUID.randomUUID().toString());

        //Check if client eligibility on same date exist and throw an error
        prepEligibilityRepository
                .findByVisitDateAndPersonUuidAndArchived(prepEligibilityRequestDto.getVisitDate(), person.getUuid(), 0)
                .ifPresent(prepEligibilityRec -> {
                    if (prepEligibilityRec.getArchived() == 0) {
                        throw new RecordExistException(PrepEligibility.class, "Visit date", String.valueOf(prepEligibilityRequestDto.getVisitDate()));
                    }
                });

        prepEligibility = prepEligibilityRepository.save(prepEligibility);
        prepEligibility.setPerson(person);
        PrepEligibilityDto prepEligibilityDto = eligibilityToEligibilityDto(prepEligibility);
        prepEligibilityDto.setPrepEligibilityCount(prepEligibilityRepository
                .findAllByPersonUuid(person.getUuid()).size());
        return prepEligibilityDto;
    }

    public void delete(Long id) {
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));
        if (prepEnrollmentRepository.findByPrepEligibilityUuid(prepEligibility.getUuid()).isPresent()) {
            throw new RecordExistException(PrepEnrollment.class, "PrepEnrollment", "exist for eligibility");
        }
        prepEligibility.setArchived(ARCHIVED);
        prepEligibilityRepository.save(prepEligibility);
    }

    public PrepEligibilityDto getByPrepEligibilityById(Long id) {
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));
        return eligibilityToEligibilityDto(prepEligibility);
    }

    public PrepEligibilityDto update(Long id, PrepEligibilityDto prepEligibilityDto) {
        try {
            PrepEligibility prepEligibility = prepEligibilityRepository
                    .findByIdAndFacilityIdAndArchived(
                            id,
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            UN_ARCHIVED)
                    .orElseThrow(() -> new EntityNotFoundException(
                            PrepEligibility.class, "id", String.valueOf(id)));

            prepEligibility = eligibilityDtoToEligibility(prepEligibilityDto, prepEligibility.getPersonUuid());
            prepEligibility.setArchived(UN_ARCHIVED);
            prepEligibility.setId(id);
            prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());

            updatePrepClinicSafely(prepEligibility); // isolated clinic update

            prepEligibility = prepEligibilityRepository.save(prepEligibility);
            return eligibilityToEligibilityDto(prepEligibility);

        } catch (EntityNotFoundException enf) {
            System.err.println("PrepEligibility not found: " + enf.getMessage());
            throw enf;

        } catch (Exception ex) {
            System.err.println("Unexpected error while updating eligibility: " + ex.getMessage());
            throw new RuntimeException("Failed to update PrepEligibility with ID " + id, ex);
        }
    }

    @Transactional
    private void updatePrepClinicSafely(PrepEligibility prepEligibility) {
        try {
            boolean updated = prepClinicService.updateClinicByEligibility(
                    prepEligibility.getVisitDate(),
                    prepEligibility.getPersonUuid(),
                    prepEligibility.getVisitType(),
                    prepEligibility.getPopulationType(),
                    prepEligibility.getPregnancyStatus(),
                    null,
                    prepEligibility.getReasonForSwitch(),
                    null
            );
            if (!updated) {
                System.out.println("Warning: No matching PrepClinic record found.");
            }
        } catch (Exception e) {
            System.err.println("PrepClinic update failed: " + e.getMessage());
        }
    }


    public List<PrepEligibilityDto> getEligibilityByPersonId(Long personId) {
        List<PrepEligibility> prepEligibilityList = prepEligibilityRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(),
                        UN_ARCHIVED);
        return prepEligibilityList.stream()
                .map(prepClinic -> eligibilityToEligibilityDto(prepClinic))
                .collect(Collectors.toList());
    }


    public PrepEligibilityDto getOpenEligibility(Long personId) {
        Person person = this.getPerson(personId);
        return eligibilityToEligibilityDto(prepEligibilityRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED));
    }

    public PrepEligibility eligibilityDtoToEligibility(PrepEligibilityDto eligibilityDto, String personUuid) {
        if (eligibilityDto == null) {
            return null;
        }

        PrepEligibility prepEligibility = new PrepEligibility();

        prepEligibility.setId(eligibilityDto.getId());
        prepEligibility.setScore(eligibilityDto.getScore());
        prepEligibility.setStiScreening(eligibilityDto.getStiScreening());
        prepEligibility.setDrugUseHistory(eligibilityDto.getDrugUseHistory());
        prepEligibility.setPersonalHivRiskAssessment(eligibilityDto.getPersonalHivRiskAssessment());
        prepEligibility.setSexPartnerRisk(eligibilityDto.getSexPartnerRisk());
        prepEligibility.setPersonUuid(personUuid);
        prepEligibility.setSexPartner(eligibilityDto.getSexPartner());
        prepEligibility.setFirstTimeVisit(eligibilityDto.getFirstTimeVisit());
        prepEligibility.setNumChildrenLessThanFive(eligibilityDto.getNumChildrenLessThanFive());
        prepEligibility.setTargetGroup(eligibilityDto.getTargetGroup());
        prepEligibility.setAssessmentForPepIndication(eligibilityDto.getAssessmentForPepIndication());
        prepEligibility.setAssessmentForAcuteHivInfection(eligibilityDto.getAssessmentForAcuteHivInfection());
        prepEligibility.setAssessmentForPrepEligibility(eligibilityDto.getAssessmentForPrepEligibility());
        prepEligibility.setServicesReceivedByClient(eligibilityDto.getServicesReceivedByClient());
        prepEligibility.setPopulationType(eligibilityDto.getPopulationType());
        prepEligibility.setVisitType(eligibilityDto.getVisitType());
        prepEligibility.setPregnancyStatus(eligibilityDto.getPregnancyStatus());
        prepEligibility.setReasonForSwitch(eligibilityDto.getReasonForSwitch());
        prepEligibility.setVisitDate(eligibilityDto.getVisitDate());
        prepEligibility.setConsiderationForInjections(eligibilityDto.getConsiderationForInjections());
        prepEligibility.setReasonForDecliningPrep(eligibilityDto.getReasonForDecliningPrep());
        prepEligibility.setUniqueClientId(eligibilityDto.getUniqueClientId());
        prepEligibility.setClientHtsCode(eligibilityDto.getClientHtsCode());
        prepEligibility.setReferredFrom(eligibilityDto.getReferredFrom());
        prepEligibility.setSetting(eligibilityDto.getSetting());
        prepEligibility.setServiceStatus(eligibilityDto.getServiceStatus());
        prepEligibility.setTypeOfSession(eligibilityDto.getTypeOfSession());
        return prepEligibility;
    }

    public PrepEligibility eligibilityRequestDtoToEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto, String personUuid) {
        if (prepEligibilityRequestDto == null) {
            return null;
        }

        PrepEligibility prepEligibility = new PrepEligibility();

        prepEligibility.setScore(prepEligibilityRequestDto.getScore());
        prepEligibility.setStiScreening(prepEligibilityRequestDto.getStiScreening());
        prepEligibility.setDrugUseHistory(prepEligibilityRequestDto.getDrugUseHistory());
        prepEligibility.setPersonalHivRiskAssessment(prepEligibilityRequestDto.getPersonalHivRiskAssessment());
        prepEligibility.setSexPartnerRisk(prepEligibilityRequestDto.getSexPartnerRisk());
        prepEligibility.setPersonUuid(personUuid);
        prepEligibility.setSexPartner(prepEligibilityRequestDto.getSexPartner());
        prepEligibility.setFirstTimeVisit(prepEligibilityRequestDto.getFirstTimeVisit());
        prepEligibility.setNumChildrenLessThanFive(prepEligibilityRequestDto.getNumChildrenLessThanFive());
        prepEligibility.setTargetGroup(prepEligibilityRequestDto.getTargetGroup());
        prepEligibility.setAssessmentForPepIndication(prepEligibilityRequestDto.getAssessmentForPepIndication());
        prepEligibility.setAssessmentForAcuteHivInfection(prepEligibilityRequestDto.getAssessmentForAcuteHivInfection());
        prepEligibility.setAssessmentForPrepEligibility(prepEligibilityRequestDto.getAssessmentForPrepEligibility());
        prepEligibility.setServicesReceivedByClient(prepEligibilityRequestDto.getServicesReceivedByClient());
        prepEligibility.setPopulationType(prepEligibilityRequestDto.getPopulationType());
        prepEligibility.setVisitType(prepEligibilityRequestDto.getVisitType());
        prepEligibility.setPregnancyStatus(prepEligibilityRequestDto.getPregnancyStatus());
        prepEligibility.setReasonForSwitch(prepEligibilityRequestDto.getReasonForSwitch());
        prepEligibility.setVisitDate(prepEligibilityRequestDto.getVisitDate());
        prepEligibility.setConsiderationForInjections(prepEligibilityRequestDto.getConsiderationForInjections());
        prepEligibility.setReasonForDecliningPrep(prepEligibilityRequestDto.getReasonForDecliningPrep());
        prepEligibility.setUniqueClientId(prepEligibilityRequestDto.getUniqueClientId());
        prepEligibility.setClientHtsCode(prepEligibilityRequestDto.getClientHtsCode());
        prepEligibility.setReferredFrom(prepEligibilityRequestDto.getReferredFrom());
        prepEligibility.setSetting(prepEligibilityRequestDto.getSetting());
        prepEligibility.setServiceStatus(prepEligibilityRequestDto.getServiceStatus());
        prepEligibility.setTypeOfSession(prepEligibilityRequestDto.getTypeOfSession());
        return prepEligibility;
    }

    public PrepEligibilityDto eligibilityToEligibilityDto(PrepEligibility eligibility) {
        if (eligibility == null) {
            return null;
        }

        PrepEligibilityDto prepEligibilityDto = new PrepEligibilityDto();

        prepEligibilityDto.setId(eligibility.getId());
        prepEligibilityDto.setUuid(eligibility.getUuid());
        prepEligibilityDto.setStiScreening(eligibility.getStiScreening());
        prepEligibilityDto.setDrugUseHistory(eligibility.getDrugUseHistory());
        prepEligibilityDto.setPersonalHivRiskAssessment(eligibility.getPersonalHivRiskAssessment());
        prepEligibilityDto.setSexPartnerRisk(eligibility.getSexPartnerRisk());
        prepEligibilityDto.setPersonUuid(eligibility.getPersonUuid());
        prepEligibilityDto.setSexPartner(eligibility.getSexPartner());
        prepEligibilityDto.setFirstTimeVisit(eligibility.getFirstTimeVisit());
        prepEligibilityDto.setNumChildrenLessThanFive(eligibility.getNumChildrenLessThanFive());
        prepEligibilityDto.setTargetGroup(eligibility.getTargetGroup());
        prepEligibilityDto.setAssessmentForPepIndication(eligibility.getAssessmentForPepIndication());
        prepEligibilityDto.setAssessmentForAcuteHivInfection(eligibility.getAssessmentForAcuteHivInfection());
        prepEligibilityDto.setAssessmentForPrepEligibility(eligibility.getAssessmentForPrepEligibility());
        prepEligibilityDto.setServicesReceivedByClient(eligibility.getServicesReceivedByClient());
        prepEligibilityDto.setPopulationType(eligibility.getPopulationType());
        prepEligibilityDto.setVisitType(eligibility.getVisitType());
        prepEligibilityDto.setPregnancyStatus(eligibility.getPregnancyStatus());
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(eligibility.getPerson());
        //prepEligibilityDto.setPersonResponseDto(personResponseDto);
        prepEligibilityDto.setReasonForSwitch(eligibility.getReasonForSwitch());
        prepEligibilityDto.setVisitDate(eligibility.getVisitDate());
        prepEligibilityDto.setConsiderationForInjections(eligibility.getConsiderationForInjections());
        prepEligibilityDto.setReasonForDecliningPrep(eligibility.getReasonForDecliningPrep());
        prepEligibilityDto.setUniqueClientId(eligibility.getUniqueClientId());
        prepEligibilityDto.setClientHtsCode(eligibility.getClientHtsCode());
        prepEligibilityDto.setReferredFrom(eligibility.getReferredFrom());
        prepEligibilityDto.setSetting(eligibility.getSetting());
        prepEligibilityDto.setServiceStatus(eligibility.getServiceStatus());
        prepEligibilityDto.setTypeOfSession(eligibility.getTypeOfSession());
        return prepEligibilityDto;
    }


    public PrepEligibilityDto getEligibilityById(Long id) {
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));

        return eligibilityToEligibilityDto(prepEligibility);

    }
}

package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.module.ModuleService;
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
import org.springframework.stereotype.Service;

import java.util.List;
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

    private final VisitService visitService;
    private final VisitRepository visitRepository;
    private final PrepClinicRepository prepClinicRepository;
    private final PatientActivityService patientActivityService;

    private ModuleService moduleService;

    private PrepInterruptionRepository prepInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }

    public void delete(Long id){
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));
        if(prepEnrollmentRepository.findByPrepEligibilityUuid(prepEligibility.getUuid()).isPresent()){
            throw new RecordExistException(PrepEnrollment.class, "PrepEnrollment", "exist for eligibility");
        }
        prepEligibility.setArchived(ARCHIVED);
        prepEligibilityRepository.save(prepEligibility);
    }

    public PrepEligibilityDto getByPrepEligibilityById(Long id){
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));
        return eligibilityToEligibilityDto(prepEligibility);
    }

    public PrepEligibilityDto update(Long id, PrepEligibilityDto prepEligibilityDto){
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));

        prepEligibility = eligibilityDtoToEligibility(prepEligibilityDto, prepEligibility.getPersonUuid());
        prepEligibility.setArchived(UN_ARCHIVED);
        prepEligibility.setId(id);
        prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return eligibilityToEligibilityDto(prepEligibilityRepository.save(prepEligibility));
    }

    public List<PrepEligibilityDto> getEligibilityByPersonId(Long personId){
        List<PrepEligibility> prepEligibilityList = prepEligibilityRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(),
                        UN_ARCHIVED);
        return prepEligibilityList.stream()
                .map(prepClinic -> eligibilityToEligibilityDto(prepClinic))
                .collect(Collectors.toList());
    }


    public PrepEligibilityDto getOpenEligibility(Long personId){
        Person person = this.getPerson(personId);
        return eligibilityToEligibilityDto(prepEligibilityRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED));
    }

    public PrepEligibility eligibilityDtoToEligibility(PrepEligibilityDto eligibilityDto, String personUuid) {
        if ( eligibilityDto == null ) {
            return null;
        }

        PrepEligibility prepEligibility = new PrepEligibility();

        prepEligibility.setId(eligibilityDto.getId());
        prepEligibility.setHivRisk( eligibilityDto.getHivRisk() );
        prepEligibility.setUniqueId(eligibilityDto.getUniqueId());
        prepEligibility.setScore(eligibilityDto.getScore());
        prepEligibility.setStiScreening( eligibilityDto.getStiScreening() );
        prepEligibility.setDrugUseHistory( eligibilityDto.getDrugUseHistory() );
        prepEligibility.setPersonalHivRiskAssessment( eligibilityDto.getPersonalHivRiskAssessment() );
        prepEligibility.setSexPartnerRisk( eligibilityDto.getSexPartnerRisk() );
        prepEligibility.setPersonUuid( personUuid);
        prepEligibility.setSexPartner( eligibilityDto.getSexPartner() );
        prepEligibility.setCounselingType( eligibilityDto.getCounselingType() );
        prepEligibility.setFirstTimeVisit( eligibilityDto.getFirstTimeVisit() );
        prepEligibility.setNumChildrenLessThanFive( eligibilityDto.getNumChildrenLessThanFive() );
        prepEligibility.setNumWives( eligibilityDto.getNumWives() );
        prepEligibility.setTargetGroup( eligibilityDto.getTargetGroup() );
        prepEligibility.setExtra( eligibilityDto.getExtra() );
        prepEligibility.setAssessmentForPepIndication(eligibilityDto.getAssessmentForPepIndication());
        prepEligibility.setAssessmentForAcuteHivInfection(eligibilityDto.getAssessmentForAcuteHivInfection());
        prepEligibility.setAssessmentForPrepEligibility(eligibilityDto.getAssessmentForPrepEligibility());
        prepEligibility.setServicesReceivedByClient(eligibilityDto.getServicesReceivedByClient());
        prepEligibility.setPopulationType(eligibilityDto.getPopulationType());
        prepEligibility.setVisitType(eligibilityDto.getVisitType());
        prepEligibility.setPregnancyStatus(eligibilityDto.getPregnancyStatus());

        prepEligibility.setVisitDate( eligibilityDto.getVisitDate());
        prepEligibility.setLftConducted(eligibilityDto.getLftConducted());
        prepEligibility.setDateLiverFunctionTestResults(eligibilityDto.getDateLiverFunctionTestResults());
        prepEligibility.setLiverFunctionTestResults(eligibilityDto.getLiverFunctionTestResults());
        return prepEligibility;
    }
    public PrepEligibility eligibilityRequestDtoToEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto, String personUuid) {
        if ( prepEligibilityRequestDto == null ) {
            return null;
        }

        PrepEligibility prepEligibility = new PrepEligibility();

        prepEligibility.setHivRisk( prepEligibilityRequestDto.getHivRisk() );
        prepEligibility.setUniqueId(prepEligibilityRequestDto.getUniqueId());
        prepEligibility.setScore(prepEligibilityRequestDto.getScore());
        prepEligibility.setStiScreening( prepEligibilityRequestDto.getStiScreening() );
        prepEligibility.setDrugUseHistory( prepEligibilityRequestDto.getDrugUseHistory() );
        prepEligibility.setPersonalHivRiskAssessment( prepEligibilityRequestDto.getPersonalHivRiskAssessment() );
        prepEligibility.setSexPartnerRisk( prepEligibilityRequestDto.getSexPartnerRisk() );
        prepEligibility.setPersonUuid( personUuid);
        prepEligibility.setSexPartner( prepEligibilityRequestDto.getSexPartner() );
        prepEligibility.setCounselingType( prepEligibilityRequestDto.getCounselingType() );
        prepEligibility.setFirstTimeVisit( prepEligibilityRequestDto.getFirstTimeVisit() );
        prepEligibility.setNumChildrenLessThanFive( prepEligibilityRequestDto.getNumChildrenLessThanFive() );
        prepEligibility.setNumWives( prepEligibilityRequestDto.getNumWives() );
        prepEligibility.setTargetGroup( prepEligibilityRequestDto.getTargetGroup() );
        prepEligibility.setExtra( prepEligibilityRequestDto.getExtra() );
        prepEligibility.setAssessmentForPepIndication(prepEligibilityRequestDto.getAssessmentForPepIndication());
        prepEligibility.setAssessmentForAcuteHivInfection(prepEligibilityRequestDto.getAssessmentForAcuteHivInfection());
        prepEligibility.setAssessmentForPrepEligibility(prepEligibilityRequestDto.getAssessmentForPrepEligibility());
        prepEligibility.setServicesReceivedByClient(prepEligibilityRequestDto.getServicesReceivedByClient());
        prepEligibility.setPopulationType(prepEligibilityRequestDto.getPopulationType());
        prepEligibility.setVisitType(prepEligibilityRequestDto.getVisitType());
        prepEligibility.setPregnancyStatus(prepEligibilityRequestDto.getPregnancyStatus());

        prepEligibility.setVisitDate( prepEligibilityRequestDto.getVisitDate());
        prepEligibility.setLftConducted(prepEligibilityRequestDto.getLftConducted());
        prepEligibility.setDateLiverFunctionTestResults(prepEligibilityRequestDto.getDateLiverFunctionTestResults());
        prepEligibility.setLiverFunctionTestResults(prepEligibilityRequestDto.getLiverFunctionTestResults());
        return prepEligibility;
    }

    public PrepEligibilityDto eligibilityToEligibilityDto(PrepEligibility eligibility) {
        if ( eligibility == null ) {
            return null;
        }

        PrepEligibilityDto prepEligibilityDto = new PrepEligibilityDto();

        prepEligibilityDto.setId(eligibility.getId());
        prepEligibilityDto.setUuid(eligibility.getUuid());
        prepEligibilityDto.setUniqueId(eligibility.getUniqueId());
        prepEligibilityDto.setHivRisk( eligibility.getHivRisk() );
        prepEligibilityDto.setStiScreening( eligibility.getStiScreening() );
        prepEligibilityDto.setDrugUseHistory( eligibility.getDrugUseHistory() );
        prepEligibilityDto.setPersonalHivRiskAssessment( eligibility.getPersonalHivRiskAssessment() );
        prepEligibilityDto.setSexPartnerRisk( eligibility.getSexPartnerRisk() );
        prepEligibilityDto.setPersonUuid( eligibility.getPersonUuid() );
        prepEligibilityDto.setSexPartner( eligibility.getSexPartner() );
        prepEligibilityDto.setCounselingType( eligibility.getCounselingType() );
        prepEligibilityDto.setFirstTimeVisit( eligibility.getFirstTimeVisit() );
        prepEligibilityDto.setNumChildrenLessThanFive( eligibility.getNumChildrenLessThanFive() );
        prepEligibilityDto.setNumWives( eligibility.getNumWives() );
        prepEligibilityDto.setTargetGroup( eligibility.getTargetGroup() );
        prepEligibilityDto.setExtra( eligibility.getExtra() );
        prepEligibilityDto.setAssessmentForPepIndication(eligibility.getAssessmentForPepIndication());
        prepEligibilityDto.setAssessmentForAcuteHivInfection(eligibility.getAssessmentForAcuteHivInfection());
        prepEligibilityDto.setAssessmentForPrepEligibility(eligibility.getAssessmentForPrepEligibility());
        prepEligibilityDto.setServicesReceivedByClient(eligibility.getServicesReceivedByClient());
        prepEligibilityDto.setPopulationType(eligibility.getPopulationType());
        prepEligibilityDto.setVisitType(eligibility.getVisitType());
        prepEligibilityDto.setPregnancyStatus(eligibility.getPregnancyStatus());
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(eligibility.getPerson());
        //prepEligibilityDto.setPersonResponseDto(personResponseDto);

        prepEligibilityDto.setVisitDate( eligibility.getVisitDate() );
        prepEligibilityDto.setLftConducted(eligibility.getLftConducted());
        prepEligibilityDto.setDateLiverFunctionTestResults(eligibility.getDateLiverFunctionTestResults());
        prepEligibilityDto.setLiverFunctionTestResults(eligibility.getLiverFunctionTestResults());
        return prepEligibilityDto;
    }


    public PrepEligibilityDto getEligibilityById(Long id) {
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow (() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf (id)));

        return eligibilityToEligibilityDto(prepEligibility);

    }
}

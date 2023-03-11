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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepEnrollmentService {
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

    private PrepEnrollment getByEnrollmentById(Long id){
        return prepEnrollmentRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "id", ""+id));
    }


    private Long getPersonId(PrepEnrollment prepEnrollment){
        return prepEnrollment.getPerson().getId();
    }

    public void delete(Long id) {
        PrepEnrollment prepEnrollment = this.getByEnrollmentById(id);

        if(!prepClinicRepository.findAllByPrepEnrollmentUuid(prepEnrollment.getUuid()).isEmpty()){
            throw new RecordExistException(PrepClinic.class, "Prep Clinic", "exist for enrollment");
        }

        prepEnrollment.setArchived(ARCHIVED);
        prepEnrollmentRepository.save(prepEnrollment);
    }

    public PrepEnrollmentDto update(Long id, PrepEnrollmentDto prepEnrollmentDto){
        PrepEnrollment prepEnrollment = prepEnrollmentRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "id", ""+id));
        String prepEligibilityUuid= prepEnrollment.getPrepEligibilityUuid();
        //System.out.println("prepEligibilityUuid - " + prepEligibilityUuid);
        //String uuid = prepEnrollment.getUuid();
        prepEnrollment = enrollmentDtoToEnrollment(prepEnrollmentDto, prepEnrollment.getPersonUuid());
        prepEnrollment.setArchived(UN_ARCHIVED);
        //prepEnrollment.setUuid(uuid);
        prepEnrollment.setPrepEligibilityUuid(prepEligibilityUuid);
        prepEnrollment.setId(id);
        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return enrollmentToEnrollmentDto(prepEnrollmentRepository.save(prepEnrollment));
    }

    public PrepEnrollmentDto getOpenEnrollment(Long personId){
        Person person = this.getPerson(personId);

        String status = "STOPPED, DEATH";
        Optional<PrepEnrollment> prepEnrollmentOptional = prepEnrollmentRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), status);
        if(prepEnrollmentOptional.isPresent())return  enrollmentToEnrollmentDto(prepEnrollmentOptional.get());//PrepEnrollmentDto.builder().build();
        return new PrepEnrollmentDto();
    }


    private PrepEnrollment enrollmentDtoToEnrollment(PrepEnrollmentDto enrollmentDto, String personUuid) {
        if ( enrollmentDto == null ) {
            return null;
        }

        PrepEnrollment prepEnrollment = new PrepEnrollment();

        prepEnrollment.setPersonUuid( personUuid);
        prepEnrollment.setExtra( enrollmentDto.getExtra() );
        prepEnrollment.setUniqueId( enrollmentDto.getUniqueId() );
        prepEnrollment.setExtra( enrollmentDto.getExtra() );
        prepEnrollment.setPrepEligibilityUuid( enrollmentDto.getPrepEligibilityUuid() );

        prepEnrollment.setDateEnrolled( enrollmentDto.getDateEnrolled() );
        prepEnrollment.setDateReferred( enrollmentDto.getDateReferred() );
        prepEnrollment.setRiskType( enrollmentDto.getRiskType() );
        prepEnrollment.setSupporterName( enrollmentDto.getSupporterName() );
        prepEnrollment.setSupporterRelationshipType( enrollmentDto.getSupporterRelationshipType() );
        prepEnrollment.setSupporterPhone( enrollmentDto.getSupporterPhone() );
        prepEnrollment.setStatus("Enrolled");

        prepEnrollment.setAncUniqueArtNo( enrollmentDto.getAncUniqueArtNo() );
        prepEnrollment.setHivTestingPoint(enrollmentDto.getHivTestingPoint());
        prepEnrollment.setDateOfLastHivNegativeTest(enrollmentDto.getDateOfLastHivNegativeTest());

        return prepEnrollment;
    }

    private PrepEnrollment enrollmentRequestDtoToEnrollment(PrepEnrollmentRequestDto prepEnrollmentRequestDto, String personUuid) {
        if ( prepEnrollmentRequestDto == null ) {
            return null;
        }

        PrepEnrollment prepEnrollment = new PrepEnrollment();

        prepEnrollment.setPersonUuid( personUuid);
        prepEnrollment.setExtra( prepEnrollmentRequestDto.getExtra() );
        prepEnrollment.setUniqueId( prepEnrollmentRequestDto.getUniqueId() );
        prepEnrollment.setExtra( prepEnrollmentRequestDto.getExtra() );
        prepEnrollment.setPrepEligibilityUuid( prepEnrollmentRequestDto.getPrepEligibilityUuid() );

        prepEnrollment.setDateEnrolled( prepEnrollmentRequestDto.getDateEnrolled() );
        prepEnrollment.setDateReferred( prepEnrollmentRequestDto.getDateReferred() );
        prepEnrollment.setRiskType( prepEnrollmentRequestDto.getRiskType() );
        prepEnrollment.setSupporterName( prepEnrollmentRequestDto.getSupporterName() );
        prepEnrollment.setSupporterRelationshipType( prepEnrollmentRequestDto.getSupporterRelationshipType() );
        prepEnrollment.setSupporterPhone( prepEnrollmentRequestDto.getSupporterPhone() );
        prepEnrollment.setStatus("ENROLLED");

        prepEnrollment.setAncUniqueArtNo( prepEnrollmentRequestDto.getAncUniqueArtNo() );

        prepEnrollment.setHivTestingPoint(prepEnrollmentRequestDto.getHivTestingPoint());
        prepEnrollment.setDateOfLastHivNegativeTest(prepEnrollmentRequestDto.getDateOfLastHivNegativeTest());

        return prepEnrollment;
    }


    private PrepEnrollmentDto enrollmentToEnrollmentDto(PrepEnrollment enrollment) {
        if ( enrollment == null ) {
            return null;
        }

        PrepEnrollmentDto enrollmentDto = new PrepEnrollmentDto();

        enrollmentDto.setExtra( enrollment.getExtra() );
        enrollmentDto.setId( enrollment.getId() );
        enrollmentDto.setUniqueId( enrollment.getUniqueId() );
        enrollmentDto.setExtra( enrollment.getExtra() );
        enrollmentDto.setUuid(enrollment.getUuid());

        if(enrollment.getCreatedBy().equals("ETL")){
            if(enrollment.getDateEnrolled() == null && enrollment.getDateStarted() != null)
            enrollmentDto.setDateEnrolled( enrollment.getDateStarted() );
        }
        enrollmentDto.setDateEnrolled( enrollment.getDateEnrolled() );
        enrollmentDto.setDateReferred( enrollment.getDateReferred() );
        enrollmentDto.setRiskType( enrollment.getRiskType() );
        enrollmentDto.setSupporterName( enrollment.getSupporterName() );
        enrollmentDto.setSupporterRelationshipType( enrollment.getSupporterRelationshipType() );
        enrollmentDto.setSupporterPhone( enrollment.getSupporterPhone() );
        enrollmentDto.setPrepEligibilityUuid(enrollment.getPrepEligibilityUuid());
        enrollmentDto.setCommenced(true);

        enrollmentDto.setAncUniqueArtNo(enrollment.getAncUniqueArtNo());

        enrollmentDto.setHivTestingPoint(enrollment.getHivTestingPoint());
        enrollmentDto.setDateOfLastHivNegativeTest(enrollment.getDateOfLastHivNegativeTest());

        return enrollmentDto;
    }

    public PrepEnrollmentDto getEnrollmentById(Long id) {
        PrepEnrollment prepEnrollment = prepEnrollmentRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow (() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf (id)));

        return enrollmentToEnrollmentDto(prepEnrollment);

    }

    public List<PrepEnrollmentDto> getEnrollmentByPersonId(Long personId) {
        List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository
                .findAllByPersonUuidAndFacilityIdAndArchived(getPerson(personId).getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED);

        return prepEnrollments.stream()
                .map(prepEnrollment -> {return enrollmentToEnrollmentDto(prepEnrollment);})
                .collect(Collectors.toList());
    }
}

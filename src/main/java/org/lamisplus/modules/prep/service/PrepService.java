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
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.domain.entity.PrepInterruption;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.lamisplus.modules.prep.repository.PrepInterruptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
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
public class PrepService {
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

    public PrepEligibilityDto saveEligibility (PrepEligibilityRequestDto prepEligibilityRequestDto){
        Person person;
        person = this.getPerson(prepEligibilityRequestDto.getPersonId());
        PrepEligibility prepEligibility = this.prepEligibilityRequestDtoToPrepEligibility(prepEligibilityRequestDto, person.getUuid());

        prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility = prepEligibilityRepository.save(prepEligibility);
        prepEligibility.setPerson(person);
        PrepEligibilityDto prepEligibilityDto =  this.prepEligibilityToPrepEligibilityDto(prepEligibility);
        prepEligibilityDto
                .setPrepEligibilityCount(prepEligibilityRepository
                        .findAllByPersonUuid(person.getUuid()).size());
        //prepEligibilityDto.setPrepStatus("ELIGIB");
        return prepEligibilityDto;
    }

    public PrepEnrollmentDto saveEnrollment (PrepEnrollmentRequestDto prepEnrollmentRequestDto){
        PrepEnrollment prepEnrollment;
        String eligibilityUuid = prepEnrollmentRequestDto.getPrepEligibilityUuid();

        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByUuid(eligibilityUuid)
                .orElseThrow(()-> new EntityNotFoundException(PrepEligibility.class, "Eligibility ", eligibilityUuid));

        Person person = this.getPerson(prepEnrollmentRequestDto.getPersonId());

        if(this.prepEnrollmentRepository.findByPrepEligibilityUuid(eligibilityUuid).isPresent()) {
            throw new RecordExistException(PrepEnrollment.class, "Eligibility Already taken for prep", eligibilityUuid);
        }

        if(!prepEligibility.getPersonUuid().equals(person.getUuid())){
           throw new IllegalTypeException(PrepEnrollment.class, "Person not same for prepEligibilityUuid", eligibilityUuid);
        }

        prepEnrollment = this.enrollmentRequestDtoToEnrollment(prepEnrollmentRequestDto, prepEligibility.getPersonUuid());

        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEnrollment = prepEnrollmentRepository.save(prepEnrollment);
        prepEnrollment.setPerson(prepEligibility.getPerson());
        PrepEnrollmentDto prepEnrollmentDto = this.enrollmentToEnrollmentDto(prepEnrollment);
        prepEnrollmentDto.setStatus("ENROLLED");
        return prepEnrollmentDto;
    }

    public PrepClinicDto saveCommencement (PrepClinicRequestDto commencementRequestDto){
        String enrollmentUuid = commencementRequestDto.getPrepEnrollmentUuid();

        Person person = this.getPerson(commencementRequestDto.getPersonId());

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(enrollmentUuid)
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", enrollmentUuid));

        if(!prepEnrollment.getPersonUuid().equals(person.getUuid())){
            throw new IllegalTypeException(PrepClinic.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepClinic prepClinic = this.clinicRequestDtoToClinic(commencementRequestDto, person.getUuid());

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(true);
        prepClinic = prepClinicRepository.save(prepClinic);
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic);
        //prepClinicDto.setStatus("COMMENCED");
        return prepClinicDto;
    }

    public PrepClinicDto saveClinic (PrepClinicRequestDto clinicRequestDto){
        String enrollmentUuid = clinicRequestDto.getPrepEnrollmentUuid();

        Person person = this.getPerson(clinicRequestDto.getPersonId());

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(enrollmentUuid)
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", enrollmentUuid));

        if(!prepEnrollment.getPersonUuid().equals(person.getUuid())){
            throw new IllegalTypeException(PrepClinic.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepClinic prepClinic = this.clinicRequestDtoToClinic(clinicRequestDto, person.getUuid());

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(false);
        prepClinic = prepClinicRepository.save(prepClinic);
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic);
        //prepClinicDto.setStatus("COMMENCED");
        return prepClinicDto;
    }


    public PrepInterruptionDto saveInterruption (PrepInterruptionRequestDto interruptionRequestDto){
        Person person = this.getPerson(interruptionRequestDto.getPersonId());
        String status = "STOPPED, DEATH";

        this.prepEnrollmentRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), status)
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", String.valueOf(interruptionRequestDto.getPersonId())));


        PrepInterruption prepInterruption = this.prepInterruptionRequestDtoToPrepInterruption(interruptionRequestDto, person.getUuid());

        prepInterruption.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepInterruption = prepInterruptionRepository.save(prepInterruption);
        prepInterruption.setPerson(person);
        PrepInterruptionDto prepInterruptionDto = this.prepInterruptionToPrepInterruptionDto(prepInterruption);
        //prepClinicDto.setStatus("COMMENCED");
        return prepInterruptionDto;
    }



    private PrepDtos prepToPrepDtos(List<PrepEnrollment> clients){
        final Long[] pId = {null};
        final String[] uniqueId = {null};
        final String[] personUuid = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        PrepDtos prepDtos = new PrepDtos();
        List<PrepDto> prepDtoList =  clients
                .stream()
                .sorted(Comparator.comparingLong(PrepEnrollment::getId).reversed())
                .map(prepEnrollment -> {
                    if(pId[0] == null) {
                        Person person = prepEnrollment.getPerson();
                        uniqueId[0] = prepEnrollment.getUniqueId();
                        pId[0] = person.getId();
                        personUuid[0] = prepEnrollment.getPrepEligibilityUuid();
                        personResponseDto[0] = personService.getDtoFromPerson(person);
                    }
                    return this.prepEnrollmentToPrepDto(prepEnrollment);})
                .sorted(Comparator.comparingLong(PrepDto::getId).reversed())
                .collect(Collectors.toList());
        prepDtos.setPrepEnrollmentCount(prepDtoList.size());
        prepDtos.setPrepDtoList(prepDtoList);
        prepDtos.setPrepEligibilityCount(prepEligibilityRepository.findAllByPersonUuid(personUuid[0]).size());
        prepDtos.setPersonId(pId[0]);
        prepDtos.setUniqueId(uniqueId[0]);
        prepDtos.setPersonResponseDto(personResponseDto[0]);
        return prepDtos;
    }

    private PrepEnrollment getById(Long id){
        return prepEnrollmentRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "id", ""+id));
    }

    public List<PrepDtos> getAllPatients(){
        List<PrepDtos> prepDtosList = new ArrayList<>();
        for(PersonResponseDto personResponseDto :personService.getAllPerson()){
            Person person = this.getPerson(personResponseDto.getId());
            List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository.findAllByPersonOrderByIdDesc(person);
            PrepDtos prepDtos = new PrepDtos();
            if(prepEnrollments.isEmpty()){
                prepDtos.setPrepDtoList(new ArrayList<>());
                prepDtos.setPrepEnrollmentCount(0);
                prepDtos.setPrepEligibilityCount(prepEligibilityRepository.findAllByPersonUuid(person.getUuid()).size());

                prepDtos.setPersonResponseDto(personResponseDto);
                prepDtos.setPersonId(personResponseDto.getId());
                prepDtosList.add(prepDtos);
            } else {
                prepDtosList.add(this.prepToPrepDtos(person, prepEnrollments));
            }
        }
        return prepDtosList;
    }

    public Page<PrepEnrollment> findPrepClientPage(Pageable pageable) {
        return prepEnrollmentRepository.findAll(pageable);
    }

    /*public PrepDtos getAllPrepDtos(Page<PrepEnrollment> page, List<PrepEnrollment> prepEnrollments){
        if(page != null && !page.isEmpty()){
            return prepToPrepDtos(null, page.stream().collect(Collectors.toList()));
        } else if(prepEnrollments != null && !prepEnrollments.isEmpty()){
            return prepToPrepDtos(null, prepEnrollments);
        }
        return null;
    }*/

    public String getClientNameByCode(String code) {
        List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository.findAllByUniqueIdOrderByIdDesc(code);
        if(prepEnrollments.isEmpty())return "Record Not Found";

        Person person = prepEnrollments.stream().findFirst().get().getPerson();
        return person.getFirstName() + " " + person.getSurname();
    }

    public PrepDtos getPrepByPersonId(Long personId){
        Person person = personRepository.findById(personId).orElse(new Person());
        if(person.getId() == null){
            return new PrepDtos();
        }
        return this.prepToPrepDtos(person, prepEnrollmentRepository.findAllByPersonOrderByIdDesc(person));
    }

    public List<PrepEnrollmentDto> getEnrollmentByPersonId(Long personId){
        Person person = this.getPerson(personId);
        List<PrepEnrollmentDto> prepEnrollmentDtos = new ArrayList<>();
        List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository.findAllByPerson(person);
        prepEnrollments.forEach(prepEnrollment -> {
            prepEnrollmentDtos.add(enrollmentToEnrollmentDto(prepEnrollment));
        });
        return prepEnrollmentDtos;
    }

    public List<PrepClinicDto> getCommencementByPersonId(Long personId){
        Person person = this.getPerson(personId);
        List<PrepClinicDto> prepClinicDtos = new ArrayList<>();
        List<PrepClinic> prepClinics = prepClinicRepository.findAllByPersonAndIsCommencement(person, true);
        prepClinics.forEach(prepClinic -> {
            prepClinicDtos.add(clinicToClinicDto(prepClinic));
        });
        return prepClinicDtos;
    }

    /*public PrepDtos getPrepClientById(Long id){
        List<PrepEnrollment> prepEnrollments = new ArrayList<>();
        prepEnrollments.add(this.getById(id));
        return this.prepToPrepDtos(null, prepEnrollments);
    }*/

    private Long getPersonId(PrepEnrollment prepEnrollment){
        return prepEnrollment.getPerson().getId();
    }
    public void delete(Long id) {
        PrepEnrollment prepEnrollment = this.getById(id);
        prepEnrollment.setArchived(ARCHIVED);
        prepEnrollmentRepository.save(prepEnrollment);
    }

    public Page<Person> findPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if(!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")){
            searchValue = searchValue.replaceAll("\\s", "");
            String queryParam = "%"+searchValue+"%";
            return personRepository
                    .findAllPersonBySearchParameters(queryParam, UN_ARCHIVED, facilityId,  pageable);
        }
        return personRepository
                .getAllByArchivedAndFacilityIdOrderByIdDesc(UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(),pageable);
    }

    public PageDTO getAllPrepDtosByPerson(Page<Person> page){

        List<PrepDtos> htsClientDtosList =  page.stream()
                .map(person -> getPrepClientByPersonId(person))
                .collect(Collectors.toList());
        return PaginationUtil.generatePagination(page, htsClientDtosList);
    }

    public PrepDtos getPrepClientByPersonId(Person person){
        return this.prepToPrepDtos(person, prepEnrollmentRepository.findAllByPersonOrderByIdDesc(person));
    }


    private PrepDtos prepToPrepDtos(@NotNull Person person, List<PrepEnrollment> clients){
        boolean isPositive = false;
        boolean isCommenced = false;
        PrepDtos prepDtos = new PrepDtos();

        if(person == null)throw new EntityNotFoundException(Person.class, "Person", "is null");
        prepDtos.setPersonId(person.getId());
        prepDtos.setPersonResponseDto(personService.getDtoFromPerson(person));

        List<PrepDto> prepDtoList =  clients
                .stream()
                .map(client -> {
                    if(person == null) {
                        Person samePerson = client.getPerson();
                        final PersonResponseDto personResponseDto = personService.getDtoFromPerson(samePerson);
                        prepDtos.setPersonResponseDto(personResponseDto);
                        prepDtos.setPersonId(personResponseDto.getId());
                        prepDtos.setPrepEligibilityCount(prepEligibilityRepository.countAllByPersonUuid(samePerson.getUuid()));
                    }
                    if(prepDtos.getUniqueId() == null){prepDtos.setUniqueId(client.getUniqueId());}
                    return this.prepEnrollmentToPrepDto(client);
                })
                .collect(Collectors.toList());
        int prepCount = prepDtoList.size();
        prepDtos.setPrepEnrollmentCount(prepCount);
        prepDtos.setPrepDtoList(prepDtoList);
        Integer eligibilityCount = (prepDtos.getPrepEligibilityCount() == null)
                ? prepEligibilityRepository.countAllByPersonUuid(person.getUuid())
                : prepDtos.getPrepEligibilityCount();
        if(eligibilityCount == prepCount && eligibilityCount > 0) isCommenced=true;
        prepDtos.setCommenced(isCommenced);
        prepDtos.setHivPositive(isPositive);
        return prepDtos;
    }

    public PrepEligibilityDto getOpenEligibility(Long personId){
        Person person = this.getPerson(personId);
        return prepEligibilityToPrepEligibilityDto(prepEligibilityRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED));
    }

    public PrepEnrollmentDto getOpenEnrollment(Long personId){
        Person person = this.getPerson(personId);

        String status = "STOPPED, DEATH";
        Optional<PrepEnrollment> prepEnrollmentOptional = prepEnrollmentRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), status);
        if(prepEnrollmentOptional.isPresent())return  enrollmentToEnrollmentDto(prepEnrollmentOptional.get());//PrepEnrollmentDto.builder().build();
        return new PrepEnrollmentDto();
    }

    public PrepEligibility prepEligibilityRequestDtoToPrepEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto, String personUuid) {
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

        prepEligibility.setVisitDate( prepEligibilityRequestDto.getVisitDate());

        return prepEligibility;
    }

    public PrepEligibilityDto prepEligibilityToPrepEligibilityDto(PrepEligibility eligibility) {
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
        PersonResponseDto personResponseDto = personService.getDtoFromPerson(eligibility.getPerson());
        prepEligibilityDto.setPersonResponseDto(personResponseDto);

        prepEligibilityDto.setVisitDate( eligibility.getVisitDate() );

        return prepEligibilityDto;
    }

    public List<PatientActivity> getPrepPatientActivitiesById(Long id) {
        return   patientActivityService.getActivities(id);
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

        return prepEnrollment;
    }
    private PrepClinic clinicRequestDtoToClinic(PrepClinicRequestDto prepClinicRequestDto, String personUuid) {
        if ( prepClinicRequestDto == null ) {
            return null;
        }

        PrepClinic prepClinic = new PrepClinic();

        prepClinic.setPersonUuid( personUuid);
        prepClinic.setExtra( prepClinicRequestDto.getExtra() );
        prepClinic.setDateInitialAdherenceCounseling( prepClinicRequestDto.getDateInitialAdherenceCounseling() );
        prepClinic.setWeight( prepClinicRequestDto.getWeight() );
        prepClinic.setHeight( prepClinicRequestDto.getHeight() );
        prepClinic.setPregnant( prepClinicRequestDto.getPregnant() );

        prepClinic.setDateReferred( prepClinicRequestDto.getDateReferred() );
        prepClinic.setPrepEnrollmentUuid( prepClinicRequestDto.getPrepEnrollmentUuid() );
        prepClinic.setRegimenId( prepClinicRequestDto.getRegimenId() );
        prepClinic.setUrinalysisResult( prepClinicRequestDto.getUrinalysisResult() );
        prepClinic.setReferred( prepClinicRequestDto.getReferred() );

        prepClinic.setDateReferred( prepClinicRequestDto.getDateReferred() );
        prepClinic.setNextAppointment( prepClinicRequestDto.getNextAppointment() );
        prepClinic.setEncounterDate( prepClinicRequestDto.getEncounterDate() );
        prepClinic.setExtra( prepClinicRequestDto.getExtra() );

        prepClinic.setDatePrepStart( prepClinicRequestDto.getDatePrepStart());
        //Clinic
        prepClinic.setPulse( prepClinicRequestDto.getPulse());
        prepClinic.setRespiratoryRate( prepClinicRequestDto.getRespiratoryRate());
        prepClinic.setTemperature( prepClinicRequestDto.getTemperature());
        prepClinic.setSystolic( prepClinicRequestDto.getSystolic());
        prepClinic.setDiastolic( prepClinicRequestDto.getDiastolic());
        prepClinic.setAdherenceLevel( prepClinicRequestDto.getAdherenceLevel());
        prepClinic.setStiScreening( prepClinicRequestDto.getStiScreening());

        prepClinic.setWhy( prepClinicRequestDto.getWhy());
        prepClinic.setDatePrepGiven( prepClinicRequestDto.getDatePrepGiven());
        prepClinic.setUrinalysis( prepClinicRequestDto.getUrinalysis());
        prepClinic.setHepatitis( prepClinicRequestDto.getHepatitis());
        prepClinic.setSyphilis( prepClinicRequestDto.getSyphilis());
        prepClinic.setOtherTestsDone( prepClinicRequestDto.getOtherTestsDone());
        prepClinic.setSyndromicStiScreening( prepClinicRequestDto.getSyndromicStiScreening());

        return prepClinic;
    }
    private PrepClinicDto clinicToClinicDto(PrepClinic clinic) {
        if ( clinic == null ) {
            return null;
        }

        PrepClinicDto prepClinicDto = new PrepClinicDto();

        prepClinicDto.setId( clinic.getId());
        prepClinicDto.setExtra( clinic.getExtra() );
        prepClinicDto.setDateInitialAdherenceCounseling( clinic.getDateInitialAdherenceCounseling() );
        prepClinicDto.setWeight( clinic.getWeight() );
        prepClinicDto.setHeight( clinic.getHeight() );
        prepClinicDto.setPregnant( clinic.getPregnant() );

        prepClinicDto.setDateReferred( clinic.getDateReferred() );
        prepClinicDto.setPrepEnrollmentUuid( clinic.getPrepEnrollmentUuid() );
        prepClinicDto.setRegimenId( clinic.getRegimenId() );
        prepClinicDto.setUrinalysisResult( clinic.getUrinalysisResult() );
        prepClinicDto.setReferred( clinic.getReferred() );
        prepClinicDto.setNextAppointment( clinic.getNextAppointment() );

        prepClinicDto.setIsCommencement(clinic.getIsCommencement());
        prepClinicDto.setDatePrepStart( clinic.getDatePrepStart());
        prepClinicDto.setEncounterDate( clinic.getEncounterDate());
        //For clinic
        prepClinicDto.setPulse( clinic.getPulse());
        prepClinicDto.setRespiratoryRate( clinic.getRespiratoryRate());
        prepClinicDto.setTemperature( clinic.getTemperature());
        prepClinicDto.setSystolic( clinic.getSystolic());
        prepClinicDto.setDiastolic( clinic.getDiastolic());
        prepClinicDto.setAdherenceLevel( clinic.getAdherenceLevel());
        prepClinicDto.setStiScreening( clinic.getStiScreening());

        prepClinicDto.setWhy( clinic.getWhy());
        prepClinicDto.setDatePrepGiven( clinic.getDatePrepGiven());
        prepClinicDto.setUrinalysis( clinic.getUrinalysis());
        prepClinicDto.setHepatitis( clinic.getHepatitis());
        prepClinicDto.setSyphilis( clinic.getSyphilis());
        prepClinicDto.setOtherTestsDone( clinic.getOtherTestsDone());
        prepClinicDto.setSyndromicStiScreening( clinic.getSyndromicStiScreening());

        return prepClinicDto;
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

        enrollmentDto.setDateEnrolled( enrollment.getDateEnrolled() );
        enrollmentDto.setDateReferred( enrollment.getDateReferred() );
        enrollmentDto.setRiskType( enrollment.getRiskType() );
        enrollmentDto.setSupporterName( enrollment.getSupporterName() );
        enrollmentDto.setSupporterRelationshipType( enrollment.getSupporterRelationshipType() );
        enrollmentDto.setSupporterPhone( enrollment.getSupporterPhone() );
        enrollmentDto.setPrepEligibilityUuid(enrollment.getPrepEligibilityUuid());
        enrollmentDto.setCommenced(true);

        enrollmentDto.setAncUniqueArtNo(enrollment.getAncUniqueArtNo());

        return enrollmentDto;
    }
    private PrepDto prepEnrollmentToPrepDto(PrepEnrollment prepEnrollment) {
        if ( prepEnrollment == null ) {
            return null;
        }

        PrepDto prepDto = new PrepDto();

        prepDto.setId(prepEnrollment.getId());
        prepDto.setExtra( prepEnrollment.getExtra() );
        PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepEnrollment.getPerson());
        prepDto.setPersonResponseDto(personResponseDto);
        prepDto.setDateStarted(prepEnrollment.getDateStarted());
        prepDto.setStatus(prepEnrollment.getStatus());
        return prepDto;
    }
    public PrepInterruption prepInterruptionRequestDtoToPrepInterruption(PrepInterruptionRequestDto prepInterruptionRequestDto, String personUuid) {
        if ( prepInterruptionRequestDto == null ) {
            return null;
        }

        PrepInterruption prepInterruption = new PrepInterruption();

        prepInterruption.setInterruptionType( prepInterruptionRequestDto.getInterruptionType() );
        prepInterruption.setInterruptionDate( prepInterruptionRequestDto.getInterruptionDate() );
        prepInterruption.setDateClientDied( prepInterruptionRequestDto.getDateClientDied() );
        prepInterruption.setCauseOfDeath( prepInterruptionRequestDto.getCauseOfDeath() );
        prepInterruption.setSourceOfDeathInfo( prepInterruptionRequestDto.getSourceOfDeathInfo() );
        prepInterruption.setDateClientReferredOut( prepInterruptionRequestDto.getDateClientReferredOut() );
        prepInterruption.setFacilityReferredTo( prepInterruptionRequestDto.getFacilityReferredTo() );
        prepInterruption.setInterruptionReason( prepInterruptionRequestDto.getInterruptionReason() );
        prepInterruption.setDateSeroConverted(prepInterruptionRequestDto.getDateSeroConverted());
        prepInterruption.setPersonUuid(personUuid);
        prepInterruption.setDateRestartPlacedBackMedication(prepInterruptionRequestDto.getDateRestartPlacedBackMedication());
        prepInterruption.setLinkToArt(prepInterruptionRequestDto.getLinkToArt());

        return prepInterruption;
    }

    public PrepInterruptionDto prepInterruptionToPrepInterruptionDto(PrepInterruption prepInterruption) {
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


        return prepInterruptionDto;
    }
}

package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
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

    private ModuleService moduleService;
    private boolean TRUE = true;

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }

    public PrepEligibilityDto saveEligibility (PrepEligibilityRequestDto prepEligibilityRequestDto){
        PersonResponseDto personResponseDto;
        Person person;
        PrepEligibility prepEligibility;

        if(prepEligibilityRequestDto.getPersonId() == null){
            if(prepEligibilityRequestDto.getPersonDto() == null) throw new EntityNotFoundException(PersonDto.class, "PersonDTO is ", " empty");
            personResponseDto = personService.createPerson(prepEligibilityRequestDto.getPersonDto());
            person = personRepository.findById(personResponseDto.getId()).get();
            String personUuid = person.getUuid();
            prepEligibility = this.prepEligibilityRequestDtoToPrepEligibility(prepEligibilityRequestDto, personUuid);
        } else {
            //already existing person
            person = this.getPerson(prepEligibilityRequestDto.getPersonId());
            prepEligibility = this.prepEligibilityRequestDtoToPrepEligibility(prepEligibilityRequestDto, person.getUuid());
        }

        prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility = prepEligibilityRepository.save(prepEligibility);
        prepEligibility.setPerson(person);
        return prepEligibilityToPrepEligibilityDto(prepEligibility);
    }

    public PrepDto saveEnrollment (PrepEnrollmentRequestDto prepEnrollmentRequestDto){
        PrepEnrollment prepEnrollment;
        String eligibilityUuid = prepEnrollmentRequestDto.getPrepEligibilityUuid();

        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByUuid(eligibilityUuid)
                .orElseThrow(()-> new EntityNotFoundException(PrepEligibility.class, "Eligibility ", eligibilityUuid));

        if(this.prepEnrollmentRepository.findByPrepEligibilityUuid(eligibilityUuid).isPresent()) {
            throw new RecordExistException(PrepEnrollment.class, "Eligibility Already taken for prep", eligibilityUuid);
        }

        prepEnrollment = this.prepClientRequestDtoToPrepClient(prepEnrollmentRequestDto, prepEligibility.getPersonUuid());

        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEnrollment = prepEnrollmentRepository.save(prepEnrollment);
        prepEnrollment.setPerson(prepEligibility.getPerson());
        return this.prepEnrollmentToPrepDto(prepEnrollment);
    }

    private PrepEnrollment prepClientRequestDtoToPrepClient(PrepEnrollmentRequestDto prepEnrollmentRequestDto, String personUuid) {
        if ( prepEnrollmentRequestDto == null ) {
            return null;
        }

        PrepEnrollment prepEnrollment = new PrepEnrollment();

        prepEnrollment.setUniqueId( prepEnrollmentRequestDto.getUniqueId() );
        prepEnrollment.setDateOfRegistration( prepEnrollmentRequestDto.getDateOfRegistration() );
        prepEnrollment.setTargetGroup( prepEnrollmentRequestDto.getTargetGroup() );
        prepEnrollment.setPersonUuid( personUuid);
        prepEnrollment.setExtra( prepEnrollmentRequestDto.getExtra() );

        return prepEnrollment;
    }

    private PrepDto prepEnrollmentToPrepDto(PrepEnrollment prepEnrollment) {
        if ( prepEnrollment == null ) {
            return null;
        }

        PrepDto prepDto = new PrepDto();

        prepDto.setId(prepEnrollment.getId());
        prepDto.setUniqueId( prepEnrollment.getUniqueId() );
        prepDto.setEntryPoint(prepEnrollment.getEntryPoint());
        prepDto.setDateOfRegistration( prepEnrollment.getDateOfRegistration() );
        prepDto.setTargetGroup( prepEnrollment.getTargetGroup() );
        prepDto.setSourceOfReferrer( prepEnrollment.getSourceOfReferrer() );
        prepDto.setPregnant( prepEnrollment.getPregnant() );
        prepDto.setStatusAtRegistration(prepEnrollment.getStatusAtRegistration());
        prepDto.setBreastfeeding(prepEnrollment.getBreastfeeding());
        prepDto.setEnrollmentSetting( prepEnrollment.getEnrollmentSetting() );
        prepDto.setExtra( prepEnrollment.getExtra() );
        PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepEnrollment.getPerson());
        prepDto.setPersonResponseDto(personResponseDto);
        prepDto.setDateStarted(prepEnrollment.getDateStarted());
        prepDto.setCareEntryPointOther(prepEnrollment.getCareEntryPointOther());
        prepDto.setDateOfLpm(prepEnrollment.getDateOfLpm());
        prepDto.setPregnant(prepEnrollment.getPregnant());
        return prepDto;
    }

    private PrepDtos prepToPrepDtos(List<PrepEnrollment> clients){
        final Long[] pId = {null};
        final Long[] prepId = {null};
        final String[] uniqueId = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        PrepDtos prepDtos = new PrepDtos();
        List<PrepDto> prepDtoList =  clients
                .stream()
                .sorted(Comparator.comparingLong(PrepEnrollment::getId).reversed())
                .map(prepClient -> {
                    if(pId[0] == null) {
                        Person person = prepClient.getPerson();
                        prepId[0] = prepClient.getId();
                        uniqueId[0] = prepClient.getUniqueId();
                        pId[0] = person.getId();
                        personResponseDto[0] = personService.getDtoFromPerson(person);
                    }
                    return this.prepEnrollmentToPrepDto(prepClient);})
                .sorted(Comparator.comparingLong(PrepDto::getId).reversed())
                .collect(Collectors.toList());
        prepDtos.setPrepCount(prepDtoList.size());
        prepDtos.setPrepDtoList(prepDtoList);
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
                prepDtos.setPrepCount(0);
                prepDtos.setPersonResponseDto(personResponseDto);
                prepDtos.setPersonId(personResponseDto.getId());
                prepDtosList.add(prepDtos);
            } else {
                prepDtosList.add(this.prepToPrepDtos(null, prepEnrollments));
            }
        }
        return prepDtosList;
    }

    public Page<PrepEnrollment> findPrepClientPage(Pageable pageable) {
        return prepEnrollmentRepository.findAll(pageable);
    }

    public PrepDtos getAllPrepDtos(Page<PrepEnrollment> page, List<PrepEnrollment> prepEnrollments){
        if(page != null && !page.isEmpty()){
            return prepToPrepDtos(null, page.stream().collect(Collectors.toList()));
        } else if(prepEnrollments != null && !prepEnrollments.isEmpty()){
            return prepToPrepDtos(null, prepEnrollments);
        }
        return null;
    }

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

    public PrepDtos getPrepClientById(Long id){
        List<PrepEnrollment> prepEnrollments = new ArrayList<>();
        prepEnrollments.add(this.getById(id));
        return this.prepToPrepDtos(null, prepEnrollments);
    }

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


    private PrepDtos prepToPrepDtos(Person person, List<PrepEnrollment> clients){
        final Long[] pId = {null};
        final String[] uniqueId = {null};
        final String[] personUuid = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        boolean isPositive = false;

        if(person!= null && person.getUuid() != null){
            pId[0] =person.getId();
            personResponseDto[0] = personService.getDtoFromPerson(person);
            personUuid[0]  = person.getUuid();
        }

        PrepDtos prepDtos = new PrepDtos();
        List<PrepDto> prepDtoList = new ArrayList<>();
        prepDtoList =  clients
                .stream()
                .map(client -> {
                    if(pId[0] == null) {
                        Person person1 = client.getPerson();
                        pId[0] = person.getId();
                        personResponseDto[0] = personService.getDtoFromPerson(person1);
                        personUuid[0]  = person.getUuid();
                    }
                    if(uniqueId[0] == null){uniqueId[0] = client.getUniqueId();}
                    return this.prepEnrollmentToPrepDto(client);})
                .collect(Collectors.toList());
        prepDtos.setPrepCount(prepDtoList.size());
        prepDtos.setPrepDtoList(prepDtoList);
        prepDtos.setPersonId(pId[0]);
        /*if(moduleService.exist("HIVModule") && personUuid[0] != null){
            if(prepRepository.findInHivEnrollmentByUuid(personUuid[0]).isPresent()){
                isPositive = true;
            }
        }*/
        prepDtos.setUniqueId(uniqueId[0]);
        prepDtos.setPersonResponseDto(personResponseDto[0]);
        prepDtos.setHivPositive(isPositive);
        return prepDtos;
    }

    public PrepEligibility prepEligibilityRequestDtoToPrepEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto, String personUuid) {
        if ( prepEligibilityRequestDto == null ) {
            return null;
        }

        PrepEligibility prepEligibility = new PrepEligibility();

        prepEligibility.setHivRisk( prepEligibilityRequestDto.getHivRisk() );
        prepEligibility.setUniqueId(prepEligibilityRequestDto.getUniqueId());
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

        return prepEligibilityDto;
    }
}

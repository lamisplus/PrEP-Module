package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.repository.PrepRepository;
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
    private final PrepRepository prepRepository;

    private ModuleService moduleService;
    private boolean TRUE = true;

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }

    public PrepDto save (PrepEnrollmentRequestDto prepEnrollmentRequestDto){
        PersonResponseDto personResponseDto;
        Person person;
        PrepEnrollment prepEnrollment;

        if(prepEnrollmentRequestDto.getPersonId() == null){
            if(prepEnrollmentRequestDto.getPersonDto() == null) throw new EntityNotFoundException(PersonDto.class, "PersonDTO is ", " empty");
            personResponseDto = personService.createPerson(prepEnrollmentRequestDto.getPersonDto());
            person = personRepository.findById(personResponseDto.getId()).get();
            String personUuid = person.getUuid();
            prepEnrollment = this.prepClientRequestDtoToPrepClient(prepEnrollmentRequestDto, personUuid);
        } else {
            //already existing person
            person = this.getPerson(prepEnrollmentRequestDto.getPersonId());
            prepEnrollment = this.prepClientRequestDtoToPrepClient(prepEnrollmentRequestDto, person.getUuid());
        }

        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEnrollment = prepRepository.save(prepEnrollment);
        prepEnrollment.setPerson(person);
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
        prepDto.setDateOfRegistration( prepEnrollment.getDateOfRegistration() );
        prepDto.setTargetGroup( prepEnrollment.getTargetGroup() );
        prepDto.setSourceOfReferrer( prepEnrollment.getSourceOfReferrer() );
        prepDto.setPregnant( prepEnrollment.getPregnant() );
        prepDto.setEnrollmentSetting( prepEnrollment.getEnrollmentSetting() );
        prepDto.setExtra( prepEnrollment.getExtra() );
        PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepEnrollment.getPerson());
        prepDto.setPersonResponseDto(personResponseDto);

        //Prep Commencement
        prepDto.setDateStarted(prepEnrollment.getDateStarted());


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
        return prepRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "id", ""+id));
    }

    public List<PrepDtos> getAllPatients(){
        List<PrepDtos> prepDtosList = new ArrayList<>();
        for(PersonResponseDto personResponseDto :personService.getAllPerson()){
            Person person = this.getPerson(personResponseDto.getId());
            List<PrepEnrollment> prepEnrollments = prepRepository.findAllByPersonOrderByIdDesc(person);
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
        return prepRepository.findAll(pageable);
    }

    public PrepDtos getAllPrepClientDtos(Page<PrepEnrollment> page, List<PrepEnrollment> prepEnrollments){
        if(page != null && !page.isEmpty()){
            return prepToPrepDtos(null, page.stream().collect(Collectors.toList()));
        } else if(prepEnrollments != null && !prepEnrollments.isEmpty()){
            return prepToPrepDtos(null, prepEnrollments);
        }
        return null;
    }

    public String getClientNameByCode(String code) {
        List<PrepEnrollment> prepEnrollments = prepRepository.findAllByUniqueIdOrderByIdDesc(code);
        if(prepEnrollments.isEmpty())return "Record Not Found";

        Person person = prepEnrollments.stream().findFirst().get().getPerson();
        return person.getFirstName() + " " + person.getSurname();
    }

    public PrepDtos getPrepClientByPersonId(Long personId){
        Person person = personRepository.findById(personId).orElse(new Person());
        if(person.getId() == null){
            return new PrepDtos();
        }
        return this.prepToPrepDtos(person, prepRepository.findAllByPersonOrderByIdDesc(person));
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
        prepRepository.save(prepEnrollment);
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
                //.filter(htsClientDtos ->htsClientDtos.getClientCode() != null)
                .collect(Collectors.toList());
        return PaginationUtil.generatePagination(page, htsClientDtosList);
    }

    public PrepDtos getPrepClientByPersonId(Person person){
        return this.prepToPrepDtos(person, prepRepository.findAllByPersonOrderByIdDesc(person));
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
        if(moduleService.exist("HIVModule") && personUuid[0] != null){
            if(prepRepository.findInHivEnrollmentByUuid(personUuid[0]).isPresent()){
                isPositive = true;
            }
        }
        prepDtos.setUniqueId(uniqueId[0]);
        prepDtos.setPersonResponseDto(personResponseDto[0]);
        prepDtos.setHivPositive(isPositive);
        return prepDtos;
    }
}

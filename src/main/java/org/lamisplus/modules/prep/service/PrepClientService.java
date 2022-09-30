package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.patient.domain.dto.PersonDto;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.lamisplus.modules.prep.repository.PrepClientRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepClientService {
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepClientRepository prepClientRepository;
    private boolean TRUE = true;

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }

    public PrepClientDto save (PrepClientRequestDto prepClientRequestDto){
        PersonResponseDto personResponseDto;
        Person person;
        PrepClient prepClient;

        if(prepClientRequestDto.getPersonId() == null){
            if(prepClientRequestDto.getPersonDto() == null) throw new EntityNotFoundException(PersonDto.class, "PersonDTO is ", " empty");
            personResponseDto = personService.createPerson(prepClientRequestDto.getPersonDto());
            person = personRepository.findById(personResponseDto.getId()).get();
            String personUuid = person.getUuid();
            prepClient = this.prepClientRequestDtoToPrepClient(prepClientRequestDto, personUuid);
        } else {
            //already existing person
            person = this.getPerson(prepClientRequestDto.getPersonId());
            prepClient = this.prepClientRequestDtoToPrepClient(prepClientRequestDto, person.getUuid());
        }

        prepClient.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClient = prepClientRepository.save(prepClient);
        prepClient.setPerson(person);
        return this.prepClientToPrepClientDto(prepClient);
    }

    private PrepClient prepClientRequestDtoToPrepClient(PrepClientRequestDto prepClientRequestDto, String personUuid) {
        if ( prepClientRequestDto == null ) {
            return null;
        }

        PrepClient prepClient = new PrepClient();

        prepClient.setUniqueClientId( prepClientRequestDto.getUniqueClientId() );
        prepClient.setDateEnrolled( prepClientRequestDto.getDateEnrolled() );
        prepClient.setPopulationType( prepClientRequestDto.getPopulationType() );
        prepClient.setPartnerType( prepClientRequestDto.getPartnerType() );
        prepClient.setHivTestingPoint( prepClientRequestDto.getHivTestingPoint() );
        prepClient.setDateOfLastHivNegativeTest( prepClientRequestDto.getDateOfLastHivNegativeTest() );
        prepClient.setDateReferredForPrep( prepClientRequestDto.getDateReferredForPrep() );
        prepClient.setPersonUuid( personUuid);
        prepClient.setExtra( prepClientRequestDto.getExtra() );

        return prepClient;
    }

    private PrepClientDto prepClientToPrepClientDto(PrepClient prepClient) {
        if ( prepClient == null ) {
            return null;
        }

        PrepClientDto prepClientDto = new PrepClientDto();

        prepClientDto.setId(prepClient.getId());
        prepClientDto.setUniqueClientId( prepClient.getUniqueClientId() );
        prepClientDto.setDateEnrolled( prepClient.getDateEnrolled() );
        prepClientDto.setPopulationType( prepClient.getPopulationType() );
        prepClientDto.setPartnerType( prepClient.getPartnerType() );
        prepClientDto.setHivTestingPoint( prepClient.getHivTestingPoint() );
        prepClientDto.setDateOfLastHivNegativeTest( prepClient.getDateOfLastHivNegativeTest() );
        prepClientDto.setDateReferredForPrep( prepClient.getDateReferredForPrep() );
        prepClientDto.setExtra( prepClient.getExtra() );
        PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepClient.getPerson());
        prepClientDto.setPersonResponseDto(personResponseDto);

        //Prep Commencement
        prepClientDto.setDateInitialAdherenceCounseling(prepClient.getDateInitialAdherenceCounseling());
        prepClientDto.setDatePrepStart(prepClient.getDatePrepStart());

        if(prepClient.getDatePrepStart() != null)prepClientDto.setPrepCommenced(TRUE);
        prepClientDto.setPrepRegimen(prepClient.getPrepRegimen());
        prepClientDto.setTransferIn(prepClient.getTransferIn());
        prepClientDto.setWeight(prepClient.getWeight());
        prepClientDto.setHeight(prepClient.getHeight());

        return prepClientDto;
    }

    private PrepClientDtos prepClientToPrepClientDtos(List<PrepClient> clients){
        final Long[] pId = {null};
        final String[] clientCode = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        PrepClientDtos prepClientDtos = new PrepClientDtos();
        List<PrepClientDto> prepClientDtoList =  clients
                .stream()
                .map(prepClient -> {
                    if(pId[0] == null) {
                        Person person = prepClient.getPerson();
                        clientCode[0] = prepClient.getUniqueClientId();
                        pId[0] = person.getId();
                        personResponseDto[0] = personService.getDtoFromPerson(person);
                    }
                    return this.prepClientToPrepClientDto(prepClient);})
                .collect(Collectors.toList());
        prepClientDtos.setPrepCount(prepClientDtoList.size());
        prepClientDtos.setPrepClientDtoList(prepClientDtoList);
        prepClientDtos.setPersonId(pId[0]);
        prepClientDtos.setUniqueClientId(clientCode[0]);
        prepClientDtos.setPersonResponseDto(personResponseDto[0]);
        return prepClientDtos;
    }

    private PrepClient getById(Long id){
        return prepClientRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(()-> new EntityNotFoundException(PrepClient.class, "id", ""+id));
    }

    public List<PrepClientDtos> getAllPatients(){
        List<PrepClientDtos> prepClientDtosList = new ArrayList<>();
        for(PersonResponseDto personResponseDto :personService.getAllPerson()){
            Person person = this.getPerson(personResponseDto.getId());
            List<PrepClient> clients = prepClientRepository.findAllByPersonOrderByIdDesc(person);
            PrepClientDtos prepClientDtos = new PrepClientDtos();
            if(clients.isEmpty()){
                prepClientDtos.setPrepClientDtoList(new ArrayList<>());
                prepClientDtos.setPrepCount(0);
                prepClientDtos.setPersonResponseDto(personResponseDto);
                prepClientDtos.setPersonId(personResponseDto.getId());
                prepClientDtosList.add(prepClientDtos);
            } else {
                prepClientDtosList.add(this.prepClientToPrepClientDtos(clients));
            }
        }
        return prepClientDtosList;
    }

    public Page<PrepClient> findPrepClientPage(Pageable pageable) {
        return prepClientRepository.findAll(pageable);
    }

    public PrepClientDtos getAllPrepClientDtos(Page<PrepClient> page, List<PrepClient> clients){
        if(page != null && !page.isEmpty()){
            return prepClientToPrepClientDtos(page.stream().collect(Collectors.toList()));
        } else if(clients != null && !clients.isEmpty()){
            return prepClientToPrepClientDtos(clients);
        }
        return null;
    }

    public String getClientNameByCode(String code) {
        List<PrepClient> prepClients = prepClientRepository.findAllByUniqueClientId(code);
        if(prepClients.isEmpty())return "Record Not Found";

        Person person = prepClients.stream().findFirst().get().getPerson();
        return person.getFirstName() + " " + person.getSurname();
    }

    public PrepClientDtos getPrepClientByPersonId(Long personId){
        Person person = personRepository.findById(personId).orElse(new Person());
        if(person.getId() == null){
            return new PrepClientDtos();
        }
        return this.prepClientToPrepClientDtos(prepClientRepository.findAllByPerson(person));
    }

    public PrepClientDtos getPrepClientById(Long id){
        List<PrepClient> prepClients = new ArrayList<>();
        prepClients.add(this.getById(id));
        return this.prepClientToPrepClientDtos(prepClients);
    }

    public PrepClientDto updatePrepCommencement(Long id, PrepClientCommencementDto prepClientCommencementDto){
        PrepClient prepClient = this.getById(id);
        if(!this.getPersonId(prepClient).equals(prepClientCommencementDto.getPersonId())) {
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }
        prepClient = this.prepClientCommencementDtoToPrepClient(prepClient, prepClientCommencementDto);
        prepClient = prepClientRepository.save(prepClient);
        PrepClientDto prepClientDto = new PrepClientDto();

        BeanUtils.copyProperties(prepClient, prepClientDto);
        prepClientDto.setPrepCommenced(TRUE);

        return prepClientDto;
    }

    private PrepClient prepClientCommencementDtoToPrepClient(@NotNull PrepClient prepClient, PrepClientCommencementDto prepClientCommencementDto) {
        if ( prepClientCommencementDto == null ) {
            return null;
        }

        prepClient.setDateInitialAdherenceCounseling(prepClientCommencementDto.getDateInitialAdherenceCounseling());
        prepClient.setDatePrepStart(prepClientCommencementDto.getDatePrepStart());
        prepClient.setPrepRegimen(prepClientCommencementDto.getPrepRegimen());
        prepClient.setTransferIn(prepClientCommencementDto.getTransferIn());
        prepClient.setWeight(prepClientCommencementDto.getWeight());
        prepClient.setHeight(prepClientCommencementDto.getHeight());
        return prepClient;
    }

    private PrepClient prepClientDiscontinuationInterruptionDtoToPrepClient(@NotNull PrepClient prepClient, PrepClientDiscontinuationInterruptionDto prepClientDiscontinuationInterruptionDto) {
        if ( prepClientDiscontinuationInterruptionDto == null ) {
            return null;
        }

        prepClient.setInterruptionType(prepClientDiscontinuationInterruptionDto.getInterruptionType());
        prepClient.setDateInterruption(prepClientDiscontinuationInterruptionDto.getDateInterruption());
        prepClient.setWhy(prepClientDiscontinuationInterruptionDto.getWhy());
        prepClient.setDateRestartPlacedBackMedication(prepClientDiscontinuationInterruptionDto.getDateRestartPlacedBackMedication());

        return prepClient;
    }

    private PrepClient PrepClientEligibilityScreeningDtoToPrepClient(@NotNull PrepClient prepClient, PrepClientEligibilityScreeningDto eligibilityScreeningDto) {
        if ( eligibilityScreeningDto == null ) {
            return null;
        }

        prepClient.setEligibilityScreeningClientName(eligibilityScreeningDto.getEligibilityScreeningClientName());
        prepClient.setEligibilityScreeningDob(eligibilityScreeningDto.getEligibilityScreeningDob());
        prepClient.setEligibilityScreeningDateVisit(eligibilityScreeningDto.getEligibilityScreeningDateVisit());
        prepClient.setEligibilityScreeningEducationLevel(prepClient.getEligibilityScreeningEducationLevel());
        prepClient.setEligibilityScreeningOccupation(eligibilityScreeningDto.getEligibilityScreeningOccupation());

        return prepClient;
    }

    private Long getPersonId(PrepClient prepClient){
        return prepClient.getPerson().getId();
    }

    public void delete(Long id) {
        PrepClient prepClient = this.getById(id);
        prepClient.setArchived(ARCHIVED);
        prepClientRepository.save(prepClient);
    }

    public PrepClientDto updatePrepDiscontinuationInterruption(Long id, PrepClientDiscontinuationInterruptionDto discontinuationInterruptionDto) {
        PrepClient prepClient = this.getById(id);
        if(!this.getPersonId(prepClient).equals(discontinuationInterruptionDto.getPersonId())) {
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }
        prepClient = this.prepClientDiscontinuationInterruptionDtoToPrepClient(prepClient, discontinuationInterruptionDto);
        prepClient = prepClientRepository.save(prepClient);
        PrepClientDto prepClientDto = new PrepClientDto();

        BeanUtils.copyProperties(prepClient, prepClientDto);
        if(prepClientDto.getDatePrepStart() != null)prepClientDto.setPrepCommenced(TRUE);

        return prepClientDto;
    }

    public PrepClientDto updatePrepEligibilityScreening(Long id, PrepClientEligibilityScreeningDto eligibilityScreeningDto) {
        PrepClient prepClient = this.getById(id);
        if(!this.getPersonId(prepClient).equals(eligibilityScreeningDto.getPersonId())) {
            throw new IllegalTypeException(Person.class, "Person", "id does not match with supplied personId");
        }
        prepClient = this.PrepClientEligibilityScreeningDtoToPrepClient(prepClient, eligibilityScreeningDto);
        prepClient = prepClientRepository.save(prepClient);
        PrepClientDto prepClientDto = new PrepClientDto();

        BeanUtils.copyProperties(prepClient, prepClientDto);
        if(prepClientDto.getDatePrepStart() != null)prepClientDto.setPrepCommenced(TRUE);

        return prepClientDto;
    }
}

package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.patient.domain.dto.PersonResponseDto;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.service.PersonService;
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
import java.util.*;
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
    private final PrepClinicRepository prepClinicRepository;
    private final PatientActivityService patientActivityService;
    private final PrepInterruptionRepository prepInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepEligibilityDto saveEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto) {
        Person person;
        person = this.getPerson(prepEligibilityRequestDto.getPersonId());
        PrepEligibility prepEligibility = this.prepEligibilityRequestDtoToPrepEligibility(prepEligibilityRequestDto, person.getUuid());
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
        PrepEligibilityDto prepEligibilityDto = this.prepEligibilityToPrepEligibilityDto(prepEligibility);
        prepEligibilityDto.setPrepEligibilityCount(prepEligibilityRepository
                .findAllByPersonUuid(person.getUuid()).size());
        return prepEligibilityDto;
    }

    public PrepEnrollmentDto saveEnrollment(PrepEnrollmentRequestDto prepEnrollmentRequestDto) {
        PrepEnrollment prepEnrollment;
        String eligibilityUuid = prepEnrollmentRequestDto.getPrepEligibilityUuid();

        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByUuid(eligibilityUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibility.class, "Eligibility ", eligibilityUuid));

        Person person = this.getPerson(prepEnrollmentRequestDto.getPersonId());

        if (this.prepEnrollmentRepository.findByPrepEligibilityUuid(eligibilityUuid).isPresent()) {
            throw new RecordExistException(PrepEnrollment.class, "Eligibility Already taken for prep", eligibilityUuid);
        }

        if (!prepEligibility.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepEnrollment.class, "Person not same for prepEligibilityUuid", eligibilityUuid);
        }

        prepEnrollment = this.enrollmentRequestDtoToEnrollment(prepEnrollmentRequestDto, prepEligibility.getPersonUuid());

        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility.setUuid(UUID.randomUUID().toString());

        //Check if client Enrollment on same date exist and throw an error
        prepEnrollmentRepository
                .findByDateEnrolledAndPersonUuid(prepEnrollmentRequestDto.getDateEnrolled(),
                        person.getUuid()).ifPresent(prepEnroll -> {
                    throw new RecordExistException(PrepEnrollment.class, "Encounter date",
                            String.valueOf(prepEnroll.getDateEnrolled()));
                });

        prepEnrollment = prepEnrollmentRepository.save(prepEnrollment);
        prepEnrollment.setPerson(prepEligibility.getPerson());
        PrepEnrollmentDto prepEnrollmentDto = this.enrollmentToEnrollmentDto(prepEnrollment);
        prepEnrollmentDto.setStatus("Enrolled");
        return prepEnrollmentDto;
    }

    public PrepClinicDto saveCommencement(PrepClinicRequestDto commencementRequestDto) {
        String enrollmentUuid = commencementRequestDto.getPrepEnrollmentUuid();

        Person person = this.getPerson(commencementRequestDto.getPersonId());
        if (commencementRequestDto.getDatePrepStart() != null && commencementRequestDto.getEncounterDate() == null) {
            commencementRequestDto.setEncounterDate(commencementRequestDto.getDatePrepStart());
        }

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(enrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", enrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepClinic.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepClinic prepClinic = this.clinicRequestDtoToClinic(commencementRequestDto, person.getUuid());

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(true);
        prepClinic = prepClinicRepository.save(prepClinic);
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic);
        return prepClinicDto;
    }

    public PrepClinicDto saveClinic(PrepClinicRequestDto clinicRequestDto) {
        String enrollmentUuid = clinicRequestDto.getPrepEnrollmentUuid();

        Person person = this.getPerson(clinicRequestDto.getPersonId());

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(enrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", enrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepClinic.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepClinic prepClinic = this.clinicRequestDtoToClinic(clinicRequestDto, person.getUuid());
        prepClinicRepository.findByEncounterDateAndPersonUuidAndIsCommencementAndArchived(clinicRequestDto.getEncounterDate(), person.getUuid(), false, 0)
                .ifPresent(prepClinicRec -> {
                    if (prepClinicRec.getArchived() == 0) {
                        throw new RecordExistException(PrepClinic.class, "Encounter date", String.valueOf(clinicRequestDto.getEncounterDate()));
                    }
                });

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(false);
        prepClinic.setVisitType(clinicRequestDto.getVisitType());
        prepClinic.setHealthCareWorkerSignature(clinicRequestDto.getHealthCareWorkerSignature());
        prepClinic = prepClinicRepository.save(prepClinic);
        prepClinic.setPregnant(clinicRequestDto.getPregnant());
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic);
        return prepClinicDto;
    }


    public PrepInterruptionDto saveInterruption(PrepInterruptionRequestDto interruptionRequestDto) {
        Person person = this.getPerson(interruptionRequestDto.getPersonId());
        PrepInterruption prepInterruption = interruptionRequestDtoInterruption(interruptionRequestDto, person.getUuid());
        prepInterruption.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());

        prepInterruptionRepository
                .findFirstByInterruptionDateAndPersonUuidAndArchived(interruptionRequestDto.getInterruptionDate(), person.getUuid(), 0)
                .ifPresent(existingInterruption -> {
                    if (existingInterruption.getArchived() == 0) {
                        throw new RecordExistException(PrepInterruption.class, "Encounter date", String.valueOf(interruptionRequestDto.getInterruptionDate()));
                    }
                });

        try {
            prepInterruption = prepInterruptionRepository.save(prepInterruption);
        } catch (Exception e) {
            throw new RuntimeException("Input or Server error. Please Try again.");
        }

        prepInterruption.setPerson(person);
        PrepInterruptionDto prepInterruptionDto = this.interruptionToInterruptionDto(prepInterruption);
        return prepInterruptionDto;
    }

    private PrepDtos prepToPrepDtos(List<PrepEnrollment> clients) {
        final Long[] pId = {null};
        final String[] uniqueId = {null};
        final String[] personUuid = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        PrepDtos prepDtos = new PrepDtos();
        List<PrepDto> prepDtoList = clients
                .stream()
                .sorted(Comparator.comparingLong(PrepEnrollment::getId).reversed())
                .map(prepEnrollment -> {
                    if (pId[0] == null) {
                        Person person = prepEnrollment.getPerson();
                        uniqueId[0] = prepEnrollment.getUniqueId();
                        pId[0] = person.getId();
                        personUuid[0] = prepEnrollment.getPrepEligibilityUuid();
                        personResponseDto[0] = personService.getDtoFromPerson(person);
                    }
                    return this.prepEnrollmentToPrepDto(prepEnrollment);
                })
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

    private PrepEnrollment getById(Long id) {
        return prepEnrollmentRepository
                .findByIdAndArchivedAndFacilityId(id, UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "id", "" + id));
    }

    public List<PrepDtos> getAllPatients() {
        List<PrepDtos> prepDtosList = new ArrayList<>();
        for (PersonResponseDto personResponseDto : personService.getAllPerson()) {
            Person person = this.getPerson(personResponseDto.getId());
            List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository.findAllByPersonOrderByIdDesc(person);
            PrepDtos prepDtos = new PrepDtos();
            if (prepEnrollments.isEmpty()) {
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

    public String getClientNameByCode(String code) {
        List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository.findAllByUniqueIdOrderByIdDesc(code);
        if (prepEnrollments.isEmpty()) return "Record Not Found";

        Person person = prepEnrollments.stream().findFirst().get().getPerson();
        return person.getFirstName() + " " + person.getSurname();
    }

    public PrepDtos getPrepByPersonId(Long personId) {
        Person person = personRepository.findById(personId).orElse(new Person());
        if (person.getId() == null) {
            return new PrepDtos();
        }
        return this.prepToPrepDtos(person, prepEnrollmentRepository.findAllByPersonOrderByIdDesc(person));
    }

    public List<PrepEnrollmentDto> getEnrollmentByPersonId(Long personId) {
        Person person = this.getPerson(personId);
        List<PrepEnrollmentDto> prepEnrollmentDtos = new ArrayList<>();
        List<PrepEnrollment> prepEnrollments = prepEnrollmentRepository.findAllByPerson(person);
        prepEnrollments.forEach(prepEnrollment -> {
            prepEnrollmentDtos.add(enrollmentToEnrollmentDto(prepEnrollment));
        });
        return prepEnrollmentDtos;
    }

    public List<PrepClinicDto> getCommencementByPersonId(Long personId) {
        Person person = this.getPerson(personId);
        List<PrepClinicDto> prepClinicDtos = new ArrayList<>();
        List<PrepClinic> prepClinics = prepClinicRepository.findAllByPersonAndIsCommencement(person, true);
        prepClinics.forEach(prepClinic -> {
            prepClinicDtos.add(clinicToClinicDto(prepClinic));
        });
        return prepClinicDtos;
    }

    private Long getPersonId(PrepEnrollment prepEnrollment) {
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
        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\s", "");
            String queryParam = "%" + searchValue + "%";
            return personRepository
                    .findAllPersonBySearchParameters(queryParam, UN_ARCHIVED, facilityId, pageable);
        }
        return personRepository
                .getAllByArchivedAndFacilityIdOrderByIdDesc(UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), pageable);
    }

    public Page<PrepClient> findAllPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\s", "");
            String queryParam = "%" + searchValue + "%";
            return prepEnrollmentRepository
                    .findAllPersonPrepAndStatusBySearchParam(UN_ARCHIVED, facilityId, queryParam, pageable);
        }
        return prepEnrollmentRepository
                .findAllPersonPrepAndStatus(UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), pageable);
    }

    public Page<PrepClient> findOnlyPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\s", "");
            String queryParam = "%" + searchValue + "%";
            return prepEnrollmentRepository
                    .findOnlyPersonPrepAndStatusBySearchParam(UN_ARCHIVED, facilityId, queryParam, pageable);
        }
        return prepEnrollmentRepository
                .findOnlyPersonPrepAndStatus(UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), pageable);
    }

    public PageDTO getAllPrepDtosByPerson(Page<Person> page) {

        List<PrepDtos> htsClientDtosList = page.stream()
                .map(person -> getPrepClientByPersonId(person))
                .collect(Collectors.toList());
        return PaginationUtil.generatePagination(page, htsClientDtosList);
    }

    public PrepDtos getPrepClientByPersonId(Person person) {
        return this.prepToPrepDtos(person, prepEnrollmentRepository.findAllByPersonOrderByIdDesc(person));
    }

    private PrepDtos prepToPrepDtos(@NotNull Person person, List<PrepEnrollment> clients) {
        boolean isPositive = false;
        PrepDtos prepDtos = new PrepDtos();

        if (person == null) throw new EntityNotFoundException(Person.class, "Person", "is null");
        prepDtos.setPersonId(person.getId());
        prepDtos.setPersonResponseDto(personService.getDtoFromPerson(person));
        prepDtos.setPrepEligibilityCount(prepEligibilityRepository.countAllByPersonUuid(person.getUuid()));

        List<PrepDto> prepDtoList = clients
                .stream()
                .map(client -> {
                    if (person == null) {
                        Person samePerson = client.getPerson();
                        final PersonResponseDto personResponseDto = personService.getDtoFromPerson(samePerson);
                        prepDtos.setPersonResponseDto(personResponseDto);
                        prepDtos.setPersonId(personResponseDto.getId());
                        prepDtos.setPrepEligibilityCount(prepEligibilityRepository.countAllByPersonUuid(samePerson.getUuid()));
                    }
                    if (prepDtos.getUniqueId() == null) {
                        prepDtos.setUniqueId(client.getUniqueId());
                    }
                    return this.prepEnrollmentToPrepDto(client);
                })
                .collect(Collectors.toList());
        int prepCount = prepDtoList.size();
        prepDtos.setPrepEnrollmentCount(prepCount);
        prepDtos.setPrepDtoList(prepDtoList);
        Integer commencementCount = prepClinicRepository.countAllByPersonUuid(person.getUuid());
        prepDtos.setCommenced((commencementCount > 0) ? true : false);
        prepDtos.setPrepEligibilityCount(prepEligibilityRepository.countAllByPersonUuid(person.getUuid()));
        prepDtos.setHivPositive(isPositive);
        prepDtos.setPrepCommencementCount(commencementCount);
        PrepClient prepClient = prepEnrollmentRepository
                .findPersonPrepAndStatusByPatientUuid(UN_ARCHIVED,
                        currentUserOrganizationService.getCurrentUserOrganization(), person.getUuid())
                .orElse(null);
        if (prepClient == null) {
            prepDtos.setPrepStatus("Not Available");
        } else {
            prepDtos.setPrepStatus(prepClient.getPrepStatus());
            prepDtos.setDateConfirmedHiv(prepClient.getDateConfirmedHiv());
            prepDtos.setCreatedBy(prepClient.getCreatedBy());
            //prepDtos.setPrepEligibilityCount(prepClient.getEligibilityCount());
        }

        return prepDtos;
    }

    public PrepEligibilityDto getOpenEligibility(Long personId) {
        Person person = this.getPerson(personId);
        return prepEligibilityToPrepEligibilityDto(prepEligibilityRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED));
    }

    public PrepEnrollmentDto getOpenEnrollment(Long personId) {
        Person person = this.getPerson(personId);

        String status = "STOPPED, DEATH";
        Optional<PrepEnrollment> prepEnrollmentOptional = prepEnrollmentRepository
                .findByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED, currentUserOrganizationService.getCurrentUserOrganization(), status);
        if (prepEnrollmentOptional.isPresent())
            return enrollmentToEnrollmentDto(prepEnrollmentOptional.get());//PrepEnrollmentDto.builder().build();
        return new PrepEnrollmentDto();
    }

    public PrepEligibility prepEligibilityRequestDtoToPrepEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto, String personUuid) {
        if (prepEligibilityRequestDto == null) {
            return null;
        }

        PrepEligibility prepEligibility = new PrepEligibility();

        prepEligibility.setHivRisk(prepEligibilityRequestDto.getHivRisk());
        prepEligibility.setUniqueId(prepEligibilityRequestDto.getUniqueId());
        prepEligibility.setScore(prepEligibilityRequestDto.getScore());
        prepEligibility.setStiScreening(prepEligibilityRequestDto.getStiScreening());
        prepEligibility.setDrugUseHistory(prepEligibilityRequestDto.getDrugUseHistory());
        prepEligibility.setPersonalHivRiskAssessment(prepEligibilityRequestDto.getPersonalHivRiskAssessment());
        prepEligibility.setSexPartnerRisk(prepEligibilityRequestDto.getSexPartnerRisk());
        prepEligibility.setPersonUuid(personUuid);
        prepEligibility.setSexPartner(prepEligibilityRequestDto.getSexPartner());
        prepEligibility.setCounselingType(prepEligibilityRequestDto.getCounselingType());
        prepEligibility.setFirstTimeVisit(prepEligibilityRequestDto.getFirstTimeVisit());
        prepEligibility.setNumChildrenLessThanFive(prepEligibilityRequestDto.getNumChildrenLessThanFive());
        prepEligibility.setNumWives(prepEligibilityRequestDto.getNumWives());
        prepEligibility.setTargetGroup(prepEligibilityRequestDto.getTargetGroup());
        prepEligibility.setExtra(prepEligibilityRequestDto.getExtra());
        prepEligibility.setAssessmentForPepIndication(prepEligibilityRequestDto.getAssessmentForPepIndication());
        prepEligibility.setAssessmentForAcuteHivInfection(prepEligibilityRequestDto.getAssessmentForAcuteHivInfection());
        prepEligibility.setAssessmentForPrepEligibility(prepEligibilityRequestDto.getAssessmentForPrepEligibility());
        prepEligibility.setServicesReceivedByClient(prepEligibilityRequestDto.getServicesReceivedByClient());
        prepEligibility.setPopulationType(prepEligibilityRequestDto.getPopulationType());
        prepEligibility.setVisitType(prepEligibilityRequestDto.getVisitType());
        prepEligibility.setPregnancyStatus(prepEligibilityRequestDto.getPregnancyStatus());
        prepEligibility.setVisitDate(prepEligibilityRequestDto.getVisitDate());
        prepEligibility.setReasonForSwitch(prepEligibilityRequestDto.getReasonForSwitch());
        prepEligibility.setLftConducted(prepEligibilityRequestDto.getLftConducted());
        prepEligibility.setDateLiverFunctionTestResults(prepEligibilityRequestDto.getDateLiverFunctionTestResults());
        prepEligibility.setLiverFunctionTestResults(prepEligibilityRequestDto.getLiverFunctionTestResults());
        return prepEligibility;
    }

    public PrepEligibilityDto prepEligibilityToPrepEligibilityDto(PrepEligibility eligibility) {
        if (eligibility == null) {
            return null;
        }

        PrepEligibilityDto prepEligibilityDto = new PrepEligibilityDto();

        prepEligibilityDto.setId(eligibility.getId());
        prepEligibilityDto.setUuid(eligibility.getUuid());
        prepEligibilityDto.setUniqueId(eligibility.getUniqueId());
        prepEligibilityDto.setHivRisk(eligibility.getHivRisk());
        prepEligibilityDto.setStiScreening(eligibility.getStiScreening());
        prepEligibilityDto.setDrugUseHistory(eligibility.getDrugUseHistory());
        prepEligibilityDto.setPersonalHivRiskAssessment(eligibility.getPersonalHivRiskAssessment());
        prepEligibilityDto.setSexPartnerRisk(eligibility.getSexPartnerRisk());
        prepEligibilityDto.setPersonUuid(eligibility.getPersonUuid());
        prepEligibilityDto.setSexPartner(eligibility.getSexPartner());
        prepEligibilityDto.setCounselingType(eligibility.getCounselingType());
        prepEligibilityDto.setFirstTimeVisit(eligibility.getFirstTimeVisit());
        prepEligibilityDto.setNumChildrenLessThanFive(eligibility.getNumChildrenLessThanFive());
        prepEligibilityDto.setNumWives(eligibility.getNumWives());
        prepEligibilityDto.setTargetGroup(eligibility.getTargetGroup());
        prepEligibilityDto.setExtra(eligibility.getExtra());
        prepEligibilityDto.setAssessmentForPepIndication(eligibility.getAssessmentForPepIndication());
        prepEligibilityDto.setAssessmentForAcuteHivInfection(eligibility.getAssessmentForAcuteHivInfection());
        prepEligibilityDto.setAssessmentForPrepEligibility(eligibility.getAssessmentForPrepEligibility());
        prepEligibilityDto.setServicesReceivedByClient(eligibility.getServicesReceivedByClient());
        prepEligibilityDto.setPopulationType(eligibility.getPopulationType());
        prepEligibilityDto.setVisitType(eligibility.getVisitType());
        prepEligibilityDto.setPregnancyStatus(eligibility.getPregnancyStatus());
        prepEligibilityDto.setReasonForSwitch(eligibility.getReasonForSwitch());
        prepEligibilityDto.setLftConducted(eligibility.getLftConducted());
        prepEligibilityDto.setDateLiverFunctionTestResults(eligibility.getDateLiverFunctionTestResults());
        prepEligibilityDto.setLiverFunctionTestResults(eligibility.getLiverFunctionTestResults());
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(eligibility.getPerson());
        //prepEligibilityDto.setPersonResponseDto(personResponseDto);

        prepEligibilityDto.setVisitDate(eligibility.getVisitDate());

        return prepEligibilityDto;
    }

    public List<PatientActivity> getPrepPatientActivitiesById(Long id) {
        return patientActivityService.getActivities(id);
    }

    private PrepEnrollment enrollmentRequestDtoToEnrollment(PrepEnrollmentRequestDto prepEnrollmentRequestDto, String personUuid) {
        if (prepEnrollmentRequestDto == null) {
            return null;
        }

        PrepEnrollment prepEnrollment = new PrepEnrollment();

        prepEnrollment.setPersonUuid(personUuid);
        prepEnrollment.setExtra(prepEnrollmentRequestDto.getExtra());
        prepEnrollment.setUniqueId(prepEnrollmentRequestDto.getUniqueId());
        prepEnrollment.setExtra(prepEnrollmentRequestDto.getExtra());
        prepEnrollment.setPrepEligibilityUuid(prepEnrollmentRequestDto.getPrepEligibilityUuid());
        prepEnrollment.setDateEnrolled(prepEnrollmentRequestDto.getDateEnrolled());
        prepEnrollment.setDateReferred(prepEnrollmentRequestDto.getDateReferred());
        prepEnrollment.setRiskType(prepEnrollmentRequestDto.getRiskType());
        prepEnrollment.setSupporterName(prepEnrollmentRequestDto.getSupporterName());
        prepEnrollment.setSupporterRelationshipType(prepEnrollmentRequestDto.getSupporterRelationshipType());
        prepEnrollment.setSupporterPhone(prepEnrollmentRequestDto.getSupporterPhone());
        prepEnrollment.setStatus("ENROLLED");
        prepEnrollment.setAncUniqueArtNo(prepEnrollmentRequestDto.getAncUniqueArtNo());
        prepEnrollment.setHivTestingPoint(prepEnrollmentRequestDto.getHivTestingPoint());
        prepEnrollment.setDateOfLastHivNegativeTest(prepEnrollmentRequestDto.getDateOfLastHivNegativeTest());
        prepEnrollment.setTargetGroup(prepEnrollmentRequestDto.getTargetGroup());

        return prepEnrollment;
    }

    private PrepClinic clinicRequestDtoToClinic(PrepClinicRequestDto prepClinicRequestDto, String personUuid) {
        if (prepClinicRequestDto == null) {
            return null;
        }

        PrepClinic prepClinic = new PrepClinic();
        prepClinic.setPersonUuid(personUuid);
        prepClinic.setExtra(prepClinicRequestDto.getExtra());
        prepClinic.setDateInitialAdherenceCounseling(prepClinicRequestDto.getDateInitialAdherenceCounseling());
        prepClinic.setWeight(prepClinicRequestDto.getWeight());
        prepClinic.setHeight(prepClinicRequestDto.getHeight());
        prepClinic.setPregnant(prepClinicRequestDto.getPregnant());
        prepClinic.setPrepDistributionSetting(prepClinicRequestDto.getPrepDistributionSetting());
        prepClinic.setFamilyPlanning(prepClinicRequestDto.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning(prepClinicRequestDto.getDateOfFamilyPlanning());
        prepClinic.setDateReferred(prepClinicRequestDto.getDateReferred());
        prepClinic.setPrepEnrollmentUuid(prepClinicRequestDto.getPrepEnrollmentUuid());
        prepClinic.setRegimenId(prepClinicRequestDto.getRegimenId());
        prepClinic.setUrinalysisResult(prepClinicRequestDto.getUrinalysisResult());
        prepClinic.setCreatinineResult(prepClinicRequestDto.getCreatinineResult());
        prepClinic.setReferred(prepClinicRequestDto.getReferred());
        prepClinic.setDateReferred(prepClinicRequestDto.getDateReferred());
        prepClinic.setNextAppointment(prepClinicRequestDto.getNextAppointment());
        prepClinic.setEncounterDate(prepClinicRequestDto.getEncounterDate());
        prepClinic.setExtra(prepClinicRequestDto.getExtra());
        prepClinic.setDatePrepStart(prepClinicRequestDto.getDatePrepStart());
        prepClinic.setPulse(prepClinicRequestDto.getPulse());
        prepClinic.setRespiratoryRate(prepClinicRequestDto.getRespiratoryRate());
        prepClinic.setTemperature(prepClinicRequestDto.getTemperature());
        prepClinic.setSystolic(prepClinicRequestDto.getSystolic());
        prepClinic.setDiastolic(prepClinicRequestDto.getDiastolic());
        prepClinic.setAdherenceLevel(prepClinicRequestDto.getAdherenceLevel());
        prepClinic.setStiScreening(prepClinicRequestDto.getStiScreening());
        prepClinic.setWhy(prepClinicRequestDto.getWhy());
        prepClinic.setDatePrepGiven(prepClinicRequestDto.getDatePrepGiven());
        prepClinic.setUrinalysis(prepClinicRequestDto.getUrinalysis());
        prepClinic.setCreatinine(prepClinicRequestDto.getCreatinine());

        prepClinic.setHepatitis(prepClinicRequestDto.getHepatitis());
        prepClinic.setSyphilis(prepClinicRequestDto.getSyphilis());
        prepClinic.setOtherTestsDone(prepClinicRequestDto.getOtherTestsDone());
        prepClinic.setSyndromicStiScreening(prepClinicRequestDto.getSyndromicStiScreening());
        prepClinic.setRiskReductionServices(prepClinicRequestDto.getRiskReductionServices());
        prepClinic.setNotedSideEffects(prepClinicRequestDto.getNotedSideEffects());
        prepClinic.setDuration(prepClinicRequestDto.getDuration());
        prepClinic.setPrepGiven(prepClinicRequestDto.getPrepGiven());
        prepClinic.setOtherDrugs(prepClinicRequestDto.getOtherDrugs());
        prepClinic.setHivTestResult(prepClinicRequestDto.getHivTestResult());
        prepClinic.setDateLiverFunctionTestResults(prepClinicRequestDto.getDateLiverFunctionTestResults());
        prepClinic.setPrepType(prepClinicRequestDto.getPrepType());
        prepClinic.setPopulationType(prepClinicRequestDto.getPopulationType());
        prepClinic.setLiverFunctionTestResults(prepClinicRequestDto.getLiverFunctionTestResults());
        prepClinic.setPrepNotedSideEffects(prepClinicRequestDto.getPrepNotedSideEffects());
        prepClinic.setHistoryOfDrugToDrugInteraction(prepClinicRequestDto.getHistoryOfDrugToDrugInteraction());
        prepClinic.setHivTestResultDate(prepClinicRequestDto.getHivTestResultDate());
        prepClinic.setMonthsOfRefill(prepClinicRequestDto.getMonthsOfRefill());
        prepClinic.setHistoryOfDrugAllergies(prepClinicRequestDto.getHistoryOfDrugAllergies());
        prepClinic.setHealthCareWorkerSignature(prepClinicRequestDto.getHealthCareWorkerSignature());
        prepClinic.setReasonForSwitch(prepClinicRequestDto.getReasonForSwitch());
        prepClinic.setWasPrepAdministered(prepClinicRequestDto.getWasPrepAdministered());
        prepClinic.setOtherPrepGiven(prepClinicRequestDto.getOtherPrepGiven());
        prepClinic.setOtherPrepType(prepClinicRequestDto.getOtherPrepType());
        prepClinic.setOtherRegimenId(prepClinicRequestDto.getOtherRegimenId());
        return prepClinic;
    }

    private PrepClinicDto clinicToClinicDto(PrepClinic clinic) {
        if (clinic == null) {
            return null;
        }

        PrepClinicDto prepClinicDto = new PrepClinicDto();

        prepClinicDto.setId(clinic.getId());
        prepClinicDto.setExtra(clinic.getExtra());
        prepClinicDto.setDateInitialAdherenceCounseling(clinic.getDateInitialAdherenceCounseling());
        prepClinicDto.setWeight(clinic.getWeight());
        prepClinicDto.setHeight(clinic.getHeight());
        prepClinicDto.setPregnant(clinic.getPregnant());
        prepClinicDto.setPrepDistributionSetting(clinic.getPrepDistributionSetting());
        prepClinicDto.setFamilyPlanning(clinic.getFamilyPlanning());
        prepClinicDto.setDateReferred(clinic.getDateReferred());
        prepClinicDto.setPrepEnrollmentUuid(clinic.getPrepEnrollmentUuid());
        prepClinicDto.setRegimenId(clinic.getRegimenId());
        prepClinicDto.setUrinalysisResult(clinic.getUrinalysisResult());
        prepClinicDto.setCreatinineResult(clinic.getCreatinineResult());
        prepClinicDto.setReferred(clinic.getReferred());
        prepClinicDto.setNextAppointment(clinic.getNextAppointment());
        prepClinicDto.setIsCommencement(clinic.getIsCommencement());
        prepClinicDto.setDatePrepStart(clinic.getDatePrepStart());
        prepClinicDto.setEncounterDate(clinic.getEncounterDate());
        prepClinicDto.setPulse(clinic.getPulse());
        prepClinicDto.setRespiratoryRate(clinic.getRespiratoryRate());
        prepClinicDto.setTemperature(clinic.getTemperature());
        prepClinicDto.setSystolic(clinic.getSystolic());
        prepClinicDto.setDiastolic(clinic.getDiastolic());
        prepClinicDto.setAdherenceLevel(clinic.getAdherenceLevel());
        prepClinicDto.setStiScreening(clinic.getStiScreening());
        prepClinicDto.setWhy(clinic.getWhy());
        prepClinicDto.setDatePrepGiven(clinic.getDatePrepGiven());
        prepClinicDto.setUrinalysis(clinic.getUrinalysis());
        prepClinicDto.setCreatinine(clinic.getCreatinine());
        prepClinicDto.setHepatitis(clinic.getHepatitis());
        prepClinicDto.setSyphilis(clinic.getSyphilis());
        prepClinicDto.setOtherTestsDone(clinic.getOtherTestsDone());
        prepClinicDto.setSyndromicStiScreening(clinic.getSyndromicStiScreening());
        prepClinicDto.setFamilyPlanning(clinic.getFamilyPlanning());
        prepClinicDto.setDateOfFamilyPlanning(clinic.getDateOfFamilyPlanning());
        prepClinicDto.setRiskReductionServices(clinic.getRiskReductionServices());
        prepClinicDto.setNotedSideEffects(clinic.getNotedSideEffects());
        prepClinicDto.setDuration(clinic.getDuration());
        prepClinicDto.setVisitType(clinic.getVisitType());
        prepClinicDto.setPrepGiven(clinic.getPrepGiven());
        prepClinicDto.setOtherDrugs(clinic.getOtherDrugs());
        prepClinicDto.setHivTestResult(clinic.getHivTestResult());
        prepClinicDto.setHivTestResultDate(clinic.getHivTestResultDate());
        prepClinicDto.setDateLiverFunctionTestResults(clinic.getDateLiverFunctionTestResults());
        prepClinicDto.setPrepType(clinic.getPrepType());
        prepClinicDto.setPopulationType(clinic.getPopulationType());
        prepClinicDto.setLiverFunctionTestResults(clinic.getLiverFunctionTestResults());
        prepClinicDto.setHistoryOfDrugToDrugInteraction(clinic.getHistoryOfDrugToDrugInteraction());
        prepClinicDto.setHivTestResultDate(clinic.getHivTestResultDate());
        prepClinicDto.setMonthsOfRefill(clinic.getMonthsOfRefill());
        prepClinicDto.setHistoryOfDrugAllergies(clinic.getHistoryOfDrugAllergies());
        prepClinicDto.setDateLiverFunctionTestResults(clinic.getDateLiverFunctionTestResults());
        prepClinicDto.setLiverFunctionTestResults(clinic.getLiverFunctionTestResults());
        prepClinicDto.setPrepNotedSideEffects(clinic.getPrepNotedSideEffects());
        prepClinicDto.setReasonForSwitch(clinic.getReasonForSwitch());
        prepClinicDto.setWasPrepAdministered(clinic.getWasPrepAdministered());
        prepClinicDto.setOtherPrepGiven(clinic.getOtherPrepGiven());
        prepClinicDto.setOtherPrepType(clinic.getOtherPrepType());
        prepClinicDto.setOtherRegimenId(clinic.getOtherRegimenId());
        return prepClinicDto;
    }

    private PrepEnrollmentDto enrollmentToEnrollmentDto(PrepEnrollment enrollment) {
        if (enrollment == null) {
            return null;
        }

        PrepEnrollmentDto enrollmentDto = new PrepEnrollmentDto();

        enrollmentDto.setExtra(enrollment.getExtra());
        enrollmentDto.setId(enrollment.getId());
        enrollmentDto.setUniqueId(enrollment.getUniqueId());
        enrollmentDto.setExtra(enrollment.getExtra());
        enrollmentDto.setUuid(enrollment.getUuid());
        enrollmentDto.setDateEnrolled(enrollment.getDateEnrolled());
        enrollmentDto.setDateReferred(enrollment.getDateReferred());
        enrollmentDto.setRiskType(enrollment.getRiskType());
        enrollmentDto.setSupporterName(enrollment.getSupporterName());
        enrollmentDto.setSupporterRelationshipType(enrollment.getSupporterRelationshipType());
        enrollmentDto.setSupporterPhone(enrollment.getSupporterPhone());
        enrollmentDto.setPrepEligibilityUuid(enrollment.getPrepEligibilityUuid());
        enrollmentDto.setCommenced(true);
        enrollmentDto.setAncUniqueArtNo(enrollment.getAncUniqueArtNo());
        enrollmentDto.setHivTestingPoint(enrollment.getHivTestingPoint());
        enrollmentDto.setDateOfLastHivNegativeTest(enrollment.getDateOfLastHivNegativeTest());
        enrollmentDto.setTargetGroup(enrollment.getTargetGroup());
        return enrollmentDto;
    }

    private PrepDto prepEnrollmentToPrepDto(PrepEnrollment prepEnrollment) {
        if (prepEnrollment == null) {
            return null;
        }

        PrepDto prepDto = new PrepDto();

        prepDto.setId(prepEnrollment.getId());
        prepDto.setExtra(prepEnrollment.getExtra());
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepEnrollment.getPerson());
        //prepDto.setPersonResponseDto(personResponseDto);
        prepDto.setDateStarted(prepEnrollment.getDateStarted());
        prepDto.setStatus(prepEnrollment.getStatus());
        return prepDto;
    }

    public PrepInterruption interruptionRequestDtoInterruption(PrepInterruptionRequestDto interruptionRequestDto, String personUuid) {
        if (interruptionRequestDto == null) {
            return null;
        }

        PrepInterruption prepInterruption = new PrepInterruption();

        prepInterruption.setInterruptionType(interruptionRequestDto.getInterruptionType());
        prepInterruption.setInterruptionDate(interruptionRequestDto.getInterruptionDate());
        prepInterruption.setDateClientDied(interruptionRequestDto.getDateClientDied());
        prepInterruption.setCauseOfDeath(interruptionRequestDto.getCauseOfDeath());
        prepInterruption.setSourceOfDeathInfo(interruptionRequestDto.getSourceOfDeathInfo());
        prepInterruption.setDateClientReferredOut(interruptionRequestDto.getDateClientReferredOut());
        prepInterruption.setFacilityReferredTo(interruptionRequestDto.getFacilityReferredTo());
        prepInterruption.setInterruptionReason(interruptionRequestDto.getInterruptionReason());
        prepInterruption.setDateSeroConverted(interruptionRequestDto.getDateSeroConverted());
        prepInterruption.setPersonUuid(personUuid);
        prepInterruption.setDateRestartPlacedBackMedication(interruptionRequestDto.getDateRestartPlacedBackMedication());
        prepInterruption.setLinkToArt(interruptionRequestDto.getLinkToArt());
        prepInterruption.setReasonStopped(interruptionRequestDto.getReasonStopped());
        prepInterruption.setReasonStoppedOthers(interruptionRequestDto.getReasonStoppedOthers());
        prepInterruption.setReasonForPrepDiscontinuation(interruptionRequestDto.getReasonForPrepDiscontinuation());
        return prepInterruption;
    }

    public PrepInterruptionDto interruptionToInterruptionDto(PrepInterruption prepInterruption) {
        if (prepInterruption == null) {
            return null;
        }

        PrepInterruptionDto prepInterruptionDto = new PrepInterruptionDto();

        prepInterruptionDto.setId(prepInterruption.getId());
        prepInterruptionDto.setInterruptionType(prepInterruption.getInterruptionType());
        prepInterruptionDto.setInterruptionDate(prepInterruption.getInterruptionDate());
        prepInterruptionDto.setDateClientDied(prepInterruption.getDateClientDied());
        prepInterruptionDto.setCauseOfDeath(prepInterruption.getCauseOfDeath());
        prepInterruptionDto.setSourceOfDeathInfo(prepInterruption.getSourceOfDeathInfo());
        prepInterruptionDto.setDateClientReferredOut(prepInterruption.getDateClientReferredOut());
        prepInterruptionDto.setFacilityReferredTo(prepInterruption.getFacilityReferredTo());
        prepInterruptionDto.setInterruptionReason(prepInterruption.getInterruptionReason());
        prepInterruptionDto.setDateSeroConverted(prepInterruption.getDateSeroConverted());
        prepInterruptionDto.setDateRestartPlacedBackMedication(prepInterruption.getDateRestartPlacedBackMedication());
        prepInterruptionDto.setLinkToArt(prepInterruption.getLinkToArt());

        prepInterruptionDto.setReasonStopped(prepInterruption.getReasonStopped());
        prepInterruptionDto.setReasonStoppedOthers(prepInterruption.getReasonStoppedOthers());
        prepInterruptionDto.setReasonForPrepDiscontinuation(prepInterruption.getReasonForPrepDiscontinuation());


        return prepInterruptionDto;
    }

    public PrepClinicDto getCommencementById(Long id) {
        PrepClinic prepClinic = prepClinicRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));

        return this.clinicToClinicDto(prepClinic);
    }

    public PrepEligibilityDto getEligibilityById(Long id) {
        PrepEligibility prepEligibility = prepEligibilityRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));

        return prepEligibilityToPrepEligibilityDto(prepEligibility);

    }

    public PrepEnrollmentDto getEnrollmentById(Long id) {
        PrepEnrollment prepEnrollment = prepEnrollmentRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibility.class, "id", String.valueOf(id)));

        return enrollmentToEnrollmentDto(prepEnrollment);

    }
}

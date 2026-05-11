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
import org.lamisplus.modules.prep.repository.PrepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PrepEligibilityScreeningRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.repository.ProphylaxisInterruptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.Period;
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
    private final PrepPepInitiationRepository prepPepInitiationRepository;
    private final PrepEligibilityScreeningRepository prepEligibilityScreeningRepository;
    private final PrepFollowupVisitRepository prepFollowupVisitRepository;
    private final PepFollowupVisitRepository pepFollowupVisitRepository;
    private final PatientActivityService patientActivityService;
    private final ProphylaxisInterruptionRepository prophylaxisInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepEligibilityDto saveEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto) {
        Person person;
        person = this.getPerson(prepEligibilityRequestDto.getPersonId());
        PrepEligibilityScreening prepEligibility = this.prepEligibilityRequestDtoToPrepEligibility(prepEligibilityRequestDto, person.getUuid());
        prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility.setUuid(UUID.randomUUID().toString());

        //Check if client eligibility on same date exist and throw an error
        prepEligibilityScreeningRepository
                .findByVisitDateAndPersonUuidAndArchived(prepEligibilityRequestDto.getVisitDate(), person.getUuid(), false)
                .ifPresent(prepEligibilityRec -> {
                    if (Boolean.FALSE.equals(prepEligibilityRec.getArchived())) {
                        throw new RecordExistException(PrepEligibilityScreening.class, "Visit date", String.valueOf(prepEligibilityRequestDto.getVisitDate()));
                    }
                });

        prepEligibility = prepEligibilityScreeningRepository.save(prepEligibility);
        prepEligibility.setPerson(person);
        PrepEligibilityDto prepEligibilityDto = this.prepEligibilityToPrepEligibilityDto(prepEligibility);
        prepEligibilityDto.setPrepEligibilityCount(prepEligibilityScreeningRepository
                .findAllByPersonUuid(person.getUuid()).size());
        return prepEligibilityDto;
    }

    public PrepEnrollmentDto saveEnrollment(PrepEnrollmentRequestDto prepEnrollmentRequestDto) {
        PrepPepInitiation prepEnrollment;
        String eligibilityUuid = prepEnrollmentRequestDto.getPrepEligibilityUuid();

        PrepEligibilityScreening prepEligibility = prepEligibilityScreeningRepository
                .findByUuid(eligibilityUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "Eligibility ", eligibilityUuid));

        Person person = this.getPerson(prepEnrollmentRequestDto.getPersonId());

        if (this.prepPepInitiationRepository.findByProphylaxisScreeningUuid(eligibilityUuid).isPresent()) {
            throw new RecordExistException(PrepPepInitiation.class, "Eligibility Already taken for prep", eligibilityUuid);
        }

        if (!prepEligibility.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepPepInitiation.class, "Person not same for prepEligibilityUuid", eligibilityUuid);
        }

        // Clinical guard: PrEP is only available to clients aged 15 and above. Below that age,
        // only PEP may be initiated. The frontend already disables the PrEP card for under-15s,
        // but enforce here to prevent direct API misuse and bad data via syncs.
        String enrollmentType = prepEnrollmentRequestDto.getEnrollmentType();
        if ("PrEP".equalsIgnoreCase(enrollmentType) && person.getDateOfBirth() != null) {
            int age = Period.between(person.getDateOfBirth(), LocalDate.now()).getYears();
            if (age < 15) {
                throw new IllegalTypeException(PrepPepInitiation.class,
                        "PrEP is not available for clients under 15 (only PEP is allowed). Patient age",
                        String.valueOf(age));
            }
        }

        prepEnrollment = this.enrollmentRequestDtoToEnrollment(prepEnrollmentRequestDto, prepEligibility.getPersonUuid());

        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility.setUuid(UUID.randomUUID().toString());

        //Check if client Enrollment on same date exist and throw an error
        prepPepInitiationRepository
                .findByDateEnrolledAndPersonUuid(prepEnrollmentRequestDto.getDateEnrolled(),
                        person.getUuid()).ifPresent(prepEnroll -> {
                    throw new RecordExistException(PrepPepInitiation.class, "Encounter date",
                            String.valueOf(prepEnroll.getDateEnrolled()));
                });

        prepEnrollment = prepPepInitiationRepository.save(prepEnrollment);
        prepEnrollment.setPerson(prepEligibility.getPerson());
        PrepEnrollmentDto prepEnrollmentDto = this.enrollmentToEnrollmentDto(prepEnrollment);
        prepEnrollmentDto.setStatus("Enrolled");
        return prepEnrollmentDto;
    }

    public PrepClinicDto saveCommencement(PrepClinicRequestDto commencementRequestDto) {
        Person person = this.getPerson(commencementRequestDto.getPersonId());
        if (commencementRequestDto.getDatePrepStart() != null && commencementRequestDto.getEncounterDate() == null) {
            commencementRequestDto.setEncounterDate(commencementRequestDto.getDatePrepStart());
        }

        String enrollmentUuid = resolveEnrollmentUuid(commencementRequestDto, person.getUuid());
        commencementRequestDto.setPrepEnrollmentUuid(enrollmentUuid);

        PrepPepInitiation prepEnrollment = this.prepPepInitiationRepository.findByUuid(enrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class, "Enrollment", enrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepFollowupVisit.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepFollowupVisit prepClinic = this.clinicRequestDtoToClinic(commencementRequestDto, person.getUuid());

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(true);
        prepClinic = prepFollowupVisitRepository.save(prepClinic);
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic);
        return prepClinicDto;
    }

    public PrepClinicDto saveClinic(PrepClinicRequestDto clinicRequestDto) {
        Person person = this.getPerson(clinicRequestDto.getPersonId());

        String enrollmentUuid = resolveEnrollmentUuid(clinicRequestDto, person.getUuid());
        clinicRequestDto.setPrepEnrollmentUuid(enrollmentUuid);

        PrepPepInitiation prepEnrollment = this.prepPepInitiationRepository.findByUuid(enrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class, "Enrollment", enrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepFollowupVisit.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepFollowupVisit prepClinic = this.clinicRequestDtoToClinic(clinicRequestDto, person.getUuid());
        prepFollowupVisitRepository.findByEncounterDateAndPersonUuidAndIsCommencementAndArchived(clinicRequestDto.getEncounterDate(), person.getUuid(), false, false)
                .ifPresent(prepClinicRec -> {
                    if (Boolean.FALSE.equals(prepClinicRec.getArchived())) {
                        throw new RecordExistException(PrepFollowupVisit.class, "Encounter date", String.valueOf(clinicRequestDto.getEncounterDate()));
                    }
                });

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(false);
        prepClinic.setVisitType(clinicRequestDto.getVisitType());
        prepClinic.setHealthCareWorkerSignature(clinicRequestDto.getHealthCareWorkerSignature());
        prepClinic.setComment(clinicRequestDto.getComment());
        prepClinic.setPreviousPrepStatus(clinicRequestDto.getPreviousPrepStatus());
        System.out.println("prepClinic: " + prepClinic);
        prepClinic = prepFollowupVisitRepository.save(prepClinic);
        prepClinic.setPregnant(clinicRequestDto.getPregnant());
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic);
        return prepClinicDto;
    }


    public PrepInterruptionDto saveInterruption(PrepInterruptionRequestDto interruptionRequestDto) {
        Person person = this.getPerson(interruptionRequestDto.getPersonId());
        ProphylaxisInterruption interruption = interruptionRequestDtoToEntity(interruptionRequestDto, person.getUuid());
        interruption.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        interruption.setPreviousPrepStatus(interruptionRequestDto.getPreviousPrepStatus());

        prophylaxisInterruptionRepository
                .findFirstByInterruptionDateAndPersonUuidAndArchivedOrderByIdAsc(interruptionRequestDto.getInterruptionDate(), person.getUuid(), false)
                .ifPresent(existing -> {
                    if (Boolean.FALSE.equals(existing.getArchived())) {
                        throw new RecordExistException(ProphylaxisInterruption.class, "Encounter date", String.valueOf(interruptionRequestDto.getInterruptionDate()));
                    }
                });

        // Resolve the matching prophylaxis_initiation (by enrollment type, latest first) and
        // 1) link this interruption to it via prophylaxis_initiation_uuid; 2) flip is_interrupted
        // on the initiation so the patient's current status is now "interrupted on that arm".
        String enrollmentType = interruptionRequestDto.getEnrollmentType();
        Optional<PrepPepInitiation> latestInitiation = (enrollmentType != null && !enrollmentType.isEmpty())
                ? prepPepInitiationRepository.findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, enrollmentType)
                : prepPepInitiationRepository.findTopByPersonUuidAndArchived(person.getUuid(), false);
        if (!latestInitiation.isPresent()
                && interruptionRequestDto.getPrepEnrollmentUuid() != null
                && !interruptionRequestDto.getPrepEnrollmentUuid().isEmpty()) {
            latestInitiation = prepPepInitiationRepository.findByUuid(interruptionRequestDto.getPrepEnrollmentUuid());
        }
        PrepPepInitiation init = latestInitiation.orElseThrow(() -> new EntityNotFoundException(
                PrepPepInitiation.class, "PersonUuid/EnrollmentType",
                person.getUuid() + "/" + enrollmentType));
        if (!init.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(ProphylaxisInterruption.class, "Person not same enrolled", init.getUuid());
        }
        interruption.setProphylaxisInitiationUuid(init.getUuid());
        init.setIsInterrupted(true);
        prepPepInitiationRepository.save(init);

        try {
            interruption = prophylaxisInterruptionRepository.save(interruption);
        } catch (Exception e) {
            throw new RuntimeException("Input or Server error. Please Try again.");
        }

        interruption.setPerson(person);
        return interruptionEntityToDto(interruption);
    }

    private PrepDtos prepToPrepDtos(List<PrepPepInitiation> clients) {
        final Long[] pId = {null};
        final String[] uniqueId = {null};
        final String[] personUuid = {null};
        final PersonResponseDto[] personResponseDto = {new PersonResponseDto()};
        PrepDtos prepDtos = new PrepDtos();
        List<PrepDto> prepDtoList = clients
                .stream()
                .sorted(Comparator.comparingLong(PrepPepInitiation::getId).reversed())
                .map(prepEnrollment -> {
                    if (pId[0] == null) {
                        Person person = prepEnrollment.getPerson();
                        uniqueId[0] = prepEnrollment.getUniqueId();
                        pId[0] = person.getId();
                        personUuid[0] = prepEnrollment.getProphylaxisScreeningUuid();
                        personResponseDto[0] = personService.getDtoFromPerson(person);
                    }
                    return this.prepEnrollmentToPrepDto(prepEnrollment);
                })
                .sorted(Comparator.comparingLong(PrepDto::getId).reversed())
                .collect(Collectors.toList());
        prepDtos.setPrepEnrollmentCount(prepDtoList.size());
        prepDtos.setPrepDtoList(prepDtoList);
        prepDtos.setPrepEligibilityCount(prepEligibilityScreeningRepository.findAllByPersonUuid(personUuid[0]).size());
        prepDtos.setPersonId(pId[0]);
        prepDtos.setUniqueId(uniqueId[0]);
        prepDtos.setPersonResponseDto(personResponseDto[0]);
        return prepDtos;
    }

    private PrepPepInitiation getById(Long id) {
        return prepPepInitiationRepository
                .findByIdAndArchivedAndFacilityId(id, false, currentUserOrganizationService.getCurrentUserOrganization())
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class, "id", "" + id));
    }

    public List<PrepDtos> getAllPatients() {
        List<PrepDtos> prepDtosList = new ArrayList<>();
        for (PersonResponseDto personResponseDto : personService.getAllPerson()) {
            Person person = this.getPerson(personResponseDto.getId());
            List<PrepPepInitiation> prepEnrollments = prepPepInitiationRepository.findAllByPersonOrderByIdDesc(person);
            PrepDtos prepDtos = new PrepDtos();
            if (prepEnrollments.isEmpty()) {
                prepDtos.setPrepDtoList(new ArrayList<>());
                prepDtos.setPrepEnrollmentCount(0);
                prepDtos.setPrepEligibilityCount(prepEligibilityScreeningRepository.findAllByPersonUuid(person.getUuid()).size());

                prepDtos.setPersonResponseDto(personResponseDto);
                prepDtos.setPersonId(personResponseDto.getId());
                prepDtosList.add(prepDtos);
            } else {
                prepDtosList.add(this.prepToPrepDtos(person, prepEnrollments));
            }
        }
        return prepDtosList;
    }

    public Page<PrepPepInitiation> findPrepClientPage(Pageable pageable) {
        return prepPepInitiationRepository.findAll(pageable);
    }

    public String getClientNameByCode(String code) {
        List<PrepPepInitiation> prepEnrollments = prepPepInitiationRepository.findAllByUniqueIdOrderByIdDesc(code);
        if (prepEnrollments.isEmpty()) return "Record Not Found";

        Person person = prepEnrollments.stream().findFirst().get().getPerson();
        return person.getFirstName() + " " + person.getSurname();
    }

    public PrepDtos getPrepByPersonId(Long personId) {
        Person person = personRepository.findById(personId).orElse(new Person());
        if (person.getId() == null) {
            return new PrepDtos();
        }
        return this.prepToPrepDtos(person, prepPepInitiationRepository.findFirstByPersonOrderByIdDesc(person));
    }

    public List<PrepEnrollmentDto> getEnrollmentByPersonId(Long personId) {
        Person person = this.getPerson(personId);
        List<PrepEnrollmentDto> prepEnrollmentDtos = new ArrayList<>();
        List<PrepPepInitiation> prepEnrollments = prepPepInitiationRepository.findAllByPerson(person);
        prepEnrollments.forEach(prepEnrollment -> {
            prepEnrollmentDtos.add(enrollmentToEnrollmentDto(prepEnrollment));
        });
        return prepEnrollmentDtos;
    }

    public List<PrepClinicDto> getCommencementByPersonId(Long personId) {
        Person person = this.getPerson(personId);
        List<PrepClinicDto> prepClinicDtos = new ArrayList<>();
        List<PrepFollowupVisit> prepClinics = prepFollowupVisitRepository.findAllByPersonAndIsCommencement(person, true);
        prepClinics.forEach(prepClinic -> {
            prepClinicDtos.add(clinicToClinicDto(prepClinic));
        });
        return prepClinicDtos;
    }

    private Long getPersonId(PrepPepInitiation prepEnrollment) {
        return prepEnrollment.getPerson().getId();
    }

    public void delete(Long id) {
        PrepPepInitiation prepEnrollment = this.getById(id);
        prepEnrollment.setArchived(true);
        prepPepInitiationRepository.save(prepEnrollment);
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
        Page<PrepClient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\\\s", "");
            String queryParam = "%" + searchValue + "%";
            resultPage = prepPepInitiationRepository.findAllPersonPrepAndStatusBySearchParam(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository.findAllPersonPrepAndStatus(false, facilityId, pageable);
        }
        List<PrepClient> filteredList = resultPage.getContent().stream()
                .filter(prepClient -> !"Seroconverted".equals(prepClient.getPrepStatus()))
                .collect(Collectors.toList());

        return new PageImpl<>(filteredList, pageable, resultPage.getTotalElements());
    }

    public Page<PrepClient> findAllInterruptedPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepClient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\\\s", "");
            String queryParam = "%" + searchValue + "%";
            resultPage = prepPepInitiationRepository.findAllInterruptedPersonPrepAndStatusBySearchParam(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository.findAllInterruptedPersonPrepAndStatus(false, facilityId, pageable);
        }
        List<PrepClient> filteredList = resultPage.getContent().stream()
                .filter(prepClient -> !"Seroconverted".equals(prepClient.getPrepStatus()))
                .collect(Collectors.toList());

        return new PageImpl<>(filteredList, pageable, resultPage.getTotalElements());
    }

    public Page<PrepClient> findAllNotEnrolledPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepClient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\\\s", "");
            String queryParam = "%" + searchValue + "%";
            resultPage = prepPepInitiationRepository.findAllNotEnrolledPersonPrepAndStatusBySearchParam(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository.findAllNotEnrolledPersonPrepAndStatus(false, facilityId, pageable);
        }
        List<PrepClient> filteredList = resultPage.getContent().stream()
                .filter(prepClient -> !"Seroconverted".equals(prepClient.getPrepStatus()))
                .collect(Collectors.toList());

        return new PageImpl<>(filteredList, pageable, resultPage.getTotalElements());
    }

    public Page<PrepClient> findAllEnrolledPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepClient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\\\s", "");
            String queryParam = "%" + searchValue + "%";
            resultPage = prepPepInitiationRepository.findAllPersonPrepAndStatusBySearchParam(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository.findAllPersonPrepAndStatus(false, facilityId, pageable);
        }
        List<PrepClient> filteredList = resultPage.getContent().stream()
                .filter(prepClient -> !"Not Enrolled".equals(prepClient.getPrepStatus()))
                .filter(prepClient -> !"Seroconverted".equals(prepClient.getPrepStatus()))
                .collect(Collectors.toList());

        return new PageImpl<>(filteredList, pageable, resultPage.getTotalElements());
    }

    public Page<PrepClient> findAllPepEnrolledPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepClient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\\\s", "");
            String queryParam = "%" + searchValue + "%";
            resultPage = prepPepInitiationRepository.findAllPepEnrolledPersonPrepAndStatusBySearchParam(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository.findAllPepEnrolledPersonPrepAndStatus(false, facilityId, pageable);
        }
        List<PrepClient> filteredList = resultPage.getContent().stream()
                .filter(prepClient -> !"Not Enrolled".equals(prepClient.getPrepStatus()))
                .filter(prepClient -> !"Seroconverted".equals(prepClient.getPrepStatus()))
                .collect(Collectors.toList());

        return new PageImpl<>(filteredList, pageable, resultPage.getTotalElements());
    }

    public Page<PrepClient> findOnlyPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            searchValue = searchValue.replaceAll("\\s", "");
            String queryParam = "%" + searchValue + "%";
            return prepPepInitiationRepository
                    .findOnlyPersonPrepAndStatusBySearchParam(false, facilityId, queryParam, pageable);
        }
        return prepPepInitiationRepository
                .findOnlyPersonPrepAndStatus(false, currentUserOrganizationService.getCurrentUserOrganization(), pageable);
    }

    public PageDTO getAllPrepDtosByPerson(Page<Person> page) {

        List<PrepDtos> htsClientDtosList = page.stream()
                .map(person -> getPrepClientByPersonId(person))
                .collect(Collectors.toList());
        return PaginationUtil.generatePagination(page, htsClientDtosList);
    }

    public PrepDtos getPrepClientByPersonId(Person person) {
        return this.prepToPrepDtos(person, prepPepInitiationRepository.findAllByPersonOrderByIdDesc(person));
    }

    private PrepDtos prepToPrepDtos(@NotNull Person person, List<PrepPepInitiation> clients) {
        boolean isPositive = false;
        PrepDtos prepDtos = new PrepDtos();
        if (person == null) throw new EntityNotFoundException(Person.class, "Person", "is null");
        prepDtos.setPersonId(person.getId());
        prepDtos.setPersonResponseDto(personService.getDtoFromPerson(person));
        prepDtos.setPrepEligibilityCount(prepEligibilityScreeningRepository.countAllByPersonUuid(person.getUuid()));
        List<PrepDto> prepDtoList = clients
                .stream()
                .map(client -> {
                    if (person == null) {
                        Person samePerson = client.getPerson();
                        final PersonResponseDto personResponseDto = personService.getDtoFromPerson(samePerson);
                        prepDtos.setPersonResponseDto(personResponseDto);
                        prepDtos.setPersonId(personResponseDto.getId());
                        prepDtos.setPrepEligibilityCount(prepEligibilityScreeningRepository.countAllByPersonUuid(samePerson.getUuid()));
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
        Integer commencementCount = prepFollowupVisitRepository.countAllByPersonUuid(person.getUuid());
        prepDtos.setCommenced((commencementCount > 0) ? true : false);
        prepDtos.setPrepEligibilityCount(prepEligibilityScreeningRepository.countAllByPersonUuid(person.getUuid()));
        prepDtos.setHivPositive(isPositive);
        prepDtos.setPrepCommencementCount(commencementCount);
        if (!clients.isEmpty()) {
            prepDtos.setEnrollmentType(clients.get(0).getEnrollmentType());
        }
        // Per-arm counts so the UI can decide what to show on each tab without
        // re-querying. Always non-null (zero when the patient has no records).
        prepDtos.setInterruptionCount(
                prophylaxisInterruptionRepository.countAllByPersonUuidAndArchived(person.getUuid(), false));
        prepDtos.setPrepInitiationCount(
                prepPepInitiationRepository.countAllByPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                        person.getUuid(), "PrEP", false));
        prepDtos.setPepInitiationCount(
                prepPepInitiationRepository.countAllByPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                        person.getUuid(), "PEP", false));
        // Pregnancy / breastfeeding from the patient's most recent initiation, so the
        // Patient Card reflects the latest captured value. Also derives the
        // isCurrentStatus* flags used by the Patient List "Enroll" modal and the
        // PrEP/PEP enrollment-tab SubMenu cross-arm lockouts.
        prepPepInitiationRepository
                .findTopByPersonUuidAndArchived(person.getUuid(), false)
                .ifPresent(latest -> {
                    prepDtos.setPregnant(latest.getPregnancyStatus());
                    prepDtos.setBreastfeeding(latest.getBreastFeeding());

                    Boolean interrupted = applyPepAutoExpiry(latest);
                    boolean active = !Boolean.TRUE.equals(interrupted);
                    String type = latest.getEnrollmentType();
                    prepDtos.setIsCurrentStatusInterruptedPrep(active && "PrEP".equalsIgnoreCase(type));
                    prepDtos.setIsCurrentStatusInterruptedPep(active && "PEP".equalsIgnoreCase(type));
                });
        PrepClient prepClient = prepPepInitiationRepository
                .findPersonPrepAndStatusByPatientUuid(false,
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
        // Compute previousProphylaxis by comparing latest PrEP and PEP followup visit dates
        LocalDate latestPrepVisit = prepFollowupVisitRepository
                .findAllByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(
                        person.getUuid(), currentUserOrganizationService.getCurrentUserOrganization(), false, false)
                .stream().findFirst().map(PrepFollowupVisit::getEncounterDate).orElse(null);
        LocalDate latestPepVisit = pepFollowupVisitRepository
                .findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
                        person.getUuid(), currentUserOrganizationService.getCurrentUserOrganization(), false)
                .stream().findFirst().map(PepFollowupVisit::getEncounterDate).orElse(null);
        if (latestPrepVisit != null && latestPepVisit != null) {
            prepDtos.setPreviousProphylaxis(latestPrepVisit.isAfter(latestPepVisit) ? "PrEP" : "PEP");
        } else if (latestPrepVisit != null) {
            prepDtos.setPreviousProphylaxis("PrEP");
        } else if (latestPepVisit != null) {
            prepDtos.setPreviousProphylaxis("PEP");
        } else {
            prepDtos.setPreviousProphylaxis(null);
        }
        return prepDtos;
    }

    /**
     * PEP courses auto-expire 28 days after the initiation/enrollment date. This
     * helper is invoked whenever an initiation is read so the {@code is_interrupted}
     * flag stays accurate without waiting for a scheduled job — the value is also
     * persisted lazily so subsequent reads (and any direct DB queries) see it.
     * Returns the effective interrupted state.
     */
    private Boolean applyPepAutoExpiry(PrepPepInitiation initiation) {
        if (initiation == null) return null;
        Boolean interrupted = initiation.getIsInterrupted();
        boolean isPep = "PEP".equalsIgnoreCase(initiation.getEnrollmentType());
        if (isPep && !Boolean.TRUE.equals(interrupted) && initiation.getDateEnrolled() != null) {
            long daysSince = java.time.temporal.ChronoUnit.DAYS.between(
                    initiation.getDateEnrolled(), java.time.LocalDate.now());
            if (daysSince >= 28) {
                initiation.setIsInterrupted(true);
                try {
                    prepPepInitiationRepository.save(initiation);
                } catch (Exception ignored) {
                    // Read-time best-effort persistence; the 28-day rule still applies for the
                    // current request even if the save fails (e.g. read-only transaction).
                }
                return true;
            }
        }
        return interrupted;
    }

    public PrepEligibilityDto getOpenEligibility(Long personId) {
        Person person = this.getPerson(personId);
        return prepEligibilityToPrepEligibilityDto(prepEligibilityScreeningRepository
                .findByPersonUuidAndArchived(person.getUuid(), false));
    }

    public PrepEnrollmentDto getOpenEnrollment(Long personId) {
        Person person = this.getPerson(personId);

        String status = "STOPPED, DEATH";
        Optional<PrepPepInitiation> prepEnrollmentOptional = prepPepInitiationRepository
                .findByPersonUuidAndArchived(person.getUuid(), false, currentUserOrganizationService.getCurrentUserOrganization(), status);
        if (prepEnrollmentOptional.isPresent())
            return enrollmentToEnrollmentDto(prepEnrollmentOptional.get());//PrepEnrollmentDto.builder().build();
        return new PrepEnrollmentDto();
    }

    /**
     * Returns the most recent (by date_enrolled) initiation for the given person filtered
     * by enrollment type (PrEP or PEP). Used by follow-up visit forms to compute duration
     * on therapy and to validate that the visit date is after the enrollment date.
     */
    public PrepEnrollmentDto getLatestInitiation(Long personId, String enrollmentType) {
        Person person = this.getPerson(personId);
        Optional<PrepPepInitiation> latest = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, enrollmentType);
        return latest.map(this::enrollmentToEnrollmentDto).orElseGet(PrepEnrollmentDto::new);
    }

    public String getLatestInitiationUuid(String personUuid, String enrollmentType) {
        Optional<PrepPepInitiation> latest = (enrollmentType != null && !enrollmentType.isEmpty())
                ? prepPepInitiationRepository.findLatestByPersonUuidAndEnrollmentType(personUuid, false, enrollmentType)
                : prepPepInitiationRepository.findTopByPersonUuidAndArchived(personUuid, false);
        return latest.map(PrepPepInitiation::getUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class,
                        "personUuid/enrollmentType", personUuid + "/" + enrollmentType));
    }

    private String resolveEnrollmentUuid(PrepClinicRequestDto requestDto, String personUuid) {
        String enrollmentUuid = requestDto.getPrepEnrollmentUuid();
        if (enrollmentUuid != null && !enrollmentUuid.isEmpty()) {
            return enrollmentUuid;
        }
        String enrollmentType = requestDto.getEnrollmentType();
        if (enrollmentType == null || enrollmentType.isEmpty()) {
            enrollmentType = "PrEP";
        }
        return getLatestInitiationUuid(personUuid, enrollmentType);
    }

    public PrepEligibilityScreening prepEligibilityRequestDtoToPrepEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto, String personUuid) {
        if (prepEligibilityRequestDto == null) {
            return null;
        }

        PrepEligibilityScreening prepEligibility = new PrepEligibilityScreening();

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
        prepEligibility.setVisitDate(prepEligibilityRequestDto.getVisitDate());
        prepEligibility.setReasonForSwitch(prepEligibilityRequestDto.getReasonForSwitch());
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

    public PrepEligibilityDto prepEligibilityToPrepEligibilityDto(PrepEligibilityScreening eligibility) {
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
        prepEligibilityDto.setReasonForSwitch(eligibility.getReasonForSwitch());
        prepEligibilityDto.setConsiderationForInjections(eligibility.getConsiderationForInjections());
        prepEligibilityDto.setReasonForDecliningPrep(eligibility.getReasonForDecliningPrep());
        prepEligibilityDto.setUniqueClientId(eligibility.getUniqueClientId());
        prepEligibilityDto.setClientHtsCode(eligibility.getClientHtsCode());
        prepEligibilityDto.setReferredFrom(eligibility.getReferredFrom());
        prepEligibilityDto.setSetting(eligibility.getSetting());
        prepEligibilityDto.setServiceStatus(eligibility.getServiceStatus());
        prepEligibilityDto.setTypeOfSession(eligibility.getTypeOfSession());
        prepEligibilityDto.setCategory(eligibility.getCategory());
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(eligibility.getPerson());
        //prepEligibilityDto.setPersonResponseDto(personResponseDto);

        prepEligibilityDto.setVisitDate(eligibility.getVisitDate());

        return prepEligibilityDto;
    }

    public List<PatientActivity> getPrepPatientActivitiesById(Long id) {
        return patientActivityService.getActivities(id);
    }

    private PrepPepInitiation enrollmentRequestDtoToEnrollment(PrepEnrollmentRequestDto prepEnrollmentRequestDto, String personUuid) {
        if (prepEnrollmentRequestDto == null) {
            return null;
        }

        PrepPepInitiation prepEnrollment = new PrepPepInitiation();

        prepEnrollment.setPersonUuid(personUuid);
        prepEnrollment.setUniqueId(prepEnrollmentRequestDto.getUniqueId());
        prepEnrollment.setProphylaxisScreeningUuid(prepEnrollmentRequestDto.getPrepEligibilityUuid());
        prepEnrollment.setDateEnrolled(prepEnrollmentRequestDto.getDateEnrolled());
        prepEnrollment.setDateReferred(prepEnrollmentRequestDto.getDateReferred());
        prepEnrollment.setSupporterName(prepEnrollmentRequestDto.getSupporterName());
        prepEnrollment.setSupporterRelationshipType(prepEnrollmentRequestDto.getSupporterRelationshipType());
        prepEnrollment.setSupporterPhone(prepEnrollmentRequestDto.getSupporterPhone());
        prepEnrollment.setStatus("ENROLLED");
        prepEnrollment.setHivTestingPoint(prepEnrollmentRequestDto.getHivTestingPoint());

        prepEnrollment.setEnrollmentType(prepEnrollmentRequestDto.getEnrollmentType());
        prepEnrollment.setPopulationType(prepEnrollmentRequestDto.getPopulationType());
        prepEnrollment.setWeight(prepEnrollmentRequestDto.getWeight());
        prepEnrollment.setHeight(prepEnrollmentRequestDto.getHeight());
        prepEnrollment.setPregnancyStatus(prepEnrollmentRequestDto.getPregnancyStatus());
        prepEnrollment.setHistoryOfDrugAllergies(prepEnrollmentRequestDto.getHistoryOfDrugAllergies());
        prepEnrollment.setHistoryOfDrugToDrugInteraction(prepEnrollmentRequestDto.getHistoryOfDrugToDrugInteraction());
        prepEnrollment.setUrinalysisResult(prepEnrollmentRequestDto.getUrinalysisResult());
        prepEnrollment.setLiverFunctionTestResults(prepEnrollmentRequestDto.getLiverFunctionTestResults());
        prepEnrollment.setDateOfHivTest(prepEnrollmentRequestDto.getDateOfHivTest());
        prepEnrollment.setResultOfHivTest(prepEnrollmentRequestDto.getResultOfHivTest());
        prepEnrollment.setDateOfInitialAdherenceCounseling(prepEnrollmentRequestDto.getDateOfInitialAdherenceCounseling());
        prepEnrollment.setDatePrepStarted(prepEnrollmentRequestDto.getDatePrepStarted());
        prepEnrollment.setPrepTypeAtStart(prepEnrollmentRequestDto.getPrepTypeAtStart());
        prepEnrollment.setPrepTypeAtStartOthersSpecify(prepEnrollmentRequestDto.getPrepTypeAtStartOthersSpecify());
        prepEnrollment.setPrepRegimen(prepEnrollmentRequestDto.getPrepRegimen());
        prepEnrollment.setMonthsOfRefill(prepEnrollmentRequestDto.getMonthsOfRefill());

        return prepEnrollment;
    }

    private PrepFollowupVisit clinicRequestDtoToClinic(PrepClinicRequestDto prepClinicRequestDto, String personUuid) {
        if (prepClinicRequestDto == null) {
            return null;
        }

        PrepFollowupVisit prepClinic = new PrepFollowupVisit();
        prepClinic.setPersonUuid(personUuid);
        prepClinic.setDateInitialAdherenceCounseling(prepClinicRequestDto.getDateInitialAdherenceCounseling());
        prepClinic.setWeight(prepClinicRequestDto.getWeight());
        prepClinic.setHeight(prepClinicRequestDto.getHeight());
        prepClinic.setPregnant(prepClinicRequestDto.getPregnant());
        prepClinic.setPrepDistributionSetting(prepClinicRequestDto.getPrepDistributionSetting());
        prepClinic.setFamilyPlanning(prepClinicRequestDto.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning(prepClinicRequestDto.getDateOfFamilyPlanning());
        prepClinic.setDateReferred(prepClinicRequestDto.getDateReferred());
        prepClinic.setProphylaxisInitiationUuid(prepClinicRequestDto.getPrepEnrollmentUuid());
        prepClinic.setRegimenId(prepClinicRequestDto.getRegimenId());
        prepClinic.setUrinalysisResult(prepClinicRequestDto.getUrinalysisResult());
        prepClinic.setCreatinineResult(prepClinicRequestDto.getCreatinineResult());
        prepClinic.setReferred(prepClinicRequestDto.getReferred());
        prepClinic.setDateReferred(prepClinicRequestDto.getDateReferred());
        prepClinic.setNextAppointment(prepClinicRequestDto.getNextAppointment());
        prepClinic.setEncounterDate(prepClinicRequestDto.getEncounterDate());
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
        prepClinic.setComment(prepClinicRequestDto.getComment());
        prepClinic.setPreviousPrepStatus(prepClinicRequestDto.getPreviousPrepStatus());
        prepClinic.setWhyAdherenceLevelPoor(prepClinicRequestDto.getWhyAdherenceLevelPoor());
        prepClinic.setOtherReasonForPoorFairAdherence(prepClinicRequestDto.getOtherReasonForPoorFairAdherence());
        prepClinic.setSyndromicScreening(prepClinicRequestDto.getSyndromicScreening());
        prepClinic.setOtherSyndromicStiScreening(prepClinicRequestDto.getOtherSyndromicStiScreening());
        prepClinic.setOtherNotedSideEffects(prepClinicRequestDto.getOtherNotedSideEffects());
        return prepClinic;
    }

    private PrepClinicDto clinicToClinicDto(PrepFollowupVisit clinic) {
        if (clinic == null) {
            return null;
        }

        PrepClinicDto prepClinicDto = new PrepClinicDto();

        prepClinicDto.setId(clinic.getId());
        prepClinicDto.setDateInitialAdherenceCounseling(clinic.getDateInitialAdherenceCounseling());
        prepClinicDto.setWeight(clinic.getWeight());
        prepClinicDto.setHeight(clinic.getHeight());
        prepClinicDto.setPregnant(clinic.getPregnant());
        prepClinicDto.setPrepDistributionSetting(clinic.getPrepDistributionSetting());
        prepClinicDto.setFamilyPlanning(clinic.getFamilyPlanning());
        prepClinicDto.setDateReferred(clinic.getDateReferred());
        prepClinicDto.setPrepEnrollmentUuid(clinic.getProphylaxisInitiationUuid());
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
        prepClinicDto.setComment(clinic.getComment());
        prepClinicDto.setPreviousPrepStatus(clinic.getPreviousPrepStatus());
        prepClinicDto.setWhyAdherenceLevelPoor(clinic.getWhyAdherenceLevelPoor());
        prepClinicDto.setOtherReasonForPoorFairAdherence(clinic.getOtherReasonForPoorFairAdherence());
        prepClinicDto.setSyndromicScreening(clinic.getSyndromicScreening());
        prepClinicDto.setOtherSyndromicStiScreening(clinic.getOtherSyndromicStiScreening());
        prepClinicDto.setOtherNotedSideEffects(clinic.getOtherNotedSideEffects());

        return prepClinicDto;
    }

    private PrepEnrollmentDto enrollmentToEnrollmentDto(PrepPepInitiation enrollment) {
        if (enrollment == null) {
            return null;
        }

        PrepEnrollmentDto enrollmentDto = new PrepEnrollmentDto();

        enrollmentDto.setId(enrollment.getId());
        enrollmentDto.setUniqueId(enrollment.getUniqueId());
        enrollmentDto.setUuid(enrollment.getUuid());
        enrollmentDto.setDateEnrolled(enrollment.getDateEnrolled());
        enrollmentDto.setDateReferred(enrollment.getDateReferred());
        enrollmentDto.setSupporterName(enrollment.getSupporterName());
        enrollmentDto.setSupporterRelationshipType(enrollment.getSupporterRelationshipType());
        enrollmentDto.setSupporterPhone(enrollment.getSupporterPhone());
        enrollmentDto.setPrepEligibilityUuid(enrollment.getProphylaxisScreeningUuid());
        enrollmentDto.setCommenced(true);
        enrollmentDto.setHivTestingPoint(enrollment.getHivTestingPoint());

        enrollmentDto.setEnrollmentType(enrollment.getEnrollmentType());
        enrollmentDto.setPopulationType(enrollment.getPopulationType());
        enrollmentDto.setWeight(enrollment.getWeight());
        enrollmentDto.setHeight(enrollment.getHeight());
        enrollmentDto.setPregnancyStatus(enrollment.getPregnancyStatus());
        enrollmentDto.setHistoryOfDrugAllergies(enrollment.getHistoryOfDrugAllergies());
        enrollmentDto.setHistoryOfDrugToDrugInteraction(enrollment.getHistoryOfDrugToDrugInteraction());
        enrollmentDto.setUrinalysisResult(enrollment.getUrinalysisResult());
        enrollmentDto.setLiverFunctionTestResults(enrollment.getLiverFunctionTestResults());
        enrollmentDto.setDateOfHivTest(enrollment.getDateOfHivTest());
        enrollmentDto.setResultOfHivTest(enrollment.getResultOfHivTest());
        enrollmentDto.setDateOfInitialAdherenceCounseling(enrollment.getDateOfInitialAdherenceCounseling());
        enrollmentDto.setDatePrepStarted(enrollment.getDatePrepStarted());
        enrollmentDto.setPrepTypeAtStart(enrollment.getPrepTypeAtStart());
        enrollmentDto.setPrepTypeAtStartOthersSpecify(enrollment.getPrepTypeAtStartOthersSpecify());
        enrollmentDto.setPrepRegimen(enrollment.getPrepRegimen());
        enrollmentDto.setMonthsOfRefill(enrollment.getMonthsOfRefill());

        return enrollmentDto;
    }

    private PrepDto prepEnrollmentToPrepDto(PrepPepInitiation prepEnrollment) {
        if (prepEnrollment == null) {
            return null;
        }

        PrepDto prepDto = new PrepDto();

        prepDto.setId(prepEnrollment.getId());
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepEnrollment.getPerson());
        //prepDto.setPersonResponseDto(personResponseDto);
        prepDto.setDateStarted(prepEnrollment.getDateEnrolled());
        prepDto.setStatus(prepEnrollment.getStatus());
        return prepDto;
    }

    private ProphylaxisInterruption interruptionRequestDtoToEntity(PrepInterruptionRequestDto dto, String personUuid) {
        if (dto == null) return null;
        ProphylaxisInterruption e = new ProphylaxisInterruption();
        e.setPersonUuid(personUuid);
        e.setInterruptionType(dto.getInterruptionType());
        e.setInterruptionDate(dto.getInterruptionDate());
        e.setInterruptionReason(dto.getInterruptionReason());
        e.setDateClientDied(dto.getDateClientDied());
        e.setCauseOfDeath(dto.getCauseOfDeath());
        e.setSourceOfDeathInfo(dto.getSourceOfDeathInfo());
        e.setDateClientReferredOut(dto.getDateClientReferredOut());
        e.setFacilityReferredTo(dto.getFacilityReferredTo());
        e.setDateSeroConverted(dto.getDateSeroConverted());
        e.setDateRestartPlacedBackMedication(dto.getDateRestartPlacedBackMedication());
        e.setLinkToArt(dto.getLinkToArt());
        e.setReasonStopped(dto.getReasonStopped());
        e.setReasonStoppedOthers(dto.getReasonStoppedOthers());
        e.setReasonForPrepDiscontinuation(dto.getReasonForPrepDiscontinuation());
        e.setEnrollmentType(dto.getEnrollmentType());
        e.setProphylaxisInitiationUuid(dto.getPrepEnrollmentUuid());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHivResult(dto.getHivResult());
        e.setEarlyDetectViralLoadResult(dto.getEarlyDetectViralLoadResult());
        return e;
    }

    private PrepInterruptionDto interruptionEntityToDto(ProphylaxisInterruption e) {
        if (e == null) return null;
        PrepInterruptionDto dto = new PrepInterruptionDto();
        dto.setId(e.getId());
        dto.setInterruptionType(e.getInterruptionType());
        dto.setInterruptionDate(e.getInterruptionDate());
        dto.setInterruptionReason(e.getInterruptionReason());
        dto.setDateClientDied(e.getDateClientDied());
        dto.setCauseOfDeath(e.getCauseOfDeath());
        dto.setSourceOfDeathInfo(e.getSourceOfDeathInfo());
        dto.setDateClientReferredOut(e.getDateClientReferredOut());
        dto.setFacilityReferredTo(e.getFacilityReferredTo());
        dto.setDateSeroConverted(e.getDateSeroConverted());
        dto.setDateRestartPlacedBackMedication(e.getDateRestartPlacedBackMedication());
        dto.setLinkToArt(e.getLinkToArt());
        dto.setReasonStopped(e.getReasonStopped());
        dto.setReasonStoppedOthers(e.getReasonStoppedOthers());
        dto.setReasonForPrepDiscontinuation(e.getReasonForPrepDiscontinuation());
        dto.setEnrollmentType(e.getEnrollmentType());
        dto.setPrepEnrollmentUuid(e.getProphylaxisInitiationUuid());
        dto.setWhy(e.getWhy());
        dto.setPepCompletion(e.getPepCompletion());
        dto.setFollowUpVisitDate(e.getFollowUpVisitDate());
        dto.setHivResult(e.getHivResult());
        dto.setEarlyDetectViralLoadResult(e.getEarlyDetectViralLoadResult());
        return dto;
    }

    public PrepClinicDto getCommencementById(Long id) {
        PrepFollowupVisit prepClinic = prepFollowupVisitRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepFollowupVisit.class, "id", String.valueOf(id)));

        return this.clinicToClinicDto(prepClinic);
    }

    public PrepEligibilityDto getEligibilityById(Long id) {
        PrepEligibilityScreening prepEligibility = prepEligibilityScreeningRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));

        return prepEligibilityToPrepEligibilityDto(prepEligibility);

    }

    public PrepEnrollmentDto getEnrollmentById(Long id) {
        PrepPepInitiation prepEnrollment = prepPepInitiationRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepEligibilityScreening.class, "id", String.valueOf(id)));

        return enrollmentToEnrollmentDto(prepEnrollment);

    }
}

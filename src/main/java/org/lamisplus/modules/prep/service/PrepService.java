package org.lamisplus.modules.prep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import org.lamisplus.modules.prep.repository.PrepHtsEncounterPatientRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.repository.ProphylaxisInterruptionRepository;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.lamisplus.modules.prep.util.HtsObservationKeys;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.lamisplus.modules.prep.util.PrepRegimens;
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
    private final PrepHtsEncounterPatientRepository prepHtsEncounterPatientRepository;
    private final ObjectMapper objectMapper;

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

        prepEligibilityScreeningRepository
                .findByVisitDateAndPersonUuidAndArchived(prepEligibilityRequestDto.getVisitDate(), person.getUuid(), false)
                .ifPresent(prepEligibilityRec -> {
                    if (Boolean.FALSE.equals(prepEligibilityRec.getArchived())) {
                        throw PrepErrors.screeningAlreadyExists(prepEligibilityRequestDto.getVisitDate());
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

        if (!prepEligibility.getPersonUuid().equals(person.getUuid())) {
            throw PrepErrors.personMismatch("eligibility screening");
        }

        String enrollmentType = EnrollmentType.toCanonical(prepEnrollmentRequestDto.getEnrollmentType());
        if (EnrollmentType.isPrep(enrollmentType) && person.getDateOfBirth() != null) {
            int age = Period.between(person.getDateOfBirth(), LocalDate.now()).getYears();
            if (age < 15) {
                throw PrepErrors.prepBelowMinimumAge(15);
            }
        }

        if (enrollmentType != null && !enrollmentType.isEmpty()) {
            if (this.prepPepInitiationRepository
                    .findByProphylaxisScreeningUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                            eligibilityUuid, enrollmentType, false)
                    .isPresent()) {
                throw PrepErrors.initiationAlreadyExistsForScreening();
            }
        }

        prepEnrollment = this.enrollmentRequestDtoToEnrollment(prepEnrollmentRequestDto, prepEligibility.getPersonUuid());

        prepEnrollment.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility.setUuid(UUID.randomUUID().toString());

        if (enrollmentType != null && !enrollmentType.isEmpty()) {
            prepPepInitiationRepository
                    .findByDateEnrolledAndPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                            prepEnrollmentRequestDto.getDateEnrolled(), person.getUuid(),
                            enrollmentType, false)
                    .ifPresent(prepEnroll -> {
                        throw PrepErrors.initiationVisitAlreadyExists(prepEnroll.getDateEnrolled());
                    });
        }

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
            throw PrepErrors.personMismatch("enrollment");
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
            throw PrepErrors.personMismatch("enrollment");
        }

        PrepFollowupVisit prepClinic = this.clinicRequestDtoToClinic(clinicRequestDto, person.getUuid());
        prepFollowupVisitRepository.findByEncounterDateAndPersonUuidAndIsCommencementAndArchived(clinicRequestDto.getEncounterDate(), person.getUuid(), false, false)
                .ifPresent(prepClinicRec -> {
                    if (Boolean.FALSE.equals(prepClinicRec.getArchived())) {
                        throw PrepErrors.clinicVisitAlreadyExists(clinicRequestDto.getEncounterDate());
                    }
                });

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(false);
        prepClinic.setVisitType(clinicRequestDto.getVisitType());
        prepClinic.setHealthCareWorkerSignature(clinicRequestDto.getHealthCareWorkerSignature());
        prepClinic.setPreviousPrepStatus(clinicRequestDto.getPreviousPrepStatus());
        prepClinic = prepFollowupVisitRepository.save(prepClinic);
        prepClinic.setHtsEncounterUuid(clinicRequestDto.getHtsEncounterUuid());
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
                        throw PrepErrors.interruptionAlreadyExists(interruptionRequestDto.getInterruptionDate());
                    }
                });

        String enrollmentType = EnrollmentType.toCanonical(interruptionRequestDto.getEnrollmentType());
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
            throw PrepErrors.personMismatch("initiation");
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

    public Page<PrepHtsPatientDto> findAllEnrolledPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepHtsPatient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            String queryParam = "%" + searchValue.replaceAll("\\s", "") + "%";
            resultPage = prepPepInitiationRepository
                    .findPrepEnrolledBySearchParam(false, facilityId, EnrollmentType.PREP, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository
                    .findPrepEnrolled(false, facilityId, EnrollmentType.PREP, pageable);
        }
        return mapEnrolledPage(resultPage, pageable);
    }

    public Page<PrepHtsPatientDto> findAllPepEnrolledPrepPersonPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepHtsPatient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            String queryParam = "%" + searchValue.replaceAll("\\s", "") + "%";
            resultPage = prepPepInitiationRepository
                    .findPepEnrolledBySearchParam(false, facilityId, EnrollmentType.PEP, queryParam, pageable);
        } else {
            resultPage = prepPepInitiationRepository
                    .findPepEnrolled(false, facilityId, EnrollmentType.PEP, pageable);
        }
        return mapEnrolledPage(resultPage, pageable);
    }

    private Page<PrepHtsPatientDto> mapEnrolledPage(Page<PrepHtsPatient> resultPage, Pageable pageable) {
        List<PrepHtsPatientDto> dtos = resultPage.getContent().stream()
                .map(this::toPrepHtsPatientDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, resultPage.getTotalElements());
    }

    public Page<PrepHtsPatientDto> findAllHtsEncounterPatientPage(String searchValue, int pageNo, int pageSize) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        Page<PrepHtsPatient> resultPage;

        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            String queryParam = "%" + searchValue.replaceAll("\\s", "") + "%";
            resultPage = prepHtsEncounterPatientRepository
                    .searchPatients(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepHtsEncounterPatientRepository
                    .findAllPatients(false, facilityId, pageable);
        }

        List<PrepHtsPatientDto> dtos = resultPage.getContent().stream()
                .filter(row -> !"Seroconverted".equals(row.getPrepStatus()))
                .map(this::toPrepHtsPatientDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, resultPage.getTotalElements());
    }

    private PrepHtsPatientDto toPrepHtsPatientDto(PrepHtsPatient row) {
        return PrepHtsPatientDto.builder()
                .personId(row.getPersonId())
                .personUuid(row.getPersonUuid())
                .firstName(row.getFirstName())
                .surname(row.getSurname())
                .otherName(row.getOtherName())
                .hospitalNumber(row.getHospitalNumber())
                .age(row.getAge())
                .gender(row.getGender())
                .dateOfBirth(row.getDateOfBirth())
                .prepCount(row.getPrepCount())
                .prepStatus(row.getPrepStatus())
                .eligibilityCount(row.getEligibilityCount())
                .enrollmentCount(row.getEnrollmentCount())
                .dateOfRegistration(row.getDateOfRegistration())
                .phoneNumber(row.getPhoneNumber())
                .address(row.getAddress())
                .previousProphylaxis(row.getPreviousProphylaxis())
                .sendCabLaAlert(row.getSendCabLaAlert())
                .pregnancyStatusDisplay(row.getPregnancyStatusDisplay())
                .isInterrupted(row.getIsInterrupted())
                .pepOnly(row.getPepOnly())
                .htsClientCode(row.getHtsClientCode())
                .isCurrentStatusInterruptedPrep(isActiveOnArm(row.getPersonUuid(), EnrollmentType.PREP))
                .isCurrentStatusInterruptedPep(isActiveOnArm(row.getPersonUuid(), EnrollmentType.PEP))
                .latestHtsResult(toLatestHtsResultDto(row))
                .build();
    }

    private boolean isActiveOnArm(String personUuid, String enrollmentType) {
        return prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(personUuid, false, enrollmentType)
                .map(initiation -> !Boolean.TRUE.equals(isEffectivelyInterrupted(initiation)))
                .orElse(false);
    }

    /**
     * Read-only twin of {@link #applyPepAutoExpiry}: returns the effective
     * interrupted state (applying the 28-day PEP auto-expiry rule) WITHOUT
     * persisting. Used by the grid page mapping — a list/read endpoint must never
     * issue writes (the persisting variant could block behind table locks and
     * stall the whole request). The actual expiry is persisted lazily the next
     * time the single-patient dashboard loads via {@link #applyPepAutoExpiry}.
     */
    private Boolean isEffectivelyInterrupted(PrepPepInitiation initiation) {
        if (initiation == null) return null;
        Boolean interrupted = initiation.getIsInterrupted();
        if (Boolean.TRUE.equals(interrupted)) return true;
        if (EnrollmentType.isPep(initiation.getEnrollmentType())
                && initiation.getDateEnrolled() != null) {
            long daysSince = java.time.temporal.ChronoUnit.DAYS.between(
                    initiation.getDateEnrolled(), java.time.LocalDate.now());
            if (daysSince >= 28) {
                return true;
            }
        }
        return interrupted;
    }

    private LatestHtsResultDto toLatestHtsResultDto(PrepHtsPatient row) {
        if (row.getLatestHtsId() == null) {
            return null;
        }
        return LatestHtsResultDto.builder()
                .id(row.getLatestHtsId())
                .uuid(row.getLatestHtsUuid())
                .patientId(row.getLatestHtsPatientId())
                .patientUuid(row.getLatestHtsPatientUuid())
                .clientCode(row.getHtsClientCode())
                .dateOfVisit(row.getLatestHtsDateOfVisit())
                .setting(row.getLatestHtsSetting())
                .observation(parseObservation(row.getLatestHtsObservation()))
                .facilityId(row.getLatestHtsFacilityId())
                .build();
    }

    public LatestHtsResultDto findHtsEncounterByUuid(String htsEncounterUuid) {
        if (htsEncounterUuid == null || htsEncounterUuid.isEmpty()) {
            return null;
        }
        return prepHtsEncounterPatientRepository
                .findHtsEncounterByUuid(htsEncounterUuid)
                .map(row -> LatestHtsResultDto.builder()
                        .id(row.getId())
                        .uuid(row.getUuid())
                        .patientId(row.getPatientId())
                        .patientUuid(row.getPatientUuid())
                        .clientCode(row.getClientCode())
                        .dateOfVisit(row.getDateOfVisit())
                        .setting(row.getSetting())
                        .observation(parseObservation(row.getObservation()))
                        .facilityId(row.getFacilityId())
                        .build())
                .orElse(null);
    }

    private JsonNode parseObservation(String observationJson) {
        if (observationJson == null || observationJson.isEmpty()) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(observationJson);
            normalizeMigratedHtsResult(node);
            return node;
        } catch (Exception e) {
            log.warn("Failed to parse hts_encounter observation JSON: {}", e.getMessage());
            return null;
        }
    }

    private void normalizeMigratedHtsResult(JsonNode node) {
        if (node == null || !node.isObject()) {
            return;
        }
        ObjectNode observation = (ObjectNode) node;
        JsonNode initial = observation.get(HtsObservationKeys.KEY_INITIAL_HIV_TEST);
        boolean alreadyCoded = initial != null && initial.isTextual()
                && initial.asText().startsWith("STI_HIV_RESULT_");
        if (alreadyCoded) {
            return;
        }
        JsonNode finalResult = observation.get(HtsObservationKeys.KEY_FINAL_HIV_TEST_RESULT);
        if (finalResult != null && finalResult.isTextual()) {
            if (HtsObservationKeys.FINAL_HIV_TEST_RESULT_NEGATIVE.equalsIgnoreCase(finalResult.asText())) {
                observation.put(HtsObservationKeys.KEY_INITIAL_HIV_TEST,
                        HtsObservationKeys.INITIAL_HIV_TEST_NEGATIVE);
            } else if (HtsObservationKeys.FINAL_HIV_TEST_RESULT_POSITIVE.equalsIgnoreCase(finalResult.asText())) {
                observation.put(HtsObservationKeys.KEY_INITIAL_HIV_TEST,
                        HtsObservationKeys.INITIAL_HIV_TEST_POSITIVE);
            }
        }

        JsonNode pregnancy = observation.get(HtsObservationKeys.KEY_PREGNANCY_STATUS);
        if (pregnancy != null && pregnancy.isTextual()) {
            String code = firstPregnancyToken(pregnancy.asText());
            if (code != null && !code.equals(pregnancy.asText())) {
                observation.put(HtsObservationKeys.KEY_PREGNANCY_STATUS, code);
            }
        }
    }

    private String firstPregnancyToken(String raw) {
        if (raw == null) {
            return null;
        }
        int sep = raw.indexOf(HtsObservationKeys.PREGNANCY_STATUS_TOKEN_SEPARATOR);
        return sep < 0 ? raw : raw.substring(0, sep);
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

        prepDtos.setInterruptionCount(
                prophylaxisInterruptionRepository.countAllByPersonUuidAndArchived(person.getUuid(), false));
        prepDtos.setPrepInitiationCount(
                prepPepInitiationRepository.countAllByPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                        person.getUuid(), EnrollmentType.PREP, false));
        prepDtos.setPepInitiationCount(
                prepPepInitiationRepository.countAllByPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                        person.getUuid(), EnrollmentType.PEP, false));
        prepDtos.setPregnant(
                prepHtsEncounterPatientRepository.findLatestPregnancyStatusDisplay(person.getUuid()));
        prepFollowupVisitRepository
                .findTopByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(
                        person.getUuid(), currentUserOrganizationService.getCurrentUserOrganization(),
                        false, false)
                .stream()
                .findFirst()
                .ifPresent(latestVisit -> {
                    String regimenId = latestVisit.getRegimenId();
                    if (regimenId == null || regimenId.isEmpty()) {
                        return;
                    }

                    String display = PrepRegimens.displayByCode(regimenId);
                    if (display == null || display.equals(regimenId)) {
                        try {
                            display = PrepRegimens.displayById(Long.parseLong(regimenId));
                        } catch (NumberFormatException ignored) {
                            display = regimenId;
                        }
                    }
                    prepDtos.setCurrentRegimen(display);
                });
        if (prepDtos.getCurrentRegimen() == null) {
            prepPepInitiationRepository
                    .findTopByPersonUuidAndArchived(person.getUuid(), false)
                    .ifPresent(latestInit -> {
                        String raw = latestInit.getPrepRegimen();
                        if (raw == null || raw.isEmpty()) {
                            return;
                        }
                        String display = PrepRegimens.displayByCode(raw);
                        if (display == null || display.equals(raw)) {
                            try {
                                display = PrepRegimens.displayById(Long.parseLong(raw));
                            } catch (NumberFormatException ignored) {
                                display = null;
                            }
                        }
                        if (display != null) {
                            prepDtos.setCurrentRegimen(display);
                        }
                    });
        }
        prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, EnrollmentType.PREP)
                .ifPresent(latestPrep -> {
                    Boolean interrupted = applyPepAutoExpiry(latestPrep);
                    boolean active = !Boolean.TRUE.equals(interrupted);
                    prepDtos.setIsCurrentStatusInterruptedPrep(active);
                });
        prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, EnrollmentType.PEP)
                .ifPresent(latestPep -> {
                    Boolean interrupted = applyPepAutoExpiry(latestPep);
                    boolean active = !Boolean.TRUE.equals(interrupted);
                    prepDtos.setIsCurrentStatusInterruptedPep(active);
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
        }

        prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, EnrollmentType.PEP)
                .ifPresent(latestPepInit -> {
                    boolean explicitCompletion = prophylaxisInterruptionRepository
                            .findAllByPersonUuidAndFacilityIdAndArchived(
                                    person.getUuid(),
                                    currentUserOrganizationService.getCurrentUserOrganization(),
                                    false)
                            .stream()
                            .filter(i -> latestPepInit.getUuid()
                                    .equals(i.getProphylaxisInitiationUuid()))
                            .anyMatch(i -> "YES_NO_YES".equalsIgnoreCase(i.getPepCompletion()));
                    if (explicitCompletion) {
                        prepDtos.setPrepStatus("Completed");
                        return;
                    }
                    LocalDate anchor = pepFollowupVisitRepository
                            .findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
                                    person.getUuid(),
                                    currentUserOrganizationService.getCurrentUserOrganization(),
                                    false)
                            .stream()
                            .findFirst()
                            .map(v -> v.getDateStartPep() != null
                                    ? v.getDateStartPep() : v.getEncounterDate())
                            .orElse(null);
                    if (anchor == null) {
                        prepDtos.setPrepStatus("Enrolled");
                    } else {
                        long days = java.time.temporal.ChronoUnit.DAYS.between(
                                anchor, java.time.LocalDate.now());
                        prepDtos.setPrepStatus(days >= 29 ? "Completed" : "Active");
                    }
                });
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

    private Boolean applyPepAutoExpiry(PrepPepInitiation initiation) {
        if (initiation == null) return null;
        Boolean interrupted = initiation.getIsInterrupted();
        boolean isPep = EnrollmentType.isPep(initiation.getEnrollmentType());
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

        Optional<PrepPepInitiation> prepEnrollmentOptional = prepPepInitiationRepository
                .findByPersonUuidAndArchived(person.getUuid(), false, currentUserOrganizationService.getCurrentUserOrganization());
        if (prepEnrollmentOptional.isPresent())
            return enrollmentToEnrollmentDto(prepEnrollmentOptional.get());
        return new PrepEnrollmentDto();
    }

    public PrepEnrollmentDto getLatestInitiation(Long personId, String enrollmentType) {
        Person person = this.getPerson(personId);
        String canonicalType = EnrollmentType.toCanonical(enrollmentType);
        Optional<PrepPepInitiation> latest = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, canonicalType);
        return latest.map(this::enrollmentToEnrollmentDto).orElseGet(PrepEnrollmentDto::new);
    }

    public String getLatestInitiationUuid(String personUuid, String enrollmentType) {
        String canonicalType = EnrollmentType.toCanonical(enrollmentType);
        Optional<PrepPepInitiation> latest = (canonicalType != null && !canonicalType.isEmpty())
                ? prepPepInitiationRepository.findLatestByPersonUuidAndEnrollmentType(personUuid, false, canonicalType)
                : prepPepInitiationRepository.findTopByPersonUuidAndArchived(personUuid, false);
        return latest.map(PrepPepInitiation::getUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepPepInitiation.class,
                        "personUuid/enrollmentType", personUuid + "/" + canonicalType));
    }

    private String resolveEnrollmentUuid(PrepClinicRequestDto requestDto, String personUuid) {
        String enrollmentUuid = requestDto.getPrepEnrollmentUuid();
        if (enrollmentUuid != null && !enrollmentUuid.isEmpty()) {
            return enrollmentUuid;
        }
        String enrollmentType = EnrollmentType.toCanonical(requestDto.getEnrollmentType());
        if (enrollmentType == null || enrollmentType.isEmpty()) {
            enrollmentType = EnrollmentType.PREP;
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
        prepEligibility.setVisitDate(prepEligibilityRequestDto.getVisitDate());
        prepEligibility.setReasonForSwitch(prepEligibilityRequestDto.getReasonForSwitch());
        prepEligibility.setConsiderationForInjections(prepEligibilityRequestDto.getConsiderationForInjections());
        prepEligibility.setReasonForDecliningPrep(prepEligibilityRequestDto.getReasonForDecliningPrep());
        prepEligibility.setUniqueClientId(prepEligibilityRequestDto.getUniqueClientId());
        prepEligibility.setHtsEncounterUuid(prepEligibilityRequestDto.getHtsEncounterUuid());
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
        prepEligibilityDto.setReasonForSwitch(eligibility.getReasonForSwitch());
        prepEligibilityDto.setConsiderationForInjections(eligibility.getConsiderationForInjections());
        prepEligibilityDto.setReasonForDecliningPrep(eligibility.getReasonForDecliningPrep());
        prepEligibilityDto.setUniqueClientId(eligibility.getUniqueClientId());
        prepEligibilityDto.setHtsEncounterUuid(eligibility.getHtsEncounterUuid());
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
        prepEnrollment.setHtsEncounterUuid(prepEnrollmentRequestDto.getHtsEncounterUuid());

        prepEnrollment.setEnrollmentType(prepEnrollmentRequestDto.getEnrollmentType());
        prepEnrollment.setPopulationType(prepEnrollmentRequestDto.getPopulationType());
        prepEnrollment.setWeight(prepEnrollmentRequestDto.getWeight());
        prepEnrollment.setHeight(prepEnrollmentRequestDto.getHeight());
        prepEnrollment.setHistoryOfDrugAllergies(prepEnrollmentRequestDto.getHistoryOfDrugAllergies());
        prepEnrollment.setHistoryOfDrugToDrugInteraction(prepEnrollmentRequestDto.getHistoryOfDrugToDrugInteraction());
        prepEnrollment.setUrinalysisResult(prepEnrollmentRequestDto.getUrinalysisResult());
        prepEnrollment.setLiverFunctionTestResults(prepEnrollmentRequestDto.getLiverFunctionTestResults());
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
        prepClinic.setWeight(prepClinicRequestDto.getWeight());
        prepClinic.setHeight(prepClinicRequestDto.getHeight());
        prepClinic.setHtsEncounterUuid(prepClinicRequestDto.getHtsEncounterUuid());
        prepClinic.setProphylaxisInitiationUuid(prepClinicRequestDto.getPrepEnrollmentUuid());
        prepClinic.setRegimenId(prepClinicRequestDto.getRegimenId());
        prepClinic.setNextAppointment(prepClinicRequestDto.getNextAppointment());
        prepClinic.setEncounterDate(prepClinicRequestDto.getEncounterDate());
        prepClinic.setPulse(prepClinicRequestDto.getPulse());
        prepClinic.setRespiratoryRate(prepClinicRequestDto.getRespiratoryRate());
        prepClinic.setTemperature(prepClinicRequestDto.getTemperature());
        prepClinic.setSystolic(prepClinicRequestDto.getSystolic());
        prepClinic.setDiastolic(prepClinicRequestDto.getDiastolic());
        prepClinic.setAdherenceLevel(prepClinicRequestDto.getAdherenceLevel());
        prepClinic.setStiScreening(prepClinicRequestDto.getStiScreening());
        prepClinic.setUrinalysis(prepClinicRequestDto.getUrinalysis());

        prepClinic.setHepatitis(prepClinicRequestDto.getHepatitis());
        prepClinic.setSyphilis(prepClinicRequestDto.getSyphilis());
        prepClinic.setOtherTestsDone(prepClinicRequestDto.getOtherTestsDone());
        prepClinic.setLiverFunctionTestResults(prepClinicRequestDto.getLiverFunctionTestResults());
        prepClinic.setDateLiverFunctionTestResults(prepClinicRequestDto.getDateLiverFunctionTestResults());
        prepClinic.setSyndromicStiScreening(prepClinicRequestDto.getSyndromicStiScreening());
        prepClinic.setRiskReductionServices(prepClinicRequestDto.getRiskReductionServices());
        prepClinic.setDuration(prepClinicRequestDto.getDuration());
        prepClinic.setOtherDrugs(prepClinicRequestDto.getOtherDrugs());
        prepClinic.setPrepType(prepClinicRequestDto.getPrepType());
        prepClinic.setPopulationType(prepClinicRequestDto.getPopulationType());
        prepClinic.setPrepNotedSideEffects(prepClinicRequestDto.getPrepNotedSideEffects());
        prepClinic.setMonthsOfRefill(prepClinicRequestDto.getMonthsOfRefill());
        prepClinic.setHealthCareWorkerSignature(prepClinicRequestDto.getHealthCareWorkerSignature());
        prepClinic.setReasonForSwitch(prepClinicRequestDto.getReasonForSwitch());
        prepClinic.setOtherRegimenId(prepClinicRequestDto.getOtherRegimenId());
        prepClinic.setPreviousPrepStatus(prepClinicRequestDto.getPreviousPrepStatus());
        prepClinic.setWhyAdherenceLevelPoor(prepClinicRequestDto.getWhyAdherenceLevelPoor());
        prepClinic.setOtherReasonForPoorFairAdherence(prepClinicRequestDto.getOtherReasonForPoorFairAdherence());
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
        prepClinicDto.setWeight(clinic.getWeight());
        prepClinicDto.setHeight(clinic.getHeight());
        prepClinicDto.setHtsEncounterUuid(clinic.getHtsEncounterUuid());
        prepClinicDto.setPrepEnrollmentUuid(clinic.getProphylaxisInitiationUuid());
        prepClinicDto.setRegimenId(clinic.getRegimenId());
        prepClinicDto.setNextAppointment(clinic.getNextAppointment());
        prepClinicDto.setIsCommencement(clinic.getIsCommencement());
        prepClinicDto.setEncounterDate(clinic.getEncounterDate());
        prepClinicDto.setPulse(clinic.getPulse());
        prepClinicDto.setRespiratoryRate(clinic.getRespiratoryRate());
        prepClinicDto.setTemperature(clinic.getTemperature());
        prepClinicDto.setSystolic(clinic.getSystolic());
        prepClinicDto.setDiastolic(clinic.getDiastolic());
        prepClinicDto.setAdherenceLevel(clinic.getAdherenceLevel());
        prepClinicDto.setStiScreening(clinic.getStiScreening());
        prepClinicDto.setUrinalysis(clinic.getUrinalysis());
        prepClinicDto.setHepatitis(clinic.getHepatitis());
        prepClinicDto.setSyphilis(clinic.getSyphilis());
        prepClinicDto.setOtherTestsDone(clinic.getOtherTestsDone());
        prepClinicDto.setLiverFunctionTestResults(clinic.getLiverFunctionTestResults());
        prepClinicDto.setDateLiverFunctionTestResults(clinic.getDateLiverFunctionTestResults());
        prepClinicDto.setSyndromicStiScreening(clinic.getSyndromicStiScreening());
        prepClinicDto.setRiskReductionServices(clinic.getRiskReductionServices());
        prepClinicDto.setDuration(clinic.getDuration());
        prepClinicDto.setVisitType(clinic.getVisitType());
        prepClinicDto.setOtherDrugs(clinic.getOtherDrugs());
        prepClinicDto.setPrepType(clinic.getPrepType());
        prepClinicDto.setPopulationType(clinic.getPopulationType());
        prepClinicDto.setMonthsOfRefill(clinic.getMonthsOfRefill());
        prepClinicDto.setPrepNotedSideEffects(clinic.getPrepNotedSideEffects());
        prepClinicDto.setReasonForSwitch(clinic.getReasonForSwitch());
        prepClinicDto.setOtherRegimenId(clinic.getOtherRegimenId());
        prepClinicDto.setPreviousPrepStatus(clinic.getPreviousPrepStatus());
        prepClinicDto.setWhyAdherenceLevelPoor(clinic.getWhyAdherenceLevelPoor());
        prepClinicDto.setOtherReasonForPoorFairAdherence(clinic.getOtherReasonForPoorFairAdherence());
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
        enrollmentDto.setHtsEncounterUuid(enrollment.getHtsEncounterUuid());

        enrollmentDto.setEnrollmentType(enrollment.getEnrollmentType());
        enrollmentDto.setPopulationType(enrollment.getPopulationType());
        enrollmentDto.setWeight(enrollment.getWeight());
        enrollmentDto.setHeight(enrollment.getHeight());
        enrollmentDto.setHistoryOfDrugAllergies(enrollment.getHistoryOfDrugAllergies());
        enrollmentDto.setHistoryOfDrugToDrugInteraction(enrollment.getHistoryOfDrugToDrugInteraction());
        enrollmentDto.setUrinalysisResult(enrollment.getUrinalysisResult());
        enrollmentDto.setLiverFunctionTestResults(enrollment.getLiverFunctionTestResults());
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
        prepDto.setDateStarted(prepEnrollment.getDateEnrolled());
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
        e.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        e.setPreviousPepStatus(dto.getPreviousPepStatus());
        e.setEnrollmentType(dto.getEnrollmentType());
        e.setProphylaxisInitiationUuid(dto.getPrepEnrollmentUuid());
        e.setWhy(dto.getWhy());
        e.setPepCompletion(dto.getPepCompletion());
        e.setFollowUpVisitDate(dto.getFollowUpVisitDate());
        e.setHtsEncounterUuid(dto.getHtsEncounterUuid());
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
        dto.setPreviousPrepStatus(e.getPreviousPrepStatus());
        dto.setPreviousPepStatus(e.getPreviousPepStatus());
        dto.setEnrollmentType(e.getEnrollmentType());
        dto.setPrepEnrollmentUuid(e.getProphylaxisInitiationUuid());
        dto.setWhy(e.getWhy());
        dto.setPepCompletion(e.getPepCompletion());
        dto.setFollowUpVisitDate(e.getFollowUpVisitDate());
        dto.setHtsEncounterUuid(e.getHtsEncounterUuid());
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

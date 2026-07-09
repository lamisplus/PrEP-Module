package org.lamisplus.modules.prep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    /**
     * Resolves the Person for a write, PREFERRING the stable person UUID (always
     * shipped on every grid row) over the bigint person id. Falls back to the id
     * only when no uuid was sent, so older payloads keep working. This is what
     * makes every CRUD path robust against a stale/absent person id.
     */
    public Person resolvePersonForWrite(String personUuid, Long personId) {
        if (personUuid != null && !personUuid.trim().isEmpty()) {
            Optional<Person> byUuid = personRepository.findByUuidAndFacilityId(
                    personUuid, currentUserOrganizationService.getCurrentUserOrganization());
            if (byUuid.isPresent()) return byUuid.get();
        }
        return getPerson(personId);
    }

    public PrepEligibilityDto saveEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto) {
        Person person;
        person = this.resolvePersonForWrite(prepEligibilityRequestDto.getPersonUuid(), prepEligibilityRequestDto.getPersonId());
        PrepEligibilityScreening prepEligibility = this.prepEligibilityRequestDtoToPrepEligibility(prepEligibilityRequestDto, person.getUuid());
        prepEligibility.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepEligibility.setUuid(UUID.randomUUID().toString());

        //Check if client eligibility on same date exist and throw an error
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

        Person person = this.resolvePersonForWrite(prepEnrollmentRequestDto.getPersonUuid(), prepEnrollmentRequestDto.getPersonId());

        if (!prepEligibility.getPersonUuid().equals(person.getUuid())) {
            throw PrepErrors.personMismatch("eligibility screening");
        }

        // Clinical guard: PrEP is only available to clients aged 15 and above. Below that age,
        // only PEP may be initiated. The frontend already disables the PrEP card for under-15s,
        // but enforce here to prevent direct API misuse and bad data via syncs.
        String enrollmentType = EnrollmentType.toCanonical(prepEnrollmentRequestDto.getEnrollmentType());
        if (EnrollmentType.isPrep(enrollmentType) && person.getDateOfBirth() != null) {
            int age = Period.between(person.getDateOfBirth(), LocalDate.now()).getYears();
            if (age < 15) {
                throw PrepErrors.prepBelowMinimumAge(15);
            }
        }

        // Per-arm duplicate guard: a single eligibility screening can seed BOTH
        // a PrEP and a PEP initiation (clients legitimately switch arms after
        // re-screening). Only reject if an initiation of the SAME arm already
        // exists for this screening.
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

        // Same-date duplicate guard — arm-scoped so PEP and PrEP can both be
        // initiated on the same calendar date.
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
        Person person = this.resolvePersonForWrite(commencementRequestDto.getPersonUuid(), commencementRequestDto.getPersonId());
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
        Person person = this.resolvePersonForWrite(clinicRequestDto.getPersonUuid(), clinicRequestDto.getPersonId());

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
        Person person = this.resolvePersonForWrite(interruptionRequestDto.getPersonUuid(), interruptionRequestDto.getPersonId());
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

        // Resolve the matching prophylaxis_initiation (by enrollment type, latest first) and
        // 1) link this interruption to it via prophylaxis_initiation_uuid; 2) flip is_interrupted
        // on the initiation so the patient's current status is now "interrupted on that arm".
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
        return getPrepByPersonId(personId, null);
    }

    public PrepDtos getPrepByPersonId(Long personId, String enrollmentType) {
        Person person = personRepository.findById(personId).orElse(new Person());
        if (person.getId() == null) {
            return new PrepDtos();
        }
        return this.prepToPrepDtos(person,
                prepPepInitiationRepository.findFirstByPersonOrderByIdDesc(person), enrollmentType);
    }

    public List<PrepEnrollmentDto> getEnrollmentByPersonUuid(String personUuid) {
        Person person = resolvePersonByUuid(personUuid);
        if (person == null) return new ArrayList<>();
        List<PrepEnrollmentDto> prepEnrollmentDtos = new ArrayList<>();
        List<PrepPepInitiation> prepEnrollments = prepPepInitiationRepository.findAllByPerson(person);
        prepEnrollments.forEach(prepEnrollment -> {
            prepEnrollmentDtos.add(enrollmentToEnrollmentDto(prepEnrollment));
        });
        return prepEnrollmentDtos;
    }

    public List<PrepClinicDto> getCommencementByPersonUuid(String personUuid) {
        Person person = resolvePersonByUuid(personUuid);
        if (person == null) return new ArrayList<>();
        List<PrepClinicDto> prepClinicDtos = new ArrayList<>();
        List<PrepFollowupVisit> prepClinics = prepFollowupVisitRepository.findAllByPersonAndIsCommencement(person, true);
        prepClinics.forEach(prepClinic -> {
            prepClinicDtos.add(clinicToClinicDto(prepClinic));
        });
        return prepClinicDtos;
    }

    /**
     * Resolves the Person entity from a person UUID (stable identifier shipped on
     * every grid row), scoped to the current facility. Returns null instead of
     * throwing when absent, so read endpoints degrade to empty rather than 500.
     */
    private Person resolvePersonByUuid(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) return null;
        return personRepository
                .findByUuidAndFacilityId(personUuid, currentUserOrganizationService.getCurrentUserOrganization())
                .orElse(null);
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

    /**
     * Re-uses the same projection mapper the Patient tab uses so enrollment-tab
     * rows ship every property the dashboard expects (HTS encounter,
     * pregnancyStatusDisplay, isInterrupted, counts, etc).
     * <p>
     * Pagination is preserved verbatim from the underlying {@code Page} —
     * total elements + total pages come straight from the SQL count query;
     * we only re-wrap the content list after DTO mapping.
     */
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

        // Lean grid query (findAllPatientsLite/searchPatientsLite): latest-HTS
        // CTE + patient_person only, no prepStatus/interruption/follow-up joins.
        // Revert by swapping these back to searchPatients/findAllPatients.
        if (!String.valueOf(searchValue).equals("null") && !searchValue.equals("*")) {
            String queryParam = "%" + searchValue.replaceAll("\\s", "") + "%";
            resultPage = prepHtsEncounterPatientRepository
                    .searchPatientsLite(false, facilityId, queryParam, pageable);
        } else {
            resultPage = prepHtsEncounterPatientRepository
                    .findAllPatientsLite(false, facilityId, pageable);
        }

        List<PrepHtsPatientDto> dtos = resultPage.getContent().stream()
                .filter(row -> !"Seroconverted".equals(row.getPrepStatus()))
                .map(this::toPrepHtsPatientDto)
                .collect(Collectors.toList());

        // Ship the per-arm active-enrollment flags ON each row so the Enroll modal
        // reads them directly (no extra round-trip). Computed by person_uuid: a
        // client with an active, not-yet-discontinued initiation on an arm cannot
        // be re-enrolled there. New clients (no initiation) → both false → allowed.
        dtos.forEach(dto -> {
            java.util.Map<String, Boolean> active = getActiveEnrollmentByUuid(dto.getPersonUuid());
            dto.setIsCurrentStatusInterruptedPrep(active.get("isCurrentStatusInterruptedPrep"));
            dto.setIsCurrentStatusInterruptedPep(active.get("isCurrentStatusInterruptedPep"));
        });

        return new PageImpl<>(dtos, pageable, resultPage.getTotalElements());
    }

    private PrepHtsPatientDto toPrepHtsPatientDto(PrepHtsPatient row) {
        return PrepHtsPatientDto.builder()
                .personId(row.getPersonId())
                .personUuid(row.getPersonUuid())
                .uniqueId(row.getUniqueId())
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
                .latestHtsResult(toLatestHtsResultDto(row))
                .build();
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

    /**
     * Rehydrate a single hts_encounter by uuid into {@link LatestHtsResultDto}
     * — used by edit/view paths on prep forms (screening, initiation, followup,
     * clinic) to fill the read-only HTS fields when the saved record links to
     * an hts_encounter via {@code hts_encounter_uuid}.
     */
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
            return objectMapper.readTree(observationJson);
        } catch (Exception e) {
            log.warn("Failed to parse hts_encounter observation JSON: {}", e.getMessage());
            return null;
        }
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
        return prepToPrepDtos(person, clients, null);
    }

    private PrepDtos prepToPrepDtos(@NotNull Person person, List<PrepPepInitiation> clients, String enrollmentType) {
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
                        person.getUuid(), EnrollmentType.PREP, false));
        prepDtos.setPepInitiationCount(
                prepPepInitiationRepository.countAllByPersonUuidAndEnrollmentTypeIgnoreCaseAndArchived(
                        person.getUuid(), EnrollmentType.PEP, false));
        // Pregnancy display comes from the patient's latest hts_encounter
        // (initiation no longer stores pregnancyStatus / breastFeeding — both are
        // derived from the same hts pregnancyStatus codeset where Breastfeeding
        // is one of the possible values). Patient Card reads this directly.
        prepDtos.setPregnant(
                prepHtsEncounterPatientRepository.findLatestPregnancyStatusDisplay(person.getUuid()));

        // Current regimen — display name from the patient's most recent
        // prep_followup_visit (covers both initiation and ongoing visits).
        // Patient Card renders this; falling back to the regimen code when an
        // entry is not mapped in PrepRegimens.
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
                    // After the bigint→varchar migration, regimen_id holds the
                    // canonical codeset code (e.g. PREP_REGIMEN_TDF_FTC).
                    // Legacy rows that survived the migration as a stringified
                    // numeric id (no matching codeset row) fall through to
                    // displayById so they still render a friendly name.
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
        // If no follow-up exists yet (right after initiation), fall back to the
        // latest initiation's prep_regimen so the dashboard never surfaces a
        // raw numeric id. The form historically stored the numeric row id; we
        // also handle the case where future writes use the codeset code.
        if (prepDtos.getCurrentRegimen() == null) {
            prepPepInitiationRepository
                    .findTopByPersonUuidAndArchived(person.getUuid(), false)
                    .ifPresent(latestInit -> {
                        String raw = latestInit.getPrepRegimen();
                        if (raw == null || raw.isEmpty()) {
                            return;
                        }
                        String display = PrepRegimens.displayByCode(raw);
                        // displayByCode returns the original string when the
                        // code isn't mapped; treat that as a numeric-id legacy
                        // value and re-resolve via displayById.
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

        // isCurrentStatus* flags drive the Patient List "Enroll" modal and the
        // SubMenu cross-arm lockouts, and answer "does this client have a current
        // enrollment on this arm?". Computed PER ARM and INDEPENDENTLY: the client
        // is "active on PrEP" only when their LATEST PrEP initiation is not
        // interrupted, and likewise for PEP — one arm never affects the other.
        //
        // Both flags DEFAULT to false, so a client with no initiation at all (e.g.
        // a brand-new HTS registration) is correctly reported as NOT enrolled.
        //
        // The initiation ↔ person link is person_uuid. Since a blank/absent uuid
        // ("we don't reliably use client uuids") would make `person_uuid = ''`
        // collide with ANY other initiation carrying a blank uuid — falsely
        // flagging a newly-registered client as already enrolled — we only run the
        // lookup for a non-blank uuid. No uuid → no initiation match → flags stay
        // false (no current enrollment), which is the correct answer.
        String personUuidForStatus = person.getUuid();
        if (personUuidForStatus != null && !personUuidForStatus.trim().isEmpty()) {
            prepPepInitiationRepository
                    .findLatestByPersonUuidAndEnrollmentType(personUuidForStatus, false, EnrollmentType.PREP)
                    .ifPresent(latestPrep -> {
                        boolean active = !Boolean.TRUE.equals(applyPepAutoExpiry(latestPrep));
                        prepDtos.setIsCurrentStatusInterruptedPrep(active);
                    });
            prepPepInitiationRepository
                    .findLatestByPersonUuidAndEnrollmentType(personUuidForStatus, false, EnrollmentType.PEP)
                    .ifPresent(latestPep -> {
                        boolean active = !Boolean.TRUE.equals(applyPepAutoExpiry(latestPep));
                        prepDtos.setIsCurrentStatusInterruptedPep(active);
                    });
        }
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

        // Arm-aware status: when the dashboard tells us which arm it is showing
        // (enrollmentType), override prepStatus with the SAME per-arm query the
        // grid uses, so the dashboard and grid always agree. When no arm is
        // supplied, fall back to the legacy PEP-override heuristic below.
        String canonicalArm = EnrollmentType.toCanonical(enrollmentType);
        if (EnrollmentType.PREP.equals(canonicalArm)) {
            prepPepInitiationRepository
                    .findPrepEnrolledStatusForPerson(false,
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            canonicalArm, person.getUuid())
                    .map(PrepHtsPatient::getPrepStatus)
                    .ifPresent(prepDtos::setPrepStatus);
        } else if (EnrollmentType.PEP.equals(canonicalArm)) {
            prepPepInitiationRepository
                    .findPepEnrolledStatusForPerson(false,
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            canonicalArm, person.getUuid())
                    .map(PrepHtsPatient::getPrepStatus)
                    .ifPresent(prepDtos::setPrepStatus);
        } else {
            // Legacy (no arm supplied): if the patient's latest initiation is PEP,
            // reuse the EXACT PEP grid status query (PEP_STATUS_CASE) so the
            // fallback matches the grid — Completed only via a completion form,
            // otherwise Active/Default on next_appointment, Not Commenced pre-visit.
            prepPepInitiationRepository
                    .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, EnrollmentType.PEP)
                    .ifPresent(latestPepInit -> prepPepInitiationRepository
                            .findPepEnrolledStatusForPerson(false,
                                    currentUserOrganizationService.getCurrentUserOrganization(),
                                    EnrollmentType.PEP, person.getUuid())
                            .map(PrepHtsPatient::getPrepStatus)
                            .ifPresent(prepDtos::setPrepStatus));
        }

        // Final safety net: if every path above left the status null/blank (a
        // record we read came back null and nothing set a value), never leave it
        // empty — assume the worst case rather than an implied-active blank.
        if (prepDtos.getPrepStatus() == null || prepDtos.getPrepStatus().trim().isEmpty()) {
            prepDtos.setPrepStatus("Defaulted");
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

    public PrepEligibilityDto getOpenEligibility(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return new PrepEligibilityDto();
        }
        return prepEligibilityToPrepEligibilityDto(prepEligibilityScreeningRepository
                .findByPersonUuidAndArchived(personUuid, false));
    }

    public PrepEnrollmentDto getOpenEnrollment(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return new PrepEnrollmentDto();
        }
        Optional<PrepPepInitiation> prepEnrollmentOptional = prepPepInitiationRepository
                .findByPersonUuidAndArchived(personUuid, false, currentUserOrganizationService.getCurrentUserOrganization());
        if (prepEnrollmentOptional.isPresent())
            return enrollmentToEnrollmentDto(prepEnrollmentOptional.get());
        return new PrepEnrollmentDto();
    }

    /**
     * Returns the most recent (by date_enrolled) initiation for the given person filtered
     * by enrollment type (PrEP or PEP). Used by follow-up visit forms to compute duration
     * on therapy and to validate that the visit date is after the enrollment date.
     */
    public PrepEnrollmentDto getLatestInitiation(String personUuid, String enrollmentType) {
        // Keyed by the person UUID (stable, always shipped on every grid row)
        // rather than the bigint person id, which could be stale/absent on a row
        // and threw EntityNotFound. No person lookup needed — the repository
        // filters directly on person_uuid.
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return new PrepEnrollmentDto();
        }
        String canonicalType = EnrollmentType.toCanonical(enrollmentType);
        Optional<PrepPepInitiation> latest = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(personUuid, false, canonicalType);
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

    /**
     * Dedicated, lightweight status endpoint: returns the SAME arm-specific status
     * the grid shows (PrEP or PEP), for one person, keyed by person UUID. Used by
     * the dashboard to refresh the patient card's status immediately after a form
     * submission — without re-fetching the full person payload.
     */
    public String getEnrollmentStatus(String personUuid, String enrollmentType) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return "Not Available";
        }
        String canonicalArm = EnrollmentType.toCanonical(enrollmentType);
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        if (EnrollmentType.PEP.equals(canonicalArm)) {
            return prepPepInitiationRepository
                    .findPepEnrolledStatusForPerson(false, facilityId, EnrollmentType.PEP, personUuid)
                    .map(PrepHtsPatient::getPrepStatus)
                    .orElse("Not Available");
        }
        // Default to PrEP for any non-PEP arm.
        return prepPepInitiationRepository
                .findPrepEnrolledStatusForPerson(false, facilityId, EnrollmentType.PREP, personUuid)
                .map(PrepHtsPatient::getPrepStatus)
                .orElse("Not Available");
    }

    /**
     * Does the client currently have an ACTIVE (non-interrupted) enrollment on
     * each arm? Keyed DIRECTLY by the person UUID that the grid row carries, so
     * the "Enroll" modal never goes through the personId → findById(person) →
     * person.getUuid() hop (which can resolve the wrong/mismatched person and
     * falsely block a brand-new HTS client). Initiations link only by
     * person_uuid, so this is the reliable check. No initiation on an arm → not
     * active on that arm; the two arms are reported independently.
     */
    public java.util.Map<String, Boolean> getActiveEnrollmentByUuid(String personUuid) {
        boolean prepActive = false;
        boolean pepActive = false;
        if (personUuid != null && !personUuid.trim().isEmpty()) {
            prepActive = isArmActivelyEnrolled(personUuid, EnrollmentType.PREP,
                    prepFollowupVisitRepository.findLatestFollowupDate(personUuid));
            pepActive = isArmActivelyEnrolled(personUuid, EnrollmentType.PEP,
                    pepFollowupVisitRepository.findLatestFollowupDate(personUuid));
        }
        java.util.Map<String, Boolean> result = new java.util.HashMap<>();
        result.put("isCurrentStatusInterruptedPrep", prepActive);
        result.put("isCurrentStatusInterruptedPep", pepActive);
        return result;
    }

    /**
     * Is the client on a CURRENT (active) enrollment for this arm?
     *   • No initiation on the arm → NOT active (a brand-new client — enrollment
     *     allowed).
     *   • Has an initiation → active, UNLESS discontinued.
     *   • Discontinued when the latest interruption date for the arm is on/after
     *     the latest follow-up visit date for the arm (a later interruption closes
     *     the course). A client with an initiation but no interruption yet (with or
     *     without follow-ups) is still active.
     */
    private boolean isArmActivelyEnrolled(String personUuid, String enrollmentType,
                                          java.sql.Date latestFollowupSql) {
        boolean hasInitiation = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(personUuid, false, enrollmentType)
                .isPresent();
        if (!hasInitiation) {
            return false;
        }
        java.sql.Date latestInterruptionSql =
                prophylaxisInterruptionRepository.findLatestInterruptionDate(personUuid, enrollmentType);
        // No interruption at all → not discontinued → still active.
        if (latestInterruptionSql == null) {
            return true;
        }
        java.time.LocalDate latestInterruption = latestInterruptionSql.toLocalDate();
        java.time.LocalDate latestFollowup =
                latestFollowupSql == null ? null : latestFollowupSql.toLocalDate();
        // Discontinued when the interruption is on/after the latest follow-up
        // (or there is no follow-up at all). Discontinued → NOT active.
        boolean discontinued = latestFollowup == null || !latestInterruption.isBefore(latestFollowup);
        return !discontinued;
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
        //PersonResponseDto personResponseDto = personService.getDtoFromPerson(prepEnrollment.getPerson());
        //prepDto.setPersonResponseDto(personResponseDto);
        prepDto.setDateStarted(prepEnrollment.getDateEnrolled());
        // status column was removed from prophylaxis_initiation — initiation state
        // is now signalled by is_interrupted (with the dashboard / patient grid
        // queries deriving display labels).
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

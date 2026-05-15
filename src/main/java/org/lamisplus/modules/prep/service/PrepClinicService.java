package org.lamisplus.modules.prep.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.prep.domain.dto.PrepClinicDto;
import org.lamisplus.modules.prep.domain.dto.PrepClinicRequestDto;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
import org.lamisplus.modules.prep.domain.entity.PrepClinic;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.lamisplus.modules.prep.repository.PrepInterruptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PrepClinicService {
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepEnrollmentRepository prepEnrollmentRepository;
    private final PrepEligibilityRepository prepEligibilityRepository;
    private final ObjectMapper objectMapper;
    private final VisitService visitService;
    private final VisitRepository visitRepository;
    private final PrepClinicRepository prepClinicRepository;
    private final PatientActivityService patientActivityService;

    private ModuleService moduleService;

    private PrepInterruptionRepository prepInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepClinicDto saveCommencement(PrepClinicRequestDto commencementRequestDto) {
        Person person = this.getPerson(commencementRequestDto.getPersonId());

        String enrollmentUuid = commencementRequestDto.getPrepEnrollmentUuid();
        if (enrollmentUuid == null || enrollmentUuid.trim().isEmpty()) {
            PrepEnrollment enrollment = prepEnrollmentRepository
                    .findTopByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED)
                    .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "PersonUuid", person.getUuid()));
            enrollmentUuid = enrollment.getUuid();
            commencementRequestDto.setPrepEnrollmentUuid(enrollmentUuid);
        }
        final String finalEnrollmentUuid = enrollmentUuid;

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(finalEnrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", finalEnrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw PrepErrors.personMismatch("enrollment");
        }

        PrepClinic prepClinic = this.clinicRequestDtoToClinic(commencementRequestDto, person.getUuid());

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(true);
        prepClinic = prepClinicRepository.save(prepClinic);
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic, null);
        //prepClinicDto.setStatus("COMMENCED");
        return prepClinicDto;
    }

    public PrepClinicDto saveClinic(PrepClinicRequestDto clinicRequestDto) {
        Person person = this.getPerson(clinicRequestDto.getPersonId());

        String enrollmentUuid = clinicRequestDto.getPrepEnrollmentUuid();
        if (enrollmentUuid == null || enrollmentUuid.trim().isEmpty()) {
            PrepEnrollment enrollment = prepEnrollmentRepository
                    .findTopByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED)
                    .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "PersonUuid", person.getUuid()));
            enrollmentUuid = enrollment.getUuid();
            clinicRequestDto.setPrepEnrollmentUuid(enrollmentUuid);
        }
        final String finalEnrollmentUuid = enrollmentUuid;

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(finalEnrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", finalEnrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw PrepErrors.personMismatch("enrollment");
        }

        PrepClinic prepClinic = this.clinicRequestDtoToClinic(clinicRequestDto, person.getUuid());

        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        prepClinic.setIsCommencement(false);
        prepClinic = prepClinicRepository.save(prepClinic);
        prepClinic.setPerson(person);
        PrepClinicDto prepClinicDto = this.clinicToClinicDto(prepClinic, null);
        //prepClinicDto.setStatus("COMMENCED");
        return prepClinicDto;
    }

    public void delete(Long id) {
        PrepClinic prepClinic = prepClinicRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));
        prepClinic.setArchived(ARCHIVED);
        prepClinicRepository.save(prepClinic);
    }

    public PrepClinicDto getPrepClinicById(Long id) {
        PrepClinic prepClinic = prepClinicRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));
        return clinicToClinicDto(prepClinic, null);
    }

    public List<PrepClinicDto> getPrepClinicByPersonId(Long personId, Boolean isCommenced, Boolean last) {
        List<PrepClinic> prepClinics;
        if (!last) {
            prepClinics = prepClinicRepository
                    .findAllByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(getPerson(personId).getUuid(),
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            UN_ARCHIVED, isCommenced);
        } else {
            prepClinics = prepClinicRepository
                    .findTopByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(getPerson(personId).getUuid(),
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            UN_ARCHIVED, isCommenced);
        }
        return prepClinics.stream()
                .map(prepClinic -> clinicToClinicDto(prepClinic, last))
                .collect(Collectors.toList());
    }

    public PrepClinicDto update(Long id, PrepClinicDto prepClinicDto) {
        PrepClinic prepClinic = prepClinicRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));
        String uuid = prepClinic.getUuid();
        String enrollmentUuid = prepClinic.getPrepEnrollmentUuid();
        Boolean iscommencement = prepClinic.getIsCommencement();
        prepClinic = clinicDtoToClinic(prepClinicDto, prepClinic.getPersonUuid());
        prepClinic.setArchived(UN_ARCHIVED);
        prepClinic.setId(id);
        prepClinic.setUuid(uuid);
        prepClinic.setIsCommencement(iscommencement);
        prepClinic.setPrepEnrollmentUuid(enrollmentUuid);
        prepClinic.setFamilyPlanning(prepClinicDto.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning(prepClinicDto.getDateOfFamilyPlanning());
        prepClinic.setHtsEncounterUuid(prepClinicDto.getHtsEncounterUuid());
        prepClinic.setPrepDistributionSetting(prepClinicDto.getPrepDistributionSetting());
        prepClinic.setPreviousPrepStatus(prepClinicDto.getPreviousPrepStatus());
        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return clinicToClinicDto(prepClinicRepository.save(prepClinic), null);
    }

    private Object sanitizeJsonb(Object value) {
        if (value instanceof String && ((String) value).trim().isEmpty()) {
            return null;
        }
        return value;
    }

    private PrepClinic clinicDtoToClinic(PrepClinicDto prepClinicDto, String personUuid) {
        if (prepClinicDto == null) {
            return null;
        }
        PrepClinic prepClinic = new PrepClinic();
        prepClinic.setId(prepClinicDto.getId());
        prepClinic.setPersonUuid(personUuid);
        prepClinic.setDateInitialAdherenceCounseling(prepClinicDto.getDateInitialAdherenceCounseling());
        prepClinic.setWeight(prepClinicDto.getWeight());
        prepClinic.setHeight(prepClinicDto.getHeight());
        prepClinic.setFamilyPlanning(prepClinicDto.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning(prepClinicDto.getDateOfFamilyPlanning());
        prepClinic.setHtsEncounterUuid(prepClinicDto.getHtsEncounterUuid());
        prepClinic.setPrepDistributionSetting(prepClinicDto.getPrepDistributionSetting());
        prepClinic.setDateReferred(prepClinicDto.getDateReferred());
        prepClinic.setPrepEnrollmentUuid(prepClinicDto.getPrepEnrollmentUuid());
        prepClinic.setRegimenId(prepClinicDto.getRegimenId());
        prepClinic.setUrinalysisResult(prepClinicDto.getUrinalysisResult());
        prepClinic.setCreatinineResult(prepClinicDto.getCreatinineResult());
        prepClinic.setReferred(prepClinicDto.getReferred());
        prepClinic.setDateReferred(prepClinicDto.getDateReferred());
        prepClinic.setNextAppointment(prepClinicDto.getNextAppointment());
        prepClinic.setEncounterDate(prepClinicDto.getEncounterDate());
        prepClinic.setDatePrepStart(prepClinicDto.getDatePrepStart());
        prepClinic.setPulse(prepClinicDto.getPulse());
        prepClinic.setRespiratoryRate(prepClinicDto.getRespiratoryRate());
        prepClinic.setTemperature(prepClinicDto.getTemperature());
        prepClinic.setSystolic(prepClinicDto.getSystolic());
        prepClinic.setDiastolic(prepClinicDto.getDiastolic());
        prepClinic.setAdherenceLevel(prepClinicDto.getAdherenceLevel());
        prepClinic.setStiScreening(prepClinicDto.getStiScreening());
        prepClinic.setWhy(prepClinicDto.getWhy());
        prepClinic.setDatePrepGiven(prepClinicDto.getDatePrepGiven());
        prepClinic.setUrinalysis(sanitizeJsonb(prepClinicDto.getUrinalysis()));
        prepClinic.setCreatinine(sanitizeJsonb(prepClinicDto.getCreatinine()));
        prepClinic.setHepatitis(sanitizeJsonb(prepClinicDto.getHepatitis()));
        prepClinic.setSyphilis(sanitizeJsonb(prepClinicDto.getSyphilis()));
        prepClinic.setOtherTestsDone(sanitizeJsonb(prepClinicDto.getOtherTestsDone()));
        prepClinic.setSyndromicStiScreening(sanitizeJsonb(prepClinicDto.getSyndromicStiScreening()));
        prepClinic.setSyndromicScreening(prepClinicDto.getSyndromicScreening());
        prepClinic.setRiskReductionServices(prepClinicDto.getRiskReductionServices());
        prepClinic.setNotedSideEffects(prepClinicDto.getNotedSideEffects());
        prepClinic.setHealthCareWorkerSignature(prepClinicDto.getHealthCareWorkerSignature());
        prepClinic.setDuration(prepClinicDto.getDuration());
        prepClinic.setPrepGiven(prepClinicDto.getPrepGiven());
        prepClinic.setOtherDrugs(prepClinicDto.getOtherDrugs());
        prepClinic.setDateLiverFunctionTestResults(prepClinicDto.getDateLiverFunctionTestResults());
        prepClinic.setPrepType(prepClinicDto.getPrepType());
        prepClinic.setPopulationType(prepClinicDto.getPopulationType());
        prepClinic.setLiverFunctionTestResults(sanitizeJsonb(prepClinicDto.getLiverFunctionTestResults()));
        prepClinic.setPrepNotedSideEffects(sanitizeJsonb(prepClinicDto.getPrepNotedSideEffects()));
        prepClinic.setHistoryOfDrugToDrugInteraction(prepClinicDto.getHistoryOfDrugToDrugInteraction());
        prepClinic.setMonthsOfRefill(prepClinicDto.getMonthsOfRefill());
        prepClinic.setHistoryOfDrugAllergies(prepClinicDto.getHistoryOfDrugAllergies());
        prepClinic.setDateLiverFunctionTestResults(prepClinicDto.getDateLiverFunctionTestResults());
        prepClinic.setLiverFunctionTestResults(prepClinicDto.getLiverFunctionTestResults());
        prepClinic.setReasonForSwitch(prepClinicDto.getReasonForSwitch());
        prepClinic.setVisitType(prepClinicDto.getVisitType());
        prepClinic.setWasPrepAdministered(prepClinicDto.getWasPrepAdministered());
        prepClinic.setOtherPrepGiven(prepClinicDto.getOtherPrepGiven());
        prepClinic.setOtherPrepType(prepClinicDto.getOtherPrepType());
        prepClinic.setOtherRegimenId(prepClinicDto.getOtherRegimenId());
        prepClinic.setComment(prepClinicDto.getComment());
        prepClinic.setPreviousPrepStatus(prepClinicDto.getPreviousPrepStatus());
        prepClinic.setWhyAdherenceLevelPoor(prepClinicDto.getWhyAdherenceLevelPoor());
        prepClinic.setOtherReasonForPoorFairAdherence(prepClinicDto.getOtherReasonForPoorFairAdherence());
        prepClinic.setOtherNotedSideEffects(prepClinicDto.getOtherNotedSideEffects());
        prepClinic.setOtherSyndromicStiScreening(prepClinicDto.getOtherSyndromicStiScreening());
        return prepClinic;
    }

    private PrepClinic clinicRequestDtoToClinic(PrepClinicRequestDto prepClinicRequestDto, String personUuid) {
        if (prepClinicRequestDto == null) {
            return null;
        }
        PrepClinic prepClinic = new PrepClinic();
        prepClinic.setPersonUuid(personUuid);
        prepClinic.setDateInitialAdherenceCounseling(prepClinicRequestDto.getDateInitialAdherenceCounseling());
        prepClinic.setWeight(prepClinicRequestDto.getWeight());
        prepClinic.setHeight(prepClinicRequestDto.getHeight());
        prepClinic.setHtsEncounterUuid(prepClinicRequestDto.getHtsEncounterUuid());
        prepClinic.setPrepDistributionSetting(prepClinicRequestDto.getPrepDistributionSetting());
        prepClinic.setDateReferred(prepClinicRequestDto.getDateReferred());
        prepClinic.setPrepEnrollmentUuid(prepClinicRequestDto.getPrepEnrollmentUuid());
        prepClinic.setRegimenId(prepClinicRequestDto.getRegimenId());
        prepClinic.setUrinalysisResult(prepClinicRequestDto.getUrinalysisResult());
        prepClinic.setCreatinineResult(prepClinicRequestDto.getCreatinineResult());
        prepClinic.setReferred(prepClinicRequestDto.getReferred());
        prepClinic.setDateReferred(prepClinicRequestDto.getDateReferred());
        prepClinic.setNextAppointment(prepClinicRequestDto.getNextAppointment());
        prepClinic.setEncounterDate(prepClinicRequestDto.getEncounterDate());
        prepClinic.setFamilyPlanning(prepClinicRequestDto.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning(prepClinicRequestDto.getDateOfFamilyPlanning());
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
        prepClinic.setUrinalysis(sanitizeJsonb(prepClinicRequestDto.getUrinalysis()));
        prepClinic.setCreatinine(sanitizeJsonb(prepClinicRequestDto.getCreatinine()));
        prepClinic.setHepatitis(sanitizeJsonb(prepClinicRequestDto.getHepatitis()));
        prepClinic.setSyphilis(sanitizeJsonb(prepClinicRequestDto.getSyphilis()));
        prepClinic.setOtherTestsDone(sanitizeJsonb(prepClinicRequestDto.getOtherTestsDone()));
        prepClinic.setSyndromicStiScreening(sanitizeJsonb(prepClinicRequestDto.getSyndromicStiScreening()));
        prepClinic.setSyndromicScreening(prepClinicRequestDto.getSyndromicScreening());
        prepClinic.setRiskReductionServices(prepClinicRequestDto.getRiskReductionServices());
        prepClinic.setNotedSideEffects(prepClinicRequestDto.getNotedSideEffects());
        prepClinic.setHealthCareWorkerSignature(prepClinicRequestDto.getHealthCareWorkerSignature());
        prepClinic.setDuration(prepClinicRequestDto.getDuration());
        prepClinic.setPrepGiven(prepClinicRequestDto.getPrepGiven());
        prepClinic.setOtherDrugs(prepClinicRequestDto.getOtherDrugs());
        prepClinic.setDateLiverFunctionTestResults(prepClinicRequestDto.getDateLiverFunctionTestResults());
        prepClinic.setPrepType(prepClinicRequestDto.getPrepType());
        prepClinic.setPopulationType(prepClinicRequestDto.getPopulationType());
        prepClinic.setLiverFunctionTestResults(sanitizeJsonb(prepClinicRequestDto.getLiverFunctionTestResults()));
        prepClinic.setPrepNotedSideEffects(sanitizeJsonb(prepClinicRequestDto.getPrepNotedSideEffects()));
        prepClinic.setHistoryOfDrugToDrugInteraction(prepClinicRequestDto.getHistoryOfDrugToDrugInteraction());
        prepClinic.setMonthsOfRefill(prepClinicRequestDto.getMonthsOfRefill());
        prepClinic.setDateLiverFunctionTestResults(prepClinicRequestDto.getDateLiverFunctionTestResults());
        prepClinic.setLiverFunctionTestResults(prepClinicRequestDto.getLiverFunctionTestResults());
        prepClinic.setReasonForSwitch(prepClinicRequestDto.getReasonForSwitch());
        prepClinic.setWasPrepAdministered(prepClinicRequestDto.getWasPrepAdministered());
        prepClinic.setOtherPrepGiven(prepClinicRequestDto.getOtherPrepGiven());
        prepClinic.setOtherPrepType(prepClinicRequestDto.getOtherPrepType());
        prepClinic.setOtherRegimenId(prepClinicRequestDto.getOtherRegimenId());
        prepClinic.setComment(prepClinicRequestDto.getComment());
        prepClinic.setPreviousPrepStatus(prepClinicRequestDto.getPreviousPrepStatus());
        prepClinic.setVisitType(prepClinicRequestDto.getVisitType());
        prepClinic.setWhyAdherenceLevelPoor(prepClinicRequestDto.getWhyAdherenceLevelPoor());
        prepClinic.setOtherReasonForPoorFairAdherence(prepClinicRequestDto.getOtherReasonForPoorFairAdherence());
        prepClinic.setOtherNotedSideEffects(prepClinicRequestDto.getOtherNotedSideEffects());
        prepClinic.setOtherSyndromicStiScreening(prepClinicRequestDto.getOtherSyndromicStiScreening());
        return prepClinic;
    }

    private PrepClinicDto clinicToClinicDto(PrepClinic clinic, Boolean last) {
        if (clinic == null) {
            return null;
        }
        PrepClinicDto prepClinicDto = new PrepClinicDto();
        prepClinicDto.setId(clinic.getId());
        prepClinicDto.setDateInitialAdherenceCounseling(clinic.getDateInitialAdherenceCounseling());
        prepClinicDto.setWeight(clinic.getWeight());
        prepClinicDto.setHeight(clinic.getHeight());
        prepClinicDto.setHtsEncounterUuid(clinic.getHtsEncounterUuid());
        prepClinicDto.setPrepDistributionSetting(clinic.getPrepDistributionSetting());
        prepClinicDto.setDateOfFamilyPlanning(clinic.getDateOfFamilyPlanning());
        prepClinicDto.setFamilyPlanning(clinic.getFamilyPlanning());
        prepClinicDto.setVisitType(clinic.getVisitType());
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
        prepClinicDto.setSyndromicScreening(clinic.getSyndromicScreening());
        prepClinicDto.setRiskReductionServices(clinic.getRiskReductionServices());
        prepClinicDto.setNotedSideEffects(clinic.getNotedSideEffects());
        prepClinicDto.setHealthCareWorkerSignature(clinic.getHealthCareWorkerSignature());
        prepClinicDto.setDuration(clinic.getDuration());
        prepClinicDto.setPrepGiven(clinic.getPrepGiven());
        prepClinicDto.setOtherDrugs(clinic.getOtherDrugs());
        prepClinicDto.setDateLiverFunctionTestResults(clinic.getDateLiverFunctionTestResults());
        prepClinicDto.setPrepType(clinic.getPrepType());
        prepClinicDto.setPopulationType(clinic.getPopulationType());
        prepClinicDto.setLiverFunctionTestResults(clinic.getLiverFunctionTestResults());
        prepClinicDto.setPrepNotedSideEffects(clinic.getPrepNotedSideEffects());
        prepClinicDto.setHistoryOfDrugToDrugInteraction(clinic.getHistoryOfDrugToDrugInteraction());
        prepClinicDto.setMonthsOfRefill(clinic.getMonthsOfRefill());
        prepClinicDto.setHistoryOfDrugAllergies(clinic.getHistoryOfDrugAllergies());
        prepClinicDto.setDateLiverFunctionTestResults(clinic.getDateLiverFunctionTestResults());
        prepClinicDto.setLiverFunctionTestResults(clinic.getLiverFunctionTestResults());
        prepClinicDto.setReasonForSwitch(clinic.getReasonForSwitch());
        prepClinicDto.setWasPrepAdministered(clinic.getWasPrepAdministered());
        prepClinicDto.setOtherPrepGiven(clinic.getOtherPrepGiven());
        prepClinicDto.setOtherPrepType(clinic.getOtherPrepType());
        prepClinicDto.setOtherRegimenId(clinic.getOtherRegimenId());
        prepClinicDto.setComment(clinic.getComment());
        prepClinicDto.setPreviousPrepStatus(clinic.getPreviousPrepStatus());
        prepClinicDto.setWhyAdherenceLevelPoor(clinic.getWhyAdherenceLevelPoor());
        prepClinicDto.setOtherReasonForPoorFairAdherence(clinic.getOtherReasonForPoorFairAdherence());
        prepClinicDto.setOtherNotedSideEffects(clinic.getOtherNotedSideEffects());
        prepClinicDto.setOtherSyndromicStiScreening(clinic.getOtherSyndromicStiScreening());
        return prepClinicDto;
    }

    public PrepClinicDto getCommencementById(Long id) {
        PrepClinic prepClinic = prepClinicRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));

        return this.clinicToClinicDto(prepClinic, null);
    }

    public Boolean checkCabLaEligibility(Long id, LocalDate currentVisitDate) {
        //check if not in prepClinical record for visit
        Optional<Long> hasPrevisit = prepClinicRepository.checkHasClinicalVisit(id); // returns true
        if (!hasPrevisit.isPresent()) {
            return true; // return true with no clinical records
        } else {
            Boolean hasCabalin = prepClinicRepository.checkEnableCabaL(id, currentVisitDate); // has clinical records and has cab-lin as previous visit
            return hasCabalin; // true
        }
    }

    public List<PrepPreviousVisitHtsRecord> getPreviousHtsTesting(Long id) {
        List<PrepPreviousVisitHtsRecord> htsRecord = prepClinicRepository.getPreviousHtsRecord(id);
        return htsRecord;

    }

    public Date getCurrentDate() {
        return prepClinicRepository.getCurrentDate().orElse(null);
    }

    @Transactional
    public void updateLastEncounterPrevStatusByPersonUuid(String personUuid, String previousStatus) {
        prepClinicRepository.updateLastEncounterPrevStatusByPersonUuid(personUuid, previousStatus);
    }

    @Transactional
    public void updatePreviousStatusIfExists(String personUuid, String previousStatus) {
        int eligibleRecordCount = prepClinicRepository.countEligibleRecordsForUpdate(personUuid);
        if (eligibleRecordCount > 0) {
            updateLastEncounterPrevStatusByPersonUuid(personUuid, previousStatus);
        }
    }

    public boolean updateClinicByEligibility(
            LocalDate encounterDate,
            String personUuid,
            String visitType,
            String populationType,
            String liverFunctionTestResults,
            String reasonForSwitch,
            LocalDate dateOfLiverFunctionTestResults
    ) {
        int updated = prepClinicRepository.updateFirstPrepClinicMatchViaCte(
                encounterDate,
                personUuid,
                visitType,
                populationType,
                liverFunctionTestResults,
                reasonForSwitch,
                dateOfLiverFunctionTestResults
        );
        return updated == 1;
    }
}

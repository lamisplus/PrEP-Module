package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PepClinicDto;
import org.lamisplus.modules.prep.domain.dto.PepClinicRequestDto;
import org.lamisplus.modules.prep.domain.entity.PepClinic;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.lamisplus.modules.prep.repository.PepClinicRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PepClinicService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepEnrollmentRepository prepEnrollmentRepository;
    private final PepClinicRepository pepClinicRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PepClinicDto saveClinicVisit(PepClinicRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());

        String enrollmentUuid = requestDto.getPrepEnrollmentUuid();
        if (enrollmentUuid == null || enrollmentUuid.trim().isEmpty()) {
            PrepEnrollment enrollment = prepEnrollmentRepository
                    .findTopByPersonUuidAndArchived(person.getUuid(), UN_ARCHIVED)
                    .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "PersonUuid", person.getUuid()));
            enrollmentUuid = enrollment.getUuid();
            requestDto.setPrepEnrollmentUuid(enrollmentUuid);
        }
        final String finalEnrollmentUuid = enrollmentUuid;

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(finalEnrollmentUuid)
                .orElseThrow(() -> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", finalEnrollmentUuid));

        if (!prepEnrollment.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PepClinic.class, "Person not same enrolled", finalEnrollmentUuid);
        }

        pepClinicRepository.findByEncounterDateAndPersonUuidAndArchived(
                requestDto.getEncounterDate(), person.getUuid(), 0)
                .ifPresent(existing -> {
                    throw new RecordExistException(PepClinic.class, "Encounter date",
                            String.valueOf(requestDto.getEncounterDate()));
                });

        PepClinic pepClinic = requestDtoToEntity(requestDto, person.getUuid());
        pepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        pepClinic.setIsCommencement(false);

        pepClinic = pepClinicRepository.save(pepClinic);
        pepClinic.setPerson(person);
        return entityToDto(pepClinic);
    }

    public PepClinicDto getById(Long id) {
        PepClinic pepClinic = pepClinicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PepClinic.class, "id", String.valueOf(id)));
        return entityToDto(pepClinic);
    }

    public List<PepClinicDto> getByPersonId(Long personId) {
        Person person = getPerson(personId);
        List<PepClinic> pepClinics = pepClinicRepository
                .findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
                        person.getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(),
                        UN_ARCHIVED);
        return pepClinics.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public PepClinicDto update(Long id, PepClinicDto pepClinicDto) {
        PepClinic pepClinic = pepClinicRepository
                .findByIdAndFacilityIdAndArchived(id,
                        currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(() -> new EntityNotFoundException(PepClinic.class, "id", String.valueOf(id)));

        String uuid = pepClinic.getUuid();
        String enrollmentUuid = pepClinic.getPrepEnrollmentUuid();
        pepClinic = dtoToEntity(pepClinicDto, pepClinic.getPersonUuid());
        pepClinic.setArchived(UN_ARCHIVED);
        pepClinic.setId(id);
        pepClinic.setUuid(uuid);
        pepClinic.setPrepEnrollmentUuid(enrollmentUuid);
        pepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return entityToDto(pepClinicRepository.save(pepClinic));
    }

    public void delete(Long id) {
        PepClinic pepClinic = pepClinicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PepClinic.class, "id", String.valueOf(id)));
        pepClinic.setArchived(ARCHIVED);
        pepClinicRepository.save(pepClinic);
    }

    private PepClinic requestDtoToEntity(PepClinicRequestDto dto, String personUuid) {
        if (dto == null) return null;
        PepClinic entity = new PepClinic();
        entity.setPersonUuid(personUuid);
        entity.setExtra(dto.getExtra());
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPregnant(dto.getPregnant());
        entity.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());
        entity.setRegimenId(dto.getRegimenId());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setReferred(dto.getReferred());
        entity.setDateReferred(dto.getDateReferred());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setDatePrepStart(dto.getDatePrepStart());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setStiScreening(dto.getStiScreening());
        entity.setWhy(dto.getWhy());
        entity.setDatePrepGiven(dto.getDatePrepGiven());
        entity.setUrinalysis(dto.getUrinalysis());
        entity.setCreatinine(dto.getCreatinine());
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(dto.getHepatitis());
        entity.setSyphilis(dto.getSyphilis());
        entity.setOtherTestsDone(dto.getOtherTestsDone());
        entity.setSyndromicStiScreening(dto.getSyndromicStiScreening());
        entity.setSyndromicScreening(dto.getSyndromicScreening());
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setNotedSideEffects(dto.getNotedSideEffects());
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        entity.setDuration(dto.getDuration());
        entity.setPrepGiven(dto.getPrepGiven());
        entity.setOtherDrugs(dto.getOtherDrugs());
        entity.setHivTestResult(dto.getHivTestResult());
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        entity.setPrepNotedSideEffects(dto.getPrepNotedSideEffects());
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setHivTestResultDate(dto.getHivTestResultDate());
        entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
        entity.setVisitType(dto.getVisitType());
        entity.setComment(dto.getComment());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setModeOfExposure(dto.getModeOfExposure());
        entity.setDurationBeforePep(dto.getDurationBeforePep());
        entity.setHivStatusAtExposure(dto.getHivStatusAtExposure());
        entity.setPepNotedSideEffects(dto.getPepNotedSideEffects());
        entity.setOtherNotedSideEffects(dto.getOtherNotedSideEffects());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setPepRegimen(dto.getPepRegimen());
        entity.setOtherPepRegimen(dto.getOtherPepRegimen());
        entity.setDateStartPep(dto.getDateStartPep());
        entity.setDateStopPep(dto.getDateStopPep());
        entity.setFollowupHivTestResults(dto.getFollowupHivTestResults());
        return entity;
    }

    private PepClinic dtoToEntity(PepClinicDto dto, String personUuid) {
        if (dto == null) return null;
        PepClinic entity = new PepClinic();
        entity.setPersonUuid(personUuid);
        entity.setExtra(dto.getExtra());
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPregnant(dto.getPregnant());
        entity.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());
        entity.setRegimenId(dto.getRegimenId());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setReferred(dto.getReferred());
        entity.setDateReferred(dto.getDateReferred());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setDatePrepStart(dto.getDatePrepStart());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setStiScreening(dto.getStiScreening());
        entity.setWhy(dto.getWhy());
        entity.setDatePrepGiven(dto.getDatePrepGiven());
        entity.setUrinalysis(dto.getUrinalysis());
        entity.setCreatinine(dto.getCreatinine());
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(dto.getHepatitis());
        entity.setSyphilis(dto.getSyphilis());
        entity.setOtherTestsDone(dto.getOtherTestsDone());
        entity.setSyndromicStiScreening(dto.getSyndromicStiScreening());
        entity.setSyndromicScreening(dto.getSyndromicScreening());
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setNotedSideEffects(dto.getNotedSideEffects());
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        entity.setDuration(dto.getDuration());
        entity.setPrepGiven(dto.getPrepGiven());
        entity.setOtherDrugs(dto.getOtherDrugs());
        entity.setHivTestResult(dto.getHivTestResult());
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        entity.setPrepNotedSideEffects(dto.getPrepNotedSideEffects());
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setHivTestResultDate(dto.getHivTestResultDate());
        entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
        entity.setVisitType(dto.getVisitType());
        entity.setComment(dto.getComment());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setModeOfExposure(dto.getModeOfExposure());
        entity.setDurationBeforePep(dto.getDurationBeforePep());
        entity.setHivStatusAtExposure(dto.getHivStatusAtExposure());
        entity.setPepNotedSideEffects(dto.getPepNotedSideEffects());
        entity.setOtherNotedSideEffects(dto.getOtherNotedSideEffects());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setPepRegimen(dto.getPepRegimen());
        entity.setOtherPepRegimen(dto.getOtherPepRegimen());
        entity.setDateStartPep(dto.getDateStartPep());
        entity.setDateStopPep(dto.getDateStopPep());
        entity.setFollowupHivTestResults(dto.getFollowupHivTestResults());
        return entity;
    }

    private PepClinicDto entityToDto(PepClinic entity) {
        if (entity == null) return null;
        PepClinicDto dto = new PepClinicDto();
        dto.setId(entity.getId());
        dto.setExtra(entity.getExtra());
        dto.setDateInitialAdherenceCounseling(entity.getDateInitialAdherenceCounseling());
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setPregnant(entity.getPregnant());
        dto.setPrepEnrollmentUuid(entity.getPrepEnrollmentUuid());
        dto.setRegimenId(entity.getRegimenId());
        dto.setUrinalysisResult(entity.getUrinalysisResult());
        dto.setReferred(entity.getReferred());
        dto.setDateReferred(entity.getDateReferred());
        dto.setNextAppointment(entity.getNextAppointment());
        dto.setIsCommencement(entity.getIsCommencement());
        dto.setDatePrepStart(entity.getDatePrepStart());
        dto.setEncounterDate(entity.getEncounterDate());
        dto.setPulse(entity.getPulse());
        dto.setRespiratoryRate(entity.getRespiratoryRate());
        dto.setTemperature(entity.getTemperature());
        dto.setSystolic(entity.getSystolic());
        dto.setDiastolic(entity.getDiastolic());
        dto.setAdherenceLevel(entity.getAdherenceLevel());
        dto.setStiScreening(entity.getStiScreening());
        dto.setWhy(entity.getWhy());
        dto.setDatePrepGiven(entity.getDatePrepGiven());
        dto.setUrinalysis(entity.getUrinalysis());
        dto.setCreatinine(entity.getCreatinine());
        dto.setCreatinineResult(entity.getCreatinineResult());
        dto.setHepatitis(entity.getHepatitis());
        dto.setSyphilis(entity.getSyphilis());
        dto.setOtherTestsDone(entity.getOtherTestsDone());
        dto.setSyndromicStiScreening(entity.getSyndromicStiScreening());
        dto.setSyndromicScreening(entity.getSyndromicScreening());
        dto.setRiskReductionServices(entity.getRiskReductionServices());
        dto.setNotedSideEffects(entity.getNotedSideEffects());
        dto.setHealthCareWorkerSignature(entity.getHealthCareWorkerSignature());
        dto.setDuration(entity.getDuration());
        dto.setPrepGiven(entity.getPrepGiven());
        dto.setOtherDrugs(entity.getOtherDrugs());
        dto.setHivTestResult(entity.getHivTestResult());
        dto.setDateLiverFunctionTestResults(entity.getDateLiverFunctionTestResults());
        dto.setPrepType(entity.getPrepType());
        dto.setPopulationType(entity.getPopulationType());
        dto.setLiverFunctionTestResults(entity.getLiverFunctionTestResults());
        dto.setPrepNotedSideEffects(entity.getPrepNotedSideEffects());
        dto.setHistoryOfDrugToDrugInteraction(entity.getHistoryOfDrugToDrugInteraction());
        dto.setHivTestResultDate(entity.getHivTestResultDate());
        dto.setMonthsOfRefill(entity.getMonthsOfRefill());
        dto.setHistoryOfDrugAllergies(entity.getHistoryOfDrugAllergies());
        dto.setReasonForSwitch(entity.getReasonForSwitch());
        dto.setWasPrepAdministered(entity.getWasPrepAdministered());
        dto.setOtherPrepGiven(entity.getOtherPrepGiven());
        dto.setOtherPrepType(entity.getOtherPrepType());
        dto.setOtherRegimenId(entity.getOtherRegimenId());
        dto.setPrepDistributionSetting(entity.getPrepDistributionSetting());
        dto.setFamilyPlanning(entity.getFamilyPlanning());
        dto.setDateOfFamilyPlanning(entity.getDateOfFamilyPlanning());
        dto.setVisitType(entity.getVisitType());
        dto.setComment(entity.getComment());
        dto.setPreviousPrepStatus(entity.getPreviousPrepStatus());
        dto.setModeOfExposure(entity.getModeOfExposure());
        dto.setDurationBeforePep(entity.getDurationBeforePep());
        dto.setHivStatusAtExposure(entity.getHivStatusAtExposure());
        dto.setPepNotedSideEffects(entity.getPepNotedSideEffects());
        dto.setOtherNotedSideEffects(entity.getOtherNotedSideEffects());
        dto.setOtherSyndromicStiScreening(entity.getOtherSyndromicStiScreening());
        dto.setWhyAdherenceLevelPoor(entity.getWhyAdherenceLevelPoor());
        dto.setOtherReasonForPoorFairAdherence(entity.getOtherReasonForPoorFairAdherence());
        dto.setPepRegimen(entity.getPepRegimen());
        dto.setOtherPepRegimen(entity.getOtherPepRegimen());
        dto.setDateStartPep(entity.getDateStartPep());
        dto.setDateStopPep(entity.getDateStopPep());
        dto.setFollowupHivTestResults(entity.getFollowupHivTestResults());
        return dto;
    }
}

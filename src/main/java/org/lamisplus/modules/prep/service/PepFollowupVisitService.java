package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.controller.apierror.RecordExistException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PepFollowupVisitDto;
import org.lamisplus.modules.prep.domain.dto.PepFollowupVisitRequestDto;
import org.lamisplus.modules.prep.domain.entity.PepFollowupVisit;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.ARCHIVED;
import static org.lamisplus.modules.base.util.Constants.ArchiveStatus.UN_ARCHIVED;

@Service
@Slf4j
@RequiredArgsConstructor
public class PepFollowupVisitService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepPepInitiationRepository prepPepInitiationRepository;
    private final PepFollowupVisitRepository pepFollowupVisitRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PepFollowupVisitDto saveClinicVisit(PepFollowupVisitRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());

        // Always anchor to the patient's latest PEP initiation so prophylaxis_initiation_uuid
        // is correctly populated for every PEP follow-up.
        PrepPepInitiation initiation = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, "PEP")
                .orElseGet(() -> prepPepInitiationRepository
                        .findTopByPersonUuidAndArchived(person.getUuid(), false)
                        .orElseThrow(() -> new EntityNotFoundException(
                                PrepPepInitiation.class, "PersonUuid", person.getUuid())));
        String enrollmentUuid = initiation.getUuid();
        requestDto.setProphylaxisInitiationUuid(enrollmentUuid);

        if (!initiation.getPersonUuid().equals(person.getUuid())) {
            throw PrepErrors.personMismatch("PEP initiation");
        }

        pepFollowupVisitRepository.findByEncounterDateAndPersonUuidAndArchived(
                requestDto.getEncounterDate(), person.getUuid(), false)
                .ifPresent(existing -> {
                    throw PrepErrors.pepFollowupAlreadyExists(requestDto.getEncounterDate());
                });

        PepFollowupVisit entity = requestDtoToEntity(requestDto, person.getUuid());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setIsCommencement(false);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);

        entity = pepFollowupVisitRepository.save(entity);
        entity.setPerson(person);
        return entityToDto(entity);
    }

    public PepFollowupVisitDto getById(Long id) {
        PepFollowupVisit entity = pepFollowupVisitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PepFollowupVisit.class, "id", String.valueOf(id)));
        return entityToDto(entity);
    }

    public List<PepFollowupVisitDto> getByPersonId(Long personId) {
        Person person = getPerson(personId);
        List<PepFollowupVisit> list = pepFollowupVisitRepository
                .findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
                        person.getUuid(),
                        currentUserOrganizationService.getCurrentUserOrganization(),
                        false);
        return list.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public PepFollowupVisitDto update(Long id, PepFollowupVisitDto dto) {
        PepFollowupVisit entity = pepFollowupVisitRepository
                .findByIdAndFacilityIdAndArchived(id,
                        currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PepFollowupVisit.class, "id", String.valueOf(id)));

        String uuid = entity.getUuid();
        String enrollmentUuid = entity.getProphylaxisInitiationUuid();
        entity = dtoToEntity(dto, entity.getPersonUuid());
        entity.setArchived(false);
        entity.setId(id);
        entity.setUuid(uuid);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return entityToDto(pepFollowupVisitRepository.save(entity));
    }

    public void delete(Long id) {
        PepFollowupVisit entity = pepFollowupVisitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PepFollowupVisit.class, "id", String.valueOf(id)));
        entity.setArchived(true);
        pepFollowupVisitRepository.save(entity);
    }

    private Object sanitizeJsonb(Object value) {
        if (value instanceof String && ((String) value).trim().isEmpty()) {
            return null;
        }
        return value;
    }

    private PepFollowupVisit requestDtoToEntity(PepFollowupVisitRequestDto dto, String personUuid) {
        if (dto == null) return null;
        PepFollowupVisit entity = new PepFollowupVisit();
        entity.setPersonUuid(personUuid);
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPregnant(dto.getPregnant());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setModeOfExposure(dto.getModeOfExposure());
        entity.setDurationBeforePep(dto.getDurationBeforePep());
        entity.setHivStatusAtExposure(dto.getHivStatusAtExposure());
        entity.setPepNotedSideEffects(sanitizeJsonb(dto.getPepNotedSideEffects()));
        entity.setOtherNotedSideEffects(dto.getOtherNotedSideEffects());
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
        entity.setSyndromicScreening(dto.getSyndromicScreening());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setPepRegimen(dto.getPepRegimen());
        entity.setOtherPepRegimen(dto.getOtherPepRegimen());
        entity.setDateStartPep(dto.getDateStartPep());
        entity.setDateStopPep(dto.getDateStopPep());
        entity.setFollowupHivTestResults(sanitizeJsonb(dto.getFollowupHivTestResults()));
        entity.setHivTestResult(dto.getHivTestResult());
        entity.setHivTestResultDate(dto.getHivTestResultDate());
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setComment(dto.getComment());
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setCreatinine(sanitizeJsonb(dto.getCreatinine()));
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setRegimenId(dto.getRegimenId());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setReferred(dto.getReferred());
        entity.setDateReferred(dto.getDateReferred());
        entity.setDatePrepStart(dto.getDatePrepStart());
        entity.setDatePrepGiven(dto.getDatePrepGiven());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setStiScreening(dto.getStiScreening());
        entity.setWhy(dto.getWhy());
        entity.setNotedSideEffects(dto.getNotedSideEffects());
        entity.setDuration(dto.getDuration());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setVisitType(dto.getVisitType());
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setOtherDrugs(dto.getOtherDrugs());
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        return entity;
    }

    private PepFollowupVisit dtoToEntity(PepFollowupVisitDto dto, String personUuid) {
        if (dto == null) return null;
        PepFollowupVisit entity = new PepFollowupVisit();
        entity.setPersonUuid(personUuid);
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPregnant(dto.getPregnant());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setModeOfExposure(dto.getModeOfExposure());
        entity.setDurationBeforePep(dto.getDurationBeforePep());
        entity.setHivStatusAtExposure(dto.getHivStatusAtExposure());
        entity.setPepNotedSideEffects(sanitizeJsonb(dto.getPepNotedSideEffects()));
        entity.setOtherNotedSideEffects(dto.getOtherNotedSideEffects());
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
        entity.setSyndromicScreening(dto.getSyndromicScreening());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setPepRegimen(dto.getPepRegimen());
        entity.setOtherPepRegimen(dto.getOtherPepRegimen());
        entity.setDateStartPep(dto.getDateStartPep());
        entity.setDateStopPep(dto.getDateStopPep());
        entity.setFollowupHivTestResults(sanitizeJsonb(dto.getFollowupHivTestResults()));
        entity.setHivTestResult(dto.getHivTestResult());
        entity.setHivTestResultDate(dto.getHivTestResultDate());
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setComment(dto.getComment());
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setCreatinine(sanitizeJsonb(dto.getCreatinine()));
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setRegimenId(dto.getRegimenId());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setReferred(dto.getReferred());
        entity.setDateReferred(dto.getDateReferred());
        entity.setDatePrepStart(dto.getDatePrepStart());
        entity.setDatePrepGiven(dto.getDatePrepGiven());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setStiScreening(dto.getStiScreening());
        entity.setWhy(dto.getWhy());
        entity.setNotedSideEffects(dto.getNotedSideEffects());
        entity.setDuration(dto.getDuration());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setVisitType(dto.getVisitType());
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setOtherDrugs(dto.getOtherDrugs());
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        return entity;
    }

    private PepFollowupVisitDto entityToDto(PepFollowupVisit entity) {
        if (entity == null) return null;
        PepFollowupVisitDto dto = new PepFollowupVisitDto();
        dto.setId(entity.getId());
        dto.setProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
        dto.setIsCommencement(entity.getIsCommencement());
        dto.setEncounterDate(entity.getEncounterDate());
        dto.setNextAppointment(entity.getNextAppointment());
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setPregnant(entity.getPregnant());
        dto.setPulse(entity.getPulse());
        dto.setRespiratoryRate(entity.getRespiratoryRate());
        dto.setTemperature(entity.getTemperature());
        dto.setSystolic(entity.getSystolic());
        dto.setDiastolic(entity.getDiastolic());
        dto.setModeOfExposure(entity.getModeOfExposure());
        dto.setDurationBeforePep(entity.getDurationBeforePep());
        dto.setHivStatusAtExposure(entity.getHivStatusAtExposure());
        dto.setPepNotedSideEffects(entity.getPepNotedSideEffects());
        dto.setOtherNotedSideEffects(entity.getOtherNotedSideEffects());
        dto.setSyndromicStiScreening(entity.getSyndromicStiScreening());
        dto.setSyndromicScreening(entity.getSyndromicScreening());
        dto.setOtherSyndromicStiScreening(entity.getOtherSyndromicStiScreening());
        dto.setRiskReductionServices(entity.getRiskReductionServices());
        dto.setAdherenceLevel(entity.getAdherenceLevel());
        dto.setWhyAdherenceLevelPoor(entity.getWhyAdherenceLevelPoor());
        dto.setOtherReasonForPoorFairAdherence(entity.getOtherReasonForPoorFairAdherence());
        dto.setPepRegimen(entity.getPepRegimen());
        dto.setOtherPepRegimen(entity.getOtherPepRegimen());
        dto.setDateStartPep(entity.getDateStartPep());
        dto.setDateStopPep(entity.getDateStopPep());
        dto.setFollowupHivTestResults(entity.getFollowupHivTestResults());
        dto.setHivTestResult(entity.getHivTestResult());
        dto.setHivTestResultDate(entity.getHivTestResultDate());
        dto.setHealthCareWorkerSignature(entity.getHealthCareWorkerSignature());
        dto.setPreviousPrepStatus(entity.getPreviousPrepStatus());
        dto.setComment(entity.getComment());
        dto.setUrinalysis(entity.getUrinalysis());
        dto.setCreatinine(entity.getCreatinine());
        dto.setCreatinineResult(entity.getCreatinineResult());
        dto.setHepatitis(entity.getHepatitis());
        dto.setSyphilis(entity.getSyphilis());
        dto.setOtherTestsDone(entity.getOtherTestsDone());
        dto.setLiverFunctionTestResults(entity.getLiverFunctionTestResults());
        dto.setDateLiverFunctionTestResults(entity.getDateLiverFunctionTestResults());
        dto.setPrepNotedSideEffects(entity.getPrepNotedSideEffects());
        dto.setDateInitialAdherenceCounseling(entity.getDateInitialAdherenceCounseling());
        dto.setRegimenId(entity.getRegimenId());
        dto.setUrinalysisResult(entity.getUrinalysisResult());
        dto.setReferred(entity.getReferred());
        dto.setDateReferred(entity.getDateReferred());
        dto.setDatePrepStart(entity.getDatePrepStart());
        dto.setDatePrepGiven(entity.getDatePrepGiven());
        dto.setOtherPrepGiven(entity.getOtherPrepGiven());
        dto.setOtherPrepType(entity.getOtherPrepType());
        dto.setWasPrepAdministered(entity.getWasPrepAdministered());
        dto.setPrepDistributionSetting(entity.getPrepDistributionSetting());
        dto.setMonthsOfRefill(entity.getMonthsOfRefill());
        dto.setReasonForSwitch(entity.getReasonForSwitch());
        dto.setStiScreening(entity.getStiScreening());
        dto.setWhy(entity.getWhy());
        dto.setNotedSideEffects(entity.getNotedSideEffects());
        dto.setDuration(entity.getDuration());
        dto.setPrepType(entity.getPrepType());
        dto.setPopulationType(entity.getPopulationType());
        dto.setVisitType(entity.getVisitType());
        dto.setHistoryOfDrugToDrugInteraction(entity.getHistoryOfDrugToDrugInteraction());
        dto.setHistoryOfDrugAllergies(entity.getHistoryOfDrugAllergies());
        dto.setOtherDrugs(entity.getOtherDrugs());
        dto.setFamilyPlanning(entity.getFamilyPlanning());
        dto.setDateOfFamilyPlanning(entity.getDateOfFamilyPlanning());
        dto.setOtherRegimenId(entity.getOtherRegimenId());
        return dto;
    }
}

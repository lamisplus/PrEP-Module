package org.lamisplus.modules.prep.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.PrepFollowupVisitDto;
import org.lamisplus.modules.prep.domain.dto.PrepFollowupVisitRequestDto;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
import org.lamisplus.modules.prep.domain.entity.PrepFollowupVisit;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PrepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
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
public class PrepFollowupVisitService {
    private final PersonRepository personRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final PrepPepInitiationRepository prepPepInitiationRepository;
    private final PrepFollowupVisitRepository prepFollowupVisitRepository;
    private final ObjectMapper objectMapper;

    public Person getPerson(Long personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(Person.class, "id", String.valueOf(personId)));
    }

    public PrepFollowupVisitDto saveCommencement(PrepFollowupVisitRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());

        // Always anchor to the patient's latest PrEP initiation, ignoring whatever the
        // frontend sent. This guarantees prophylaxis_initiation_uuid is correct for every
        // PrEP follow-up visit even if the request payload omits it.
        PrepPepInitiation initiation = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, "PrEP")
                .orElseGet(() -> prepPepInitiationRepository
                        .findTopByPersonUuidAndArchived(person.getUuid(), false)
                        .orElseThrow(() -> new EntityNotFoundException(
                                PrepPepInitiation.class, "PersonUuid", person.getUuid())));
        String enrollmentUuid = initiation.getUuid();
        requestDto.setProphylaxisInitiationUuid(enrollmentUuid);

        if (!initiation.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepFollowupVisit.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepFollowupVisit entity = this.requestDtoToEntity(requestDto, person.getUuid());

        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setIsCommencement(true);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);
        entity = prepFollowupVisitRepository.save(entity);
        entity.setPerson(person);
        PrepFollowupVisitDto dto = this.entityToDto(entity, null);
        return dto;
    }

    public PrepFollowupVisitDto saveClinic(PrepFollowupVisitRequestDto requestDto) {
        Person person = this.getPerson(requestDto.getPersonId());

        // Same anchoring rule as saveCommencement.
        PrepPepInitiation initiation = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(person.getUuid(), false, "PrEP")
                .orElseGet(() -> prepPepInitiationRepository
                        .findTopByPersonUuidAndArchived(person.getUuid(), false)
                        .orElseThrow(() -> new EntityNotFoundException(
                                PrepPepInitiation.class, "PersonUuid", person.getUuid())));
        String enrollmentUuid = initiation.getUuid();
        requestDto.setProphylaxisInitiationUuid(enrollmentUuid);

        if (!initiation.getPersonUuid().equals(person.getUuid())) {
            throw new IllegalTypeException(PrepFollowupVisit.class, "Person not same enrolled", enrollmentUuid);
        }

        PrepFollowupVisit entity = this.requestDtoToEntity(requestDto, person.getUuid());

        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setIsCommencement(false);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);
        entity = prepFollowupVisitRepository.save(entity);
        entity.setPerson(person);
        PrepFollowupVisitDto dto = this.entityToDto(entity, null);
        return dto;
    }

    public void delete(Long id) {
        PrepFollowupVisit entity = prepFollowupVisitRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PrepFollowupVisit.class, "id", String.valueOf(id)));
        entity.setArchived(true);
        prepFollowupVisitRepository.save(entity);
    }

    public PrepFollowupVisitDto getById(Long id) {
        PrepFollowupVisit entity = prepFollowupVisitRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PrepFollowupVisit.class, "id", String.valueOf(id)));
        return entityToDto(entity, null);
    }

    public List<PrepFollowupVisitDto> getByPersonId(Long personId, Boolean isCommenced, Boolean last) {
        List<PrepFollowupVisit> list;
        if (!last) {
            list = prepFollowupVisitRepository
                    .findAllByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(getPerson(personId).getUuid(),
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            false, isCommenced);
        } else {
            list = prepFollowupVisitRepository
                    .findTopByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(getPerson(personId).getUuid(),
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            false, isCommenced);
        }
        return list.stream()
                .map(entity -> entityToDto(entity, last))
                .collect(Collectors.toList());
    }

    public PrepFollowupVisitDto update(Long id, PrepFollowupVisitDto dto) {
        PrepFollowupVisit entity = prepFollowupVisitRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepFollowupVisit.class, "id", String.valueOf(id)));
        String uuid = entity.getUuid();
        String enrollmentUuid = entity.getProphylaxisInitiationUuid();
        Boolean isCommencement = entity.getIsCommencement();
        entity = dtoToEntity(dto, entity.getPersonUuid());
        entity.setArchived(false);
        entity.setId(id);
        entity.setUuid(uuid);
        entity.setIsCommencement(isCommencement);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
        entity.setPregnant(dto.getPregnant());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return entityToDto(prepFollowupVisitRepository.save(entity), null);
    }

    public Boolean checkCabLaEligibility(Long id, LocalDate currentVisitDate) {
        Optional<Long> hasPrevisit = prepFollowupVisitRepository.checkHasClinicalVisit(id);
        if (!hasPrevisit.isPresent()) {
            return true;
        } else {
            Boolean hasCabalin = prepFollowupVisitRepository.checkEnableCabaL(id, currentVisitDate);
            return hasCabalin;
        }
    }

    public List<PrepPreviousVisitHtsRecord> getPreviousHtsTesting(Long id) {
        List<PrepPreviousVisitHtsRecord> htsRecord = prepFollowupVisitRepository.getPreviousHtsRecord(id);
        return htsRecord;
    }

    public Date getCurrentDate() {
        return prepFollowupVisitRepository.getCurrentDate().orElse(null);
    }

    @Transactional
    public void updateLastEncounterPrevStatusByPersonUuid(String personUuid, String previousStatus) {
        prepFollowupVisitRepository.updateLastEncounterPrevStatusByPersonUuid(personUuid, previousStatus);
    }

    @Transactional
    public void updatePreviousStatusIfExists(String personUuid, String previousStatus) {
        int eligibleRecordCount = prepFollowupVisitRepository.countEligibleRecordsForUpdate(personUuid);
        if (eligibleRecordCount > 0) {
            updateLastEncounterPrevStatusByPersonUuid(personUuid, previousStatus);
        }
    }

    private Object sanitizeJsonb(Object value) {
        if (value instanceof String && ((String) value).trim().isEmpty()) {
            return null;
        }
        return value;
    }

    private PrepFollowupVisit dtoToEntity(PrepFollowupVisitDto dto, String personUuid) {
        if (dto == null) {
            return null;
        }
        PrepFollowupVisit entity = new PrepFollowupVisit();
        entity.setId(dto.getId());
        entity.setPersonUuid(personUuid);
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
        entity.setPregnant(dto.getPregnant());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setDateReferred(dto.getDateReferred());
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
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
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setCreatinine(sanitizeJsonb(dto.getCreatinine()));
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
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
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setHivTestResultDate(dto.getHivTestResultDate());
        entity.setHistoryOfDrugAllergies(dto.getHistoryOfDrugAllergies());
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setVisitType(dto.getVisitType());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        entity.setComment(dto.getComment());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setOtherNotedSideEffects(dto.getOtherNotedSideEffects());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        return entity;
    }

    private PrepFollowupVisit requestDtoToEntity(PrepFollowupVisitRequestDto dto, String personUuid) {
        if (dto == null) {
            return null;
        }
        PrepFollowupVisit entity = new PrepFollowupVisit();
        entity.setPersonUuid(personUuid);
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPregnant(dto.getPregnant());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        entity.setDateReferred(dto.getDateReferred());
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        entity.setRegimenId(dto.getRegimenId());
        entity.setUrinalysisResult(dto.getUrinalysisResult());
        entity.setReferred(dto.getReferred());
        entity.setDateReferred(dto.getDateReferred());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setFamilyPlanning(dto.getFamilyPlanning());
        entity.setDateOfFamilyPlanning(dto.getDateOfFamilyPlanning());
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
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setCreatinine(sanitizeJsonb(dto.getCreatinine()));
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
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
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        entity.setHistoryOfDrugToDrugInteraction(dto.getHistoryOfDrugToDrugInteraction());
        entity.setHivTestResultDate(dto.getHivTestResultDate());
        entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setLiverFunctionTestResults(dto.getLiverFunctionTestResults());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        entity.setComment(dto.getComment());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setVisitType(dto.getVisitType());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setOtherNotedSideEffects(dto.getOtherNotedSideEffects());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        return entity;
    }

    private PrepFollowupVisitDto entityToDto(PrepFollowupVisit entity, Boolean last) {
        if (entity == null) {
            return null;
        }
        PrepFollowupVisitDto dto = new PrepFollowupVisitDto();
        dto.setId(entity.getId());
        dto.setDateInitialAdherenceCounseling(entity.getDateInitialAdherenceCounseling());
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setPregnant(entity.getPregnant());
        dto.setPrepDistributionSetting(entity.getPrepDistributionSetting());
        if (last != null && last) {
            dto.setVisitCount(prepFollowupVisitRepository.countAllByPersonUuid(entity.getPersonUuid()));
        }
        dto.setDateOfFamilyPlanning(entity.getDateOfFamilyPlanning());
        dto.setFamilyPlanning(entity.getFamilyPlanning());
        dto.setVisitType(entity.getVisitType());
        dto.setDateReferred(entity.getDateReferred());
        dto.setProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
        dto.setRegimenId(entity.getRegimenId());
        if (entity.getRegimenId() != null && entity.getRegimenId() != 0L && entity.getRegimen() != null) {
            dto.setRegimen(entity.getRegimen().getRegimen());
        }
        dto.setUrinalysisResult(entity.getUrinalysisResult());
        dto.setReferred(entity.getReferred());
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
        dto.setDateLiverFunctionTestResults(entity.getDateLiverFunctionTestResults());
        dto.setLiverFunctionTestResults(entity.getLiverFunctionTestResults());
        dto.setReasonForSwitch(entity.getReasonForSwitch());
        dto.setWasPrepAdministered(entity.getWasPrepAdministered());
        dto.setOtherPrepGiven(entity.getOtherPrepGiven());
        dto.setOtherPrepType(entity.getOtherPrepType());
        dto.setOtherRegimenId(entity.getOtherRegimenId());
        dto.setComment(entity.getComment());
        dto.setPreviousPrepStatus(entity.getPreviousPrepStatus());
        dto.setWhyAdherenceLevelPoor(entity.getWhyAdherenceLevelPoor());
        dto.setOtherReasonForPoorFairAdherence(entity.getOtherReasonForPoorFairAdherence());
        dto.setOtherNotedSideEffects(entity.getOtherNotedSideEffects());
        dto.setOtherSyndromicStiScreening(entity.getOtherSyndromicStiScreening());
        return dto;
    }

    public PrepFollowupVisitDto getCommencementById(Long id) {
        PrepFollowupVisit entity = prepFollowupVisitRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), false)
                .orElseThrow(() -> new EntityNotFoundException(PrepFollowupVisit.class, "id", String.valueOf(id)));

        return this.entityToDto(entity, null);
    }
}

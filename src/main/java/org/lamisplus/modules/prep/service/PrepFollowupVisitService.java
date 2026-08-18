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
import org.lamisplus.modules.prep.util.PrepErrors;
import org.lamisplus.modules.prep.domain.entity.PrepFollowupVisit;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PrepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.util.PrepRegimens;
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

    /** Prefer the stable person UUID over the bigint id when resolving for a write. */
    private Person resolvePersonForWrite(String personUuid, Long personId) {
        if (personUuid != null && !personUuid.trim().isEmpty()) {
            Optional<Person> byUuid = personRepository.findByUuidAndFacilityId(
                    personUuid, currentUserOrganizationService.getCurrentUserOrganization());
            if (byUuid.isPresent()) return byUuid.get();
        }
        return getPerson(personId);
    }

    /**
     * Application-level replacement for the dropped fk_prep_followup_initiation
     * foreign key (see updates.xml changeset 23-05-2026-drop-prep-followup-initiation-fk).
     * The DB no longer guards the prep_followup_visit -> prophylaxis_initiation
     * relation, so we enforce it here: the uuid must be present and resolve to
     * an existing initiation before any insert/update is persisted.
     */
    private void validateProphylaxisInitiationUuid(String prophylaxisInitiationUuid) {
        if (prophylaxisInitiationUuid == null || prophylaxisInitiationUuid.trim().isEmpty()
                || !prepPepInitiationRepository.findByUuid(prophylaxisInitiationUuid).isPresent()) {
            throw PrepErrors.invalidProphylaxisInitiation();
        }
    }

    public PrepFollowupVisitDto saveCommencement(PrepFollowupVisitRequestDto requestDto) {
        Person person = this.resolvePersonForWrite(requestDto.getPersonUuid(), requestDto.getPersonId());

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
            throw PrepErrors.personMismatch("PrEP initiation");
        }

        PrepFollowupVisit entity = this.requestDtoToEntity(requestDto, person.getUuid());

        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setIsCommencement(true);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);
        validateProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
        entity = prepFollowupVisitRepository.save(entity);
        entity.setPerson(person);
        PrepFollowupVisitDto dto = this.entityToDto(entity, null);
        return dto;
    }

    public PrepFollowupVisitDto saveClinic(PrepFollowupVisitRequestDto requestDto) {
        Person person = this.resolvePersonForWrite(requestDto.getPersonUuid(), requestDto.getPersonId());

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
            throw PrepErrors.personMismatch("PrEP initiation");
        }

        PrepFollowupVisit entity = this.requestDtoToEntity(requestDto, person.getUuid());

        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        entity.setIsCommencement(false);
        entity.setProphylaxisInitiationUuid(enrollmentUuid);
        validateProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
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

    public List<PrepFollowupVisitDto> getByPersonUuid(String personUuid, Boolean isCommenced, Boolean last) {
        // Keyed directly by person UUID (stable, always present on grid rows) so a
        // stale/absent bigint person id can no longer 404 this read.
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<PrepFollowupVisit> list;
        if (!last) {
            list = prepFollowupVisitRepository
                    .findAllByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(personUuid,
                            currentUserOrganizationService.getCurrentUserOrganization(),
                            false, isCommenced);
        } else {
            list = prepFollowupVisitRepository
                    .findTopByPersonUuidAndFacilityIdAndArchivedAndIsCommencementOrderByEncounterDateDesc(personUuid,
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
        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        validateProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
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
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        entity.setRegimenId(dto.getRegimenId());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setStiScreening(dto.getStiScreening());
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        // REPLACED BY refillDays. `duration` is still written because the status
        // SQL adds it to encounter_date as a DAY count
        // (PrepPepInitiationRepository.java:1634); feeding it days is what makes
        // the client statuses correct without rewriting that SQL.
        // entity.setDuration(dto.getDuration());
        entity.setDuration(dto.getRefillDays());
        entity.setOtherDrugs(dto.getOtherDrugs());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        // REPLACED BY refillDays. Refill supply is now captured in DAYS.
        // entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setRefillDays(dto.getRefillDays());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setVisitType(dto.getVisitType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
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
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        entity.setRegimenId(dto.getRegimenId());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setStiScreening(dto.getStiScreening());
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        // REPLACED BY refillDays. `duration` is still written because the status
        // SQL adds it to encounter_date as a DAY count
        // (PrepPepInitiationRepository.java:1634); feeding it days is what makes
        // the client statuses correct without rewriting that SQL.
        // entity.setDuration(dto.getDuration());
        entity.setDuration(dto.getRefillDays());
        entity.setOtherDrugs(dto.getOtherDrugs());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        // REPLACED BY refillDays. Refill supply is now captured in DAYS.
        // entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setRefillDays(dto.getRefillDays());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
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
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setHtsEncounterUuid(entity.getHtsEncounterUuid());
        if (last != null && last) {
            dto.setVisitCount(prepFollowupVisitRepository.countAllByPersonUuid(entity.getPersonUuid()));
        }
        dto.setVisitType(entity.getVisitType());
        dto.setProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
        dto.setRegimenId(entity.getRegimenId());
        // regimen_id is now a varchar holding the codeset code; resolve via
        // displayByCode first and fall back to displayById for any legacy
        // rows that survived migration as a stringified numeric id.
        String rawRegimen = entity.getRegimenId();
        if (rawRegimen != null && !rawRegimen.isEmpty()) {
            String display = PrepRegimens.displayByCode(rawRegimen);
            if (display == null || display.equals(rawRegimen)) {
                try {
                    display = PrepRegimens.displayById(Long.parseLong(rawRegimen));
                } catch (NumberFormatException ignored) {
                    display = null;
                }
            }
            if (display != null) {
                dto.setRegimen(display);
            }
        }
        dto.setNextAppointment(entity.getNextAppointment());
        dto.setIsCommencement(entity.getIsCommencement());
        dto.setEncounterDate(entity.getEncounterDate());
        dto.setPulse(entity.getPulse());
        dto.setRespiratoryRate(entity.getRespiratoryRate());
        dto.setTemperature(entity.getTemperature());
        dto.setSystolic(entity.getSystolic());
        dto.setDiastolic(entity.getDiastolic());
        dto.setAdherenceLevel(entity.getAdherenceLevel());
        dto.setStiScreening(entity.getStiScreening());
        dto.setUrinalysis(entity.getUrinalysis());
        dto.setHepatitis(entity.getHepatitis());
        dto.setSyphilis(entity.getSyphilis());
        dto.setOtherTestsDone(entity.getOtherTestsDone());
        dto.setLiverFunctionTestResults(entity.getLiverFunctionTestResults());
        dto.setDateLiverFunctionTestResults(entity.getDateLiverFunctionTestResults());
        dto.setSyndromicStiScreening(entity.getSyndromicStiScreening());
        dto.setRiskReductionServices(entity.getRiskReductionServices());
        dto.setHealthCareWorkerSignature(entity.getHealthCareWorkerSignature());
        dto.setDuration(entity.getDuration());
        dto.setOtherDrugs(entity.getOtherDrugs());
        dto.setPrepType(entity.getPrepType());
        dto.setPopulationType(entity.getPopulationType());
        dto.setPrepNotedSideEffects(entity.getPrepNotedSideEffects());
        // REPLACED BY refillDays.
        // dto.setMonthsOfRefill(entity.getMonthsOfRefill());
        dto.setRefillDays(entity.getRefillDays());
        dto.setReasonForSwitch(entity.getReasonForSwitch());
        dto.setOtherRegimenId(entity.getOtherRegimenId());
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

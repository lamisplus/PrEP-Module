package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.FollowupHtsResultDto;
import org.lamisplus.modules.prep.domain.dto.PepFollowupVisitDto;
import org.lamisplus.modules.prep.domain.dto.PepFollowupVisitRequestDto;
import org.lamisplus.modules.prep.domain.entity.FollowupHtsResult;
import org.lamisplus.modules.prep.domain.entity.PepFollowupVisit;
import org.lamisplus.modules.prep.domain.entity.PrepPepInitiation;
import org.lamisplus.modules.prep.repository.PepFollowupVisitRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.lamisplus.modules.prep.util.PrepErrors;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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

    /** Prefer the stable person UUID over the bigint id when resolving for a write. */
    private Person resolvePersonForWrite(String personUuid, Long personId) {
        if (personUuid != null && !personUuid.trim().isEmpty()) {
            java.util.Optional<Person> byUuid = personRepository.findByUuidAndFacilityId(
                    personUuid, currentUserOrganizationService.getCurrentUserOrganization());
            if (byUuid.isPresent()) return byUuid.get();
        }
        return getPerson(personId);
    }

    public PepFollowupVisitDto saveClinicVisit(PepFollowupVisitRequestDto requestDto) {
        Person person = this.resolvePersonForWrite(requestDto.getPersonUuid(), requestDto.getPersonId());

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

        // HTS ordering guard rails (a follow-up visit must occur AFTER initiation,
        // and each subsequent visit's HTS must be later than the previous one's):
        //   1. the selected HTS must be dated strictly after the PEP initiation;
        //   2. it must be dated strictly after the latest existing follow-up's HTS.
        // So the 1st follow-up result is the 1st HTS after initiation, the 2nd is
        // the next, and so on. Same-day or earlier HTS is rejected.
        String htsUuid = requestDto.getHtsEncounterUuid();
        if (htsUuid != null && !htsUuid.trim().isEmpty()) {
            java.sql.Date htsSqlDate = pepFollowupVisitRepository.findHtsVisitDate(htsUuid);
            java.time.LocalDate htsDate = htsSqlDate == null ? null : htsSqlDate.toLocalDate();
            if (htsDate != null) {
                java.time.LocalDate initiationDate = initiation.getDateEnrolled();
                if (initiationDate != null && !htsDate.isAfter(initiationDate)) {
                    throw PrepErrors.htsNotAfterInitiation(initiationDate);
                }
                java.sql.Date priorSql = pepFollowupVisitRepository.findLatestFollowupHtsDate(enrollmentUuid);
                java.time.LocalDate priorHtsDate = priorSql == null ? null : priorSql.toLocalDate();
                if (priorHtsDate != null && !htsDate.isAfter(priorHtsDate)) {
                    throw PrepErrors.htsNotAfterPreviousVisit(priorHtsDate);
                }
            }
        }

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

    public List<PepFollowupVisitDto> getByPersonUuid(String personUuid) {
        // Keyed by person UUID (stable on grid rows); avoids the bigint person-id
        // lookup that 404'd when the id was stale/absent.
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<PepFollowupVisit> list = pepFollowupVisitRepository
                .findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
                        personUuid,
                        currentUserOrganizationService.getCurrentUserOrganization(),
                        false);
        return list.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public PepFollowupVisitDto getLatestByEnrollmentType(String personUuid, String enrollmentType) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return null;
        }
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        if (enrollmentType == null || enrollmentType.trim().isEmpty()) {
            return pepFollowupVisitRepository
                    .findAllByPersonUuidAndFacilityIdAndArchivedOrderByEncounterDateDesc(
                            personUuid, facilityId, false)
                    .stream()
                    .findFirst()
                    .map(this::entityToDto)
                    .orElse(null);
        }
        return pepFollowupVisitRepository
                .findLatestByPersonUuidAndEnrollmentType(personUuid, facilityId, enrollmentType)
                .map(this::entityToDto)
                .orElse(null);
    }

    /**
     * The first three PEP follow-up visits after the patient's latest PEP
     * initiation, each carrying the HTS encounter used to resolve its HIV
     * result. Returned in chronological order and numbered 1..3. Fewer than
     * three entries means the remaining slots are still pending.
     */
    public List<FollowupHtsResultDto> getInitialFollowupHtsResults(String personUuid) {
        if (personUuid == null || personUuid.trim().isEmpty()) {
            return Collections.emptyList();
        }
        PrepPepInitiation initiation = prepPepInitiationRepository
                .findLatestByPersonUuidAndEnrollmentType(personUuid, false, EnrollmentType.PEP)
                .orElseGet(() -> prepPepInitiationRepository
                        .findTopByPersonUuidAndArchived(personUuid, false)
                        .orElse(null));
        if (initiation == null) {
            return Collections.emptyList();
        }
        List<FollowupHtsResult> rows = pepFollowupVisitRepository
                .findFirstThreeFollowupHtsResults(initiation.getUuid());
        List<FollowupHtsResultDto> result = new ArrayList<>();
        IntStream.range(0, rows.size()).forEach(i -> {
            FollowupHtsResult row = rows.get(i);
            result.add(FollowupHtsResultDto.builder()
                    .visitNumber(i + 1)
                    .followupId(row.getFollowupId())
                    .encounterDate(row.getEncounterDate())
                    .htsEncounterUuid(row.getHtsEncounterUuid())
                    .htsObservation(row.getHtsObservation())
                    .build());
        });
        return result;
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
        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setModeOfExposure(dto.getModeOfExposure());
        entity.setDurationBeforePep(dto.getDurationBeforePep());
        entity.setHivStatusAtExposure(dto.getHivStatusAtExposure());
        entity.setPepNotedSideEffects(sanitizeJsonb(dto.getPepNotedSideEffects()));
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
        entity.setSyndromicScreening(dto.getSyndromicScreening());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setPepRegimen(dto.getPepRegimen());
        entity.setDateStartPep(dto.getDateStartPep());
        entity.setDateStopPep(dto.getDateStopPep());
        entity.setFollowupHivTestResults(sanitizeJsonb(dto.getFollowupHivTestResults()));
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setRegimenId(dto.getRegimenId());
        entity.setDatePrepStart(dto.getDatePrepStart());
        entity.setDatePrepGiven(dto.getDatePrepGiven());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        // REPLACED BY refillDays. Refill supply is now captured in DAYS.
        // entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setRefillDays(dto.getRefillDays());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setStiScreening(dto.getStiScreening());
        // REPLACED BY refillDays. `duration` is still written because the status
        // SQL adds it to encounter_date as a DAY count
        // (PrepPepInitiationRepository.java:1634); feeding it days is what makes
        // the client statuses correct without rewriting that SQL.
        // entity.setDuration(dto.getDuration());
        entity.setDuration(dto.getRefillDays());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        return entity;
    }

    private PepFollowupVisit dtoToEntity(PepFollowupVisitDto dto, String personUuid) {
        if (dto == null) return null;
        PepFollowupVisit entity = new PepFollowupVisit();
        entity.setPersonUuid(personUuid);
        entity.setProphylaxisInitiationUuid(dto.getProphylaxisInitiationUuid());
        entity.setHtsEncounterUuid(dto.getHtsEncounterUuid());
        entity.setEncounterDate(dto.getEncounterDate());
        entity.setNextAppointment(dto.getNextAppointment());
        entity.setWeight(dto.getWeight());
        entity.setHeight(dto.getHeight());
        entity.setPulse(dto.getPulse());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setTemperature(dto.getTemperature());
        entity.setSystolic(dto.getSystolic());
        entity.setDiastolic(dto.getDiastolic());
        entity.setModeOfExposure(dto.getModeOfExposure());
        entity.setDurationBeforePep(dto.getDurationBeforePep());
        entity.setHivStatusAtExposure(dto.getHivStatusAtExposure());
        entity.setPepNotedSideEffects(sanitizeJsonb(dto.getPepNotedSideEffects()));
        entity.setSyndromicStiScreening(sanitizeJsonb(dto.getSyndromicStiScreening()));
        entity.setSyndromicScreening(dto.getSyndromicScreening());
        entity.setOtherSyndromicStiScreening(dto.getOtherSyndromicStiScreening());
        entity.setRiskReductionServices(dto.getRiskReductionServices());
        entity.setAdherenceLevel(dto.getAdherenceLevel());
        entity.setWhyAdherenceLevelPoor(dto.getWhyAdherenceLevelPoor());
        entity.setOtherReasonForPoorFairAdherence(dto.getOtherReasonForPoorFairAdherence());
        entity.setPepRegimen(dto.getPepRegimen());
        entity.setDateStartPep(dto.getDateStartPep());
        entity.setDateStopPep(dto.getDateStopPep());
        entity.setFollowupHivTestResults(sanitizeJsonb(dto.getFollowupHivTestResults()));
        entity.setHealthCareWorkerSignature(dto.getHealthCareWorkerSignature());
        entity.setPreviousPrepStatus(dto.getPreviousPrepStatus());
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setDateInitialAdherenceCounseling(dto.getDateInitialAdherenceCounseling());
        entity.setRegimenId(dto.getRegimenId());
        entity.setDatePrepStart(dto.getDatePrepStart());
        entity.setDatePrepGiven(dto.getDatePrepGiven());
        entity.setOtherPrepGiven(dto.getOtherPrepGiven());
        entity.setOtherPrepType(dto.getOtherPrepType());
        entity.setWasPrepAdministered(dto.getWasPrepAdministered());
        entity.setPrepDistributionSetting(dto.getPrepDistributionSetting());
        // REPLACED BY refillDays. Refill supply is now captured in DAYS.
        // entity.setMonthsOfRefill(dto.getMonthsOfRefill());
        entity.setRefillDays(dto.getRefillDays());
        entity.setReasonForSwitch(dto.getReasonForSwitch());
        entity.setStiScreening(dto.getStiScreening());
        // REPLACED BY refillDays. `duration` is still written because the status
        // SQL adds it to encounter_date as a DAY count
        // (PrepPepInitiationRepository.java:1634); feeding it days is what makes
        // the client statuses correct without rewriting that SQL.
        // entity.setDuration(dto.getDuration());
        entity.setDuration(dto.getRefillDays());
        entity.setPrepType(dto.getPrepType());
        entity.setPopulationType(dto.getPopulationType());
        entity.setOtherRegimenId(dto.getOtherRegimenId());
        return entity;
    }

    private PepFollowupVisitDto entityToDto(PepFollowupVisit entity) {
        if (entity == null) return null;
        PepFollowupVisitDto dto = new PepFollowupVisitDto();
        dto.setId(entity.getId());
        dto.setProphylaxisInitiationUuid(entity.getProphylaxisInitiationUuid());
        dto.setHtsEncounterUuid(entity.getHtsEncounterUuid());
        dto.setIsCommencement(entity.getIsCommencement());
        dto.setEncounterDate(entity.getEncounterDate());
        dto.setNextAppointment(entity.getNextAppointment());
        dto.setWeight(entity.getWeight());
        dto.setHeight(entity.getHeight());
        dto.setPulse(entity.getPulse());
        dto.setRespiratoryRate(entity.getRespiratoryRate());
        dto.setTemperature(entity.getTemperature());
        dto.setSystolic(entity.getSystolic());
        dto.setDiastolic(entity.getDiastolic());
        dto.setModeOfExposure(entity.getModeOfExposure());
        dto.setDurationBeforePep(entity.getDurationBeforePep());
        dto.setHivStatusAtExposure(entity.getHivStatusAtExposure());
        dto.setPepNotedSideEffects(entity.getPepNotedSideEffects());
        dto.setSyndromicStiScreening(entity.getSyndromicStiScreening());
        dto.setSyndromicScreening(entity.getSyndromicScreening());
        dto.setOtherSyndromicStiScreening(entity.getOtherSyndromicStiScreening());
        dto.setRiskReductionServices(entity.getRiskReductionServices());
        dto.setAdherenceLevel(entity.getAdherenceLevel());
        dto.setWhyAdherenceLevelPoor(entity.getWhyAdherenceLevelPoor());
        dto.setOtherReasonForPoorFairAdherence(entity.getOtherReasonForPoorFairAdherence());
        dto.setPepRegimen(entity.getPepRegimen());
        dto.setDateStartPep(entity.getDateStartPep());
        dto.setDateStopPep(entity.getDateStopPep());
        dto.setFollowupHivTestResults(entity.getFollowupHivTestResults());
        dto.setHealthCareWorkerSignature(entity.getHealthCareWorkerSignature());
        dto.setPreviousPrepStatus(entity.getPreviousPrepStatus());
        dto.setUrinalysis(entity.getUrinalysis());
        dto.setDateInitialAdherenceCounseling(entity.getDateInitialAdherenceCounseling());
        dto.setRegimenId(entity.getRegimenId());
        dto.setDatePrepStart(entity.getDatePrepStart());
        dto.setDatePrepGiven(entity.getDatePrepGiven());
        dto.setOtherPrepGiven(entity.getOtherPrepGiven());
        dto.setOtherPrepType(entity.getOtherPrepType());
        dto.setWasPrepAdministered(entity.getWasPrepAdministered());
        dto.setPrepDistributionSetting(entity.getPrepDistributionSetting());
        // REPLACED BY refillDays.
        // dto.setMonthsOfRefill(entity.getMonthsOfRefill());
        dto.setRefillDays(entity.getRefillDays());
        dto.setReasonForSwitch(entity.getReasonForSwitch());
        dto.setStiScreening(entity.getStiScreening());
        dto.setDuration(entity.getDuration());
        dto.setPrepType(entity.getPrepType());
        dto.setPopulationType(entity.getPopulationType());
        dto.setOtherRegimenId(entity.getOtherRegimenId());
        return dto;
    }
}

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

    private Object sanitizeJsonb(Object value) {
        if (value instanceof String && ((String) value).trim().isEmpty()) {
            return null;
        }
        return value;
    }

    private PepClinic requestDtoToEntity(PepClinicRequestDto dto, String personUuid) {
        if (dto == null) return null;
        PepClinic entity = new PepClinic();
        entity.setPersonUuid(personUuid);
        entity.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());
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
        entity.setExtra(sanitizeJsonb(dto.getExtra()));
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setCreatinine(sanitizeJsonb(dto.getCreatinine()));
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        return entity;
    }

    private PepClinic dtoToEntity(PepClinicDto dto, String personUuid) {
        if (dto == null) return null;
        PepClinic entity = new PepClinic();
        entity.setPersonUuid(personUuid);
        entity.setPrepEnrollmentUuid(dto.getPrepEnrollmentUuid());
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
        entity.setExtra(sanitizeJsonb(dto.getExtra()));
        entity.setUrinalysis(sanitizeJsonb(dto.getUrinalysis()));
        entity.setCreatinine(sanitizeJsonb(dto.getCreatinine()));
        entity.setCreatinineResult(dto.getCreatinineResult());
        entity.setHepatitis(sanitizeJsonb(dto.getHepatitis()));
        entity.setSyphilis(sanitizeJsonb(dto.getSyphilis()));
        entity.setOtherTestsDone(sanitizeJsonb(dto.getOtherTestsDone()));
        entity.setLiverFunctionTestResults(sanitizeJsonb(dto.getLiverFunctionTestResults()));
        entity.setDateLiverFunctionTestResults(dto.getDateLiverFunctionTestResults());
        entity.setPrepNotedSideEffects(sanitizeJsonb(dto.getPrepNotedSideEffects()));
        return entity;
    }

    private PepClinicDto entityToDto(PepClinic entity) {
        if (entity == null) return null;
        PepClinicDto dto = new PepClinicDto();
        dto.setId(entity.getId());
        dto.setPrepEnrollmentUuid(entity.getPrepEnrollmentUuid());
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
        dto.setExtra(entity.getExtra());
        dto.setUrinalysis(entity.getUrinalysis());
        dto.setCreatinine(entity.getCreatinine());
        dto.setCreatinineResult(entity.getCreatinineResult());
        dto.setHepatitis(entity.getHepatitis());
        dto.setSyphilis(entity.getSyphilis());
        dto.setOtherTestsDone(entity.getOtherTestsDone());
        dto.setLiverFunctionTestResults(entity.getLiverFunctionTestResults());
        dto.setDateLiverFunctionTestResults(entity.getDateLiverFunctionTestResults());
        dto.setPrepNotedSideEffects(entity.getPrepNotedSideEffects());
        return dto;
    }
}

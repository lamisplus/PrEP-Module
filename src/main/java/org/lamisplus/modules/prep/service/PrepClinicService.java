package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.controller.apierror.EntityNotFoundException;
import org.lamisplus.modules.base.controller.apierror.IllegalTypeException;
import org.lamisplus.modules.base.module.ModuleService;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.patient.repository.VisitRepository;
import org.lamisplus.modules.patient.service.PersonService;
import org.lamisplus.modules.patient.service.VisitService;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.domain.entity.*;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.repository.PrepEligibilityRepository;
import org.lamisplus.modules.prep.repository.PrepEnrollmentRepository;
import org.lamisplus.modules.prep.repository.PrepInterruptionRepository;
import org.springframework.stereotype.Service;

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

    private final VisitService visitService;
    private final VisitRepository visitRepository;
    private final PrepClinicRepository prepClinicRepository;
    private final PatientActivityService patientActivityService;

    private ModuleService moduleService;

    private PrepInterruptionRepository prepInterruptionRepository;

    public Person getPerson(Long personId) {
        return personRepository.findById (personId)
                .orElseThrow (() -> new EntityNotFoundException(Person.class, "id", String.valueOf (personId)));
    }

    public PrepClinicDto saveCommencement (PrepClinicRequestDto commencementRequestDto){
        String enrollmentUuid = commencementRequestDto.getPrepEnrollmentUuid();

        Person person = this.getPerson(commencementRequestDto.getPersonId());

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(enrollmentUuid)
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", enrollmentUuid));

        if(!prepEnrollment.getPersonUuid().equals(person.getUuid())){
            throw new IllegalTypeException(PrepClinic.class, "Person not same enrolled", enrollmentUuid);
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

    public PrepClinicDto saveClinic (PrepClinicRequestDto clinicRequestDto){
        String enrollmentUuid = clinicRequestDto.getPrepEnrollmentUuid();

        Person person = this.getPerson(clinicRequestDto.getPersonId());

        PrepEnrollment prepEnrollment = this.prepEnrollmentRepository.findByUuid(enrollmentUuid)
                .orElseThrow(()-> new EntityNotFoundException(PrepEnrollment.class, "Enrollment", enrollmentUuid));

        if(!prepEnrollment.getPersonUuid().equals(person.getUuid())){
            throw new IllegalTypeException(PrepClinic.class, "Person not same enrolled", enrollmentUuid);
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

    public void delete(Long id){
        PrepClinic prepClinic = prepClinicRepository
                .findById(id)
                .orElseThrow(()-> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));
        prepClinic.setArchived(ARCHIVED);
        prepClinicRepository.save(prepClinic);
    }

    public PrepClinicDto getPrepClinicById(Long id){
        PrepClinic prepClinic = prepClinicRepository
                .findById(id)
                .orElseThrow(()-> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));
        return clinicToClinicDto(prepClinic, null);
    }

    public List<PrepClinicDto> getPrepClinicByPersonId(Long personId, Boolean isCommenced, Boolean last){
        List<PrepClinic> prepClinics;
        if(!last) {
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

    public PrepClinicDto update(Long id, PrepClinicDto prepClinicDto){
        PrepClinic prepClinic = prepClinicRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService.getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow(()-> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf(id)));
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
        prepClinic.setPregnant(prepClinicDto.getPregnant());
        prepClinic.setPrepDistributionSetting(prepClinicDto.getPrepDistributionSetting());
        prepClinic.setFacilityId(currentUserOrganizationService.getCurrentUserOrganization());
        return clinicToClinicDto(prepClinicRepository.save(prepClinic), null);
    }

    private PrepClinic clinicDtoToClinic(PrepClinicDto prepClinicDto, String personUuid) {
        if ( prepClinicDto == null ) {
            return null;
        }

        PrepClinic prepClinic = new PrepClinic();

        prepClinic.setId(prepClinicDto.getId());
        prepClinic.setPersonUuid( personUuid);
        prepClinic.setExtra( prepClinicDto.getExtra() );
        prepClinic.setDateInitialAdherenceCounseling( prepClinicDto.getDateInitialAdherenceCounseling() );
        prepClinic.setWeight( prepClinicDto.getWeight() );
        prepClinic.setHeight( prepClinicDto.getHeight() );
        prepClinic.setFamilyPlanning( prepClinicDto.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning( prepClinicDto.getDateOfFamilyPlanning());
        prepClinic.setPregnant( prepClinicDto.getPregnant() );
        prepClinic.setPrepDistributionSetting( prepClinicDto.getPrepDistributionSetting() );

        prepClinic.setDateReferred( prepClinicDto.getDateReferred() );
        prepClinic.setPrepEnrollmentUuid( prepClinicDto.getPrepEnrollmentUuid() );
        prepClinic.setRegimenId( prepClinicDto.getRegimenId() );
        prepClinic.setUrinalysisResult( prepClinicDto.getUrinalysisResult() );
        prepClinic.setReferred( prepClinicDto.getReferred() );

        prepClinic.setDateReferred( prepClinicDto.getDateReferred() );
        prepClinic.setNextAppointment( prepClinicDto.getNextAppointment() );
        prepClinic.setEncounterDate( prepClinicDto.getEncounterDate() );
        prepClinic.setExtra( prepClinicDto.getExtra() );

        prepClinic.setDatePrepStart( prepClinicDto.getDatePrepStart());
        //Clinic
        prepClinic.setPulse( prepClinicDto.getPulse());
        prepClinic.setRespiratoryRate( prepClinicDto.getRespiratoryRate());
        prepClinic.setTemperature( prepClinicDto.getTemperature());
        prepClinic.setSystolic( prepClinicDto.getSystolic());
        prepClinic.setDiastolic( prepClinicDto.getDiastolic());
        prepClinic.setAdherenceLevel( prepClinicDto.getAdherenceLevel());
        prepClinic.setStiScreening( prepClinicDto.getStiScreening());

        prepClinic.setWhy( prepClinicDto.getWhy());
        prepClinic.setDatePrepGiven( prepClinicDto.getDatePrepGiven());
        prepClinic.setUrinalysis( prepClinicDto.getUrinalysis());
        prepClinic.setHepatitis( prepClinicDto.getHepatitis());
        prepClinic.setSyphilis( prepClinicDto.getSyphilis());
        prepClinic.setOtherTestsDone( prepClinicDto.getOtherTestsDone());
        prepClinic.setSyndromicStiScreening( prepClinicDto.getSyndromicStiScreening());

        prepClinic.setRiskReductionServices( prepClinicDto.getRiskReductionServices());
        prepClinic.setNotedSideEffects( prepClinicDto.getNotedSideEffects());
        prepClinic.setHealthCareWorkerSignature( prepClinicDto.getHealthCareWorkerSignature());


        prepClinic.setDuration( prepClinicDto.getDuration());

        prepClinic.setPrepGiven( prepClinicDto.getPrepGiven());
        prepClinic.setOtherDrugs( prepClinicDto.getOtherDrugs());
        prepClinic.setHivTestResult( prepClinicDto.getHivTestResult());

        prepClinic.setDateLiverFunctionTestResults(prepClinicDto.getDateLiverFunctionTestResults());
        prepClinic.setPrepType(prepClinicDto.getPrepType());
        prepClinic.setPopulationType(prepClinicDto.getPopulationType());
        prepClinic.setLiverFunctionTestResults(prepClinicDto.getLiverFunctionTestResults());
        prepClinic.setHistoryOfDrugToDrugInteraction(prepClinicDto.getHistoryOfDrugToDrugInteraction());
        prepClinic.setMonthsOfRefill(prepClinicDto.getMonthsOfRefill());
        prepClinic.setHivTestResultDate(prepClinicDto.getHivTestResultDate());
        prepClinic.setHistoryOfDrugAllergies(prepClinicDto.getHistoryOfDrugAllergies());

        return prepClinic;
    }

    private PrepClinic clinicRequestDtoToClinic(PrepClinicRequestDto prepClinicRequestDto, String personUuid) {
        if ( prepClinicRequestDto == null ) {
            return null;
        }

        PrepClinic prepClinic = new PrepClinic();

        prepClinic.setPersonUuid( personUuid);
        prepClinic.setExtra( prepClinicRequestDto.getExtra() );
        prepClinic.setDateInitialAdherenceCounseling( prepClinicRequestDto.getDateInitialAdherenceCounseling() );
        prepClinic.setWeight( prepClinicRequestDto.getWeight() );
        prepClinic.setHeight( prepClinicRequestDto.getHeight() );
        prepClinic.setPregnant( prepClinicRequestDto.getPregnant() );
        prepClinic.setPrepDistributionSetting( prepClinicRequestDto.getPrepDistributionSetting());

        prepClinic.setDateReferred( prepClinicRequestDto.getDateReferred() );
        prepClinic.setPrepEnrollmentUuid( prepClinicRequestDto.getPrepEnrollmentUuid() );
        prepClinic.setRegimenId( prepClinicRequestDto.getRegimenId() );
        prepClinic.setUrinalysisResult( prepClinicRequestDto.getUrinalysisResult() );
        prepClinic.setReferred( prepClinicRequestDto.getReferred() );

        prepClinic.setDateReferred( prepClinicRequestDto.getDateReferred() );
        prepClinic.setNextAppointment( prepClinicRequestDto.getNextAppointment() );
        prepClinic.setEncounterDate( prepClinicRequestDto.getEncounterDate() );
        prepClinic.setExtra( prepClinicRequestDto.getExtra() );
        prepClinic.setFamilyPlanning(prepClinic.getFamilyPlanning());
        prepClinic.setDateOfFamilyPlanning(prepClinic.getDateOfFamilyPlanning());

        prepClinic.setDatePrepStart( prepClinicRequestDto.getDatePrepStart());
        //Clinic
        prepClinic.setPulse( prepClinicRequestDto.getPulse());
        prepClinic.setRespiratoryRate( prepClinicRequestDto.getRespiratoryRate());
        prepClinic.setTemperature( prepClinicRequestDto.getTemperature());
        prepClinic.setSystolic( prepClinicRequestDto.getSystolic());
        prepClinic.setDiastolic( prepClinicRequestDto.getDiastolic());
        prepClinic.setAdherenceLevel( prepClinicRequestDto.getAdherenceLevel());
        prepClinic.setStiScreening( prepClinicRequestDto.getStiScreening());

        prepClinic.setWhy( prepClinicRequestDto.getWhy());
        prepClinic.setDatePrepGiven( prepClinicRequestDto.getDatePrepGiven());
        prepClinic.setUrinalysis( prepClinicRequestDto.getUrinalysis());
        prepClinic.setHepatitis( prepClinicRequestDto.getHepatitis());
        prepClinic.setSyphilis( prepClinicRequestDto.getSyphilis());
        prepClinic.setOtherTestsDone( prepClinicRequestDto.getOtherTestsDone());
        prepClinic.setSyndromicStiScreening( prepClinicRequestDto.getSyndromicStiScreening());

        prepClinic.setRiskReductionServices( prepClinicRequestDto.getRiskReductionServices());
        prepClinic.setNotedSideEffects( prepClinicRequestDto.getNotedSideEffects());
        prepClinic.setHealthCareWorkerSignature( prepClinicRequestDto.getHealthCareWorkerSignature());

        prepClinic.setDuration( prepClinicRequestDto.getDuration());

        prepClinic.setPrepGiven( prepClinicRequestDto.getHivTestResult());
        prepClinic.setOtherDrugs( prepClinicRequestDto.getOtherDrugs());
        prepClinic.setHivTestResult( prepClinicRequestDto.getHivTestResult());
        prepClinic.setDateLiverFunctionTestResults(prepClinicRequestDto.getDateLiverFunctionTestResults());
        prepClinic.setPrepType(prepClinicRequestDto.getPrepType());
        prepClinic.setPopulationType(prepClinicRequestDto.getPopulationType());
        prepClinic.setLiverFunctionTestResults(prepClinicRequestDto.getLiverFunctionTestResults());
        prepClinic.setHistoryOfDrugToDrugInteraction(prepClinicRequestDto.getHistoryOfDrugToDrugInteraction());
        prepClinic.setHivTestResultDate(prepClinicRequestDto.getHivTestResultDate());
        prepClinic.setMonthsOfRefill(prepClinicRequestDto.getMonthsOfRefill());

        return prepClinic;
    }
    private PrepClinicDto clinicToClinicDto(PrepClinic clinic, Boolean last) {
        if ( clinic == null ) {
            return null;
        }

        PrepClinicDto prepClinicDto = new PrepClinicDto();

        prepClinicDto.setId( clinic.getId());
        prepClinicDto.setExtra( clinic.getExtra() );
        prepClinicDto.setDateInitialAdherenceCounseling( clinic.getDateInitialAdherenceCounseling() );
        prepClinicDto.setWeight( clinic.getWeight() );
        prepClinicDto.setHeight( clinic.getHeight() );
        prepClinicDto.setPregnant( clinic.getPregnant() );
        prepClinicDto.setPrepDistributionSetting( clinic.getPrepDistributionSetting() );
        if(last != null && last){
            prepClinicDto.setVisitCount(prepClinicRepository.countAllByPersonUuid(clinic.getPersonUuid()));
        }
        prepClinicDto.setDateOfFamilyPlanning(clinic.getDateOfFamilyPlanning());
        prepClinicDto.setFamilyPlanning(clinic.getFamilyPlanning());

        prepClinicDto.setVisitType(clinic.getVisitType());
        prepClinicDto.setFamilyPlanning(clinic.getFamilyPlanning());

        prepClinicDto.setDateReferred( clinic.getDateReferred() );
        prepClinicDto.setPrepEnrollmentUuid( clinic.getPrepEnrollmentUuid() );
        prepClinicDto.setRegimenId( clinic.getRegimenId() );
        if(clinic.getRegimenId() != 0L && clinic.getRegimen() != null){
            prepClinicDto.setRegimen(clinic.getRegimen().getRegimen());
        }
        prepClinicDto.setUrinalysisResult( clinic.getUrinalysisResult() );
        prepClinicDto.setReferred( clinic.getReferred() );
        prepClinicDto.setNextAppointment( clinic.getNextAppointment() );

        prepClinicDto.setIsCommencement(clinic.getIsCommencement());
        prepClinicDto.setDatePrepStart( clinic.getDatePrepStart());
        prepClinicDto.setEncounterDate( clinic.getEncounterDate());
        //For clinic
        prepClinicDto.setPulse( clinic.getPulse());
        prepClinicDto.setRespiratoryRate( clinic.getRespiratoryRate());
        prepClinicDto.setTemperature( clinic.getTemperature());
        prepClinicDto.setSystolic( clinic.getSystolic());
        prepClinicDto.setDiastolic( clinic.getDiastolic());
        prepClinicDto.setAdherenceLevel( clinic.getAdherenceLevel());
        prepClinicDto.setStiScreening( clinic.getStiScreening());

        prepClinicDto.setWhy( clinic.getWhy());
        prepClinicDto.setDatePrepGiven( clinic.getDatePrepGiven());
        prepClinicDto.setUrinalysis( clinic.getUrinalysis());
        prepClinicDto.setHepatitis( clinic.getHepatitis());
        prepClinicDto.setSyphilis( clinic.getSyphilis());
        prepClinicDto.setOtherTestsDone( clinic.getOtherTestsDone());
        prepClinicDto.setSyndromicStiScreening( clinic.getSyndromicStiScreening());

        prepClinicDto.setRiskReductionServices( clinic.getRiskReductionServices());
        prepClinicDto.setNotedSideEffects( clinic.getNotedSideEffects());
        prepClinicDto.setHealthCareWorkerSignature( clinic.getHealthCareWorkerSignature());

        prepClinicDto.setDuration( clinic.getDuration());

        prepClinicDto.setPrepGiven( clinic.getHivTestResult());
        prepClinicDto.setOtherDrugs( clinic.getOtherDrugs());
        prepClinicDto.setHivTestResult( clinic.getHivTestResult());

        prepClinicDto.setDateLiverFunctionTestResults(clinic.getDateLiverFunctionTestResults());
        prepClinicDto.setPrepType(clinic.getPrepType());
        prepClinicDto.setPopulationType(clinic.getPopulationType());
        prepClinicDto.setLiverFunctionTestResults(clinic.getLiverFunctionTestResults());
        prepClinicDto.setHistoryOfDrugToDrugInteraction(clinic.getHistoryOfDrugToDrugInteraction());
        prepClinicDto.setHivTestResultDate(clinic.getHivTestResultDate());
        prepClinicDto.setMonthsOfRefill(clinic.getMonthsOfRefill());
        prepClinicDto.setHistoryOfDrugAllergies(clinic.getHistoryOfDrugAllergies());

        return prepClinicDto;
    }


    public PrepClinicDto getCommencementById(Long id) {
        PrepClinic prepClinic = prepClinicRepository
                .findByIdAndFacilityIdAndArchived(id, currentUserOrganizationService
                        .getCurrentUserOrganization(), UN_ARCHIVED)
                .orElseThrow (() -> new EntityNotFoundException(PrepClinic.class, "id", String.valueOf (id)));

        return this.clinicToClinicDto(prepClinic, null);
    }


    public Boolean checkCabLaEligibility (Long id, LocalDate currentVisitDate) {
        //check if not in prepClinical record for visit
        Optional<Long> hasPrevisit = prepClinicRepository.checkHasClinicalVisit(id); // returns true
        if (!hasPrevisit.isPresent()){
            return true; // return true with no clinical records
        } else {
            Boolean hasCabalin = prepClinicRepository.checkEnableCabaL(id, currentVisitDate); // has clinical records and has cab-lin as previous visit
            return hasCabalin; // true
        }
    }

    public List<PrepPreviousVisitHtsRecord> getPreviousHtsTesting (Long id){
        List<PrepPreviousVisitHtsRecord> htsRecord = prepClinicRepository.getPreviousHtsRecord(id);
        return htsRecord;

    }

}

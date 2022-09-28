package org.lamisplus.modules.hiv.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hiv.domain.dto.*;
import org.lamisplus.modules.hiv.service.HivEnrollmentService;
import org.lamisplus.modules.hiv.service.HivPatientService;
import org.lamisplus.modules.hiv.service.PatientActivityService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/hiv/")
public class HivEnrollmentController {
    private final HivEnrollmentService hivEnrollmentService;

    private final HivPatientService patientService;

    private final PatientActivityService patientActivityService;


    @PostMapping(value = "enrollment", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HivEnrollmentDto> createHivEnrollment(@RequestBody HivEnrollmentDto hiv) {
        return ResponseEntity.ok (hivEnrollmentService.createHivEnrollment (hiv));
    }

    @GetMapping(value = "patient/enrollment", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<HivPatientDto>> getAllHivEnrollments() {
        return ResponseEntity.ok (hivEnrollmentService.getAll ());
    }

    @GetMapping(value = "patients", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<HivPatientDto>> getHivPatient() {
        return ResponseEntity.ok (patientService.getHivPatients ());
    }
    
    @GetMapping(value = "patients/iit", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<HivPatientDto>> getIItHivPatient() {
        return ResponseEntity.ok (patientService.getIITHivPatients ());
    }

    @PostMapping(value = "patient", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HivEnrollmentDto> registerHivPatient(@RequestBody HivPatientEnrollmentDto hivPatientEnrollmentDto) {
        return ResponseEntity.ok (patientService.registerAndEnrollHivPatient (hivPatientEnrollmentDto));
    }

    @GetMapping(value = "patient/checked-in", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<HivPatientDto>> getHivCheckInPatients() {
        return ResponseEntity.ok (patientService.getHivCheckedInPatients ());
    }

    @GetMapping(value = "patient/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HivPatientDto> getHivPatientById(@PathVariable("id") Long id) {
        return ResponseEntity.ok (patientService.getHivPatientById (id));
    }

    @GetMapping(value = "patient/activities", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<PatientActivity>> getPatientActivity(@PathVariable("id") Long id) {
        return ResponseEntity.ok (patientService.getHivPatientActivitiesById (id));
    }


    @GetMapping(value = "enrollment/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HivEnrollmentDto> getHivEnrollmentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok (hivEnrollmentService.getHivEnrollmentById (id));
    }

    @PutMapping(value = "enrollment/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HivEnrollmentDto> updateHivEnrollmentById(@PathVariable("id") Long id, @RequestBody HivEnrollmentDto hivEnrollment) {
        return ResponseEntity.ok (hivEnrollmentService.updateHivEnrollment (id, hivEnrollment));
    }

    @DeleteMapping(value = "enrollment/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteHivEnrollmentById(@PathVariable("id") Long id) {
        hivEnrollmentService.deleteHivEnrollment (id);
        return ResponseEntity.accepted ().build ();
    }


    @GetMapping("/patients/{patientId}/activities")
    public List<TimelineVm> getActivities(@PathVariable Long patientId, @RequestParam(required = false, defaultValue = "false") Boolean full) {
        return patientActivityService.getTimelineVms (patientId, full);
    }
    @GetMapping("/patients/{patientId}/history/activities")
    public List<PatientActivity> getActivitiesHistory(@PathVariable Long patientId) {
        return patientActivityService.getActivities (patientId);
    }


}

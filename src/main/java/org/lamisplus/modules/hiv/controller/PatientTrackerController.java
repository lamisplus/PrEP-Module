package org.lamisplus.modules.hiv.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hiv.domain.dto.PatientTrackingDto;
import org.lamisplus.modules.hiv.service.PatientTrackerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/patient-tracker")
public class PatientTrackerController {
	private final PatientTrackerService patientTrackerService;
	
	
	@PostMapping()
	public ResponseEntity<PatientTrackingDto> createPatientTracker(@RequestBody PatientTrackingDto patentTrackingDto) {
		return ResponseEntity.ok(patientTrackerService.createPatientTracker(patentTrackingDto));
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<PatientTrackingDto> updatePatientTracker(
			@PathVariable("id") Long id,
			@RequestBody PatientTrackingDto patentTrackingDto) {
		return ResponseEntity.ok(patientTrackerService.updatePatientTracker(id, patentTrackingDto));
	}
	
	
	@GetMapping("/patient/{id}")
	public ResponseEntity<List<PatientTrackingDto>> getPatientTrackerByPatientId(@PathVariable("id") Long id) {
		return ResponseEntity.ok(patientTrackerService.getPatientTrackerByPatientId(id));
	}
	
}


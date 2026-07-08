package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.FollowupHtsResultDto;
import org.lamisplus.modules.prep.domain.dto.PepFollowupVisitDto;
import org.lamisplus.modules.prep.domain.dto.PepFollowupVisitRequestDto;
import org.lamisplus.modules.prep.service.PepFollowupVisitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pep-followup-visit")
public class PepFollowupVisitController {
    private final PepFollowupVisitService pepFollowupVisitService;

    @PostMapping("/clinic-visit")
    @ApiOperation(value = "Save PEP Follow-up Clinic Visit")
    public ResponseEntity<PepFollowupVisitDto> saveClinicVisit(@RequestBody PepFollowupVisitRequestDto requestDto) {
        return ResponseEntity.ok(pepFollowupVisitService.saveClinicVisit(requestDto));
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "Get PEP Follow-up Visit by ID")
    public ResponseEntity<PepFollowupVisitDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pepFollowupVisitService.getById(id));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "Update PEP Follow-up Visit")
    public ResponseEntity<PepFollowupVisitDto> update(@PathVariable Long id, @RequestBody PepFollowupVisitDto dto) {
        return ResponseEntity.ok(pepFollowupVisitService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "Delete PEP Follow-up Visit")
    public void delete(@PathVariable Long id) {
        pepFollowupVisitService.delete(id);
    }

    @GetMapping("/person/{personUuid}")
    @ApiOperation(value = "Get PEP Follow-up Visits by Person UUID")
    public ResponseEntity<List<PepFollowupVisitDto>> getByPersonUuid(@PathVariable String personUuid) {
        return ResponseEntity.ok(pepFollowupVisitService.getByPersonUuid(personUuid));
    }

    @GetMapping("/latest/{personUuid}")
    @ApiOperation(value = "Get latest PEP Follow-up Visit by Person UUID and enrollment type")
    public ResponseEntity<PepFollowupVisitDto> getLatest(
            @PathVariable String personUuid,
            @RequestParam(value = "enrollmentType", required = false) String enrollmentType) {
        return ResponseEntity.ok(
                pepFollowupVisitService.getLatestByEnrollmentType(personUuid, enrollmentType));
    }

    @GetMapping("/initial-hts-results/{personUuid}")
    @ApiOperation(value = "Get the 1st/2nd/3rd PEP follow-up visits (with HTS) after the latest PEP initiation")
    public ResponseEntity<List<FollowupHtsResultDto>> getInitialFollowupHtsResults(
            @PathVariable String personUuid) {
        return ResponseEntity.ok(pepFollowupVisitService.getInitialFollowupHtsResults(personUuid));
    }
}

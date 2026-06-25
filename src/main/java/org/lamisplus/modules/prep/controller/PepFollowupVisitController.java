package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/person/{personId}")
    @ApiOperation(value = "Get PEP Follow-up Visits by Person ID")
    public ResponseEntity<List<PepFollowupVisitDto>> getByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(pepFollowupVisitService.getByPersonId(personId));
    }

    @GetMapping("/latest/{personId}")
    @ApiOperation(value = "Get latest PEP Follow-up Visit by Person ID and enrollment type")
    public ResponseEntity<PepFollowupVisitDto> getLatest(
            @PathVariable Long personId,
            @RequestParam(value = "enrollmentType", required = false) String enrollmentType) {
        return ResponseEntity.ok(
                pepFollowupVisitService.getLatestByEnrollmentType(personId, enrollmentType));
    }
}

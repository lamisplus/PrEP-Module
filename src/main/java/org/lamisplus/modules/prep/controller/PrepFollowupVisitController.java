package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepFollowupVisitDto;
import org.lamisplus.modules.prep.domain.dto.PrepFollowupVisitRequestDto;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
import org.lamisplus.modules.prep.service.PrepFollowupVisitService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prep-followup-visit")
public class PrepFollowupVisitController {
    private final PrepFollowupVisitService prepFollowupVisitService;

    @PostMapping("/commencement")
    @ApiOperation(value = "Save PrEP Follow-up Visit Commencement")
    public ResponseEntity<PrepFollowupVisitDto> saveCommencement(@RequestBody PrepFollowupVisitRequestDto requestDto) {
        return ResponseEntity.ok(prepFollowupVisitService.saveCommencement(requestDto));
    }

    @PostMapping("/clinic-visit")
    @ApiOperation(value = "Save PrEP Follow-up Clinic Visit")
    public ResponseEntity<PrepFollowupVisitDto> saveClinicVisit(@RequestBody PrepFollowupVisitRequestDto requestDto) {
        return ResponseEntity.ok(prepFollowupVisitService.saveClinic(requestDto));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "Update PrEP Follow-up Visit")
    public ResponseEntity<PrepFollowupVisitDto> update(@PathVariable Long id, @RequestBody PrepFollowupVisitDto dto) {
        return ResponseEntity.ok(prepFollowupVisitService.update(id, dto));
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "Get PrEP Follow-up Visit by ID")
    public ResponseEntity<PrepFollowupVisitDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prepFollowupVisitService.getById(id));
    }

    @GetMapping("/person/{personId}")
    @ApiOperation(value = "Get PrEP Follow-up Visits by Person ID")
    public ResponseEntity<List<PrepFollowupVisitDto>> getByPersonId(
            @PathVariable Long personId,
            @RequestParam(defaultValue = "false") Boolean isCommenced,
            @RequestParam(defaultValue = "false") Boolean last) {
        return ResponseEntity.ok(prepFollowupVisitService.getByPersonId(personId, isCommenced, last));
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "Delete PrEP Follow-up Visit")
    public void delete(@PathVariable Long id) {
        prepFollowupVisitService.delete(id);
    }

    @GetMapping("/check-cab-la/{id}/{currentVisitDate}")
    @ApiOperation(value = "Check CAB-LA Eligibility")
    public ResponseEntity<Boolean> checkCabLaEligibility(@PathVariable Long id,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate currentVisitDate) {
        return ResponseEntity.ok(prepFollowupVisitService.checkCabLaEligibility(id, currentVisitDate));
    }

    @GetMapping("/hts-record/{id}")
    @ApiOperation(value = "Get Previous HTS Record")
    public ResponseEntity<List<PrepPreviousVisitHtsRecord>> getPreviousHtsTesting(@PathVariable Long id) {
        return ResponseEntity.ok(prepFollowupVisitService.getPreviousHtsTesting(id));
    }

    @GetMapping("/current-date")
    @ApiOperation(value = "Get Current Date")
    public ResponseEntity<Date> getCurrentDate() {
        return ResponseEntity.ok(prepFollowupVisitService.getCurrentDate());
    }

    @PutMapping("/update-previous-status")
    @ApiOperation(value = "Update Previous PrEP Status")
    public void updatePreviousPrepStatus(@RequestParam String personUuid, @RequestParam String previousStatus) {
        prepFollowupVisitService.updatePreviousStatusIfExists(personUuid, previousStatus);
    }
}

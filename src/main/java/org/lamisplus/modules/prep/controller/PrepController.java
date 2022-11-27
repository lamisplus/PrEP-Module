package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.service.PrepService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepController {
    private final PrepService prepService;
    private final String PREP_URL_VERSION_ONE = "/api/v1/prep";

    @GetMapping(PREP_URL_VERSION_ONE + "/persons")
    public ResponseEntity<PageDTO> getAllPerson(@RequestParam (required = false, defaultValue = "*")  String searchValue,
                                                @RequestParam (required = false, defaultValue = "20")int pageSize,
                                                @RequestParam (required = false, defaultValue = "0") int pageNo) {
        return new ResponseEntity<>(this.prepService
                .getAllPrepDtosByPerson(prepService
                        .findPrepPersonPage(searchValue, pageNo, pageSize)), HttpStatus.OK);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/eligibility")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Prep Eligibility")
    public ResponseEntity<PrepEligibilityDto> saveEligibility(@Valid @RequestBody PrepEligibilityRequestDto prepEligibilityRequestDto) {
        return new ResponseEntity<>(prepService.saveEligibility(prepEligibilityRequestDto), HttpStatus.CREATED);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/enrollment")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Prep Enrollment")
    public ResponseEntity<PrepEnrollmentDto> saveEnrollment(@Valid @RequestBody PrepEnrollmentRequestDto prepEnrollmentRequestDto) {
        return new ResponseEntity<>(prepService.saveEnrollment(prepEnrollmentRequestDto), HttpStatus.CREATED);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/commencement")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Prep Enrollment")
    public ResponseEntity<PrepClinicDto> saveCommencement(@Valid @RequestBody PrepClinicRequestDto prepClinicRequestDto) {
        return new ResponseEntity<>(prepService.saveCommencement(prepClinicRequestDto), HttpStatus.CREATED);
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/enrollment/person/{personId}")
    public ResponseEntity<List<PrepEnrollmentDto>> getEnrollmentByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepService.getEnrollmentByPersonId(personId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/commencement/person/{personId}")
    public ResponseEntity<List<PrepClinicDto>> getCommencementByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepService.getCommencementByPersonId(personId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/persons/{personId}")
    public ResponseEntity<PrepDtos> getPrepByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepService.getPrepByPersonId(personId));
    }
}

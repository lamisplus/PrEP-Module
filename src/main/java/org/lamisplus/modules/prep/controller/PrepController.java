package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.prep.domain.dto.PrepDto;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityDto;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityRequestDto;
import org.lamisplus.modules.prep.domain.dto.PrepEnrollmentRequestDto;
import org.lamisplus.modules.prep.service.PrepService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
    public ResponseEntity<PrepDto> saveEnrollment(@Valid @RequestBody PrepEnrollmentRequestDto prepEnrollmentRequestDto) {
        return new ResponseEntity<>(prepService.saveEnrollment(prepEnrollmentRequestDto), HttpStatus.CREATED);
    }
}

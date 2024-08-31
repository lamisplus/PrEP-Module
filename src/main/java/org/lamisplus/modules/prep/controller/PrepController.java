package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.base.domain.dto.PageDTO;
import org.lamisplus.modules.base.util.PaginationUtil;
import org.lamisplus.modules.prep.domain.dto.*;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.lamisplus.modules.prep.service.PatientActivityService;
import org.lamisplus.modules.prep.service.PrepService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
public class PrepController {
    private final PrepService prepService;
    private final PatientActivityService patientActivityService;
    private final String PREP_URL_VERSION_ONE = "/api/v1/prep";
    private final String PREP_URL_VERSION_TWO = "/api/v2/prep";

    public PrepController(PrepService prepService, PatientActivityService patientActivityService) {
        this.prepService = prepService;
        this.patientActivityService = patientActivityService;
    }

   /* @GetMapping(PREP_URL_VERSION_ONE + "/persons")
    @ApiOperation("Get Prep Persons")
    public ResponseEntity<PageDTO> getAllPerson(@RequestParam (required = false, defaultValue = "*")  String searchValue,
                                                @RequestParam (required = false, defaultValue = "20")int pageSize,
                                                @RequestParam (required = false, defaultValue = "0") int pageNo) {
        return new ResponseEntity<>(this.prepService
                .getAllPrepDtosByPerson (prepService
                        .findPrepPersonPage(searchValue, pageNo, pageSize)), HttpStatus.OK);
    }*/

    @GetMapping(PREP_URL_VERSION_ONE + "/persons")
    @ApiOperation("Get Prep Persons with optimized api")
    public ResponseEntity<PageDTO> getAllPersons(@RequestParam (required = false, defaultValue = "*")  String searchValue,
                                                @RequestParam (required = false, defaultValue = "20")int pageSize,
                                                @RequestParam (required = false, defaultValue = "0") int pageNo) {
        Page<PrepClient> page = prepService.findAllPrepPersonPage(searchValue, pageNo, pageSize);
        return new ResponseEntity<>(PaginationUtil.generatePagination(page, page.getContent()), HttpStatus.OK);
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/only/persons")
    @ApiOperation("Get Only Prep Persons with optimized api")
    public ResponseEntity<PageDTO> getOnlyPrepPersons(@RequestParam (required = false, defaultValue = "*")  String searchValue,
                                                 @RequestParam (required = false, defaultValue = "20")int pageSize,
                                                 @RequestParam (required = false, defaultValue = "0") int pageNo) {
        Page<PrepClient> page = prepService.findOnlyPrepPersonPage(searchValue, pageNo, pageSize);
        return new ResponseEntity<>(PaginationUtil.generatePagination(page, page.getContent()), HttpStatus.OK);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/eligibility")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Save Prep Eligibility")
    public ResponseEntity<PrepEligibilityDto> saveEligibility(@Valid @RequestBody PrepEligibilityRequestDto prepEligibilityRequestDto) {
        return new ResponseEntity<>(prepService.saveEligibility(prepEligibilityRequestDto), HttpStatus.CREATED);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/enrollment")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Save Prep Enrollment")
    public ResponseEntity<PrepEnrollmentDto> saveEnrollment(@Valid @RequestBody PrepEnrollmentRequestDto prepEnrollmentRequestDto) {
        return new ResponseEntity<>(prepService.saveEnrollment(prepEnrollmentRequestDto), HttpStatus.CREATED);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/commencement")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Save Prep Commencement")
    public ResponseEntity<PrepClinicDto> saveCommencement(@Valid @RequestBody PrepClinicRequestDto prepClinicRequestDto) {
        return new ResponseEntity<>(prepService.saveCommencement(prepClinicRequestDto), HttpStatus.CREATED);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/clinic-visit")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Save Prep Clinic")
    public ResponseEntity<PrepClinicDto> saveClinic(@Valid @RequestBody PrepClinicRequestDto prepClinicRequestDto) {
        return new ResponseEntity<>(prepService.saveClinic(prepClinicRequestDto), HttpStatus.CREATED);
    }

    @PostMapping(PREP_URL_VERSION_ONE+ "/interruption")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation("Save Prep Interruption")
    public ResponseEntity<PrepInterruptionDto> saveInterruption(@Valid @RequestBody PrepInterruptionRequestDto prepInterruptionRequestDto) {
        return new ResponseEntity<>(prepService.saveInterruption(prepInterruptionRequestDto), HttpStatus.CREATED);
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/enrollment/person/{personId}")
    @ApiOperation("Get Prep enrollment by person Id")
    public ResponseEntity<List<PrepEnrollmentDto>> getAllEnrollmentByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepService.getEnrollmentByPersonId(personId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/commencement/person/{personId}")
    @ApiOperation("Get Prep commencement by person Id")
    public ResponseEntity<List<PrepClinicDto>> getAllCommencementByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepService.getCommencementByPersonId(personId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/commencement/{id}")
    @ApiOperation("Get Prep commencement by Id")
    public ResponseEntity<PrepClinicDto> getCommencementById(@PathVariable Long id) {
        return ResponseEntity.ok(this.prepService.getCommencementById(id));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/clinic/{id}")
    @ApiOperation("Get Prep clinic by Id")
    public ResponseEntity<PrepClinicDto> getClinicById(@PathVariable Long id) {
        return ResponseEntity.ok(this.prepService.getCommencementById(id));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/eligibility/{id}")
    @ApiOperation("Get Prep Eligibility by Id")
    public ResponseEntity<PrepEligibilityDto> getEligibilityById(@PathVariable Long id) {
        return ResponseEntity.ok(this.prepService.getEligibilityById(id));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/enrollment/{id}")
    @ApiOperation("Get Prep Enrollment by Id")
    public ResponseEntity<PrepEnrollmentDto> getEnrollmentById(@PathVariable Long id) {
        return ResponseEntity.ok(this.prepService.getEnrollmentById(id));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/persons/{personId}")
    @ApiOperation("Get Prep Client by person Id")
    public ResponseEntity<PrepDtos> getPrepByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepService.getPrepByPersonId(personId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/activities/patients/{patientId}")
    @ApiOperation("Get Prep Activities by patient Id")
    public List<TimelineVm> getActivities(@PathVariable Long patientId, @RequestParam(required = false, defaultValue = "false") Boolean full) {
        return patientActivityService.getTimelineVms (patientId, full);
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/general-activities/patients/{patientId}")
    @ApiOperation("Get all Prep Activities by patient Id")
    public List<PatientActivity> getActivitiesFor(@PathVariable Long patientId) {
        return patientActivityService.getActivitiesFor (patientId);
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/eligibility/open/patients/{patientId}")
    @ApiOperation("Get Prep Eligible not enrolled by patient Id")
    public ResponseEntity<PrepEligibilityDto> getOpenEligibility(@PathVariable Long patientId) {
        return ResponseEntity.ok(prepService.getOpenEligibility (patientId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/enrollment/open/patients/{patientId}")
    @ApiOperation("Get Prep Enrollment not commenced by patient Id")
    public ResponseEntity<PrepEnrollmentDto> getOpenEnrollment(@PathVariable Long patientId) {
        return ResponseEntity.ok(prepService.getOpenEnrollment (patientId));
    }
}

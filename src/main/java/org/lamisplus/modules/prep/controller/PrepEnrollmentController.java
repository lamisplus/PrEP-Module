package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepEnrollmentDto;
import org.lamisplus.modules.prep.service.PrepEnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepEnrollmentController {
    private final PrepEnrollmentService prepEnrollment;
    private final String PREP_ENROLLMENT_URL_VERSION_ONE = "/api/v1/prep-enrollment";

    @PutMapping(PREP_ENROLLMENT_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Update Prep Enrollment by id")
    public ResponseEntity<PrepEnrollmentDto> update(@PathVariable Long id, @Valid @RequestBody PrepEnrollmentDto prepEnrollmentDto) {
        return ResponseEntity.ok(prepEnrollment.update(id, prepEnrollmentDto));
    }

    @GetMapping(PREP_ENROLLMENT_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Get Prep Enrollment by id")
    public ResponseEntity<PrepEnrollmentDto> getEnrollmentById(@PathVariable Long id) {
        return new ResponseEntity<>(prepEnrollment.getEnrollmentById(id), HttpStatus.OK);
    }

    @GetMapping(PREP_ENROLLMENT_URL_VERSION_ONE +"/person/{personId}")
    @ApiOperation("Get Prep Enrollment by person id")
    public ResponseEntity<List<PrepEnrollmentDto>> getEnrollmentByPersonId(@PathVariable Long personId) {
        return new ResponseEntity<>(prepEnrollment.getEnrollmentByPersonId(personId), HttpStatus.OK);
    }

    @DeleteMapping(PREP_ENROLLMENT_URL_VERSION_ONE + "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation("Delete Prep Enrollment")
    public void delete(@PathVariable Long id) {
        prepEnrollment.delete(id);
    }
}

package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityDto;
import org.lamisplus.modules.prep.service.PrepEligibilityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepEligibilityController {
    private final PrepEligibilityService prepEligibilityService;
    private final String PREP_ELIGIBILITY_URL_VERSION_ONE = "/api/v1/prep-eligibility";

    @PutMapping(PREP_ELIGIBILITY_URL_VERSION_ONE +"/{id}")
    public ResponseEntity<PrepEligibilityDto> update(@PathVariable Long id, @Valid @RequestBody PrepEligibilityDto eligibilityDto) {
        return ResponseEntity.ok(prepEligibilityService.update(id, eligibilityDto));
    }

    @GetMapping(PREP_ELIGIBILITY_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Get Prep Eligibility by id")
    public ResponseEntity<PrepEligibilityDto> getEligibilityById(@PathVariable Long id) {
        return new ResponseEntity<>(prepEligibilityService.getEligibilityById(id), HttpStatus.OK);
    }

    @GetMapping(PREP_ELIGIBILITY_URL_VERSION_ONE +"/person/{personId}")
    @ApiOperation("Get Prep Eligibility by person id")
    public ResponseEntity<List<PrepEligibilityDto>> getPrepEligibilityByPersonId(@PathVariable Long personId) {
        return new ResponseEntity<>(prepEligibilityService.getEligibilityByPersonId(personId), HttpStatus.OK);
    }

    @DeleteMapping(PREP_ELIGIBILITY_URL_VERSION_ONE + "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation("Delete Prep Eligibility")
    public void delete(@PathVariable Long id) {
        prepEligibilityService.delete(id);
    }
}

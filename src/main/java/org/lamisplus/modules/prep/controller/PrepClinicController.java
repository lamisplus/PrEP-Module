package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepClinicDto;
import org.lamisplus.modules.prep.service.PrepClinicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepClinicController {
    private final PrepClinicService prepClinicService;
    private final String PREP_CLINIC_URL_VERSION_ONE = "/api/v1/prep-clinic";

    @PutMapping(PREP_CLINIC_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Update Prep Clinic by id")
    public ResponseEntity<PrepClinicDto> update(@PathVariable Long id, @Valid @RequestBody PrepClinicDto prepClinicDto) {
        return ResponseEntity.ok(prepClinicService.update(id, prepClinicDto));
    }

    @GetMapping(PREP_CLINIC_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Get Prep Clinic by id")
    public ResponseEntity<PrepClinicDto> getPrepClinicById(@PathVariable Long id) {
        return new ResponseEntity<>(prepClinicService.getPrepClinicById(id), HttpStatus.OK);
    }

    @GetMapping(PREP_CLINIC_URL_VERSION_ONE +"/person/{personId}")
    @ApiOperation("Get Prep Clinic by person id")
    public ResponseEntity<List<PrepClinicDto>> getPrepClinicByPersonId(@PathVariable Long personId) {
        return new ResponseEntity<>(prepClinicService.getPrepClinicByPersonId(personId), HttpStatus.OK);
    }

    @DeleteMapping(PREP_CLINIC_URL_VERSION_ONE+ "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation("Delete Prep Clinic")
    public void delete(@PathVariable Long id) {
        prepClinicService.delete(id);
    }
}

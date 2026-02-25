package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PepClinicDto;
import org.lamisplus.modules.prep.domain.dto.PepClinicRequestDto;
import org.lamisplus.modules.prep.service.PepClinicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PepClinicController {
    private final PepClinicService pepClinicService;
    private final String PEP_CLINIC_URL = "/api/v1/pep-clinic";

    @PostMapping(PEP_CLINIC_URL + "/clinic-visit")
    @ApiOperation("Save PEP Clinic Visit")
    public ResponseEntity<PepClinicDto> saveClinicVisit(@Valid @RequestBody PepClinicRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pepClinicService.saveClinicVisit(requestDto));
    }

    @GetMapping(PEP_CLINIC_URL + "/{id}")
    @ApiOperation("Get PEP Clinic by id")
    public ResponseEntity<PepClinicDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pepClinicService.getById(id));
    }

    @PutMapping(PEP_CLINIC_URL + "/{id}")
    @ApiOperation("Update PEP Clinic by id")
    public ResponseEntity<PepClinicDto> update(@PathVariable Long id, @Valid @RequestBody PepClinicDto pepClinicDto) {
        return ResponseEntity.ok(pepClinicService.update(id, pepClinicDto));
    }

    @DeleteMapping(PEP_CLINIC_URL + "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation("Delete PEP Clinic")
    public void delete(@PathVariable Long id) {
        pepClinicService.delete(id);
    }

    @GetMapping(PEP_CLINIC_URL + "/person/{personId}")
    @ApiOperation("Get PEP Clinic visits by person id")
    public ResponseEntity<List<PepClinicDto>> getByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(pepClinicService.getByPersonId(personId));
    }
}

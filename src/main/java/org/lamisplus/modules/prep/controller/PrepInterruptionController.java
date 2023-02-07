package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepInterruptionDto;
import org.lamisplus.modules.prep.service.PrepInterruptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepInterruptionController {
    private final PrepInterruptionService interruptionService;
    private final String PREP_INTERRUPTION_URL_VERSION_ONE = "/api/v1/prep-interruption";

    @PutMapping(PREP_INTERRUPTION_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Update Prep Interruption by id")
    public ResponseEntity<PrepInterruptionDto> update(@PathVariable Long id, @Valid @RequestBody PrepInterruptionDto interruptionDto) {
        return ResponseEntity.ok(interruptionService.update(id, interruptionDto));
    }

    @GetMapping(PREP_INTERRUPTION_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Get Prep Interruption by id")
    public ResponseEntity<PrepInterruptionDto> getInterruptionById(@PathVariable Long id) {
        return new ResponseEntity<>(interruptionService.getInterruptionById(id), HttpStatus.OK);
    }

    @GetMapping(PREP_INTERRUPTION_URL_VERSION_ONE +"/person/{personId}")
    @ApiOperation("Get Prep Interruption by person id")
    public ResponseEntity<List<PrepInterruptionDto>> getInterruptionByPersonId(@PathVariable Long personId) {
        return new ResponseEntity<>(interruptionService.getInterruptionByPersonId(personId), HttpStatus.OK);
    }

    @DeleteMapping(PREP_INTERRUPTION_URL_VERSION_ONE + "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation("Delete Prep Interruption")
    public void delete(@PathVariable Long id) {
        interruptionService.delete(id);
    }
}

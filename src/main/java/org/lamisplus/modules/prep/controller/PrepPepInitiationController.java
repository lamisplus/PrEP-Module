package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepPepInitiationDto;
import org.lamisplus.modules.prep.domain.dto.PrepPepInitiationRequestDto;
import org.lamisplus.modules.prep.service.PrepPepInitiationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prep-pep-initiation")
public class PrepPepInitiationController {
    private final PrepPepInitiationService prepPepInitiationService;

    @PostMapping("")
    @ApiOperation(value = "Save PrEP/PEP Initiation")
    public ResponseEntity<PrepPepInitiationDto> save(@RequestBody PrepPepInitiationRequestDto requestDto) {
        return ResponseEntity.ok(prepPepInitiationService.save(requestDto));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "Update PrEP/PEP Initiation")
    public ResponseEntity<PrepPepInitiationDto> update(@PathVariable Long id, @RequestBody PrepPepInitiationDto dto) {
        return ResponseEntity.ok(prepPepInitiationService.update(id, dto));
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "Get PrEP/PEP Initiation by ID")
    public ResponseEntity<PrepPepInitiationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prepPepInitiationService.getById(id));
    }

    @GetMapping("/person/{personUuid}")
    @ApiOperation(value = "Get PrEP/PEP Initiations by Person UUID")
    public ResponseEntity<List<PrepPepInitiationDto>> getByPersonUuid(@PathVariable String personUuid) {
        return ResponseEntity.ok(prepPepInitiationService.getByPersonUuid(personUuid));
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "Delete PrEP/PEP Initiation")
    public void delete(@PathVariable Long id) {
        prepPepInitiationService.delete(id);
    }
}

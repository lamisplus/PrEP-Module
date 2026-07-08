package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityScreeningDto;
import org.lamisplus.modules.prep.domain.dto.PrepEligibilityScreeningRequestDto;
import org.lamisplus.modules.prep.service.PrepEligibilityScreeningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prep-eligibility-screening")
public class PrepEligibilityScreeningController {
    private final PrepEligibilityScreeningService prepEligibilityScreeningService;

    @PostMapping("")
    @ApiOperation(value = "Save PrEP Eligibility Screening")
    public ResponseEntity<PrepEligibilityScreeningDto> save(@RequestBody PrepEligibilityScreeningRequestDto requestDto) {
        return ResponseEntity.ok(prepEligibilityScreeningService.save(requestDto));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "Update PrEP Eligibility Screening")
    public ResponseEntity<PrepEligibilityScreeningDto> update(@PathVariable Long id, @RequestBody PrepEligibilityScreeningDto dto) {
        return ResponseEntity.ok(prepEligibilityScreeningService.update(id, dto));
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "Get PrEP Eligibility Screening by ID")
    public ResponseEntity<PrepEligibilityScreeningDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prepEligibilityScreeningService.getById(id));
    }

    @GetMapping("/person/{personUuid}")
    @ApiOperation(value = "Get PrEP Eligibility Screenings by Person UUID")
    public ResponseEntity<List<PrepEligibilityScreeningDto>> getByPersonUuid(@PathVariable String personUuid) {
        return ResponseEntity.ok(prepEligibilityScreeningService.getByPersonUuid(personUuid));
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "Delete PrEP Eligibility Screening")
    public void delete(@PathVariable Long id) {
        prepEligibilityScreeningService.delete(id);
    }
}

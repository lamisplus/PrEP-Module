package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepCompletionDto;
import org.lamisplus.modules.prep.domain.dto.PrepCompletionRequestDto;
import org.lamisplus.modules.prep.service.PrepCompletionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prep-completion")
public class PrepCompletionController {
    private final PrepCompletionService prepCompletionService;

    @PostMapping("")
    @ApiOperation(value = "Save PrEP Completion")
    public ResponseEntity<PrepCompletionDto> save(@RequestBody PrepCompletionRequestDto requestDto) {
        return ResponseEntity.ok(prepCompletionService.save(requestDto));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "Update PrEP Completion")
    public ResponseEntity<PrepCompletionDto> update(@PathVariable Long id, @RequestBody PrepCompletionDto dto) {
        return ResponseEntity.ok(prepCompletionService.update(id, dto));
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "Get PrEP Completion by ID")
    public ResponseEntity<PrepCompletionDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prepCompletionService.getById(id));
    }

    @GetMapping("/person/{personUuid}")
    @ApiOperation(value = "Get PrEP Completions by Person UUID")
    public ResponseEntity<List<PrepCompletionDto>> getByPersonUuid(@PathVariable String personUuid) {
        return ResponseEntity.ok(prepCompletionService.getByPersonUuid(personUuid));
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "Delete PrEP Completion")
    public void delete(@PathVariable Long id) {
        prepCompletionService.delete(id);
    }
}

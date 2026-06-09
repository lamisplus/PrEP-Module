package org.lamisplus.modules.prep.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.prep.domain.dto.ProphylaxisInterruptionDto;
import org.lamisplus.modules.prep.domain.dto.ProphylaxisInterruptionRequestDto;
import org.lamisplus.modules.prep.service.ProphylaxisInterruptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ProphylaxisInterruptionController {

    private final ProphylaxisInterruptionService service;

    @PostMapping("/api/v1/prophylaxis-interruption")
    public ResponseEntity<ProphylaxisInterruptionDto> save(@RequestBody ProphylaxisInterruptionRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(requestDto));
    }

    @PutMapping("/api/v1/prophylaxis-interruption/{id}")
    public ResponseEntity<ProphylaxisInterruptionDto> update(@PathVariable Long id,
                                                              @RequestBody ProphylaxisInterruptionDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/api/v1/prophylaxis-interruption/{id}")
    public ResponseEntity<ProphylaxisInterruptionDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/api/v1/prophylaxis-interruption/person/{personId}")
    public ResponseEntity<List<ProphylaxisInterruptionDto>> getByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(service.getByPersonId(personId));
    }

    @DeleteMapping("/api/v1/prophylaxis-interruption/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Record deleted successfully");
    }
}

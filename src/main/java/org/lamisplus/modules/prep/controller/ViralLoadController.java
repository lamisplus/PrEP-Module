package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.ViralLoadResultDto;
import org.lamisplus.modules.prep.service.ViralLoadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prep/viral-load")
public class ViralLoadController {

    private final ViralLoadService viralLoadService;

    @GetMapping("/latest/{personId}")
    @ApiOperation("Get the patient's latest viral load and its interpreted label")
    public ResponseEntity<ViralLoadResultDto> getLatest(@PathVariable Long personId) {
        return ResponseEntity.ok(viralLoadService.getLatestViralLoad(personId));
    }
}

package org.lamisplus.modules.hiv.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hiv.domain.dto.ARTClinicalCommenceDto;
import org.lamisplus.modules.hiv.service.ArtCommenceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/hiv/art/commencement")
public class ARTCommenceController {

    private final ArtCommenceService artCommenceService;

    @PostMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ARTClinicalCommenceDto> createArtCommencement(@RequestBody ARTClinicalCommenceDto artClinicalCommenceDto) {
        return ResponseEntity.ok (artCommenceService.createArtCommence (artClinicalCommenceDto));
    }

    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ARTClinicalCommenceDto>> getAllArtCommencement() {
        return ResponseEntity.ok (artCommenceService.getAll ());
    }


    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ARTClinicalCommenceDto> getArtCommencementById(@PathVariable("id") Long id) {
        return ResponseEntity.ok (artCommenceService.getArtById (id));
    }

    @PutMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ARTClinicalCommenceDto> updateArtCommencementById(
            @PathVariable("id") Long id,
            @RequestBody ARTClinicalCommenceDto artClinicalCommenceDto) {
        return ResponseEntity.ok (artCommenceService.updateArtCommence (id, artClinicalCommenceDto));
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> deleteArtCommencementId(@PathVariable("id") Long id) {
        artCommenceService.archivedArtCommenceClinical (id);
        return ResponseEntity.accepted ().build ();
    }
}

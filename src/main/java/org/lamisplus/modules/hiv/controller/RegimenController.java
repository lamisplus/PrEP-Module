package org.lamisplus.modules.hiv.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.hiv.domain.entity.Regimen;
import org.lamisplus.modules.hiv.domain.entity.RegimenType;
import org.lamisplus.modules.hiv.repositories.RegimenTypeRepository;
import org.lamisplus.modules.hiv.service.RegimenService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/hiv/regimen")
public class RegimenController {

    private final RegimenTypeRepository repository;
    private final RegimenService regimenService;

    @GetMapping(value = "/types", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RegimenType>> getRegimenTypes() {
        return ResponseEntity.ok (repository.findAll ());
    }



    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Regimen> getRegimen(@PathVariable("id") Long id) {
        return ResponseEntity.ok (regimenService.getRegimenBy (id));
    }

    @GetMapping(value = "/types/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Regimen>> getRegimensByTypeId(@PathVariable("id") Long id) {
        return ResponseEntity.ok (regimenService.getRegimenByTypeId (id));
    }


}

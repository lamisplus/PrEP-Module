package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.entity.PrepRegimen;
import org.lamisplus.modules.prep.service.PrepRegimenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepRegimenController {
    private final PrepRegimenService prepRegimenService;
    private final String PREP_REGIMEN_URL_VERSION_ONE = "/api/v1/prep-regimen";

    @GetMapping(PREP_REGIMEN_URL_VERSION_ONE)
    @ApiOperation("Get All Prep Regimen")
    public ResponseEntity<List<PrepRegimen>> getAllPrepRegimen() {
        return new ResponseEntity<>(prepRegimenService.getAllPrepRegimen(), HttpStatus.OK);
    }

    @GetMapping(PREP_REGIMEN_URL_VERSION_ONE + "/prepType")
    @ApiOperation("Get All Prep Regimen By Prep Type")
    public ResponseEntity<List<PrepRegimen>> getAllPrepRegimen(@RequestParam("prepType") String prepType) {
        return new ResponseEntity<>(prepRegimenService.getAllPrepRegimenByPrepType(prepType), HttpStatus.OK);
    }
}

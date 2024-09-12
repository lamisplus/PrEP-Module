package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepClinicDto;
import org.lamisplus.modules.prep.domain.dto.PrepPreviousVisitHtsRecord;
import org.lamisplus.modules.prep.repository.PrepClinicRepository;
import org.lamisplus.modules.prep.service.PrepClinicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequiredArgsConstructor
public class PrepClinicController {
    private final PrepClinicService prepClinicService;
    private final PrepClinicRepository prepClinicRepository;
    private final String PREP_CLINIC_URL_VERSION_ONE = "/api/v1/prep-clinic";

    @PutMapping(PREP_CLINIC_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Update Prep Clinic by id")
    public ResponseEntity<PrepClinicDto> update(@PathVariable Long id, @Valid @RequestBody PrepClinicDto prepClinicDto) {
        return ResponseEntity.ok(prepClinicService.update(id, prepClinicDto));
    }

    @GetMapping(PREP_CLINIC_URL_VERSION_ONE +"/{id}")
    @ApiOperation("Get Prep Clinic by id")
    public ResponseEntity<PrepClinicDto> getPrepClinicById(@PathVariable Long id) {
        return new ResponseEntity<>(prepClinicService.getPrepClinicById(id), HttpStatus.OK);
    }

    @GetMapping(PREP_CLINIC_URL_VERSION_ONE +"/person/{personId}")
    @ApiOperation("Get Prep Clinic by person id")
    public ResponseEntity<List<PrepClinicDto>> getPrepClinicByPersonId(@PathVariable Long personId,
                                                                       @RequestParam(required = false, defaultValue = "false") Boolean isCommenced,
                                                                       @RequestParam(required = false, defaultValue = "false") Boolean last) {
        return new ResponseEntity<>(prepClinicService.getPrepClinicByPersonId(personId, isCommenced, last), HttpStatus.OK);
    }

    @DeleteMapping(PREP_CLINIC_URL_VERSION_ONE+ "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation("Delete Prep Clinic")
    public void delete(@PathVariable Long id) {
        prepClinicService.delete(id);
    }


    @GetMapping(PREP_CLINIC_URL_VERSION_ONE +"/checkEnableCab/{id}/{currentVisitDate}")
    @ApiOperation("Get Prep Enable Cab-La for current visit by person id")
    public Boolean checkEnableCab(@PathVariable Long id,
                                  @PathVariable LocalDate currentVisitDate) {
//        return prepClinicRepository.checkEnableCabaL(id);
        return prepClinicService.checkCabLaEligibility(id, currentVisitDate);
    }

    @GetMapping(PREP_CLINIC_URL_VERSION_ONE +"/hts-record/{id}")
    @ApiOperation("Get Hts result and date for previous visit by person id")
    public ResponseEntity<List<PrepPreviousVisitHtsRecord>> previousHtsRecord (@PathVariable Long id) throws ExecutionException, InterruptedException {
        return  ResponseEntity.ok(prepClinicService.getPreviousHtsTesting(id));
    }
}

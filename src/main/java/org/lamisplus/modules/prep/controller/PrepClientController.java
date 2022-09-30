package org.lamisplus.modules.prep.controller;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.PrepClientCommencementDto;
import org.lamisplus.modules.prep.domain.dto.PrepClientDto;
import org.lamisplus.modules.prep.domain.dto.PrepClientDtos;
import org.lamisplus.modules.prep.domain.dto.PrepClientRequestDto;
import org.lamisplus.modules.prep.domain.entity.PrepClient;
import org.lamisplus.modules.prep.service.PrepClientService;
import org.lamisplus.modules.prep.util.PaginationUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrepClientController {
    private final PrepClientService prepClientService;
    private final String PREP_URL_VERSION_ONE = "/api/v1/prep";


    @PostMapping(PREP_URL_VERSION_ONE)
    public ResponseEntity<PrepClientDto> save(@Valid @RequestBody PrepClientRequestDto prepClientRequestDto) {
        return ResponseEntity.ok(this.prepClientService.save(prepClientRequestDto));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/{id}")
    public ResponseEntity<PrepClientDtos> getHtsClientById(@PathVariable Long id) {
        return ResponseEntity.ok(this.prepClientService.getPrepClientById(id));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/persons/{personId}")
    public ResponseEntity<PrepClientDtos> getPrepClientByPersonId(@PathVariable Long personId) {
        return ResponseEntity.ok(this.prepClientService.getPrepClientByPersonId(personId));
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/client/{code}")
    public ResponseEntity<String> getClientNameByCode(@PathVariable String code) {
        return ResponseEntity.ok(this.prepClientService.getClientNameByCode(code));
    }

    @GetMapping(PREP_URL_VERSION_ONE)
    public ResponseEntity<PrepClientDtos> getPrepClients(@PageableDefault(value = 50) Pageable pageable) {
        Page<PrepClient> page = prepClientService.findPrepClientPage(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(this.prepClientService.getAllPrepClientDtos(page, null), headers, HttpStatus.OK);
    }

    @GetMapping(PREP_URL_VERSION_ONE + "/persons")
    public ResponseEntity<List<PrepClientDtos>> getAllPerson() {
        return ResponseEntity.ok(this.prepClientService.getAllPatients());
    }

    @PutMapping(PREP_URL_VERSION_ONE +"/{id}/commencement")
    public ResponseEntity<PrepClientDto> updatePrepCommencement(@PathVariable Long id, @Valid @RequestBody PrepClientCommencementDto prepClientCommencementDto) {
        return ResponseEntity.ok(this.prepClientService.updatePrepCommencement(id, prepClientCommencementDto));
    }

    @DeleteMapping(PREP_URL_VERSION_ONE + "/{id}")
    public void delete(@PathVariable Long id) {
        this.prepClientService.delete(id);
    }
}

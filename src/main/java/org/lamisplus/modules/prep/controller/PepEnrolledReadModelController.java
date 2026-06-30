package org.lamisplus.modules.prep.controller;

import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.KeysetPage;
import org.lamisplus.modules.prep.domain.dto.PrepHtsPatientDto;
import org.lamisplus.modules.prep.service.PepEnrolledReadModelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * PROTOTYPE endpoints for the PEP Patients tab read model.
 *
 * <ul>
 *   <li>{@code POST .../refresh} — rebuild the current facility's read model.</li>
 *   <li>{@code GET  .../keyset}  — keyset-paginated list (pass the previous
 *       response's {@code nextCursor} back as {@code afterId}).</li>
 * </ul>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prep/persons/pep-enrolled/read-model")
public class PepEnrolledReadModelController {

    private final PepEnrolledReadModelService readModelService;

    @PostMapping("/refresh")
    @ApiOperation("Rebuild the PEP-enrolled read model for the current facility")
    public ResponseEntity<Map<String, Object>> refresh() {
        int count = readModelService.refresh();
        Map<String, Object> body = new HashMap<>();
        body.put("refreshed", count);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/keyset")
    @ApiOperation("Keyset-paginated PEP-enrolled list (afterId = previous page's nextCursor)")
    public ResponseEntity<KeysetPage<PrepHtsPatientDto>> keyset(
            @RequestParam(required = false) Long afterId,
            @RequestParam(required = false, defaultValue = "20") int pageSize,
            @RequestParam(required = false, defaultValue = "*") String searchValue) {
        return ResponseEntity.ok(readModelService.getKeyset(afterId, pageSize, searchValue));
    }
}

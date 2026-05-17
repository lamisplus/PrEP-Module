package org.lamisplus.modules.prep.config;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Serializes {@link ResponseStatusException}'s reason into the response body
 * so the frontend can surface user-friendly messages like
 * "A discontinuation has already been recorded for this client on 17 May 2026."
 * instead of the generic "Conflict" Spring returns by default in newer
 * Boot versions (which strip {@code message} from the error response unless
 * {@code server.error.include-message=always} is configured globally — a
 * setting we can't depend on the host app to enable).
 *
 * <p>Scoped to this module's package via {@code basePackages}, so it doesn't
 * shadow any other module's exception handling. {@link Order} is set to
 * {@code HIGHEST_PRECEDENCE} so it wins over more generic advices in the
 * platform.
 */
@RestControllerAdvice(basePackages = "org.lamisplus.modules.prep")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PrepErrorAdvice {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", ex.getStatus().value());
        body.put("error", ex.getStatus().getReasonPhrase());
        // The frontend's extractErrorMessage() looks here first.
        String reason = ex.getReason();
        body.put("message", reason != null && !reason.isEmpty()
                ? reason : ex.getStatus().getReasonPhrase());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }
}

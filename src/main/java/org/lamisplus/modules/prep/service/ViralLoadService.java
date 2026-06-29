package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.prep.domain.dto.ViralLoadResultDto;
import org.lamisplus.modules.prep.repository.ViralLoadRepository;
import org.lamisplus.modules.prep.util.ViralLoadConstants;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ViralLoadService {

    private final ViralLoadRepository viralLoadRepository;

    /**
     * Returns the patient's latest viral load and its interpreted label. When no
     * viral load exists the DTO fields are null. The label is derived here (not
     * in SQL) so the wording stays governed by {@link ViralLoadConstants}.
     */
    public ViralLoadResultDto getLatestViralLoad(String personUuid) {
        return viralLoadRepository.findLatestViralLoad(personUuid)
                .map(vl -> ViralLoadResultDto.builder()
                        .viralLoad(vl.getViralLoad())
                        .viralLoadResult(interpret(vl.getViralLoad()))
                        .build())
                .orElseGet(() -> ViralLoadResultDto.builder().build());
    }

    /**
     * > threshold => Target Detected; at/below => Target NO Detected. Returns
     * null when the raw result carries no parseable number so the UI can simply
     * show nothing rather than a misleading label.
     */
    private String interpret(String rawResult) {
        Double value = parseNumeric(rawResult);
        if (value == null) return null;
        return value > ViralLoadConstants.VIRAL_LOAD_THRESHOLD
                ? ViralLoadConstants.TARGET_DETECTED
                : ViralLoadConstants.TARGET_NOT_DETECTED;
    }

    private Double parseNumeric(String raw) {
        if (raw == null) return null;
        // Lab results can carry qualifiers ("< 20", "1,000 copies"); keep digits
        // and the decimal point only, then parse.
        String cleaned = raw.replaceAll("[^0-9.]", "");
        if (cleaned.isEmpty()) return null;
        try {
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

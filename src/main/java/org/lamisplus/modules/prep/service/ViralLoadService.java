package org.lamisplus.modules.prep.service;

import lombok.RequiredArgsConstructor;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.repository.PersonRepository;
import org.lamisplus.modules.prep.domain.dto.ViralLoadResultDto;
import org.lamisplus.modules.prep.repository.ViralLoadRepository;
import org.lamisplus.modules.prep.util.ViralLoadConstants;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ViralLoadService {

    private final ViralLoadRepository viralLoadRepository;
    private final PersonRepository personRepository;

    public ViralLoadResultDto getLatestViralLoad(Long personId) {
        String personUuid = personRepository.findById(personId)
                .map(Person::getUuid)
                .orElse(null);
        if (personUuid == null) {
            return ViralLoadResultDto.builder().build();
        }
        return viralLoadRepository.findLatestViralLoad(personUuid)
                .map(vl -> ViralLoadResultDto.builder()
                        .viralLoad(vl.getViralLoad())
                        .viralLoadResult(interpret(vl.getViralLoad()))
                        .build())
                .orElseGet(() -> ViralLoadResultDto.builder().build());
    }

    private String interpret(String rawResult) {
        if (rawResult == null) return null;
        
        if (NOT_DETECTED_TEXT.matcher(rawResult).find()) {
            return ViralLoadConstants.TARGET_NOT_DETECTED;
        }
        String qualifier = leadingQualifier(rawResult);
        Double bound = parseNumeric(stripLeadingQualifier(rawResult));
        if (bound == null) return null;

        double threshold = ViralLoadConstants.VIRAL_LOAD_THRESHOLD;
        switch (qualifier) {
            case "<":  // true value < bound
                return bound <= threshold ? ViralLoadConstants.TARGET_NOT_DETECTED : null;
            case "<=": // true value <= bound
                return bound < threshold ? ViralLoadConstants.TARGET_NOT_DETECTED : null;
            case ">":  // true value > bound
            case ">=": // true value >= bound
                return bound >= threshold ? ViralLoadConstants.TARGET_DETECTED : null;
            default:   // a plain number
                return bound >= threshold
                        ? ViralLoadConstants.TARGET_DETECTED
                        : ViralLoadConstants.TARGET_NOT_DETECTED;
        }
    }

    private static final Pattern NOT_DETECTED_TEXT = Pattern.compile(
            "\\bT?ND\\b|NOT\\s+DETECTED|UNDETECT", Pattern.CASE_INSENSITIVE);

    private static final String LESS_THAN_OR_EQUAL = String.valueOf((char) 0x2264);
    private static final String GREATER_THAN_OR_EQUAL = String.valueOf((char) 0x2265);
    private static final Pattern LEADING_QUALIFIER = Pattern.compile(
            "^\\s*(<=|>=|" + LESS_THAN_OR_EQUAL + "|" + GREATER_THAN_OR_EQUAL + "|<|>)");

    private static String leadingQualifier(String raw) {
        Matcher matcher = LEADING_QUALIFIER.matcher(raw);
        if (!matcher.find()) return "";
        String qualifier = matcher.group(1);
        if (LESS_THAN_OR_EQUAL.equals(qualifier)) return "<=";
        if (GREATER_THAN_OR_EQUAL.equals(qualifier)) return ">=";
        return qualifier;
    }

    private static String stripLeadingQualifier(String raw) {
        Matcher matcher = LEADING_QUALIFIER.matcher(raw);
        return matcher.find() ? raw.substring(matcher.end()) : raw;
    }

    private Double parseNumeric(String raw) {
        if (raw == null) return null;
        
        String cleaned = raw.replaceAll("[^0-9.]", "");
        if (cleaned.isEmpty()) return null;
        try {
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

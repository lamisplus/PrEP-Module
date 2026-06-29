package org.lamisplus.modules.prep.domain.entity;

import java.time.LocalDate;

/**
 * Native-query projection for the HTS encounter attached to one of the first
 * three PEP follow-up visits after the latest PEP initiation. Drives the
 * auto-populated 1st/2nd/3rd follow-up HIV result list. Column aliases in
 * {@code PepFollowupVisitRepository#findFirstThreeFollowupHtsResults} must match
 * these getter names.
 */
public interface FollowupHtsResult {
    Long getFollowupId();
    LocalDate getEncounterDate();
    String getHtsEncounterUuid();
    /** Raw hts_encounter.observation (JSONB) cast to text; null when unlinked. */
    String getHtsObservation();
}

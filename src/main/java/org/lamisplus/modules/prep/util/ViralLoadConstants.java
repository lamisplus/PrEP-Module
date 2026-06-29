package org.lamisplus.modules.prep.util;

/**
 * Canonical viral-load interpretation thresholds and labels. Centralised so the
 * "Target Detected" / "Target NO Detected" wording (and the threshold) can be
 * changed in one place. The frontend keeps a matching copy in
 * {@code jsx/constants/viralLoad.js} for display/gating — keep the two in sync.
 */
public final class ViralLoadConstants {

    /** result_reported strictly greater than this value => Target Detected. */
    public static final double VIRAL_LOAD_THRESHOLD = 1000d;

    /** Shown when the latest viral load is above the threshold. */
    public static final String TARGET_DETECTED = "Target Detected";

    /** Shown when the latest viral load is at/below the threshold. */
    public static final String TARGET_NOT_DETECTED = "Target NO Detected";

    private ViralLoadConstants() {}
}

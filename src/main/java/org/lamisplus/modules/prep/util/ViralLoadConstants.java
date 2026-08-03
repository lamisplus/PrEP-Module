package org.lamisplus.modules.prep.util;


public final class ViralLoadConstants {

    /** result_reported greater than or equal to this value => Target Detected. */
    public static final double VIRAL_LOAD_THRESHOLD = 1000d;

    /** Shown when the latest viral load is at or above the threshold. */
    public static final String TARGET_DETECTED = "Target Detected";

    /** Shown when the latest viral load is below the threshold. */
    public static final String TARGET_NOT_DETECTED = "Target Not Detected";

    private ViralLoadConstants() {}
}

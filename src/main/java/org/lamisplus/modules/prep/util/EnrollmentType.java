package org.lamisplus.modules.prep.util;

/**
 * Canonical codes stored in {@code prophylaxis_initiation.enrollment_type}.
 * These are the codeset values from PREP_PEP_ENROLLMENT_TYPE — never compare
 * against "PrEP" / "PEP" string literals; use these constants instead.
 *
 * <p>The constants are {@code public static final String} (not an enum) so they
 * can be inlined into JPA {@code @Query} native SQL via string concatenation.
 */
public final class EnrollmentType {
    public static final String PREP = "PREP_PEP_ENROLLMENT_TYPE_PREP";
    public static final String PEP = "PREP_PEP_ENROLLMENT_TYPE_PEP";

    public static boolean isPrep(String code) {
        return PREP.equalsIgnoreCase(code);
    }

    public static boolean isPep(String code) {
        return PEP.equalsIgnoreCase(code);
    }

    /** Maps a UI label ("PrEP" / "PEP") or canonical code to the canonical code. */
    public static String toCanonical(String value) {
        if (value == null) return null;
        if ("PrEP".equalsIgnoreCase(value) || PREP.equalsIgnoreCase(value)) return PREP;
        if ("PEP".equalsIgnoreCase(value) || PEP.equalsIgnoreCase(value)) return PEP;
        return value;
    }

    private EnrollmentType() {}
}

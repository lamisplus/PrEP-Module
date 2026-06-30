package org.lamisplus.modules.prep.util;

/**
 * Canonical keys and values inside {@code hts_encounter.observation} (JSONB).
 * Centralised so the HIV Prevention "Patients" tab filter can be updated in one
 * place if the HTS module renames a field or changes a codeset value.
 *
 * <p>Declared as {@code public static final String} (not an enum) so they can be
 * inlined into JPA {@code @Query} native SQL via string concatenation.
 */
public final class HtsObservationKeys {

    /** JSON keys inside {@code hts_encounter.observation}. */
    public static final String KEY_INITIAL_HIV_TEST = "initialHivTest";
    public static final String KEY_CONFIRMATORY_HIV_TEST = "confirmatoryHivTest";
    public static final String KEY_HIV_EARLY_DETECT_RESULT = "hivEarlyDetectResult";
    public static final String KEY_TYPE_OF_HIV_TEST_DONE = "typeOfHivTestDone";
    public static final String KEY_PREGNANCY_STATUS = "pregnancyStatus";

    /**
     * PMTCT-HTS variant keys. Records captured on the PMTCT HTS form store the
     * early-detect result and the test type under different property names than
     * the standalone HTS module ({@code hivEarlyDetect} / {@code typeOfHivTest}
     * vs {@code hivEarlyDetectResult} / {@code typeOfHivTestDone}). The codeset
     * VALUES are identical, only the keys differ.
     */
    public static final String KEY_HIV_EARLY_DETECT_PMTCT = "hivEarlyDetect";
    public static final String KEY_TYPE_OF_HIV_TEST_PMTCT = "typeOfHivTest";

    /**
     * STI_HIV_RESULT codeset values — used by {@link #KEY_INITIAL_HIV_TEST}.
     * The HTS form saves the initial-test field with these codes.
     */
    public static final String INITIAL_HIV_TEST_NEGATIVE = "STI_HIV_RESULT_NEGATIVE";
    public static final String INITIAL_HIV_TEST_POSITIVE = "STI_HIV_RESULT_POSITIVE";

    /**
     * HIV_CONFIRMATORY_TEST_RESULT codeset values — used by
     * {@link #KEY_CONFIRMATORY_HIV_TEST}. The confirmatory-test field is on
     * its own codeset (different from the initial-test STI_HIV_RESULT set).
     */
    public static final String CONFIRMATORY_HIV_TEST_NEGATIVE = "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE";
    public static final String CONFIRMATORY_HIV_TEST_POSITIVE = "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE";

    /**
     * Early-detect result codes. ANTIBODY-only is a routine reactive result and
     * still qualifies for PrEP; ANTIGEN-only and ANTIGEN+ANTIBODY indicate
     * possible acute infection and restrict the patient to PEP only.
     */
    public static final String EARLY_DETECT_ANTIBODY_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE";
    public static final String EARLY_DETECT_ANTIGEN_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE";
    public static final String EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE";

    /**
     * Type-of-test codes for the HTS encounter. Drives which inclusion branch
     * applies on the Patient tab:
     *   • RAPID_ANTIBODY    — accept a negative initial / confirmatory test OR a
     *                         reactive early-detect marker.
     *   • HIV_EARLY_DETECT  — must have a reactive early-detect re
     * sult AND a
     *                         negative confirmatory. Antigen-only / antigen+
     *                         antibody markers further restrict the row to PEP.
     */
    public static final String KEY_TYPE_OF_HIV_TEST_DONE_VALUE_RAPID_ANTIBODY = "TYPE_OF_HIV_TEST_RAPID_ANTIBODY";
    public static final String KEY_TYPE_OF_HIV_TEST_DONE_VALUE_HIV_EARLY_DETECT = "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT";

    private HtsObservationKeys() {}
}

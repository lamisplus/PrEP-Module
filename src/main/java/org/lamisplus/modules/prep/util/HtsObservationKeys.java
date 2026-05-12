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

    /** STI_HIV_RESULT codeset values — shared by both initialHivTest and confirmatoryHivTest. */
    public static final String HIV_RESULT_NEGATIVE = "STI_HIV_RESULT_NEGATIVE";
    public static final String HIV_RESULT_POSITIVE = "STI_HIV_RESULT_POSITIVE";

    /** Early-detect results indicating acute infection (drive PrEP-side eligibility). */
    public static final String EARLY_DETECT_ANTIGEN_REACTIVE = "Antigen Reactive";
    public static final String EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE = "Antigen + Antibody Reactive";

    private HtsObservationKeys() {}
}

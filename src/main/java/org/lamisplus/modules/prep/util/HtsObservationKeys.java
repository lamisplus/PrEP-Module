package org.lamisplus.modules.prep.util;


public final class HtsObservationKeys {

    /** JSON keys inside {@code hts_encounter.observation}. */
    public static final String KEY_INITIAL_HIV_TEST = "initialHivTest";
    public static final String KEY_CONFIRMATORY_HIV_TEST = "confirmatoryHivTest";
    public static final String KEY_HIV_EARLY_DETECT_RESULT = "hivEarlyDetectResult";
    public static final String KEY_TYPE_OF_HIV_TEST_DONE = "typeOfHivTestDone";
    public static final String KEY_PREGNANCY_STATUS = "pregnancyStatus";

    // PMTCT-entered HTS records now use the same observation keys as HTS
    // (hivEarlyDetectResult / typeOfHivTestDone), so the old PMTCT-only keys
    // ("hivEarlyDetect" / "typeOfHivTest") are no longer referenced.

    public static final String INITIAL_HIV_TEST_NEGATIVE = "STI_HIV_RESULT_NEGATIVE";
    public static final String INITIAL_HIV_TEST_POSITIVE = "STI_HIV_RESULT_POSITIVE";


    public static final String CONFIRMATORY_HIV_TEST_NEGATIVE = "HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE";
    public static final String CONFIRMATORY_HIV_TEST_POSITIVE = "HIV_CONFIRMATORY_TEST_RESULT_POSITIVE";

 
    public static final String EARLY_DETECT_ANTIBODY_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIBODY_REACTIVE";
    public static final String EARLY_DETECT_ANTIGEN_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIGEN_REACTIVE";
    public static final String EARLY_DETECT_ANTIGEN_AND_ANTIBODY_REACTIVE = "HIV_EARLY_DETECT_RESULT_ANTIGEN_+_ANTIBODY_REACTIVE";

    public static final String KEY_TYPE_OF_HIV_TEST_DONE_VALUE_RAPID_ANTIBODY = "TYPE_OF_HIV_TEST_RAPID_ANTIBODY";
    public static final String KEY_TYPE_OF_HIV_TEST_DONE_VALUE_HIV_EARLY_DETECT = "TYPE_OF_HIV_TEST_HIV_EARLY_DETECT";

    private HtsObservationKeys() {}
}

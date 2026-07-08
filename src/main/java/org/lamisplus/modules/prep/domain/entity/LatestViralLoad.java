package org.lamisplus.modules.prep.domain.entity;

/**
 * Native-query projection for the patient's latest viral load. Column aliases in
 * {@code ViralLoadRepository#findLatestViralLoad} must match these getter names.
 */
public interface LatestViralLoad {
    /** Raw {@code laboratory_result.result_reported} for the latest VL. */
    String getViralLoad();
}

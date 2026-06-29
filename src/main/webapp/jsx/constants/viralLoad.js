// Viral-load interpretation labels. Mirrors the backend ViralLoadConstants.java
// (the API returns these exact strings in `viralLoadResult`). Change the wording
// here in one place if the display text ever needs to change.
export const VIRAL_LOAD_TARGET_DETECTED = "Target Detected";
export const VIRAL_LOAD_TARGET_NOT_DETECTED = "Target NO Detected";

// True when the latest VL result indicates target detected (the trigger for
// hiding PEP service forms on the dashboard menu).
export const isTargetDetected = viralLoadResult =>
  viralLoadResult === VIRAL_LOAD_TARGET_DETECTED;

// Maps the API's viralLoadResult onto the display string. Routing display
// through here keeps the on-screen wording governed by the constants above.
export const viralLoadDisplay = viralLoadResult => {
  switch (viralLoadResult) {
    case VIRAL_LOAD_TARGET_DETECTED:
      return VIRAL_LOAD_TARGET_DETECTED;
    case VIRAL_LOAD_TARGET_NOT_DETECTED:
      return VIRAL_LOAD_TARGET_NOT_DETECTED;
    default:
      return viralLoadResult || "";
  }
};

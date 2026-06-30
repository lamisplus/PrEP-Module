import React, { useState, useEffect } from "react";
import { Card, CardBody, FormGroup, Label, Input } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import { fetchDiscontinuationCodesets } from "../../../apiCalls/hivPreventionCodesets";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
import { toEnrollmentTypeCode, ENROLLMENT_TYPE_PREP } from "../../constants/enrollmentType";
import { isValidHtsEncounter, normalizeHtsObservation } from "../../../Utils/htsEncounter";
import { toHivTestResultCode } from "../../../Utils/htsResultMapper";
import { isTargetDetected } from "../../constants/viralLoad";
import "react-widgets/dist/css/react-widgets.css";
import moment from "moment";
import { Spinner } from "reactstrap";
import { useStyles } from "../../../hooks/styles/prepDiscontinuationsInterruptions/useStyles";

const PrEPDiscontinuationsInterruptions = props => {
  const patientObj = props.patientObj;
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  // Prefer the screeningType from the active route (set when user clicked a tab) so PrEP/PEP context is preserved
  const screeningTypeFromRoute = props.activeContent?.screeningType || "";
  const [enrollmentType, setEnrollmentType] = useState(
    screeningTypeFromRoute || patientObj?.enrollmentType || ""
  );
  const [objValues, setObjValues] = useState({
    interruptionType: "",
    // Distinct date fields per interruption type. interruptionDate (Date
    // Stopped) is kept for backward compatibility but only used when the
    // selected type is "Stopped"; the rest map 1:1 to new columns.
    interruptionDate: "",     // Date Stopped (Stopped)
    dateDefaulted: "",        // Date Defaulted (Default)
    dateOfDeath: "",          // Date of Death (Dead) — paired with dateClientDied below
    dateReferred: "",         // Date Referred (Referred) — paired with dateClientReferredOut below
    dateSeroConverted: "",    // Date Seroconverted (Seroconverted)
    why: "",
    dateRestartPlacedBackMedication: "",
    pepCompletion: "",
    followUpVisitDate: "",
    hivResult: "",
    earlyDetectViralLoadResult: "",
    dateClientReferredOut: "",
    facilityReferredTo: "",
    dateClientDied: "",
    sourceOfDeathInfo: "",
    causeOfDeath: "",
    personId: patientObj.personId || props.patientObj.id,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [patientDto, setPatientDto] = useState();
  const [codeset, setCodeset] = useState({});

  const isPEP = enrollmentType === "PEP";
  const isPrEP = enrollmentType === "PrEP" || !isPEP;

  // --- Skip logic derived from current form state ---
  const isStopped = objValues.interruptionType?.toLowerCase().includes("stopped");
  const isDefault = objValues.interruptionType?.toLowerCase().includes("default");
  const isDead = objValues.interruptionType?.toLowerCase().includes("dead");
  const isReferred = objValues.interruptionType?.toLowerCase().includes("referred");
  const isSeroconverted = objValues.interruptionType
    ?.toLowerCase().includes("seroconvert");
  // Each interruption type now has its own date input; the legacy
  // "showStoppedDefaultFields" lumping is gone so Default no longer reuses
  // the Date Stopped label.
  const showStoppedFields = isStopped;
  const showDefaultFields = isDefault;
  const showDeadFields = isDead;
  const showReferredFields = isReferred;
  const showSeroconvertedFields = isSeroconverted;
  // pepCompletion is persisted as a YES_NO codeset code (YES_NO_YES /
  // YES_NO_NO) so the backend PEP-tab query can match exact codes.
  const showFollowUpVisitDate = objValues.pepCompletion === "YES_NO_YES";

  // Latest HTS for this patient — used to auto-populate HIV Result when PEP
  // Completion = YES, exactly like the PEP follow-up form. Best-effort: when no
  // valid HTS is attached the field simply stays manual.
  const latestHts = props.patientObj?.latestHtsResult || null;
  const htsObs = normalizeHtsObservation(latestHts?.observation);
  const isFromHts = isValidHtsEncounter(latestHts);

  // Early Detect Viral Load now keys off the HIV Result being "Early Detect"
  // (HIV_TEST_RESULT_EARLY_DETECT) — NOT "Positive". When hidden it is not
  // validated. A code or a display containing "early detect" both qualify.
  const isEarlyDetectHivResult = code =>
    (code || "")
      .toString()
      .toLowerCase()
      .replace(/\s/g, "_")
      .includes("early_detect");
  const showEarlyDetectFields = isEarlyDetectHivResult(objValues.hivResult);

  useEffect(() => {
    GetPatientDTOObj();
    fetchDiscontinuationCodesets().then(data => setCodeset(data));
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      setDisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, []);

  useEffect(() => {
    GetPatientInterruption(props.activeContent.id);
  }, [props.activeContent.id]);

  // When PEP Completion = YES, auto-populate HIV Result from the latest HTS
  // encounter (same mapping the PEP follow-up form uses). Clears the Early
  // Detect Viral Load value when the resolved result isn't Early Detect.
  useEffect(() => {
    if (objValues.pepCompletion !== "YES_NO_YES") return;
    if (!isFromHts) return;
    const code = toHivTestResultCode(
      htsObs.confirmatoryHivTest || htsObs.initialHivTest,
      htsObs.typeOfHivTestDone
    );
    if (!code) return;
    setObjValues(prev => ({
      ...prev,
      hivResult: code,
      earlyDetectViralLoadResult: isEarlyDetectHivResult(code)
        ? prev.earlyDetectViralLoadResult
        : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objValues.pepCompletion, latestHts?.uuid]);

  // Map the viral-load API result ("Target Detected" / "Target NO Detected")
  // onto an EARLY_DETECT_VIRAL_LOAD_RESULT codeset option. Robust to wording
  // differences: normalizes case/spacing/underscores and treats "NOT" === "NO",
  // so "Target NO Detected", "Target Not Detected" and "TARGET_NOT_DETECTED"
  // all compare equal. Tries an exact (normalized) match on display OR code
  // first, then falls back to a detected / not-detected heuristic.
  const normalizeVl = s =>
    (s || "")
      .toString()
      .toLowerCase()
      .replace(/[_\s]+/g, " ")
      .replace(/\bnot\b/g, "no") // unify NOT/NO
      .trim();

  const earlyDetectVlCodeFromViralLoad = (viralLoadResult, options) => {
    if (!viralLoadResult || !Array.isArray(options) || options.length === 0) {
      return "";
    }
    const target = normalizeVl(viralLoadResult); // e.g. "target no detected"
    // 1) exact normalized match against display or code
    let match = options.find(
      opt => normalizeVl(opt.display) === target || normalizeVl(opt.code) === target
    );
    if (match) return match.code;
    // 2) detected / not-detected heuristic
    const wantDetected = isTargetDetected(viralLoadResult);
    const isNotDetected = s => /\bno\b.*detect|undetect/.test(normalizeVl(s));
    const hasDetect = s => /detect/.test(normalizeVl(s));
    match = options.find(opt => {
      const hay = `${opt.display || ""} ${opt.code || ""}`;
      if (!hasDetect(hay)) return false;
      return wantDetected ? !isNotDetected(hay) : isNotDetected(hay);
    });
    return match?.code || "";
  };

  // Auto-populate Early Detect Viral Load Result from the latest viral load
  // whenever the HIV Result is Early Detect.
  useEffect(() => {
    if (!showEarlyDetectFields) return;
    const code = earlyDetectVlCodeFromViralLoad(
      props.viralLoad?.viralLoadResult,
      codeset?.EARLY_DETECT_VIRAL_LOAD_RESULT
    );
    if (code) {
      setObjValues(prev => ({ ...prev, earlyDetectViralLoadResult: code }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showEarlyDetectFields,
    props.viralLoad?.viralLoadResult,
    codeset?.EARLY_DETECT_VIRAL_LOAD_RESULT,
  ]);

  // When the latest viral load is detected (> 1000 → "Target Detected"), the
  // client has not completed PEP successfully, so PEP Completion auto-populates
  // to YES. Only on a new record (don't override a saved value on view/edit);
  // the user can still change it afterwards.
  useEffect(() => {
    if (props.activeContent?.id) return; // edit/view — keep the saved value
    if (!isTargetDetected(props.viralLoad?.viralLoadResult)) return;
    setObjValues(prev =>
      prev.pepCompletion === "YES_NO_YES"
        ? prev
        : { ...prev, pepCompletion: "YES_NO_YES" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.viralLoad?.viralLoadResult]);

  const GetPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${
          props.patientObj.personId || props.patientObj.id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(response => {
        setPatientDto(response.data);
        // Only override enrollmentType from patientDto if no route-based type was provided.
        // Normalize the canonical code to a short label (PrEP/PEP) the rest of
        // the component compares against — same caveat as the load path:
        // both canonical codes contain "PEP" as a substring, so suffix-check.
        if (!screeningTypeFromRoute && response.data?.enrollmentType) {
          const raw = String(response.data.enrollmentType).toUpperCase().trim();
          if (raw === "PEP" || raw.endsWith("_PEP")) {
            setEnrollmentType("PEP");
          } else if (raw === "PREP" || raw.endsWith("_PREP")) {
            setEnrollmentType("PrEP");
          } else {
            setEnrollmentType(response.data.enrollmentType);
          }
        }
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const GetPatientInterruption = id => {
    if (!id) return;
    axios
      .get(`${baseUrl}prep-completion/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        const data = response.data || {};
        // Preserve existing keys (e.g. personId default) and merge in the
        // loaded record so view/update renders every entered value.
        setObjValues(prev => ({ ...prev, ...data }));
        // Normalize the canonical enrollment type into the short label this
        // component compares against (drives isPEP / showFollowUpVisitDate /
        // hivResult / pepCompletion visibility). Both canonical codes
        // (PREP_PEP_ENROLLMENT_TYPE_PEP and ..._PREP) contain "PEP" and
        // "PREP" as substrings, so check the suffix instead.
        const raw = data.enrollmentType;
        if (raw) {
          const upper = String(raw).toUpperCase().trim();
          if (upper === "PEP" || upper.endsWith("_PEP")) {
            setEnrollmentType("PEP");
          } else if (upper === "PREP" || upper.endsWith("_PREP")) {
            setEnrollmentType("PrEP");
          }
        }
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });

    // Clear dependent fields when interruptionType changes
    if (name === "interruptionType") {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        interruptionDate: "",
        dateDefaulted: "",
        dateOfDeath: "",
        dateReferred: "",
        dateSeroConverted: "",
        why: "",
        dateRestartPlacedBackMedication: "",
        dateClientDied: "",
        sourceOfDeathInfo: "",
        causeOfDeath: "",
        dateClientReferredOut: "",
        facilityReferredTo: "",
      }));
      return;
    }
    if (name === "pepCompletion" && value !== "YES_NO_YES") {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        followUpVisitDate: "",
      }));
      return;
    }
    // Drop the Early Detect Viral Load value when the HIV Result is no longer
    // Early Detect — it's hidden in that case and must not be saved stale.
    if (name === "hivResult" && !isEarlyDetectHivResult(value)) {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        earlyDetectViralLoadResult: "",
      }));
      return;
    }

    setObjValues({ ...objValues, [name]: value });
  };

  const validate = () => {
    let temp = { ...errors };

    // PrEP: validate interruption type
    if (isPrEP) {
      temp.interruptionType = objValues.interruptionType
        ? ""
        : "This field is required";
    }

    // Stopped fields
    if (showStoppedFields) {
      temp.interruptionDate = objValues.interruptionDate
        ? ""
        : "This field is required";
      temp.why = objValues.why ? "" : "This field is required";
    }

    // Default fields — independent of Stopped: distinct date column.
    if (showDefaultFields) {
      temp.dateDefaulted = objValues.dateDefaulted
        ? ""
        : "This field is required";
      temp.why = objValues.why ? "" : "This field is required";
    }

    // Seroconverted fields
    if (showSeroconvertedFields) {
      temp.dateSeroConverted = objValues.dateSeroConverted
        ? ""
        : "This field is required";
    }

    // Dead fields — `dateClientDied` is explicitly exempt from the required
    // checklist (per the spec), so don't enforce it. Source/Cause stay
    // required because they're the substantive fields for the Dead branch.
    if (showDeadFields) {
      temp.dateClientDied = "";
      temp.sourceOfDeathInfo = objValues.sourceOfDeathInfo
        ? ""
        : "This field is required";
      temp.causeOfDeath = objValues.causeOfDeath
        ? ""
        : "This field is required";
    }

    // Referred fields
    if (showReferredFields) {
      temp.dateClientReferredOut = objValues.dateClientReferredOut
        ? ""
        : "This field is required";
      temp.facilityReferredTo = objValues.facilityReferredTo
        ? ""
        : "This field is required";
    }

    // PEP-only fields
    if (isPEP) {
      temp.pepCompletion = objValues.pepCompletion
        ? ""
        : "This field is required";
      if (showFollowUpVisitDate) {
        temp.followUpVisitDate = objValues.followUpVisitDate
          ? ""
          : "This field is required";
      }
      temp.hivResult = objValues.hivResult ? "" : "This field is required";
      // Only validate Early Detect Viral Load when it is actually shown
      // (HIV Result = Early Detect). Clear any stale error otherwise.
      if (showEarlyDetectFields) {
        temp.earlyDetectViralLoadResult = objValues.earlyDetectViralLoadResult
          ? ""
          : "This field is required";
      } else {
        temp.earlyDetectViralLoadResult = "";
      }
    }

    setErrors({ ...temp });
    return Object.values(temp).every(x => x === "");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    const canonicalEnrollmentType =
      toEnrollmentTypeCode(enrollmentType) || ENROLLMENT_TYPE_PREP;
    // Route the patient's current status into the column matching their arm.
    // PEP enrollments land in previous_pep_status; PrEP (default) into
    // previous_prep_status. The other column is cleared so we don't carry
    // stale per-arm state across discontinuations.
    if (isPEP) {
      objValues.previousPepStatus = props.patientObj?.prepStatus;
      objValues.previousPrepStatus = null;
    } else {
      objValues.previousPrepStatus = props.patientObj?.prepStatus;
      objValues.previousPepStatus = null;
    }
    objValues.enrollmentType = canonicalEnrollmentType;
    // HIV result is no longer denormalised onto the interruption row; we
    // store the linked hts_encounter uuid and resolve it on read. The form's
    // hivResult dropdown is kept for skip-logic but its value isn't persisted.
    objValues.htsEncounterUuid =
      patientDto?.htsEncounterUuid
      || props.patientObj?.htsEncounterUuid
      || props.patientObj?.latestHtsResult?.uuid
      || objValues.htsEncounterUuid;
    // Mirror the type-specific date into interruptionDate so the dashboard's
    // prepStatus SQL (which compares prepi.interruption_date to the latest
    // follow-up encounter_date) flips immediately after save — without this,
    // a "Default" record only sets dateDefaulted and the status stays stale.
    // For PEP Completion the form doesn't ask for an interruptionDate at all,
    // so fall back to followUpVisitDate; without a date we'd save NULL and
    // the uniqueness check (date + person) collides with any prior NULL row.
    if (!objValues.interruptionDate) {
      objValues.interruptionDate =
        objValues.dateDefaulted
        || objValues.dateClientDied
        || objValues.dateClientReferredOut
        || objValues.dateSeroConverted
        || objValues.dateOfDeath
        || objValues.dateReferred
        || objValues.followUpVisitDate
        || "";
    }
    setSaving(true);

    let resolvedEnrollmentUuid = null;
    try {
      const latest = await axios.get(
        `${baseUrl}prep/initiation/latest/${
          props.patientObj.personId || props.patientObj.id
        }?enrollmentType=${encodeURIComponent(canonicalEnrollmentType)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resolvedEnrollmentUuid = latest?.data?.uuid;
    } catch (err) {}
    if (!resolvedEnrollmentUuid) {
      resolvedEnrollmentUuid = patientDto?.uuid;
    }
    if (!resolvedEnrollmentUuid) {
      setSaving(false);
      toast.error(
        `No ${enrollmentType || "PrEP"} initiation found for this patient. Cannot record discontinuation/interruption.`
      );
      return;
    }
    objValues.prepEnrollmentUuid = resolvedEnrollmentUuid;

    if (props.activeContent && props.activeContent.actionType === "update") {
      axios
        .put(
          `${baseUrl}prep-completion/${props.activeContent.id}`,
          objValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then(async response => {
          setSaving(false);
          toast.success(`${enrollmentType === 'PEP' ? 'PEP completion' : 'PrEP discontinuation/interruption'} updated successfully!`);
          if (props.PatientObject) await props.PatientObject();
          props.setActiveContent({
            ...props.activeContent,
            route: "recent-history",
          });
        })
        .catch(error => {
          setSaving(false);
          handleError(error);
        });
    } else {
      axios
        .post(`${baseUrl}prep/interruption`, objValues, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(async response => {
          setSaving(false);
          toast.success(`${enrollmentType === 'PEP' ? 'PEP completion' : 'PrEP discontinuation/interruption'} saved successfully!`);
          if (props.PatientObject) await props.PatientObject();
          props.setActiveContent({
            ...props.activeContent,
            route: "recent-history",
          });
        })
        .catch(error => {
          setSaving(false);
          handleError(error);
        });
    }
  };

  const handleError = error => {
    // Routes every backend error through the shared extractor so users see
    // descriptive messages (e.g. "A discontinuation / interruption has
    // already been recorded for this client on 13 May 2026") instead of
    // generic "Something went wrong".
    toast.error(extractErrorMessage(error));
  };

  const today = moment(new Date()).format("YYYY-MM-DD");
  const minDate =
    patientDto && patientDto.dateEnrolled ? patientDto.dateEnrolled : "";

  const formTitle = isPEP
    ? "PEP Completion"
    : "PrEP Discontinuation/Interruption";

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              <h2>{formTitle}</h2>

              {/* PrEP Interruptions Type - shown for PrEP only */}
              {isPrEP && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      PrEP Interruptions{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="interruptionType"
                      id="interruptionType"
                      onChange={handleInputChange}
                      value={objValues.interruptionType}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      {(codeset?.PREP_DISCONTINUATION_TYPE || []).map(item => (
                        <option key={item.code} value={item.code}>{item.display}</option>
                      ))}
                    </Input>
                    {errors.interruptionType !== "" ? (
                      <span className={classes.error}>
                        {errors.interruptionType}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {/* Stopped fields: Date Stopped, Why, Date of Restart (PEP) */}
              {showStoppedFields && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Date Stopped <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="date"
                        name="interruptionDate"
                        id="interruptionDate"
                        onKeyDown={e => e.preventDefault()}
                        min={minDate}
                        max={today}
                        onChange={handleInputChange}
                        value={objValues.interruptionDate}
                        disabled={disabledField}
                      />
                      {errors.interruptionDate !== "" ? (
                        <span className={classes.error}>
                          {errors.interruptionDate}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Why <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="select"
                        name="why"
                        id="why"
                        onChange={handleInputChange}
                        value={objValues.why}
                          disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {(codeset?.PREP_DISCONTINUATION_REASON || []).map(item => (
                          <option key={item.code} value={item.code}>{item.display}</option>
                        ))}
                      </Input>
                      {errors.why !== "" ? (
                        <span className={classes.error}>{errors.why}</span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  {/* Date of Restart: PEP-only and never required when PrEP is Stopped */}
                  {isPEP && (
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Date of Restart (If Placed Back on Medication)
                        </Label>
                        <Input
                          type="date"
                          name="dateRestartPlacedBackMedication"
                          id="dateRestartPlacedBackMedication"
                          onKeyDown={e => e.preventDefault()}
                          min={minDate}
                          max={today}
                          onChange={handleInputChange}
                          value={objValues.dateRestartPlacedBackMedication}
                          disabled={disabledField}
                        />
                      </FormGroup>
                    </div>
                  )}
                </>
              )}

              {/* Default fields: Date Defaulted + Why. Distinct from Stopped
                  so the date column stores the defaulted-on date, not the
                  stopped-on date. */}
              {showDefaultFields && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Date Defaulted <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="date"
                        name="dateDefaulted"
                        id="dateDefaulted"
                        onKeyDown={e => e.preventDefault()}
                        min={minDate}
                        max={today}
                        onChange={handleInputChange}
                        value={objValues.dateDefaulted}
                        disabled={disabledField}
                      />
                      {errors.dateDefaulted !== "" ? (
                        <span className={classes.error}>
                          {errors.dateDefaulted}
                        </span>
                      ) : ""}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Why <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="select"
                        name="why"
                        id="why"
                        onChange={handleInputChange}
                        value={objValues.why}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {(codeset?.PREP_DISCONTINUATION_REASON || []).map(item => (
                          <option key={item.code} value={item.code}>{item.display}</option>
                        ))}
                      </Input>
                      {errors.why !== "" ? (
                        <span className={classes.error}>{errors.why}</span>
                      ) : ""}
                    </FormGroup>
                  </div>
                </>
              )}

              {/* Seroconverted: just the date the client seroconverted. */}
              {showSeroconvertedFields && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Date Seroconverted <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="date"
                      name="dateSeroConverted"
                      id="dateSeroConverted"
                      onKeyDown={e => e.preventDefault()}
                      min={minDate}
                      max={today}
                      onChange={handleInputChange}
                      value={objValues.dateSeroConverted}
                      disabled={disabledField}
                    />
                    {errors.dateSeroConverted !== "" ? (
                      <span className={classes.error}>
                        {errors.dateSeroConverted}
                      </span>
                    ) : ""}
                  </FormGroup>
                </div>
              )}

              {/* Dead fields: Date Client Died, Source of Death Information */}
              {showDeadFields && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Date Client Died
                      </Label>
                      <Input
                        type="date"
                        name="dateClientDied"
                        id="dateClientDied"
                        onKeyDown={e => e.preventDefault()}
                        min={minDate}
                        max={today}
                        onChange={handleInputChange}
                        value={objValues.dateClientDied}
                          disabled={disabledField}
                      />
                      {errors.dateClientDied !== "" ? (
                        <span className={classes.error}>
                          {errors.dateClientDied}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Source of Death Information{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="text"
                        name="sourceOfDeathInfo"
                        id="sourceOfDeathInfo"
                        placeholder="Enter source of death information"
                        onChange={handleInputChange}
                        value={objValues.sourceOfDeathInfo}
                        disabled={disabledField}
                      />
                      {errors.sourceOfDeathInfo !== "" ? (
                        <span className={classes.error}>
                          {errors.sourceOfDeathInfo}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Cause of Death{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Label>
                      <select
                        className="form-control"
                        name="causeOfDeath"
                        id="causeOfDeath"
                        onChange={handleInputChange}
                        value={objValues.causeOfDeath}
                        disabled={disabledField}
                        style={{
                          border: "1px solid #014D88",
                          borderRadius: "0.2rem",
                        }}
                      >
                        <option value="">Select</option>
                        {(codeset?.PREP_DISCONTINUATION_CAUSE_OF_DEATH || []).map(item => (
                          <option key={item.code} value={item.code}>
                            {item.display}
                          </option>
                        ))}
                      </select>
                      {errors.causeOfDeath !== "" ? (
                        <span className={classes.error}>
                          {errors.causeOfDeath}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {/* Referred fields: Date Client Referred Out, Facility Referred To */}
              {showReferredFields && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Date Client Referred Out{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="date"
                        name="dateClientReferredOut"
                        id="dateClientReferredOut"
                        onKeyDown={e => e.preventDefault()}
                        min={minDate}
                        max={today}
                        onChange={handleInputChange}
                        value={objValues.dateClientReferredOut}
                          disabled={disabledField}
                      />
                      {errors.dateClientReferredOut !== "" ? (
                        <span className={classes.error}>
                          {errors.dateClientReferredOut}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        Facility Referred To{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="text"
                        name="facilityReferredTo"
                        id="facilityReferredTo"
                        placeholder="Enter facility name"
                        onChange={handleInputChange}
                        value={objValues.facilityReferredTo}
                        disabled={disabledField}
                      />
                      {errors.facilityReferredTo !== "" ? (
                        <span className={classes.error}>
                          {errors.facilityReferredTo}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>
                </>
              )}

              {/* PEP-only fields: PEP Completion, Follow Up, HIV Result */}
              {isPEP && (
                <>
                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        PEP Completion{" "}
                        <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="select"
                        name="pepCompletion"
                        id="pepCompletion"
                        onChange={handleInputChange}
                        value={objValues.pepCompletion}
                        disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {/* Drive from the YES_NO codeset so we save the
                            canonical codes (YES_NO_YES / YES_NO_NO) that the
                            PEP-tab query matches against. */}
                        {(codeset?.YES_NO || []).map(item => (
                          <option key={item.code} value={item.code}>
                            {item.display}
                          </option>
                        ))}
                      </Input>
                      {errors.pepCompletion !== "" ? (
                        <span className={classes.error}>
                          {errors.pepCompletion}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  {showFollowUpVisitDate && (
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Follow Up Visit Date{" "}
                          <span style={{ color: "red" }}>*</span>
                        </Label>
                        <Input
                          type="date"
                          name="followUpVisitDate"
                          id="followUpVisitDate"
                          onKeyDown={e => e.preventDefault()}
                          min={minDate}
                          onChange={handleInputChange}
                          value={objValues.followUpVisitDate}
                          disabled={disabledField}
                        />
                        {errors.followUpVisitDate !== "" ? (
                          <span className={classes.error}>
                            {errors.followUpVisitDate}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  )}

                  <div className="form-group mb-3 col-md-6">
                    <FormGroup>
                      <Label>
                        HIV Result <span style={{ color: "red" }}>*</span>
                      </Label>
                      <Input
                        type="select"
                        name="hivResult"
                        id="hivResult"
                        onChange={handleInputChange}
                        value={objValues.hivResult}
                          disabled={disabledField}
                      >
                        <option value="">Select</option>
                        {(codeset?.HIV_TEST_RESULT || []).map(item => (
                          <option key={item.code} value={item.code}>{item.display}</option>
                        ))}
                      </Input>
                      {errors.hivResult !== "" ? (
                        <span className={classes.error}>
                          {errors.hivResult}
                        </span>
                      ) : (
                        ""
                      )}
                    </FormGroup>
                  </div>

                  {showEarlyDetectFields && (
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <Label>
                          Early Detect Viral Load Result{" "}
                          <span style={{ color: "red" }}>*</span>
                        </Label>
                        <Input
                          type="select"
                          name="earlyDetectViralLoadResult"
                          id="earlyDetectViralLoadResult"
                          onChange={handleInputChange}
                          value={objValues.earlyDetectViralLoadResult}
                              disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {(codeset?.EARLY_DETECT_VIRAL_LOAD_RESULT || []).map(item => (
                            <option key={item.code} value={item.code}>{item.display}</option>
                          ))}
                        </Input>
                        {errors.earlyDetectViralLoadResult !== "" ? (
                          <span className={classes.error}>
                            {errors.earlyDetectViralLoadResult}
                          </span>
                        ) : (
                          ""
                        )}
                      </FormGroup>
                    </div>
                  )}
                </>
              )}
            </div>
            {saving ? <Spinner /> : ""}
            <br />
            {props.activeContent.actionType !== "view" && (
              <>
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  style={{ backgroundColor: "#014d88", fontWeight: "bolder" }}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Save</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Saving...
                    </span>
                  )}
                </MatButton>
                <MatButton
                  variant="contained"
                  className={classes.button}
                  startIcon={<CancelIcon />}
                  onClick={props.toggle}
                  style={{ backgroundColor: "#992E62" }}
                >
                  <span style={{ textTransform: "capitalize", color: "#fff" }}>
                    {" "}
                    Cancel{" "}
                  </span>
                </MatButton>
              </>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrEPDiscontinuationsInterruptions;

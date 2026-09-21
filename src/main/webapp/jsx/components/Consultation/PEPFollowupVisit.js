import React, { useState, useEffect, useRef, useMemo } from "react";
import { Grid, Segment, Label } from "semantic-ui-react";
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
import { ENROLLMENT_TYPE_PEP } from "../../constants/enrollmentType";
import {
  MAX_REFILL_DAYS,
  MIN_REFILL_DAYS,
  blockNonNumericRefillDaysKeys,
  withRefillDaysGuard,
  withRefillDaysPasteGuard,
} from "../../constants/refillDays";
import { toHivTestResultCode } from "../../../Utils/htsResultMapper";
import { isValidHtsEncounter, normalizeHtsObservation } from "../../../Utils/htsEncounter";
import HtsWarningModal from "../../../Reusables/HtsWarningModal";
import { Button as MatButton } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import moment from "moment";
import { formToast as toast } from "../../constants/formToast";
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { useStyles } from "../../../hooks/styles/prepVisit/useStyle";
import { Formik } from "formik";
import * as Yup from "yup";
import { fetchPEPFollowupCodesets } from "../../../apiCalls/hivPreventionCodesets";

const inputStyle = {
  border: "1px solid #014D88",
  borderRadius: "0.25rem",
};

const inputGroupLeftStyle = {
  backgroundColor: "#014D88",
  color: "#fff",
  border: "1px solid #014D88",
  borderRadius: "0rem",
  borderTopLeftRadius: "0.25rem",
  borderBottomLeftRadius: "0.25rem",
};

const inputGroupRightStyle = {
  backgroundColor: "#014D88",
  color: "#fff",
  border: "1px solid #014D88",
  borderRadius: "0rem",
  borderTopRightRadius: "0.25rem",
  borderBottomRightRadius: "0.25rem",
};

const inputGroupMiddleStyle = {
  border: "1px solid #014D88",
  borderRadius: "0rem",
};

// Builds the validation schema with the same set of fields as the rendered
// form. `isFemalePatient` toggles Pregnancy Status; `isFromHts` skips
// validating HTS-driven fields (HIV Status at Exposure, Pregnancy Status)
// because they're read-only and sourced from the latest hts_encounter.
const buildValidationSchema = (isFemalePatient, isFromHts) =>
  Yup.object().shape({
    encounterDate: Yup.string().required("This field is required"),
    modeOfExposure: Yup.string().required("This field is required"),
    durationBeforePep: Yup.string().required("This field is required"),
    systolic: Yup.string().required("This field is required"),
    diastolic: Yup.string().required("This field is required"),
    // Pregnancy Status and HIV Status at Exposure are sourced from the linked
    // hts_encounter — a soft dependency. Never block submission on them
    // (migrated records may have no valid HTS); the user is warned via the
    // HTS modal instead.
    pregnant: Yup.string(),
    hivStatusAtExposure: Yup.string(),
    riskReductionServices: Yup.string().required("This field is required"),
    adherenceLevel: Yup.string().required("This field is required"),
    pepRegimen: Yup.string().required("This field is required"),
    dateStartPep: Yup.string().required("This field is required"),
    dateStopPep: Yup.string().required("This field is required"),
    nextAppointment: Yup.string().required("This field is required"),
    healthCareWorkerSignature: Yup.string().required("This field is required"),
    whyAdherenceLevelPoor: Yup.string().when("adherenceLevel", {
      is: val =>
        val?.toUpperCase()?.includes("POOR") ||
        val?.toUpperCase()?.includes("FAIR"),
      then: schema => schema.required("This field is required"),
      otherwise: schema => schema,
    }),
  });

const INITIAL_VALUES = {
  encounterDate: "",
  modeOfExposure: "",
  durationBeforePep: "",
  systolic: "",
  diastolic: "",
  hivStatusAtExposure: "",
  pepNotedSideEffects: [],
  syndromicStiScreening: "",
  syndromicScreening: "",
  otherSyndromicStiScreening: "",
  riskReductionServices: "",
  adherenceLevel: "",
  whyAdherenceLevelPoor: "",
  otherReasonForPoorFairAdherence: "",
  pepRegimen: "",
  dateStartPep: "",
  dateStopPep: "",
  // REPLACED duration. Refill supply in DAYS; defaults to the 28-day PEP course.
  refillDays: "",
  followupHivTestResults: [],
  nextAppointment: "",
  healthCareWorkerSignature: "",
  pregnant: "",
  personId: "",
};

// PEP is a fixed 28-day course, so this is both the form default and the
// value the migration pins existing PEP rows to.
const PEP_DEFAULT_REFILL_DAYS = "28";

const PEPFollowupVisit = props => {
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codeset, setCodeset] = useState({});
  const [notedSideEffects, setNotedSideEffects] = useState([]);
  const [syndromicStiSelected, setSyndromicStiSelected] = useState([]);
  const [patientDto, setPatientDto] = useState();
  // The patient's most recent PRIOR PEP follow-up visit (excluding the record
  // currently being edited). Source for the carry-forward read-only fields
  // that aren't stored on the initiation record — Mode of Exposure, Duration
  // before PEP provided, Date of Stop of PEP, Duration of PEP.
  const [latestPepFollowup, setLatestPepFollowup] = useState(null);
  // The first three PEP follow-up visits after the latest PEP initiation, each
  // with its HTS observation — used to auto-populate the 1st/2nd/3rd follow-up
  // HIV result rows (replaces the manual add/edit list). Persisted (as the list
  // of hts_encounter uuids) when this form is saved.
  const [initialFollowupHtsResults, setInitialFollowupHtsResults] = useState([]);

  // Pregnancy Status and HIV Status at Exposure are sourced from the latest
  // hts_encounter linked to the patient's PEP initiation. `loadedHts` carries
  // it on edit/view (the saved follow-up record links to the initiation, which
  // carries the htsEncounterUuid); on create the Patient grid ships
  // latestHtsResult directly on the row.
  const [loadedHts, setLoadedHts] = useState(null);
  const latestHts = props.patientObj?.latestHtsResult || loadedHts;
  // Normalised once per HTS record (keyed on uuid) so migrated/community
  // encounters auto-populate the same as natively-captured ones — the raw
  // observation stores the HIV result on finalHivTestResult and a space-joined
  // pregnancy/breastfeeding string the form fields can't read directly.
  const htsObs = useMemo(
    () => normalizeHtsObservation(latestHts?.observation),
    [latestHts?.uuid]
  );
  // "HTS found" is decided by whether the linked hts_encounter resolved from
  // htsEncounterUuid is valid/properly structured. Migrated records often have
  // a dangling uuid or malformed encounter — HTS is then treated as absent
  // (fields editable, not required) and a non-blocking modal is shown.
  const isFromHts = isValidHtsEncounter(latestHts);
  // The hard block only applies when creating a new visit (no record id).
  // Existing records can always be viewed/edited even if their HTS is missing.
  // (htsCandidateUuid / htsFetchPending are computed below.)
  const isCreateMode = !props.activeContent?.id;
  // A prior follow-up exists → the carry-forward fields are locked (read-only)
  // to its values. On the very first follow-up (no prior) they stay editable so
  // the user can supply them; from then on they're inherited and read-only.
  const hasPriorFollowup = !!latestPepFollowup;

  // Visit date floor: never earlier than enrollment AND never earlier than the
  // latest HTS date that auto-populates this form (whichever is later). ISO
  // YYYY-MM-DD sorts chronologically.
  const visitDateMin =
    [patientDto?.dateEnrolled, latestHts?.dateOfVisit]
      .filter(Boolean)
      .map(d => moment(d).format("YYYY-MM-DD"))
      .sort()
      .pop() || "";

  const [hivTestEntries, setHivTestEntries] = useState([]);
  const [hivTestInput, setHivTestInput] = useState({ test: "", result: "" });
  const [editingHivTestIndex, setEditingHivTestIndex] = useState(null);

  const [vitalClinicalSupport, setVitalClinicalSupport] = useState({
    systolic: "",
    diastolic: "",
  });

  const [formInitialValues, setFormInitialValues] = useState({
    ...INITIAL_VALUES,
    personId: props.patientObj.personId || props.patientObj.id,
  });

  const formikRef = useRef(null);

  // A candidate uuid whose encounter is still being fetched means HTS isn't
  // resolved yet — wait (no timer) rather than hard-block prematurely.
  const htsCandidateUuid =
    formInitialValues?.htsEncounterUuid
    || patientDto?.htsEncounterUuid
    || props.patientObj?.latestHtsResult?.uuid
    || null;
  const htsFetchPending =
    !!htsCandidateUuid &&
    props.patientObj?.latestHtsResult?.uuid !== htsCandidateUuid &&
    loadedHts?.uuid !== htsCandidateUuid;
  // Whether to hard-block the form. Computed synchronously (not via state set in
  // an effect) so the form never paints for a blocked record — otherwise it
  // would flash on screen for a frame before the effect hid it.
  const htsBlocked = isCreateMode && !isFromHts && !htsFetchPending;

  // ── API Calls ──

  const isFemale = () => {
    const sex = props.patientObj?.gender || props.patientObj?.sex || "";
    return sex.toLowerCase() === "female";
  };

  const getPatientDtoObj = () => {
    const personUuid = props.patientObj.personUuid || props.patientObj.uuid;
    // Use the type-aware latest-initiation endpoint so this PEP follow-up form
    // anchors to the patient's latest PEP initiation (not their PrEP record).
    // Keyed by person UUID (stable on every grid row) — the bigint person id
    // could be absent/stale and 404 the person lookup.
    axios
      .get(
        `${baseUrl}prep/initiation/latest/${personUuid}?enrollmentType=${ENROLLMENT_TYPE_PEP}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
      })
      .catch(error => {});
  };

  // Fetch the patient's most recent PEP follow-up visit (of the PEP enrollment
  // type) via the dedicated, type-aware endpoint so its Mode of Exposure /
  // Duration before PEP / Date of Stop of PEP / Duration values can be carried
  // forward (read-only) onto a new follow-up. Only used on create, where the
  // latest record IS the prior; on edit we keep the record's own values.
  const getLatestPriorFollowup = () => {
    const personUuid = props.patientObj.personUuid || props.patientObj.uuid;
    axios
      .get(
        `${baseUrl}pep-followup-visit/latest/${personUuid}?enrollmentType=${ENROLLMENT_TYPE_PEP}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        const row = response?.data || null;
        // Guard against carrying the in-edit record forward onto itself.
        const currentId = props.activeContent?.id;
        if (row && currentId && String(row.id) === String(currentId)) {
          setLatestPepFollowup(null);
        } else {
          setLatestPepFollowup(row);
        }
      })
      .catch(() => setLatestPepFollowup(null));
  };

  const getPatientVisit = async () => {
    if (!props.activeContent.id) return;
    try {
      const response = await axios.get(
        `${baseUrl}pep-followup-visit/${props.activeContent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = JSON.parse(JSON.stringify(response.data));
      if (data.pepNotedSideEffects) {
        setNotedSideEffects(data.pepNotedSideEffects);
      }
      if (data.syndromicStiScreening) {
        setSyndromicStiSelected(
          Array.isArray(data.syndromicStiScreening)
            ? data.syndromicStiScreening
            : [data.syndromicStiScreening]
        );
      }
      if (data.followupHivTestResults && Array.isArray(data.followupHivTestResults)) {
        setHivTestEntries(data.followupHivTestResults);
      }
      setFormInitialValues(prev => ({ ...prev, ...data }));
      if (formikRef.current) {
        formikRef.current.setValues({ ...formikRef.current.values, ...data });
      }
    } catch (error) {}
  };

  // ── Vital sign warning helpers ──

  const handleInputValueCheckSystolic = e => {
    if (e.target.value < 90 || e.target.value > 240) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        systolic:
          "Blood Pressure systolic must not be greater than 240 and less than 90",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, systolic: "" }));
    }
  };

  const handleInputValueCheckDiastolic = e => {
    if (e.target.value < 60 || e.target.value > 140) {
      setVitalClinicalSupport(prev => ({
        ...prev,
        diastolic:
          "Blood Pressure diastolic must not be greater than 140 and less than 60",
      }));
    } else {
      setVitalClinicalSupport(prev => ({ ...prev, diastolic: "" }));
    }
  };

  // ── Noted side effects handler ──
  // "No side effects" / "No STI symptoms/signs" must be mutually exclusive
  // with every other option in their respective lists.
  const NO_SIDE_EFFECTS_CODE = "PREP_SIDE_EFFECTS_NO_SIDE_EFFECTS";
  const NO_STI_CODE = "SYNDROMIC_STI_SCREENING_NO_STI_SYMPTOMSSIGNS";

  const enforceExclusive = (prev, next, exclusiveCode) => {
    const wasExclusive = prev?.includes(exclusiveCode);
    const isExclusive = next?.includes(exclusiveCode);
    if (isExclusive && !wasExclusive) return [exclusiveCode];
    if (wasExclusive && next.length > 1) {
      return next.filter(c => c !== exclusiveCode);
    }
    return next;
  };

  const handleNotedSideEffectsChange = selected => {
    const finalSelection = enforceExclusive(
      notedSideEffects,
      selected,
      NO_SIDE_EFFECTS_CODE
    );
    setNotedSideEffects(finalSelection);
    if (formikRef.current) {
      formikRef.current.setFieldValue("pepNotedSideEffects", finalSelection);
    }
  };

  const handleSyndromicStiChange = selected => {
    const finalSelection = enforceExclusive(
      syndromicStiSelected,
      selected,
      NO_STI_CODE
    );
    setSyndromicStiSelected(finalSelection);
    if (formikRef.current) {
      formikRef.current.setFieldValue("syndromicStiScreening", finalSelection);
    }
  };

  // ── HIV Test Entries handlers ──

  const handleHivTestInputChange = e => {
    setHivTestInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddHivTestEntry = () => {
    if (!hivTestInput.test || !hivTestInput.result) return;
    // Prevent duplicate test types (skip check when editing)
    if (editingHivTestIndex === null) {
      const isDuplicate = hivTestEntries.some(t => t.test === hivTestInput.test);
      if (isDuplicate) {
        toast.error("This test has already been added. Please edit the existing entry instead.");
        return;
      }
    }
    if (editingHivTestIndex !== null) {
      const updated = [...hivTestEntries];
      updated[editingHivTestIndex] = { ...hivTestInput };
      setHivTestEntries(updated);
      setEditingHivTestIndex(null);
    } else {
      setHivTestEntries(prev => [...prev, { ...hivTestInput }]);
    }
    setHivTestInput({ test: "", result: "" });
    if (formikRef.current) {
      const updatedEntries = editingHivTestIndex !== null
        ? hivTestEntries.map((entry, i) => i === editingHivTestIndex ? { ...hivTestInput } : entry)
        : [...hivTestEntries, { ...hivTestInput }];
      formikRef.current.setFieldValue("followupHivTestResults", updatedEntries);
    }
  };

  const handleEditHivTestEntry = index => {
    setHivTestInput({ ...hivTestEntries[index] });
    setEditingHivTestIndex(index);
  };

  const handleDeleteHivTestEntry = index => {
    const updated = hivTestEntries.filter((_, i) => i !== index);
    setHivTestEntries(updated);
    if (formikRef.current) {
      formikRef.current.setFieldValue("followupHivTestResults", updated);
    }
  };

  // Fetch the 1st/2nd/3rd follow-up visits (with HTS) after the latest PEP
  // initiation. Their HIV results auto-populate the read-only list below.
  const getInitialFollowupHtsResults = () => {
    const personUuid = props.patientObj.personUuid || props.patientObj.uuid;
    axios
      .get(`${baseUrl}pep-followup-visit/initial-hts-results/${personUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setInitialFollowupHtsResults(
          Array.isArray(response.data) ? response.data : []
        );
      })
      .catch(() => setInitialFollowupHtsResults([]));
  };

  // Resolve a follow-up visit's HTS observation (raw JSON text) to its HIV
  // result code, reusing the same mapping the rest of the form uses.
  const resolveFollowupHivCode = htsObservation => {
    let obs = htsObservation;
    if (typeof obs === "string") {
      try {
        obs = JSON.parse(obs);
      } catch (e) {
        obs = null;
      }
    }
    const norm = normalizeHtsObservation(obs);
    return (
      toHivTestResultCode(
        norm.confirmatoryHivTest || norm.initialHivTest,
        norm.typeOfHivTestDone
      ) || ""
    );
  };

  const resolveFollowupHivDisplay = htsObservation => {
    const code = resolveFollowupHivCode(htsObservation);
    return (
      codeset?.HIV_TEST_RESULT?.find(v => v.code === code)?.display || code || ""
    );
  };

  const hasPositiveHivResult = initialFollowupHtsResults.some(r =>
    resolveFollowupHivCode(r.htsObservation).toLowerCase().includes("positive")
  );

  // Labels for the Visit column — the same PEP_FOLLOWUP_HIV_TEST_RESULT codeset
  // (timepoints like "3 weeks", "6 weeks"…) the manual "Test" dropdown used,
  // minus the "refer" options. Slot 1 → 1st option, slot 2 → 2nd, slot 3 → 3rd.
  const followupVisitLabels = (codeset?.PEP_FOLLOWUP_HIV_TEST_RESULT || []).filter(
    v => !v.display?.toLowerCase()?.includes("refer")
  );
  const visitLabelFor = slot =>
    followupVisitLabels[slot - 1]?.display ||
    `${slot === 1 ? "1st" : slot === 2 ? "2nd" : "3rd"} Follow-up Visit`;

  // ── Codeset fetch ──

  useEffect(() => {
    fetchPEPFollowupCodesets().then(data => {
      setCodeset(data);
    });
  }, []);

  // ── Data loading ──

  useEffect(() => {
    getPatientDtoObj();
  }, []);

  useEffect(() => {
    getPatientVisit();
    getLatestPriorFollowup();
    getInitialFollowupHtsResults();
    setDisabledField(
      !["update", undefined].includes(props.activeContent.actionType)
    );
  }, [props.activeContent]);

  // Auto-populate the read-only "original PEP course" fields when creating a
  // new follow-up. PEP Regimen + Date of Start of PEP come from the latest PEP
  // initiation (matched on enrollment type via getPatientDtoObj). Mode of
  // Exposure, Duration before PEP, Date of Stop of PEP and Duration of PEP are
  // not stored on the initiation, so they carry forward from the most recent
  // prior follow-up. Only runs on create — edits keep the record's own values.
  useEffect(() => {
    if (!isCreateMode || !formikRef.current) return;
    const setF = formikRef.current.setFieldValue;
    if (patientDto?.prepRegimen) setF("pepRegimen", patientDto.prepRegimen);
    if (patientDto?.datePrepStarted)
      setF("dateStartPep", moment(patientDto.datePrepStarted).format("YYYY-MM-DD"));
    if (latestPepFollowup) {
      if (latestPepFollowup.modeOfExposure)
        setF("modeOfExposure", latestPepFollowup.modeOfExposure);
      if (latestPepFollowup.durationBeforePep)
        setF("durationBeforePep", latestPepFollowup.durationBeforePep);
      if (latestPepFollowup.dateStopPep)
        setF("dateStopPep", moment(latestPepFollowup.dateStopPep).format("YYYY-MM-DD"));
      // REPLACED duration with refillDays; fall back to the legacy column so a
      // follow-up saved before the migration still carries its value forward.
      if (latestPepFollowup.refillDays !== undefined && latestPepFollowup.refillDays !== null)
        setF("refillDays", latestPepFollowup.refillDays);
      else if (latestPepFollowup.duration !== undefined && latestPepFollowup.duration !== null)
        setF("refillDays", latestPepFollowup.duration);
    }
    // Auto-populate the Visit Date with the latest HTS date floor; the user may
    // still pick a later date (the input's `min` blocks earlier ones). Don't
    // override a date the user already chose. Mirror the date-change side
    // effects so Next Appointment / Duration stay consistent.
    if (visitDateMin && !formikRef.current.values?.encounterDate) {
      setF("encounterDate", visitDateMin);
      // Resolve the effective Refill Days: carried forward from a prior follow-up,
      // else the 28-day PEP course. The field stays editable so the user can
      // override it.
      let dur = formikRef.current.values?.refillDays;
      if (!hasPriorFollowup) {
        dur = PEP_DEFAULT_REFILL_DAYS;
        setF("refillDays", dur);
      }
      // Next Appointment = visit date + Refill Days.
      const nextAppt = calculateNextAppointment(visitDateMin, dur);
      if (nextAppt) setF("nextAppointment", nextAppt);
    }
  }, [patientDto, latestPepFollowup, isCreateMode, visitDateMin, hasPriorFollowup]);

  // Pull the linked hts_encounter when the Patient grid didn't already ship one
  // (i.e. edit/view path). Prefer the htsEncounterUuid stored on THIS follow-up
  // record so view/update shows exactly what was captured at the time; fall
  // back to the latest PEP initiation's htsEncounterUuid only if the record
  // doesn't carry one (older rows).
  useEffect(() => {
    const recordHtsUuid = formInitialValues?.htsEncounterUuid;
    const targetUuid = recordHtsUuid || patientDto?.htsEncounterUuid;
    if (!targetUuid) return;
    if (props.patientObj?.latestHtsResult?.uuid === targetUuid) return;
    if (loadedHts?.uuid === targetUuid) return;
    axios
      .get(`${baseUrl}prep/hts-encounter/${targetUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(resp => setLoadedHts(resp?.data || null))
      .catch(() => setLoadedHts(null));
  }, [
    formInitialValues?.htsEncounterUuid,
    patientDto?.htsEncounterUuid,
    props.patientObj?.latestHtsResult?.uuid,
  ]);

  // Auto-populate read-only HTS-sourced fields (Pregnancy Status & HIV Status
  // at Exposure) whenever the resolved hts_encounter changes.
  useEffect(() => {
    if (!isFromHts || !formikRef.current) return;
    if (isFemale() && htsObs.pregnancyStatus) {
      formikRef.current.setFieldValue("pregnant", htsObs.pregnancyStatus);
    }
    // Use the canonical HIV_TEST_RESULT codeset so PEP records autopop
    // consistently with the screening + initiation forms (covers Early Detect
    // too, which the PEP-only codeset didn't have).
    const hivStatus = toHivTestResultCode(
      htsObs.confirmatoryHivTest || htsObs.initialHivTest,
      htsObs.typeOfHivTestDone
    );
    if (hivStatus) {
      formikRef.current.setFieldValue("hivStatusAtExposure", hivStatus);
    }
  }, [latestHts?.uuid]);

  useEffect(() => {
    if (
      props.activeContent.actionType === "" ||
      props.activeContent.actionType === null
    ) {
      if (formikRef.current) {
        formikRef.current.resetForm({
          values: {
            ...INITIAL_VALUES,
            personId: props.patientObj.personId || props.patientObj.id,
          },
        });
      }
      setNotedSideEffects([]);
      setSyndromicStiSelected([]);
      setHivTestEntries([]);
      setHivTestInput({ test: "", result: "" });
      setEditingHivTestIndex(null);
    }
  }, [props.activeContent.actionType]);

  // ── Auto-calculate next appointment from encounterDate + refillDays ──
  // REPLACED: this took a MONTH count and did setMonth(+n), which is what
  // pushed a "28" entered as days ~28 months into the future and left those
  // clients permanently Active (PEP status is decided purely by
  // next_appointment < CURRENT_DATE, PrepPepInitiationRepository.java:1661).
  //
  // const calculateNextAppointment = (encounterDate, durationMonths) => {
  //   if (!encounterDate || !durationMonths || isNaN(Number(durationMonths))) return "";
  //   const date = new Date(encounterDate);
  //   date.setMonth(date.getMonth() + Number(durationMonths));
  //   return date.toISOString().split("T")[0];
  // };
  const calculateNextAppointment = (encounterDate, refillDays) => {
    if (!encounterDate || !refillDays || isNaN(Number(refillDays))) return "";
    const date = new Date(encounterDate);
    date.setDate(date.getDate() + Number(refillDays));
    return date.toISOString().split("T")[0];
  };

  // REPLACED calculateDurationOnPep, which defaulted the field to the number of
  // MONTHS elapsed since enrollment. PEP is a fixed 28-day course, so the
  // default is simply 28 days; there is nothing to derive from the enrolment
  // date.
  //
  // const calculateDurationOnPep = encounterDate => { ...months elapsed... };

  const handleDurationChange = (e, setFieldValue, encounterDate) => {
    const refillDays = e.target.value;
    setFieldValue("refillDays", refillDays);
    const nextAppt = calculateNextAppointment(encounterDate, refillDays);
    if (nextAppt) setFieldValue("nextAppointment", nextAppt);
  };

  const addDaysIso = (encounterDate, days) => {
    if (!encounterDate) return "";
    const date = new Date(encounterDate);
    if (isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const handleEncounterDateChangeForAppt = (e, setFieldValue, refillDays) => {
    const encounterDate = e.target.value;
    setFieldValue("encounterDate", encounterDate);
    // Refill Days — defaults to the 28-day PEP course when no prior follow-up
    // carried a value forward. The field stays editable regardless.
    let effectiveDays = refillDays;
    if (!hasPriorFollowup) {
      effectiveDays = PEP_DEFAULT_REFILL_DAYS;
      setFieldValue("refillDays", PEP_DEFAULT_REFILL_DAYS);
    }
    // Next Appointment = visit date + Refill Days.
    const nextAppt = calculateNextAppointment(encounterDate, effectiveDays);
    if (nextAppt) setFieldValue("nextAppointment", nextAppt);
  };

  // ── Submit ──

  function handleError(error) {
    setSaving(false);
    toast.error(extractErrorMessage(error), {
    });
  }

  const handleFormSubmit = async values => {
    // Hard block: a valid HTS record is required to create a PEP follow-up
    // visit. Edits to existing records are allowed even without HTS. (In
    // practice the form is not rendered when blocked, so this is a defensive
    // guard.)
    if (htsBlocked) {
      return;
    }
    // Manual validation for non-Formik fields
    const manualErrors = [];
    if (!notedSideEffects || notedSideEffects.length === 0) {
      manualErrors.push("Noted Side Effects is required");
    }
    if (!syndromicStiSelected || syndromicStiSelected.length === 0) {
      manualErrors.push("Syndromic STI Screening is required");
    }
    // The 1st/2nd/3rd follow-up HIV results are auto-populated, not entered, so
    // there's no "at least one entry" requirement any more.
    if (manualErrors.length > 0) {
      manualErrors.forEach(msg => toast.error(msg));
      return;
    }

    // HTS ordering guard (create mode): the selected HTS must be dated strictly
    // AFTER the PEP initiation — a follow-up visit happens after initiation.
    // Same-day or earlier is refused; the user must register a new HTS. (The
    // backend also enforces this AND the "later than the previous visit's HTS"
    // rule authoritatively, so the toast here is just immediate feedback.)
    if (isCreateMode) {
      const htsDate = latestHts?.dateOfVisit;
      const initDate = patientDto?.dateEnrolled;
      if (htsDate && initDate && !moment(htsDate).isAfter(moment(initDate), "day")) {
        toast.error(
          "The selected HTS result must be dated later than the PEP initiation. " +
            "A follow-up visit happens after initiation — please register a new HTS " +
            "with a later date and select it."
        );
        return;
      }
    }

    setSaving(true);
    const payload = { ...values };
    payload.pepNotedSideEffects = notedSideEffects;
    payload.syndromicStiScreening = syndromicStiSelected;
    // Save the hts_encounter uuids of the follow-up visits after the latest PEP
    // initiation, INCLUDING the visit being saved now, capped at the first
    // three. So the 1st follow-up stores 1 uuid, the 2nd stores 2, the 3rd
    // stores 3, and the 4th+ keep the first three.
    const followupUuids = initialFollowupHtsResults
      .map(r => r.htsEncounterUuid)
      .filter(Boolean);
    const currentHtsUuid = latestHts?.uuid;
    if (currentHtsUuid && !followupUuids.includes(currentHtsUuid)) {
      followupUuids.push(currentHtsUuid);
    }
    payload.followupHivTestResults = followupUuids.slice(0, 3);
    payload.enrollmentType = ENROLLMENT_TYPE_PEP;
    // Persist the link to the patient's HTS encounter; HIV result and
    // pregnancy status are dereferenced from hts_encounter at read time.
    if (isFromHts && latestHts?.uuid) {
      payload.htsEncounterUuid = latestHts.uuid;
    }

    let resolvedEnrollmentUuid = patientDto?.uuid;
    if (!resolvedEnrollmentUuid) {
      try {
        const latest = await axios.get(
          `${baseUrl}prep/initiation/latest/${
            props.patientObj.personUuid || props.patientObj.uuid
          }?enrollmentType=${ENROLLMENT_TYPE_PEP}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        resolvedEnrollmentUuid = latest?.data?.uuid;
      } catch (e) {}
    }
    if (!resolvedEnrollmentUuid) {
      setSaving(false);
      toast.error(
        "No PEP enrollment found for this patient. Enroll the patient before recording a follow-up visit."
      );
      return;
    }
    payload.prepEnrollmentUuid = resolvedEnrollmentUuid;
    payload.previousPrepStatus = props.patientObj?.prepStatus;
    // Prefer the stable person UUID for backend person resolution on save.
    payload.personUuid = props.patientObj.personUuid || props.patientObj.uuid;

    if (props.activeContent && props.activeContent.actionType === "update") {
      try {
        await axios.put(
          `${baseUrl}pep-followup-visit/${props.activeContent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaving(false);
        toast.success("PEP Follow-up visit updated successfully!", {
        });
        // Refresh the dashboard's patientDetail so the STATUS chip reflects
        // the saved visit immediately (was stale until next grid visit).
        if (props.PatientObject) await props.PatientObject();
        props.setActiveContent({
          ...props.activeContent,
          route: "pep-followup",
          activeTab: "history",
          actionType: "view",
        });
      } catch (error) {
        handleError(error);
      }
    } else {
      try {
        await axios.post(`${baseUrl}pep-followup-visit/clinic-visit`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaving(false);
        toast.success("PEP Follow-up visit saved successfully!", {
        });
        if (props.PatientObject) await props.PatientObject();
        props.setActiveContent({
          ...props.activeContent,
          route: "pep-followup",
          activeTab: "history",
          actionType: "view",
        });
      } catch (error) {
        handleError(error);
      }
    }
  };

  // Hard block: when no valid HTS encounter can be resolved (create mode) the
  // follow-up form must not render at all. We return only the modal, which then
  // overlays the patient dashboard (summary / recent activities) that
  // PatientDetail keeps rendered behind it. "Return to Dashboard" navigates back
  // to recent-history so the form route is exited entirely.
  if (htsBlocked) {
    return (
      <HtsWarningModal
        isOpen
        onReturnToDashboard={() =>
          props.setActiveContent({
            ...props.activeContent,
            route: "recent-history",
          })
        }
      />
    );
  }

  return (
    <div className={`${classes.root} container-fluid`}>
      <div className="row">
        <div className="col-12">
          <h2 className="p-2">PEP Follow-up Visit</h2>
        </div>
      </div>
      <Formik
        innerRef={formikRef}
        initialValues={formInitialValues}
        enableReinitialize
        validationSchema={buildValidationSchema(isFemale(), isFromHts)}
        onSubmit={values => {
          handleFormSubmit(values);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => {
          const getError = field => {
            return touched[field] && errors[field] ? errors[field] : "";
          };

          return (
            <Grid>
              <Grid.Column>
                <Segment>
                  <div className="row">
                    {/* 1. Visit Date — must be on/after the latest PEP initiation */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Visit Date <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          className="form-control"
                          type="date"
                          name="encounterDate"
                          id="encounterDate"
                          onKeyDown={e => e.preventDefault()}
                          value={values.encounterDate}
                          style={inputStyle}
                          onChange={e => handleEncounterDateChangeForAppt(e, setFieldValue, values.refillDays)}
                          min={visitDateMin || patientDto?.dateEnrolled || ""}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          disabled={disabledField}
                        />
                        {getError("encounterDate") && (
                          <span className={classes.error}>
                            {getError("encounterDate")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 2. Mode of Exposure */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Mode of Exposure{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="modeOfExposure"
                          id="modeOfExposure"
                          onChange={handleChange}
                          value={values.modeOfExposure}
                          style={inputStyle}
                          disabled={disabledField || hasPriorFollowup}
                          title={hasPriorFollowup ? "Carried from the previous follow-up visit" : undefined}
                        >
                          <option value="">Select</option>
                          {codeset?.PEP_MODE_OF_EXPOSURE?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("modeOfExposure") && (
                          <span className={classes.error}>
                            {getError("modeOfExposure")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 3. Duration before PEP provided */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Duration before PEP provided{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="durationBeforePep"
                          id="durationBeforePep"
                          onChange={handleChange}
                          value={values.durationBeforePep}
                          style={inputStyle}
                          disabled={disabledField || hasPriorFollowup}
                          title={hasPriorFollowup ? "Carried from the previous follow-up visit" : undefined}
                        >
                          <option value="">Select</option>
                          {codeset?.PEP_DURATION_BEFORE_PEP?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("durationBeforePep") && (
                          <span className={classes.error}>
                            {getError("durationBeforePep")}
                          </span>
                        )}
                        {values.durationBeforePep &&
                          values.durationBeforePep.includes(">72") && (
                            <div
                              style={{
                                marginTop: "0.4rem",
                                color: "#dc3545",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              PEP not recommended after 72 hours.
                            </div>
                          )}
                      </FormGroup>
                    </div>

                    {/* 4. Blood Pressure (mmHg) */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Blood Pressure (mmHg) <span style={{ color: "red" }}> *</span></FormLabelName>
                        <InputGroup>
                          <InputGroupText
                            addonType="append"
                            style={inputGroupLeftStyle}
                          >
                            systolic
                          </InputGroupText>
                          <Input
                            type="number"
                            name="systolic"
                            id="systolic"
                            min="90"
                            max="240"
                            onChange={e => {
                              handleChange(e);
                              handleInputValueCheckSystolic(e);
                            }}
                            value={values.systolic}
                            style={inputGroupMiddleStyle}
                            disabled={disabledField}
                          />
                          <InputGroupText
                            addonType="append"
                            style={{
                              backgroundColor: "#014D88",
                              color: "#fff",
                              border: "1px solid #014D88",
                              borderRadius: "0rem",
                            }}
                          >
                            diastolic
                          </InputGroupText>
                          <Input
                            type="number"
                            name="diastolic"
                            id="diastolic"
                            min={0}
                            max={140}
                            onChange={e => {
                              handleChange(e);
                              handleInputValueCheckDiastolic(e);
                            }}
                            value={values.diastolic}
                            style={{
                              ...inputGroupMiddleStyle,
                              borderTopRightRadius: "0.25rem",
                              borderBottomRightRadius: "0.25rem",
                            }}
                            disabled={disabledField}
                          />
                        </InputGroup>
                        {vitalClinicalSupport.systolic && (
                          <span className={classes.error}>
                            {vitalClinicalSupport.systolic}
                          </span>
                        )}
                        {vitalClinicalSupport.diastolic && (
                          <span className={classes.error}>
                            {vitalClinicalSupport.diastolic}
                          </span>
                        )}
                        {getError("systolic") && (
                          <span className={classes.error}>
                            {getError("systolic")}
                          </span>
                        )}
                        {getError("diastolic") && (
                          <span className={classes.error}>
                            {getError("diastolic")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* Pregnancy Status - female only. Sourced from the latest
                        hts_encounter when available; otherwise editable. */}
                    {isFemale() && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Pregnancy Status
                            {!isFromHts && (
                              <span style={{ color: "red" }}> *</span>
                            )}
                          </FormLabelName>
                          <Input
                            type="select"
                            name="pregnant"
                            id="pregnant"
                            value={isFromHts ? (htsObs.pregnancyStatus || "") : (values.pregnant || "")}
                            onChange={handleChange}
                            disabled={disabledField || isFromHts}
                            title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                            style={{
                              border: "1px solid #014D88",
                              borderRadius: "0.2rem",
                              backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                            }}
                          >
                            <option value="">Select</option>
                            {(codeset?.PREGNANCY_STATUS || []).map(item => (
                              <option key={item.code} value={item.code}>{item.display}</option>
                            ))}
                          </Input>
                          {getError("pregnant") && (
                            <span className={classes.error}>
                              {getError("pregnant")}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    )}

                    {/* 5. HIV Status at Exposure — sourced from the latest
                        hts_encounter when available; otherwise editable. */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          HIV Status at Exposure{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="hivStatusAtExposure"
                          id="hivStatusAtExposure"
                          onChange={handleChange}
                          value={
                            isFromHts
                              ? (toHivTestResultCode(
                                  htsObs.confirmatoryHivTest || htsObs.initialHivTest,
                                  htsObs.typeOfHivTestDone
                                ) || "")
                              : (values.hivStatusAtExposure || "")
                          }
                          style={{
                            ...inputStyle,
                            backgroundColor: isFromHts ? "#f1f3f5" : undefined,
                          }}
                          disabled={disabledField || isFromHts}
                          title={isFromHts ? "Sourced from latest HTS encounter" : undefined}
                        >
                          <option value="">Select</option>
                          {(codeset?.HIV_TEST_RESULT || []).map(value => (
                            <option key={value.id || value.code} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("hivStatusAtExposure") && (
                          <span className={classes.error}>
                            {getError("hivStatusAtExposure")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 6. Noted Side Effects */}
                    {codeset?.PREP_SIDE_EFFECTS && (
                      <div className="mb-3 col-md-12">
                        <FormGroup>
                          <FormLabelName>Noted Side Effects <span style={{ color: "red" }}> *</span></FormLabelName>
                          <DualListBox
                            options={codeset.PREP_SIDE_EFFECTS.map(effect => ({
                              value: effect?.code,
                              label: effect?.display,
                            }))}
                            selected={notedSideEffects}
                            onChange={handleNotedSideEffectsChange}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 7. Syndromic STI Screening (multiselect) */}
                    {codeset?.SYNDROMIC_STI_SCREENING && (
                      <div className="mb-3 col-md-12">
                        <FormGroup>
                          <FormLabelName>Syndromic STI Screening <span style={{ color: "red" }}> *</span></FormLabelName>
                          <DualListBox
                            options={codeset.SYNDROMIC_STI_SCREENING.map(item => ({
                              value: item?.code,
                              label: item?.display,
                            }))}
                            selected={syndromicStiSelected}
                            onChange={handleSyndromicStiChange}
                            disabled={disabledField}
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 7b. Syndromic STI Screening - Other specify */}
                    {syndromicStiSelected?.includes("SYNDROMIC_STI_SCREENING_OTHERS") && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Specify Other STI Screening
                          </FormLabelName>
                          <Input
                            type="text"
                            name="otherSyndromicStiScreening"
                            id="otherSyndromicStiScreening"
                            value={values.otherSyndromicStiScreening}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 8. Risk Reduction Services */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Risk Reduction Services <span style={{ color: "red" }}> *</span></FormLabelName>
                        <Input
                          type="select"
                          name="riskReductionServices"
                          id="riskReductionServices"
                          value={values.riskReductionServices}
                          onChange={handleChange}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {codeset?.PrEP_RISK_REDUCTION_PLAN?.map(plan => (
                            <option key={plan.id} value={plan.code}>
                              {plan.display}
                            </option>
                          ))}
                        </Input>
                        {getError("riskReductionServices") && (
                          <span className={classes.error}>
                            {getError("riskReductionServices")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 9. Adherence */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Adherence <span style={{ color: "red" }}> *</span></FormLabelName>
                        <Input
                          type="select"
                          name="adherenceLevel"
                          id="adherenceLevel"
                          value={values.adherenceLevel}
                          onChange={e => {
                            handleChange(e);
                            if (
                              !e.target.value?.toUpperCase()?.includes("POOR") &&
                              !e.target.value?.toUpperCase()?.includes("FAIR")
                            ) {
                              setFieldValue("whyAdherenceLevelPoor", "");
                              setFieldValue("otherReasonForPoorFairAdherence", "");
                            }
                          }}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {codeset?.PrEP_LEVEL_OF_ADHERENCE?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("adherenceLevel") && (
                          <span className={classes.error}>
                            {getError("adherenceLevel")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 9b. Reason for Poor/Fair Adherence (conditional) */}
                    {(values.adherenceLevel?.toUpperCase()?.includes("POOR") ||
                      values.adherenceLevel?.toUpperCase()?.includes("FAIR")) && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Reason for Poor/Fair Adherence{" "}
                            <span style={{ color: "red" }}> *</span>
                          </FormLabelName>
                          <Input
                            type="select"
                            name="whyAdherenceLevelPoor"
                            id="whyAdherenceLevelPoor"
                            value={values.whyAdherenceLevelPoor}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                          >
                            <option value="">Select</option>
                            {codeset?.PrEP_LEVEL_OF_ADHERENCE_REASONS?.map(value => (
                              <option key={value.id} value={value.code}>
                                {value.display}
                              </option>
                            ))}
                          </Input>
                          {getError("whyAdherenceLevelPoor") && (
                            <span className={classes.error}>
                              {getError("whyAdherenceLevelPoor")}
                            </span>
                          )}
                        </FormGroup>
                      </div>
                    )}

                    {/* 9c. Reason for Poor/Fair Adherence - Other specify */}
                    {(values.adherenceLevel?.toUpperCase()?.includes("POOR") ||
                      values.adherenceLevel?.toUpperCase()?.includes("FAIR")) &&
                      values.whyAdherenceLevelPoor?.toUpperCase()?.includes("OTHER") && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Specify Other Reason</FormLabelName>
                          <Input
                            type="text"
                            name="otherReasonForPoorFairAdherence"
                            id="otherReasonForPoorFairAdherence"
                            value={values.otherReasonForPoorFairAdherence}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

                    {/* 10. PEP Regimen */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          PEP Regimen{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="select"
                          name="pepRegimen"
                          id="pepRegimen"
                          onChange={handleChange}
                          value={values.pepRegimen}
                          style={inputStyle}
                          disabled={disabledField || !!patientDto?.prepRegimen}
                          title={patientDto?.prepRegimen ? "Sourced from the latest PEP initiation" : undefined}
                        >
                          <option value="">Select</option>
                          {codeset?.PEP_REGIMEN?.map(value => (
                            <option key={value.id} value={value.code}>
                              {value.display}
                            </option>
                          ))}
                        </Input>
                        {getError("pepRegimen") && (
                          <span className={classes.error}>
                            {getError("pepRegimen")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 11. Date of start of PEP */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Date of start of PEP{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          className="form-control"
                          type="date"
                          name="dateStartPep"
                          id="dateStartPep"
                          onKeyDown={e => e.preventDefault()}
                          value={values.dateStartPep}
                          style={inputStyle}
                          onChange={handleChange}
                          max={moment(new Date()).format("YYYY-MM-DD")}
                          disabled={disabledField || !!patientDto?.datePrepStarted}
                          title={patientDto?.datePrepStarted ? "Sourced from the latest PEP initiation" : undefined}
                        />
                        {getError("dateStartPep") && (
                          <span className={classes.error}>
                            {getError("dateStartPep")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 12. Date of stop of PEP */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Date of stop of PEP{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          className="form-control"
                          type="date"
                          name="dateStopPep"
                          id="dateStopPep"
                          onKeyDown={e => e.preventDefault()}
                          value={values.dateStopPep}
                          style={inputStyle}
                          onChange={handleChange}
                          min={values.dateStartPep}
                          disabled={disabledField || hasPriorFollowup}
                          title={hasPriorFollowup ? "Carried from the previous follow-up visit" : undefined}
                        />
                        {getError("dateStopPep") && (
                          <span className={classes.error}>
                            {getError("dateStopPep")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 12b. Refill Days - auto-populated (carried from the previous
                        follow-up, else the 28-day PEP course) but always editable.
                        Driving Next Appointment = Visit Date + this value. */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Refill Days</FormLabelName>
                        <Input
                          type="number"
                          name="refillDays"
                          id="refillDays"
                          value={values.refillDays}
                          // Digits only, no negatives, capped at MAX_REFILL_DAYS.
                          onKeyDown={blockNonNumericRefillDaysKeys}
                          onPaste={withRefillDaysPasteGuard(e =>
                            handleDurationChange(e, setFieldValue, values.encounterDate)
                          )}
                          onChange={withRefillDaysGuard(e =>
                            handleDurationChange(e, setFieldValue, values.encounterDate)
                          )}
                          style={inputStyle}
                          min={MIN_REFILL_DAYS}
                          max={MAX_REFILL_DAYS}
                          step={1}
                          inputMode="numeric"
                        />
                      </FormGroup>
                    </div>

                    {/* 13. Follow-up HIV Test Results */}
                    <div className="form-group mb-3 col-md-12">
                      <Label
                        as="a"
                        color="blue"
                        style={{ width: "106%", height: "35px" }}
                        ribbon
                      >
                        <h4 style={{ color: "#fff" }}>
                          Follow-up HIV Test Results
                        </h4>
                      </Label>
                      <br />
                      <br />
                      <table className="table table-bordered table-sm mb-3">
                        <thead style={{ backgroundColor: "#014d88", color: "#fff" }}>
                          <tr>
                            <th>Visit</th>
                            <th>Visit Date</th>
                            <th>HIV Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3].map(slot => {
                            const ordinal =
                              slot === 1 ? "1st" : slot === 2 ? "2nd" : "3rd";
                            const entry = initialFollowupHtsResults.find(
                              r => r.visitNumber === slot
                            );
                            if (!entry) {
                              return (
                                <tr key={slot}>
                                  <td>{visitLabelFor(slot)}</td>
                                  <td
                                    colSpan={2}
                                    style={{ color: "#6c757d", fontStyle: "italic" }}
                                  >
                                    {ordinal} visit pending
                                  </td>
                                </tr>
                              );
                            }
                            const resolved = resolveFollowupHivDisplay(
                              entry.htsObservation
                            );
                            const isPositive = (resolved || "")
                              .toLowerCase()
                              .includes("positive");
                            return (
                              <tr key={slot}>
                                <td>{visitLabelFor(slot)}</td>
                                <td>
                                  {entry.encounterDate
                                    ? moment(entry.encounterDate).format("YYYY-MM-DD")
                                    : "—"}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      color: isPositive ? "red" : "green",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {resolved || "—"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Refer (If positive) Summary — based on the autopopulated results */}
                      <div
                        className="p-3 mb-3"
                        style={{
                          borderLeft: "5px solid #992E62",
                          backgroundColor: "#f0f4f8",
                        }}
                      >
                        <span style={{ fontWeight: "bold", fontSize: "1rem" }}>
                          Refer (If positive):{" "}
                        </span>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            color: "#fff",
                            backgroundColor: hasPositiveHivResult ? "#dc3545" : "#28a745",
                          }}
                        >
                          {hasPositiveHivResult ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    {/* 14. Next Appointment Date */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>
                          Next Appointment Date{" "}
                          <span style={{ color: "red" }}> *</span>
                        </FormLabelName>
                        <Input
                          type="date"
                          onKeyDown={e => e.preventDefault()}
                          name="nextAppointment"
                          id="nextAppointment"
                          value={values.nextAppointment}
                          style={inputStyle}
                          min={values.encounterDate}
                          disabled
                        />
                        {getError("nextAppointment") && (
                          <span className={classes.error}>
                            {getError("nextAppointment")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 15. Signature */}
                    <div className="mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Healthcare Worker Signature <span style={{ color: "red" }}> *</span></FormLabelName>
                        <Input
                          name="healthCareWorkerSignature"
                          id="healthCareWorkerSignature"
                          placeholder="Enter signature..."
                          value={values.healthCareWorkerSignature}
                          disabled={disabledField}
                          onChange={handleChange}
                          style={inputStyle}
                        />
                        {getError("healthCareWorkerSignature") && (
                          <span className={classes.error}>
                            {getError("healthCareWorkerSignature")}
                          </span>
                        )}
                      </FormGroup>
                    </div>
                  </div>

                  <br />

                  {/* ── Submit Buttons ── */}
                  {!disabledField && (
                    <>
                      {props.activeContent &&
                      props.activeContent.actionType === "update" ? (
                        <div>
                          <MatButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            hidden={disabledField}
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            style={{ backgroundColor: "#014d88" }}
                            onClick={handleSubmit}
                            disabled={saving}
                          >
                            {!saving ? (
                              <span
                                style={{ textTransform: "capitalize" }}
                              >
                                Update
                              </span>
                            ) : (
                              <span
                                style={{ textTransform: "capitalize" }}
                              >
                                Updating...
                              </span>
                            )}
                          </MatButton>
                        </div>
                      ) : (
                        <div>
                          <MatButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<SaveIcon />}
                            style={{ backgroundColor: "#014d88" }}
                            onClick={handleSubmit}
                            disabled={saving}
                          >
                            {!saving ? (
                              <span
                                style={{ textTransform: "capitalize" }}
                              >
                                Save
                              </span>
                            ) : (
                              <span
                                style={{ textTransform: "capitalize" }}
                              >
                                Saving...
                              </span>
                            )}
                          </MatButton>
                        </div>
                      )}
                    </>
                  )}
                </Segment>
              </Grid.Column>
            </Grid>
          );
        }}
      </Formik>
    </div>
  );
};

export default PEPFollowupVisit;

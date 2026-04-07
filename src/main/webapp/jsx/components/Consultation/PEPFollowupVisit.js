import React, { useState, useEffect, useRef } from "react";
import { Grid, Segment, Label } from "semantic-ui-react";
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from "reactstrap";
import { url as baseUrl, token } from "../../../api";
import { Button as MatButton } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { useStyles } from "../../../hooks/styles/prepVisit/useStyle";
import { Formik } from "formik";
import * as Yup from "yup";
import { fetchAllCodesets } from "./codesets";

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

const validationSchema = Yup.object().shape({
  encounterDate: Yup.string().required("This field is required"),
  modeOfExposure: Yup.string().required("This field is required"),
  durationBeforePep: Yup.string().required("This field is required"),
  systolic: Yup.string().required("This field is required"),
  diastolic: Yup.string().required("This field is required"),
  hivStatusAtExposure: Yup.string().required("This field is required"),
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
  otherNotedSideEffects: "",
  syndromicStiScreening: "",
  syndromicScreening: "",
  otherSyndromicStiScreening: "",
  riskReductionServices: "",
  adherenceLevel: "",
  whyAdherenceLevelPoor: "",
  otherReasonForPoorFairAdherence: "",
  pepRegimen: "",
  otherPepRegimen: "",
  dateStartPep: "",
  dateStopPep: "",
  duration: "",
  followupHivTestResults: [],
  nextAppointment: "",
  healthCareWorkerSignature: "",
  pregnant: "",
  personId: "",
};

const PEPFollowupVisit = props => {
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codeset, setCodeset] = useState({});
  const [notedSideEffects, setNotedSideEffects] = useState([]);
  const [syndromicStiSelected, setSyndromicStiSelected] = useState([]);
  const [patientDto, setPatientDto] = useState();

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

  // ── API Calls ──

  const isFemale = () => {
    const sex = props.patientObj?.gender || props.patientObj?.sex || "";
    return sex.toLowerCase() === "female";
  };

  const getPatientDtoObj = () => {
    axios
      .get(
        `${baseUrl}prep/enrollment/open/patients/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
        // Auto-populate pregnancy status from latest screening for female patients
        if (isFemale() && response.data?.pregnancyStatus && formikRef.current) {
          formikRef.current.setFieldValue("pregnant", response.data.pregnancyStatus);
        }
      })
      .catch(error => {});
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

  const handleNotedSideEffectsChange = selected => {
    setNotedSideEffects(selected);
    if (formikRef.current) {
      formikRef.current.setFieldValue("pepNotedSideEffects", selected);
    }
  };

  const handleSyndromicStiChange = selected => {
    setSyndromicStiSelected(selected);
    if (formikRef.current) {
      formikRef.current.setFieldValue("syndromicStiScreening", selected);
    }
  };

  // ── HIV Test Entries handlers ──

  const handleHivTestInputChange = e => {
    setHivTestInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddHivTestEntry = () => {
    if (!hivTestInput.test || !hivTestInput.result) return;
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

  const hasPositiveHivResult = hivTestEntries.some(
    entry => entry.result?.toLowerCase() === "positive"
  );

  // ── Codeset fetch ──

  useEffect(() => {
    fetchAllCodesets().then(data => {
      setCodeset(data);
    });
  }, []);

  // ── Data loading ──

  useEffect(() => {
    getPatientDtoObj();
  }, []);

  useEffect(() => {
    getPatientVisit();
    setDisabledField(
      !["update", undefined].includes(props.activeContent.actionType)
    );
  }, [props.activeContent]);

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

  // ── Auto-calculate next appointment from encounterDate + duration ──
  const calculateNextAppointment = (encounterDate, durationMonths) => {
    if (!encounterDate || !durationMonths || isNaN(Number(durationMonths))) return "";
    const date = new Date(encounterDate);
    date.setMonth(date.getMonth() + Number(durationMonths));
    return date.toISOString().split("T")[0];
  };

  const handleDurationChange = (e, setFieldValue, encounterDate) => {
    const duration = e.target.value;
    setFieldValue("duration", duration);
    const nextAppt = calculateNextAppointment(encounterDate, duration);
    if (nextAppt) setFieldValue("nextAppointment", nextAppt);
  };

  const handleEncounterDateChangeForAppt = (e, setFieldValue, duration) => {
    const encounterDate = e.target.value;
    setFieldValue("encounterDate", encounterDate);
    if (duration) {
      const nextAppt = calculateNextAppointment(encounterDate, duration);
      if (nextAppt) setFieldValue("nextAppointment", nextAppt);
    }
  };

  // ── Submit ──

  function handleError(error) {
    setSaving(false);
    if (error.response && error.response.data) {
      let errorMessage =
        error.response.data.apierror &&
        error.response.data.apierror.message !== ""
          ? error.response.data.apierror.message
          : "Something went wrong. Please try again";
      toast.error(errorMessage, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    } else {
      toast.error("Something went wrong, please try again...", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  }

  const handleFormSubmit = async values => {
    // Manual validation for non-Formik fields
    const manualErrors = [];
    if (!notedSideEffects || notedSideEffects.length === 0) {
      manualErrors.push("Noted Side Effects is required");
    }
    if (!syndromicStiSelected || syndromicStiSelected.length === 0) {
      manualErrors.push("Syndromic STI Screening is required");
    }
    if (!hivTestEntries || hivTestEntries.length === 0) {
      manualErrors.push("At least one HIV Test entry is required");
    }
    if (manualErrors.length > 0) {
      manualErrors.forEach(msg => toast.error(msg, { position: toast.POSITION.BOTTOM_CENTER }));
      return;
    }

    setSaving(true);
    const payload = { ...values };
    payload.pepNotedSideEffects = notedSideEffects;
    payload.syndromicStiScreening = syndromicStiSelected;
    payload.followupHivTestResults = hivTestEntries;
    payload.prepEnrollmentUuid = patientDto?.uuid;
    payload.previousPrepStatus = props.patientObj?.prepStatus;

    if (props.activeContent && props.activeContent.actionType === "update") {
      try {
        await axios.put(
          `${baseUrl}pep-followup-visit/${props.activeContent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaving(false);
        toast.success("PEP Follow-up visit updated successfully!", {
          position: toast.POSITION.BOTTOM_CENTER,
        });
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
          position: toast.POSITION.BOTTOM_CENTER,
        });
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
        validationSchema={validationSchema}
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
                    {/* 1. Visit Date */}
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
                          onChange={handleChange}
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
                          disabled={disabledField}
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
                          disabled={disabledField}
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

                    {/* Pregnancy Status - female only */}
                    {isFemale() && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>Pregnancy Status</FormLabelName>
                          <Input
                            type="select"
                            name="pregnant"
                            id="pregnant"
                            value={values.pregnant}
                            onChange={handleChange}
                            disabled={disabledField}
                            style={{ border: "1px solid #014D88", borderRadius: "0.2rem" }}
                          >
                            <option value="">Select</option>
                            <option value="Pregnant">Pregnant</option>
                            <option value="Breastfeeding">Breastfeeding</option>
                            <option value="Non-pregnant">Non-pregnant</option>
                          </Input>
                        </FormGroup>
                      </div>
                    )}

                    {/* 5. HIV Status at Exposure */}
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
                          value={values.hivStatusAtExposure}
                          style={inputStyle}
                          disabled={disabledField}
                        >
                          <option value="">Select</option>
                          {codeset?.PEP_HIV_STATUS_AT_EXPOSURE?.map(value => (
                            <option key={value.id} value={value.code}>
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

                    {/* 6b. Noted Side Effects - Other specify */}
                    {notedSideEffects?.includes("PREP_SIDE_EFFECTS_OTHER") && (
                      <div className="mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Specify Other Side Effect
                          </FormLabelName>
                          <Input
                            type="text"
                            name="otherNotedSideEffects"
                            id="otherNotedSideEffects"
                            value={values.otherNotedSideEffects}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
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
                            {codeset?.WHY_POOR_FAIR_ADHERENCE?.map(value => (
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
                          disabled={disabledField}
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

                    {/* 10b. PEP Regimen - Other specify */}
                    {values.pepRegimen === "PEP_REGIMEN_OTHERS" && (
                      <div className="form-group mb-3 col-md-6">
                        <FormGroup>
                          <FormLabelName>
                            Specify Other PEP Regimen
                          </FormLabelName>
                          <Input
                            type="text"
                            name="otherPepRegimen"
                            id="otherPepRegimen"
                            value={values.otherPepRegimen}
                            onChange={handleChange}
                            style={inputStyle}
                            disabled={disabledField}
                            placeholder="Specify..."
                          />
                        </FormGroup>
                      </div>
                    )}

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
                          disabled={disabledField}
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
                          disabled={disabledField}
                        />
                        {getError("dateStopPep") && (
                          <span className={classes.error}>
                            {getError("dateStopPep")}
                          </span>
                        )}
                      </FormGroup>
                    </div>

                    {/* 12b. Duration on PrEP/PEP (Months) */}
                    <div className="form-group mb-3 col-md-6">
                      <FormGroup>
                        <FormLabelName>Duration on PrEP/PEP (Months)</FormLabelName>
                        <Input
                          type="number"
                          name="duration"
                          id="duration"
                          onChange={e => handleDurationChange(e, setFieldValue, values.encounterDate)}
                          value={values.duration}
                          style={inputStyle}
                          disabled={disabledField}
                          min="0"
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
                      {!disabledField && (
                        <div className="row mb-3">
                          <div className="mb-1 col-md-5">
                            <FormGroup>
                              <FormLabelName>Test</FormLabelName>
                              <Input
                                type="select"
                                name="test"
                                id="hivTestEntryTest"
                                value={hivTestInput.test}
                                onChange={handleHivTestInputChange}
                                style={inputStyle}
                              >
                                <option value="">Select</option>
                                {codeset?.PEP_FOLLOWUP_HIV_TEST_RESULT?.filter(
                                  v => !v.display?.toLowerCase()?.includes("refer")
                                ).map(value => (
                                  <option key={value.id} value={value.code}>
                                    {value.display}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </div>
                          <div className="mb-1 col-md-5">
                            <FormGroup>
                              <FormLabelName>Result</FormLabelName>
                              <Input
                                type="select"
                                name="result"
                                id="hivTestEntryResult"
                                value={hivTestInput.result}
                                onChange={handleHivTestInputChange}
                                style={inputStyle}
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                                <option value="Indeterminate">Indeterminate</option>
                              </Input>
                            </FormGroup>
                          </div>
                          <div className="mb-1 col-md-2 d-flex align-items-end">
                            <MatButton
                              type="button"
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              style={{ backgroundColor: "#014d88" }}
                              onClick={handleAddHivTestEntry}
                              disabled={!hivTestInput.test || !hivTestInput.result}
                            >
                              <span style={{ textTransform: "capitalize", color: (!hivTestInput.test || !hivTestInput.result) ? "rgba(255,255,255,0.5)" : "#fff" }}>
                                {editingHivTestIndex !== null ? "Update" : "Add"}
                              </span>
                            </MatButton>
                          </div>
                        </div>
                      )}

                      {hivTestEntries.length > 0 && (
                        <table className="table table-bordered table-sm mb-3">
                          <thead style={{ backgroundColor: "#014d88", color: "#fff" }}>
                            <tr>
                              <th>S/N</th>
                              <th>Test</th>
                              <th>Result</th>
                              {!disabledField && <th>Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {hivTestEntries.map((entry, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{entry.test}</td>
                                <td>
                                  <span
                                    style={{
                                      color: entry.result?.toLowerCase() === "positive" ? "red" : "green",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {entry.result}
                                  </span>
                                </td>
                                {!disabledField && (
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary mr-2"
                                      style={{ marginRight: "5px" }}
                                      onClick={() => handleEditHivTestEntry(index)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDeleteHivTestEntry(index)}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {hivTestEntries.length === 0 && (
                        <span className={classes.error}>
                          At least 1 HIV test result is required
                        </span>
                      )}

                      {/* Refer (If positive) Summary */}
                      {hivTestEntries.length > 0 && (
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
                      )}
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
                          onChange={handleChange}
                          style={inputStyle}
                          min={values.encounterDate}
                          disabled={disabledField}
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

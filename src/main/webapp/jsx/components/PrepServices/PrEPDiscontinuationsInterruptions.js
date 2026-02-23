import React, { useState, useEffect } from "react";
import { Card, CardBody, FormGroup, Label, Input } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import CancelIcon from "@material-ui/icons/Cancel";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import "react-widgets/dist/css/react-widgets.css";
import moment from "moment";
import { Spinner } from "reactstrap";
import { useStyles } from "../../../hooks/styles/prepDiscontinuationsInterruptions/useStyles";

const PrEPDiscontinuationsInterruptions = props => {
  const patientObj = props.patientObj;
  const classes = useStyles();
  const [disabledField, setDisabledField] = useState(false);
  const [objValues, setObjValues] = useState({
    interruptionType: "",
    interruptionDate: "",
    why: "",
    dateRestartPlacedBackMedication: "",
    prepCompletion: "",
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

  // --- Skip logic derived from current form state ---
  const isStopped = objValues.interruptionType === "Stopped";
  const isDefault = objValues.interruptionType === "Default";
  const showDate = isStopped || isDefault;
  const showWhy = isStopped;
  const showFollowUpVisitDate = objValues.prepCompletion === "Yes";
  const showFacilityReferredTo = !!objValues.dateClientReferredOut;
  const showDeathFields = !!objValues.dateClientDied;

  useEffect(() => {
    GetPatientDTOObj();
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
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const GetPatientInterruption = id => {
    if (!id) return;
    axios
      .get(`${baseUrl}prep-interruption/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setObjValues(response.data);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });

    // Clear dependent fields when parent value changes
    if (name === "interruptionType") {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        interruptionDate: "",
        why: "",
      }));
      return;
    }
    if (name === "prepCompletion" && value !== "Yes") {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        followUpVisitDate: "",
      }));
      return;
    }
    if (name === "dateClientReferredOut" && !value) {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        facilityReferredTo: "",
      }));
      return;
    }
    if (name === "dateClientDied" && !value) {
      setObjValues(prev => ({
        ...prev,
        [name]: value,
        sourceOfDeathInfo: "",
        causeOfDeath: "",
      }));
      return;
    }

    setObjValues({ ...objValues, [name]: value });
  };

  const validate = () => {
    let temp = { ...errors };
    if (!objValues.interruptionType) {
      temp.interruptionType = "This field is required";
    }
    if (showDate && !objValues.interruptionDate) {
      temp.interruptionDate = "This field is required";
    }
    if (showWhy && !objValues.why) {
      temp.why = "This field is required";
    }
    if (!objValues.prepCompletion) {
      temp.prepCompletion = "This field is required";
    }
    if (showFollowUpVisitDate && !objValues.followUpVisitDate) {
      temp.followUpVisitDate = "This field is required";
    }
    if (!objValues.hivResult) {
      temp.hivResult = "This field is required";
    }
    if (!objValues.earlyDetectViralLoadResult) {
      temp.earlyDetectViralLoadResult = "This field is required";
    }
    if (showFacilityReferredTo && !objValues.facilityReferredTo) {
      temp.facilityReferredTo = "This field is required";
    }
    if (showDeathFields && !objValues.sourceOfDeathInfo) {
      temp.sourceOfDeathInfo = "This field is required";
    }
    if (showDeathFields && !objValues.causeOfDeath) {
      temp.causeOfDeath = "This field is required";
    }
    setErrors({ ...temp });
    return Object.values(temp).every(x => x === "");
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      objValues.previousPrepStatus = props.patientObj?.prepStatus;
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType === "update") {
        axios
          .put(
            `${baseUrl}prep-interruption/${props.activeContent.id}`,
            objValues,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then(response => {
            setSaving(false);
            toast.success("Record saved successfully!");
            props.PatientObject();
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
          .then(response => {
            setSaving(false);
            toast.success("Record saved successfully!");
            props.PatientObject();
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
    }
  };

  const handleError = error => {
    if (error.response && error.response.data) {
      let errorMessage =
        error.response.data.apierror &&
        error.response.data.apierror.message !== ""
          ? error.response.data.apierror.message
          : "Something went wrong. Please try again...";
      toast.error(errorMessage);
    } else {
      toast.error("Something went wrong. Please try again...");
    }
  };

  const today = moment(new Date()).format("YYYY-MM-DD");
  const minDate =
    patientDto && patientDto.dateEnrolled ? patientDto.dateEnrolled : "";

  return (
    <div>
      <Card className={classes.root}>
        <CardBody>
          <form>
            <div className="row">
              <h2>PrEP Interruptions</h2>

              {/* 1. PrEP Interruptions - Always displayed */}
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
                    style={{ border: "1px solid #014D88" }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="Stopped">Stopped</option>
                    <option value="Default">Default</option>
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

              {/* 2. Date - if PrEP Interruptions = Stopped or Default */}
              {showDate && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Date <span style={{ color: "red" }}>*</span>
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
              )}

              {/* 3. Why - if PrEP Interruptions = Stopped */}
              {showWhy && (
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
                      style={{ border: "1px solid #014D88" }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="Toxicity/side effects">
                        Toxicity/side effects
                      </option>
                      <option value="Pregnancy">Pregnancy</option>
                      <option value="Client preference">
                        Client preference
                      </option>
                      <option value="HIV positive">HIV positive</option>
                      <option value="No longer at substantial risk">
                        No longer at substantial risk
                      </option>
                    </Input>
                    {errors.why !== "" ? (
                      <span className={classes.error}>{errors.why}</span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {/* 4. Date of Restart (If Placed Back on Medication) */}
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
                  {errors.dateRestartPlacedBackMedication !== "" ? (
                    <span className={classes.error}>
                      {errors.dateRestartPlacedBackMedication}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 5. PrEP Completion - Always displayed */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    PrEP Completion{" "}
                    <span style={{ color: "red" }}>*</span>
                  </Label>
                  <Input
                    type="select"
                    name="prepCompletion"
                    id="prepCompletion"
                    onChange={handleInputChange}
                    value={objValues.prepCompletion}
                    style={{ border: "1px solid #014D88" }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Input>
                  {errors.prepCompletion !== "" ? (
                    <span className={classes.error}>
                      {errors.prepCompletion}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 6. Follow Up Visit Date - if PrEP Completion = Yes */}
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

              {/* 7. HIV Result - Always displayed */}
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
                    style={{ border: "1px solid #014D88" }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </Input>
                  {errors.hivResult !== "" ? (
                    <span className={classes.error}>{errors.hivResult}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              {/* 8. Early Detect Viral Load Result - Always displayed */}
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
                    style={{ border: "1px solid #014D88" }}
                    disabled={disabledField}
                  >
                    <option value="">Select</option>
                    <option value="Target Detected">Target Detected</option>
                    <option value="Target Not Detected">
                      Target Not Detected
                    </option>
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

              {/* 9. Date Client Referred Out */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Date Client Referred Out</Label>
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

              {/* 10. Facility Referred To - if Date Client Referred Out is provided */}
              {showFacilityReferredTo && (
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
              )}

              {/* 11. Date Client Died */}
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Date Client Died</Label>
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

              {/* 12. Source of death information - if Date Client Died is provided */}
              {showDeathFields && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Source of death information{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="sourceOfDeathInfo"
                      id="sourceOfDeathInfo"
                      onChange={handleInputChange}
                      value={objValues.sourceOfDeathInfo}
                      style={{ border: "1px solid #014D88" }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="Dead">Dead</option>
                    </Input>
                    {errors.sourceOfDeathInfo !== "" ? (
                      <span className={classes.error}>
                        {errors.sourceOfDeathInfo}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
              )}

              {/* 13. Cause of death - if Date Client Died is provided */}
              {showDeathFields && (
                <div className="form-group mb-3 col-md-6">
                  <FormGroup>
                    <Label>
                      Cause of death{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="causeOfDeath"
                      id="causeOfDeath"
                      onChange={handleInputChange}
                      value={objValues.causeOfDeath}
                      style={{ border: "1px solid #014D88" }}
                      disabled={disabledField}
                    >
                      <option value="">Select</option>
                      <option value="HIV-related (Cancer, parasitic disease)">
                        HIV-related (Cancer, parasitic disease)
                      </option>
                      <option value="Natural Cause">Natural Cause</option>
                      <option value="Non-natural causes">
                        Non-natural causes
                      </option>
                      <option value="Other cause of death">
                        Other cause of death
                      </option>
                      <option value="Other HIV disease resulting in other disease or conditions leading to death">
                        Other HIV disease resulting in other disease or
                        conditions leading to death
                      </option>
                      <option value="Suspected ARV Side effect (Specify)">
                        Suspected ARV Side effect (Specify)
                      </option>
                      <option value="Suspected Opportunistic Infection (specify)">
                        Suspected Opportunistic Infection (specify)
                      </option>
                      <option value="Tuberculosis">Tuberculosis</option>
                      <option value="Unknown">Unknown</option>
                    </Input>
                    {errors.causeOfDeath !== "" ? (
                      <span className={classes.error}>
                        {errors.causeOfDeath}
                      </span>
                    ) : (
                      ""
                    )}
                  </FormGroup>
                </div>
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

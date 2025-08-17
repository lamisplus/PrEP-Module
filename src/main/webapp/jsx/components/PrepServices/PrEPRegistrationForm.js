import React, { useState, useEffect } from "react";
import { Form, Row, Card, CardBody, FormGroup, Label, Input } from "reactstrap";
import MatButton from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import axios from "axios";
import { toast } from "react-toastify";
import { url as baseUrl, token } from "../../../api";
import "react-widgets/dist/css/react-widgets.css";
import PhoneInput from "react-phone-input-2";
import moment from "moment";
import { Spinner } from "reactstrap";
import { useStyles } from "../../../hooks/styles/prepRegistration/useStyle";

const CODESET_KEYS = ["HTS_ENTRY_POINT", "RELATIONSHIP", "PREP_RISK_TYPE"];

const PrEPRegistrationForm = props => {
  const [entryPoint, setEntryPoint] = useState([]);
  const classes = useStyles();
  const [objValues, setObjValues] = useState({
    dateEnrolled: "",
    dateReferred: "",
    extra: {},
    personId: 0,
    prepEligibilityUuid: "",
    riskType: "",
    supporterName: "",
    supporterPhone: "",
    supporterRelationshipType: "",
    uniqueId: "",
    hivTestingPoint: "",
    dateOfLastHivNegativeTest: "",
    targetGroup: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [prepRisk, setPrepRisk] = useState([]);
  const [relatives, setRelatives] = useState([]);
  const [patientDto, setPatientDto] = useState();
  const [disabledField, setSisabledField] = useState(false);
  const [targetGroupValue, setTargetGroupValue] = useState("");
  const [codeset, setCodeset] = useState({});

  useEffect(() => {
    axios
      .get(`${baseUrl}application-codesets/v2/codeSets`, {
        params: { codes: CODESET_KEYS },
        paramsSerializer: params =>
          params.codes
            .map(code => `codes=${encodeURIComponent(code)}`)
            .join("&"),
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setCodeset(data);
        // Sync local state with fetched codesets for backward compatibility
        setEntryPoint(data.HTS_ENTRY_POINT || []);
        setRelatives(data.RELATIONSHIP || []);
        setPrepRisk(data.PREP_RISK_TYPE || []);
      })
      .catch(error => {
        //console.log(error);
      });
  }, []);

  useEffect(() => {
    GetPatientDTOObj();
    if (
      props.activeContent.id &&
      props.activeContent.id !== "" &&
      props.activeContent.id !== null
    ) {
      GetPatientPrepEnrollment(props.activeContent.id);
      setSisabledField(
        props.activeContent.actionType === "view" ? true : false
      );
    }
  }, []);

  const getTargetGroupvalue = () => {
    axios
      .get(`${baseUrl}hts/persons/${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setTargetGroupValue(response.data?.htsClientDtoList[0]?.targetGroup);
      })
      .catch(error => {
        //console.log(error);
      });
  };

  const GetPatientDTOObj = () => {
    axios
      .get(
        `${baseUrl}prep/eligibility/open/patients/${props.patientObj.personId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setPatientDto(response.data);
        getTargetGroupvalue();
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const GetPatientPrepEnrollment = id => {
    axios
      .get(`${baseUrl}prep/enrollment/person/${props.patientObj.personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setObjValues(response.data.find(x => x.id === id));
      })
      .catch(error => {
        //console.log(error);
      });
  };
  const handleInputChange = e => {
    setObjValues({ ...objValues, [e.target.name]: e.target.value });
  };
  const checkPhoneNumberBasic = (e, inputName) => {
    const limit = 10;
    setObjValues({ ...objValues, [inputName]: e.slice(0, limit) });
  };

  const validate = () => {
    let temp = { ...errors };
    temp.dateEnrolled = objValues.dateEnrolled ? "" : "This field is required⚠";
    temp.dateReferred = objValues.dateReferred ? "" : "This field is required⚠";
    temp.riskType = objValues.riskType ? "" : "This field is required⚠";
    temp.uniqueId = objValues.uniqueId ? "" : "This field is required⚠";
    setErrors({
      ...temp,
    });
    return Object.values(temp).every(x => x == "");
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      objValues.personId = props.patientObj.personId;
      objValues.prepEligibilityUuid = patientDto.uuid;
      objValues.targetGroup = targetGroupValue;
      setSaving(true);
      if (props.activeContent && props.activeContent.actionType) {
        axios
          .put(
            `${baseUrl}prep-enrollment/${props.activeContent.id}`,
            objValues,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(response => {
            setSaving(false);
            props.patientObj.prepCount = "1";
            props.PatientObject();
            toast.success("PrEP enrolment saved successfully!✔", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error("Something went wrong❌");
          });
      } else {
        axios
          .post(`${baseUrl}prep/enrollment`, objValues, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => {
            setSaving(false);
            props.patientObj.prepCount = "1";
            toast.success("PrEP enrolment saved successfully!✔", {
              position: toast.POSITION.BOTTOM_CENTER,
            });
            props.setActiveContent({
              ...props.activeContent,
              route: "recent-history",
            });
          })
          .catch(error => {
            setSaving(false);
            toast.error("Something went wrong❌");
          });
      }
    } else {
      toast.error("All fields are required❌", {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  return (
    <div>
      <Card>
        <CardBody>
          <form>
            <div className="row">
              <h2>PrEP Enrollment </h2>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="uniqueId">
                    Unique Client's ID <span style={{ color: "red" }}> *</span>{" "}
                  </Label>
                  <Input
                    type="text"
                    name="uniqueId"
                    id="uniqueId"
                    onChange={handleInputChange}
                    value={objValues.uniqueId}
                    disabled={disabledField}
                    style={{ border: "1px solid #014D88" }}
                  />
                  {errors.uniqueId !== "" ? (
                    <span className={classes.error}>{errors.uniqueId}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="">Partner ANC/Unique ART No </Label>
                  <Input
                    type="text"
                    name="ancUniqueArtNo"
                    id="ancUniqueArtNo"
                    onChange={handleInputChange}
                    value={objValues.ancUniqueArtNo}
                    disabled={disabledField}
                    style={{ border: "1px solid #014D88" }}
                  />
                  {errors.ancUniqueArtNo !== "" ? (
                    <span className={classes.error}>
                      {errors.ancUniqueArtNo}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Date enrolled in PrEP{" "}
                    <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    className="form-control"
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="dateEnrolled"
                    id="dateEnrolled"
                    value={objValues.dateEnrolled}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    min={
                      patientDto && patientDto.visitDate
                        ? patientDto.visitDate
                        : ""
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateEnrolled !== "" ? (
                    <span className={classes.error}>{errors.dateEnrolled}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label for="entryPointId">
                    PrEP Risk Type <span style={{ color: "red" }}> *</span>
                  </Label>
                  <Input
                    type="select"
                    name="riskType"
                    id="riskType"
                    onChange={handleInputChange}
                    value={objValues.riskType}
                    disabled={disabledField}
                    style={{ border: "1px solid #014D88" }}
                  >
                    <option value=""> Select</option>
                    {codeset?.PREP_RISK_TYPE?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.riskType !== "" ? (
                    <span className={classes.error}>{errors.riskType}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>HIV Testing Point </Label>
                  <Input
                    type="select"
                    name="hivTestingPoint"
                    id="hivTestingPoint"
                    onChange={handleInputChange}
                    value={objValues.hivTestingPoint}
                    disabled={disabledField}
                    style={{ border: "1px solid #014D88" }}
                  >
                    <option value=""> Select</option>
                    {codeset?.HTS_ENTRY_POINT?.map(value => (
                      <option key={value.id} value={value.id}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Date of last HIV Negative test</Label>
                  <Input
                    className="form-control"
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="dateOfLastHivNegativeTest"
                    id="dateOfLastHivNegativeTest"
                    value={objValues.dateOfLastHivNegativeTest}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateOfLastHivNegativeTest !== "" ? (
                    <span className={classes.error}>
                      {errors.dateOfLastHivNegativeTest}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>
                    Date Referred for PrEP{" "}
                    <span style={{ color: "red" }}> *</span>{" "}
                  </Label>
                  <Input
                    className="form-control"
                    type="date"
                    onKeyDown={e => e.preventDefault()}
                    name="dateReferred"
                    id="dateReferred"
                    value={objValues.dateReferred}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    min={
                      patientDto && patientDto.visitDate
                        ? patientDto.visitDate
                        : ""
                    }
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={disabledField}
                  />
                  {errors.dateReferred !== "" ? (
                    <span className={classes.error}>{errors.dateReferred}</span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>

              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>PrEP Supporter </Label>
                  <Input
                    className="form-control"
                    type="text"
                    name="supporterName"
                    id="supporterName"
                    value={objValues.supporterName}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem !important",
                    }}
                    disabled={disabledField}
                  />
                  {errors.supporterName !== "" ? (
                    <span className={classes.error}>
                      {errors.supporterName}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>Relationship </Label>
                  <Input
                    className="form-control"
                    type="select"
                    name="supporterRelationshipType"
                    id="supporterRelationshipType"
                    value={objValues.supporterRelationshipType}
                    onChange={handleInputChange}
                    style={{
                      border: "1px solid #014D88",
                      borderRadius: "0.2rem",
                    }}
                    disabled={disabledField}
                  >
                    <option value=""> Select</option>
                    {codeset?.RELATIONSHIP?.map(value => (
                      <option key={value.id} value={value.code}>
                        {value.display}
                      </option>
                    ))}
                  </Input>
                  {errors.supporterRelationshipType !== "" ? (
                    <span className={classes.error}>
                      {errors.supporterRelationshipType}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              <div className="form-group mb-3 col-md-6">
                <FormGroup>
                  <Label>PrEP Supporter Phone Number</Label>
                  <PhoneInput
                    containerStyle={{
                      width: "100%",
                      border: "1px solid #014D88",
                      borderRadius: "0.25rem !important",
                    }}
                    style={{ borderRadius: "0.25rem !important" }}
                    inputStyle={{
                      width: "100%",
                      borderRadius: "0.25rem !important",
                    }}
                    country={"ng"}
                    placeholder="(234)7099999999"
                    maxLength={5}
                    name="supporterPhone"
                    id="supporterPhone"
                    masks={{ ng: "...-...-....", at: "(....) ...-...." }}
                    value={objValues.supporterPhone}
                    onChange={e => {
                      checkPhoneNumberBasic(e, "supporterPhone");
                    }}
                    disabled={disabledField}
                  />
                  {errors.supporterPhone !== "" ? (
                    <span className={classes.error}>
                      {errors.supporterPhone}
                    </span>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
            </div>

            {saving ? <Spinner /> : ""}
            <br />
            {props.activeContent &&
            props.activeContent.actionType === "update" ? (
              <>
                <MatButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  hidden={disabledField}
                  className={classes.button}
                  startIcon={<SaveIcon />}
                  style={{
                    backgroundColor: "#014d88",
                    border: "1px solid #014D88",
                  }}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {!saving ? (
                    <span style={{ textTransform: "capitalize" }}>Update</span>
                  ) : (
                    <span style={{ textTransform: "capitalize" }}>
                      Updating...
                    </span>
                  )}
                </MatButton>
              </>
            ) : (
              <>
                {!disabledField && (
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
                      <span style={{ textTransform: "capitalize" }}>Save</span>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        Saving...
                      </span>
                    )}
                  </MatButton>
                )}
              </>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrEPRegistrationForm;

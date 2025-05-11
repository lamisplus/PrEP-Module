import React from 'react';
import {
  FormGroup,
  Label as FormLabelName,
  InputGroup,
  InputGroupText,
  Input,
} from 'reactstrap';
import { Label } from 'semantic-ui-react';
import moment from 'moment';

const VitalSigns = ({
  formik,
  vitalClinicalSupport,
  handlePulseInputValueCheck,
  handleRespiratoryRateInputValueCheck,
  handleTemperatureInputValueCheck,
  handleWeightInputValueCheck,
  handleHeightInputValueCheck,
  handleSystolicInputValueCheck,
  handleDiastolicInputValueCheck,
  disabledField,
  classes,
  isFemale,
  pregnancyStatus,
  setIsInitialValues,
}) => {
  const handleEncounterDate = e => {
    setIsInitialValues(0);
    formik.handleChange(e);
  };
  return (
    <>
      <Label
        as="a"
        color="blue"
        style={{ width: '106%', height: '35px' }}
        ribbon
      >
        <h4 style={{ color: '#fff' }}>VITAL SIGNS</h4>
      </Label>
      <br />
      <br />
      <div className="row">
        <div className="form-group mb-3 col-md-6">
          <FormGroup>
            <FormLabelName>
              Date of Visit <span style={{ color: 'red' }}> *</span>
            </FormLabelName>
            <Input
              className="form-control"
              type="date"
              name="encounterDate"
              id="encounterDate"
              onKeyDown={e => e.preventDefault()}
              value={formik.values.encounterDate}
              style={{
                border: '1px solid #014D88',
                borderRadius: '0.25rem',
              }}
              onChange={handleEncounterDate}
              min={formik.values.dateEnrolled || ''}
              max={moment(new Date()).format('YYYY-MM-DD')}
              disabled={disabledField}
            />
            {formik.touched.encounterDate && (
              <span className={classes.error}>
                {formik.errors.encounterDate}
              </span>
            )}
          </FormGroup>
        </div>
        <div className="row">
          <div className=" mb-3 col-md-4">
            <FormGroup>
              <FormLabelName>Pulse</FormLabelName>
              <InputGroup>
                <Input
                  type="number"
                  name="pulse"
                  id="pulse"
                  onChange={formik.handleChange}
                  min="40"
                  max="120"
                  value={formik.values.pulse}
                  onKeyUp={handlePulseInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                    borderTopRightRadius: '0',
                    borderBottomRightRadius: '0',
                  }}
                  disabled={disabledField}
                />
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem',
                  }}
                >
                  bmp
                </InputGroupText>
              </InputGroup>
              {vitalClinicalSupport.pulse !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.pulse}
                </span>
              ) : (
                ''
              )}
              {formik.touched.pulse && (
                <span className={classes.error}>{formik.errors.pulse}</span>
              )}
            </FormGroup>
          </div>
          <div className=" mb-3 col-md-4">
            <FormGroup>
              <FormLabelName>Respiratory Rate </FormLabelName>
              <InputGroup>
                <Input
                  type="number"
                  name="respiratoryRate"
                  id="respiratoryRate"
                  onChange={formik.handleChange}
                  min="10"
                  max="70"
                  value={formik.values.respiratoryRate}
                  onKeyUp={handleRespiratoryRateInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopLeftRadius: '0.25rem',
                    borderBottomLeftRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem',
                  }}
                >
                  bmp
                </InputGroupText>
              </InputGroup>
              {vitalClinicalSupport.respiratoryRate !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.respiratoryRate}
                </span>
              ) : (
                ''
              )}
              {formik.errors.respiratoryRate && (
                <span className={classes.error}>
                  {formik.errors.respiratoryRate}
                </span>
              )}
            </FormGroup>
          </div>
          <div className=" mb-3 col-md-4">
            <FormGroup>
              <FormLabelName>Temperature </FormLabelName>
              <InputGroup>
                <Input
                  type="number"
                  name="temperature"
                  id="temperature"
                  onChange={formik.handleChange}
                  min="35"
                  max="47"
                  value={formik.values.temperature}
                  onKeyUp={handleTemperatureInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopLeftRadius: '0.25rem',
                    borderBottomLeftRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem',
                  }}
                >
                  <sup>o</sup>c
                </InputGroupText>
              </InputGroup>
              {vitalClinicalSupport.temperature !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.temperature}
                </span>
              ) : (
                ''
              )}
              {formik.errors.temperature && (
                <span className={classes.error}>
                  {formik.errors.temperature}
                </span>
              )}
            </FormGroup>
          </div>

          <div className=" mb-3 col-md-5">
            <FormGroup>
              <FormLabelName>
                Body Weight <span style={{ color: 'red' }}> *</span>
              </FormLabelName>
              <InputGroup>
                <Input
                  type="number"
                  name="weight"
                  id="weight"
                  onChange={formik.handleChange}
                  min="3"
                  max="150"
                  value={formik.values.weight}
                  onKeyUp={handleWeightInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopLeftRadius: '0.25rem',
                    borderBottomLeftRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem',
                  }}
                >
                  kg
                </InputGroupText>
              </InputGroup>
              {vitalClinicalSupport.weight !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.weight}
                </span>
              ) : (
                ''
              )}
              {formik.touched.weight && formik.errors.weight && (
                <span className={classes.error}>{formik.errors.weight}</span>
              )}
            </FormGroup>
          </div>
          <div className="form-group mb-3 col-md-5">
            <FormGroup>
              <FormLabelName>
                Height <span style={{ color: 'red' }}> *</span>
              </FormLabelName>
              <InputGroup>
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopLeftRadius: '0.25rem',
                    borderBottomLeftRadius: '0.25rem',
                  }}
                >
                  cm
                </InputGroupText>
                <Input
                  type="number"
                  name="height"
                  id="height"
                  onChange={formik.handleChange}
                  value={formik.values.height}
                  min="48.26"
                  max="216.408"
                  step="0.01"
                  onKeyUp={handleHeightInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                  }}
                  disabled={disabledField}
                />
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#992E62',
                    color: '#fff',
                    border: '1px solid #992E62',
                    borderRadius: '0rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem',
                  }}
                >
                  {formik.values.height !== ''
                    ? (formik.values.height / 100).toFixed(2) + 'm'
                    : 'm'}
                </InputGroupText>
              </InputGroup>
              {vitalClinicalSupport.height !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.height}
                </span>
              ) : (
                ''
              )}
              {formik.touched.height && formik.errors.height && (
                <span className={classes.error}>{formik.errors.height}</span>
              )}
            </FormGroup>
          </div>
          <div className="form-group mb-3 mt-2 col-md-2">
            {formik.values.weight !== '' && formik.values.height !== '' && (
              <FormGroup>
                <Label> </Label>
                <InputGroup>
                  <InputGroupText
                    addonType="append"
                    style={{
                      backgroundColor: '#014D88',
                      color: '#fff',
                      border: '1px solid #014D88',
                    }}
                  >
                    BMI :{' '}
                    {(
                      formik.values.weight /
                      ((formik.values.height / 100) *
                        (formik.values.height / 100))
                    ).toFixed(2)}
                  </InputGroupText>
                </InputGroup>
              </FormGroup>
            )}
          </div>
        </div>
        <div className="row">
          <div className="form-group mb-3 col-md-8">
            <FormGroup>
              <FormLabelName>Blood Pressure</FormLabelName>
              <InputGroup>
                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopLefttRadius: '0.25rem',
                    borderBottomLeftRadius: '0.25rem',
                  }}
                >
                  systolic(mmHg)
                </InputGroupText>
                <Input
                  type="number"
                  name="systolic"
                  id="systolic"
                  min="90"
                  max="240"
                  onChange={formik.handleChange}
                  value={formik.values.systolic}
                  onKeyUp={handleSystolicInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                  }}
                  disabled={disabledField}
                />

                <InputGroupText
                  addonType="append"
                  style={{
                    backgroundColor: '#014D88',
                    color: '#fff',
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                  }}
                >
                  diastolic(mmHg)
                </InputGroupText>
                <Input
                  type="number"
                  name="diastolic"
                  id="diastolic"
                  min={0}
                  max={140}
                  onChange={formik.handleChange}
                  value={formik.values.diastolic}
                  onKeyUp={handleDiastolicInputValueCheck}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0rem',
                    borderTopRightRadius: '0.25rem',
                    borderBottomRightRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
              </InputGroup>
              {vitalClinicalSupport.systolic !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.systolic}
                </span>
              ) : (
                ''
              )}
              {formik.touched.systolic && formik.errors.systolic && (
                <span className={classes.error}>{formik.errors.systolic}</span>
              )}

              {vitalClinicalSupport.diastolic !== '' ? (
                <span className={classes.error}>
                  {vitalClinicalSupport.diastolic}
                </span>
              ) : (
                ''
              )}
              {formik.touched.diastolic && formik.errors.diastolic !== '' ? (
                <span className={classes.error}>{formik.errors.diastolic}</span>
              ) : (
                ''
              )}
            </FormGroup>
          </div>
          {isFemale() && (
            <div className="form-group mb-3 col-md-4">
              <FormGroup>
                <FormLabelName>
                  Pregnancy Status <span style={{ color: 'red' }}> *</span>
                </FormLabelName>
                <Input
                  type="select"
                  name="pregnant"
                  id="pregnant"
                  onChange={formik.handleChange}
                  value={formik.values.pregnancyStatus}
                  disabled
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                >
                  <option value="">Select Pregnancy Status</option>
                  {pregnancyStatus?.map(value => (
                    <option key={value.id} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
                {formik.touched.pregnancyStatus &&
                  formik.errors.pregnancyStatus && (
                    <span className={classes.error}>
                      {formik.errors.pregnancyStatus}
                    </span>
                  )}
              </FormGroup>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VitalSigns;

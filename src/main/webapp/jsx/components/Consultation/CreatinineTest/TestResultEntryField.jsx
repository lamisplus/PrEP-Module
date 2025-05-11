import React from 'react';
import { FormGroup, Label as FormLabelName, Input } from 'reactstrap';
import { Label } from 'semantic-ui-react';
import moment from 'moment';

// Define the reusable component
const TestResultEntryField = ({
  testName,
  testCheckboxName,
  checkboxState,
  handleCheckboxChange,
  dateName,
  dateValue,
  dateTouched,
  dateError,
  handleDateChange,
  resultName,
  resultValue,
  resultTouched,
  resultError,
  handleResultChange,
  formik,
  disabledField,
  classes,
  color,
}) => (
  <>
    <Label
      as="a"
      color={color}
      style={{ width: '106%', height: '35px' }}
      ribbon
    >
      <h4 style={{ color: '#fff' }}>
        <input
          type="checkbox"
          name={testCheckboxName} // Highlighted prop
          value="Yes"
          onChange={handleCheckboxChange} // Highlighted prop
          checked={checkboxState === 'Yes'} // Highlighted prop
        />{' '}
        {testName} {/* Highlighted prop */}
      </h4>
    </Label>
    <br />
    <br />
    {checkboxState === 'Yes' && ( // Highlighted prop
      <>
        <div className="mb-3 col-md-6">
          <FormGroup>
            <FormLabelName>{testName} Date</FormLabelName>{' '}
            {/* Highlighted prop */}
            <Input
              type="date"
              onKeyDown={e => e.preventDefault()}
              name={dateName} // Highlighted prop
              id={dateName}
              value={dateValue} // Highlighted prop
              onChange={handleDateChange} // Highlighted prop
              style={{
                border: '1px solid #014D88',
                borderRadius: '0.25rem',
              }}
              min={formik.values.encounterDate}
              max={moment(new Date()).format('YYYY-MM-DD')}
              disabled={disabledField} // Highlighted prop
            />
            {dateTouched && dateError && (
              <span className={classes.error}>{dateError}</span>
            )}
          </FormGroup>
        </div>
        <div className="mb-3 col-md-6">
          <FormGroup>
            <FormLabelName>{testName} Result</FormLabelName>{' '}
            {/* Highlighted prop */}
            <Input
              type="text"
              name={resultName} // Highlighted prop
              id={resultName}
              placeholder={`Enter ${testName} result...`} // Highlighted prop
              value={resultValue} // Highlighted prop
              onChange={handleResultChange} // Highlighted prop
              style={{
                border: '1px solid #014D88',
                borderRadius: '0.25rem',
              }}
              disabled={disabledField} // Highlighted prop
            />
            {resultTouched && resultError && (
              <span className={classes.error}>{resultError}</span>
            )}
          </FormGroup>
        </div>
      </>
    )}
  </>
);

export default TestResultEntryField;

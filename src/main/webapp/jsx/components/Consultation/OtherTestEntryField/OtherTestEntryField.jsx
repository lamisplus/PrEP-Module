import React from 'react';
import { TiTrash } from 'react-icons/ti';
import { Button as MatButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Divider from '@material-ui/core/Divider';
import { FormGroup, Label as FormLabelName, Input } from 'reactstrap';
import { Label } from 'semantic-ui-react';
import moment from 'moment';

const OtherTestSection = ({
  otherTest,
  otherTestResult,
  handleCheckboxOtherTest,
  handleInputChangeOtherTest,
  handleRemoveTest,
  handleCreateNewTest,
  otherTestInputRef,
  disabledField,
  formik,
  saving,
  classes,
}) => {
  return (
    <>
      <Label
        as="a"
        color="black"
        style={{ width: '106%', height: '35px' }}
        ribbon
      >
        <h4 style={{ color: '#fff' }}>
          <input
            type="checkbox"
            name="otherTest"
            value="Yes"
            ref={otherTestInputRef}
            onChange={handleCheckboxOtherTest}
            checked={otherTest.length > 0}
          />{' '}
          Other Test{' '}
        </h4>
      </Label>
      <br />
      <br />
      {otherTest.length > 0 &&
        otherTest.map(eachTest => (
          <div className="row" key={eachTest.localId}>
            <div className="mb-1 col-md-3">
              <FormGroup>
                <FormLabelName> Test Name</FormLabelName>
                <Input
                  type="select"
                  name="otherTestsDone"
                  id="otherTestsDone"
                  data-localid={eachTest.localId}
                  data-field="name"
                  onChange={e =>
                    handleInputChangeOtherTest(e, eachTest.localId)
                  }
                  value={eachTest.otherTestsDone}
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                >
                  <option value="">Select</option>
                  {otherTestResult.map(value => (
                    <option key={value.id} value={value.code}>
                      {value.display}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>

            {eachTest.name === 'PREP_OTHER_TEST_OTHER_(SPECIFY)' && (
              <div style={{ display: 'none' }} className="mb-1 col-md-3">
                <FormGroup>
                  <FormLabelName> Other Test Name </FormLabelName>
                  <Input
                    type="text"
                    name="otherTestName"
                    id="otherTestName"
                    data-localid={eachTest.localId}
                    data-field="otherTestName"
                    value={eachTest.otherTestName}
                    onChange={e =>
                      handleInputChangeOtherTest(e, eachTest.localId)
                    }
                    style={{
                      border: '1px solid #014D88',
                      borderRadius: '0.25rem',
                    }}
                    disabled={disabledField}
                  />
                </FormGroup>
              </div>
            )}

            <div className="mb-1 col-md-3">
              <FormGroup>
                <FormLabelName> Test Date</FormLabelName>
                <Input
                  type="date"
                  onKeyDown={e => e.preventDefault()}
                  name="testDate"
                  id="testDate"
                  data-localid={eachTest.localId}
                  data-field="testDate"
                  value={eachTest.testDate}
                  onChange={e =>
                    handleInputChangeOtherTest(e, eachTest.localId)
                  }
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                  min={formik.values.encounterDate}
                  max={moment(new Date()).format('YYYY-MM-DD')}
                />
              </FormGroup>
            </div>

            <div className="mb-1 col-md-3">
              <FormGroup>
                <FormLabelName> Test Result</FormLabelName>
                <Input
                  type="text"
                  name="result"
                  id="result"
                  data-localid={eachTest.localId}
                  data-field="result"
                  value={eachTest.result}
                  onChange={e =>
                    handleInputChangeOtherTest(e, eachTest.localId)
                  }
                  style={{
                    border: '1px solid #014D88',
                    borderRadius: '0.25rem',
                  }}
                  disabled={disabledField}
                />
              </FormGroup>
            </div>

            <div className="mb-1 col-md-3 d-flex align-items-end">
              <button
                variant="contained"
                color="secondary"
                size="medium"
                className={`${classes.button} btn btn-danger`}
                style={{
                  display: 'block',
                  margin: 0,
                  fontSize: '1.2em',
                }}
                disabled={disabledField}
                onClick={() => handleRemoveTest(eachTest.localId)}
              >
                <TiTrash />
              </button>
            </div>

            {otherTest.length > 1 && (
              <Divider component="li" style={{ marginBottom: '10px' }} />
            )}
          </div>
        ))}
      {formik.touched.otherTestsDone && formik.errors.otherTestsDone && (
        <span className={classes.error}>{formik.errors.otherTestsDone}</span>
      )}
      {otherTest.length > 0 && (
        <div className="p-2">
          <MatButton
            type="button"
            variant="contained"
            color="primary"
            className={`${classes.button}`}
            startIcon={<AddIcon />}
            style={{ backgroundColor: '#014d88' }}
            onClick={handleCreateNewTest}
            disabled={saving || disabledField}
          >
            <span style={{ textTransform: 'capitalize' }}>
              Add more test results
            </span>
          </MatButton>
        </div>
      )}
    </>
  );
};

export default OtherTestSection;

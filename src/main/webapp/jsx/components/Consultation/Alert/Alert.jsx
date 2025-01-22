import { CardContent, Card, CardHeader, Button } from '@material-ui/core';
import React, { useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { CardFooter } from 'reactstrap';

export const Alert = ({
  show,
  title,
  body,
  nextAppointmentDate,
  onClose,
  patientObj,
}) => {
  const warningIconColorConfig = useMemo(
    () => ({
      0: 'initial',
      1: '#F57C00',
      2: '#F44336',
    }),
    []
  );
  if (!show) return <></>;

  return (
    <Modal
      show={show}
      className="fade text-grey"
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ color: 'rgb(1, 77, 136)' }}
        >
          <h2 className="d-flex align-items-center">
            {' '}
            <span
              className="p-2"
              style={{
                fontSize: '1.2em',
                color: warningIconColorConfig[`${patientObj?.sendCabLaAlert}`],
              }}
            >
              {' '}
              ⚠{' '}
            </span>{' '}
            <span style={{ fontSize: '.7em' }}>{title}</span>
          </h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Hello there! <br />
          <br /> Kindly be reminded that{' '}
          <span className="text-primary">{patientObj?.firstName}'s</span> {body}{' '}
          <span style={{ color: '#FF6347' }}>
            {`[${nextAppointmentDate}]`}.
          </span>{' '}
          You may want to reach out them as soon as possible.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onClose}
          style={{
            backgroundColor: '#014d88',
            color: '#fff',
            margin: 'auto .2em',
          }}
          size="small"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

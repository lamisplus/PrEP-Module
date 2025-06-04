import { CardContent, Card, CardHeader, Button } from '@material-ui/core';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { CardFooter } from 'reactstrap';

export const Alert = ({ show, title, body, footer, onClose }) => {
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
          className="text-info"
          id="contained-modal-title-vcenter"
          style={{}}
        >
          <h2>
            {' '}
            <span> Reminder: </span> <br />{' '}
            <span style={{ fontSize: '.7em' }}>{title}</span>
          </h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{body}</p>
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

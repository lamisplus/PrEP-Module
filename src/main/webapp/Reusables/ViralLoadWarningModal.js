import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import WarningIcon from "@material-ui/icons/Warning";

const SCHEME_AMBER = "#FF9800";
const SCHEME_LIGHT_BLUE = "#03A9F4";

export const NO_VIRAL_LOAD_MESSAGE =
  "No viral load record was found for this client, so viral load could not be " +
  "used to assess their PEP/PrEP outcome." +
  "please ensure a viral load result is captured when available.";

const ViralLoadWarningModal = ({ isOpen, onClose, message }) => (
  <Modal isOpen={isOpen} centered>
    <ModalHeader style={{ backgroundColor: SCHEME_AMBER }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ffffff" }}>
        <WarningIcon style={{ color: "#ffffff", fontSize: "1.75rem", flexShrink: 0 }} />
        Viral Load Not Found
      </span>
    </ModalHeader>
    <ModalBody>
      <span>{message || NO_VIRAL_LOAD_MESSAGE}</span>
    </ModalBody>
    <ModalFooter>
      <Button
        onClick={onClose}
        style={{ backgroundColor: SCHEME_LIGHT_BLUE, borderColor: SCHEME_LIGHT_BLUE }}
      >
        Dismiss
      </Button>
    </ModalFooter>
  </Modal>
);

export default ViralLoadWarningModal;

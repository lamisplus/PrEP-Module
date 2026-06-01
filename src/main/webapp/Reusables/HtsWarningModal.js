import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { NO_VALID_HTS_WARNING } from "../Utils/htsEncounter";

// LAMISPlus theme primary (used for the Proceed action so the modal matches the
// rest of the PrEP forms). The header keeps a warning amber — warnings are an
// allowed exception to the theme palette.
const THEME_PRIMARY = "#014D88";
const WARNING_AMBER = "#ffc107";

/**
 * Non-blocking warning shown when a PrEP/PEP form cannot resolve a valid linked
 * HTS encounter (common for records migrated from the old PrEP tables). The
 * user acknowledges with "Proceed" and may still fill in / submit the form —
 * HTS-sourced fields are never validated as required in this state.
 */
const HtsWarningModal = ({ isOpen, onProceed, message }) => (
  <Modal isOpen={isOpen} toggle={onProceed} centered backdrop="static">
    <ModalHeader
      toggle={onProceed}
      style={{ backgroundColor: WARNING_AMBER, color: "#212529" }}
    >
      HTS Record Not Found
    </ModalHeader>
    <ModalBody>{message || NO_VALID_HTS_WARNING}</ModalBody>
    <ModalFooter>
      <Button
        onClick={onProceed}
        style={{ backgroundColor: THEME_PRIMARY, borderColor: THEME_PRIMARY }}
      >
        Proceed
      </Button>
    </ModalFooter>
  </Modal>
);

export default HtsWarningModal;

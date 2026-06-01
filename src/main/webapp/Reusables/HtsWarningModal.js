import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { NO_VALID_HTS_WARNING } from "../Utils/htsEncounter";

// App colour scheme. The header uses the red-orange (warning / attention) and
// the Proceed action uses the dark blue (primary) so the modal matches the rest
// of the module.
const SCHEME_DARK_BLUE = "#0D47A1";
const SCHEME_RED_ORANGE = "#F44336";

/**
 * Non-blocking warning shown when a PrEP/PEP form cannot resolve a valid linked
 * HTS encounter (common for records migrated from the old PrEP tables). The
 * user acknowledges with "Proceed" and may still fill in / submit the form —
 * HTS-sourced fields are never validated as required in this state.
 */
const HtsWarningModal = ({ isOpen, onProceed, message }) => (
  <Modal isOpen={isOpen} centered backdrop="static" keyboard={false}>
    <ModalHeader style={{ backgroundColor: SCHEME_RED_ORANGE, color: "#ffffff" }}>
      HTS Record Not Found
    </ModalHeader>
    <ModalBody>{message || NO_VALID_HTS_WARNING}</ModalBody>
    <ModalFooter>
      <Button
        onClick={onProceed}
        style={{ backgroundColor: SCHEME_DARK_BLUE, borderColor: SCHEME_DARK_BLUE }}
      >
        Proceed
      </Button>
    </ModalFooter>
  </Modal>
);

export default HtsWarningModal;

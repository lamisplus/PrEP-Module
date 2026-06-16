import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import BlockIcon from "@material-ui/icons/Block";
import { NO_VALID_HTS_MESSAGE } from "../Utils/htsEncounter";

// App colour scheme. The header/icon use the red-orange (operation not allowed)
// and the dismiss action uses the light blue so the modal matches the module.
const SCHEME_RED_ORANGE = "#F44336";
const SCHEME_LIGHT_BLUE = "#03A9F4";

/**
 * Hard block shown when a PrEP/PEP form cannot resolve a valid linked HTS
 * encounter (e.g. records migrated from the old PrEP tables, or clients with no
 * HTS service yet). Per the bootcamp requirement a valid HTS record is required
 * for PrEP/PEP screening, so there is no "Proceed" — the user must go to the
 * HTS module, provide HTS service, and come back. The single action dismisses
 * the modal and leaves them where they were (the dashboard on the form routes,
 * the patient list on the Enroll step). `dismissLabel` lets the caller match the
 * wording to that context; it defaults to "Return to Dashboard".
 */
const HtsWarningModal = ({
  isOpen,
  onReturnToDashboard,
  message,
  dismissLabel = "Return to Dashboard",
}) => (
  <Modal isOpen={isOpen} centered backdrop="static" keyboard={false}>
    <ModalHeader style={{ backgroundColor: SCHEME_RED_ORANGE }}>
      {/* Colour the text on the title element itself; setting it on the header
          wrapper is overridden by the theme's `.modal-title` rule. The icon sits
          at the top-left before the title text. */}
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ffffff" }}>
        <BlockIcon style={{ color: "#ffffff", fontSize: "1.75rem", flexShrink: 0 }} />
        HTS Record Required
      </span>
    </ModalHeader>
    <ModalBody>
      <span>{message || NO_VALID_HTS_MESSAGE}</span>
    </ModalBody>
    <ModalFooter>
      <Button
        onClick={onReturnToDashboard}
        style={{ backgroundColor: SCHEME_LIGHT_BLUE, borderColor: SCHEME_LIGHT_BLUE }}
      >
        {dismissLabel}
      </Button>
    </ModalFooter>
  </Modal>
);

export default HtsWarningModal;

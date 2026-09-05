import { toast } from "react-toastify";

// Long data-entry forms are submitted from the bottom of a tall page. A toast
// at the top of the viewport is easy to miss when the user's attention is on
// the submit button they just pressed, and the default 3s close can fire
// before they look up. Anchor these next to the action instead, and hold
// them longer. Grids and history panes keep the container's top-center.
//
// Per-call options passed by the caller still win over these defaults.
const FORM_TOAST = { position: "bottom-center", autoClose: 5000 };

const withDefaults = (options) => ({ ...FORM_TOAST, ...options });

export const formToast = {
  success: (content, options) => toast.success(content, withDefaults(options)),
  error: (content, options) => toast.error(content, withDefaults(options)),
  info: (content, options) => toast.info(content, withDefaults(options)),
  warn: (content, options) => toast.warn(content, withDefaults(options)),
};

export default formToast;

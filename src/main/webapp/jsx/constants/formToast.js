import { toast } from "react-toastify";

// Long data-entry forms are submitted from the bottom of a tall page, where a
// toast pinned to the top of the viewport is easy to miss. Anchor these next
// to the action instead. Grids and history panes keep the container's
// top-center.
//
// Position only — type, colour, duration and every other option are left to
// the container and the call site.
const FORM_TOAST = { position: "bottom-center" };

const withDefaults = (options) => ({ ...FORM_TOAST, ...options });

export const formToast = {
  success: (content, options) => toast.success(content, withDefaults(options)),
  error: (content, options) => toast.error(content, withDefaults(options)),
  info: (content, options) => toast.info(content, withDefaults(options)),
  warn: (content, options) => toast.warn(content, withDefaults(options)),
};

export default formToast;

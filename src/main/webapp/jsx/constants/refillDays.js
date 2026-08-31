// Refill Days is a whole-day supply count. The field takes digits only — no
// sign, decimal point or exponent — so a value such as "-20" or "1e3" can
// never be typed, pasted or spun into it, and anything above MAX_REFILL_DAYS
// is pulled back down to the cap.
export const MIN_REFILL_DAYS = 1;
export const MAX_REFILL_DAYS = 90;

// Editing/navigation keys that must keep working while typing. Anything else
// that is not a digit is rejected (clipboard and select-all shortcuts come
// through with a modifier held, which is allowed separately).
const ALLOWED_CONTROL_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "Enter",
  "Escape",
  "Home",
  "End",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
];

// Strips everything but digits, drops leading zeros (so "0" and "-20" cannot
// stand) and caps the result at MAX_REFILL_DAYS. Returns "" for an empty or
// fully invalid value so the field can still be cleared.
export const sanitizeRefillDays = value => {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
  if (digits === "") return "";
  return String(Math.min(Number(digits), MAX_REFILL_DAYS));
};

// onKeyDown guard: blocks the keystroke before the character reaches the field.
export const blockNonNumericRefillDaysKeys = e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (ALLOWED_CONTROL_KEYS.includes(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
};

// Wraps a form's onChange so the handler only ever sees a sanitized value.
export const withRefillDaysGuard = handleInputChange => e => {
  const clean = sanitizeRefillDays(e.target.value);
  if (e.target.value !== clean) e.target.value = clean;
  handleInputChange(e);
};

// onPaste guard: pasting bypasses onKeyDown, so sanitize the clipboard text
// ourselves and feed the cleaned value through the same change handler.
export const withRefillDaysPasteGuard = handleInputChange => e => {
  e.preventDefault();
  const clipboard = e.clipboardData || window.clipboardData;
  const clean = sanitizeRefillDays(clipboard ? clipboard.getData("text") : "");
  const { name, id } = e.target;
  e.target.value = clean;
  handleInputChange({ target: { name, id, value: clean } });
};

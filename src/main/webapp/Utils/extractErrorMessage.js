// Pulls the most descriptive message out of an axios error so the user
// sees the backend's intent ("A clinic visit has already been recorded
// for this client on 13 May 2026.") instead of a generic
// "Something went wrong."
//
// Walks through every shape the server can produce, in priority order:
//   1. Spring's `ResponseStatusException`   -> response.data.message
//   2. Wrapped `ApiError`                   -> response.data.apierror.message
//   3. Spring's default error JSON           -> response.data.error
//   4. Server returned plain text            -> response.data
//   5. Network/CORS/etc                      -> error.message
//   6. Caller-supplied fallback              -> the supplied default
//
// Always returns a non-empty string.

const trimmed = (v) => (typeof v === "string" ? v.trim() : "");

export const extractErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (!error) return fallback;

  const data = error?.response?.data;

  // 1. { message: "…" }  — what ResponseStatusException + most of our
  // PrepErrors helpers produce.
  if (typeof data === "object" && data !== null) {
    const direct = trimmed(data.message);
    if (direct) return direct;

    // 2. { apierror: { message: "…" } }  — the legacy ApiError wrapper.
    const wrapped = trimmed(data.apierror?.message);
    if (wrapped) return wrapped;

    // 3. { error: "…" } — Spring's default error JSON, when no message is set.
    const errLabel = trimmed(data.error);
    if (errLabel) return errLabel;
  }

  // 4. Server returned a plain text body.
  if (typeof data === "string") {
    const text = trimmed(data);
    if (text) return text;
  }

  // 5. Network errors, request cancellations, etc.
  const generic = trimmed(error?.message);
  if (generic && generic !== "Network Error") return generic;

  // 6. Caller's fallback.
  return fallback;
};

export default extractErrorMessage;

// Maps a stored regimen value (codeset code, numeric id, or display label)
// to its human-readable name. Used by Recent Activities, History, dashboard
// chips, and any grid that surfaces a regimen column — so the user never
// sees "PREP_REGIMEN_TDF_FTC" or "3" on screen.

const REGIMEN_CODE_DISPLAY = {
  PREP_REGIMEN_TDF_FTC: "TDF/FTC",
  PREP_REGIMEN_TDF_3TC: "TDF/3TC",
  PREP_REGIMEN_CABOTEGRAVIR: "Cabotegravir",
  PREP_REGIMEN_LENACAPAVIR: "Lenacapavir",
  PEP_REGIMEN_TDF_FTC: "TDF/FTC",
  PEP_REGIMEN_TDF_3TC_DTG: "TDF/3TC/DTG",
  PEP_REGIMEN_OTHERS: "Others",
};

// Legacy numeric ids stored on prophylaxis_initiation.prep_regimen back when
// the dropdown submitted the row id; keep the mapping so historical records
// render correctly.
const REGIMEN_ID_DISPLAY = {
  "1": "TDF/FTC",
  "2": "TDF/3TC",
  "3": "Cabotegravir",
  "4": "Lenacapavir",
};

export const displayRegimen = value =>
  value
    ? REGIMEN_CODE_DISPLAY[value] || REGIMEN_ID_DISPLAY[String(value)] || value
    : value;

export default displayRegimen;

import { useEffect, useState } from "react";
import {
  fetchPrepRegimens,
  fetchPepRegimens,
} from "../jsx/components/Consultation/codesets";

// Loads PREP_REGIMEN + PEP_REGIMEN codesets and returns a { idMap, codeMap }
// pair so callers can resolve a stored regimen value to its display name no
// matter which shape was persisted:
//   - canonical code (e.g. "PREP_REGIMEN_TDF_FTC") → codeMap
//   - codeset row id (e.g. "2172") saved by the broken dropdown → idMap
// Display also falls back through the static displayRegimen() table for the
// legacy 1–4 ids and the well-known codes.
export default function useRegimenLookup() {
  const [idMap, setIdMap] = useState({});
  const [codeMap, setCodeMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPrepRegimens(), fetchPepRegimens()])
      .then(([prepList, pepList]) => {
        if (cancelled) return;
        const ids = {};
        const codes = {};
        (prepList || []).forEach(r => {
          if (r.id != null) ids[String(r.id)] = r.regimen;
          if (r.code) codes[r.code] = r.regimen;
        });
        (pepList || []).forEach(r => {
          // PEP fetch returns { value, label } from getPepRegimenOptions()
          // and { id, regimen, code } when sourced from the live codeset.
          const code = r.code || r.value;
          const display = r.regimen || r.label;
          if (r.id != null) ids[String(r.id)] = display;
          if (code) codes[code] = display;
        });
        setIdMap(ids);
        setCodeMap(codes);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { idMap, codeMap };
}

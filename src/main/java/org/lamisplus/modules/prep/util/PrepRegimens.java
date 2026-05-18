package org.lamisplus.modules.prep.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Resolves regimen display names for PrEP / PEP follow-up visits and initiations.
 *
 * <p>Regimens are no longer rows in the {@code prep_regimen} table — they come from
 * codesets ({@code PREP_REGIMEN}, {@code PEP_REGIMEN}). The frontend keeps a small
 * hardcoded list whose numeric ids feed {@code regimen_id} on follow-ups; this map
 * mirrors that list so the backend can hand back display names in DTOs without
 * triggering a missing-FK lookup against {@code prep_regimen}.
 */
public final class PrepRegimens {

    private static final Map<Long, String> BY_ID;
    private static final Map<String, String> BY_CODE;

    static {
        Map<Long, String> byId = new HashMap<>();
        byId.put(1L, "TDF/FTC");
        byId.put(2L, "TDF/3TC");
        byId.put(3L, "Cabotegravir");
        byId.put(4L, "Lenacapavir");
        BY_ID = Collections.unmodifiableMap(byId);

        Map<String, String> byCode = new HashMap<>();
        byCode.put("PREP_REGIMEN_TDF_FTC", "TDF/FTC");
        byCode.put("PREP_REGIMEN_TDF_3TC", "TDF/3TC");
        byCode.put("PREP_REGIMEN_CABOTEGRAVIR", "Cabotegravir");
        byCode.put("PREP_REGIMEN_LENACAPAVIR", "Lenacapavir");
        byCode.put("PEP_REGIMEN_TDF_FTC", "TDF/FTC");
        byCode.put("PEP_REGIMEN_TDF_3TC_DTG", "TDF/3TC/DTG");
        byCode.put("PEP_REGIMEN_OTHERS", "Others");
        BY_CODE = Collections.unmodifiableMap(byCode);
    }

    public static String displayById(Long id) {
        if (id == null) return null;
        return BY_ID.get(id);
    }

    public static String displayByCode(String code) {
        if (code == null) return null;
        return BY_CODE.getOrDefault(code, code);
    }

    private PrepRegimens() {}
}

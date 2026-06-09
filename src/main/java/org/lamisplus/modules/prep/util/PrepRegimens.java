package org.lamisplus.modules.prep.util;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Resolves regimen display names for PrEP / PEP follow-up visits and initiations.
 *
 * <p>Regimens come from codesets ({@code PREP_REGIMEN}, {@code PEP_REGIMEN}).
 * The {@code regimen_id} column is now a {@code varchar(255)} that stores the
 * codeset's canonical code (e.g. {@code PREP_REGIMEN_TDF_FTC}), persisted by the
 * frontend dropdown. {@link #displayByCode(String)} is the primary resolver;
 * {@link #displayById(Long)} remains as a fallback for legacy rows that survived
 * the bigint→varchar migration as a stringified numeric id.
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

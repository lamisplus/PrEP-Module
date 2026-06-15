BEGIN;

-- ----------------------------------------------------------------------------
-- 0) Backup the rows we are about to touch. Drop once verified.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_encounter_colfix_backup_20260615 AS
SELECT e.id, e.date_of_visit, e.facility_id, now() AS backed_up_at
FROM hts_encounter e
WHERE e.archived = false
  AND (e.date_of_visit IS NULL OR e.facility_id IS NULL);

-- ----------------------------------------------------------------------------
-- 1) PREVIEW — what will change, and whether a fallback is actually available.
-- ----------------------------------------------------------------------------
SELECT
    e.id,
    e.patient_id,
    e.date_of_visit                                   AS current_visit_date,
    COALESCE(e.date_created::date, p.date_of_registration) AS new_visit_date,
    e.facility_id                                     AS current_facility_id,
    p.facility_id                                     AS new_facility_id
FROM hts_encounter e
LEFT JOIN patient_person p ON p.id = e.patient_id
WHERE e.archived = false
  AND (e.date_of_visit IS NULL OR e.facility_id IS NULL)
ORDER BY e.id;

-- ----------------------------------------------------------------------------
-- 2a) UPDATE date_of_visit where missing.
-- ----------------------------------------------------------------------------
UPDATE hts_encounter e
SET date_of_visit = COALESCE(e.date_created::date, p.date_of_registration)
FROM patient_person p
WHERE p.id = e.patient_id
  AND e.archived = false
  AND e.date_of_visit IS NULL
  AND COALESCE(e.date_created::date, p.date_of_registration) IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2b) UPDATE facility_id where missing, sourcing from the patient's facility.
-- ----------------------------------------------------------------------------
UPDATE hts_encounter e
SET facility_id = p.facility_id
FROM patient_person p
WHERE p.id = e.patient_id
  AND e.archived = false
  AND e.facility_id IS NULL
  AND p.facility_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3) VERIFY — any rows still NULL have no usable fallback and need manual review.
-- ----------------------------------------------------------------------------
SELECT e.id, e.patient_id, e.date_of_visit, e.facility_id
FROM hts_encounter e
WHERE e.archived = false
  AND (e.date_of_visit IS NULL OR e.facility_id IS NULL)
ORDER BY e.id;

-- ----------------------------------------------------------------------------
-- 4) Review the output above, then:
--        COMMIT;     -- to apply
--        ROLLBACK;   -- to discard
-- ----------------------------------------------------------------------------
-- COMMIT;

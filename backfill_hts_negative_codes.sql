
BEGIN;

-- ----------------------------------------------------------------------------
-- 0) (Recommended) one-time backup of the rows we are about to touch.
--    Drop this table once you've confirmed the result is correct.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_encounter_obs_backup_20260615 AS
SELECT id, observation, now() AS backed_up_at
FROM hts_encounter
WHERE archived = false
  AND observation->>'finalHivTestResult' = 'Negative'
  AND COALESCE(observation->>'initialHivTest', '') <> 'STI_HIV_RESULT_NEGATIVE'
  AND COALESCE(observation->>'confirmatoryHivTest', '') <> 'HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE'
  -- never touch a positive in any of the three result fields
  AND COALESCE(observation->>'confirmatoryHivTest', '') <> 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE'
  AND COALESCE(observation->>'initialHivTest', '')      <> 'STI_HIV_RESULT_POSITIVE'
  AND COALESCE(observation->>'finalHivTestResult', '')  <> 'Positive';

-- ----------------------------------------------------------------------------
-- 1) PREVIEW — how many / which rows will be updated. Run this first.
-- ----------------------------------------------------------------------------
SELECT
    id,
    patient_id,
    facility_id,
    date_of_visit,
    observation->>'initialHivTest'      AS initial_hiv_test,
    observation->>'confirmatoryHivTest' AS confirmatory_hiv_test,
    observation->>'finalHivTestResult'  AS final_hiv_test_result,
    observation->>'typeOfHivTestDone'   AS type_of_hiv_test_done
FROM hts_encounter
WHERE archived = false
  AND observation->>'finalHivTestResult' = 'Negative'
  AND COALESCE(observation->>'initialHivTest', '') <> 'STI_HIV_RESULT_NEGATIVE'
  AND COALESCE(observation->>'confirmatoryHivTest', '') <> 'HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE'
  AND COALESCE(observation->>'confirmatoryHivTest', '') <> 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE'
  AND COALESCE(observation->>'initialHivTest', '')      <> 'STI_HIV_RESULT_POSITIVE'
  AND COALESCE(observation->>'finalHivTestResult', '')  <> 'Positive'
ORDER BY id;

-- ----------------------------------------------------------------------------
-- 2) UPDATE — set initialHivTest to the codeset code the PrEP filter expects.
-- ----------------------------------------------------------------------------
UPDATE hts_encounter
SET observation = jsonb_set(
        observation,
        '{initialHivTest}',
        '"STI_HIV_RESULT_NEGATIVE"'::jsonb,
        true   -- create the key if absent
    )
WHERE archived = false
  AND observation->>'finalHivTestResult' = 'Negative'
  AND COALESCE(observation->>'initialHivTest', '') <> 'STI_HIV_RESULT_NEGATIVE'
  AND COALESCE(observation->>'confirmatoryHivTest', '') <> 'HIV_CONFIRMATORY_TEST_RESULT_NEGATIVE'
  AND COALESCE(observation->>'confirmatoryHivTest', '') <> 'HIV_CONFIRMATORY_TEST_RESULT_POSITIVE'
  AND COALESCE(observation->>'initialHivTest', '')      <> 'STI_HIV_RESULT_POSITIVE'
  AND COALESCE(observation->>'finalHivTestResult', '')  <> 'Positive';

-- ----------------------------------------------------------------------------
-- 3) VERIFY — these rows should now satisfy the PrEP Branch-A inclusion.
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS now_negative_coded
FROM hts_encounter
WHERE archived = false
  AND observation->>'initialHivTest' = 'STI_HIV_RESULT_NEGATIVE';

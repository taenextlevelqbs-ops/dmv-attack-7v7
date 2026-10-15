-- Enforce one registration per athlete, case-insensitive, including concurrent submissions.
-- Check for any remaining duplicates before applying.
CREATE UNIQUE INDEX IF NOT EXISTS tryout_submissions_unique_athlete_identity
ON public.tryout_submissions (
  lower(btrim(athlete_first_name)),
  lower(btrim(athlete_last_name)),
  date_of_birth
);

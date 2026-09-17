-- Rename to reflect that this timestamp now marks when a response was
-- started, not necessarily submitted (preserves existing data).
ALTER TABLE "survey_response" RENAME COLUMN "submittedAt" TO "startedAt";

-- Track completion separately from creation, so an in-progress response
-- (started, not yet finished) can be told apart from a completed one.
ALTER TABLE "survey_response" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Responses created before this migration that already have every question
-- answered were, in practice, full submissions under the old logic. Mark
-- them completed using their original timestamp so they don't show up as
-- "in progress" for a resuming user.
UPDATE "survey_response"
SET "completedAt" = "startedAt"
WHERE id IN (
  SELECT "responseId" FROM "survey_answer"
  GROUP BY "responseId"
  HAVING COUNT(*) >= 20
);

CREATE TABLE IF NOT EXISTS "raceActionLogs" (
  "id" VARCHAR(64) PRIMARY KEY,
  "raceId" VARCHAR(64) NOT NULL REFERENCES "races" ("id") ON DELETE CASCADE,
  "userId" VARCHAR(64) REFERENCES "users" ("id") ON DELETE SET NULL,
  "action" VARCHAR(64) NOT NULL,
  "fromStatus" VARCHAR(64),
  "toStatus" VARCHAR(64),
  "details" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_race_action_logs_race"
  ON "raceActionLogs" ("raceId", "createdAt");

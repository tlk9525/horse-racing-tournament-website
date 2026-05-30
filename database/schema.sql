-- Horse Racing Tournament Management System - PostgreSQL schema
-- De tai: He thong quan ly giai dua ngua
-- Chay moi database:
--   createdb horse_racing
--   psql -d horse_racing -f database/schema.sql
--   psql -d horse_racing -f database/seed.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Drop order for repeatable demo runs
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS v_prediction_scoreboard;
DROP VIEW IF EXISTS v_horse_ranking;
DROP VIEW IF EXISTS v_race_entry_roster;
DROP VIEW IF EXISTS v_tournament_flow_status;

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS awards CASCADE;
DROP TABLE IF EXISTS prize_distributions CASCADE;
DROP TABLE IF EXISTS ranking_snapshots CASCADE;
DROP TABLE IF EXISTS prediction_rewards CASCADE;
DROP TABLE IF EXISTS bet_selections CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS race_result_details CASCADE;
DROP TABLE IF EXISTS race_results CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS live_race_events CASCADE;
DROP TABLE IF EXISTS pre_race_checks CASCADE;
DROP TABLE IF EXISTS referee_assignments CASCADE;
DROP TABLE IF EXISTS race_entries CASCADE;
DROP TABLE IF EXISTS races CASCADE;
DROP TABLE IF EXISTS horse_jockey_assignments CASCADE;
DROP TABLE IF EXISTS jockey_invitations CASCADE;
DROP TABLE IF EXISTS tournament_registrations CASCADE;
DROP TABLE IF EXISTS horse_medical_records CASCADE;
DROP TABLE IF EXISTS horses CASCADE;
DROP TABLE IF EXISTS tournament_rounds CASCADE;
DROP TABLE IF EXISTS tournament_prize_rules CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS approval_logs CASCADE;
DROP TABLE IF EXISTS user_documents CASCADE;
DROP TABLE IF EXISTS spectator_profiles CASCADE;
DROP TABLE IF EXISTS referee_profiles CASCADE;
DROP TABLE IF EXISTS jockey_profiles CASCADE;
DROP TABLE IF EXISTS owner_profiles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------------------------
-- Core account and authorization
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id             VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  full_name      VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  phone          VARCHAR(32),
  role           VARCHAR(32) NOT NULL CHECK (role IN (
    'admin', 'owner', 'jockey', 'referee', 'spectator'
  )),
  status         VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'active', 'approved', 'rejected', 'suspended', 'locked'
  )),
  date_of_birth  DATE,
  address        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE permissions (
  id           VARCHAR(64) PRIMARY KEY,
  code         VARCHAR(128) NOT NULL UNIQUE,
  name         VARCHAR(255) NOT NULL,
  description  TEXT
);

CREATE TABLE role_permissions (
  role           VARCHAR(32) NOT NULL CHECK (role IN (
    'admin', 'owner', 'jockey', 'referee', 'spectator'
  )),
  permission_id  VARCHAR(64) NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);

CREATE TABLE owner_profiles (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             VARCHAR(64) NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  stable_name         VARCHAR(255) NOT NULL,
  business_license_no VARCHAR(128),
  verification_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'approved', 'rejected'
  )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jockey_profiles (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             VARCHAR(64) NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  license_no          VARCHAR(128) NOT NULL,
  certificate_url     TEXT,
  competition_level   VARCHAR(128),
  height_cm           NUMERIC(5,2),
  weight_kg           NUMERIC(5,2),
  experience_years    INTEGER DEFAULT 0 CHECK (experience_years >= 0),
  bio                 TEXT,
  status              VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending', 'published', 'rejected', 'archived'
  )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE referee_profiles (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             VARCHAR(64) NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  license_no          VARCHAR(128) NOT NULL,
  level               VARCHAR(128),
  years_experience    INTEGER DEFAULT 0 CHECK (years_experience >= 0),
  status              VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'inactive', 'suspended'
  ))
);

CREATE TABLE spectator_profiles (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             VARCHAR(64) NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  reward_points       INTEGER NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  preferred_language  VARCHAR(32) DEFAULT 'vi'
);

CREATE TABLE user_documents (
  id             VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id        VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  document_type  VARCHAR(64) NOT NULL CHECK (document_type IN (
    'identity_card', 'owner_license', 'jockey_certificate', 'referee_license', 'other'
  )),
  file_url       TEXT NOT NULL,
  status         VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected'
  )),
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approval_logs (
  id              VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  entity_type     VARCHAR(64) NOT NULL,
  entity_id       VARCHAR(64) NOT NULL,
  requested_by    VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  reviewed_by     VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  status          VARCHAR(32) NOT NULL CHECK (status IN (
    'pending', 'approved', 'rejected'
  )),
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

CREATE INDEX idx_approval_logs_entity ON approval_logs (entity_type, entity_id);
CREATE INDEX idx_approval_logs_status ON approval_logs (status);

-- ---------------------------------------------------------------------------
-- Tournament setup
-- ---------------------------------------------------------------------------
CREATE TABLE tournaments (
  id                   VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                 VARCHAR(255) NOT NULL,
  season               VARCHAR(64) NOT NULL,
  start_date           DATE NOT NULL,
  end_date             DATE NOT NULL,
  location             VARCHAR(255) NOT NULL,
  total_rounds         INTEGER NOT NULL CHECK (total_rounds > 0),
  rules                TEXT,
  prize_pool           NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (prize_pool >= 0),
  registration_open_at TIMESTAMPTZ,
  registration_close_at TIMESTAMPTZ,
  status               VARCHAR(64) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'open_registration',
    'approvals',
    'scheduling',
    'awaiting_confirmations',
    'prediction_open',
    'active',
    'results_review',
    'published',
    'completed',
    'cancelled'
  )),
  created_by           VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_tournaments_status ON tournaments (status);
CREATE INDEX idx_tournaments_season ON tournaments (season);

CREATE TABLE tournament_prize_rules (
  id             VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id  VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  award_type     VARCHAR(64) NOT NULL CHECK (award_type IN (
    'race_position', 'champion_horse', 'best_jockey', 'best_owner', 'prediction_reward'
  )),
  position_no    INTEGER CHECK (position_no IS NULL OR position_no > 0),
  title          VARCHAR(255) NOT NULL,
  point_value    INTEGER DEFAULT 0,
  cash_amount    NUMERIC(14,2) DEFAULT 0 CHECK (cash_amount >= 0),
  description    TEXT
);

CREATE TABLE tournament_rounds (
  id             VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id  VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  round_no       INTEGER NOT NULL CHECK (round_no > 0),
  name           VARCHAR(255) NOT NULL,
  race_date      DATE,
  status         VARCHAR(64) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'active', 'completed', 'cancelled'
  )),
  UNIQUE (tournament_id, round_no)
);

CREATE INDEX idx_tournament_rounds_tournament ON tournament_rounds (tournament_id);

-- ---------------------------------------------------------------------------
-- Horse registration and jockey assignment
-- ---------------------------------------------------------------------------
CREATE TABLE horses (
  id                     VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  owner_user_id           VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name                   VARCHAR(255) NOT NULL,
  breed                  VARCHAR(128),
  age                    INTEGER CHECK (age IS NULL OR age > 0),
  sex                    VARCHAR(16) CHECK (sex IS NULL OR sex IN ('male', 'female', 'gelding')),
  weight_kg              NUMERIC(6,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  color                  VARCHAR(128),
  achievements           TEXT,
  health_certificate_url TEXT,
  status                 VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending', 'approved', 'rejected', 'retired'
  )),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_horses_owner ON horses (owner_user_id);
CREATE INDEX idx_horses_status ON horses (status);

CREATE TABLE horse_medical_records (
  id              VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  horse_id         VARCHAR(64) NOT NULL REFERENCES horses (id) ON DELETE CASCADE,
  checked_by       VARCHAR(255),
  check_date       DATE NOT NULL,
  weight_kg        NUMERIC(6,2),
  health_status    VARCHAR(64) NOT NULL CHECK (health_status IN (
    'fit', 'monitoring', 'unfit'
  )),
  note             TEXT,
  document_url     TEXT
);

CREATE TABLE tournament_registrations (
  id             VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id  VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  horse_id       VARCHAR(64) NOT NULL REFERENCES horses (id) ON DELETE CASCADE,
  owner_user_id  VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status         VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'withdrawn'
  )),
  note           TEXT,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by    VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  reviewed_at    TIMESTAMPTZ,
  UNIQUE (tournament_id, horse_id)
);

CREATE INDEX idx_tournament_registrations_status ON tournament_registrations (status);

CREATE TABLE jockey_invitations (
  id              VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id   VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  horse_id        VARCHAR(64) NOT NULL REFERENCES horses (id) ON DELETE CASCADE,
  owner_user_id   VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  jockey_user_id  VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message         TEXT,
  status          VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'cancelled'
  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,
  UNIQUE (tournament_id, horse_id, jockey_user_id)
);

CREATE INDEX idx_jockey_invitations_jockey ON jockey_invitations (jockey_user_id, status);

CREATE TABLE horse_jockey_assignments (
  id              VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id   VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  horse_id        VARCHAR(64) NOT NULL REFERENCES horses (id) ON DELETE CASCADE,
  jockey_user_id  VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  invitation_id   VARCHAR(64) REFERENCES jockey_invitations (id) ON DELETE SET NULL,
  status          VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'replaced', 'cancelled'
  )),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, horse_id)
);

-- ---------------------------------------------------------------------------
-- Race scheduling and confirmations
-- ---------------------------------------------------------------------------
CREATE TABLE races (
  id                         VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id              VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  round_id                   VARCHAR(64) REFERENCES tournament_rounds (id) ON DELETE SET NULL,
  race_number                INTEGER NOT NULL CHECK (race_number > 0),
  name                       VARCHAR(255) NOT NULL,
  race_date                  DATE NOT NULL,
  start_time                 TIME NOT NULL,
  venue                      VARCHAR(255) NOT NULL,
  distance_m                 INTEGER CHECK (distance_m IS NULL OR distance_m > 0),
  surface_type               VARCHAR(64) CHECK (surface_type IS NULL OR surface_type IN (
    'turf', 'dirt', 'synthetic'
  )),
  horse_limit                INTEGER CHECK (horse_limit IS NULL OR horse_limit > 0),
  race_class                 VARCHAR(128),
  owner_confirm_deadline     TIMESTAMPTZ,
  jockey_confirm_deadline    TIMESTAMPTZ,
  prediction_open_at         TIMESTAMPTZ,
  prediction_close_at        TIMESTAMPTZ,
  status                     VARCHAR(64) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'awaiting_confirmations',
    'locked',
    'prediction_open',
    'pre_check',
    'ready',
    'live',
    'finished',
    'result_confirmed',
    'published',
    'cancelled'
  )),
  created_by                 VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, race_number)
);

CREATE INDEX idx_races_tournament_status ON races (tournament_id, status);
CREATE INDEX idx_races_date ON races (race_date, start_time);

CREATE TABLE race_entries (
  id                    VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_id                VARCHAR(64) NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  tournament_registration_id VARCHAR(64) REFERENCES tournament_registrations (id) ON DELETE SET NULL,
  horse_id               VARCHAR(64) NOT NULL REFERENCES horses (id) ON DELETE CASCADE,
  jockey_user_id         VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  lane_no                INTEGER CHECK (lane_no IS NULL OR lane_no > 0),
  owner_confirm_status   VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (owner_confirm_status IN (
    'pending', 'confirmed', 'declined'
  )),
  jockey_confirm_status  VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (jockey_confirm_status IN (
    'pending', 'confirmed', 'declined'
  )),
  owner_confirmed_at     TIMESTAMPTZ,
  jockey_confirmed_at    TIMESTAMPTZ,
  pre_check_status       VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (pre_check_status IN (
    'pending', 'qualified', 'disqualified'
  )),
  entry_status           VARCHAR(32) NOT NULL DEFAULT 'approved' CHECK (entry_status IN (
    'approved', 'locked', 'withdrawn', 'disqualified', 'finished'
  )),
  finish_position        INTEGER CHECK (finish_position IS NULL OR finish_position > 0),
  finish_time_seconds    NUMERIC(8,3),
  points                 INTEGER DEFAULT 0,
  prize_amount           NUMERIC(14,2) DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (race_id, horse_id),
  UNIQUE (race_id, lane_no)
);

CREATE INDEX idx_race_entries_race ON race_entries (race_id);
CREATE INDEX idx_race_entries_horse ON race_entries (horse_id);

CREATE TABLE referee_assignments (
  id               VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_id           VARCHAR(64) NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  referee_user_id   VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role_in_race      VARCHAR(64) NOT NULL DEFAULT 'main_referee' CHECK (role_in_race IN (
    'main_referee', 'assistant_referee', 'technical_referee'
  )),
  assigned_by       VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  assigned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (race_id, referee_user_id)
);

-- ---------------------------------------------------------------------------
-- Pre-race inspection, race tracking and violations
-- ---------------------------------------------------------------------------
CREATE TABLE pre_race_checks (
  id               VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_entry_id     VARCHAR(64) NOT NULL REFERENCES race_entries (id) ON DELETE CASCADE,
  referee_user_id   VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  horse_health      VARCHAR(32) NOT NULL CHECK (horse_health IN ('pass', 'fail')),
  horse_weight_ok   BOOLEAN NOT NULL DEFAULT TRUE,
  equipment_ok      BOOLEAN NOT NULL DEFAULT TRUE,
  jockey_license_ok BOOLEAN NOT NULL DEFAULT TRUE,
  uniform_ok        BOOLEAN NOT NULL DEFAULT TRUE,
  decision          VARCHAR(32) NOT NULL CHECK (decision IN (
    'qualified', 'disqualified'
  )),
  note              TEXT,
  checked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE live_race_events (
  id              VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_id          VARCHAR(64) NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  race_entry_id    VARCHAR(64) REFERENCES race_entries (id) ON DELETE SET NULL,
  event_type       VARCHAR(64) NOT NULL CHECK (event_type IN (
    'race_started', 'position_update', 'lap_update', 'incident', 'race_finished'
  )),
  event_second     NUMERIC(8,3),
  current_position INTEGER,
  description      TEXT,
  recorded_by      VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_live_race_events_race ON live_race_events (race_id, recorded_at);

CREATE TABLE violations (
  id               VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_id           VARCHAR(64) NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  race_entry_id     VARCHAR(64) REFERENCES race_entries (id) ON DELETE SET NULL,
  referee_user_id   VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  violation_type    VARCHAR(64) NOT NULL CHECK (violation_type IN (
    'false_start', 'blocking', 'collision', 'equipment_issue', 'unsafe_riding', 'other'
  )),
  severity          VARCHAR(32) NOT NULL DEFAULT 'minor' CHECK (severity IN (
    'minor', 'major', 'critical'
  )),
  penalty           VARCHAR(128),
  description       TEXT NOT NULL,
  status            VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'resolved', 'dismissed'
  )),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Results, rankings, prediction/bet and prizes
-- ---------------------------------------------------------------------------
CREATE TABLE race_results (
  id                 VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_id             VARCHAR(64) NOT NULL UNIQUE REFERENCES races (id) ON DELETE CASCADE,
  status              VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'referee_confirmed', 'admin_published', 'cancelled'
  )),
  confirmed_by        VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  confirmed_at        TIMESTAMPTZ,
  published_by        VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  published_at        TIMESTAMPTZ,
  official_note       TEXT
);

CREATE TABLE race_result_details (
  id                    VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  race_result_id         VARCHAR(64) NOT NULL REFERENCES race_results (id) ON DELETE CASCADE,
  race_entry_id          VARCHAR(64) NOT NULL REFERENCES race_entries (id) ON DELETE CASCADE,
  finish_position        INTEGER NOT NULL CHECK (finish_position > 0),
  finish_time_seconds    NUMERIC(8,3),
  points_awarded         INTEGER NOT NULL DEFAULT 0,
  prize_amount           NUMERIC(14,2) NOT NULL DEFAULT 0,
  note                   TEXT,
  UNIQUE (race_result_id, finish_position),
  UNIQUE (race_result_id, race_entry_id)
);

CREATE TABLE bets (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  spectator_user_id    VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  race_id              VARCHAR(64) NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  bet_type             VARCHAR(64) NOT NULL DEFAULT 'top3_prediction' CHECK (bet_type IN (
    'winner_prediction', 'top3_prediction'
  )),
  stake_points         INTEGER NOT NULL DEFAULT 0 CHECK (stake_points >= 0),
  status               VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'draft', 'submitted', 'locked', 'won', 'lost', 'cancelled'
  )),
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at            TIMESTAMPTZ,
  UNIQUE (spectator_user_id, race_id, bet_type)
);

CREATE TABLE bet_selections (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  bet_id               VARCHAR(64) NOT NULL REFERENCES bets (id) ON DELETE CASCADE,
  predicted_position   INTEGER NOT NULL CHECK (predicted_position > 0),
  horse_id             VARCHAR(64) NOT NULL REFERENCES horses (id) ON DELETE CASCADE,
  UNIQUE (bet_id, predicted_position),
  UNIQUE (bet_id, horse_id)
);

CREATE TABLE prediction_rewards (
  id                  VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  bet_id               VARCHAR(64) NOT NULL UNIQUE REFERENCES bets (id) ON DELETE CASCADE,
  race_result_id        VARCHAR(64) NOT NULL REFERENCES race_results (id) ON DELETE CASCADE,
  correct_winner        BOOLEAN NOT NULL DEFAULT FALSE,
  correct_top3_count    INTEGER NOT NULL DEFAULT 0 CHECK (correct_top3_count >= 0),
  reward_points         INTEGER NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  reward_amount         NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (reward_amount >= 0),
  calculated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at               TIMESTAMPTZ
);

CREATE TABLE ranking_snapshots (
  id               VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id     VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  ranking_type      VARCHAR(32) NOT NULL CHECK (ranking_type IN (
    'horse', 'jockey', 'owner'
  )),
  entity_id         VARCHAR(64) NOT NULL,
  rank_no           INTEGER NOT NULL CHECK (rank_no > 0),
  total_points      INTEGER NOT NULL DEFAULT 0,
  total_races       INTEGER NOT NULL DEFAULT 0,
  total_wins        INTEGER NOT NULL DEFAULT 0,
  prize_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
  snapshot_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, ranking_type, entity_id, snapshot_at)
);

CREATE TABLE prize_distributions (
  id               VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id     VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  recipient_user_id VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  horse_id          VARCHAR(64) REFERENCES horses (id) ON DELETE SET NULL,
  prize_type        VARCHAR(64) NOT NULL CHECK (prize_type IN (
    'race_prize', 'champion_prize', 'prediction_reward', 'special_award'
  )),
  title             VARCHAR(255) NOT NULL,
  amount            NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status            VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'paid', 'cancelled'
  )),
  paid_at           TIMESTAMPTZ
);

CREATE TABLE awards (
  id                VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id      VARCHAR(64) NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
  award_name         VARCHAR(255) NOT NULL,
  award_type         VARCHAR(64) NOT NULL CHECK (award_type IN (
    'champion_horse', 'best_jockey', 'best_owner', 'fair_play', 'prediction_winner'
  )),
  recipient_user_id  VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  horse_id           VARCHAR(64) REFERENCES horses (id) ON DELETE SET NULL,
  description        TEXT,
  announced_at       TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- Reports, notifications and audit
-- ---------------------------------------------------------------------------
CREATE TABLE reports (
  id              VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tournament_id   VARCHAR(64) REFERENCES tournaments (id) ON DELETE CASCADE,
  race_id         VARCHAR(64) REFERENCES races (id) ON DELETE CASCADE,
  report_type     VARCHAR(64) NOT NULL CHECK (report_type IN (
    'referee_report', 'tournament_summary', 'violation_summary', 'financial_report'
  )),
  title           VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  created_by      VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id          VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

CREATE TABLE sessions (
  token       VARCHAR(128) PRIMARY KEY,
  user_id     VARCHAR(64) NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id           VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  actor_id     VARCHAR(64) REFERENCES users (id) ON DELETE SET NULL,
  action       VARCHAR(128) NOT NULL,
  entity_type  VARCHAR(64) NOT NULL,
  entity_id    VARCHAR(64),
  old_value    JSONB,
  new_value    JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Reporting views for demo and SQL questions
-- ---------------------------------------------------------------------------
CREATE VIEW v_tournament_flow_status AS
SELECT
  t.id AS tournament_id,
  t.name AS tournament_name,
  t.status AS tournament_status,
  COUNT(DISTINCT tr.id) AS horse_registrations,
  COUNT(DISTINCT CASE WHEN tr.status = 'approved' THEN tr.id END) AS approved_horses,
  COUNT(DISTINCT r.id) AS total_races,
  COUNT(DISTINCT CASE WHEN r.status IN ('published', 'finished', 'result_confirmed') THEN r.id END) AS races_completed,
  COUNT(DISTINCT b.id) AS total_predictions
FROM tournaments t
LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
LEFT JOIN races r ON r.tournament_id = t.id
LEFT JOIN bets b ON b.race_id = r.id
GROUP BY t.id, t.name, t.status;

CREATE VIEW v_race_entry_roster AS
SELECT
  r.id AS race_id,
  r.name AS race_name,
  r.race_date,
  r.start_time,
  re.lane_no,
  h.name AS horse_name,
  owner.full_name AS owner_name,
  jockey.full_name AS jockey_name,
  re.owner_confirm_status,
  re.jockey_confirm_status,
  re.pre_check_status,
  re.entry_status
FROM race_entries re
JOIN races r ON r.id = re.race_id
JOIN horses h ON h.id = re.horse_id
JOIN users owner ON owner.id = h.owner_user_id
JOIN users jockey ON jockey.id = re.jockey_user_id;

CREATE VIEW v_horse_ranking AS
SELECT
  t.id AS tournament_id,
  t.name AS tournament_name,
  h.id AS horse_id,
  h.name AS horse_name,
  owner.full_name AS owner_name,
  COALESCE(SUM(rrd.points_awarded), 0) AS total_points,
  COUNT(rrd.id) AS total_races,
  COUNT(CASE WHEN rrd.finish_position = 1 THEN 1 END) AS total_wins,
  COALESCE(SUM(rrd.prize_amount), 0) AS total_prize
FROM tournaments t
JOIN races r ON r.tournament_id = t.id
JOIN race_entries re ON re.race_id = r.id
JOIN horses h ON h.id = re.horse_id
JOIN users owner ON owner.id = h.owner_user_id
LEFT JOIN race_results rr ON rr.race_id = r.id AND rr.status = 'admin_published'
LEFT JOIN race_result_details rrd ON rrd.race_result_id = rr.id AND rrd.race_entry_id = re.id
GROUP BY t.id, t.name, h.id, h.name, owner.full_name;

CREATE VIEW v_prediction_scoreboard AS
SELECT
  b.id AS bet_id,
  spectator.full_name AS spectator_name,
  r.name AS race_name,
  b.bet_type,
  b.status AS bet_status,
  COALESCE(pr.correct_winner, FALSE) AS correct_winner,
  COALESCE(pr.correct_top3_count, 0) AS correct_top3_count,
  COALESCE(pr.reward_points, 0) AS reward_points,
  COALESCE(pr.reward_amount, 0) AS reward_amount
FROM bets b
JOIN users spectator ON spectator.id = b.spectator_user_id
JOIN races r ON r.id = b.race_id
LEFT JOIN prediction_rewards pr ON pr.bet_id = b.id;

COMMIT;

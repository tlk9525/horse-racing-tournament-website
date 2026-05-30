#!/usr/bin/env node
/**
 * Xuất data/db.json → database/seed.sql
 * Chạy: node scripts/export-db-to-sql.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dbPath = join(root, 'data', 'db.json');
const outPath = join(root, 'database', 'seed.sql');

const sqlValue = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
};

const insertRows = (table, columns, rows) => {
  if (!rows?.length) return '';

  const lines = rows.map((row) => {
    const values = columns.map((col) => sqlValue(row[col]));
    return `  (${values.join(', ')})`;
  });

  return [
    `-- ${table}`,
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES`,
    `${lines.join(',\n')}`,
    'ON CONFLICT DO NOTHING;',
    '',
  ].join('\n');
};

const mapUsers = (users) =>
  users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
    status: u.status,
  }));

const mapTournaments = (items) =>
  items.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    registration_window: t.registrationWindow,
    start_date: t.startDate,
    final_date: t.finalDate,
    location: t.location,
    prize_pool: t.prizePool ?? 0,
  }));

const mapHorses = (items) =>
  items.map((h) => ({
    id: h.id,
    name: h.name,
    breed: h.breed,
    age: h.age,
    owner_user_id: h.ownerUserId,
    status: h.status,
    selected_jockey_user_id: h.selectedJockeyUserId ?? null,
    jockey_confirmation: h.jockeyConfirmation,
  }));

const mapJockeyProfiles = (items) =>
  items.map((p) => ({
    id: p.id,
    user_id: p.userId,
    bio: p.bio ?? '',
    certificate: p.certificate ?? '',
    competition_level: p.competitionLevel ?? '',
    weight: p.weight ?? null,
    status: p.status,
    updated_at: p.updatedAt ?? null,
  }));

const mapRaces = (items) =>
  items.map((r) => ({
    id: r.id,
    tournament_id: r.tournamentId,
    name: r.name,
    race_date: r.date,
    race_time: r.time,
    venue: r.venue,
    distance: r.distance,
    surface: r.surface,
    referee_user_id: r.refereeUserId ?? null,
    status: r.status,
  }));

const mapInvitations = (items) =>
  (items || []).map((i) => ({
    id: i.id,
    horse_id: i.horseId,
    owner_user_id: i.ownerUserId,
    jockey_user_id: i.jockeyUserId,
    tournament_id: i.tournamentId ?? null,
    race_id: i.raceId ?? null,
    status: i.status,
    admin_status: i.adminStatus ?? null,
    created_at: i.createdAt,
    responded_at: i.respondedAt ?? null,
  }));

const mapRaceEntries = (items) =>
  (items || []).map((e) => ({
    id: e.id,
    race_id: e.raceId,
    horse_id: e.horseId,
    jockey_user_id: e.jockeyUserId,
    invitation_id: e.invitationId ?? null,
    status: e.status,
    created_at: e.createdAt,
  }));

const mapNotifications = (items) =>
  (items || []).map((n) => ({
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    is_read: n.read,
    created_at: n.createdAt,
  }));

const mapSessions = (items) =>
  (items || []).map((s) => ({
    token: s.token,
    user_id: s.userId,
    created_at: s.createdAt,
  }));

const db = JSON.parse(await readFile(dbPath, 'utf8'));

const sql = [
  '-- Auto-generated from data/db.json',
  `-- Generated: ${new Date().toISOString()}`,
  '-- Chạy sau schema.sql: psql -d horse_racing -f database/seed.sql',
  '',
  'BEGIN;',
  '',
  insertRows(
    'users',
    ['id', 'name', 'email', 'password', 'role', 'status'],
    mapUsers(db.users)
  ),
  insertRows(
    'tournaments',
    [
      'id',
      'name',
      'status',
      'registration_window',
      'start_date',
      'final_date',
      'location',
      'prize_pool',
    ],
    mapTournaments(db.tournaments)
  ),
  insertRows(
    'horses',
    [
      'id',
      'name',
      'breed',
      'age',
      'owner_user_id',
      'status',
      'selected_jockey_user_id',
      'jockey_confirmation',
    ],
    mapHorses(db.horses)
  ),
  insertRows(
    'jockey_profiles',
    [
      'id',
      'user_id',
      'bio',
      'certificate',
      'competition_level',
      'weight',
      'status',
      'updated_at',
    ],
    mapJockeyProfiles(db.jockeyProfiles || [])
  ),
  insertRows(
    'races',
    [
      'id',
      'tournament_id',
      'name',
      'race_date',
      'race_time',
      'venue',
      'distance',
      'surface',
      'referee_user_id',
      'status',
    ],
    mapRaces(db.races)
  ),
  insertRows(
    'jockey_invitations',
    [
      'id',
      'horse_id',
      'owner_user_id',
      'jockey_user_id',
      'tournament_id',
      'race_id',
      'status',
      'admin_status',
      'created_at',
      'responded_at',
    ],
    mapInvitations(db.jockeyInvitations)
  ),
  insertRows(
    'race_entries',
    [
      'id',
      'race_id',
      'horse_id',
      'jockey_user_id',
      'invitation_id',
      'status',
      'created_at',
    ],
    mapRaceEntries(db.raceEntries)
  ),
  insertRows(
    'notifications',
    ['id', 'user_id', 'title', 'message', 'is_read', 'created_at'],
    mapNotifications(db.notifications)
  ),
  insertRows(
    'sessions',
    ['token', 'user_id', 'created_at'],
    mapSessions(db.sessions)
  ),
  'COMMIT;',
  '',
].join('\n');

await writeFile(outPath, sql, 'utf8');
console.log(`Wrote ${outPath}`);

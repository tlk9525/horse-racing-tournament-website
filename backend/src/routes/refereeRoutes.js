import { Hono } from 'hono';
import { randomUUID } from 'node:crypto';
import { requireRole } from '../services/authService.js';
import {
  canRefereeRace,
  findEntry,
  publicRaceEntries,
} from '../services/domainService.js';
import { broadcastRaceUpdate } from '../services/liveRaceEvents.js';
import { notifyAdmins } from '../services/notificationService.js';

export const createRefereeRoutes = (getDb, writeDb) => {
  const app = new Hono();

  // Middleware xác thực — chỉ cho phép referee hoặc admin
  app.use('*', async (c, next) => {
    const db = await getDb();
    const user = await requireRole(c.req.raw, db, ['admin', 'referee']);
    if (!user) return c.json({ message: 'Referee access required' }, 403);
    c.set('user', user);
    c.set('db', db);
    await next();
  });

  // Bắt đầu hoặc nộp kết quả cuộc đua
  app.post('/races/:raceId/:action', async (c) => {
    const user = c.get('user');
    const db = c.get('db');
    const raceId = c.req.param('raceId');
    const action = c.req.param('action');

    if (!['start', 'submit-results'].includes(action)) {
      return c.json({ message: 'Invalid action' }, 400);
    }

    const race = db.races.find((item) => item.id === raceId);
    if (!race || !canRefereeRace(race, user, db)) {
      return c.json({ message: 'Assigned race not found' }, 404);
    }

    if (action === 'start') {
      if (race.status !== 'published') {
        return c.json({ message: 'Race must be published before it can start' }, 400);
      }

      const raceEntries = (db.raceEntries || []).filter(
        (entry) => entry.raceId === race.id && entry.status === 'approved'
      );
      const readyEntries = raceEntries.filter(
        (entry) => entry.preRaceStatus === 'ready' && !entry.disqualified
      );
      const uncheckedEntries = raceEntries.filter(
        (entry) => !['ready', 'absent'].includes(entry.preRaceStatus) && !entry.disqualified
      );

      if (readyEntries.length === 0) {
        return c.json({ message: 'Mark at least one participant Ready before starting the race' }, 400);
      }
      if (uncheckedEntries.length > 0) {
        return c.json({ message: 'Check every participant as Ready or Absent before starting the race' }, 400);
      }

      race.status = 'in-progress';
      race.updatedAt = new Date().toISOString();
      raceEntries.forEach((entry) => { if (entry.preRaceStatus === 'absent') entry.disqualified = true; });
      notifyAdmins(db, 'Race started', `${race.name} has been started by ${user.name}.`);
    }

    if (action === 'submit-results') {
      if (race.status !== 'in-progress') {
        return c.json({ message: 'Race must be in progress before results are submitted' }, 400);
      }

      const raceEntries = (db.raceEntries || []).filter(
        (entry) => entry.raceId === race.id && entry.status === 'approved'
      );
      const competingEntries = raceEntries.filter(
        (entry) => entry.preRaceStatus !== 'absent' && !entry.disqualified
      );
      const entriesMissingResult = competingEntries.filter(
        (entry) => !entry.position || !entry.finishTime
      );
      const positions = competingEntries.map((entry) => Number(entry.position)).filter(Number.isInteger);
      const uniquePositions = new Set(positions);

      if (entriesMissingResult.length > 0) {
        return c.json({ message: 'Record a finishing position and finish time for every competing participant before submitting results' }, 400);
      }
      if (uniquePositions.size !== positions.length) {
        return c.json({ message: 'Each competing participant must have a unique finishing position' }, 400);
      }

      race.resultStatus = 'submitted';
      race.updatedAt = new Date().toISOString();
      notifyAdmins(db, 'Race results submitted', `${race.name} results are ready for Admin confirmation.`);
    }

    await writeDb(db);
    broadcastRaceUpdate(race.id);
    return c.json({ race });
  });

  // Đánh dấu một thí sinh là sẵn sàng thi đấu hoặc vắng mặt
  app.post('/race-entries/:entryId/:readiness', async (c) => {
    const user = c.get('user');
    const db = c.get('db');
    const entryId = c.req.param('entryId');
    const readiness = c.req.param('readiness');

    if (!['ready', 'absent'].includes(readiness)) {
      return c.json({ message: 'Invalid readiness status' }, 400);
    }

    const entry = findEntry(db, entryId);
    const race = db.races.find((item) => item.id === entry?.raceId);

    if (!entry || !race || !canRefereeRace(race, user, db)) {
      return c.json({ message: 'Race entry not found' }, 404);
    }

    entry.preRaceStatus = readiness === 'ready' ? 'ready' : 'absent';
    entry.disqualified = readiness === 'absent';

    await writeDb(db);
    broadcastRaceUpdate(race.id);
    return c.json({
      entry,
      entries: publicRaceEntries(db).filter((item) => item.raceId === race.id),
    });
  });

  // Ghi kết quả cho một thí sinh: vị trí, thời gian vào đích, ghi chú và vi phạm
  app.post('/race-entries/:entryId/result', async (c) => {
    const user = c.get('user');
    const db = c.get('db');
    const entryId = c.req.param('entryId');

    const entry = findEntry(db, entryId);
    const race = db.races.find((item) => item.id === entry?.raceId);

    if (!entry || !race || !canRefereeRace(race, user, db)) {
      return c.json({ message: 'Race entry not found' }, 404);
    }
    if (entry.preRaceStatus === 'absent' || entry.disqualified) {
      return c.json({ message: 'Absent participants cannot compete' }, 400);
    }

    const { position, finishTime, notes, violationNotes } = await c.req.json();
    const numericPosition = Number(position);
    const raceEntries = (db.raceEntries || []).filter(
      (item) => item.raceId === race.id && item.status === 'approved'
    );
    const competingEntries = raceEntries.filter(
      (item) => item.preRaceStatus !== 'absent' && !item.disqualified
    );
    const duplicatePosition = competingEntries.some(
      (item) => item.id !== entry.id && Number(item.position) === numericPosition
    );

    if (!Number.isInteger(numericPosition) || numericPosition < 1 || numericPosition > competingEntries.length) {
      return c.json({ message: `Position must be between 1 and ${competingEntries.length}` }, 400);
    }
    if (duplicatePosition) {
      return c.json({ message: `Position ${numericPosition} is already recorded for another participant` }, 400);
    }
    if (!finishTime) {
      return c.json({ message: 'Finish time is required before recording a result' }, 400);
    }

    entry.position = numericPosition;
    entry.finishTime = finishTime || '';
    entry.notes = notes || '';
    entry.violationNotes = violationNotes || '';
    entry.resultStatus = 'draft';

    if (String(violationNotes || '').trim()) {
      db.refereeReports = db.refereeReports || [];
      const existingReport = db.refereeReports.find(
        (report) => report.raceEntryId === entry.id && report.refereeUserId === user.id && report.reportType === 'violation'
      );
      if (existingReport) {
        existingReport.description = violationNotes;
        existingReport.violation = violationNotes;
        existingReport.status = 'submitted';
      } else {
        db.refereeReports.unshift({
          id: randomUUID(),
          raceId: race.id,
          raceEntryId: entry.id,
          refereeUserId: user.id,
          reportType: 'violation',
          description: violationNotes,
          violation: violationNotes,
          status: 'submitted',
          createdAt: new Date().toISOString(),
          reviewedAt: null,
        });
      }
    }

    await writeDb(db);
    broadcastRaceUpdate(race.id);
    return c.json({
      entry,
      entries: publicRaceEntries(db).filter((item) => item.raceId === race.id),
    });
  });

  return app;
};

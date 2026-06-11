import { randomUUID } from 'node:crypto';
import { requireRole } from '../services/authService.js';
import {
  canRefereeRace,
  findEntry,
  publicRaceEntries,
} from '../services/domainService.js';
import { broadcastRaceUpdate } from '../services/liveRaceEvents.js';
import { notifyAdmins } from '../services/notificationService.js';

export const handleRefereeRoutes = async ({
  req,
  res,
  url,
  db,
  send,
  readBody,
  writeDb,
}) => {
  const refereeRaceActionMatch = url.pathname.match(
    /^\/api\/referee\/races\/([^/]+)\/(start|submit-results)$/
  );

  if (req.method === 'POST' && refereeRaceActionMatch) {
    const user = await requireRole(req, db, ['admin', 'referee']);

    if (!user) {
      send(res, 403, { message: 'Referee access required' });
      return true;
    }

    const [, raceId, action] = refereeRaceActionMatch;
    const race = db.races.find((item) => item.id === raceId);

    if (!race || !canRefereeRace(race, user, db)) {
      send(res, 404, { message: 'Assigned race not found' });
      return true;
    }

    if (action === 'start') {
      if (race.status !== 'published') {
        send(res, 400, { message: 'Race must be published before it can start' });
        return true;
      }

      const raceEntries = (db.raceEntries || []).filter(
        (entry) => entry.raceId === race.id && entry.status === 'approved'
      );
      const readyEntries = raceEntries.filter(
        (entry) => entry.preRaceStatus === 'ready' && !entry.disqualified
      );
      const uncheckedEntries = raceEntries.filter(
        (entry) =>
          !['ready', 'absent'].includes(entry.preRaceStatus) &&
          !entry.disqualified
      );

      if (readyEntries.length === 0) {
        send(res, 400, { message: 'Mark at least one participant Ready before starting the race' });
        return true;
      }

      if (uncheckedEntries.length > 0) {
        send(res, 400, { message: 'Check every participant as Ready or Absent before starting the race' });
        return true;
      }

      race.status = 'in-progress';
      race.updatedAt = new Date().toISOString();

      raceEntries.forEach((entry) => {
        if (entry.preRaceStatus === 'absent') {
          entry.disqualified = true;
        }
      });

      notifyAdmins(
        db,
        'Race started',
        `${race.name} has been started by ${user.name}.`
      );
    }

    if (action === 'submit-results') {
      if (race.status !== 'in-progress') {
        send(res, 400, { message: 'Race must be in progress before results are submitted' });
        return true;
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
      const positions = competingEntries
        .map((entry) => Number(entry.position))
        .filter((position) => Number.isInteger(position));
      const uniquePositions = new Set(positions);

      if (entriesMissingResult.length > 0) {
        send(res, 400, {
          message: 'Record a finishing position and finish time for every competing participant before submitting results',
        });
        return true;
      }

      if (uniquePositions.size !== positions.length) {
        send(res, 400, {
          message: 'Each competing participant must have a unique finishing position',
        });
        return true;
      }

      race.resultStatus = 'submitted';
      race.updatedAt = new Date().toISOString();
      notifyAdmins(
        db,
        'Race results submitted',
        `${race.name} results are ready for Admin confirmation.`
      );
    }

    await writeDb(db);
    broadcastRaceUpdate(race.id);
    send(res, 200, { race });
    return true;
  }

  const refereeEntryReadinessMatch = url.pathname.match(
    /^\/api\/referee\/race-entries\/([^/]+)\/(ready|absent)$/
  );

  if (req.method === 'POST' && refereeEntryReadinessMatch) {
    const user = await requireRole(req, db, ['admin', 'referee']);

    if (!user) {
      send(res, 403, { message: 'Referee access required' });
      return true;
    }

    const [, entryId, readiness] = refereeEntryReadinessMatch;
    const entry = findEntry(db, entryId);
    const race = db.races.find((item) => item.id === entry?.raceId);

    if (!entry || !race || !canRefereeRace(race, user, db)) {
      send(res, 404, { message: 'Race entry not found' });
      return true;
    }

    entry.preRaceStatus = readiness === 'ready' ? 'ready' : 'absent';
    entry.disqualified = readiness === 'absent';

    await writeDb(db);
    broadcastRaceUpdate(race.id);
    send(res, 200, {
      entry,
      entries: publicRaceEntries(db).filter((item) => item.raceId === race.id),
    });
    return true;
  }

  const refereeEntryResultMatch = url.pathname.match(
    /^\/api\/referee\/race-entries\/([^/]+)\/result$/
  );

  if (req.method === 'POST' && refereeEntryResultMatch) {
    const user = await requireRole(req, db, ['admin', 'referee']);

    if (!user) {
      send(res, 403, { message: 'Referee access required' });
      return true;
    }

    const entry = findEntry(db, refereeEntryResultMatch[1]);
    const race = db.races.find((item) => item.id === entry?.raceId);

    if (!entry || !race || !canRefereeRace(race, user, db)) {
      send(res, 404, { message: 'Race entry not found' });
      return true;
    }

    if (entry.preRaceStatus === 'absent' || entry.disqualified) {
      send(res, 400, { message: 'Absent participants cannot compete' });
      return true;
    }

    const { position, finishTime, notes, violationNotes } = await readBody(req);
    const numericPosition = Number(position);
    const raceEntries = (db.raceEntries || []).filter(
      (item) => item.raceId === race.id && item.status === 'approved'
    );
    const competingEntries = raceEntries.filter(
      (item) => item.preRaceStatus !== 'absent' && !item.disqualified
    );
    const duplicatePosition = competingEntries.some(
      (item) =>
        item.id !== entry.id &&
        Number(item.position) === numericPosition
    );

    if (
      !Number.isInteger(numericPosition) ||
      numericPosition < 1 ||
      numericPosition > competingEntries.length
    ) {
      send(res, 400, {
        message: `Position must be between 1 and ${competingEntries.length}`,
      });
      return true;
    }

    if (duplicatePosition) {
      send(res, 400, {
        message: `Position ${numericPosition} is already recorded for another participant`,
      });
      return true;
    }

    if (!finishTime) {
      send(res, 400, { message: 'Finish time is required before recording a result' });
      return true;
    }

    entry.position = numericPosition;
    entry.finishTime = finishTime || '';
    entry.notes = notes || '';
    entry.violationNotes = violationNotes || '';
    entry.resultStatus = 'draft';

    if (String(violationNotes || '').trim()) {
      db.refereeReports = db.refereeReports || [];

      const existingReport = db.refereeReports.find(
        (report) =>
          report.raceEntryId === entry.id &&
          report.refereeUserId === user.id &&
          report.reportType === 'violation'
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
    send(res, 200, {
      entry,
      entries: publicRaceEntries(db).filter((item) => item.raceId === race.id),
    });
    return true;
  }

  return false;
};

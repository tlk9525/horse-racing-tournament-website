import { requireRole } from '../services/authService.js';
import {
  canRefereeRace,
  findEntry,
  publicRaceEntries,
} from '../services/domainService.js';
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

    if (!race || !canRefereeRace(race, user)) {
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

      race.resultStatus = 'submitted';
      notifyAdmins(
        db,
        'Race results submitted',
        `${race.name} results are ready for Admin confirmation.`
      );
    }

    await writeDb(db);
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

    if (!entry || !race || !canRefereeRace(race, user)) {
      send(res, 404, { message: 'Race entry not found' });
      return true;
    }

    entry.preRaceStatus = readiness === 'ready' ? 'ready' : 'absent';
    entry.disqualified = readiness === 'absent';

    await writeDb(db);
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

    if (!entry || !race || !canRefereeRace(race, user)) {
      send(res, 404, { message: 'Race entry not found' });
      return true;
    }

    if (entry.preRaceStatus === 'absent' || entry.disqualified) {
      send(res, 400, { message: 'Absent participants cannot compete' });
      return true;
    }

    const { position, finishTime, notes, violationNotes } = await readBody(req);

    entry.position = Number(position) || null;
    entry.finishTime = finishTime || '';
    entry.notes = notes || '';
    entry.violationNotes = violationNotes || '';
    entry.resultStatus = 'draft';

    await writeDb(db);
    send(res, 200, {
      entry,
      entries: publicRaceEntries(db).filter((item) => item.raceId === race.id),
    });
    return true;
  }

  return false;
};

import { randomUUID } from 'node:crypto';

export const recordRaceAction = (
  db,
  { raceId, userId, action, fromStatus, toStatus, details = '' }
) => {
  db.raceActionLogs = db.raceActionLogs || [];
  db.raceActionLogs.unshift({
    id: randomUUID(),
    raceId,
    userId,
    action,
    fromStatus: fromStatus || '',
    toStatus: toStatus || '',
    details,
    createdAt: new Date().toISOString(),
  });
};

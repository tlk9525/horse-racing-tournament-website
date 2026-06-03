import { randomUUID } from 'node:crypto';
import { MAX_RACE_FIELD_SIZE } from '../config/constants.js';
import { requireRole } from '../services/authService.js';
import {
  approvedRaceEntries,
  formatApprovals,
  jockeyName,
  publicRaceEntries,
  raceName,
} from '../services/domainService.js';
import { computeRaceHandicap } from '../services/handicapService.js';
import {
  createNotification,
  notifyAdmins,
} from '../services/notificationService.js';

export const handleAdminRoutes = async ({
  req,
  res,
  url,
  db,
  send,
  readBody,
  writeDb,
}) => {
  if (req.method === 'GET' && url.pathname === '/api/admin/approvals') {
    const user = await requireRole(req, db, ['admin']);

    if (!user) {
      send(res, 403, { message: 'Admin access required' });
      return true;
    }

    send(res, 200, { approvals: formatApprovals(db) });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/tournaments') {
    const user = await requireRole(req, db, ['admin']);

    if (!user) {
      send(res, 403, { message: 'Admin access required' });
      return true;
    }

    const {
      name,
      registrationWindow,
      startDate,
      finalDate,
      location,
      prizePool,
    } = await readBody(req);

    if (!name || !startDate || !location) {
      send(res, 400, {
        message: 'Tournament name, start date and location are required',
      });
      return true;
    }

    const tournament = {
      id: randomUUID(),
      name,
      status: 'registration',
      registrationWindow: registrationWindow || 'Open Registration',
      startDate,
      finalDate: finalDate || '',
      location,
      prizePool: Number(prizePool) || 0,
    };

    db.tournaments.unshift(tournament);

    notifyAdmins(
      db,
      'Tournament registration opened',
      `${tournament.name} has been created and opened for Owner/Jockey registration.`
    );

    await writeDb(db);
    send(res, 201, {
      tournament,
      tournaments: db.tournaments,
      notifications: db.notifications || [],
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/race-builder') {
    const user = await requireRole(req, db, ['admin']);

    if (!user) {
      send(res, 403, { message: 'Admin access required' });
      return true;
    }

    const referees = db.users
      .filter((item) => item.role === 'referee' && item.status === 'active')
      .map((item) => ({
        id: item.id,
        name: item.name,
      }));

    send(res, 200, {
      tournaments: db.tournaments,
      races: db.races || [],
      referees,
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/races') {
    const user = await requireRole(req, db, ['admin']);

    if (!user) {
      send(res, 403, { message: 'Admin access required' });
      return true;
    }

    const {
      tournamentId,
      raceNumber,
      name,
      round,
      date,
      time,
      venue,
      distance,
      surface,
      raceClass,
      handicapMin,
      handicapMax,
      totalPrize,
      refereeUserId,
      refereeUserIds,
      registrationPeriodMinutes,
      registrationOpenTime,
      registrationCloseTime,
    } = await readBody(req);

    if (!name || !date || !time || !venue || !distance || !refereeUserId) {
      send(res, 400, {
        message: 'Race name, date, time, venue, distance and referee are required',
      });
      return true;
    }

    const selectedRefereeIds = Array.from(
      new Set([refereeUserId, ...(Array.isArray(refereeUserIds) ? refereeUserIds : [])].filter(Boolean))
    );
    const selectedReferees = selectedRefereeIds
      .map((id) =>
        db.users.find(
          (item) =>
            item.id === id &&
            item.role === 'referee' &&
            item.status === 'active'
        )
      )
      .filter(Boolean);
    const referee = selectedReferees[0];

    if (selectedReferees.length !== selectedRefereeIds.length || !referee) {
      send(res, 400, { message: 'Assigned referee must be active' });
      return true;
    }

    if (!tournamentId) {
      send(res, 400, { message: 'Create and select a tournament before creating races' });
      return true;
    }

    const tournament = db.tournaments.find(
      (item) =>
        item.id === tournamentId &&
        ['registration', 'approvals', 'active'].includes(item.status)
    );

    if (!tournament) {
      send(res, 400, { message: 'Selected tournament must exist and be open before creating races' });
      return true;
    }

    const now = new Date();
    const minutes = Math.max(1, Number(registrationPeriodMinutes) || 10);
    const registrationOpensAt = registrationOpenTime || now.toISOString();
    const registrationClosesAt =
      registrationCloseTime ||
      new Date(now.getTime() + minutes * 60 * 1000).toISOString();

    const race = {
      id: randomUUID(),
      tournamentId: tournament.id,
      raceNumber: raceNumber || '',
      name,
      round: round || 'Qualifier',
      date,
      time,
      venue,
      distance: `${distance}m`,
      surface: surface || 'Turf',
      raceClass: raceClass || '',
      handicapMin: Number(handicapMin) || 0,
      handicapMax: Number(handicapMax) || 0,
      totalPrize: Number(totalPrize) || 0,
      refereeUserId: referee.id,
      refereeUserIds: selectedRefereeIds.join(','),
      referee: selectedReferees.map((item) => item.name).join(', '),
      status: 'registration-open',
      participants: 0,
      ownerConfirmed: 0,
      jockeyConfirmed: 0,
      registrationPeriodMinutes: minutes,
      registrationOpensAt,
      registrationClosesAt,
      resultStatus: 'draft',
      awardsPublished: false,
      createdBy: user.id,
      createdAt: now.toISOString(),
    };

    db.races.unshift(race);

    selectedReferees.forEach((item) =>
      createNotification(
        db,
        item.id,
        'Race assigned',
        `${race.name} has been created. Registration closes at ${race.registrationClosesAt}.`
      )
    );

    await writeDb(db);
    send(res, 201, {
      race,
      entries: [],
      notifications: db.notifications || [],
    });
    return true;
  }

  const adminRaceActionMatch = url.pathname.match(
    /^\/api\/admin\/races\/([^/]+)\/(close-registration|publish|confirm-results|reject-results|complete)$/
  );

  if (req.method === 'POST' && adminRaceActionMatch) {
    const user = await requireRole(req, db, ['admin']);

    if (!user) {
      send(res, 403, { message: 'Admin access required' });
      return true;
    }

    const [, raceId, action] = adminRaceActionMatch;
    const race = db.races.find((item) => item.id === raceId);

    if (!race) {
      send(res, 404, { message: 'Race not found' });
      return true;
    }

    const entries = (db.raceEntries || []).filter(
      (entry) => entry.raceId === race.id && entry.status === 'approved'
    );

    if (action === 'close-registration') {
      if (entries.length > MAX_RACE_FIELD_SIZE) {
        send(res, 400, {
          message: `A race can have at most ${MAX_RACE_FIELD_SIZE} horses and ${MAX_RACE_FIELD_SIZE} jockeys on the track.`,
        });
        return true;
      }

      race.status = 'registration-closed';
      race.participants = entries.length;
      race.ownerConfirmed = entries.length;
      race.jockeyConfirmed = entries.length;

      const sortedEntries = [...entries].sort((a, b) => {
        const horseA = db.horses.find((horse) => horse.id === a.horseId);
        const horseB = db.horses.find((horse) => horse.id === b.horseId);
        return String(horseA?.breed || '').localeCompare(String(horseB?.breed || ''));
      });

      sortedEntries.forEach((entry, index) => {
        const horse = db.horses.find((item) => item.id === entry.horseId);
        const profile = (db.jockeyProfiles || []).find(
          (item) => item.userId === entry.jockeyUserId
        );
        const prepared = computeRaceHandicap(horse, profile, race);

        entry.lane = index + 1;
        entry.ratingSnapshot = prepared.rating;
        entry.handicap = prepared.handicap;
        entry.preRaceStatus = 'ready-for-referee';
      });

      String(race.refereeUserIds || race.refereeUserId || '')
        .split(',')
        .filter(Boolean)
        .forEach((refereeId) =>
          createNotification(
            db,
            refereeId,
            'Race registration closed',
            `${race.name} is ready for referee review. Starting gates, rating snapshots and handicap have been assigned.`
          )
        );
    }

    if (action === 'publish') {
      if (!['registration-closed', 'published'].includes(race.status)) {
        send(res, 400, { message: 'Close registration before publishing the race' });
        return true;
      }

      race.status = 'published';
      entries.forEach((entry) => {
        const horse = db.horses.find((item) => item.id === entry.horseId);
        createNotification(
          db,
          horse?.ownerUserId,
          'Race published',
          `${race.name} has been published. Gate ${entry.lane}, rating ${entry.ratingSnapshot || 'TBD'}, handicap ${entry.handicap}kg.`
        );
        createNotification(
          db,
          entry.jockeyUserId,
          'Race published',
          `${race.name} has been published. Gate ${entry.lane}, rating ${entry.ratingSnapshot || 'TBD'}, handicap ${entry.handicap}kg.`
        );
      });
    }

    if (action === 'confirm-results') {
      if (race.resultStatus !== 'submitted') {
        send(res, 400, { message: 'Referee must submit results before Admin confirmation' });
        return true;
      }

      race.status = 'finished';
      race.resultStatus = 'approved';
    }

    if (action === 'reject-results') {
      race.resultStatus = 'rejected';
    }

    if (action === 'complete') {
      if (race.status !== 'finished') {
        send(res, 400, { message: 'Confirm results before completing awards' });
        return true;
      }

      race.status = 'completed';
      race.awardsPublished = true;
    }

    await writeDb(db);
    send(res, 200, {
      race,
      entries: publicRaceEntries(db).filter((entry) => entry.raceId === race.id),
      notifications: db.notifications || [],
    });
    return true;
  }

  const approvalMatch = url.pathname.match(
    /^\/api\/admin\/approvals\/(horse|jockey|jockeyTournament|raceEntry|pairing)\/([^/]+)$/
  );

  if (req.method === 'POST' && approvalMatch) {
    const user = await requireRole(req, db, ['admin']);

    if (!user) {
      send(res, 403, { message: 'Admin access required' });
      return true;
    }

    const [, entityType, id] = approvalMatch;
    const { decision } = await readBody(req);

    if (!['approved', 'rejected'].includes(decision)) {
      send(res, 400, { message: 'Decision must be approved or rejected' });
      return true;
    }

    if (entityType === 'horse') {
      const horse = db.horses.find((item) => item.id === id);

      if (!horse) {
        send(res, 404, { message: 'Horse approval not found' });
        return true;
      }

      horse.status = decision;

      createNotification(
        db,
        horse.ownerUserId,
        decision === 'approved' ? 'Horse approved' : 'Horse rejected',
        `${horse.name} has been ${decision} by Admin.`
      );
    }

    if (entityType === 'jockey') {
      const jockey = db.users.find((item) => item.id === id && item.role === 'jockey');

      if (!jockey) {
        send(res, 404, { message: 'Jockey approval not found' });
        return true;
      }

      jockey.status = decision === 'approved' ? 'active' : 'rejected';

      createNotification(
        db,
        jockey.id,
        decision === 'approved' ? 'Jockey account approved' : 'Jockey account rejected',
        `Your jockey application has been ${decision} by Admin.`
      );
    }

    if (entityType === 'jockeyTournament') {
      const registration = (db.jockeyTournamentRegistrations || []).find(
        (item) => item.id === id && item.status === 'pending'
      );

      if (!registration) {
        send(res, 404, { message: 'Jockey tournament registration not found' });
        return true;
      }

      registration.status = decision;
      registration.reviewedAt = new Date().toISOString();

      const tournament = db.tournaments.find(
        (item) => item.id === registration.tournamentId
      );

      createNotification(
        db,
        registration.jockeyUserId,
        decision === 'approved'
          ? 'Tournament participation approved'
          : 'Tournament participation rejected',
        `${tournament?.name || 'Tournament'} participation has been ${decision}.`
      );
    }

    if (entityType === 'raceEntry') {
      const entry = (db.raceEntries || []).find(
        (item) => item.id === id && item.status === 'pending-approval'
      );

      if (!entry) {
        send(res, 404, { message: 'Horse race entry not found' });
        return true;
      }

      const horse = db.horses.find((item) => item.id === entry.horseId);
      const race = db.races.find((item) => item.id === entry.raceId);

      if (decision === 'approved') {
        const approvedCount = approvedRaceEntries(db, entry.raceId).filter(
          (item) => item.id !== entry.id
        ).length;

        if (approvedCount >= MAX_RACE_FIELD_SIZE) {
          send(res, 400, {
            message: `This race already has ${MAX_RACE_FIELD_SIZE} approved horses. Reject or remove an entry before approving another one.`,
          });
          return true;
        }
      }

      entry.status = decision === 'approved' ? 'approved' : 'rejected';

      if (race) {
        race.participants = approvedRaceEntries(db, race.id).length;
      }

      createNotification(
        db,
        horse?.ownerUserId,
        decision === 'approved' ? 'Race entry approved' : 'Race entry rejected',
        `${horse?.name || 'Horse'} for ${race?.name || 'race'} has been ${decision}.`
      );

      createNotification(
        db,
        entry.jockeyUserId,
        decision === 'approved' ? 'Race entry approved' : 'Race entry rejected',
        `${horse?.name || 'Horse'} for ${race?.name || 'race'} has been ${decision}.`
      );
    }

    if (entityType === 'pairing') {
      const invitation = (db.jockeyInvitations || []).find(
        (item) =>
          item.id === id &&
          item.status === 'accepted' &&
          item.adminStatus === 'pending'
      );

      if (!invitation) {
        send(res, 404, { message: 'Horse-Jockey pairing approval not found' });
        return true;
      }

      const horse = db.horses.find((item) => item.id === invitation.horseId);
      const raceLabel = raceName(db, invitation.raceId);

      invitation.adminStatus = decision;

      if (decision === 'approved') {
        if (horse) {
          horse.jockeyConfirmation = 'confirmed';
        }

        if (invitation.raceId) {
          db.raceEntries = db.raceEntries || [];

          const alreadyEntered = db.raceEntries.some(
            (entry) =>
              entry.raceId === invitation.raceId &&
              entry.horseId === invitation.horseId
          );

          if (!alreadyEntered) {
            const approvedCount = approvedRaceEntries(
              db,
              invitation.raceId
            ).length;

            if (approvedCount >= MAX_RACE_FIELD_SIZE) {
              send(res, 400, {
                message: `This race already has ${MAX_RACE_FIELD_SIZE} approved horses. Reject or remove an entry before approving another one.`,
              });
              return true;
            }

            db.raceEntries.push({
              id: randomUUID(),
              raceId: invitation.raceId,
              horseId: invitation.horseId,
              jockeyUserId: invitation.jockeyUserId,
              invitationId: invitation.id,
              status: 'approved',
              lane: null,
              handicap: 0,
              ratingSnapshot: 0,
              ownerConfirmed: false,
              jockeyConfirmed: false,
              preRaceStatus: 'pending',
              disqualified: false,
              createdAt: new Date().toISOString(),
            });
          }

          const race = db.races.find((item) => item.id === invitation.raceId);
          if (race) {
            race.participants = approvedRaceEntries(db, race.id).length;
          }
        }

        createNotification(
          db,
          invitation.ownerUserId,
          'Pairing approved for race',
          `Admin approved ${horse?.name || 'your horse'} with ${jockeyName(db, invitation.jockeyUserId)} for ${raceLabel}.`
        );

        createNotification(
          db,
          invitation.jockeyUserId,
          'You are approved for the race',
          `Admin approved your assignment to ride ${horse?.name || 'the horse'} in ${raceLabel}.`
        );
      } else {
        if (horse) {
          horse.selectedJockeyUserId = null;
          horse.jockeyConfirmation = 'waiting-owner';
        }

        createNotification(
          db,
          invitation.ownerUserId,
          'Pairing rejected for race',
          `Admin rejected the ${horse?.name || 'horse'} + ${jockeyName(db, invitation.jockeyUserId)} assignment for ${raceLabel}.`
        );

        createNotification(
          db,
          invitation.jockeyUserId,
          'Race assignment rejected',
          `Admin rejected your assignment for ${horse?.name || 'the horse'} in ${raceLabel}.`
        );
      }
    }

    await writeDb(db);
    send(res, 200, {
      ok: true,
      approvals: formatApprovals(db),
      notifications: db.notifications || [],
    });
    return true;
  }

  return false;
};

import { randomUUID } from 'node:crypto';
import { requireRole } from '../services/authService.js';
import {
  activeTournament,
  ownerName,
  publicRaceEntries,
  raceName,
} from '../services/domainService.js';
import {
  createNotification,
  notifyAdmins,
} from '../services/notificationService.js';

export const handleJockeyRoutes = async ({
  req,
  res,
  url,
  db,
  send,
  readBody,
  writeDb,
}) => {
  if (req.method === 'POST' && url.pathname === '/api/jockey/tournament-registrations') {
    const user = await requireRole(req, db, ['jockey']);

    if (!user) {
      send(res, 403, { message: 'Jockey access required' });
      return true;
    }

    const { tournamentId } = await readBody(req);
    const tournament = db.tournaments.find((item) => item.id === tournamentId);

    if (!tournament) {
      send(res, 404, { message: 'Tournament not found' });
      return true;
    }

    db.jockeyTournamentRegistrations = db.jockeyTournamentRegistrations || [];

    const existing = db.jockeyTournamentRegistrations.find(
      (registration) =>
        registration.tournamentId === tournament.id &&
        registration.jockeyUserId === user.id
    );

    if (existing) {
      send(res, 409, {
        message: `You already have a ${existing.status} registration for this tournament.`,
      });
      return true;
    }

    const registration = {
      id: randomUUID(),
      tournamentId: tournament.id,
      jockeyUserId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };

    db.jockeyTournamentRegistrations.unshift(registration);

    notifyAdmins(
      db,
      'Jockey tournament registration',
      `${user.name} requested to join ${tournament.name}.`
    );

    createNotification(
      db,
      user.id,
      'Tournament registration submitted',
      `${tournament.name} is waiting for Admin approval.`
    );

    await writeDb(db);
    send(res, 201, {
      registration,
      jockeyTournamentRegistrations: db.jockeyTournamentRegistrations,
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/jockey/portal') {
    const user = await requireRole(req, db, ['jockey']);

    if (!user) {
      send(res, 403, { message: 'Jockey access required' });
      return true;
    }

    const profile =
      (db.jockeyProfiles || []).find((item) => item.userId === user.id) ||
      null;

    send(res, 200, {
      profile,
      horses: db.horses,
      races: db.races,
      raceEntries: publicRaceEntries(db).filter(
        (entry) => entry.jockeyUserId === user.id
      ),
      invitations: (db.jockeyInvitations || []).filter(
        (invitation) => invitation.jockeyUserId === user.id
      ),
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/jockey/profile') {
    const user = await requireRole(req, db, ['jockey']);

    if (!user) {
      send(res, 403, { message: 'Jockey access required' });
      return true;
    }

    if (!activeTournament(db)) {
      send(res, 400, {
        message: 'Admin must create and open a tournament before jockeys can publish profiles.',
      });
      return true;
    }

    const { bio, certificate, competitionLevel, weight } = await readBody(req);
    db.jockeyProfiles = db.jockeyProfiles || [];

    let profile = db.jockeyProfiles.find((item) => item.userId === user.id);

    if (!profile) {
      profile = {
        id: randomUUID(),
        userId: user.id,
      };
      db.jockeyProfiles.unshift(profile);
    }

    profile.bio = bio || '';
    profile.certificate = certificate || '';
    profile.competitionLevel = competitionLevel || '';
    profile.weight = Number(weight) || 0;
    profile.status = 'published';
    profile.updatedAt = new Date().toISOString();

    await writeDb(db);
    send(res, 200, { profile });
    return true;
  }

  const invitationDecisionMatch = url.pathname.match(
    /^\/api\/jockey\/invitations\/([^/]+)$/
  );

  if (req.method === 'POST' && invitationDecisionMatch) {
    const user = await requireRole(req, db, ['jockey']);

    if (!user) {
      send(res, 403, { message: 'Jockey access required' });
      return true;
    }

    const { decision } = await readBody(req);

    if (!['accepted', 'rejected'].includes(decision)) {
      send(res, 400, { message: 'Decision must be accepted or rejected' });
      return true;
    }

    const invitation = (db.jockeyInvitations || []).find(
      (item) => item.id === invitationDecisionMatch[1] && item.jockeyUserId === user.id
    );

    if (!invitation) {
      send(res, 404, { message: 'Invitation not found' });
      return true;
    }

    invitation.status = decision;
    invitation.respondedAt = new Date().toISOString();

    const horse = db.horses.find((item) => item.id === invitation.horseId);
    const raceLabel = raceName(db, invitation.raceId);

    if (decision === 'accepted') {
      invitation.adminStatus = 'pending';

      if (horse) {
        horse.jockeyConfirmation = 'pending-admin';
      }

      createNotification(
        db,
        invitation.ownerUserId,
        'Jockey accepted race participation',
        `${user.name} accepted riding ${horse?.name || 'your horse'} for ${raceLabel}. Waiting for Admin approval.`
      );

      notifyAdmins(
        db,
        'Race entry needs approval',
        `${ownerName(db, invitation.ownerUserId)} registered ${horse?.name || 'Horse'} + ${user.name} for ${raceLabel}.`
      );
    } else {
      invitation.adminStatus = null;

      if (horse) {
        horse.selectedJockeyUserId = null;
        horse.jockeyConfirmation = 'waiting-owner';
      }

      createNotification(
        db,
        invitation.ownerUserId,
        'Jockey rejected request',
        `${user.name} rejected the request${horse ? ` for ${horse.name}` : ''}.`
      );
    }

    await writeDb(db);
    send(res, 200, { invitation });
    return true;
  }

  return false;
};

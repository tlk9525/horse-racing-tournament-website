import { randomUUID } from 'node:crypto';
import { MAX_OWNER_HORSES } from '../config/constants.js';
import { requireRole } from '../services/authService.js';
import {
  activeTournament,
  defaultRaceForTournament,
  jockeyName,
  publicRaceEntries,
  publicTournamentJockeyProfiles,
} from '../services/domainService.js';
import {
  createNotification,
  notifyAdmins,
} from '../services/notificationService.js';
import {
  horseOverallRating,
  numeric,
} from '../services/handicapService.js';

export const handleOwnerRoutes = async ({
  req,
  res,
  url,
  db,
  send,
  readBody,
  writeDb,
}) => {
  if (req.method === 'GET' && url.pathname === '/api/owner/portal') {
    const user = await requireRole(req, db, ['owner']);

    if (!user) {
      send(res, 403, { message: 'Owner access required' });
      return true;
    }

    send(res, 200, {
      horses: db.horses.filter((horse) => horse.ownerUserId === user.id),
      raceEntries: publicRaceEntries(db).filter((entry) => {
        const horse = db.horses.find((item) => item.id === entry.horseId);
        return horse?.ownerUserId === user.id;
      }),
      jockeyProfiles: [],
      invitations: (db.jockeyInvitations || []).filter(
        (invitation) => invitation.ownerUserId === user.id
      ),
      limits: {
        maxOwnerHorses: MAX_OWNER_HORSES,
      },
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/owner/race-registration') {
    const user = await requireRole(req, db, ['owner']);

    if (!user) {
      send(res, 403, { message: 'Owner access required' });
      return true;
    }

    const tournamentId = url.searchParams.get('tournamentId') || '';
    const tournament = db.tournaments.find((item) => item.id === tournamentId);

    if (!tournament) {
      send(res, 404, { message: 'Tournament not found' });
      return true;
    }

    send(res, 200, {
      tournament,
      horses: db.horses.filter(
        (horse) => horse.ownerUserId === user.id && horse.status === 'approved'
      ),
      races: db.races.filter(
        (race) =>
          race.tournamentId === tournament.id &&
          race.status === 'registration-open'
      ),
      jockeyProfiles: publicTournamentJockeyProfiles(db, tournament.id),
      raceEntries: publicRaceEntries(db).filter((entry) => {
        const horse = db.horses.find((item) => item.id === entry.horseId);
        return horse?.ownerUserId === user.id;
      }),
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/owner/horses') {
    const user = await requireRole(req, db, ['owner']);

    if (!user) {
      send(res, 403, { message: 'Owner access required' });
      return true;
    }

    if (!activeTournament(db)) {
      send(res, 400, {
        message: 'Admin must create and open a tournament before owners can register horses.',
      });
      return true;
    }

    const ownerHorses = db.horses.filter((horse) => horse.ownerUserId === user.id);

    if (ownerHorses.length >= MAX_OWNER_HORSES) {
      send(res, 400, {
        message: `Each owner can register up to ${MAX_OWNER_HORSES} horses.`,
      });
      return true;
    }

    const {
      name,
      breed,
      species,
      age,
      sex,
      color,
      weightKg,
      heightCm,
      baseHandicap,
      speedRating,
      staminaRating,
      formRating,
      healthRating,
      overallRating,
      healthStatus,
      profileNotes,
      veterinaryCertificateUrl,
    } = await readBody(req);

    if (!name || !breed || !age || Number(age) <= 0) {
      send(res, 400, { message: 'Horse name, breed and age are required' });
      return true;
    }

    const createdAt = new Date().toISOString();
    const horse = {
      id: randomUUID(),
      name,
      breed,
      species: species || '',
      age: Number(age),
      sex: sex || '',
      color: color || '',
      weightKg: Number(weightKg) || 0,
      heightCm: Number(heightCm) || 0,
      baseHandicap: Number(baseHandicap) || 0,
      speedRating: numeric(speedRating, 75),
      staminaRating: numeric(staminaRating, 75),
      formRating: numeric(formRating, 75),
      healthRating: numeric(healthRating, 80),
      overallRating:
        numeric(overallRating, 0) ||
        horseOverallRating({ speedRating, staminaRating, formRating, healthRating }),
      healthStatus: healthStatus || '',
      profileNotes: profileNotes || '',
      ownerUserId: user.id,
      status: 'pending',
      jockeyConfirmation: 'waiting-owner',
      veterinaryCertificateUrl: veterinaryCertificateUrl || '',
      createdAt,
      updatedAt: createdAt,
    };

    db.horses.unshift(horse);

    notifyAdmins(
      db,
      'New horse registration',
      `${user.name} submitted ${horse.name} for admin approval.`
    );

    createNotification(
      db,
      user.id,
      'Horse registration submitted',
      `${horse.name} is waiting for admin approval.`
    );

    await writeDb(db);
    send(res, 201, {
      horse,
      horseCount: ownerHorses.length + 1,
      maxHorses: MAX_OWNER_HORSES,
    });
    return true;
  }

  const ownerHorseEditMatch = url.pathname.match(
    /^\/api\/owner\/horses\/([^/]+)$/
  );

  if (req.method === 'POST' && ownerHorseEditMatch) {
    const user = await requireRole(req, db, ['owner', 'admin']);

    if (!user) {
      send(res, 403, { message: 'Owner access required' });
      return true;
    }

    const horse = db.horses.find((item) => item.id === ownerHorseEditMatch[1]);

    if (!horse || (user.role === 'owner' && horse.ownerUserId !== user.id)) {
      send(res, 404, { message: 'Horse not found' });
      return true;
    }

    const {
      name,
      breed,
      species,
      age,
      sex,
      color,
      weightKg,
      heightCm,
      baseHandicap,
      speedRating,
      staminaRating,
      formRating,
      healthRating,
      overallRating,
      healthStatus,
      profileNotes,
      veterinaryCertificateUrl,
    } = await readBody(req);

    if (!name || !breed || !age || Number(age) <= 0) {
      send(res, 400, { message: 'Horse name, breed and age are required' });
      return true;
    }

    horse.name = name;
    horse.breed = breed;
    horse.species = species || '';
    horse.age = Number(age);
    horse.sex = sex || '';
    horse.color = color || '';
    horse.weightKg = Number(weightKg) || 0;
    horse.heightCm = Number(heightCm) || 0;
    horse.baseHandicap = Number(baseHandicap) || 0;
    horse.speedRating = numeric(speedRating, 75);
    horse.staminaRating = numeric(staminaRating, 75);
    horse.formRating = numeric(formRating, 75);
    horse.healthRating = numeric(healthRating, 80);
    horse.overallRating =
      numeric(overallRating, 0) ||
      horseOverallRating({
        speedRating,
        staminaRating,
        formRating,
        healthRating,
      });
    horse.healthStatus = healthStatus || '';
    horse.profileNotes = profileNotes || '';
    horse.veterinaryCertificateUrl = veterinaryCertificateUrl || '';
    horse.updatedAt = new Date().toISOString();

    createNotification(
      db,
      horse.ownerUserId,
      'Horse profile updated',
      `${horse.name} profile information has been updated.`
    );

    await writeDb(db);
    send(res, 200, { horse });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/owner/jockey-requests') {
    const user = await requireRole(req, db, ['owner']);

    if (!user) {
      send(res, 403, { message: 'Owner access required' });
      return true;
    }

    const { horseId, jockeyUserId, raceId } = await readBody(req);
    const horse = db.horses.find(
      (item) => item.id === horseId && item.ownerUserId === user.id
    );
    const jockey = db.users.find(
      (item) =>
        item.id === jockeyUserId &&
        item.role === 'jockey' &&
        item.status === 'active'
    );

    if (!horse || horse.status !== 'approved') {
      send(res, 400, { message: 'Horse must exist and be approved' });
      return true;
    }

    if (!jockey) {
      send(res, 400, { message: 'Jockey must exist and be active' });
      return true;
    }

    db.jockeyInvitations = db.jockeyInvitations || [];

    const tournament = activeTournament(db);
    const race =
      db.races.find(
        (item) =>
          item.id === raceId &&
          item.status === 'registration-open'
      ) ||
      (tournament ? defaultRaceForTournament(db, tournament.id) : null);

    if (!race) {
      send(res, 400, { message: 'Race registration is not open' });
      return true;
    }

    const duplicateEntry = (db.jockeyInvitations || []).some(
      (item) =>
        item.raceId === race.id &&
        item.horseId === horseId &&
        item.status !== 'cancelled'
    );

    if (duplicateEntry) {
      send(res, 409, { message: 'This horse is already registered for this race' });
      return true;
    }

    const invitation = {
      id: randomUUID(),
      horseId,
      ownerUserId: user.id,
      jockeyUserId,
      tournamentId: tournament?.id || null,
      raceId: race.id,
      status: 'pending',
      adminStatus: null,
      createdAt: new Date().toISOString(),
    };
    db.jockeyInvitations.unshift(invitation);

    horse.jockeyConfirmation = 'pending';
    horse.updatedAt = new Date().toISOString();

    createNotification(
      db,
      jockeyUserId,
      'New race participation request',
      `${user.name} registered ${horse.name} for ${race.name} and selected you as jockey.`
    );

    await writeDb(db);
    send(res, 201, { invitation });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/owner/race-entries') {
    const user = await requireRole(req, db, ['owner']);

    if (!user) {
      send(res, 403, { message: 'Owner access required' });
      return true;
    }

    const { tournamentId, raceId, horseId, jockeyUserId, notes } = await readBody(req);
    const horse = db.horses.find(
      (item) =>
        item.id === horseId &&
        item.ownerUserId === user.id &&
        item.status === 'approved'
    );
    const race = db.races.find(
      (item) =>
        item.id === raceId &&
        item.tournamentId === tournamentId &&
        item.status === 'registration-open'
    );
    const jockeyApproved = (db.jockeyTournamentRegistrations || []).some(
      (registration) =>
        registration.tournamentId === tournamentId &&
        registration.jockeyUserId === jockeyUserId &&
        registration.status === 'approved'
    );

    if (!horse) {
      send(res, 400, { message: 'Owner can only register approved horses they own' });
      return true;
    }

    if (!race) {
      send(res, 400, { message: 'Race registration is not open' });
      return true;
    }

    if (!jockeyApproved) {
      send(res, 400, { message: 'Jockey must be approved for the same tournament' });
      return true;
    }

    db.raceEntries = db.raceEntries || [];
    db.jockeyInvitations = db.jockeyInvitations || [];

    const duplicateEntry = db.raceEntries.some(
      (entry) =>
        entry.raceId === race.id &&
        entry.horseId === horse.id &&
        entry.status !== 'rejected'
    );
    const duplicateInvitation = db.jockeyInvitations.some(
      (invitation) =>
        invitation.raceId === race.id &&
        invitation.horseId === horse.id &&
        !['rejected', 'cancelled'].includes(invitation.status) &&
        invitation.adminStatus !== 'rejected'
    );

    if (duplicateEntry || duplicateInvitation) {
      send(res, 409, {
        message: 'This horse already has a pending or approved registration for this race',
      });
      return true;
    }

    const jockeyAlreadyAssignedToEntry = db.raceEntries.some(
      (entry) =>
        entry.raceId === race.id &&
        entry.jockeyUserId === jockeyUserId &&
        entry.status !== 'rejected'
    );
    const jockeyAlreadyInvited = db.jockeyInvitations.some(
      (invitation) =>
        invitation.raceId === race.id &&
        invitation.jockeyUserId === jockeyUserId &&
        !['rejected', 'cancelled'].includes(invitation.status) &&
        invitation.adminStatus !== 'rejected'
    );

    if (jockeyAlreadyAssignedToEntry || jockeyAlreadyInvited) {
      send(res, 409, {
        message: 'This jockey already has a pending or approved assignment in the same race',
      });
      return true;
    }

    const invitation = {
      id: randomUUID(),
      horseId: horse.id,
      ownerUserId: user.id,
      jockeyUserId,
      tournamentId,
      raceId: race.id,
      status: 'pending',
      adminStatus: null,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };

    db.jockeyInvitations.unshift(invitation);
    horse.jockeyConfirmation = 'pending-jockey';
    horse.updatedAt = new Date().toISOString();

    createNotification(
      db,
      jockeyUserId,
      'Race participation request',
      `${user.name} invited you to ride ${horse.name} in ${race.name}. Accept the request before Admin can approve the race entry.`
    );

    createNotification(
      db,
      user.id,
      'Jockey request sent',
      `${horse.name} is waiting for ${jockeyName(db, jockeyUserId)} to accept ${race.name}. Admin approval starts after the jockey accepts.`
    );

    await writeDb(db);
    send(res, 201, { invitation });
    return true;
  }

  return false;
};

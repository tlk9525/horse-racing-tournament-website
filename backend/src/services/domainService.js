export const ownerName = (db, userId) =>
  db.users.find((user) => user.id === userId)?.name || 'Unknown Owner';

export const jockeyName = (db, userId) =>
  db.users.find((user) => user.id === userId)?.name || 'Unknown Jockey';

export const horseName = (db, horseId) =>
  db.horses.find((horse) => horse.id === horseId)?.name || 'Unknown Horse';

export const raceName = (db, raceId) =>
  db.races.find((race) => race.id === raceId)?.name || 'Unassigned race';

export const activeTournament = (db) =>
  db.tournaments.find((tournament) =>
    ['registration', 'approvals', 'active'].includes(tournament.status)
  ) || null;

export const defaultRaceForTournament = (db, tournamentId) =>
  db.races.find(
    (race) =>
      race.tournamentId === tournamentId &&
      race.status === 'registration-open'
  ) || null;

export const findEntry = (db, entryId) =>
  (db.raceEntries || []).find((entry) => entry.id === entryId);

export const approvedRaceEntries = (db, raceId) =>
  (db.raceEntries || []).filter(
    (entry) => entry.raceId === raceId && entry.status === 'approved'
  );

export const publicRaceEntries = (db) =>
  (db.raceEntries || []).map((entry) => ({
    ...entry,
    horseName: horseName(db, entry.horseId),
    jockeyName: jockeyName(db, entry.jockeyUserId),
    ownerName: ownerName(
      db,
      db.horses.find((horse) => horse.id === entry.horseId)?.ownerUserId
    ),
    raceName: raceName(db, entry.raceId),
  }));

export const publicJockeyProfiles = (db) =>
  (db.jockeyProfiles || [])
    .map((profile) => {
      const user = db.users.find((item) => item.id === profile.userId);

      return {
        ...profile,
        jockeyName: user?.name || 'Unknown Jockey',
        jockeyEmail: user?.email || '',
        userStatus: user?.status || 'unknown',
      };
    })
    .filter(
      (profile) =>
        profile.status === 'published' &&
        profile.userStatus === 'active'
    );

export const publicTournamentJockeyProfiles = (db, tournamentId) => {
  const approvedJockeyIds = new Set(
    (db.jockeyTournamentRegistrations || [])
      .filter(
        (registration) =>
          registration.tournamentId === tournamentId &&
          registration.status === 'approved'
      )
      .map((registration) => registration.jockeyUserId)
  );

  return publicJockeyProfiles(db).filter((profile) =>
    approvedJockeyIds.has(profile.userId)
  );
};

export const canRefereeRace = (race, user) =>
  user?.role === 'admin' ||
  race?.refereeUserId === user?.id ||
  String(race?.refereeUserIds || '')
    .split(',')
    .map((id) => id.trim())
    .includes(user?.id);

export const formatApprovals = (db) => [
  ...db.horses
    .filter((horse) => horse.status === 'pending')
    .map((horse) => ({
      id: horse.id,
      entityType: 'horse',
      type: 'Horse Registration',
      name: horse.name,
      detail: `Owner: ${ownerName(db, horse.ownerUserId)}`,
      date: db.tournaments[0]?.registrationWindow || 'Registration window',
      targetUserId: horse.ownerUserId,
    })),
  ...db.users
    .filter((user) => user.role === 'jockey' && user.status === 'pending')
    .map((user) => ({
      id: user.id,
      entityType: 'jockey',
      type: 'Jockey Application',
      name: user.name,
      detail: 'Account approval required',
      date: db.tournaments[0]?.registrationWindow || 'Registration window',
      targetUserId: user.id,
    })),
  ...(db.jockeyTournamentRegistrations || [])
    .filter((registration) => registration.status === 'pending')
    .map((registration) => ({
      id: registration.id,
      entityType: 'jockeyTournament',
      type: 'Jockey Tournament Registration',
      name: jockeyName(db, registration.jockeyUserId),
      detail: `Tournament: ${
        db.tournaments.find((tournament) => tournament.id === registration.tournamentId)?.name ||
        'Tournament'
      }`,
      date: registration.createdAt,
      targetUserId: registration.jockeyUserId,
    })),
  ...(db.raceEntries || [])
    .filter((entry) => entry.status === 'pending-approval')
    .map((entry) => {
      const horse = db.horses.find((item) => item.id === entry.horseId);

      return {
        id: entry.id,
        entityType: 'raceEntry',
        type: 'Horse Race Entry',
        name: `${horseName(db, entry.horseId)} + ${jockeyName(db, entry.jockeyUserId)}`,
        detail: `Race: ${raceName(db, entry.raceId)} • Owner: ${ownerName(db, horse?.ownerUserId)}`,
        date: entry.createdAt,
        targetUserId: horse?.ownerUserId,
      };
    }),
  ...(db.jockeyInvitations || [])
    .filter(
      (invitation) =>
        invitation.status === 'accepted' && invitation.adminStatus === 'pending'
    )
    .map((invitation) => ({
      id: invitation.id,
      entityType: 'pairing',
      type: 'Race Entry Registration',
      name: `${horseName(db, invitation.horseId)} + ${jockeyName(db, invitation.jockeyUserId)}`,
      detail: `Race: ${raceName(db, invitation.raceId)} • Owner: ${ownerName(db, invitation.ownerUserId)}`,
      date:
        db.races.find((race) => race.id === invitation.raceId)?.date ||
        activeTournament(db)?.startDate ||
        'Race schedule',
      targetUserId: invitation.ownerUserId,
    })),
];

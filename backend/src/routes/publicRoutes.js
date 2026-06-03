import { FRONTEND_URL } from '../config/constants.js';
import { publicUser } from '../services/authService.js';
import {
  publicJockeyProfiles,
  publicRaceEntries,
} from '../services/domainService.js';

export const handlePublicRoutes = async ({ req, res, url, db, send }) => {
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(302, {
      Location: FRONTEND_URL,
      'Access-Control-Allow-Origin': '*',
    });
    res.end();
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    send(res, 200, { ok: true });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
    send(res, 200, {
      tournaments: db.tournaments,
      horses: db.horses,
      races: db.races,
      jockeyProfiles: publicJockeyProfiles(db),
      jockeyTournamentRegistrations: db.jockeyTournamentRegistrations || [],
      jockeyInvitations: db.jockeyInvitations || [],
      raceEntries: publicRaceEntries(db),
      users: db.users.map(publicUser),
      notifications: db.notifications || [],
    });
    return true;
  }

  return false;
};

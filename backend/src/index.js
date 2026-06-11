import { createServer } from 'node:http';
import {
  API_HOST,
  API_PORT,
} from './config/constants.js';
import {
  readBody,
  send,
} from './http/respond.js';
import { readDb, writeDb } from './sqlDb.js';
import { handleAdminRoutes } from './routes/adminRoutes.js';
import { handleAuthRoutes } from './routes/authRoutes.js';
import { handleJockeyRoutes } from './routes/jockeyRoutes.js';
import { handleNotificationRoutes } from './routes/notificationRoutes.js';
import { handleOwnerRoutes } from './routes/ownerRoutes.js';
import { handlePublicRoutes } from './routes/publicRoutes.js';
import { handleRefereeRoutes } from './routes/refereeRoutes.js';

const routeHandlers = [
  handlePublicRoutes,
  handleAuthRoutes,
  handleOwnerRoutes,
  handleJockeyRoutes,
  handleAdminRoutes,
  handleRefereeRoutes,
  handleNotificationRoutes,
];

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      send(res, 200, { ok: true });
      return;
    }

    const db = await readDb();
    const context = {
      req,
      res,
      url,
      db,
      send,
      readBody,
      writeDb,
    };

    for (const handleRoute of routeHandlers) {
      if (await handleRoute(context)) {
        return;
      }
    }

    send(res, 404, { message: 'Not found' });
  } catch (error) {
    console.error(error);
    send(res, 500, { message: 'Server error' });
  }
});

server.listen(API_PORT, API_HOST, () => {
  console.log(`API server running at http://${API_HOST}:${API_PORT}`);
});

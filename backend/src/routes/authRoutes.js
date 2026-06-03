import { randomUUID } from 'node:crypto';
import {
  authenticate,
  publicUser,
} from '../services/authService.js';

export const handleAuthRoutes = async ({
  req,
  res,
  url,
  db,
  send,
  readBody,
  writeDb,
}) => {
  if (req.method === 'GET' && url.pathname === '/api/me') {
    const user = await authenticate(req, db);
    send(res, user ? 200 : 401, user ? { user } : { message: 'Not authenticated' });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const { email, password } = await readBody(req);
    const user = db.users.find(
      (item) =>
        item.email.toLowerCase() === String(email || '').toLowerCase() &&
        item.password === password &&
        item.status === 'active'
    );

    if (!user) {
      send(res, 401, { message: 'Invalid email or password' });
      return true;
    }

    const token = randomUUID();
    db.sessions.push({
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
    await writeDb(db);

    send(res, 200, { token, user: publicUser(user) });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/register') {
    const { name, email, password, role } = await readBody(req);
    const allowedRoles = ['admin', 'owner', 'jockey', 'referee', 'spectator'];

    if (!name || !email || !password || !allowedRoles.includes(role)) {
      send(res, 400, { message: 'Name, email, password and role are required' });
      return true;
    }

    const exists = db.users.some(
      (item) => item.email.toLowerCase() === String(email).toLowerCase()
    );

    if (exists) {
      send(res, 409, { message: 'Email already exists' });
      return true;
    }

    const user = {
      id: randomUUID(),
      name,
      email,
      password,
      role,
      status: role === 'jockey' ? 'pending' : 'active',
    };
    db.users.push(user);
    await writeDb(db);

    send(res, 201, { user: publicUser(user) });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/logout') {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    db.sessions = db.sessions.filter((item) => item.token !== token);
    await writeDb(db);
    send(res, 200, { ok: true });
    return true;
  }

  return false;
};

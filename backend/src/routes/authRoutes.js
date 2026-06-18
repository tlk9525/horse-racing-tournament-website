import { randomUUID } from 'node:crypto';
import {
  authenticate,
  publicUser,
} from '../services/authService.js';
import {
  ACCOUNT_APPROVAL_ROLES,
  SELF_REGISTRATION_ROLES,
  SESSION_DAYS,
} from '../config/constants.js';
import {
  createNotification,
  notifyAdmins,
} from '../services/notificationService.js';

// Tạo một phiên đăng nhập mới với token ngẫu nhiên và lưu vào database
const createSession = (db, userId) => {
  const token = randomUUID();
  const createdAt = new Date();

  db.sessions.push({
    token,
    userId,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(
      createdAt.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString(),
  });
  return token;
};

// Xử lý các route xác thực: GET /me, POST /login, POST /register, POST /logout
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
        item.password === password
    );

    if (!user) {
      send(res, 401, { message: 'Invalid email or password' });
      return true;
    }

    if (user.status !== 'active') {
      send(res, 403, {
        message:
          user.status === 'pending'
            ? 'Your account is waiting for Admin approval.'
            : `Your account is ${user.status}. Please contact Admin.`,
      });
      return true;
    }

    db.sessions = (db.sessions || []).filter(
      (session) =>
        !session.expiresAt ||
        new Date(session.expiresAt).getTime() > Date.now()
    );

    const token = createSession(db, user.id);
    await writeDb(db);

    send(res, 200, { token, user: publicUser(user) });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/register') {
    const { name, email, password, role } = await readBody(req);

    if (!name || !email || !password || !SELF_REGISTRATION_ROLES.includes(role)) {
      send(res, 400, { message: 'Name, email, password and role are required. Admin accounts cannot self-register.' });
      return true;
    }

    const exists = db.users.some(
      (item) => item.email.toLowerCase() === String(email).toLowerCase()
    );

    if (exists) {
      send(res, 409, { message: 'Email already exists' });
      return true;
    }

    const needsApproval = ACCOUNT_APPROVAL_ROLES.includes(role);
    const createdAt = new Date().toISOString();
    const user = {
      id: randomUUID(),
      name,
      email,
      password,
      role,
      status: needsApproval ? 'pending' : 'active',
      createdAt,
      updatedAt: createdAt,
    };
    db.users.push(user);

    if (needsApproval) {
      notifyAdmins(
        db,
        'Account approval request',
        `${name} registered as ${role}. Please approve the account before this user can log in.`
      );

      createNotification(
        db,
        user.id,
        'Account request submitted',
        'Your account is waiting for Admin approval before you can log in.'
      );
    }

    await writeDb(db);

    send(res, 201, {
      user: publicUser(user),
      requiresApproval: needsApproval,
      message: needsApproval
        ? 'Account request submitted. Please wait for Admin approval before logging in.'
        : 'Account created. You can log in now.',
    });
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

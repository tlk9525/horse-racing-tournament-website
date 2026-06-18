import { Hono } from 'hono';
import { randomUUID } from 'node:crypto';
import {
  ACCOUNT_APPROVAL_ROLES,
  SELF_REGISTRATION_ROLES,
  SESSION_DAYS,
} from '../config/constants.js';
import { authenticate, publicUser } from '../services/authService.js';
import {
  createNotification,
  notifyAdmins,
} from '../services/notificationService.js';

export const createAuthRoutes = (getDb, writeDb) => {
  const app = new Hono();

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

  // Trả về thông tin user đang đăng nhập
  app.get('/me', async (c) => {
    const db = await getDb();
    const user = await authenticate(c.req.raw, db);
    return user
      ? c.json({ user })
      : c.json({ message: 'Not authenticated' }, 401);
  });

  // Đăng nhập bằng email và password, trả về token và thông tin user
  app.post('/login', async (c) => {
    const db = await getDb();
    const { email, password } = await c.req.json();
    const user = db.users.find(
      (item) =>
        item.email.toLowerCase() === String(email || '').toLowerCase() &&
        item.password === password
    );

    if (!user) return c.json({ message: 'Invalid email or password' }, 401);

    if (user.status !== 'active') {
      return c.json(
        {
          message:
            user.status === 'pending'
              ? 'Your account is waiting for Admin approval.'
              : `Your account is ${user.status}. Please contact Admin.`,
        },
        403
      );
    }

    db.sessions = (db.sessions || []).filter(
      (session) =>
        !session.expiresAt || new Date(session.expiresAt).getTime() > Date.now()
    );

    const token = createSession(db, user.id);
    await writeDb(db);
    return c.json({ token, user: publicUser(user) });
  });

  // Đăng ký tài khoản mới, trả về thông tin user và trạng thái phê duyệt
  app.post('/register', async (c) => {
    const db = await getDb();
    const { name, email, password, role } = await c.req.json();

    if (!name || !email || !password || !SELF_REGISTRATION_ROLES.includes(role)) {
      return c.json(
        { message: 'Name, email, password and role are required. Admin accounts cannot self-register.' },
        400
      );
    }

    const exists = db.users.some(
      (item) => item.email.toLowerCase() === String(email).toLowerCase()
    );
    if (exists) return c.json({ message: 'Email already exists' }, 409);

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
    return c.json(
      {
        user: publicUser(user),
        requiresApproval: needsApproval,
        message: needsApproval
          ? 'Account request submitted. Please wait for Admin approval before logging in.'
          : 'Account created. You can log in now.',
      },
      201
    );
  });

  // Đăng xuất, xóa phiên làm việc khỏi database
  app.post('/logout', async (c) => {
    const db = await getDb();
    const header = c.req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    db.sessions = db.sessions.filter((item) => item.token !== token);
    await writeDb(db);
    return c.json({ ok: true });
  });

  return app;
};

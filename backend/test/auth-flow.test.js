import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Hono } from 'hono';
import { createAuthRoutes } from '../src/routes/authRoutes.js';

test('auth uses an HttpOnly cookie and upgrades a legacy plaintext password', async () => {
  const db = {
    users: [
      {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'spectator',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    sessions: [],
    notifications: [],
  };
  let persistedSession = null;
  let deletedToken = '';

  const app = new Hono();
  app.route(
    '/api',
    createAuthRoutes(
      async () => db,
      async () => undefined,
      async (user, session) => {
        persistedSession = session;
        assert.equal(await bcrypt.compare('password123', user.password), true);
      },
      async () => undefined,
      async (token) => {
        deletedToken = token;
      }
    )
  );

  const loginResponse = await app.request('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
  });
  assert.equal(loginResponse.status, 200);
  const loginBody = await loginResponse.json();
  assert.equal(loginBody.user.id, 'user-1');
  assert.equal('token' in loginBody, false);

  const setCookie = loginResponse.headers.get('set-cookie') || '';
  assert.match(setCookie, /horse-racing-session=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.ok(persistedSession?.token);

  const cookie = setCookie.split(';')[0];
  const meResponse = await app.request('/api/me', {
    headers: { Cookie: cookie },
  });
  assert.equal(meResponse.status, 200);

  const logoutResponse = await app.request('/api/logout', {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  assert.equal(logoutResponse.status, 200);
  assert.equal(deletedToken, persistedSession.token);
  assert.match(logoutResponse.headers.get('set-cookie') || '', /Max-Age=0/i);
});

test('registration hashes passwords before persistence', async () => {
  const db = {
    users: [],
    sessions: [],
    notifications: [],
  };
  let persistedUser = null;

  const app = new Hono();
  app.route(
    '/api',
    createAuthRoutes(
      async () => db,
      async () => undefined,
      async () => undefined,
      async (user) => {
        persistedUser = user;
      },
      async () => undefined
    )
  );

  const response = await app.request('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'New Spectator',
      email: 'new@example.com',
      password: 'password123',
      role: 'spectator',
    }),
  });

  assert.equal(response.status, 201);
  assert.ok(persistedUser);
  assert.equal(await bcrypt.compare('password123', persistedUser.password), true);
  assert.equal(JSON.stringify(await response.json()).includes('password'), false);
});

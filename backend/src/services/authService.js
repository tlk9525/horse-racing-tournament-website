export const publicUser = ({ password, ...user }) => user;

export const authenticate = async (req, db) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = db.sessions.find((item) => item.token === token);

  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = db.users.find((item) => item.id === session.userId);
  return user?.status === 'active' ? publicUser(user) : null;
};

export const requireRole = async (req, db, roles) => {
  const user = await authenticate(req, db);

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return user;
};

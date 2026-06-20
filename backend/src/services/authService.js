// Trả về thông tin user công khai, loại bỏ trường password để tránh lộ thông tin nhạy cảm
export const publicUser = ({ password, ...user }) => user;

// Xác thực người dùng từ token Bearer trong header Authorization, trả về thông tin user nếu hợp lệ
export const authenticate = async (req, db) => {
  const header =
    (typeof req.headers?.get === 'function'
      ? req.headers.get('authorization')
      : req.headers?.authorization) || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = db.sessions.find((item) => item.token === token);

  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = db.users.find((item) => item.id === session.userId);
  return user?.status === 'active' ? publicUser(user) : null;
};

// Kiểm tra xác thực và phân quyền, trả về user nếu có role hợp lệ, null nếu không được phép
export const requireRole = async (req, db, roles) => {
  const user = await authenticate(req, db);

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return user;
};

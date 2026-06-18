import { randomUUID } from 'node:crypto';

// Tự động suy đoán loại thông báo (invitation, registration, result, warning, general) dựa trên tiêu đề
const inferNotificationType = (title = '') => {
  const normalized = String(title).toLowerCase();

  if (normalized.includes('invite') || normalized.includes('request')) {
    return 'invitation';
  }

  if (normalized.includes('registration') || normalized.includes('approved')) {
    return 'registration';
  }

  if (normalized.includes('result') || normalized.includes('award')) {
    return 'result';
  }

  if (normalized.includes('reject') || normalized.includes('closed')) {
    return 'warning';
  }

  return 'general';
};

// Tạo và thêm một thông báo mới vào đầu danh sách thông báo của người dùng trong database
export const createNotification = (db, userId, title, message, type) => {
  if (!userId) return;

  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: randomUUID(),
    userId,
    type: type || inferNotificationType(title),
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
};

// Gửi thông báo đến tất cả tài khoản có role 'admin' trong hệ thống
export const notifyAdmins = (db, title, message, type) => {
  db.users
    .filter((user) => user.role === 'admin')
    .forEach((admin) => createNotification(db, admin.id, title, message, type));
};

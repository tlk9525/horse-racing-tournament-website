import { randomUUID } from 'node:crypto';

export const createNotification = (db, userId, title, message) => {
  if (!userId) return;

  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: randomUUID(),
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
};

export const notifyAdmins = (db, title, message) => {
  db.users
    .filter((user) => user.role === 'admin')
    .forEach((admin) => createNotification(db, admin.id, title, message));
};

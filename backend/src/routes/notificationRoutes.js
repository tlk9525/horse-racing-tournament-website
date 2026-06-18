import { authenticate } from '../services/authService.js';

// Xử lý các route thông báo: GET /notifications (lấy danh sách) và POST /:id/read (đánh dấu đã đọc)
export const handleNotificationRoutes = async ({
  req,
  res,
  url,
  db,
  send,
  writeDb,
}) => {
  if (req.method === 'GET' && url.pathname === '/api/notifications') {
    const user = await authenticate(req, db);

    if (!user) {
      send(res, 401, { message: 'Not authenticated' });
      return true;
    }

    send(res, 200, {
      notifications: (db.notifications || []).filter(
        (notification) => notification.userId === user.id
      ),
    });
    return true;
  }

  const notificationMatch = url.pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);

  if (req.method === 'POST' && notificationMatch) {
    const user = await authenticate(req, db);

    if (!user) {
      send(res, 401, { message: 'Not authenticated' });
      return true;
    }

    const notification = (db.notifications || []).find(
      (item) => item.id === notificationMatch[1] && item.userId === user.id
    );

    if (!notification) {
      send(res, 404, { message: 'Notification not found' });
      return true;
    }

    notification.read = true;
    await writeDb(db);
    send(res, 200, { notification });
    return true;
  }

  return false;
};

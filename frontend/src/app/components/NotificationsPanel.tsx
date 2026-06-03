import { useEffect, useState } from 'react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import {
  NotificationItem,
  getNotifications,
  markNotificationRead,
} from '../services/api';
import { messageTone } from '../utils/messageTone';

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadNotifications = () => {
    getNotifications()
      .then(({ notifications: items }) => setNotifications(items))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const visibleNotifications = isExpanded
    ? notifications
    : notifications.slice(0, 3);
  const hasMoreNotifications = notifications.length > 3;

  return (
    <div className="bg-[#102a46] border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-[#d4af37]" />

          <div>
            <h2 className="text-2xl font-black text-white">
              Notifications
            </h2>

            <p className="text-gray-400">
              Role-specific updates from Admin and race operations.
            </p>
          </div>
        </div>

        <span className="px-4 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] font-bold">
          {unreadCount} unread
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="text-gray-500 bg-[#071a2f] border border-white/10 rounded-xl p-4">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => {
            const tone = messageTone(`${notification.title} ${notification.message}`);
            const toneClass =
              tone === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : tone === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300';

            return (
              <button
                key={notification.id}
                onClick={() =>
                  markNotificationRead(notification.id).then(loadNotifications)
                }
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  notification.read ? `${toneClass} opacity-60` : toneClass
                }`}
              >
                <div className="font-bold">
                  {notification.title}
                </div>

                <div className="text-sm mt-1 opacity-80">
                  {notification.message}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </button>
            );
          })}

          {hasMoreNotifications && (
            <button
              onClick={() => setIsExpanded((current) => !current)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071a2f] px-4 py-3 text-gray-300 font-bold hover:bg-white/5 hover:text-white transition-all"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 text-[#d4af37]" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-[#d4af37]" />
                  View {notifications.length - 3} more
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

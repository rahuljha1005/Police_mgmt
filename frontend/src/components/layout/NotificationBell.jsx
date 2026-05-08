import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markNotificationRead } from "../../services/notification.api";
import { formatDate } from "../../utils/formatDate";

const relatedPath = (notification) => {
  if (notification.related_entity_type === "FIR") return `/firs/${notification.related_entity_id}`;
  if (notification.related_entity_type === "COMPLAINT") return `/complaints/${notification.related_entity_id}`;
  return "/dashboard";
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    try {
      const response = await getNotifications({ limit: 8 });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount || 0);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  return (
    <div className="relative">
      <button className="relative rounded-md border border-white/10 p-2 text-zinc-300 hover:text-white" onClick={() => setOpen((current) => !current)} type="button">
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">{unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-police-panel p-3 shadow-2xl">
          <h3 className="px-2 pb-2 text-sm font-semibold text-white">Notifications</h3>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {notifications.length === 0 && <p className="px-2 py-4 text-sm text-zinc-400">No notifications.</p>}
            {notifications.map((notification) => (
              <div className={["rounded-md border p-3", notification.isRead ? "border-white/10 bg-police-bg" : "border-police-accent/40 bg-police-primary/20"].join(" ")} key={notification._id}>
                <Link className="block" onClick={() => setOpen(false)} to={relatedPath(notification)}>
                  <p className="text-sm font-semibold text-white">{notification.title}</p>
                  <p className="mt-1 text-xs text-zinc-300">{notification.message}</p>
                  <p className="mt-2 text-xs text-zinc-500">{formatDate(notification.createdAt)}</p>
                </Link>
                {!notification.isRead && <button className="mt-2 text-xs font-semibold text-police-accent" onClick={() => markRead(notification._id)} type="button">Mark as read</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

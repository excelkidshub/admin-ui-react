import type { AdminNotification } from "../types";

type NotificationFeedProps = {
  notifications: AdminNotification[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function NotificationFeed({ notifications }: NotificationFeedProps) {
  if (notifications.length === 0) {
    return <p className="empty-state">No admin notifications right now.</p>;
  }

  return (
    <div className="notification-feed">
      {notifications.map((notification) => (
        <article className={`notification notification--${notification.priority.toLowerCase()}`} key={`${notification.type}-${notification.referenceId}-${notification.createdAt}`}>
          <div className="notification__meta">
            <span className="notification__badge">{notification.priority}</span>
            <time>{formatDateTime(notification.createdAt)}</time>
          </div>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
        </article>
      ))}
    </div>
  );
}

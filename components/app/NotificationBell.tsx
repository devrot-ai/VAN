"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./app.module.css";

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  read: number;
  created_at: string;
}

/**
 * Notification bell icon with unread badge and dropdown panel.
 * Polls /api/notifications every 30 seconds for new notifications.
 */
export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markRead(id: number) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotifications();
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    fetchNotifications();
    router.refresh();
  }

  return (
    <div className={styles.notifBell} style={{ position: "relative" }}>
      <button
        className={styles.notifBellBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 ? <span className={styles.notifBadge}>{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className={styles.notifDropdown}>
          <div className={styles.notifDropdownHeader}>
            <span>Notifications</span>
            {unreadCount > 0 ? (
              <button className={styles.actBtn} onClick={markAllRead}>Mark all read</button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <div className={styles.empty}>No notifications.</div>
          ) : (
            <ul className={styles.list}>
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  className={`${styles.listItem} ${n.read === 0 ? styles.notifUnread : ""}`}
                  onClick={() => markRead(n.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.listTitle}>{n.message}</div>
                  <div className={styles.listMeta}>
                    <span>{n.type}</span>
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

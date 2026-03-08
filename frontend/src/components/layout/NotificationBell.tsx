'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import type { Notification } from '@/types';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const [items, count] = await Promise.all([
        api.getNotifications({ limit: 6 }),
        api.getUnreadNotificationCount(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
      if (unreadCount > 0) {
        await api.markAllNotificationsRead();
        setUnreadCount(0);
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
          />
          <div className="absolute right-0 z-20 mt-2 w-96 max-w-[90vw] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <button
                type="button"
                onClick={() => {
                  void api.markAllNotificationsRead();
                  setUnreadCount(0);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border px-3 py-3 text-sm ${
                      notification.read ? 'border-gray-200 bg-white' : 'border-blue-100 bg-blue-50'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-gray-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 border-t border-gray-100 pt-3">
              <Link href="/dashboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Dashboard home
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

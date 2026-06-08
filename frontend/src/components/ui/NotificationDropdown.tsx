'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { Notification } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function NotificationDropdown() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch unread count on mount and every 30 seconds ───
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = () => {
      usersApi.notifications(true)   // true = unread only
        .then(res => setUnreadCount(res.data.length))
        .catch(() => {});            // silently ignore errors
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ── Close dropdown when clicking outside ──────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Open dropdown: fetch full notification list ────────
  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open) {
      setLoading(true);
      try {
        const res = await usersApi.notifications(false); // false = all
        setNotifications(res.data.slice(0, 10));         // show last 10
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // ── Click a notification: mark read + navigate ─────────
  const handleClick = async (n: Notification) => {
    setOpen(false);
    // Mark as read in the background
    if (!n.is_read) {
      usersApi.markRead(n.id).catch(() => {});
      setNotifications(prev =>
        prev.map(x => x.id === n.id ? { ...x, is_read: true } : x),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    // Navigate to the linked page if there is one
    if (n.link) router.push(n.link);
  };

  // ── Mark all as read ───────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await usersApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  // Don't render anything if user is not logged in
  if (!isAuthenticated) return null;

  return (
    <div ref={dropdownRef} className='relative'>

      {/* ── Bell button ─────────────────────────────── */}
      <button
        onClick={handleOpen}
        className='relative p-2 text-gray-500 hover:text-blue-700
                   hover:bg-blue-50 rounded-lg transition'
        aria-label='Notifications'
      >
        <Bell className='h-5 w-5' />
        {/* Red badge — only shown when unreadCount > 0 */}
        {unreadCount > 0 && (
          <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                           bg-red-500 text-white text-[10px] font-bold rounded-full
                           flex items-center justify-center px-1'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ──────────────────────────── */}
      {open && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl
                       border border-gray-100 z-50 overflow-hidden'>

          {/* Header */}
          <div className='flex items-center justify-between px-4 py-3 border-b'>
            <h3 className='font-semibold text-gray-800 text-sm'>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className='text-xs text-blue-700 hover:underline'
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className='max-h-80 overflow-y-auto divide-y divide-gray-50'>
            {loading ? (
              <div className='px-4 py-6 text-center text-sm text-gray-400'>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className='px-4 py-8 text-center'>
                <Bell className='h-8 w-8 text-gray-200 mx-auto mb-2' />
                <p className='text-sm text-gray-400'>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50
                    transition flex gap-3 items-start
                    ${!n.is_read ? 'bg-blue-50/50' : ''}
                  `}
                >
                  {/* Unread dot */}
                  <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0
                    ${!n.is_read ? 'bg-blue-600' : 'bg-transparent'}`,
                  } />
                  <div className='min-w-0'>
                    <p className={`text-sm leading-snug
                      ${!n.is_read ? 'font-semibold text-gray-900'
                                   : 'font-normal text-gray-700'}`,
                    }>
                      {n.title}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5 line-clamp-2'>
                      {n.message}
                    </p>
                    <p className='text-[10px] text-gray-400 mt-1'>
                      {new Date(n.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='border-t px-4 py-2.5 text-center'>
              <button
                onClick={() => setOpen(false)}
                className='text-xs text-gray-400 hover:text-gray-600'
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
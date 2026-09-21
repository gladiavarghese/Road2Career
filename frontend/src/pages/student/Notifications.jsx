import { useEffect, useState } from 'react';
import { notificationAPI } from '../../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { EmptyState, LoadingSpinner } from '../../components/ui/Cards';
import { RiBellLine, RiCheckLine, RiDeleteBinLine } from 'react-icons/ri';

const NOTIF_ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️', achievement: '🏆', reminder: '⏰', update: '🔄' };
const NOTIF_COLORS = {
  info: 'border-l-blue-500',
  success: 'border-l-green-500',
  warning: 'border-l-amber-500',
  achievement: 'border-l-purple-500',
  reminder: 'border-l-orange-500',
  update: 'border-l-brand-500',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 50 });
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch {}
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'achievement') return n.notification_type === 'achievement';
    return true;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Notifications</h1>
          <p className="section-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary btn-sm">
            <RiCheckLine size={16} /> Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'achievement', label: '🏆 Achievements' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.id ? 'bg-brand-600 text-white' : 'bg-dark-900 border border-dark-700 text-dark-400 hover:text-dark-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`card p-4 border-l-4 ${NOTIF_COLORS[notif.notification_type] || 'border-l-dark-600'} ${!notif.is_read ? 'bg-dark-900' : 'bg-dark-950 opacity-70'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center text-lg flex-shrink-0">
                    {NOTIF_ICONS[notif.notification_type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${notif.is_read ? 'text-dark-400' : 'text-dark-100'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-dark-600 mt-1">
                      {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="btn-ghost p-1.5 text-dark-500 hover:text-green-400"
                        title="Mark as read"
                      >
                        <RiCheckLine size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="btn-ghost p-1.5 text-dark-500 hover:text-red-400"
                      title="Delete"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

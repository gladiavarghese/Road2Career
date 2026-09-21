import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../api/services';
import { RiMenuLine, RiBellLine, RiSearchLine, RiUser3Line, RiLogoutBoxLine, RiSettings3Line } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 5, unread: 'true' });
      setNotifCount(res.unreadCount || 0);
      setNotifications(res.data || []);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifCount(0);
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch {}
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-dark-950/80 border-b border-dark-800/50 blur-bg flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="btn-ghost p-2 lg:hidden">
        <RiMenuLine size={20} />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
          <input
            type="text"
            placeholder="Search features..."
            className="input pl-9 py-2 text-sm bg-dark-900/50 border-dark-700/50 h-9"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifPanel(p => !p); setShowUserMenu(false); }}
            className="btn-ghost p-2 relative"
          >
            <RiBellLine size={20} />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifPanel && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
                  <h3 className="text-sm font-semibold text-dark-100">Notifications</h3>
                  <button onClick={handleMarkAllRead} className="text-xs text-brand-400 hover:text-brand-300">
                    Mark all read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-dark-500 text-sm">
                    <span className="text-2xl block mb-2">🔔</span>
                    All caught up!
                  </div>
                ) : (
                  <div className="divide-y divide-dark-800">
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-dark-800/50 transition-colors">
                        <p className="text-sm text-dark-100 font-medium">{n.title}</p>
                        <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-3 border-t border-dark-800">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifPanel(false)}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    View all notifications →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(p => !p); setShowNotifPanel(false); }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-dark-100 leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-dark-500 capitalize mt-0.5">{user?.role}</p>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-52 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-dark-800">
                  <p className="text-sm font-medium text-dark-100">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <RiUser3Line size={16} /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <RiLogoutBoxLine size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

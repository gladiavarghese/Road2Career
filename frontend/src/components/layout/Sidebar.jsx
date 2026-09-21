import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  RiDashboardLine, RiUser3Line, RiCodeBoxLine, RiMapLine,
  RiCalendarLine, RiBarChartLine, RiBookOpenLine, RiProjectorLine,
  RiTrophyLine, RiBellLine, RiLogoutBoxLine, RiMenuFoldLine,
  RiMenuUnfoldLine, RiAdminLine, RiTeamLine, RiRoadMapLine,
  RiSettings3Line, RiCloseLine, RiCompass3Line
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const studentNav = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/career-goals', icon: RiCompass3Line, label: 'Career Goals' },
  { to: '/roadmap', icon: RiMapLine, label: 'AI Roadmap' },
  { to: '/skill-gap', icon: RiBarChartLine, label: 'Skill Gap Analysis' },
  { to: '/weekly-plan', icon: RiCalendarLine, label: 'Weekly Planner' },
  { to: '/skills', icon: RiCodeBoxLine, label: 'My Skills' },
  { to: '/resources', icon: RiBookOpenLine, label: 'Resources' },
  { to: '/projects', icon: RiProjectorLine, label: 'Projects' },
  { to: '/progress', icon: RiTrophyLine, label: 'Progress' },
  { to: '/notifications', icon: RiBellLine, label: 'Notifications' },
  { to: '/profile', icon: RiUser3Line, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/admin/students', icon: RiTeamLine, label: 'Students' },
  { to: '/admin/career-paths', icon: RiRoadMapLine, label: 'Career Paths' },
  { to: '/admin/skills', icon: RiCodeBoxLine, label: 'Skills' },
  { to: '/admin/resources', icon: RiBookOpenLine, label: 'Resources' },
  { to: '/admin/projects', icon: RiProjectorLine, label: 'Projects' },
];

export default function Sidebar({ isAdmin, collapsed, onToggle, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col bg-dark-950 border-r border-dark-800/50">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-dark-800/50 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
            <span className="text-sm">🗺️</span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-dark-50 text-sm whitespace-nowrap overflow-hidden"
              >
                Road2Career
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {onClose && (
            <button onClick={onClose} className="btn-ghost p-1.5 text-dark-400">
              <RiCloseLine size={18} />
            </button>
          )}
          {onToggle && (
            <button onClick={onToggle} className="btn-ghost p-1.5 text-dark-400 hidden lg:flex">
              {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {isAdmin && !collapsed && (
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-dark-600 uppercase tracking-wider">Admin Panel</span>
          </div>
        )}
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/dashboard'}
            className={({ isActive }) =>
              isActive ? 'sidebar-item-active block' : 'sidebar-item block'
            }
            title={collapsed ? label : undefined}
            onClick={onClose}
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-dark-800/50 flex-shrink-0">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-dark-500 capitalize truncate">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-dark-500 hover:text-red-400 p-1 transition-colors"
              title="Logout"
            >
              <RiLogoutBoxLine size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="sidebar-item w-full justify-center mt-1 text-dark-500 hover:text-red-400"
            title="Logout"
          >
            <RiLogoutBoxLine size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

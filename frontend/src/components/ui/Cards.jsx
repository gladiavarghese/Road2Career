import { motion } from 'framer-motion';

/**
 * StatCard - Dashboard stat card with icon, value, label, and change indicator
 */
export function StatCard({ icon, label, value, change, changeLabel, color = 'blue', loading }) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' },
  };
  const c = colors[color] || colors.blue;

  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-8 w-8 rounded-lg mb-3" />
        <div className="skeleton h-7 w-20 mb-2" />
        <div className="skeleton h-4 w-24" />
      </div>
    );
  }

  return (
    <motion.div
      className="card-hover p-5 cursor-default"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-dark-50">{value ?? '—'}</p>
        <p className="text-sm text-dark-400 mt-0.5">{label}</p>
        {changeLabel && <p className="text-xs text-dark-600 mt-1">{changeLabel}</p>}
      </div>
    </motion.div>
  );
}

/**
 * ProgressCard - Progress bar card
 */
export function ProgressCard({ title, value, max = 100, label, color = 'brand', icon }) {
  const pct = Math.round((value / max) * 100);
  const trackColors = {
    brand: 'from-brand-600 to-brand-400',
    green: 'from-green-600 to-green-400',
    purple: 'from-purple-600 to-purple-400',
    amber: 'from-amber-600 to-amber-400',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-dark-100">{title}</h3>
          {label && <p className="text-xs text-dark-500">{label}</p>}
        </div>
        <span className="text-2xl font-bold text-dark-50">{pct}%</span>
      </div>
      <div className="progress-bar h-2">
        <motion.div
          className={`progress-fill h-full bg-gradient-to-r ${trackColors[color] || trackColors.brand}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

/**
 * BadgeCard - Achievement badge display
 */
export function BadgeCard({ name, description, icon, color, earnedAt }) {
  return (
    <motion.div
      className="card p-4 text-center"
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-dark-100">{name}</p>
      <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">{description}</p>
      {earnedAt && (
        <p className="text-xs text-dark-600 mt-2">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

/**
 * ResourceCard - Learning resource card
 */
export function ResourceCard({ title, description, url, resourceType, difficulty, duration, isFree, rating, is_skill_gap_match, is_career_match }) {
  const typeColors = {
    course: 'badge-purple',
    youtube: 'badge-red',
    documentation: 'badge-blue',
    github: 'badge-green',
    platform: 'badge-amber',
    article: 'badge-blue',
    book: 'badge-amber',
  };

  const typeIcons = {
    course: '🎓', youtube: '▶️', documentation: '📚',
    github: '⭐', platform: '🖥️', article: '📄', book: '📖',
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover p-5 block group relative"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{typeIcons[resourceType] || '📚'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={typeColors[resourceType] || 'badge-blue'}>{resourceType}</span>
            {difficulty && <span className="badge-blue">{difficulty}</span>}
            {isFree ? <span className="badge-green">Free</span> : <span className="badge-amber">Paid</span>}
            {is_skill_gap_match && <span className="badge-purple font-bold">🎯 Skill Gap Match</span>}
          </div>
          <h3 className="text-sm font-semibold text-dark-100 group-hover:text-brand-400 transition-colors line-clamp-1">
            {title}
          </h3>
        </div>
      </div>
      <p className="text-xs text-dark-400 line-clamp-2 mb-3">{description}</p>
      <div className="flex items-center justify-between text-xs text-dark-500">
        {duration && <span>⏱️ {duration}</span>}
        {rating > 0 && <span>⭐ {rating}/5</span>}
      </div>
    </motion.a>
  );
}

/**
 * ProjectCard - Project recommendation card
 */
export function ProjectCard({ project, studentProject, onStart, onComplete, onViewDetails }) {
  const difficultyColors = {
    beginner: 'badge-green',
    intermediate: 'badge-amber',
    advanced: 'badge-red',
  };

  return (
    <motion.div className="card-hover p-5 flex flex-col justify-between" whileHover={{ y: -2 }}>
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl">🏗️</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={difficultyColors[project.difficulty] || 'badge-blue'}>{project.difficulty}</span>
              <span className="text-xs text-dark-500">{project.estimated_duration}</span>
              <span className="text-[11px] text-green-400 font-semibold ml-auto">+300 XP</span>
            </div>
            <h3
              onClick={() => onViewDetails?.(project.id)}
              className="text-sm font-semibold text-dark-100 hover:text-brand-400 transition-colors cursor-pointer line-clamp-1"
            >
              {project.title}
            </h3>
          </div>
        </div>
        <p className="text-xs text-dark-400 line-clamp-2 mb-3">{project.description}</p>

        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.technologies.slice(0, 4).map(t => (
              <span key={t} className="px-2 py-0.5 bg-dark-800 text-dark-400 text-xs rounded">{t}</span>
            ))}
            {project.technologies.length > 4 && (
              <span className="px-2 py-0.5 text-dark-600 text-xs">+{project.technologies.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onViewDetails?.(project.id)}
          className="btn-secondary btn-sm flex-1 text-xs"
        >
          🔍 View Specs
        </button>
        {!studentProject ? (
          <button onClick={() => onStart?.(project.id)} className="btn-primary btn-sm flex-1 text-xs">
            Start Project
          </button>
        ) : studentProject?.status === 'in_progress' ? (
          <button onClick={() => onComplete?.(studentProject.id)} className="btn-primary btn-sm flex-1 text-xs">
            ✅ Complete
          </button>
        ) : (
          <div className="flex-1 text-center py-1 text-xs text-green-400 font-bold">
            ✅ Done
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * EmptyState - Shown when no data available
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon || '📭'}</div>
      <h3 className="text-dark-200 font-semibold mb-2">{title || 'Nothing here yet'}</h3>
      <p className="text-dark-500 text-sm max-w-xs mx-auto mb-4">{description}</p>
      {action}
    </div>
  );
}

/**
 * LoadingSpinner
 */
export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} border-2 border-dark-700 border-t-brand-500 rounded-full animate-spin`} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../api/services';
import { StatCard, LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#212529',
      borderColor: '#343a40',
      borderWidth: 1,
      titleColor: '#e9ecef',
      bodyColor: '#adb5bd',
    },
  },
  scales: {
    x: { grid: { color: '#343a40' }, ticks: { color: '#6c757d' } },
    y: { grid: { color: '#343a40' }, ticks: { color: '#6c757d' } },
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await userAPI.getDashboard();
      setData(res.data);
    } catch {
      // data will remain null
    } finally {
      setLoading(false);
    }
  };

  const activityTypeLabels = {
    task_completed: 'Task Completed',
    roadmap_generated: 'Roadmap Generated',
    skill_added: 'Skill Added',
    project_completed: 'Project Completed',
    badge_earned: 'Badge Earned',
    course_completed: 'Course Completed',
  };

  const activityIcons = {
    task_completed: '✅',
    roadmap_generated: '🗺️',
    skill_added: '💡',
    project_completed: '🏗️',
    badge_earned: '🏆',
    course_completed: '🎓',
  };

  const weeklyData = data?.monthlyProgress || [];
  const lineData = {
    labels: weeklyData.map(w => w.week),
    datasets: [{
      data: weeklyData.map(w => w.activities),
      borderColor: '#4c6ef5',
      backgroundColor: 'rgba(76, 110, 245, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#4c6ef5',
      pointRadius: 4,
    }],
  };

  const projectStats = data?.projectStats || [];
  const doughnutData = {
    labels: projectStats.map(p => p.status?.replace('_', ' ')),
    datasets: [{
      data: projectStats.map(p => parseInt(p.count)),
      backgroundColor: ['#4c6ef5', '#10b981', '#6c757d'],
      borderColor: '#141517',
      borderWidth: 2,
    }],
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCard key={i} loading />)}
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  const { stats = {}, profile = {}, roadmap, weeklyProgress = {}, recentActivity = [] } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.firstName}!</span> 👋
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {profile.career_goal_title
              ? `Working towards: ${profile.career_goal_title}`
              : "Let's set up your career goal to get started"}
          </p>
        </div>
        {!profile.career_goal_title && (
          <Link to="/roadmap" className="btn-primary btn-sm flex-shrink-0">
            🗺️ Generate Roadmap
          </Link>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🎯" label="Career Readiness" value={`${stats.careerReadinessScore || 0}%`} color="brand" />
        <StatCard icon="💡" label="Skills Added" value={stats.skillCount || 0} color="blue" />
        <StatCard icon="🏆" label="Badges Earned" value={stats.badgesCount || 0} color="amber" />
        <StatCard icon="🔥" label="Day Streak" value={stats.learningStreak || 0} color="red" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Progress chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">Weekly Activity</h2>
                <p className="section-subtitle">Your learning activity over the past 4 weeks</p>
              </div>
            </div>
            <div className="h-48">
              {weeklyData.length > 0 ? (
                <Line data={lineData} options={chartDefaults} />
              ) : (
                <EmptyState icon="📈" title="No activity yet" description="Complete tasks to see your progress here" />
              )}
            </div>
          </div>

          {/* Active Roadmap */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">Active Roadmap</h2>
                <p className="section-subtitle">{roadmap?.title || 'No active roadmap'}</p>
              </div>
              <Link to="/roadmap" className="btn-ghost btn-sm text-brand-400">
                {roadmap ? 'View →' : 'Create →'}
              </Link>
            </div>

            {roadmap ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">Overall Progress</span>
                  <span className="font-semibold text-dark-100">{roadmap.completion_percentage}%</span>
                </div>
                <div className="progress-bar h-3">
                  <motion.div
                    className="progress-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${roadmap.completion_percentage}%` }}
                    transition={{ duration: 1.2 }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xl font-bold text-dark-50">{roadmap.total_weeks}</p>
                    <p className="text-xs text-dark-500">Weeks</p>
                  </div>
                  <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xl font-bold text-dark-50">{weeklyProgress.completed || 0}</p>
                    <p className="text-xs text-dark-500">Done This Week</p>
                  </div>
                  <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xl font-bold text-dark-50">{weeklyProgress.total || 0}</p>
                    <p className="text-xs text-dark-500">Total Tasks</p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon="🗺️"
                title="No roadmap yet"
                description="Generate your personalized AI career roadmap to get started"
                action={<Link to="/roadmap" className="btn-primary btn-sm">Generate Roadmap</Link>}
              />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Career Goal card */}
          <div className="card p-5">
            <h2 className="section-title mb-3">Career Goal</h2>
            {profile.career_goal_title ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{profile.career_goal_icon || '💻'}</span>
                  <div>
                    <p className="font-semibold text-dark-100">{profile.career_goal_title}</p>
                    <p className="text-xs text-dark-500">Your target career</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-400">Career Readiness</span>
                    <span className="text-xs font-bold text-brand-400">{stats.careerReadinessScore || 0}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div
                      className="progress-fill h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.careerReadinessScore || 0}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-dark-500 text-sm mb-3">No career goal selected</p>
                <Link to="/roadmap" className="btn-primary btn-sm">Set Goal</Link>
              </div>
            )}
          </div>

          {/* Projects chart */}
          {projectStats.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Projects</h2>
              <div className="h-36">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'bottom', labels: { color: '#adb5bd', font: { size: 11 }, padding: 8, boxWidth: 10 } },
                    },
                    cutout: '65%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="section-title mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/skill-gap', icon: '🔍', label: 'Analyze Skill Gap' },
                { to: '/weekly-plan', icon: '📅', label: 'View Weekly Plan' },
                { to: '/resources', icon: '📚', label: 'Browse Resources' },
                { to: '/projects', icon: '🏗️', label: 'Explore Projects' },
              ].map(action => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-800 transition-colors text-sm text-dark-300 hover:text-dark-100"
                >
                  <span>{action.icon}</span>
                  {action.label}
                  <span className="ml-auto text-dark-600">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-800/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center text-lg flex-shrink-0">
                  {activityIcons[activity.activity_type] || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-100 truncate">{activity.activity_title}</p>
                  <p className="text-xs text-dark-500">{activityTypeLabels[activity.activity_type] || activity.activity_type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {activity.xp_earned > 0 && (
                    <p className="text-xs text-brand-400 font-medium">+{activity.xp_earned} XP</p>
                  )}
                  <p className="text-xs text-dark-600">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* XP Display */}
      <div className="card p-5 bg-gradient-to-r from-brand-900/20 to-purple-900/20 border-brand-800/30">
        <div className="flex items-center gap-4">
          <div className="text-4xl">⚡</div>
          <div className="flex-1">
            <p className="text-sm text-dark-400">Total XP Earned</p>
            <p className="text-3xl font-bold text-dark-50">{stats.totalXp?.toLocaleString() || 0}</p>
          </div>
          <Link to="/progress" className="btn-primary btn-sm">View Progress</Link>
        </div>
      </div>
    </div>
  );
}

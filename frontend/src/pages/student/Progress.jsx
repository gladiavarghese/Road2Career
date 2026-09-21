import { useEffect, useState } from 'react';
import { progressAPI, badgeAPI } from '../../api/services';
import { BadgeCard, LoadingSpinner } from '../../components/ui/Cards';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#212529', borderColor: '#343a40', borderWidth: 1, titleColor: '#e9ecef', bodyColor: '#adb5bd' },
  },
  scales: {
    x: { grid: { color: '#343a40' }, ticks: { color: '#6c757d' } },
    y: { grid: { color: '#343a40' }, ticks: { color: '#6c757d' }, beginAtZero: true },
  },
};

export default function Progress() {
  const [data, setData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressRes, studentBadgesRes, allBadgesRes] = await Promise.all([
        progressAPI.getProgress(),
        badgeAPI.getStudentBadges(),
        badgeAPI.getAll(),
      ]);
      setData(progressRes.data);
      setBadges(studentBadgesRes.data || []);
      setAllBadges(allBadgesRes.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const { activityStats = [], weeklyData = [], profileStats = {}, roadmapProgress, projectStats = [] } = data || {};

  const activityMap = activityStats.reduce((acc, a) => { acc[a.activity_type] = parseInt(a.count); return acc; }, {});
  const totalTasks = activityMap['task_completed'] || 0;
  const totalProjects = projectStats.find(p => p.status === 'completed') ? parseInt(projectStats.find(p => p.status === 'completed').count) : 0;

  const lineChartData = {
    labels: weeklyData.map(w => w.week),
    datasets: [{
      label: 'Activities',
      data: weeklyData.map(w => parseInt(w.activities)),
      borderColor: '#4c6ef5',
      backgroundColor: 'rgba(76, 110, 245, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#4c6ef5',
    }],
  };

  const projectDoughnut = {
    labels: projectStats.map(p => p.status?.replace('_', ' ')),
    datasets: [{
      data: projectStats.map(p => parseInt(p.count)),
      backgroundColor: ['#4c6ef5', '#10b981', '#6c757d'],
      borderColor: '#141517',
      borderWidth: 3,
    }],
  };

  const activityBarData = {
    labels: activityStats.map(a => a.activity_type.replace('_', ' ')),
    datasets: [{
      data: activityStats.map(a => parseInt(a.count)),
      backgroundColor: ['#4c6ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
      borderRadius: 6,
    }],
  };

  const earnedBadgeIds = new Set(badges.map(b => b.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl">Progress Tracking</h1>
        <p className="section-subtitle">Your learning journey at a glance</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🎯', label: 'Readiness Score', value: `${profileStats.career_readiness_score || 0}%`, color: 'from-brand-600 to-brand-400' },
          { icon: '🔥', label: 'Day Streak', value: profileStats.learning_streak || 0, color: 'from-red-600 to-orange-400' },
          { icon: '⚡', label: 'Total XP', value: (profileStats.total_xp || 0).toLocaleString(), color: 'from-amber-600 to-yellow-400' },
          { icon: '🏆', label: 'Badges Earned', value: badges.length, color: 'from-purple-600 to-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5 text-center"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl mx-auto mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-dark-50">{stat.value}</p>
            <p className="text-xs text-dark-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="section-title mb-4">Weekly Activity (Last 12 Weeks)</h2>
          <div className="h-56">
            {weeklyData.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500 text-sm">No activity yet</div>
            )}
          </div>
        </div>

        {/* Project stats */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Projects Status</h2>
          {projectStats.length > 0 ? (
            <div className="h-48">
              <Doughnut
                data={projectDoughnut}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: '#adb5bd', font: { size: 11 }, padding: 8, boxWidth: 10 } },
                  },
                  cutout: '60%',
                }}
              />
            </div>
          ) : <p className="text-dark-500 text-sm">No projects started</p>}
        </div>
      </div>

      {/* Activity breakdown bar chart */}
      {activityStats.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Activity Breakdown</h2>
          <div className="h-48">
            <Bar data={activityBarData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </div>
      )}

      {/* Roadmap progress */}
      {roadmapProgress && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Current Roadmap Progress</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <p className="font-medium text-dark-100">{roadmapProgress.title}</p>
              <p className="text-xs text-dark-500 mt-0.5">
                {roadmapProgress.completed_tasks || 0} of {roadmapProgress.total_tasks || 0} tasks completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-400">{roadmapProgress.completion_percentage || 0}%</p>
            </div>
          </div>
          <div className="progress-bar h-3">
            <motion.div
              className="progress-fill h-full"
              initial={{ width: 0 }}
              animate={{ width: `${roadmapProgress.completion_percentage || 0}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="card p-5">
        <h2 className="section-title mb-2">Achievement Badges</h2>
        <p className="text-dark-500 text-sm mb-4">{badges.length} of {allBadges.length} badges earned</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {allBadges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            const earnedBadge = badges.find(b => b.id === badge.id);
            return (
              <div key={badge.id} className={`relative ${!earned ? 'opacity-40 grayscale' : ''}`}>
                <BadgeCard
                  name={badge.name}
                  description={badge.description}
                  icon={badge.icon || '🏆'}
                  color={badge.color || '#4c6ef5'}
                  earnedAt={earnedBadge?.earned_at}
                />
                {!earned && (
                  <div className="absolute inset-0 flex items-end justify-center pb-3">
                    <span className="text-xs text-dark-600">Locked</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

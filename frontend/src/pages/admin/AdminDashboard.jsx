import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/services';
import { StatCard, LoadingSpinner } from '../../components/ui/Cards';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(res => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const { overview = {}, studentGrowth = [], popularCareers = [], popularSkills = [] } = stats || {};

  const growthData = {
    labels: studentGrowth.map(s => s.month),
    datasets: [{
      label: 'New Students',
      data: studentGrowth.map(s => parseInt(s.count)),
      backgroundColor: 'rgba(76, 110, 245, 0.5)',
      borderColor: '#4c6ef5',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and analytics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Students" value={overview.totalStudents || 0} color="blue" />
        <StatCard icon="🟢" label="Active (30 days)" value={overview.activeStudents || 0} color="green" />
        <StatCard icon="🗺️" label="Career Paths" value={overview.careerPaths || 0} color="purple" />
        <StatCard icon="📚" label="Resources" value={overview.resources || 0} color="amber" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💡" label="Skills" value={overview.skills || 0} color="brand" />
        <StatCard icon="🏗️" label="Projects" value={overview.projects || 0} color="green" />
        <StatCard icon="🗺️" label="Roadmaps" value={overview.totalRoadmaps || 0} color="purple" />
        <StatCard icon="✅" label="Completion Rate" value="—" color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Student Growth */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="section-title mb-4">Student Growth (Last 6 Months)</h2>
          <div className="h-52">
            {studentGrowth.length > 0 ? (
              <Bar data={growthData} options={chartOptions} />
            ) : <p className="text-dark-500 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Popular Careers */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Popular Career Paths</h2>
          <div className="space-y-3">
            {popularCareers.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{c.icon || '💼'}</span>
                <div className="flex-1">
                  <p className="text-sm text-dark-200 font-medium">{c.title}</p>
                  <div className="progress-bar h-1.5 mt-1">
                    <div className="progress-fill h-full" style={{ width: `${Math.max(5, (c.student_count / (popularCareers[0]?.student_count || 1)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs text-dark-500 flex-shrink-0">{c.student_count}</span>
              </div>
            ))}
            {popularCareers.length === 0 && <p className="text-dark-500 text-sm">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Popular Skills */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Top Skills Among Students</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {popularSkills.map((s, i) => (
            <div key={i} className="p-3 bg-dark-800/50 rounded-xl text-center">
              <p className="text-sm font-medium text-dark-100">{s.name}</p>
              <p className="text-xs text-dark-500 mt-1">{s.category}</p>
              <p className="text-lg font-bold text-brand-400 mt-1">{s.student_count}</p>
              <p className="text-xs text-dark-600">students</p>
            </div>
          ))}
          {popularSkills.length === 0 && <p className="text-dark-500 text-sm col-span-5">No skills data yet</p>}
        </div>
      </div>
    </div>
  );
}

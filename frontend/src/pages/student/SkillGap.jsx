import { useEffect, useState } from 'react';
import { skillGapAPI } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { Link } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  RiCompass3Line, RiAwardLine, RiRefreshLine, RiMagicLine,
  RiPieChartLine, RiCheckDoubleLine, RiTimeLine
} from 'react-icons/ri';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import SkillAssessmentModal from '../../components/student/SkillAssessmentModal';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function SkillGap() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assessSkill, setAssessSkill] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const [res, historyRes] = await Promise.all([
        skillGapAPI.analyze(),
        skillGapAPI.getHistory(),
      ]);
      setAnalysis(res.data);
      setHistory(historyRes.data || []);
    } catch (err) {
      if (err.message?.includes('career path not set') || err.message?.includes('career path')) {
        setAnalysis(null);
      } else {
        toast.error(err.message || 'Failed to analyze skill gap');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalysis();
    toast.success('Analysis refreshed!');
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const { careerPath, studentSkills = [], analysis: gap = {} } = analysis || {};
  const readinessScore = gap.readinessScore || 0;
  const breakdown = gap.scoreBreakdown || {
    coverageScore: readinessScore,
    proficiencyScore: readinessScore,
    projectScore: readinessScore,
    consistencyScore: readinessScore,
  };

  const scoreColor = readinessScore >= 70 ? 'text-green-400' : readinessScore >= 40 ? 'text-amber-400' : 'text-red-400';

  const radarData = {
    labels: (gap.requiredSkills || []).slice(0, 6),
    datasets: [
      {
        label: 'Required',
        data: (gap.requiredSkills || []).slice(0, 6).map(() => 100),
        backgroundColor: 'rgba(76, 110, 245, 0.1)',
        borderColor: '#4c6ef5',
        borderWidth: 2,
      },
      {
        label: 'Your Skills',
        data: (gap.requiredSkills || []).slice(0, 6).map(skill =>
          (gap.matchedSkills || []).includes(skill) ? 100 : 0
        ),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl">Skill Gap Analysis</h1>
          <p className="section-subtitle">Comprehensive readiness scoring and gap resolution</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/career-goals" className="btn-secondary btn-sm flex items-center gap-1.5">
            <RiCompass3Line /> Change Career Goal
          </Link>
          {analysis && (
            <button onClick={handleRefresh} disabled={refreshing} className="btn-primary btn-sm flex items-center gap-1.5">
              <RiRefreshLine className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {!analysis ? (
        <EmptyState
          icon="🔍"
          title="No career goal set"
          description="Select a target career path to unlock deep skill gap analysis & readiness scoring"
          action={
            <div className="flex gap-3 justify-center">
              <Link to="/career-goals" className="btn-primary">Browse Career Goals</Link>
              <Link to="/skills" className="btn-secondary">Add Skills</Link>
            </div>
          }
        />
      ) : (
        <>
          {/* Score Hero Card */}
          <div className="card p-6 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border-dark-700/60 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Score Circular Gauge */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#212529" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - readinessScore / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={readinessScore >= 70 ? '#10b981' : readinessScore >= 40 ? '#f59e0b' : '#ef4444'} />
                      <stop offset="100%" stopColor={readinessScore >= 70 ? '#34d399' : readinessScore >= 40 ? '#fbbf24' : '#f87171'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold font-display ${scoreColor}`}>{readinessScore}%</span>
                  <span className="text-[11px] text-dark-400 font-medium">Readiness Score</span>
                </div>
              </div>

              {/* Title & Stats */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h2 className="text-xl font-bold text-dark-50">{careerPath?.title}</h2>
                  <Link to="/career-goals" className="text-xs text-brand-400 hover:underline">Switch</Link>
                </div>

                <p className="text-dark-400 text-sm mb-4">
                  {readinessScore >= 70
                    ? "🚀 Excellent! You're ready for entry to mid-level roles in this domain."
                    : readinessScore >= 40
                    ? "📈 Good foundation! Focus on filling critical skill gaps below."
                    : "💪 Early stage setup. Complete assessments & practice projects to boost your readiness."}
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-dark-800/60 px-4 py-2 rounded-xl border border-dark-700/40 text-center">
                    <p className="text-lg font-bold text-green-400">{gap.matchedSkills?.length || 0}</p>
                    <p className="text-[11px] text-dark-400">Matched Skills</p>
                  </div>
                  <div className="bg-dark-800/60 px-4 py-2 rounded-xl border border-dark-700/40 text-center">
                    <p className="text-lg font-bold text-red-400">{gap.missingSkills?.length || 0}</p>
                    <p className="text-[11px] text-dark-400">Missing Skills</p>
                  </div>
                  <div className="bg-dark-800/60 px-4 py-2 rounded-xl border border-dark-700/40 text-center">
                    <p className="text-lg font-bold text-blue-400">{studentSkills.length}</p>
                    <p className="text-[11px] text-dark-400">Logged Skills</p>
                  </div>
                </div>
              </div>

              {/* Radar Chart */}
              {(gap.requiredSkills?.length || 0) > 0 && (
                <div className="w-44 h-44 flex-shrink-0 hidden lg:block">
                  <Radar
                    data={radarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        r: {
                          backgroundColor: 'transparent',
                          grid: { color: '#343a40' },
                          ticks: { display: false },
                          pointLabels: { color: '#6c757d', font: { size: 9 } },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4-Factor Readiness Score Breakdown */}
          <div className="card p-5">
            <h3 className="section-title text-lg mb-4 flex items-center gap-2">
              <RiPieChartLine className="text-brand-400" />
              Career Readiness Factor Breakdown
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Skill Coverage (40%)', val: breakdown.coverageScore, color: 'bg-blue-500', text: 'text-blue-400' },
                { title: 'Skill Depth (30%)', val: breakdown.proficiencyScore, color: 'bg-green-500', text: 'text-green-400' },
                { title: 'Project Experience (15%)', val: breakdown.projectScore, color: 'bg-purple-500', text: 'text-purple-400' },
                { title: 'Learning Consistency (15%)', val: breakdown.consistencyScore, color: 'bg-amber-500', text: 'text-amber-400' },
              ].map(f => (
                <div key={f.title} className="bg-dark-800/40 p-3.5 rounded-xl border border-dark-700/40">
                  <div className="flex items-center justify-between text-xs text-dark-400 mb-1.5 font-medium">
                    <span>{f.title}</span>
                    <span className={`font-bold ${f.text}`}>{f.val}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div
                      className={`h-full rounded-full ${f.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${f.val}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills vs Strengths Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Missing Skills */}
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  Skills to Learn ({gap.missingSkills?.length || 0})
                </span>
                <span className="text-xs text-dark-500 font-normal">Click to Assess</span>
              </h2>

              {gap.missingSkills?.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-4xl">🎉</span>
                  <p className="text-green-400 font-medium mt-2">You possess all required skills for this goal!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(gap.missingSkills || []).map((skillName, i) => (
                    <motion.div
                      key={skillName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/15 rounded-xl hover:border-red-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 text-sm">✗</span>
                        <div>
                          <p className="text-sm text-dark-200 font-medium">{skillName}</p>
                          <p className="text-[11px] text-dark-500">
                            {i < Math.ceil((gap.missingSkills.length || 1) / 2) ? 'Core Required Skill' : 'Recommended Skill'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setAssessSkill({ id: skillName, name: skillName })}
                        className="btn-primary btn-sm py-1 px-3 text-xs flex items-center gap-1"
                      >
                        <RiAwardLine size={14} /> Assess
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths */}
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Your Matched Strengths ({gap.matchedSkills?.length || 0})
              </h2>

              {gap.matchedSkills?.length === 0 ? (
                <EmptyState icon="💡" title="No matched skills" description="Add or assess skills matching this path to build strengths" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(gap.matchedSkills || []).map((skillName, i) => (
                    <motion.div
                      key={skillName}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-2 px-3.5 py-2 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl text-sm font-medium"
                    >
                      <RiCheckDoubleLine className="text-green-400" />
                      <span>{skillName}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Improvement Recommendations */}
          {gap.improvementSuggestions?.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <RiMagicLine className="text-amber-400" /> Actionable Learning Steps
              </h2>
              <div className="grid md:grid-cols-2 gap-3.5">
                {gap.improvementSuggestions.map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5 p-4 bg-dark-800/40 rounded-xl border border-dark-700/30">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-dark-100 text-sm truncate">{item.skill}</p>
                        <span className={`badge text-[10px] uppercase font-bold ${item.priority === 'high' ? 'badge-red' : 'badge-amber'}`}>
                          {item.priority} priority
                        </span>
                      </div>
                      <p className="text-xs text-dark-400 leading-relaxed">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment History Timeline */}
          {history.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <RiTimeLine className="text-brand-400" /> Assessment History Timeline
              </h2>

              <div className="space-y-3">
                {history.slice(0, 5).map((record, i) => {
                  const dateStr = new Date(record.created_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  });

                  return (
                    <div key={record.id || i} className="flex items-center justify-between p-3.5 bg-dark-800/30 rounded-xl border border-dark-700/30 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                          🎯
                        </div>
                        <div>
                          <p className="font-semibold text-dark-100">{record.career_path_title || 'Career Assessment'}</p>
                          <p className="text-dark-500 text-[11px]">{dateStr}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-green-400 text-sm">{record.readiness_score}%</span>
                        <p className="text-dark-500 text-[10px]">Readiness Score</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assessment Modal */}
          <SkillAssessmentModal
            isOpen={Boolean(assessSkill)}
            onClose={() => setAssessSkill(null)}
            skill={assessSkill}
            onAssessmentCompleted={() => fetchAnalysis()}
          />
        </>
      )}
    </div>
  );
}

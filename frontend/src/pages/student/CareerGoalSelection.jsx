import { useEffect, useState } from 'react';
import { careerPathAPI, careerGoalAPI } from '../../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import {
  RiSearchLine, RiCheckLine, RiCompass3Line, RiBriefcaseLine,
  RiMoneyDollarCircleLine, RiRoadMapLine, RiBarChartLine, RiCloseLine,
  RiMagicLine, RiArrowRightLine
} from 'react-icons/ri';
import { LoadingSpinner, EmptyState } from '../../components/ui/Cards';

const DEMAND_COLORS = {
  very_high: 'badge-green',
  high: 'badge-blue',
  medium: 'badge-amber',
  low: 'badge-purple',
};

const DEMAND_LABELS = {
  very_high: 'Very High Demand',
  high: 'High Demand',
  medium: 'Moderate Demand',
  low: 'Emerging',
};

export default function CareerGoalSelection() {
  const navigate = useNavigate();
  const [careerPaths, setCareerPaths] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectingId, setSelectingId] = useState(null);
  const [inspectPath, setInspectPath] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pathsRes, currentRes] = await Promise.all([
        careerPathAPI.getAll(),
        careerGoalAPI.getCurrentGoal(),
      ]);
      setCareerPaths(pathsRes.data || []);
      setCurrentGoal(currentRes.data?.careerGoal || null);
    } catch {
      toast.error('Failed to load career goals');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(careerPaths.map(cp => cp.category).filter(Boolean))];

  const filteredPaths = careerPaths.filter(path => {
    const matchesSearch = !search ||
      path.title.toLowerCase().includes(search.toLowerCase()) ||
      path.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || path.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectGoal = async (pathId, title) => {
    setSelectingId(pathId);
    try {
      const res = await careerGoalAPI.selectGoal(pathId);
      setCurrentGoal(res.data.careerGoal);
      toast.success(`Active career goal set to ${title}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to update career goal');
    } finally {
      setSelectingId(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl flex items-center gap-2">
            <RiCompass3Line className="text-brand-400" />
            Career Goal Selection
          </h1>
          <p className="section-subtitle">
            Choose your target career path to customize your AI roadmap, skill gap analysis, and readiness score
          </p>
        </div>

        {currentGoal && (
          <div className="card p-3 bg-brand-500/10 border-brand-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div className="min-w-0">
              <p className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Active Goal</p>
              <p className="text-sm font-bold text-dark-100 truncate">{currentGoal.title}</p>
            </div>
            <Link to="/skill-gap" className="btn-primary btn-sm ml-2 whitespace-nowrap">
              View Gap Analysis
            </Link>
          </div>
        )}
      </div>

      {/* Search & Categories Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 card p-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input
            type="text"
            placeholder="Search career goals, roles, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Career Paths Grid */}
      {filteredPaths.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No career goals found"
          description="Try adjusting your search filter or category selection"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPaths.map(path => {
            const isSelected = currentGoal?.id === path.id;
            const requiredSkills = path.required_skills || [];

            return (
              <motion.div
                key={path.id}
                layout
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`card p-5 flex flex-col justify-between relative overflow-hidden transition-all ${
                  isSelected ? 'border-brand-500/70 bg-gradient-to-b from-brand-950/20 to-dark-900 shadow-glow' : 'hover:border-dark-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
                    <RiCheckLine size={12} /> Active Goal
                  </div>
                )}

                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700/60 flex items-center justify-center text-2xl flex-shrink-0">
                      {path.icon || '🚀'}
                    </div>
                    <div className="min-w-0 flex-1 pr-12">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-400 block mb-0.5">
                        {path.category}
                      </span>
                      <h3 className="font-bold text-dark-50 text-base leading-snug line-clamp-1">{path.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-dark-400 leading-relaxed line-clamp-3 mb-4">
                    {path.description}
                  </p>

                  {/* Demand & Salary Metrics */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={DEMAND_COLORS[path.job_demand] || 'badge-blue'}>
                      {DEMAND_LABELS[path.job_demand] || 'Active Market'}
                    </span>
                    {path.avg_salary && (
                      <span className="badge-dark text-xs flex items-center gap-1">
                        <RiMoneyDollarCircleLine className="text-green-400" size={14} />
                        {path.avg_salary}
                      </span>
                    )}
                  </div>

                  {/* Required Skills Chips */}
                  <div className="mb-5">
                    <p className="text-[11px] text-dark-500 font-medium uppercase tracking-wider mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredSkills.slice(0, 5).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-dark-800/80 text-dark-300 border border-dark-700/40">
                          {sk}
                        </span>
                      ))}
                      {requiredSkills.length > 5 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-dark-800/50 text-dark-500">
                          +{requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-dark-800/60 flex items-center gap-2">
                  <button
                    onClick={() => setInspectPath(path)}
                    className="btn-ghost btn-sm flex-1 text-dark-300 hover:text-white text-xs"
                  >
                    View Details
                  </button>

                  {isSelected ? (
                    <button
                      onClick={() => navigate('/skill-gap')}
                      className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <RiBarChartLine size={14} /> Analysis
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectGoal(path.id, path.title)}
                      disabled={selectingId === path.id}
                      className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5 text-xs"
                    >
                      {selectingId === path.id ? (
                        'Selecting...'
                      ) : (
                        <>
                          Set Goal <RiArrowRightLine size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Inspect Path Modal */}
      <AnimatePresence>
        {inspectPath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
              onClick={() => setInspectPath(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between p-5 border-b border-dark-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{inspectPath.icon || '🎯'}</span>
                  <div>
                    <h2 className="font-bold text-dark-100 text-lg">{inspectPath.title}</h2>
                    <p className="text-xs text-brand-400 font-medium uppercase tracking-wider">{inspectPath.category}</p>
                  </div>
                </div>
                <button onClick={() => setInspectPath(null)} className="btn-ghost p-1.5 text-dark-400">
                  <RiCloseLine size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs text-dark-400 font-semibold uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-dark-200 leading-relaxed">{inspectPath.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800/40 p-3.5 rounded-xl border border-dark-700/40">
                    <p className="text-xs text-dark-400 flex items-center gap-1">
                      <RiBriefcaseLine className="text-brand-400" /> Market Demand
                    </p>
                    <p className="text-sm font-bold text-dark-100 mt-1 capitalize">
                      {DEMAND_LABELS[inspectPath.job_demand] || inspectPath.job_demand}
                    </p>
                  </div>
                  <div className="bg-dark-800/40 p-3.5 rounded-xl border border-dark-700/40">
                    <p className="text-xs text-dark-400 flex items-center gap-1">
                      <RiMoneyDollarCircleLine className="text-green-400" /> Average Salary
                    </p>
                    <p className="text-sm font-bold text-dark-100 mt-1">
                      {inspectPath.avg_salary || 'Competitive'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-dark-400 font-semibold uppercase tracking-wider mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(inspectPath.required_skills || []).map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg text-xs bg-dark-800 text-dark-200 border border-dark-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-dark-800 bg-dark-900/60 flex items-center justify-end gap-3">
                <button onClick={() => setInspectPath(null)} className="btn-secondary btn-sm">
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectGoal(inspectPath.id, inspectPath.title);
                    setInspectPath(null);
                  }}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <RiMagicLine /> Select as Active Goal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { projectAPI } from '../../api/services';
import { ProjectCard, LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import ProjectDetailsModal from '../../components/projects/ProjectDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiSearchLine, RiRocketLine, RiCheckLine, RiCodeSSlashLine } from 'react-icons/ri';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState('recommended');

  // Modal State
  const [detailsProjectId, setDetailsProjectId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'browse') fetchProjects();
  }, [search, difficulty, activeTab]);

  const fetchData = async () => {
    try {
      const [recRes, studentRes] = await Promise.all([
        projectAPI.getRecommended(),
        projectAPI.getStudentProjects(),
      ]);
      setRecommended(recRes.data || []);
      setStudentProjects(studentRes.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      const res = await projectAPI.getAll(params);
      setProjects(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleStart = async (projectId) => {
    try {
      await projectAPI.start(projectId);
      toast.success('Project started! 🚀');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to start project');
    }
  };

  const handleComplete = async (studentProjId, payload) => {
    try {
      await projectAPI.complete(studentProjId, payload);
      toast.success('🎉 Project completed! +300 XP earned!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to complete project');
    }
  };

  const getStudentProject = (projectId) => studentProjects.find(sp => sp.project_id === projectId);

  const activeStudentProject = detailsProjectId ? studentProjects.find(sp => sp.project_id === detailsProjectId) : null;

  const tabs = [
    { id: 'recommended', label: '⭐ Recommended' },
    { id: 'my-projects', label: '📁 My Projects' },
    { id: 'browse', label: '🔍 Browse All' },
  ];

  const displayProjects = activeTab === 'recommended' ? recommended : activeTab === 'my-projects' ? [] : projects;

  if (loading && activeTab !== 'browse') return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl">Project Recommendation Module</h1>
          <p className="section-subtitle">Build real-world projects tailored to your active career path & skill gaps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-900 border border-dark-800 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-brand-600 text-white shadow-glow' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Browse filters */}
      {activeTab === 'browse' && (
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
            <input
              type="text"
              placeholder="Search projects by title or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input w-auto">
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* My Projects tab */}
      {activeTab === 'my-projects' && (
        <div>
          {studentProjects.length === 0 ? (
            <EmptyState
              icon="📁"
              title="No projects started"
              description="Browse recommended or all projects to start building your portfolio"
              action={<button onClick={() => setActiveTab('recommended')} className="btn-primary">Browse Recommended Projects</button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentProjects.map((sp, i) => (
                <motion.div
                  key={sp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className={`badge ${sp.status === 'completed' ? 'badge-green' : sp.status === 'in_progress' ? 'badge-amber' : 'badge-blue'}`}>
                        {sp.status?.replace('_', ' ')}
                      </span>
                      <span className={`badge ${sp.difficulty === 'beginner' ? 'badge-green' : sp.difficulty === 'intermediate' ? 'badge-amber' : 'badge-red'}`}>
                        {sp.difficulty}
                      </span>
                    </div>
                    <h3
                      onClick={() => setDetailsProjectId(sp.project_id)}
                      className="font-semibold text-dark-100 mb-2 hover:text-brand-400 cursor-pointer"
                    >
                      {sp.title}
                    </h3>
                    <p className="text-xs text-dark-400 line-clamp-2 mb-3">{sp.description}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setDetailsProjectId(sp.project_id)}
                      className="btn-secondary btn-sm flex-1 text-xs"
                    >
                      🔍 Specs & Guide
                    </button>
                    {sp.status === 'in_progress' ? (
                      <button
                        onClick={() => setDetailsProjectId(sp.project_id)}
                        className="btn-primary btn-sm flex-1 text-xs"
                      >
                        ✅ Submit Work
                      </button>
                    ) : (
                      <a
                        href={sp.github_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-sm text-center flex-1 text-xs text-green-400"
                      >
                        🐙 GitHub Link
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project cards grid */}
      {(activeTab === 'recommended' || activeTab === 'browse') && (
        loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card p-5 space-y-3"><div className="skeleton h-24 rounded" /></div>)}
          </div>
        ) : displayProjects.length === 0 ? (
          <EmptyState icon="🏗️" title="No projects found" description="Try a different search query or difficulty filter" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProjects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProjectCard
                  project={p}
                  studentProject={getStudentProject(p.id)}
                  onStart={handleStart}
                  onComplete={() => setDetailsProjectId(p.id)}
                  onViewDetails={(id) => setDetailsProjectId(id)}
                />
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Rich Project Details Modal */}
      <AnimatePresence>
        {detailsProjectId && (
          <ProjectDetailsModal
            projectId={detailsProjectId}
            studentProject={activeStudentProject}
            onClose={() => setDetailsProjectId(null)}
            onStart={handleStart}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

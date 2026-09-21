import { useEffect, useState } from 'react';
import { roadmapAPI, careerPathAPI, resourceAPI, projectAPI } from '../../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiMapLine, RiDeleteBinLine, RiCheckLine, RiArrowDownLine, RiHistoryLine, RiTimeLine, RiBookOpenLine, RiFolderLine } from 'react-icons/ri';
import { EmptyState, LoadingSpinner, ResourceCard, ProjectCard } from '../../components/ui/Cards';
import ProjectDetailsModal from '../../components/projects/ProjectDetailsModal';

const PHASE_COLORS = {
  beginner: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
  intermediate: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  advanced: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-500' },
};

const TASK_ICONS = { topic: '📖', project: '🏗️', quiz: '❓', practice: '💻', revision: '🔄' };

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [careerPaths, setCareerPaths] = useState([]);
  const [roadmapHistory, setRoadmapHistory] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [expandedPhase, setExpandedPhase] = useState('beginner');
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'history'
  const [completingTask, setCompletingTask] = useState(null);
  const [detailsProjectId, setDetailsProjectId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roadmapRes, pathsRes, historyRes, recRes, recProjRes, studProjRes] = await Promise.all([
        roadmapAPI.getCurrent(),
        careerPathAPI.getAll(),
        roadmapAPI.getAll(),
        resourceAPI.getRecommended(),
        projectAPI.getRecommended(),
        projectAPI.getStudentProjects(),
      ]);
      setRoadmap(roadmapRes.data);
      setCareerPaths(pathsRes.data || []);
      setRoadmapHistory(historyRes.data || []);
      setRecommendedResources(recRes.data || []);
      setRecommendedProjects(recProjRes.data || []);
      setStudentProjects(studProjRes.data || []);
    } catch {
      toast.error('Failed to load roadmap data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCareer) { toast.error('Please select a career path'); return; }
    setGenerating(true);
    try {
      await roadmapAPI.generate(selectedCareer);
      toast.success('🗺️ Roadmap generated! Your personalized career timeline is saved.');
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId, taskTitle) => {
    setCompletingTask(taskId);
    try {
      await roadmapAPI.completeTask(taskId);
      toast.success(`✅ "${taskTitle}" completed! +30 XP`);
      await fetchData();
    } catch {
      toast.error('Failed to complete task');
    } finally {
      setCompletingTask(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this saved roadmap history record?')) return;
    try {
      await roadmapAPI.delete(id);
      toast.success('Roadmap history deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete roadmap history');
    }
  };

  const selectHistoryRoadmap = (historyItem) => {
    setRoadmap(historyItem);
    setActiveTab('roadmap');
    toast.success(`Viewing roadmap: ${historyItem.title}`);
  };

  const getStudentProject = (projectId) => studentProjects.find(sp => sp.project_id === projectId);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-2xl">AI Career Roadmap & Timeline</h1>
          <p className="section-subtitle">Your interactive career progression timeline and connected recommendations</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-800/80 p-1.5 rounded-xl border border-dark-700">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap' ? 'bg-brand-500 text-white shadow-glow' : 'text-dark-400 hover:text-white'
            }`}
          >
            <RiTimeLine size={14} /> Active Career Timeline
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-brand-500 text-white shadow-glow' : 'text-dark-400 hover:text-white'
            }`}
          >
            <RiHistoryLine size={14} /> Saved Roadmap History
            {roadmapHistory.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                {roadmapHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* AI Generator Box */}
      <div className="card p-6 bg-gradient-to-r from-brand-900/20 to-purple-900/20 border-brand-800/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="font-semibold text-dark-100">Generate AI Career Roadmap</h2>
            <p className="text-xs text-dark-400">Select your career goal and create a personalized timeline</p>
          </div>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            value={selectedCareer}
            onChange={e => setSelectedCareer(e.target.value)}
            className="input flex-1"
          >
            <option value="">Select career path...</option>
            {careerPaths.map(cp => (
              <option key={cp.id} value={cp.id}>
                {cp.icon} {cp.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedCareer}
            className="btn-primary flex-shrink-0"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <><RiMapLine size={16} /> Generate Roadmap</>
            )}
          </button>
        </div>
        {careerPaths.find(cp => cp.id === selectedCareer) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-dark-400">Required skills:</span>
            {(careerPaths.find(cp => cp.id === selectedCareer)?.required_skills || []).map(skill => (
              <span key={skill} className="px-2 py-0.5 bg-dark-800 text-dark-400 text-xs rounded-full">{skill}</span>
            ))}
          </motion.div>
        )}
      </div>

      {activeTab === 'history' ? (
        /* Saved Roadmap History Section */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-dark-100 text-lg flex items-center gap-2">
              <RiHistoryLine className="text-brand-400" /> Saved Roadmap History
            </h2>
            <span className="text-xs text-dark-400">{roadmapHistory.length} saved roadmaps</span>
          </div>

          {roadmapHistory.length === 0 ? (
            <EmptyState icon="📜" title="No saved roadmap history" description="Generate your first AI roadmap above to save it in your history" />
          ) : (
            <div className="grid gap-3">
              {roadmapHistory.map(r => (
                <div key={r.id} className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center text-2xl flex-shrink-0">
                      {r.career_path_icon || '🗺️'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-100">{r.title}</h3>
                      <p className="text-xs text-dark-400 mt-0.5">
                        📅 {r.total_weeks} weeks • {r.completion_percentage || 0}% completed • Generated on {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className={`badge ${r.is_current ? 'badge-green' : 'badge-blue'}`}>
                      {r.is_current ? 'Active Current' : 'Saved History'}
                    </span>
                    <button
                      onClick={() => selectHistoryRoadmap(r)}
                      className="btn-secondary btn-sm"
                    >
                      View Timeline
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn-ghost p-2 text-dark-500 hover:text-red-400"
                      title="Delete History"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : roadmap ? (
        /* Active Roadmap & Career Timeline Section */
        <div className="space-y-6">
          {/* Timeline Header Card */}
          <div className="card p-6 bg-gradient-to-br from-dark-900 via-dark-850 to-brand-950/40 border border-brand-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl shadow-glow">
                  {roadmap.career_path_icon || '🗺️'}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-semibold">
                    Career Timeline
                  </span>
                  <h2 className="font-bold text-dark-50 text-xl mt-1">{roadmap.title}</h2>
                  <p className="text-dark-400 text-xs mt-0.5 max-w-xl">{roadmap.description}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-extrabold text-brand-400">{roadmap.completion_percentage}%</p>
                <p className="text-xs text-dark-400">Total Completion</p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-5 progress-bar h-3">
              <motion.div
                className="progress-fill h-full"
                initial={{ width: 0 }}
                animate={{ width: `${roadmap.completion_percentage}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>

            {/* Timeline Statistics Bar */}
            <div className="mt-4 pt-4 border-t border-dark-800 flex flex-wrap gap-6 text-xs text-dark-300">
              <span className="flex items-center gap-1.5 font-medium">
                <RiTimeLine className="text-brand-400" size={16} /> Total Timeline: {roadmap.total_weeks} Weeks
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <RiCheckLine className="text-green-400" size={16} /> Tasks Completed: {roadmap.tasks?.filter(t => t.is_completed).length || 0}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-dark-400">
                ⏳ Remaining: {roadmap.tasks?.filter(t => !t.is_completed).length || 0}
              </span>
            </div>
          </div>

          {/* Visual Career Timeline Step Bar */}
          <div className="card p-5">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <RiTimeLine className="text-brand-400" /> Career Milestones Progression
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {(roadmap.phases || []).map((phase, idx) => {
                const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS.beginner;
                const phaseTasksTotal = roadmap.tasks?.filter(t => t.phase === phase.phase).length || 0;
                const phaseTasksDone = roadmap.tasks?.filter(t => t.phase === phase.phase && t.is_completed).length || 0;
                const phasePct = phaseTasksTotal > 0 ? Math.round((phaseTasksDone / phaseTasksTotal) * 100) : 0;

                return (
                  <div
                    key={phase.phase}
                    onClick={() => setExpandedPhase(phase.phase)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      expandedPhase === phase.phase ? `${colors.bg} ${colors.border} ring-1 ring-brand-500/50` : 'bg-dark-850 border-dark-750 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        Phase {idx + 1}: {phase.phase}
                      </span>
                      <span className="text-xs text-dark-400 font-semibold">{phasePct}%</span>
                    </div>

                    <h4 className="font-semibold text-dark-100 text-sm">{phase.title}</h4>
                    <p className="text-[11px] text-dark-400 mt-1">{phase.duration} • {phaseTasksDone}/{phaseTasksTotal} tasks</p>

                    <div className="mt-3 progress-bar h-1.5">
                      <div className={`h-full ${colors.dot}`} style={{ width: `${phasePct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Phase Details & Tasks */}
          <div className="space-y-4">
            <h3 className="font-bold text-dark-200 text-md">Detailed Phase Learning Tasks</h3>

            {(roadmap.phases || []).map((phase) => {
              const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS.beginner;
              const isExpanded = expandedPhase === phase.phase;
              const phaseTasksTotal = roadmap.tasks?.filter(t => t.phase === phase.phase).length || 0;
              const phaseTasksDone = roadmap.tasks?.filter(t => t.phase === phase.phase && t.is_completed).length || 0;

              return (
                <div key={phase.phase} className={`card border ${colors.border}`}>
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                    className={`w-full flex items-center gap-4 p-5 ${colors.bg} rounded-t-xl`}
                  >
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <div className="flex-1 text-left">
                      <h3 className={`font-semibold ${colors.text}`}>{phase.title}</h3>
                      <p className="text-xs text-dark-400">{phase.description} • {phase.duration}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-dark-400">
                      <span>{phaseTasksDone}/{phaseTasksTotal} tasks</span>
                      <RiArrowDownLine
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 space-y-3">
                          {(phase.topics || []).map((topic, i) => {
                            const dbTask = roadmap.tasks?.find(t => t.phase === phase.phase && t.week_number === topic.week);
                            return (
                              <div
                                key={i}
                                className={`p-4 rounded-xl border transition-all ${
                                  dbTask?.is_completed ? 'bg-green-500/5 border-green-500/20' : 'bg-dark-800/30 border-dark-700/30'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-lg mt-0.5">{TASK_ICONS[topic.type] || '📖'}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <span className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded font-mono">Week {topic.week}</span>
                                      <h4 className={`font-medium text-sm ${dbTask?.is_completed ? 'text-dark-400 line-through' : 'text-dark-100'}`}>
                                        {topic.title}
                                      </h4>
                                      {topic.status === 'review' && <span className="badge-amber">Review</span>}
                                    </div>
                                    {topic.tasks?.length > 0 && (
                                      <ul className="space-y-1">
                                        {topic.tasks.map((task, ti) => (
                                          <li key={ti} className="text-xs text-dark-400 flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-dark-600 flex-shrink-0" />
                                            {task}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  {dbTask && !dbTask.is_completed && (
                                    <button
                                      onClick={() => handleCompleteTask(dbTask.id, topic.title)}
                                      disabled={completingTask === dbTask.id}
                                      className="btn-primary btn-sm flex-shrink-0"
                                    >
                                      {completingTask === dbTask.id ? '...' : <><RiCheckLine size={14} /> Done</>}
                                    </button>
                                  )}
                                  {dbTask?.is_completed && (
                                    <span className="text-green-400 text-sm flex-shrink-0 font-bold">✅ Completed</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {phase.resources?.length > 0 && (
                            <div className="mt-4 p-3 bg-dark-800/30 rounded-xl">
                              <p className="text-xs font-medium text-dark-400 mb-2">📚 Phase Learning Resources</p>
                              <div className="flex flex-wrap gap-2">
                                {phase.resources.map(r => (
                                  <span key={r} className="text-xs px-2 py-1 bg-dark-800 text-dark-400 rounded-lg">{r}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Connected Recommendations Section */}
          <div className="space-y-6 pt-6 border-t border-dark-800">
            <div>
              <h3 className="font-bold text-dark-100 text-lg flex items-center gap-2">
                <RiBookOpenLine className="text-brand-400" /> Recommended Learning Resources for this Roadmap
              </h3>
              <p className="text-xs text-dark-400 mt-1">Curated tutorials and docs targeting your missing skills and career goal</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedResources.slice(0, 3).map(r => (
                <ResourceCard key={r.id} {...r} resourceType={r.resource_type} isFree={r.is_free} />
              ))}
            </div>

            <div className="pt-4">
              <h3 className="font-bold text-dark-100 text-lg flex items-center gap-2 mb-1">
                <RiFolderLine className="text-purple-400" /> Connected Portfolio Projects
              </h3>
              <p className="text-xs text-dark-400 mb-4">Hands-on portfolio projects matched to your active career path</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedProjects.slice(0, 3).map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    studentProject={getStudentProject(p.id)}
                    onStart={async (id) => {
                      await projectAPI.start(id);
                      toast.success('Project started! 🚀');
                      fetchData();
                    }}
                    onComplete={() => setDetailsProjectId(p.id)}
                    onViewDetails={(id) => setDetailsProjectId(id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="🗺️"
          title="No roadmap generated yet"
          description="Select a career path above and click 'Generate Roadmap' to create your personalized AI career timeline"
        />
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {detailsProjectId && (
          <ProjectDetailsModal
            projectId={detailsProjectId}
            studentProject={getStudentProject(detailsProjectId)}
            onClose={() => setDetailsProjectId(null)}
            onStart={async (id) => {
              await projectAPI.start(id);
              toast.success('Project started! 🚀');
              fetchData();
            }}
            onComplete={async (spId, payload) => {
              await projectAPI.complete(spId, payload);
              toast.success('🎉 Project completed! +300 XP earned!');
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

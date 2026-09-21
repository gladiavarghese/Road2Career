import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectAPI } from '../../api/services';
import { LoadingSpinner } from '../ui/Cards';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiGitBranchLine,
  RiCodeSSlashLine,
  RiCheckLine,
  RiRocketLine,
  RiExternalLinkLine,
  RiTimerLine,
  RiTrophyLine,
  RiStackLine
} from 'react-icons/ri';

export default function ProjectDetailsModal({ projectId, onClose, studentProject, onStart, onComplete }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'architecture' | 'submit'
  const [githubUrl, setGithubUrl] = useState(studentProject?.github_url || '');
  const [demoUrl, setDemoUrl] = useState(studentProject?.demo_url || '');
  const [notes, setNotes] = useState(studentProject?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getById(projectId);
      setProject(res.data);
    } catch {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!githubUrl) {
      toast.error('Please provide a GitHub Repository URL');
      return;
    }
    setSubmitting(true);
    try {
      await onComplete(studentProject?.id || projectId, { githubUrl, demoUrl, notes });
      onClose();
    } catch {
      toast.error('Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = studentProject?.status === 'completed';
  const isInProgress = studentProject?.status === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card max-w-3xl w-full max-h-[90vh] flex flex-col border border-brand-500/30 overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-dark-750 bg-gradient-to-r from-brand-950/40 via-purple-950/20 to-dark-900 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${
                project?.difficulty === 'beginner' ? 'badge-green' : project?.difficulty === 'intermediate' ? 'badge-amber' : 'badge-red'
              } capitalize`}>
                {project?.difficulty || 'Intermediate'}
              </span>
              <span className="badge-blue capitalize">{project?.category || 'Software Engineering'}</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 text-xs rounded-full flex items-center gap-1 font-semibold">
                <RiTrophyLine size={12} /> +300 XP
              </span>
            </div>
            <h2 className="font-bold text-dark-50 text-xl">{project?.title || 'Project Specs'}</h2>
            <p className="text-xs text-dark-400 mt-1 flex items-center gap-3">
              <span>⏱️ Duration: {project?.estimated_duration || '1-2 weeks'}</span>
              {studentProject && (
                <span className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-amber-400'}`}>
                  • Status: {studentProject.status?.replace('_', ' ')}
                </span>
              )}
            </p>
          </div>

          <button onClick={onClose} className="text-dark-400 hover:text-white p-1 rounded-lg hover:bg-dark-800">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-dark-750 px-6 bg-dark-900/60 text-xs font-semibold text-dark-400 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'border-brand-500 text-brand-400 font-bold' : 'border-transparent hover:text-dark-200'
            }`}
          >
            <RiCodeSSlashLine size={16} /> Specifications & Features
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture' ? 'border-brand-500 text-brand-400 font-bold' : 'border-transparent hover:text-dark-200'
            }`}
          >
            <RiStackLine size={16} /> Architecture & Guide
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'submit' ? 'border-brand-500 text-brand-400 font-bold' : 'border-transparent hover:text-dark-200'
            }`}
          >
            <RiGitBranchLine size={16} /> {isCompleted ? 'Completed Work Links' : 'Submit Project Work'}
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Project Overview</h3>
                <p className="text-sm text-dark-200 leading-relaxed">{project?.description}</p>
              </div>

              {/* Technologies Required */}
              <div>
                <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Recommended Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(project?.technologies || ['React', 'Node.js', 'PostgreSQL']).map(tech => (
                    <span key={tech} className="px-3 py-1 bg-dark-800 border border-dark-700 text-brand-300 text-xs rounded-lg font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Features */}
              <div>
                <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Core Features to Implement</h3>
                <div className="grid gap-2">
                  {(project?.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-dark-800/40 rounded-xl border border-dark-750">
                      <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-dark-200">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'architecture' ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Step-by-Step Architecture Guide</h3>
              <div className="space-y-3">
                {(project?.architectureSteps || []).map((step, idx) => (
                  <div key={idx} className="p-4 bg-dark-800/40 rounded-xl border border-dark-750">
                    <h4 className="font-semibold text-xs text-brand-300 mb-1">{step}</h4>
                    <p className="text-[11px] text-dark-400">Follow standard software practices, write clean modular code, and commit code regularly to Git.</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Submit / View Work Tab */
            <form onSubmit={handleSubmitWork} className="space-y-4">
              <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">
                {isCompleted ? 'Submitted Project Work Details' : 'Submit Project Repository & Live Demo'}
              </h3>

              <div>
                <label className="label">GitHub Repository URL *</label>
                <input
                  type="url"
                  required
                  disabled={isCompleted}
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="input"
                  placeholder="https://github.com/yourusername/project-repo"
                />
              </div>

              <div>
                <label className="label">Live Demo URL (optional)</label>
                <input
                  type="url"
                  disabled={isCompleted}
                  value={demoUrl}
                  onChange={e => setDemoUrl(e.target.value)}
                  className="input"
                  placeholder="https://my-app.vercel.app"
                />
              </div>

              <div>
                <label className="label">Project Notes & Key Learnings (optional)</label>
                <textarea
                  rows={3}
                  disabled={isCompleted}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input resize-none"
                  placeholder="Describe your implementation, architecture decisions, and challenges solved..."
                />
              </div>

              {isCompleted ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 flex items-center justify-between">
                  <span>🎉 Project completed! +300 XP awarded to your portfolio.</span>
                  {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm flex items-center gap-1">
                      <RiExternalLinkLine size={14} /> Open GitHub
                    </a>
                  )}
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : <><RiCheckLine size={16} /> Mark Project Complete (+300 XP)</>}
                </button>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-dark-750 bg-dark-900/80 flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary btn-sm">Close</button>

          {!studentProject ? (
            <button
              onClick={() => {
                onStart(project.id);
                setActiveTab('submit');
              }}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <RiRocketLine size={16} /> Start Building Project
            </button>
          ) : isInProgress ? (
            <button
              onClick={() => setActiveTab('submit')}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <RiGitBranchLine size={16} /> Submit Completed Work
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

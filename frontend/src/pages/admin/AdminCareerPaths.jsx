import { useEffect, useState } from 'react';
import { careerPathAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { RiAddLine, RiEditLine } from 'react-icons/ri';

export default function AdminCareerPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerPathAPI.getAll().then(res => setPaths(res.data || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Career Paths</h1>
          <p className="section-subtitle">{paths.length} career paths configured</p>
        </div>
        <button className="btn-primary btn-sm"><RiAddLine /> Add Career Path</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((cp, i) => (
          <motion.div
            key={cp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-hover p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{cp.icon || '💼'}</span>
              <div className="flex items-center gap-2">
                <span className={`badge ${cp.job_demand === 'very_high' ? 'badge-green' : cp.job_demand === 'high' ? 'badge-blue' : 'badge-amber'}`}>
                  {cp.job_demand?.replace('_', ' ')}
                </span>
                <button className="btn-ghost p-1.5"><RiEditLine size={14} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-dark-100 mb-1">{cp.title}</h3>
            <p className="text-xs text-dark-400 line-clamp-2 mb-3">{cp.description}</p>
            <div className="flex items-center justify-between text-xs text-dark-500">
              <span>📁 {cp.category}</span>
              <span>💰 {cp.avg_salary}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(cp.required_skills || []).slice(0, 4).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-dark-800 text-dark-400 rounded text-xs">{skill}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {paths.length === 0 && <EmptyState icon="🗺️" title="No career paths" description="Add career paths to get started" />}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { projectAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/Cards';
import { RiAddLine } from 'react-icons/ri';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    projectAPI.getAll({ page, limit: 15 })
      .then(res => { setProjects(res.data || []); setPagination(res.pagination || {}); })
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Projects Management</h1>
          <p className="section-subtitle">{pagination.total || 0} projects</p>
        </div>
        <button className="btn-primary btn-sm"><RiAddLine /> Add Project</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Technologies</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td className="font-medium text-dark-100">{p.title}</td>
                    <td className="text-dark-400 text-xs">{p.category}</td>
                    <td><span className={`badge ${p.difficulty === 'beginner' ? 'badge-green' : p.difficulty === 'intermediate' ? 'badge-amber' : 'badge-red'}`}>{p.difficulty}</span></td>
                    <td className="text-dark-400 text-xs">{p.estimated_duration}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(p.technologies || []).slice(0, 3).map(t => (
                          <span key={t} className="px-1.5 py-0.5 bg-dark-800 text-dark-400 rounded text-xs">{t}</span>
                        ))}
                        {(p.technologies || []).length > 3 && <span className="text-xs text-dark-600">+{p.technologies.length - 3}</span>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-dark-400">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

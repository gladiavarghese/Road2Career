import { useEffect, useState } from 'react';
import { resourceAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getAll({ page, limit: 15 });
      setResources(res.data || []);
      setPagination(res.pagination || {});
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await resourceAPI.delete(id);
      toast.success('Resource deleted');
      fetchResources();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Learning Resources</h1>
          <p className="section-subtitle">{pagination.total || 0} total resources</p>
        </div>
        <button className="btn-primary btn-sm"><RiAddLine /> Add Resource</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Free</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 font-medium text-sm line-clamp-1">
                        {r.title}
                      </a>
                    </td>
                    <td><span className="badge-blue">{r.resource_type}</span></td>
                    <td className="text-dark-400 text-xs">{r.category}</td>
                    <td><span className={`badge ${r.difficulty === 'beginner' ? 'badge-green' : r.difficulty === 'intermediate' ? 'badge-amber' : 'badge-red'}`}>{r.difficulty || '—'}</span></td>
                    <td className="text-xs">{r.is_free ? <span className="text-green-400">Free</span> : <span className="text-amber-400">Paid</span>}</td>
                    <td className="text-dark-300">⭐ {r.rating}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-ghost p-1.5"><RiEditLine size={14} /></button>
                        <button onClick={() => handleDelete(r.id)} className="btn-ghost p-1.5 hover:text-red-400"><RiDeleteBinLine size={14} /></button>
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

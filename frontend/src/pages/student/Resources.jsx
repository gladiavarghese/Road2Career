import { useEffect, useState } from 'react';
import { resourceAPI } from '../../api/services';
import { ResourceCard, LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiSearchLine } from 'react-icons/ri';

const TYPES = ['course', 'youtube', 'documentation', 'github', 'platform', 'article'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isFree, setIsFree] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRecommended();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [search, type, difficulty, isFree, page]);

  const fetchRecommended = async () => {
    try {
      const res = await resourceAPI.getRecommended();
      setRecommended(res.data || []);
    } catch {}
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      if (difficulty) params.difficulty = difficulty;
      if (isFree !== '') params.free = isFree;

      const res = await resourceAPI.getAll(params);
      setResources(res.data || []);
      setPagination(res.pagination || {});
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setType('');
    setDifficulty('');
    setIsFree('');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl">Learning Resources</h1>
        <p className="section-subtitle">Curated courses, tutorials, and documentation for your career path</p>
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-dark-100 mb-4">⭐ Recommended For You</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map(r => (
              <ResourceCard key={r.id} {...r} resourceType={r.resource_type} isFree={r.is_free} />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9"
            />
          </div>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="input w-auto">
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} className="input w-auto">
            <option value="">All Levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={isFree} onChange={e => { setIsFree(e.target.value); setPage(1); }} className="input w-auto">
            <option value="">All</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
          {(search || type || difficulty || isFree) && (
            <button onClick={clearFilters} className="btn-ghost btn-sm text-red-400">Clear</button>
          )}
        </div>
      </div>

      {/* Resources grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-6 w-1/3 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState icon="📚" title="No resources found" description="Try adjusting your search or filters" action={<button onClick={clearFilters} className="btn-secondary">Clear Filters</button>} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ResourceCard {...r} resourceType={r.resource_type} isFree={r.is_free} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
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

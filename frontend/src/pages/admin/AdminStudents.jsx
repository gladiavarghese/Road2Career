import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { RiSearchLine, RiUserLine, RiToggleLine } from 'react-icons/ri';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [search, status, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await adminAPI.getStudents(params);
      setStudents(res.data || []);
      setPagination(res.pagination || {});
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await adminAPI.toggleStudentStatus(id);
      toast.success(`Student ${res.data.is_active ? 'activated' : 'deactivated'}`);
      fetchStudents();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Student Management</h1>
          <p className="section-subtitle">{pagination.total || 0} total students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : students.length === 0 ? (
        <EmptyState icon="👥" title="No students found" description="Try different search criteria" />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Career Goal</th>
                  <th>Readiness</th>
                  <th>XP</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <span className="font-medium text-dark-100">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="text-dark-400">{student.email}</td>
                    <td className="text-dark-400 text-xs">{student.career_goal || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 progress-bar h-1.5">
                          <div className="progress-fill h-full" style={{ width: `${student.career_readiness_score || 0}%` }} />
                        </div>
                        <span className="text-xs text-dark-400">{student.career_readiness_score || 0}%</span>
                      </div>
                    </td>
                    <td className="text-brand-400 font-medium">{(student.total_xp || 0).toLocaleString()}</td>
                    <td className="text-dark-500 text-xs">{new Date(student.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${student.is_active ? 'badge-green' : 'badge-red'}`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(student)}
                          className="btn-ghost btn-sm py-1"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student.id, student.is_active)}
                          className={`btn-sm px-2 py-1 rounded text-xs font-medium ${student.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                        >
                          {student.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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

      {/* Student Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
                {selected.first_name?.[0]}{selected.last_name?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-dark-50">{selected.first_name} {selected.last_name}</h3>
                <p className="text-sm text-dark-400">{selected.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'College', value: selected.college || '—' },
                { label: 'Career Goal', value: selected.career_goal || '—' },
                { label: 'Readiness Score', value: `${selected.career_readiness_score || 0}%` },
                { label: 'Total XP', value: (selected.total_xp || 0).toLocaleString() },
                { label: 'Last Login', value: selected.last_login ? new Date(selected.last_login).toLocaleDateString() : 'Never' },
                { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString() },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-dark-400">{item.label}</span>
                  <span className="text-dark-200 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-5">Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

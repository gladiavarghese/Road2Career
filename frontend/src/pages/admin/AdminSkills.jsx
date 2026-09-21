import { useEffect, useState } from 'react';
import { skillAPI, adminAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/Cards';
import { RiAddLine, RiSearchLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const [skillsRes, catsRes] = await Promise.all([
        skillAPI.getAll({ search, limit: 100 }),
        skillAPI.getCategories(),
      ]);
      setSkills(skillsRes.data || []);
      setCategories(catsRes.data || []);
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, [search]);

  const onSubmit = async (data) => {
    try {
      await adminAPI.createSkill(data);
      toast.success('Skill added!');
      reset();
      setShowForm(false);
      fetchSkills();
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    }
  };

  const skillsByCategory = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Skills Management</h1>
          <p className="section-subtitle">{skills.length} skills in platform</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary btn-sm">
          <RiAddLine /> {showForm ? 'Cancel' : 'Add Skill'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-5">
          <h2 className="font-semibold text-dark-100 mb-4">Add New Skill</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Skill Name</label>
              <input {...register('name', { required: true })} className="input" placeholder="e.g., React" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input {...register('slug')} className="input" placeholder="react (auto-generated)" />
            </div>
            <div>
              <label className="label">Category</label>
              <input {...register('category', { required: true })} className="input" placeholder="Frontend / Backend / DevOps..." list="cats" />
              <datalist id="cats">
                {categories.map(c => <option key={c.category} value={c.category} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Description</label>
              <input {...register('description')} className="input" placeholder="Brief description" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, catSkills]) => (
            <div key={category} className="card p-5">
              <h3 className="font-semibold text-dark-200 mb-3">{category} ({catSkills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {catSkills.map(skill => (
                  <span key={skill.id} className="px-3 py-1.5 bg-dark-800 border border-dark-700 text-dark-300 rounded-lg text-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

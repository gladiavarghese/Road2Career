import { useEffect, useState } from 'react';
import { skillAPI } from '../../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBinLine, RiSearchLine, RiCloseLine, RiAwardLine, RiMagicLine, RiCheckDoubleLine } from 'react-icons/ri';
import { EmptyState, LoadingSpinner } from '../../components/ui/Cards';
import SkillAssessmentModal from '../../components/student/SkillAssessmentModal';

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const PROFICIENCY_COLORS = {
  beginner: 'badge-blue',
  intermediate: 'badge-amber',
  advanced: 'badge-green',
  expert: 'badge-purple',
};

export default function Skills() {
  const [studentSkills, setStudentSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [assessmentSkill, setAssessmentSkill] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [proficiency, setProficiency] = useState('beginner');
  const [yearsExp, setYearsExp] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, categoriesRes, studentRes] = await Promise.all([
        skillAPI.getAll({ limit: 100 }),
        skillAPI.getCategories(),
        skillAPI.getStudentSkills(),
      ]);
      setAllSkills(skillsRes.data || []);
      setCategories(categoriesRes.data || []);
      setStudentSkills(studentRes.data || []);
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const addedSkillIds = new Set(studentSkills.map(s => s.skill_id));
  const filteredSkills = allSkills.filter(s =>
    !addedSkillIds.has(s.id) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase())) &&
    (!selectedCategory || s.category === selectedCategory)
  );

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    setAdding(true);
    try {
      await skillAPI.addSkill({ skillId: selectedSkill.id, proficiencyLevel: proficiency, yearsExperience: yearsExp });
      toast.success(`${selectedSkill.name} added!`);
      setShowAddModal(false);
      setSelectedSkill(null);
      setProficiency('beginner');
      setYearsExp(0);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSkill = async (id, name) => {
    if (!confirm(`Remove ${name} from your skills?`)) return;
    try {
      await skillAPI.removeSkill(id);
      toast.success(`${name} removed`);
      fetchData();
    } catch {
      toast.error('Failed to remove skill');
    }
  };

  const handleUpdateProficiency = async (id, level) => {
    try {
      await skillAPI.updateSkill(id, { proficiencyLevel: level });
      toast.success('Skill updated!');
      fetchData();
    } catch {
      toast.error('Failed to update skill');
    }
  };

  const skillsByCategory = studentSkills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">My Skills</h1>
          <p className="section-subtitle">{studentSkills.length} skills in your profile</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <RiAddLine size={18} /> Add Skill
        </button>
      </div>

      {/* My Skills grouped by category */}
      {studentSkills.length === 0 ? (
        <EmptyState
          icon="💡"
          title="No skills added yet"
          description="Add your skills to get personalized career recommendations and skill gap analysis"
          action={<button onClick={() => setShowAddModal(true)} className="btn-primary">Add First Skill</button>}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="card p-5">
              <h3 className="font-semibold text-dark-200 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
                {category}
                <span className="text-dark-600 font-normal text-sm">({skills.length})</span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.map(skill => (
                  <motion.div
                    key={skill.id}
                    layout
                    className="flex items-center gap-3 p-3.5 bg-dark-800/50 rounded-xl border border-dark-700/30 hover:border-dark-600 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-100 truncate">{skill.name}</p>
                      <select
                        value={skill.proficiency_level}
                        onChange={e => handleUpdateProficiency(skill.id, e.target.value)}
                        className="mt-1 text-xs bg-transparent border-0 text-dark-400 focus:outline-none cursor-pointer"
                      >
                        {PROFICIENCY_LEVELS.map(l => (
                          <option key={l} value={l} className="bg-dark-800">{l}</option>
                        ))}
                      </select>
                    </div>
                    <span className={PROFICIENCY_COLORS[skill.proficiency_level] || 'badge-blue'}>
                      {skill.proficiency_level}
                    </span>
                    <button
                      onClick={() => setAssessmentSkill({ id: skill.skill_id || skill.id, name: skill.name })}
                      className="btn-ghost p-1.5 text-dark-400 hover:text-brand-400 opacity-80 group-hover:opacity-100 transition-all"
                      title="Take Skill Assessment"
                    >
                      <RiAwardLine size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveSkill(skill.id, skill.name)}
                      className="text-dark-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove Skill"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Assessment Modal */}
      <SkillAssessmentModal
        isOpen={Boolean(assessmentSkill)}
        onClose={() => setAssessmentSkill(null)}
        skill={assessmentSkill}
        onAssessmentCompleted={() => fetchData()}
      />

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-dark-800">
                <h2 className="font-semibold text-dark-100">Add a Skill</h2>
                <button onClick={() => setShowAddModal(false)} className="btn-ghost p-1.5">
                  <RiCloseLine size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Search */}
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

                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!selectedCategory ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.category}
                      onClick={() => setSelectedCategory(cat.category === selectedCategory ? '' : cat.category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat.category ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>

                {/* Skills list */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredSkills.length === 0 ? (
                    <p className="text-center text-dark-500 text-sm py-4">No skills found</p>
                  ) : (
                    filteredSkills.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${selectedSkill?.id === skill.id ? 'bg-brand-600/20 border border-brand-500/30' : 'hover:bg-dark-800'}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-dark-100 font-medium">{skill.name}</p>
                          <p className="text-xs text-dark-500">{skill.category}</p>
                        </div>
                        {selectedSkill?.id === skill.id && <span className="text-brand-400">✓</span>}
                      </button>
                    ))
                  )}
                </div>

                {selectedSkill && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2 border-t border-dark-800">
                    <p className="text-sm font-medium text-dark-300">Set proficiency for <span className="text-brand-400">{selectedSkill.name}</span></p>
                    <div className="grid grid-cols-4 gap-2">
                      {PROFICIENCY_LEVELS.map(level => (
                        <button
                          key={level}
                          onClick={() => setProficiency(level)}
                          className={`py-2 px-2 rounded-lg text-xs font-medium capitalize transition-colors ${proficiency === level ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="label">Years of Experience: {yearsExp}</label>
                      <input
                        type="range" min="0" max="10" step="0.5"
                        value={yearsExp}
                        onChange={e => setYearsExp(parseFloat(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-5 border-t border-dark-800 flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={handleAddSkill}
                  disabled={!selectedSkill || adding}
                  className="btn-primary flex-1"
                >
                  {adding ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillAPI } from '../../api/services';
import toast from 'react-hot-toast';
import { RiCloseLine, RiCheckLine, RiAwardLine, RiMagicLine } from 'react-icons/ri';

export default function SkillAssessmentModal({ isOpen, onClose, skill, onAssessmentCompleted }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState('mode'); // 'mode' | 'quiz' | 'self' | 'result'
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selfLevel, setSelfLevel] = useState('intermediate');
  const [resultData, setResultData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && skill) {
      fetchQuiz();
      setCurrentStep('mode');
      setSelectedAnswers({});
      setResultData(null);
    }
  }, [isOpen, skill]);

  const fetchQuiz = async () => {
    const targetSkill = skill?.id || skill?.name;
    if (!targetSkill) return;
    setLoading(true);
    try {
      const res = await skillAPI.getQuiz(targetSkill);
      setQuestions(res.data.questions || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCompleteQuiz = async () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) correct++;
    });
    const quizScore = Math.round((correct / (questions.length || 1)) * 100);
    const calculatedLevel = quizScore >= 80 ? 'advanced' : quizScore >= 50 ? 'intermediate' : 'beginner';

    await submitAssessment(calculatedLevel, quizScore);
  };

  const handleCompleteSelfAssessment = async () => {
    const defaultScore = selfLevel === 'expert' ? 95 : selfLevel === 'advanced' ? 85 : selfLevel === 'intermediate' ? 70 : 50;
    await submitAssessment(selfLevel, defaultScore);
  };

  const submitAssessment = async (proficiencyLevel, quizScore) => {
    setSubmitting(true);
    try {
      const targetSkill = skill.id || skill.name;
      const res = await skillAPI.submitAssessment({
        skillId: targetSkill,
        proficiencyLevel,
        quizScore,
      });

      setResultData(res.data);
      setCurrentStep('result');
      toast.success(`Assessment finished for ${skill.name}!`);
      if (onAssessmentCompleted) onAssessmentCompleted(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-800 bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <RiAwardLine size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-dark-100">{skill.name} Assessment</h2>
              <p className="text-xs text-dark-400">Evaluate proficiency & calculate readiness impact</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-dark-400 hover:text-dark-200">
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {currentStep === 'mode' && (
            <div className="space-y-4">
              <p className="text-sm text-dark-300">
                Choose how you want to evaluate your proficiency for <strong className="text-brand-400">{skill.name}</strong>:
              </p>

              <div
                onClick={() => setCurrentStep('quiz')}
                className="card p-4 hover:border-brand-500/50 cursor-pointer transition-all flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <RiMagicLine size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark-100 group-hover:text-brand-400 transition-colors">
                    Take Knowledge Quiz (3 Min)
                  </h4>
                  <p className="text-xs text-dark-400 mt-1">
                    Answer 3 multiple-choice questions to earn a Verified skill badge & bonus XP.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setCurrentStep('self')}
                className="card p-4 hover:border-brand-500/50 cursor-pointer transition-all flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <RiAwardLine size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark-100 group-hover:text-brand-400 transition-colors">
                    Self-Assessment Rating
                  </h4>
                  <p className="text-xs text-dark-400 mt-1">
                    Directly rate your practical experience level (Beginner, Intermediate, Advanced, Expert).
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'quiz' && (
            <div className="space-y-5">
              {loading ? (
                <div className="py-8 text-center text-dark-400">Loading quiz questions...</div>
              ) : questions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-dark-300 text-sm">No quiz questions available for this skill.</p>
                  <button onClick={() => setCurrentStep('self')} className="btn-primary mt-3 btn-sm">
                    Switch to Self-Assessment
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-dark-800/40 p-4 rounded-xl border border-dark-700/40">
                      <p className="text-sm font-medium text-dark-100 mb-3">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                              selectedAnswers[q.id] === oIdx
                                ? 'bg-brand-500/10 border-brand-500/50 text-brand-300 font-medium'
                                : 'bg-dark-900/60 border-dark-800 text-dark-300 hover:border-dark-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              checked={selectedAnswers[q.id] === oIdx}
                              onChange={() => handleSelectAnswer(q.id, oIdx)}
                              className="text-brand-500 focus:ring-brand-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-end gap-3">
                    <button onClick={() => setCurrentStep('mode')} className="btn-secondary btn-sm">
                      Back
                    </button>
                    <button
                      onClick={handleCompleteQuiz}
                      disabled={Object.keys(selectedAnswers).length < questions.length || submitting}
                      className="btn-primary btn-sm"
                    >
                      {submitting ? 'Evaluating...' : 'Submit Quiz'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'self' && (
            <div className="space-y-5">
              <p className="text-sm text-dark-300">Select your proficiency level for {skill.name}:</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { level: 'beginner', title: 'Beginner', desc: 'Familiar with basic syntax and concepts' },
                  { level: 'intermediate', title: 'Intermediate', desc: 'Built simple projects & apps' },
                  { level: 'advanced', title: 'Advanced', desc: 'Comfortable with architecture & optimizations' },
                  { level: 'expert', title: 'Expert', desc: 'Deep mastery, industry best practices' },
                ].map(item => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setSelfLevel(item.level)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selfLevel === item.level
                        ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                        : 'bg-dark-800/40 border-dark-700/50 text-dark-300 hover:border-dark-600'
                    }`}
                  >
                    <div className="font-semibold text-sm capitalize flex items-center justify-between">
                      {item.title}
                      {selfLevel === item.level && <RiCheckLine className="text-brand-400" />}
                    </div>
                    <p className="text-xs text-dark-400 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button onClick={() => setCurrentStep('mode')} className="btn-secondary btn-sm">
                  Back
                </button>
                <button
                  onClick={handleCompleteSelfAssessment}
                  disabled={submitting}
                  className="btn-primary btn-sm"
                >
                  {submitting ? 'Saving...' : 'Confirm Assessment'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'result' && resultData && (
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto text-3xl">
                🏆
              </div>

              <div>
                <h3 className="text-xl font-bold text-dark-50">Assessment Passed!</h3>
                <p className="text-sm text-dark-400 mt-1">
                  Skill <strong className="text-brand-400">{skill.name}</strong> updated to{' '}
                  <span className="capitalize text-green-400 font-semibold">{resultData.skill?.proficiency_level}</span>
                </p>
              </div>

              <div className="bg-dark-800/60 rounded-xl p-4 border border-dark-700/50 flex items-center justify-around">
                <div>
                  <p className="text-xs text-dark-400">Score</p>
                  <p className="text-lg font-bold text-blue-400">{resultData.quizScore}%</p>
                </div>
                <div className="w-px h-8 bg-dark-700" />
                <div>
                  <p className="text-xs text-dark-400">XP Earned</p>
                  <p className="text-lg font-bold text-amber-400">+40 XP</p>
                </div>
                <div className="w-px h-8 bg-dark-700" />
                <div>
                  <p className="text-xs text-dark-400">Career Readiness</p>
                  <p className="text-lg font-bold text-green-400">{resultData.newReadinessScore}%</p>
                </div>
              </div>

              <button onClick={onClose} className="btn-primary w-full py-2.5">
                Done & Continue
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

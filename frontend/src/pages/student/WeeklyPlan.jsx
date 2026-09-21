import { useEffect, useState } from 'react';
import { weeklyPlanAPI, roadmapAPI } from '../../api/services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../../components/ui/Cards';
import { RiCalendarLine, RiCheckLine, RiCloseLine, RiBrainLine, RiQuestionLine, RiAwardLine, RiRefreshLine } from 'react-icons/ri';
import { getQuestionsForTask } from '../../utils/quizGenerator';

const DAY_COLORS = ['bg-brand-500/10', 'bg-purple-500/10', 'bg-green-500/10', 'bg-amber-500/10', 'bg-red-500/10', 'bg-blue-500/10', 'bg-pink-500/10'];
const DAY_BORDER = ['border-brand-500/20', 'border-purple-500/20', 'border-green-500/20', 'border-amber-500/20', 'border-red-500/20', 'border-blue-500/20', 'border-pink-500/20'];

export default function WeeklyPlan() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Modal assessment state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeTaskInfo, setActiveTaskInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [planRes, roadmapRes] = await Promise.all([
        weeklyPlanAPI.getCurrent(),
        roadmapAPI.getCurrent(),
      ]);
      setCurrentPlan(planRes.data);
      setRoadmap(roadmapRes.data);
      if (roadmapRes.data) {
        const today = new Date();
        const roadmapStart = new Date(roadmapRes.data.created_at);
        const weeksPassed = Math.floor((today - roadmapStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
        setSelectedWeek(Math.max(1, Math.min(weeksPassed, roadmapRes.data.total_weeks || 24)));
      }
    } catch {
      toast.error('Failed to load weekly plan');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!roadmap) { toast.error('Please generate a career roadmap first'); return; }
    setGenerating(true);
    try {
      const res = await weeklyPlanAPI.generate({ roadmapId: roadmap.id, weekNumber: selectedWeek });
      setCurrentPlan(res.data);
      toast.success('📅 Weekly plan generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const openAssessmentModal = (dayIndex, taskIndex, taskText, dayType) => {
    const generatedQuestions = getQuestionsForTask(taskText, dayType);
    setActiveTaskInfo({ dayIndex, taskIndex, taskText });
    setQuestions(generatedQuestions);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizModalOpen(true);
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      toast.error('Please answer all 3 assessment questions before submitting!');
      return;
    }

    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        correctCount += 1;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount >= 2) {
      try {
        const targetPlanId = currentPlan?.id || 'current';
        await weeklyPlanAPI.completeTask(targetPlanId, {
          dayIndex: activeTaskInfo.dayIndex,
          taskIndex: activeTaskInfo.taskIndex,
        });
        toast.success(`🎉 Assessment Passed (${correctCount}/3)! Task completed! +20 XP`);
        fetchData();
      } catch (err) {
        toast.error(err?.message || 'Failed to update task completion');
      }
    } else {
      toast.error(`Assessment Failed (${correctCount}/3). Score 2/3 required to pass.`);
    }
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const plan = currentPlan;
  const completionPct = plan ? Math.round((plan.completed_tasks / plan.total_tasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Weekly Learning Planner</h1>
          <p className="section-subtitle">Your structured weekly learning schedule with topic assessment checks</p>
        </div>
      </div>

      {/* Generate Panel */}
      <div className="card p-5 bg-gradient-to-r from-purple-900/20 to-brand-900/20 border-purple-800/30">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <h2 className="font-semibold text-dark-100 mb-1">Generate Weekly Plan</h2>
            <p className="text-xs text-dark-400 mb-3">
              {roadmap ? `Generating from: ${roadmap.title}` : 'Create a roadmap first to generate weekly plans'}
            </p>
            {roadmap && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-dark-300">Week:</label>
                <select
                  value={selectedWeek}
                  onChange={e => setSelectedWeek(parseInt(e.target.value))}
                  className="input py-1.5 w-24"
                >
                  {Array.from({ length: roadmap.total_weeks || 24 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button onClick={handleGenerate} disabled={generating || !roadmap} className="btn-primary flex-shrink-0">
            {generating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <><RiCalendarLine size={16} /> Generate Week {selectedWeek} Plan</>
            )}
          </button>
        </div>
      </div>

      {plan ? (
        <>
          {/* Plan header */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-dark-50">{plan.title}</h2>
                <p className="text-xs text-dark-500 mt-1">
                  {new Date(plan.week_start_date).toLocaleDateString()} — {new Date(plan.week_end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-brand-400">{plan.completed_tasks}/{plan.total_tasks}</p>
                <p className="text-xs text-dark-500">Tasks Complete</p>
              </div>
            </div>

            <div className="progress-bar h-2.5 mb-4">
              <motion.div
                className="progress-fill h-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            {/* Goals */}
            {plan.goals?.length > 0 && (
              <div>
                <p className="text-xs text-dark-400 font-medium mb-2">🎯 Weekly Goals</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {plan.goals.map((goal, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-dark-300">
                      <span className="text-brand-400 mt-0.5">→</span>
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily plans grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(plan.daily_plans || []).map((dayPlan, dayIndex) => {
              return (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  className={`card border ${DAY_BORDER[dayIndex]} overflow-hidden`}
                >
                  <div className={`px-4 py-3 ${DAY_COLORS[dayIndex]} border-b ${DAY_BORDER[dayIndex]}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-100 text-sm">{dayPlan.day}</h3>
                      <span className="text-xs text-dark-400 capitalize">{dayPlan.type}</span>
                    </div>
                    {dayPlan.duration && (
                      <p className="text-xs text-dark-500 mt-0.5">⏱️ {dayPlan.duration}</p>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {(dayPlan.tasks || []).map((task, taskIndex) => {
                      const isCompleted = typeof task === 'object' && task.completed;
                      const taskText = typeof task === 'object' ? task.text : task;
                      return (
                        <div
                          key={taskIndex}
                          className={`flex items-start gap-2 group cursor-pointer p-1.5 rounded-lg hover:bg-dark-800/50 transition-colors`}
                          onClick={() => {
                            if (!isCompleted) {
                              openAssessmentModal(dayIndex, taskIndex, taskText, dayPlan.type);
                            }
                          }}
                        >
                          <button
                            className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-dark-600 group-hover:border-brand-500'
                            }`}
                          >
                            {isCompleted && <RiCheckLine size={10} />}
                          </button>
                          <div className="flex-1">
                            <p className={`text-xs ${isCompleted ? 'text-dark-600 line-through' : 'text-dark-300 font-medium'}`}>
                              {taskText}
                            </p>
                            {!isCompleted && (
                              <span className="text-[10px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5">
                                <RiBrainLine size={10} /> Take Assessment to Complete
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon="📅"
          title="No weekly plan yet"
          description={roadmap ? "Generate your weekly plan above to get a structured daily learning schedule" : "Create a career roadmap first, then generate your weekly plan"}
          action={
            !roadmap ? (
              <a href="/roadmap" className="btn-primary">Generate Roadmap First</a>
            ) : null
          }
        />
      )}

      {/* Task Quiz Assessment Modal */}
      <AnimatePresence>
        {quizModalOpen && activeTaskInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-xl w-full max-h-[90vh] flex flex-col border border-brand-500/30 overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-dark-700 bg-gradient-to-r from-brand-900/30 to-purple-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <RiBrainLine size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider text-brand-400 uppercase">Knowledge Verification Assessment</span>
                    <h3 className="font-bold text-dark-100 text-sm">{activeTaskInfo.taskText}</h3>
                  </div>
                </div>
                <button onClick={() => setQuizModalOpen(false)} className="text-dark-400 hover:text-white p-1">
                  <RiCloseLine size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-6 flex-1">
                {!quizSubmitted ? (
                  <>
                    <p className="text-xs text-dark-300">
                      Answer the following 3 questions to verify your understanding. Score at least <span className="text-brand-400 font-semibold">2/3</span> to mark this task complete and claim <span className="text-green-400 font-semibold">+20 XP</span>.
                    </p>

                    {questions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-dark-800/60 rounded-xl border border-dark-700/50 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded text-xs font-bold">Q{idx + 1}</span>
                          <p className="text-xs font-semibold text-dark-100 flex-1">{q.question}</p>
                        </div>

                        <div className="space-y-2 pl-6">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                                  isSelected
                                    ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-medium'
                                    : 'bg-dark-900/50 border-dark-700/60 text-dark-300 hover:border-dark-500'
                                }`}
                              >
                                <span className="mr-2 font-bold">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  /* Quiz Result Screen */
                  <div className="space-y-5 text-center py-4">
                    {quizScore >= 2 ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto text-3xl">
                          🎉
                        </div>
                        <h3 className="font-bold text-lg text-green-400">Assessment Passed!</h3>
                        <p className="text-xs text-dark-300">
                          You scored <span className="font-bold text-white text-sm">{quizScore}/3</span>! The task has been officially verified and completed.
                        </p>
                        <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-semibold">
                          +20 XP Awarded!
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-3xl">
                          📖
                        </div>
                        <h3 className="font-bold text-lg text-red-400">Needs Study & Review</h3>
                        <p className="text-xs text-dark-300">
                          You scored <span className="font-bold text-white text-sm">{quizScore}/3</span>. You need at least <span className="text-brand-400 font-semibold">2/3</span> to complete this task.
                        </p>
                      </div>
                    )}

                    {/* Explanations */}
                    <div className="text-left space-y-3 pt-3 border-t border-dark-700">
                      <h4 className="text-xs font-bold text-dark-200">Review & Explanations:</h4>
                      {questions.map((q, idx) => {
                        const userAns = userAnswers[q.id];
                        const isCorrect = userAns === q.correct;
                        return (
                          <div key={q.id} className={`p-3 rounded-lg text-xs border ${isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <p className="font-semibold text-dark-100 mb-1">
                              {isCorrect ? '✅' : '❌'} Q{idx + 1}: {q.question}
                            </p>
                            <p className="text-dark-400 mb-1">
                              Your answer: <span className={isCorrect ? 'text-green-400 font-medium' : 'text-red-400 line-through'}>{q.options[userAns]}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-green-400 font-medium mb-1">
                                Correct answer: {q.options[q.correct]}
                              </p>
                            )}
                            <p className="text-[11px] text-dark-500 italic mt-1">{q.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-dark-700 bg-dark-900/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(false)}
                  className="btn-secondary btn-sm"
                >
                  {quizSubmitted && quizScore >= 2 ? 'Close' : 'Cancel'}
                </button>

                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <RiAwardLine size={16} /> Submit Assessment
                  </button>
                ) : quizScore < 2 ? (
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <RiRefreshLine size={16} /> Retry Assessment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuizModalOpen(false)}
                    className="btn-primary btn-sm"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

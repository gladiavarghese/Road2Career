const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const { generateWeeklyPlan } = require('../utils/aiService');

/**
 * POST /api/weekly-plans/generate - Generate a weekly plan
 */
const generatePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { weekNumber, roadmapId } = req.body;

    // Get roadmap
    const roadmapResult = await query('SELECT * FROM roadmaps WHERE id = $1 AND user_id = $2', [roadmapId, userId]);
    if (!roadmapResult.rows.length) throw new AppError('Roadmap not found.', 404);
    const roadmap = roadmapResult.rows[0];

    const planData = generateWeeklyPlan(roadmap, weekNumber);

    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Delete existing plan for this week & user if re-generating
    await query(
      'DELETE FROM weekly_plans WHERE user_id = $1 AND week_number = $2 AND roadmap_id = $3',
      [userId, weekNumber, roadmapId]
    );

    const result = await query(
      `INSERT INTO weekly_plans (user_id, roadmap_id, week_number, week_start_date, week_end_date, title, goals, daily_plans, total_tasks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        roadmapId,
        weekNumber,
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0],
        planData.title,
        planData.goals,
        JSON.stringify(planData.dailyPlans),
        planData.totalTasks,
      ]
    );

    const planRecord = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Weekly plan generated!',
      data: { ...planRecord, planData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/weekly-plans - Get all weekly plans
 */
const getPlans = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM weekly_plans WHERE user_id = $1 ORDER BY week_start_date DESC',
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/weekly-plans/current - Get current week plan
 */
const getCurrentPlan = async (req, res, next) => {
  try {
    let result = await query(
      'SELECT * FROM weekly_plans WHERE user_id = $1 AND week_start_date <= CURRENT_DATE AND week_end_date >= CURRENT_DATE ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );

    if (!result.rows.length) {
      result = await query(
        'SELECT * FROM weekly_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
    }

    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/weekly-plans/:id/complete-task - Complete a task in a weekly plan
 */
const completeTask = async (req, res, next) => {
  try {
    const { dayIndex, taskIndex } = req.body;
    let planId = req.params.id;

    if (!planId || planId === 'undefined' || planId === 'current') {
      const latest = await query(
        'SELECT id FROM weekly_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      if (latest.rows.length) {
        planId = latest.rows[0].id;
      } else {
        throw new AppError('No active weekly plan found.', 404);
      }
    }

    const planResult = await query(
      'SELECT * FROM weekly_plans WHERE id = $1 AND user_id = $2',
      [planId, req.user.id]
    );
    if (!planResult.rows.length) throw new AppError('Plan not found.', 404);

    const plan = planResult.rows[0];
    const dailyPlans = plan.daily_plans || [];

    let taskTitle = 'Weekly task';
    if (dailyPlans[dayIndex] && dailyPlans[dayIndex].tasks && dailyPlans[dayIndex].tasks[taskIndex]) {
      const rawTask = dailyPlans[dayIndex].tasks[taskIndex];
      taskTitle = typeof rawTask === 'object' ? rawTask.text : rawTask;
      dailyPlans[dayIndex].tasks[taskIndex] = {
        text: taskTitle,
        completed: true,
      };
    }

    const completedTasks = (plan.completed_tasks || 0) + 1;
    const status = completedTasks >= (plan.total_tasks || 1) ? 'completed' : 'in_progress';

    await query(
      'UPDATE weekly_plans SET daily_plans = $1, completed_tasks = $2, status = $3 WHERE id = $4',
      [JSON.stringify(dailyPlans), completedTasks, status, planId]
    );

    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'quiz_passed', $2, 20)",
      [req.user.id, `Passed assessment & completed task: ${taskTitle}`]
    );

    res.json({
      success: true,
      message: 'Task marked complete!',
      data: { completedTasks, totalTasks: plan.total_tasks, status },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generatePlan, getPlans, getCurrentPlan, completeTask };

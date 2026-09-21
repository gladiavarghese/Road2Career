const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/skills - List all skills with pagination/search
 */
const getAllSkills = async (req, res, next) => {
  try {
    const { search = '', category = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE s.is_active = true';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (s.name ILIKE $${params.length} OR s.description ILIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      whereClause += ` AND s.category = $${params.length}`;
    }

    params.push(parseInt(limit), offset);
    const result = await query(
      `SELECT s.*, COUNT(*) OVER() as total_count
       FROM skills s ${whereClause}
       ORDER BY s.category, s.name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = result.rows[0]?.total_count || 0;
    res.json({
      success: true,
      data: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(total), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skills/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT category, COUNT(*) as count FROM skills WHERE is_active = true GROUP BY category ORDER BY category');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skills/student - Get student's skills
 */
const getStudentSkills = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ss.id, ss.proficiency_level, ss.years_experience, ss.is_verified, ss.created_at,
       s.id as skill_id, s.name, s.slug, s.category, s.description, s.icon
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.user_id = $1
       ORDER BY s.category, s.name`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/skills/student - Add skill to student
 */
const addStudentSkill = async (req, res, next) => {
  try {
    const { skillId, proficiencyLevel = 'beginner', yearsExperience = 0 } = req.body;

    // Verify skill exists
    const skillCheck = await query('SELECT id, name FROM skills WHERE id = $1 AND is_active = true', [skillId]);
    if (!skillCheck.rows.length) throw new AppError('Skill not found.', 404);

    const result = await query(
      `INSERT INTO student_skills (user_id, skill_id, proficiency_level, years_experience)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, skill_id) DO UPDATE SET proficiency_level = $3, years_experience = $4
       RETURNING *`,
      [req.user.id, skillId, proficiencyLevel, yearsExperience]
    );

    // Log activity
    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'skill_added', $2, 20)",
      [req.user.id, `Added skill: ${skillCheck.rows[0].name}`]
    );

    // Check badge: Skill Builder (5 skills)
    const skillCount = await query('SELECT COUNT(*) as count FROM student_skills WHERE user_id = $1', [req.user.id]);
    if (parseInt(skillCount.rows[0].count) >= 5) {
      const badge = await query("SELECT id FROM badges WHERE requirement_type = 'skills_added' AND requirement_value = 5", []);
      if (badge.rows.length) {
        await query(
          'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.user.id, badge.rows[0].id]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Skill added successfully.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/skills/student/:id - Update student skill
 */
const updateStudentSkill = async (req, res, next) => {
  try {
    const { proficiencyLevel, yearsExperience } = req.body;
    const result = await query(
      'UPDATE student_skills SET proficiency_level = $1, years_experience = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [proficiencyLevel, yearsExperience, req.params.id, req.user.id]
    );
    if (!result.rows.length) throw new AppError('Skill not found.', 404);
    res.json({ success: true, message: 'Skill updated.', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/skills/student/:id - Remove student skill
 */
const removeStudentSkill = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM student_skills WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) throw new AppError('Skill not found.', 404);
    res.json({ success: true, message: 'Skill removed.' });
  } catch (error) {
    next(error);
  }
};

const isUUID = (str) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

/**
 * Helper to find skill by UUID, name, or slug, auto-creating if needed
 */
const findOrCreateSkill = async (skillIdentifier) => {
  if (!skillIdentifier) throw new AppError('Skill identifier is required.', 400);

  let result;
  if (isUUID(skillIdentifier)) {
    result = await query('SELECT * FROM skills WHERE id = $1', [skillIdentifier]);
  } else {
    const cleanName = skillIdentifier.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    result = await query('SELECT * FROM skills WHERE LOWER(name) = LOWER($1) OR slug = $2', [cleanName, slug]);
  }

  if (result.rows.length) {
    return result.rows[0];
  }

  // Auto-create skill if not found
  const cleanName = skillIdentifier.trim();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const insertRes = await query(
    `INSERT INTO skills (name, slug, category, description)
     VALUES ($1, $2, 'General', $3)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [cleanName, slug || 'skill', `Skill assessment for ${cleanName}`]
  );
  return insertRes.rows[0];
};

/**
 * Question generator by skill domain
 */
const getQuestionsForSkill = (skillName) => {
  const name = (skillName || '').toLowerCase();

  if (name.includes('python')) {
    return [
      {
        id: 1,
        question: 'Which of the following data structures in Python is immutable?',
        options: ['List ([...])', 'Tuple ((...))', 'Dictionary ({...})', 'Set ({...})'],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'What is the primary purpose of Python decorators (@decorator)?',
        options: [
          'To format HTML strings',
          'To modify or wrap function behavior without altering source code directly',
          'To force multi-threaded CPU execution',
          'To compile Python code into C binaries'
        ],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'What is a key benefit of List Comprehension in Python?',
        options: [
          'Single-threaded locking mechanism',
          'Concise, readable syntax for creating lists from iterables',
          'Replacing package imports',
          'Automatic variable memory encryption'
        ],
        correctIndex: 1,
      },
    ];
  }

  if (name.includes('javascript') || name.includes('js') || name.includes('typescript')) {
    return [
      {
        id: 1,
        question: 'What is the main difference between `let` and `const` in JavaScript?',
        options: [
          '`let` is function-scoped while `const` is global',
          '`const` prevents variable re-assignment, while `let` permits re-assignment',
          '`const` makes objects completely immutable',
          'No functional difference exists'
        ],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'How does the JavaScript Event Loop handle resolved promises?',
        options: [
          'Places promise callbacks in the Microtask Queue',
          'Blocks single-thread execution completely',
          'Spawns OS background worker threads automatically',
          'Executes callbacks before synchronous code'
        ],
        correctIndex: 0,
      },
      {
        id: 3,
        question: 'What is closure in JavaScript?',
        options: [
          'Closing a DOM modal window',
          'A function bundled together with references to its outer lexical environment',
          'Ending a loop with a return statement',
          'Compressing code for production deployment'
        ],
        correctIndex: 1,
      },
    ];
  }

  if (name.includes('react')) {
    return [
      {
        id: 1,
        question: 'What rule must be followed when invoking React Hooks like useState?',
        options: [
          'Must call them inside loops or conditional blocks',
          'Must call them at the top level of React function components',
          'Must call them inside class constructors',
          'Must return JSX HTML elements'
        ],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'Why is `useCallback` used in React performance optimization?',
        options: [
          'To fetch data from backend servers',
          'To memoize callback function instances between re-renders',
          'To replace global CSS state',
          'To bypass virtual DOM reconciliations'
        ],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'What is the core benefit of the React Virtual DOM?',
        options: [
          'Replaces CSS stylesheets entirely',
          'Minimizes expensive direct real DOM operations by computing diffs',
          'Prevents network request timeouts',
          'Enables server-less computing'
        ],
        correctIndex: 1,
      },
    ];
  }

  if (name.includes('sql') || name.includes('postgres') || name.includes('database') || name.includes('mysql')) {
    return [
      {
        id: 1,
        question: 'What is the main purpose of creating database indexes (e.g., B-Tree index)?',
        options: [
          'To encrypt user data on disk',
          'To speed up data query retrieval at the cost of slight write overhead',
          'To auto-backup tables',
          'To validate SQL syntax'
        ],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'Which SQL clause filters grouped data after aggregate functions (like COUNT, SUM)?',
        options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'What does ACID stand for in relational database transactions?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Asynchronous, Concurrent, Indexed, Distributed',
          'Access, Control, Identity, Data',
          'Automated, Compiled, Integrated, Deployed'
        ],
        correctIndex: 0,
      },
    ];
  }

  if (name.includes('docker') || name.includes('devops') || name.includes('kubernetes') || name.includes('git') || name.includes('linux')) {
    return [
      {
        id: 1,
        question: 'What is a primary advantage of containerization with Docker?',
        options: [
          'Simulating full virtual hardware architectures',
          'Packaging applications and dependencies into predictable, portable containers',
          'Replacing source code repositories',
          'Disabling network security ports'
        ],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'In Git, what is the effect of `git rebase`?',
        options: [
          'Deletes all uncommitted local modifications',
          'Re-applies commits on top of another base tip for a linear history',
          'Creates a zip package of the workspace',
          'Deletes remote repositories'
        ],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'What is Continuous Integration (CI)?',
        options: [
          'Continuously updating local code without committing',
          'Automating the building and testing of code on every commit push',
          'Manual weekend deployments',
          'Writing production release notes'
        ],
        correctIndex: 1,
      },
    ];
  }

  // Default fallback questions for any skill
  return [
    {
      id: 1,
      question: `Which core principle best describes effective application of ${skillName}?`,
      options: [
        `Modularity and clean separation of concerns`,
        `Avoidance of standard architectural patterns`,
        `Writing all logic in a single monolithic block`,
        `Ignoring error handling and logging`
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      question: `What is a common industry best practice when working with ${skillName}?`,
      options: [
        `Hardcoding environment secrets and API keys`,
        `Robust error handling, automated testing, and environment configuration`,
        `Disabling static code analysis tools`,
        `Bypassing version control`
      ],
      correctIndex: 1,
    },
    {
      id: 3,
      question: `How do you optimize performance and maintainability when developing with ${skillName}?`,
      options: [
        `By avoiding code modularization`,
        `By caching frequently accessed data and minimizing redundant operations`,
        `By re-instantiating heavy resources on every function call`,
        `By disabling memory garbage collection`
      ],
      correctIndex: 1,
    },
  ];
};

/**
 * POST /api/skills/assess - Submit skill assessment / quiz result
 */
const submitSkillAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skillId, proficiencyLevel = 'intermediate', quizScore = 80 } = req.body;

    // Verify / resolve skill
    const skill = await findOrCreateSkill(skillId);
    const isVerified = quizScore >= 70;

    // Upsert student skill
    const updatedSkill = await query(
      `INSERT INTO student_skills (user_id, skill_id, proficiency_level, is_verified)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, skill_id) DO UPDATE SET proficiency_level = $3, is_verified = $4
       RETURNING *`,
      [userId, skill.id, proficiencyLevel, isVerified]
    );

    // Get active career goal if set
    const profileRes = await query(
      `SELECT sp.*, cp.id as cp_id, cp.title as cp_title, cp.required_skills
       FROM student_profiles sp
       LEFT JOIN career_paths cp ON sp.career_goal_id = cp.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    const profile = profileRes.rows[0] || {};
    let newReadinessScore = profile.career_readiness_score || 0;
    let scoreBreakdown = null;

    if (profile.cp_id) {
      const skillsRes = await query(
        'SELECT s.name, s.category, ss.proficiency_level FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.user_id = $1',
        [userId]
      );
      const projectsRes = await query('SELECT status FROM student_projects WHERE user_id = $1', [userId]);
      const { analyzeSkillGap } = require('../utils/aiService');

      const careerPath = { id: profile.cp_id, title: profile.cp_title, required_skills: profile.required_skills };
      const analysis = analyzeSkillGap(careerPath, skillsRes.rows, profile, projectsRes.rows);

      newReadinessScore = analysis.readinessScore;
      scoreBreakdown = analysis.scoreBreakdown;

      // Update readiness score in profile
      await query('UPDATE student_profiles SET career_readiness_score = $1 WHERE user_id = $2', [newReadinessScore, userId]);

      // Save skill assessment
      await query(
        `INSERT INTO skill_assessments (user_id, career_path_id, assessment_data, missing_skills, strong_skills, readiness_score)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          profile.cp_id,
          JSON.stringify({ assessedSkill: skill.name, quizScore, proficiencyLevel, scoreBreakdown }),
          JSON.stringify(analysis.missingSkills),
          JSON.stringify(analysis.strengths),
          newReadinessScore,
        ]
      );
    }

    // Award XP
    await query(
      "INSERT INTO progress (user_id, activity_type, activity_title, xp_earned) VALUES ($1, 'quiz_passed', $2, 40)",
      [userId, `Passed assessment for ${skill.name} (${quizScore}%)`]
    );

    res.json({
      success: true,
      message: `Assessment completed for ${skill.name}! Level set to ${proficiencyLevel}.`,
      data: {
        skill: updatedSkill.rows[0],
        quizScore,
        isVerified,
        newReadinessScore,
        scoreBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skills/assessments - Get skill assessment history
 */
const getAssessmentHistory = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT sa.*, cp.title as career_path_title
       FROM skill_assessments sa
       LEFT JOIN career_paths cp ON sa.career_path_id = cp.id
       WHERE sa.user_id = $1
       ORDER BY sa.created_at DESC LIMIT 15`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skills/quiz/:skillId - Get questions for skill assessment
 */
const getSkillQuiz = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const skill = await findOrCreateSkill(skillId);
    const questions = getQuestionsForSkill(skill.name);

    res.json({
      success: true,
      data: {
        skill,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getCategories,
  getStudentSkills,
  addStudentSkill,
  updateStudentSkill,
  removeStudentSkill,
  submitSkillAssessment,
  getAssessmentHistory,
  getSkillQuiz,
};

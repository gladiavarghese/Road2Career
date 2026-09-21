-- ============================================================
-- Road2Career Seed Data
-- ============================================================

-- Admin user (email: admin@road2career.com, password: Admin@123)
INSERT INTO users (id, email, password_hash, role, is_active, is_email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@road2career.com', '$2a$10$Uv3jfbUfCWwNcao8LljdrOFnuWxx9zd7hCEjnXmEvsatimbm6brZy', 'admin', true, true)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Admin profile
INSERT INTO student_profiles (user_id, first_name, last_name, bio) VALUES
('00000000-0000-0000-0000-000000000001', 'System', 'Admin', 'Platform Administrator')
ON CONFLICT (user_id) DO NOTHING;

-- Career Paths
INSERT INTO career_paths (id, title, slug, description, icon, category, avg_salary, job_demand, required_skills) VALUES
('10000000-0000-0000-0000-000000000001', 'Full Stack Web Developer', 'full-stack-web-developer', 'Build complete web applications from frontend to backend with modern technologies.', '💻', 'Software Development', '₹6-20 LPA', 'very_high', '["HTML", "CSS", "JavaScript", "React", "Node.js", "PostgreSQL", "Git"]'),
('10000000-0000-0000-0000-000000000002', 'Data Scientist', 'data-scientist', 'Analyze complex datasets and build ML models to derive business insights.', '📊', 'Data & AI', '₹8-25 LPA', 'very_high', '["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization", "Pandas", "NumPy"]'),
('10000000-0000-0000-0000-000000000003', 'Android Developer', 'android-developer', 'Build native Android mobile applications using Kotlin and Jetpack Compose.', '📱', 'Mobile Development', '₹5-18 LPA', 'high', '["Kotlin", "Android SDK", "Jetpack Compose", "Room Database", "Retrofit", "Firebase"]'),
('10000000-0000-0000-0000-000000000004', 'DevOps Engineer', 'devops-engineer', 'Automate infrastructure, CI/CD pipelines, and cloud deployments.', '⚙️', 'Infrastructure', '₹8-22 LPA', 'very_high', '["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Ansible"]'),
('10000000-0000-0000-0000-000000000005', 'UI/UX Designer', 'ui-ux-designer', 'Design intuitive and beautiful user experiences for web and mobile applications.', '🎨', 'Design', '₹4-15 LPA', 'high', '["Figma", "UI Design", "UX Research", "Prototyping", "Wireframing", "Design Systems"]'),
('10000000-0000-0000-0000-000000000006', 'Machine Learning Engineer', 'machine-learning-engineer', 'Build and deploy production-grade machine learning models and pipelines.', '🤖', 'Data & AI', '₹10-30 LPA', 'very_high', '["Python", "TensorFlow", "PyTorch", "MLOps", "Docker", "SQL", "Statistics"]'),
('10000000-0000-0000-0000-000000000007', 'Cybersecurity Analyst', 'cybersecurity-analyst', 'Protect systems and networks from digital attacks and security vulnerabilities.', '🔐', 'Security', '₹6-20 LPA', 'high', '["Networking", "Linux", "Python", "Ethical Hacking", "SIEM", "Firewalls", "Cryptography"]'),
('10000000-0000-0000-0000-000000000008', 'Cloud Architect', 'cloud-architect', 'Design and manage scalable cloud infrastructure on AWS, Azure, or GCP.', '☁️', 'Infrastructure', '₹12-35 LPA', 'very_high', '["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Microservices", "Security"]')
ON CONFLICT (slug) DO NOTHING;

-- Skills
INSERT INTO skills (name, slug, category, description) VALUES
('HTML', 'html', 'Frontend', 'HyperText Markup Language for web structure'),
('CSS', 'css', 'Frontend', 'Cascading Style Sheets for web styling'),
('JavaScript', 'javascript', 'Programming', 'Core web programming language'),
('TypeScript', 'typescript', 'Programming', 'Typed superset of JavaScript'),
('React', 'react', 'Frontend', 'JavaScript library for building UIs'),
('Vue.js', 'vuejs', 'Frontend', 'Progressive JavaScript framework'),
('Angular', 'angular', 'Frontend', 'TypeScript-based web framework'),
('Node.js', 'nodejs', 'Backend', 'JavaScript runtime for server-side'),
('Express.js', 'expressjs', 'Backend', 'Web framework for Node.js'),
('Python', 'python', 'Programming', 'Versatile high-level programming language'),
('Django', 'django', 'Backend', 'High-level Python web framework'),
('FastAPI', 'fastapi', 'Backend', 'Modern Python API framework'),
('Java', 'java', 'Programming', 'Object-oriented programming language'),
('Spring Boot', 'spring-boot', 'Backend', 'Java-based web framework'),
('Kotlin', 'kotlin', 'Programming', 'Modern JVM language for Android'),
('PostgreSQL', 'postgresql', 'Database', 'Advanced open-source relational database'),
('MySQL', 'mysql', 'Database', 'Popular open-source relational database'),
('MongoDB', 'mongodb', 'Database', 'NoSQL document database'),
('Redis', 'redis', 'Database', 'In-memory data structure store'),
('Docker', 'docker', 'DevOps', 'Containerization platform'),
('Kubernetes', 'kubernetes', 'DevOps', 'Container orchestration system'),
('AWS', 'aws', 'Cloud', 'Amazon Web Services cloud platform'),
('Git', 'git', 'Tools', 'Distributed version control system'),
('Linux', 'linux', 'OS', 'Open-source operating system'),
('Machine Learning', 'machine-learning', 'Data Science', 'AI/ML algorithms and models'),
('TensorFlow', 'tensorflow', 'Data Science', 'ML framework by Google'),
('PyTorch', 'pytorch', 'Data Science', 'ML framework by Meta'),
('Pandas', 'pandas', 'Data Science', 'Python data analysis library'),
('NumPy', 'numpy', 'Data Science', 'Scientific computing for Python'),
('Figma', 'figma', 'Design', 'Collaborative design tool'),
('Tailwind CSS', 'tailwind-css', 'Frontend', 'Utility-first CSS framework'),
('GraphQL', 'graphql', 'API', 'Query language for APIs'),
('REST API', 'rest-api', 'API', 'Representational State Transfer APIs'),
('CI/CD', 'cicd', 'DevOps', 'Continuous Integration/Deployment'),
('Terraform', 'terraform', 'DevOps', 'Infrastructure as code tool')
ON CONFLICT (slug) DO NOTHING;

-- Badges
INSERT INTO badges (name, description, icon, color, badge_type, requirement_type, requirement_value, xp_reward) VALUES
('First Steps', 'Complete your first learning task', '🎯', '#6366f1', 'milestone', 'tasks_completed', 1, 50),
('Skill Builder', 'Add 5 skills to your profile', '🔧', '#8b5cf6', 'skill', 'skills_added', 5, 100),
('Roadmap Pioneer', 'Generate your first career roadmap', '🗺️', '#06b6d4', 'roadmap', 'roadmaps_generated', 1, 150),
('Week Warrior', 'Complete a full weekly plan', '📅', '#10b981', 'weekly', 'weekly_plans_completed', 1, 200),
('Project Builder', 'Complete your first project', '🏗️', '#f59e0b', 'project', 'projects_completed', 1, 300),
('Learning Streak 7', 'Maintain a 7-day learning streak', '🔥', '#ef4444', 'streak', 'learning_streak', 7, 250),
('Learning Streak 30', 'Maintain a 30-day learning streak', '⚡', '#f97316', 'streak', 'learning_streak', 30, 500),
('Course Champion', 'Complete 5 online courses', '🎓', '#3b82f6', 'course', 'courses_completed', 5, 400),
('Top Achiever', 'Reach 80% career readiness score', '🏆', '#fbbf24', 'score', 'readiness_score', 80, 1000),
('Task Master', 'Complete 50 tasks', '✅', '#22c55e', 'task', 'tasks_completed', 50, 600)
ON CONFLICT (name) DO NOTHING;

-- Learning Resources
INSERT INTO learning_resources (title, description, url, resource_type, category, skill_tags, difficulty, duration, is_free, rating) VALUES
('The Odin Project', 'Full stack web development curriculum - completely free and open source', 'https://www.theodinproject.com', 'platform', 'Web Development', '{"HTML","CSS","JavaScript","Node.js","React"}', 'beginner', '9-12 months', true, 4.9),
('freeCodeCamp', 'Learn to code for free with 3000+ hours of interactive curriculum', 'https://www.freecodecamp.org', 'platform', 'Web Development', '{"HTML","CSS","JavaScript","Python","React"}', 'beginner', 'Self-paced', true, 4.8),
('CS50x - Harvard', 'Introduction to Computer Science from Harvard University', 'https://cs50.harvard.edu/x/', 'course', 'Computer Science', '{"Python","C","SQL","JavaScript"}', 'beginner', '12 weeks', true, 4.9),
('Traversy Media - React Crash Course', 'Complete React crash course for beginners on YouTube', 'https://www.youtube.com/c/TraversyMedia', 'youtube', 'Frontend', '{"React","JavaScript"}', 'beginner', '2 hours', true, 4.8),
('MDN Web Docs', 'Official Mozilla documentation for web technologies', 'https://developer.mozilla.org', 'documentation', 'Web Development', '{"HTML","CSS","JavaScript"}', 'beginner', 'Reference', true, 4.9),
('Kaggle Learn', 'Hands-on machine learning and data science micro-courses', 'https://www.kaggle.com/learn', 'platform', 'Data Science', '{"Python","Machine Learning","Pandas","SQL"}', 'beginner', 'Self-paced', true, 4.7),
('TensorFlow Official Docs', 'Official documentation and tutorials for TensorFlow', 'https://www.tensorflow.org/learn', 'documentation', 'Machine Learning', '{"TensorFlow","Python","Machine Learning"}', 'intermediate', 'Reference', true, 4.6),
('Docker Official Docs', 'Official Docker documentation and getting started guide', 'https://docs.docker.com', 'documentation', 'DevOps', '{"Docker","Containers"}', 'intermediate', 'Reference', true, 4.8),
('LeetCode', 'Practice coding problems for technical interviews', 'https://leetcode.com', 'platform', 'Coding Practice', '{"JavaScript","Python","Java","C++"}', 'intermediate', 'Self-paced', false, 4.7),
('GitHub Learning Lab', 'Learn Git and GitHub through interactive courses', 'https://skills.github.com', 'platform', 'Tools', '{"Git","GitHub"}', 'beginner', '2-4 hours', true, 4.6),
('Figma Tutorial - Official', 'Learn Figma from scratch with official tutorials', 'https://www.figma.com/resources/learn-design/', 'documentation', 'Design', '{"Figma","UI Design"}', 'beginner', 'Self-paced', true, 4.7),
('Node.js Official Docs', 'Official Node.js documentation and API reference', 'https://nodejs.org/en/docs/', 'documentation', 'Backend', '{"Node.js","JavaScript"}', 'intermediate', 'Reference', true, 4.7),
('PostgreSQL Tutorial', 'Comprehensive PostgreSQL tutorial for beginners', 'https://www.postgresqltutorial.com', 'documentation', 'Database', '{"PostgreSQL","SQL"}', 'beginner', '20 hours', true, 4.6),
('Kubernetes Official Docs', 'Official Kubernetes documentation', 'https://kubernetes.io/docs/', 'documentation', 'DevOps', '{"Kubernetes","Docker"}', 'advanced', 'Reference', true, 4.7),
('FastAI - Practical Deep Learning', 'Practical deep learning course for coders', 'https://www.fast.ai', 'course', 'Machine Learning', '{"Python","PyTorch","Machine Learning"}', 'intermediate', '8 weeks', true, 4.9)
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO projects (title, description, technologies, features, learning_outcomes, difficulty, estimated_duration, category, career_path_tags) VALUES
('Personal Portfolio Website', 'Build a responsive personal portfolio website showcasing your projects and skills', '{"HTML","CSS","JavaScript","React"}', '{"Responsive design","Project showcase","Contact form","Dark mode","Animations"}', '{"HTML/CSS mastery","JavaScript DOM","Responsive design","React basics"}', 'beginner', '1-2 weeks', 'Web Development', '{"full-stack-web-developer","ui-ux-designer"}'),
('Todo App with Authentication', 'Full-stack todo application with user authentication, CRUD operations, and local storage', '{"React","Node.js","Express","PostgreSQL","JWT"}', '{"User registration/login","Create/edit/delete todos","Categories","Due dates","Search/filter"}', '{"Full-stack development","JWT auth","REST APIs","Database design","React state management"}', 'beginner', '2-3 weeks', 'Web Development', '{"full-stack-web-developer"}'),
('E-Commerce Platform', 'Complete e-commerce website with product catalog, cart, checkout, and payment integration', '{"React","Node.js","PostgreSQL","Stripe","Redux"}', '{"Product catalog","Shopping cart","User auth","Payment gateway","Order management","Admin panel"}', '{"Advanced React","State management","Payment integration","Database relations","REST APIs"}', 'intermediate', '4-6 weeks', 'Web Development', '{"full-stack-web-developer"}'),
('Data Analysis Dashboard', 'Interactive data visualization dashboard using Python and popular viz libraries', '{"Python","Pandas","Matplotlib","Seaborn","Streamlit"}', '{"Data loading","Interactive charts","Statistical analysis","Export reports","Filters"}', '{"Python data analysis","Pandas","Data visualization","Statistical thinking","Dashboard design"}', 'beginner', '2-3 weeks', 'Data Science', '{"data-scientist"}'),
('Machine Learning House Price Predictor', 'Build ML model to predict house prices using regression algorithms', '{"Python","scikit-learn","Pandas","NumPy","Flask"}', '{"Data preprocessing","Feature engineering","Model training","Model evaluation","API deployment"}', '{"Regression algorithms","Feature engineering","Model evaluation","ML deployment","API design"}', 'intermediate', '3-4 weeks', 'Machine Learning', '{"data-scientist","machine-learning-engineer"}'),
('Android Weather App', 'Native Android weather application using OpenWeather API', '{"Kotlin","Android SDK","Retrofit","Room","Jetpack Compose"}', '{"Current weather","5-day forecast","Location detection","Search cities","Offline caching"}', '{"Kotlin programming","Android architecture","API integration","Room database","Jetpack Compose"}', 'intermediate', '3-4 weeks', 'Android', '{"android-developer"}'),
('CI/CD Pipeline Setup', 'Set up complete CI/CD pipeline for a web application using GitHub Actions and Docker', '{"Docker","GitHub Actions","Nginx","Linux","AWS"}', '{"Automated testing","Docker containerization","Deployment automation","Environment management","Monitoring"}', '{"Docker","CI/CD concepts","GitHub Actions","Linux commands","Cloud deployment"}', 'intermediate', '2-3 weeks', 'DevOps', '{"devops-engineer"}'),
('Real-time Chat Application', 'Build a real-time chat app with WebSockets, rooms, and message history', '{"React","Node.js","Socket.io","PostgreSQL","Redis"}', '{"Real-time messaging","Chat rooms","User authentication","Message history","Online status","File sharing"}', '{"WebSockets","Real-time systems","Redis caching","Advanced Node.js","Complex React"}', 'advanced', '4-6 weeks', 'Web Development', '{"full-stack-web-developer"}'),
('Sentiment Analysis API', 'Build NLP-based sentiment analysis API for text classification', '{"Python","FastAPI","NLTK","scikit-learn","Docker"}', '{"Text classification","REST API","Batch processing","Model serving","Rate limiting"}', '{"NLP fundamentals","Text preprocessing","API design","Model serving","FastAPI"}', 'intermediate', '3-4 weeks', 'Machine Learning', '{"machine-learning-engineer","data-scientist"}'),
('Design System & Component Library', 'Create a complete design system with reusable UI components using Figma + React', '{"Figma","React","Storybook","Tailwind CSS","TypeScript"}', '{"Color system","Typography","Component variants","Documentation","Accessibility"}', '{"Design systems","Component architecture","Storybook","Accessibility","Design-to-code"}', 'intermediate', '4-5 weeks', 'Design', '{"ui-ux-designer","full-stack-web-developer"}')
ON CONFLICT DO NOTHING;

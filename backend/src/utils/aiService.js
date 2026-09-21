/**
 * AI Career Roadmap Generation Service
 * Uses sophisticated rule-based template engine to generate
 * personalized career roadmaps based on career goal + current skills
 */

const ROADMAP_TEMPLATES = {
  'full-stack-web-developer': {
    title: 'Full Stack Web Developer Roadmap',
    totalWeeks: 24,
    phases: [
      {
        phase: 'beginner',
        title: 'Foundation Phase',
        duration: '8 weeks',
        description: 'Build strong fundamentals in web technologies',
        weeks: [1, 8],
        topics: [
          { week: 1, title: 'HTML5 & Semantic Markup', tasks: ['HTML structure', 'Semantic elements', 'Forms & validation', 'Accessibility basics'], type: 'topic' },
          { week: 2, title: 'CSS3 & Modern Styling', tasks: ['Box model', 'Flexbox', 'CSS Grid', 'Responsive design', 'CSS variables'], type: 'topic' },
          { week: 3, title: 'JavaScript Fundamentals', tasks: ['Variables & data types', 'Functions', 'DOM manipulation', 'Events', 'ES6+ features'], type: 'topic' },
          { week: 4, title: 'JavaScript Advanced', tasks: ['Async/Await', 'Promises', 'Fetch API', 'Error handling', 'Modules'], type: 'topic' },
          { week: 5, title: 'Version Control with Git', tasks: ['Git basics', 'Branching', 'GitHub workflow', 'Collaboration', 'Pull requests'], type: 'topic' },
          { week: 6, title: 'Mini Project: Portfolio Website', tasks: ['Design portfolio layout', 'Build with HTML/CSS/JS', 'Add animations', 'Deploy to GitHub Pages'], type: 'project' },
          { week: 7, title: 'React.js Fundamentals', tasks: ['Components', 'Props & State', 'useState & useEffect', 'Event handling', 'Conditional rendering'], type: 'topic' },
          { week: 8, title: 'React Advanced Concepts', tasks: ['React Router', 'Context API', 'Custom hooks', 'Performance optimization'], type: 'topic' },
        ],
        resources: ['MDN Web Docs', 'freeCodeCamp', 'The Odin Project'],
        codingPractice: ['Build 5 responsive layouts', 'Solve 10 JS challenges on LeetCode', 'Create 3 React components'],
        miniProject: 'Personal Portfolio Website',
      },
      {
        phase: 'intermediate',
        title: 'Backend & Database Phase',
        duration: '10 weeks',
        description: 'Learn server-side development and database management',
        weeks: [9, 18],
        topics: [
          { week: 9, title: 'Node.js Fundamentals', tasks: ['Node.js runtime', 'File system', 'HTTP module', 'NPM ecosystem', 'Environment variables'], type: 'topic' },
          { week: 10, title: 'Express.js Framework', tasks: ['Routing', 'Middleware', 'Error handling', 'Request/Response', 'REST principles'], type: 'topic' },
          { week: 11, title: 'Database Design with PostgreSQL', tasks: ['Relational concepts', 'SQL queries', 'Joins', 'Indexes', 'Transactions'], type: 'topic' },
          { week: 12, title: 'Authentication & Security', tasks: ['JWT tokens', 'bcrypt hashing', 'CORS', 'Rate limiting', 'Input validation'], type: 'topic' },
          { week: 13, title: 'REST API Development', tasks: ['CRUD operations', 'Pagination', 'Filtering', 'Error responses', 'API documentation'], type: 'topic' },
          { week: 14, title: 'Mini Project: Backend API', tasks: ['Design database schema', 'Build REST API', 'Add authentication', 'Test with Postman'], type: 'project' },
          { week: 15, title: 'Full Stack Integration', tasks: ['Connect React to API', 'Axios/Fetch', 'State management', 'Loading states', 'Error handling'], type: 'topic' },
          { week: 16, title: 'Advanced React Patterns', tasks: ['Redux Toolkit', 'React Query', 'Custom hooks patterns', 'Code splitting', 'Lazy loading'], type: 'topic' },
          { week: 17, title: 'File Upload & Cloud Storage', tasks: ['Multer', 'Image processing', 'Cloud storage basics', 'CDN concepts'], type: 'topic' },
          { week: 18, title: 'Project: Full Stack Todo App', tasks: ['Design UI/UX', 'Build frontend', 'Build backend', 'Deploy to cloud'], type: 'project' },
        ],
        resources: ['Node.js Official Docs', 'PostgreSQL Tutorial', 'Traversy Media'],
        codingPractice: ['Build 3 REST APIs', 'Solve 20 SQL challenges', 'Complete 15 LeetCode problems'],
        miniProject: 'Full Stack Authentication System',
      },
      {
        phase: 'advanced',
        title: 'Production & Deployment Phase',
        duration: '6 weeks',
        description: 'Learn deployment, DevOps basics, and advanced patterns',
        weeks: [19, 24],
        topics: [
          { week: 19, title: 'Docker & Containerization', tasks: ['Docker basics', 'Dockerfile', 'Docker Compose', 'Multi-container apps', 'Volumes'], type: 'topic' },
          { week: 20, title: 'Cloud Deployment', tasks: ['AWS/Railway/Render', 'Environment management', 'Process management', 'SSL/HTTPS', 'Domain setup'], type: 'topic' },
          { week: 21, title: 'Performance Optimization', tasks: ['Database indexes', 'Caching with Redis', 'Code optimization', 'Bundle analysis', 'Lighthouse audit'], type: 'topic' },
          { week: 22, title: 'Testing & Quality', tasks: ['Unit testing', 'Integration testing', 'API testing', 'Frontend testing', 'CI/CD pipeline'], type: 'topic' },
          { week: 23, title: 'WebSockets & Real-time', tasks: ['Socket.io', 'Real-time events', 'Chat functionality', 'Live updates'], type: 'topic' },
          { week: 24, title: 'Capstone Project: E-Commerce Platform', tasks: ['Full planning', 'Complete development', 'Testing', 'Deployment', 'Documentation'], type: 'project' },
        ],
        resources: ['Docker Official Docs', 'AWS Free Tier Guide'],
        codingPractice: ['Deploy 2 projects to cloud', 'Set up CI/CD pipeline', 'Implement caching'],
        miniProject: 'E-Commerce Platform with Payment Integration',
      },
    ],
  },
  'data-scientist': {
    title: 'Data Scientist Roadmap',
    totalWeeks: 28,
    phases: [
      {
        phase: 'beginner',
        title: 'Python & Statistics Foundation',
        duration: '10 weeks',
        description: 'Master Python programming and statistical fundamentals',
        weeks: [1, 10],
        topics: [
          { week: 1, title: 'Python Programming Basics', tasks: ['Syntax & data types', 'Control flow', 'Functions', 'OOP basics', 'File handling'], type: 'topic' },
          { week: 2, title: 'Python for Data Science', tasks: ['NumPy arrays', 'Pandas DataFrames', 'Data cleaning', 'Missing values', 'Data types'], type: 'topic' },
          { week: 3, title: 'Statistics Fundamentals', tasks: ['Descriptive statistics', 'Probability', 'Distributions', 'Hypothesis testing', 'Correlation'], type: 'topic' },
          { week: 4, title: 'Data Visualization', tasks: ['Matplotlib', 'Seaborn', 'Plotly', 'Chart types', 'Dashboard design'], type: 'topic' },
          { week: 5, title: 'SQL for Data Analysis', tasks: ['SELECT queries', 'Joins', 'Aggregations', 'Window functions', 'CTEs'], type: 'topic' },
          { week: 6, title: 'Exploratory Data Analysis', tasks: ['EDA workflow', 'Feature distributions', 'Correlation matrix', 'Outlier detection', 'Pattern identification'], type: 'topic' },
          { week: 7, title: 'Data Cleaning & Preprocessing', tasks: ['Handling missing data', 'Encoding categories', 'Feature scaling', 'Outlier treatment', 'Data pipelines'], type: 'topic' },
          { week: 8, title: 'Mini Project: EDA on Real Dataset', tasks: ['Choose Kaggle dataset', 'Clean and explore data', 'Create visualizations', 'Write insights report'], type: 'project' },
          { week: 9, title: 'Introduction to Machine Learning', tasks: ['ML concepts', 'Supervised vs Unsupervised', 'Train/Test split', 'Model evaluation', 'Scikit-learn'], type: 'topic' },
          { week: 10, title: 'Linear & Logistic Regression', tasks: ['Linear regression', 'Logistic regression', 'Regularization', 'Feature selection', 'Cross-validation'], type: 'topic' },
        ],
        resources: ['Kaggle Learn', 'CS50x Harvard', 'freeCodeCamp Python'],
        codingPractice: ['Complete 5 Kaggle notebooks', 'Solve 10 SQL challenges', 'Build 3 EDA reports'],
        miniProject: 'Sales Data Analysis Dashboard',
      },
      {
        phase: 'intermediate',
        title: 'Machine Learning & Deep Learning',
        duration: '12 weeks',
        description: 'Build and evaluate machine learning models',
        weeks: [11, 22],
        topics: [
          { week: 11, title: 'Decision Trees & Ensemble Methods', tasks: ['Decision Trees', 'Random Forest', 'Gradient Boosting', 'XGBoost', 'Feature importance'], type: 'topic' },
          { week: 12, title: 'Clustering & Dimensionality Reduction', tasks: ['K-Means', 'DBSCAN', 'PCA', 't-SNE', 'UMAP'], type: 'topic' },
          { week: 13, title: 'Natural Language Processing', tasks: ['Text preprocessing', 'TF-IDF', 'Word embeddings', 'Sentiment analysis', 'NLTK/spaCy'], type: 'topic' },
          { week: 14, title: 'Neural Networks Fundamentals', tasks: ['Perceptron', 'Backpropagation', 'Activation functions', 'Loss functions', 'Optimizers'], type: 'topic' },
          { week: 15, title: 'Deep Learning with TensorFlow/Keras', tasks: ['Sequential models', 'Conv layers', 'Dropout', 'Batch normalization', 'Callbacks'], type: 'topic' },
          { week: 16, title: 'CNN for Computer Vision', tasks: ['Image classification', 'Transfer learning', 'Data augmentation', 'Fine-tuning', 'Object detection'], type: 'topic' },
          { week: 17, title: 'RNN & Time Series', tasks: ['LSTM', 'GRU', 'Time series forecasting', 'Sequence modeling', 'Attention mechanisms'], type: 'topic' },
          { week: 18, title: 'Project: ML Model for Real Problem', tasks: ['Problem definition', 'Data collection', 'Model building', 'Evaluation', 'Report'], type: 'project' },
          { week: 19, title: 'Feature Engineering', tasks: ['Domain knowledge', 'Interaction features', 'Polynomial features', 'Target encoding', 'Feature stores'], type: 'topic' },
          { week: 20, title: 'Model Evaluation & Selection', tasks: ['Metrics', 'ROC/AUC', 'Confusion matrix', 'Bias-variance tradeoff', 'Hyperparameter tuning'], type: 'topic' },
          { week: 21, title: 'Big Data Tools', tasks: ['PySpark basics', 'Databricks', 'Data pipelines', 'ETL processes', 'Data warehousing concepts'], type: 'topic' },
          { week: 22, title: 'Capstone ML Project', tasks: ['End-to-end ML project', 'Data collection', 'Feature engineering', 'Model deployment', 'Monitoring'], type: 'project' },
        ],
        resources: ['TensorFlow Official Docs', 'fast.ai Course', 'Kaggle Competitions'],
        codingPractice: ['Participate in 2 Kaggle competitions', 'Build 5 ML models', 'Implement 3 deep learning projects'],
        miniProject: 'House Price Prediction API',
      },
      {
        phase: 'advanced',
        title: 'MLOps & Production',
        duration: '6 weeks',
        description: 'Deploy and monitor ML models in production',
        weeks: [23, 28],
        topics: [
          { week: 23, title: 'ML Model Deployment', tasks: ['Flask/FastAPI', 'REST API for models', 'Containerization', 'Cloud deployment', 'A/B testing'], type: 'topic' },
          { week: 24, title: 'MLOps Fundamentals', tasks: ['MLflow', 'Model versioning', 'Experiment tracking', 'Pipeline automation', 'CI/CD for ML'], type: 'topic' },
          { week: 25, title: 'Data Engineering', tasks: ['Airflow basics', 'Data pipelines', 'Feature stores', 'Data quality', 'Monitoring'], type: 'topic' },
          { week: 26, title: 'Advanced Statistics & Causal Inference', tasks: ['A/B testing', 'Bayesian methods', 'Causal ML', 'Uncertainty quantification'], type: 'topic' },
          { week: 27, title: 'Business Intelligence & Dashboards', tasks: ['Tableau/Power BI', 'Executive reporting', 'KPI definition', 'Storytelling with data'], type: 'topic' },
          { week: 28, title: 'Final Capstone: End-to-End Data Product', tasks: ['Data collection & pipeline', 'ML model', 'API deployment', 'Dashboard', 'Presentation'], type: 'project' },
        ],
        resources: ['MLflow Documentation', 'Airflow Docs', 'Google Cloud ML'],
        codingPractice: ['Deploy 2 ML models to production', 'Build data pipeline', 'Create BI dashboard'],
        miniProject: 'End-to-End ML Product with Dashboard',
      },
    ],
  },
  'android-developer': {
    title: 'Android Developer Roadmap',
    totalWeeks: 22,
    phases: [
      {
        phase: 'beginner',
        title: 'Kotlin & Android Basics',
        duration: '8 weeks',
        description: 'Learn Kotlin programming and Android development fundamentals',
        weeks: [1, 8],
        topics: [
          { week: 1, title: 'Kotlin Fundamentals', tasks: ['Variables & types', 'Functions', 'Classes & OOP', 'Null safety', 'Collections'], type: 'topic' },
          { week: 2, title: 'Android Studio Setup', tasks: ['IDE setup', 'Project structure', 'Gradle basics', 'Emulator setup', 'First app'], type: 'topic' },
          { week: 3, title: 'UI with XML Layouts', tasks: ['Views & ViewGroups', 'LinearLayout', 'ConstraintLayout', 'RecyclerView', 'Material Design'], type: 'topic' },
          { week: 4, title: 'Activities & Lifecycle', tasks: ['Activity lifecycle', 'Intents', 'Navigation', 'Back stack', 'Fragments'], type: 'topic' },
          { week: 5, title: 'Jetpack Compose Basics', tasks: ['Composable functions', 'State management', 'Layouts', 'Modifiers', 'Theming'], type: 'topic' },
          { week: 6, title: 'Data Storage', tasks: ['SharedPreferences', 'Room Database', 'DataStore', 'File storage', 'SQLite basics'], type: 'topic' },
          { week: 7, title: 'Networking with Retrofit', tasks: ['HTTP concepts', 'Retrofit setup', 'API calls', 'JSON parsing', 'Error handling'], type: 'topic' },
          { week: 8, title: 'Mini Project: Weather App', tasks: ['UI design', 'API integration', 'Data parsing', 'Error states', 'Offline caching'], type: 'project' },
        ],
        resources: ['Android Developer Docs', 'Kotlin Official Docs'],
        codingPractice: ['Build 5 UI screens', 'Integrate 3 APIs', 'Implement local database'],
        miniProject: 'Weather Forecast App',
      },
      {
        phase: 'intermediate',
        title: 'Architecture & Advanced Android',
        duration: '10 weeks',
        description: 'Master Android architecture patterns and advanced concepts',
        weeks: [9, 18],
        topics: [
          { week: 9, title: 'MVVM Architecture', tasks: ['ViewModel', 'LiveData', 'Repository pattern', 'Use cases', 'Dependency injection'], type: 'topic' },
          { week: 10, title: 'Hilt Dependency Injection', tasks: ['DI concepts', 'Hilt setup', 'Modules', 'Scopes', 'Testing with Hilt'], type: 'topic' },
          { week: 11, title: 'Coroutines & Flow', tasks: ['Coroutines basics', 'Suspend functions', 'Flow', 'StateFlow', 'Error handling'], type: 'topic' },
          { week: 12, title: 'Firebase Integration', tasks: ['Firebase Auth', 'Firestore', 'Firebase Storage', 'Push notifications', 'Analytics'], type: 'topic' },
          { week: 13, title: 'Advanced Jetpack Compose', tasks: ['Custom composables', 'Animations', 'Navigation', 'Lazy lists', 'Canvas API'], type: 'topic' },
          { week: 14, title: 'Project: Social Media App', tasks: ['User auth', 'Post CRUD', 'Image upload', 'Feed', 'Push notifications'], type: 'project' },
          { week: 15, title: 'Maps & Location', tasks: ['Google Maps SDK', 'Location services', 'Geofencing', 'Places API', 'Custom markers'], type: 'topic' },
          { week: 16, title: 'Payment Integration', tasks: ['Razorpay/Stripe', 'In-app purchases', 'Google Pay', 'Subscription management'], type: 'topic' },
          { week: 17, title: 'App Performance', tasks: ['Memory profiling', 'Battery optimization', 'ProGuard/R8', 'APK size reduction', 'Benchmarking'], type: 'topic' },
          { week: 18, title: 'Testing Android Apps', tasks: ['Unit tests', 'Espresso UI tests', 'Mockito', 'Robolectric', 'Test coverage'], type: 'topic' },
        ],
        resources: ['Android Architecture Docs', 'Firebase Documentation'],
        codingPractice: ['Build 3 apps with MVVM', 'Write 20 unit tests', 'Profile and optimize 2 apps'],
        miniProject: 'E-Commerce Android App',
      },
      {
        phase: 'advanced',
        title: 'Publishing & Production',
        duration: '4 weeks',
        description: 'Publish and maintain production Android applications',
        weeks: [19, 22],
        topics: [
          { week: 19, title: 'CI/CD for Android', tasks: ['GitHub Actions', 'Fastlane', 'Automated testing', 'Build variants', 'Code signing'], type: 'topic' },
          { week: 20, title: 'Play Store Publishing', tasks: ['App signing', 'Store listing', 'Screenshots', 'App Bundle', 'Staged rollout'], type: 'topic' },
          { week: 21, title: 'Analytics & Crash Reporting', tasks: ['Firebase Analytics', 'Crashlytics', 'A/B testing', 'Remote config', 'User behavior'], type: 'topic' },
          { week: 22, title: 'Capstone: Full Android App', tasks: ['Complete app design', 'Development', 'Testing', 'Publication prep', 'Portfolio'], type: 'project' },
        ],
        resources: ['Play Console Help', 'Fastlane Docs'],
        codingPractice: ['Publish app to Play Store', 'Set up crash reporting', 'Implement analytics'],
        miniProject: 'Published Android App on Play Store',
      },
    ],
  },
  'devops-engineer': {
    title: 'DevOps Engineer Roadmap',
    totalWeeks: 26,
    phases: [
      {
        phase: 'beginner',
        title: 'Linux & Networking Foundation',
        duration: '8 weeks',
        description: 'Master Linux administration and networking fundamentals',
        weeks: [1, 8],
        topics: [
          { week: 1, title: 'Linux Fundamentals', tasks: ['File system', 'Commands', 'Permissions', 'Users & groups', 'Process management'], type: 'topic' },
          { week: 2, title: 'Shell Scripting', tasks: ['Bash scripting', 'Variables', 'Loops', 'Functions', 'Automation scripts'], type: 'topic' },
          { week: 3, title: 'Networking Basics', tasks: ['TCP/IP', 'DNS', 'HTTP/HTTPS', 'Load balancing', 'Firewalls'], type: 'topic' },
          { week: 4, title: 'Version Control & Git', tasks: ['Git flow', 'Branching strategies', 'Merge conflicts', 'Git hooks', 'Monorepo'], type: 'topic' },
          { week: 5, title: 'Docker Fundamentals', tasks: ['Containers', 'Dockerfile', 'Images', 'Docker Compose', 'Networking'], type: 'topic' },
          { week: 6, title: 'Docker Advanced', tasks: ['Multi-stage builds', 'Docker Registry', 'Volumes', 'Security scanning', 'Optimization'], type: 'topic' },
          { week: 7, title: 'Cloud Fundamentals (AWS)', tasks: ['AWS IAM', 'EC2', 'S3', 'VPC', 'RDS basics'], type: 'topic' },
          { week: 8, title: 'Mini Project: Dockerize an App', tasks: ['Containerize web app', 'Docker Compose setup', 'Nginx reverse proxy', 'SSL/HTTPS'], type: 'project' },
        ],
        resources: ['Linux Command Line Book', 'Docker Official Docs', 'AWS Free Tier'],
        codingPractice: ['Write 10 shell scripts', 'Dockerize 3 applications', 'Set up Linux server'],
        miniProject: 'Dockerized Full Stack Application',
      },
      {
        phase: 'intermediate',
        title: 'CI/CD & Infrastructure as Code',
        duration: '12 weeks',
        description: 'Build automated pipelines and manage infrastructure',
        weeks: [9, 20],
        topics: [
          { week: 9, title: 'GitHub Actions CI/CD', tasks: ['Workflows', 'Actions', 'Secrets', 'Environments', 'Matrix builds'], type: 'topic' },
          { week: 10, title: 'Jenkins Pipeline', tasks: ['Jenkins setup', 'Jenkinsfile', 'Pipeline stages', 'Plugins', 'Blue Ocean'], type: 'topic' },
          { week: 11, title: 'Kubernetes Fundamentals', tasks: ['Pods', 'Deployments', 'Services', 'ConfigMaps', 'Namespaces'], type: 'topic' },
          { week: 12, title: 'Kubernetes Advanced', tasks: ['Ingress', 'PersistentVolumes', 'HPA', 'RBAC', 'Helm charts'], type: 'topic' },
          { week: 13, title: 'Terraform IaC', tasks: ['HCL language', 'Resources', 'Providers', 'State management', 'Modules'], type: 'topic' },
          { week: 14, title: 'Ansible Configuration Management', tasks: ['Playbooks', 'Inventory', 'Roles', 'Variables', 'Templates'], type: 'topic' },
          { week: 15, title: 'AWS Advanced Services', tasks: ['EKS', 'ECS', 'Lambda', 'CloudFront', 'Route53'], type: 'topic' },
          { week: 16, title: 'Project: Full CI/CD Pipeline', tasks: ['GitHub Actions', 'Docker build', 'Push to ECR', 'Deploy to EKS', 'Rollback'], type: 'project' },
          { week: 17, title: 'Monitoring & Observability', tasks: ['Prometheus', 'Grafana', 'ELK Stack', 'Distributed tracing', 'Alerting'], type: 'topic' },
          { week: 18, title: 'Security (DevSecOps)', tasks: ['SAST/DAST', 'Secret scanning', 'Image scanning', 'OWASP Top 10', 'Zero Trust'], type: 'topic' },
          { week: 19, title: 'Service Mesh & Microservices', tasks: ['Istio', 'Envoy', 'API Gateway', 'Circuit breaker', 'Service discovery'], type: 'topic' },
          { week: 20, title: 'Cost Optimization', tasks: ['AWS Cost Explorer', 'Right-sizing', 'Reserved instances', 'Spot instances', 'Auto-scaling'], type: 'topic' },
        ],
        resources: ['Kubernetes Official Docs', 'Terraform Docs', 'GitHub Actions Docs'],
        codingPractice: ['Set up 3 CI/CD pipelines', 'Deploy K8s cluster', 'Write Terraform modules'],
        miniProject: 'Microservices Platform on Kubernetes',
      },
      {
        phase: 'advanced',
        title: 'Platform Engineering & SRE',
        duration: '6 weeks',
        description: 'Build internal developer platforms and apply SRE principles',
        weeks: [21, 26],
        topics: [
          { week: 21, title: 'SRE Principles', tasks: ['SLI/SLO/SLA', 'Error budgets', 'Postmortem culture', 'Incident management', 'Chaos engineering'], type: 'topic' },
          { week: 22, title: 'Platform Engineering', tasks: ['Internal developer platform', 'Golden paths', 'Self-service infra', 'Backstage', 'Paved roads'], type: 'topic' },
          { week: 23, title: 'GitOps', tasks: ['Argo CD', 'Flux', 'Git as source of truth', 'Progressive delivery', 'Canary deployments'], type: 'topic' },
          { week: 24, title: 'Multi-Cloud & Hybrid', tasks: ['Multi-cloud strategy', 'Anthos', 'AWS Outposts', 'Disaster recovery', 'Data sovereignty'], type: 'topic' },
          { week: 25, title: 'FinOps', tasks: ['Cloud cost governance', 'Chargeback models', 'Optimization automation', 'Reporting dashboards'], type: 'topic' },
          { week: 26, title: 'Capstone: Production Platform', tasks: ['Design complete DevOps platform', 'Implement GitOps', 'Full monitoring', 'Documentation'], type: 'project' },
        ],
        resources: ['Google SRE Book', 'Argo CD Docs'],
        codingPractice: ['Implement GitOps pipeline', 'Build SRE dashboard', 'Conduct chaos engineering'],
        miniProject: 'Complete GitOps Platform with Monitoring',
      },
    ],
  },
  'machine-learning-engineer': {
    title: 'Machine Learning Engineer Roadmap',
    totalWeeks: 28,
    phases: [
      {
        phase: 'beginner',
        title: 'Python & ML Foundations',
        duration: '10 weeks',
        description: 'Build Python programming and machine learning fundamentals',
        weeks: [1, 10],
        topics: [
          { week: 1, title: 'Python for ML Engineers', tasks: ['Python OOP', 'Data structures', 'Algorithms', 'Testing', 'Type hints'], type: 'topic' },
          { week: 2, title: 'NumPy & Linear Algebra', tasks: ['Arrays', 'Matrix operations', 'Broadcasting', 'Eigenvalues', 'SVD'], type: 'topic' },
          { week: 3, title: 'Pandas & Data Wrangling', tasks: ['DataFrames', 'Merging', 'Groupby', 'Time series', 'Optimizing memory'], type: 'topic' },
          { week: 4, title: 'Statistics & Probability', tasks: ['Distributions', 'Bayes theorem', 'MLE', 'Sampling', 'Hypothesis testing'], type: 'topic' },
          { week: 5, title: 'Classical ML Algorithms', tasks: ['Linear/Logistic regression', 'Decision trees', 'SVM', 'KNN', 'Naive Bayes'], type: 'topic' },
          { week: 6, title: 'Scikit-Learn Deep Dive', tasks: ['Pipelines', 'ColumnTransformer', 'Custom estimators', 'Hyperparameter tuning', 'Model selection'], type: 'topic' },
          { week: 7, title: 'Neural Networks Theory', tasks: ['Perceptrons', 'Backpropagation math', 'Gradient descent', 'Activation functions', 'Loss functions'], type: 'topic' },
          { week: 8, title: 'PyTorch Fundamentals', tasks: ['Tensors', 'Autograd', 'Neural network module', 'DataLoaders', 'Training loops'], type: 'topic' },
          { week: 9, title: 'Deep Learning Architectures', tasks: ['CNN', 'RNN/LSTM', 'Transformer', 'Attention mechanisms', 'BERT/GPT basics'], type: 'topic' },
          { week: 10, title: 'Project: Kaggle Competition', tasks: ['EDA', 'Feature engineering', 'Model ensemble', 'Submission', 'Leaderboard'], type: 'project' },
        ],
        resources: ['fast.ai Course', 'Kaggle Learn', 'PyTorch Official Docs'],
        codingPractice: ['Implement 5 ML algorithms from scratch', 'Complete 3 Kaggle notebooks', 'Build 2 neural networks'],
        miniProject: 'Image Classification with CNN',
      },
      {
        phase: 'intermediate',
        title: 'Advanced ML & Deployment',
        duration: '12 weeks',
        description: 'Build production ML systems and deploy models',
        weeks: [11, 22],
        topics: [
          { week: 11, title: 'Advanced NLP', tasks: ['Transformers', 'Fine-tuning BERT', 'Hugging Face', 'Text generation', 'Embeddings'], type: 'topic' },
          { week: 12, title: 'Computer Vision Advanced', tasks: ['Object detection (YOLO)', 'Segmentation', 'GAN', 'Transfer learning', 'Video analysis'], type: 'topic' },
          { week: 13, title: 'Reinforcement Learning', tasks: ['MDPs', 'Q-learning', 'Policy gradients', 'Actor-Critic', 'OpenAI Gym'], type: 'topic' },
          { week: 14, title: 'ML Model Serving', tasks: ['FastAPI', 'TorchServe', 'TensorFlow Serving', 'gRPC', 'Batch inference'], type: 'topic' },
          { week: 15, title: 'Docker & Kubernetes for ML', tasks: ['Containerize models', 'GPU containers', 'K8s deployments', 'Resource management', 'Scaling'], type: 'topic' },
          { week: 16, title: 'MLflow & Experiment Tracking', tasks: ['Experiment logging', 'Model registry', 'Artifact storage', 'Comparing runs', 'Model stages'], type: 'topic' },
          { week: 17, title: 'Feature Stores', tasks: ['Feast', 'Tecton', 'Feature engineering at scale', 'Online/offline stores', 'Feature serving'], type: 'topic' },
          { week: 18, title: 'ML Monitoring', tasks: ['Data drift', 'Model drift', 'Performance monitoring', 'Alerting', 'Retraining triggers'], type: 'topic' },
          { week: 19, title: 'Distributed Training', tasks: ['Data parallelism', 'Model parallelism', 'Horovod', 'PyTorch DDP', 'Ray Train'], type: 'topic' },
          { week: 20, title: 'ML Security & Privacy', tasks: ['Adversarial attacks', 'Federated learning', 'Differential privacy', 'Model watermarking'], type: 'topic' },
          { week: 21, title: 'LLM Engineering', tasks: ['Prompt engineering', 'RAG', 'LangChain', 'Vector databases', 'Fine-tuning LLMs'], type: 'topic' },
          { week: 22, title: 'Project: End-to-End ML System', tasks: ['Problem definition', 'Data pipeline', 'Training', 'Deployment', 'Monitoring'], type: 'project' },
        ],
        resources: ['Hugging Face Course', 'MLflow Docs', 'Google ML Crash Course'],
        codingPractice: ['Deploy 3 ML APIs', 'Build RAG system', 'Implement drift detection'],
        miniProject: 'Production NLP Sentiment Analysis API',
      },
      {
        phase: 'advanced',
        title: 'MLOps & Platform Engineering',
        duration: '6 weeks',
        description: 'Build and maintain ML platforms at scale',
        weeks: [23, 28],
        topics: [
          { week: 23, title: 'Kubeflow Pipelines', tasks: ['Pipeline components', 'Artifact tracking', 'Hyperparameter tuning', 'Scheduling', 'Notebooks'], type: 'topic' },
          { week: 24, title: 'Vertex AI / SageMaker', tasks: ['Managed training', 'Hyperparameter tuning', 'Model registry', 'Endpoints', 'Pipelines'], type: 'topic' },
          { week: 25, title: 'Data Engineering for ML', tasks: ['Apache Spark', 'Data lakes', 'Delta Lake', 'Streaming features', 'Batch pipelines'], type: 'topic' },
          { week: 26, title: 'ML System Design', tasks: ['System design patterns', 'Scalability', 'Cost optimization', 'Latency vs accuracy', 'A/B testing'], type: 'topic' },
          { week: 27, title: 'Responsible AI & Ethics', tasks: ['Fairness & bias', 'Explainability (SHAP)', 'Model cards', 'AI governance', 'Regulatory compliance'], type: 'topic' },
          { week: 28, title: 'Capstone: ML Platform', tasks: ['Design ML platform', 'Build end-to-end pipeline', 'Monitoring dashboard', 'Documentation', 'Presentation'], type: 'project' },
        ],
        resources: ['Kubeflow Docs', 'AWS SageMaker Docs', 'Vertex AI Docs'],
        codingPractice: ['Build ML pipeline', 'Implement SHAP explanations', 'Deploy on managed ML platform'],
        miniProject: 'Complete MLOps Platform',
      },
    ],
  },
  'ui-ux-designer': {
    title: 'UI/UX Designer Roadmap',
    totalWeeks: 20,
    phases: [
      {
        phase: 'beginner',
        title: 'Design Fundamentals',
        duration: '7 weeks',
        description: 'Learn core design principles and tools',
        weeks: [1, 7],
        topics: [
          { week: 1, title: 'Design Principles', tasks: ['Visual hierarchy', 'Typography', 'Color theory', 'Spacing & layout', 'Gestalt principles'], type: 'topic' },
          { week: 2, title: 'Figma Mastery', tasks: ['Frames & components', 'Auto layout', 'Prototyping', 'Variables', 'Plugins'], type: 'topic' },
          { week: 3, title: 'UX Research Methods', tasks: ['User interviews', 'Surveys', 'Competitive analysis', 'Personas', 'User journey maps'], type: 'topic' },
          { week: 4, title: 'Information Architecture', tasks: ['IA principles', 'Card sorting', 'Tree testing', 'Sitemap design', 'Navigation patterns'], type: 'topic' },
          { week: 5, title: 'Wireframing & Prototyping', tasks: ['Low-fi wireframes', 'Mid-fi wireframes', 'Interactive prototypes', 'User flows', 'Micro-interactions'], type: 'topic' },
          { week: 6, title: 'Mobile App Design', tasks: ['iOS HIG', 'Material Design', 'Touch targets', 'Gestures', 'Responsive patterns'], type: 'topic' },
          { week: 7, title: 'Mini Project: App Redesign', tasks: ['Choose existing app', 'Research & analysis', 'Wireframes', 'High-fi design', 'Prototype'], type: 'project' },
        ],
        resources: ['Figma Tutorial Official', 'Google Material Design', 'Apple HIG'],
        codingPractice: ['Design 10 UI screens', 'Create 5 user flows', 'Build interactive prototype'],
        miniProject: 'Mobile App Redesign Case Study',
      },
      {
        phase: 'intermediate',
        title: 'Advanced UX & Design Systems',
        duration: '9 weeks',
        description: 'Master advanced UX techniques and build design systems',
        weeks: [8, 16],
        topics: [
          { week: 8, title: 'Usability Testing', tasks: ['Test planning', 'Moderated testing', 'Unmoderated testing', 'Analysis', 'Iteration'], type: 'topic' },
          { week: 9, title: 'Design Systems', tasks: ['Component library', 'Design tokens', 'Documentation', 'Versioning', 'Governance'], type: 'topic' },
          { week: 10, title: 'Accessibility (a11y)', tasks: ['WCAG guidelines', 'Color contrast', 'Screen readers', 'Focus management', 'Inclusive design'], type: 'topic' },
          { week: 11, title: 'Motion Design', tasks: ['Animation principles', 'Micro-interactions', 'Lottie', 'Transition design', 'Timing & easing'], type: 'topic' },
          { week: 12, title: 'Design for Web', tasks: ['Responsive grids', 'Web typography', 'CSS basics for designers', 'Collaboration with devs', 'Handoff tools'], type: 'topic' },
          { week: 13, title: 'Project: Design System', tasks: ['Audit existing design', 'Build component library', 'Create documentation', 'Implement tokens'], type: 'project' },
          { week: 14, title: 'Advanced Prototyping', tasks: ['Variables in Figma', 'Complex interactions', 'Multi-step flows', 'Device frames', 'Presentation'], type: 'topic' },
          { week: 15, title: 'UX Writing & Content Design', tasks: ['Microcopy', 'Error messages', 'Onboarding text', 'Voice & tone', 'Content strategy'], type: 'topic' },
          { week: 16, title: 'Data-Driven Design', tasks: ['Analytics for UX', 'Heatmaps', 'A/B testing', 'Funnel analysis', 'Design metrics'], type: 'topic' },
        ],
        resources: ['Nielsen Norman Group Articles', 'Figma Community', 'UX Collective'],
        codingPractice: ['Build complete design system', 'Conduct 3 usability tests', 'Create 20 component variants'],
        miniProject: 'Complete Design System with Documentation',
      },
      {
        phase: 'advanced',
        title: 'Portfolio & Career',
        duration: '4 weeks',
        description: 'Build a portfolio and prepare for UX roles',
        weeks: [17, 20],
        topics: [
          { week: 17, title: 'UX Case Studies', tasks: ['Case study structure', 'Problem framing', 'Process documentation', 'Results & metrics', 'Storytelling'], type: 'topic' },
          { week: 18, title: 'Portfolio Website', tasks: ['Portfolio design', 'Case study pages', 'About page', 'Resume design', 'Personal brand'], type: 'project' },
          { week: 19, title: 'UX Interview Preparation', tasks: ['Portfolio review', 'Design challenges', 'Whiteboard exercises', 'Behavioral questions', 'Salary negotiation'], type: 'topic' },
          { week: 20, title: 'Freelancing & Professional Growth', tasks: ['Client management', 'Project scoping', 'Pricing', 'Contracts', 'Building network'], type: 'topic' },
        ],
        resources: ['Behance', 'Dribbble', 'UX Portfolio Guide'],
        codingPractice: ['Create 3 case studies', 'Build portfolio site', 'Practice 10 design challenges'],
        miniProject: 'Professional UX Portfolio',
      },
    ],
  },
};

const DEFAULT_TEMPLATE = ROADMAP_TEMPLATES['full-stack-web-developer'];

/**
 * Calculate skill gap for a career path with multi-factor readiness score
 */
const analyzeSkillGap = (careerPath, studentSkills = [], studentProfile = {}, studentProjects = []) => {
  const requiredSkills = careerPath.required_skills || [];
  
  const matchedSkillsObj = [];
  const missingSkills = [];

  requiredSkills.forEach(skill => {
    const found = studentSkills.find(ss => 
      ss.name?.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(ss.name?.toLowerCase())
    );
    if (found) {
      matchedSkillsObj.push({ skill, proficiency: found.proficiency_level || 'beginner' });
    } else {
      missingSkills.push(skill);
    }
  });

  const matchedSkills = matchedSkillsObj.map(m => m.skill);
  const totalRequired = requiredSkills.length || 1;

  // 1. Skill Coverage Score (40% weight)
  const coverageRatio = matchedSkills.length / totalRequired;
  const coverageScore = Math.round(coverageRatio * 100);

  // 2. Skill Depth / Proficiency Score (30% weight)
  const profWeights = { beginner: 50, intermediate: 75, advanced: 90, expert: 100 };
  let totalProfWeight = 0;
  matchedSkillsObj.forEach(m => {
    totalProfWeight += profWeights[m.proficiency] || 50;
  });
  const proficiencyScore = matchedSkillsObj.length > 0 ? Math.round(totalProfWeight / matchedSkillsObj.length) : 0;

  // 3. Project Experience Score (15% weight)
  const completedProjects = studentProjects.filter(p => p.status === 'completed').length;
  const projectScore = Math.min(100, completedProjects * 25);

  // 4. Learning Consistency Score (15% weight)
  const streak = studentProfile.learning_streak || 0;
  const consistencyScore = Math.min(100, streak * 10 + (studentSkills.length > 0 ? 30 : 0));

  // Final 4-Factor Career Readiness Score
  const readinessScore = totalRequired > 0 
    ? Math.min(100, Math.round(
        (coverageScore * 0.40) +
        (proficiencyScore * 0.30) +
        (projectScore * 0.15) +
        (consistencyScore * 0.15)
      ))
    : 0;

  const criticalMissing = missingSkills.filter((_, idx) => idx < Math.ceil(missingSkills.length / 2));
  const secondaryMissing = missingSkills.filter((_, idx) => idx >= Math.ceil(missingSkills.length / 2));

  return {
    requiredSkills,
    matchedSkills,
    missingSkills,
    criticalMissing,
    secondaryMissing,
    readinessScore,
    scoreBreakdown: {
      coverageScore,
      proficiencyScore,
      projectScore,
      consistencyScore,
    },
    strengths: matchedSkillsObj,
    weaknesses: missingSkills,
    improvementSuggestions: missingSkills.map(skill => ({
      skill,
      suggestion: `Master ${skill} concepts with structured tutorials and practice exercises`,
      priority: requiredSkills.indexOf(skill) < Math.ceil(requiredSkills.length / 2) ? 'high' : 'medium',
    })),
  };
};

/**
 * Generate a personalized roadmap based on career goal and current skills
 */
const generateRoadmap = (careerPath, studentSkills, studentProfile) => {
  const template = ROADMAP_TEMPLATES[careerPath.slug] || DEFAULT_TEMPLATE;
  const skillGap = analyzeSkillGap(careerPath, studentSkills);

  // Adjust phases based on current skill level
  const hasBeginnerSkills = skillGap.readinessScore >= 20;
  const hasIntermediateSkills = skillGap.readinessScore >= 50;

  const phases = template.phases.map((phase, index) => {
    // Filter out topics the student likely already knows
    const relevantTopics = phase.topics.map(topic => {
      const isLikelyKnown = studentSkills.some(ss =>
        topic.title.toLowerCase().includes(ss.name?.toLowerCase() || '') && ss.proficiency_level !== 'beginner'
      );
      return { ...topic, status: isLikelyKnown ? 'review' : 'learn' };
    });

    return {
      ...phase,
      topics: relevantTopics,
      isSkippable: (index === 0 && hasBeginnerSkills && skillGap.readinessScore >= 40) ||
                   (index === 1 && hasIntermediateSkills && skillGap.readinessScore >= 70),
      recommendation: index === 0 && hasBeginnerSkills
        ? 'You have some foundation! Focus on gaps and move faster through familiar topics.'
        : index === 1 && hasIntermediateSkills
        ? 'Strong intermediate skills! Focus on advanced topics.'
        : 'Work through this phase completely to build solid foundation.',
    };
  });

  const estimatedWeeks = hasIntermediateSkills
    ? Math.round(template.totalWeeks * 0.6)
    : hasBeginnerSkills
    ? Math.round(template.totalWeeks * 0.8)
    : template.totalWeeks;

  return {
    title: template.title,
    description: `Personalized roadmap for ${studentProfile?.first_name || 'you'} to become a ${careerPath.title}. Based on your current skill set, this roadmap is estimated to take ${estimatedWeeks} weeks.`,
    phases,
    totalWeeks: estimatedWeeks,
    skillGap,
    personalizedNotes: [
      `Your current career readiness is ${skillGap.readinessScore}%.`,
      skillGap.missingSkills.length > 0
        ? `Focus areas: ${skillGap.missingSkills.slice(0, 3).join(', ')}.`
        : 'You have great foundational skills!',
      `You have ${studentSkills.length} skills that will help you in this career path.`,
    ],
    generatedAt: new Date().toISOString(),
  };
};

/**
 * Generate weekly plan for a specific week
 */
const generateWeeklyPlan = (roadmap, weekNumber) => {
  const allTopics = roadmap.phases?.flatMap(p => p.topics || []) || [];
  const currentTopic = allTopics.find(t => t.week === weekNumber) || allTopics[0];

  if (!currentTopic) {
    return { error: 'Week not found in roadmap' };
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const tasksPerDay = currentTopic.tasks || ['Review concepts', 'Practice coding', 'Build mini project'];

  const dailyPlans = days.map((day, index) => {
    if (index === 6) { // Sunday
      return {
        day,
        type: 'revision',
        tasks: ['Review week\'s learning', 'Update notes', 'Prepare for next week', 'Rest and reflect'],
        duration: '2 hours',
      };
    }
    if (index === 5) { // Saturday
      return {
        day,
        type: 'project',
        tasks: [`Work on ${currentTopic.type === 'project' ? 'this week\'s project' : 'mini practice project'}`, 'Apply week\'s concepts', 'Push code to GitHub'],
        duration: '3-4 hours',
      };
    }

    const taskIndex = index % tasksPerDay.length;
    return {
      day,
      type: 'learning',
      tasks: [
        tasksPerDay[taskIndex] || 'Study core concept',
        'Code along with tutorial',
        'Practice with exercises',
      ],
      duration: '1.5-2 hours',
      topic: tasksPerDay[taskIndex],
    };
  });

  return {
    weekNumber,
    title: `Week ${weekNumber}: ${currentTopic.title}`,
    goals: [
      `Master: ${currentTopic.title}`,
      `Complete ${currentTopic.tasks?.length || 3} learning tasks`,
      'Practice coding for at least 1 hour daily',
      'Build or contribute to a project',
    ],
    dailyPlans,
    totalTasks: dailyPlans.reduce((sum, day) => sum + day.tasks.length, 0),
    estimatedHours: 12,
    focusTopic: currentTopic.title,
  };
};

module.exports = { generateRoadmap, generateWeeklyPlan, analyzeSkillGap, ROADMAP_TEMPLATES };

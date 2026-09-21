import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const userAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getCategories: () => api.get('/skills/categories'),
  getStudentSkills: () => api.get('/skills/student'),
  addSkill: (data) => api.post('/skills/student', data),
  updateSkill: (id, data) => api.put(`/skills/student/${id}`, data),
  removeSkill: (id) => api.delete(`/skills/student/${id}`),
  submitAssessment: (data) => api.post('/skills/assess', data),
  getAssessmentHistory: () => api.get('/skills/assessments'),
  getQuiz: (skillId) => api.get(`/skills/quiz/${skillId}`),
};

export const careerGoalAPI = {
  selectGoal: (careerPathId) => api.post('/career-goals/select', { careerPathId }),
  getCurrentGoal: () => api.get('/career-goals/current'),
  clearGoal: () => api.delete('/career-goals/current'),
};

export const careerPathAPI = {
  getAll: (params) => api.get('/career-paths', { params }),
  getBySlug: (slug) => api.get(`/career-paths/${slug}`),
  create: (data) => api.post('/career-paths', data),
  update: (id, data) => api.put(`/career-paths/${id}`, data),
};

export const roadmapAPI = {
  generate: (careerPathId) => api.post('/roadmaps/generate', { careerPathId }),
  getAll: () => api.get('/roadmaps'),
  getCurrent: () => api.get('/roadmaps/current'),
  getById: (id) => api.get(`/roadmaps/${id}`),
  completeTask: (taskId) => api.patch(`/roadmaps/tasks/${taskId}/complete`),
  delete: (id) => api.delete(`/roadmaps/${id}`),
};

export const weeklyPlanAPI = {
  generate: (data) => api.post('/weekly-plans/generate', data),
  getAll: () => api.get('/weekly-plans'),
  getCurrent: () => api.get('/weekly-plans/current'),
  completeTask: (id, data) => api.patch(`/weekly-plans/${id}/complete-task`, data),
};

export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getRecommended: () => api.get('/resources/recommended'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getRecommended: () => api.get('/projects/recommended'),
  getStudentProjects: () => api.get('/projects/student'),
  getById: (id) => api.get(`/projects/${id}`),
  start: (projectId) => api.post('/projects/student/start', { projectId }),
  complete: (id, data) => api.patch(`/projects/student/${id}/complete`, data),
};

export const progressAPI = {
  getProgress: () => api.get('/progress'),
  getActivity: (params) => api.get('/progress/activity', { params }),
};

export const badgeAPI = {
  getAll: () => api.get('/badges'),
  getStudentBadges: () => api.get('/badges/student'),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const skillGapAPI = {
  analyze: (params) => api.get('/skill-gap/analyze', { params }),
  getHistory: () => api.get('/skill-gap/history'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  toggleStudentStatus: (id) => api.patch(`/admin/students/${id}/toggle-status`),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
};

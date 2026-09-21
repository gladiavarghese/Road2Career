import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Skills from './pages/student/Skills';
import Roadmap from './pages/student/Roadmap';
import WeeklyPlan from './pages/student/WeeklyPlan';
import SkillGap from './pages/student/SkillGap';
import Resources from './pages/student/Resources';
import Projects from './pages/student/Projects';
import Progress from './pages/student/Progress';
import Notifications from './pages/student/Notifications';
import CareerGoalSelection from './pages/student/CareerGoalSelection';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCareerPaths from './pages/admin/AdminCareerPaths';
import AdminSkills from './pages/admin/AdminSkills';
import AdminResources from './pages/admin/AdminResources';
import AdminProjects from './pages/admin/AdminProjects';

// Loading spinner
const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
        <span className="text-2xl">🗺️</span>
      </div>
      <p className="text-dark-400 text-sm">Loading Road2Career...</p>
    </div>
  </div>
);

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Student routes */}
      <Route element={<ProtectedRoute roles={['student', 'admin']}><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/career-goals" element={<CareerGoalSelection />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/weekly-plan" element={<WeeklyPlan />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={['admin']}><AppLayout isAdmin /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/career-paths" element={<AdminCareerPaths />} />
        <Route path="/admin/skills" element={<AdminSkills />} />
        <Route path="/admin/resources" element={<AdminResources />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#212529',
              color: '#e9ecef',
              border: '1px solid #343a40',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#51cf66', secondary: '#212529' } },
            error: { iconTheme: { primary: '#ff6b6b', secondary: '#212529' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

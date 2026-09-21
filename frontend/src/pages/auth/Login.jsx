import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useState } from 'react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 to-dark-950 border-r border-dark-800/50 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
              <span className="text-xl">🗺️</span>
            </div>
            <span className="font-display font-bold text-xl text-dark-50">Road2Career</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-display font-bold text-dark-50 leading-tight mb-4">
              Chart your path to{' '}
              <span className="text-gradient">career success</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              AI-powered career guidance that generates personalized roadmaps, analyzes skill gaps, and helps you reach your dream career faster.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: '🗺️', text: 'Personalized Roadmaps' },
              { icon: '🔍', text: 'Skill Gap Analysis' },
              { icon: '📅', text: 'Weekly Planning' },
              { icon: '🏆', text: 'Achievement Badges' },
            ].map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-dark-700/50"
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-dark-300 font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-dark-600 text-sm">
          © 2024 Road2Career. Built with ❤️ for aspiring developers.
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
              <span className="text-xl">🗺️</span>
            </div>
            <span className="font-display font-bold text-xl text-dark-50">Road2Career</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-dark-50 mb-1">Welcome back</h2>
          <p className="text-dark-400 text-sm mb-8">Sign in to continue your career journey</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPw ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-dark-900/50 border border-dark-700/50 rounded-xl">
            <p className="text-xs text-dark-500 font-medium mb-2">Demo credentials:</p>
            <p className="text-xs text-dark-400">Admin: admin@road2career.com / Admin@123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

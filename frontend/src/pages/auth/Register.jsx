import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiMailLine, RiLockLine, RiUserLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useState } from 'react';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created! Welcome to Road2Career 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <span className="text-xl">🗺️</span>
          </div>
          <span className="font-display font-bold text-xl text-dark-50">Road2Career</span>
        </div>

        <h2 className="text-2xl font-display font-bold text-dark-50 mb-1">Create your account</h2>
        <p className="text-dark-400 text-sm mb-8">Start your AI-powered career journey today — free forever</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First name</label>
              <div className="relative">
                <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                <input
                  type="text"
                  placeholder="John"
                  {...register('firstName', { required: 'Required' })}
                  className={`input pl-9 ${errors.firstName ? 'input-error' : ''}`}
                />
              </div>
              {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                type="text"
                placeholder="Doe"
                {...register('lastName', { required: 'Required' })}
                className={`input ${errors.lastName ? 'input-error' : ''}`}
              />
              {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

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
            <label className="label">Password</label>
            <div className="relative">
              <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters with letters & numbers"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                  pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)/, message: 'Must contain letters and numbers' },
                })}
                className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500">
                {showPw ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Free Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-dark-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiMailLine, RiArrowLeftLine } from 'react-icons/ri';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authAPI.forgotPassword(data.email);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow mb-6">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-dark-50 mb-1">Forgot your password?</h2>
        <p className="text-dark-400 text-sm mb-8">Enter your email and we'll send you a reset link</p>

        {isSubmitSuccessful ? (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <span className="text-4xl mb-3 block">📧</span>
            <p className="text-green-400 font-medium">Reset link sent!</p>
            <p className="text-dark-400 text-sm mt-1">Check your inbox for the password reset link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link to="/login" className="flex items-center gap-2 text-dark-400 hover:text-dark-200 text-sm mt-6">
          <RiArrowLeftLine size={16} /> Back to login
        </Link>
      </motion.div>
    </div>
  );
}

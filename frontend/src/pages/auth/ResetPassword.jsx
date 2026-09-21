import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../api/services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authAPI.resetPassword({ token, password: data.password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired token.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow mb-6">
          <span className="text-2xl">🔑</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-dark-50 mb-1">Reset your password</h2>
        <p className="text-dark-400 text-sm mb-8">Enter a new password for your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
              className={`input ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              placeholder="Repeat password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: v => v === watch('password') || 'Passwords do not match',
              })}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

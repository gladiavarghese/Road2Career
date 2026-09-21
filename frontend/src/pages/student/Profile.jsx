import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI, authAPI } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiUser3Line, RiEditLine, RiSaveLine, RiCameraLine } from 'react-icons/ri';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors, isSubmitting: pwSubmitting } } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
      reset({
        firstName: res.data.first_name,
        lastName: res.data.last_name,
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        college: res.data.college || '',
        degree: res.data.degree || '',
        graduationYear: res.data.graduation_year || '',
        linkedinUrl: res.data.linkedin_url || '',
        githubUrl: res.data.github_url || '',
        portfolioUrl: res.data.portfolio_url || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await userAPI.updateProfile(data);
      updateUser({ firstName: data.firstName, lastName: data.lastName });
      await fetchProfile();
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await userAPI.uploadAvatar(formData);
      updateUser({ avatarUrl: res.data.avatarUrl });
      await fetchProfile();
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onPasswordChange = async (data) => {
    try {
      await authAPI.changePassword(data);
      resetPw();
      setChangingPassword(false);
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6"><div className="skeleton h-48 rounded" /></div>
          <div className="lg:col-span-2 card p-6"><div className="skeleton h-64 rounded" /></div>
        </div>
      </div>
    );
  }

  const avatarInitials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`;
  const avatarSrc = avatarPreview || (profile?.avatar_url ? `/api${profile.avatar_url}` : null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">My Profile</h1>
          <p className="section-subtitle">Manage your personal information and preferences</p>
        </div>
        <button
          onClick={() => setEditing(p => !p)}
          className={editing ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
        >
          {editing ? <><RiSaveLine size={16} />Cancel</> : <><RiEditLine size={16} />Edit Profile</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar & Stats */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover mx-auto" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-3xl font-bold mx-auto">
                  {avatarInitials}
                </div>
              )}
              <label className={`absolute -bottom-2 -right-2 w-8 h-8 bg-dark-800 border border-dark-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-dark-700 transition-colors ${uploadingAvatar ? 'opacity-50 cursor-wait' : ''}`}>
                <RiCameraLine size={14} className="text-dark-300" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
              </label>
            </div>
            <h2 className="font-bold text-dark-50 text-lg">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-dark-400 text-sm">{profile?.email}</p>
            {profile?.career_goal_title && (
              <div className="mt-3 px-3 py-1.5 bg-brand-600/10 text-brand-400 rounded-lg text-sm font-medium">
                🎯 {profile.career_goal_title}
              </div>
            )}
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-dark-200 text-sm">Career Stats</h3>
            {[
              { label: 'Readiness Score', value: `${profile?.career_readiness_score || 0}%`, icon: '🎯' },
              { label: 'Learning Streak', value: `${profile?.learning_streak || 0} days`, icon: '🔥' },
              { label: 'Total XP', value: profile?.total_xp?.toLocaleString() || '0', icon: '⚡' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-dark-400 flex items-center gap-2">
                  {s.icon} {s.label}
                </span>
                <span className="font-semibold text-dark-100 text-sm">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="card p-5">
            <h3 className="font-semibold text-dark-200 text-sm mb-3">Links</h3>
            {[
              { label: 'LinkedIn', url: profile?.linkedin_url, icon: '💼' },
              { label: 'GitHub', url: profile?.github_url, icon: '🐙' },
              { label: 'Portfolio', url: profile?.portfolio_url, icon: '🌐' },
            ].map(link => (
              link.url ? (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  {link.icon} {link.label}
                </a>
              ) : (
                <div key={link.label} className="flex items-center gap-2 py-2 text-sm text-dark-600">
                  {link.icon} {link.label} — Not set
                </div>
              )
            ))}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
            <h2 className="font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <RiUser3Line /> Personal Information
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...register('firstName', { required: 'Required' })} className={`input ${errors.firstName ? 'input-error' : ''}`} disabled={!editing} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register('lastName', { required: 'Required' })} className={`input ${errors.lastName ? 'input-error' : ''}`} disabled={!editing} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} className="input" placeholder="+91 9876543210" disabled={!editing} />
              </div>
              <div>
                <label className="label">Graduation Year</label>
                <input type="number" {...register('graduationYear')} className="input" placeholder="2025" disabled={!editing} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Bio</label>
                <textarea {...register('bio')} rows={3} className="input resize-none" placeholder="Tell us about yourself..." disabled={!editing} />
              </div>
              <div>
                <label className="label">College / University</label>
                <input {...register('college')} className="input" placeholder="MIT / IIT Delhi" disabled={!editing} />
              </div>
              <div>
                <label className="label">Degree</label>
                <input {...register('degree')} className="input" placeholder="B.Tech Computer Science" disabled={!editing} />
              </div>
              <div>
                <label className="label">LinkedIn URL</label>
                <input {...register('linkedinUrl')} className="input" placeholder="https://linkedin.com/in/..." disabled={!editing} />
              </div>
              <div>
                <label className="label">GitHub URL</label>
                <input {...register('githubUrl')} className="input" placeholder="https://github.com/..." disabled={!editing} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Portfolio URL</label>
                <input {...register('portfolioUrl')} className="input" placeholder="https://yourportfolio.com" disabled={!editing} />
              </div>
            </div>

            {editing && (
              <div className="mt-5 flex gap-3">
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditing(false); fetchProfile(); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Change Password */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-dark-100">Change Password</h2>
              <button onClick={() => setChangingPassword(p => !p)} className="btn-ghost btn-sm">
                {changingPassword ? 'Cancel' : 'Change'}
              </button>
            </div>

            {changingPassword && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handlePw(onPasswordChange)}
                className="space-y-4"
              >
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" {...regPw('currentPassword', { required: 'Required' })} className={`input ${pwErrors.currentPassword ? 'input-error' : ''}`} />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" {...regPw('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} className="input" />
                </div>
                <button type="submit" disabled={pwSubmitting} className="btn-primary">
                  {pwSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

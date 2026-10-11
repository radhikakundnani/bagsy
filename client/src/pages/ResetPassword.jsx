import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { isStrongPassword } from '../utils/passwordRules';
import PasswordChecklist from '../components/PasswordChecklist';

const BG_IMAGE = '/hero-bg.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isStrongPassword(password)) {
      setError("Your password doesn't meet all the rules below yet.");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-brown w-full">
      <div className="w-full lg:w-1/3 relative flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-brown/85" />

        <div className="relative z-10 flex flex-col flex-1 px-10 md:px-16 lg:px-20 py-8">
          <div className="flex items-center gap-2 mb-16">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF2DA" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-beige text-sm font-medium">Bagsy</span>
          </div>

          <h1 className="font-serif text-4xl text-white mb-6">
            Create New Password
          </h1>

          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
              <p className="text-beige/70 text-sm mb-2">
                Your new password must be securely formed.
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
              />

              {password && <PasswordChecklist password={password} />}

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-brown font-semibold rounded-full hover:bg-beige transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="max-w-sm bg-white/10 p-6 rounded-lg text-center mt-4 border border-beige/20">
              <h2 className="text-xl text-white mb-2 font-medium">Password Reset!</h2>
              <p className="text-beige/80 text-sm mb-6">
                Your password has been changed successfully. Redirecting you to login...
              </p>
              <Link to="/login" className="inline-block py-2 px-6 bg-white text-brown font-semibold rounded-full hover:bg-beige transition-colors">
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div
        className="hidden lg:block lg:w-2/3 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
    </div>
  );
}

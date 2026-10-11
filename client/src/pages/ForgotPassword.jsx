import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const BG_IMAGE = '/hero-bg.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (email) {
      try {
        await API.post('/auth/forgotpassword', { email });
        setSubmitted(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      } finally {
        setLoading(false);
      }
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
            Reset Password
          </h1>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-sm">
              <p className="text-beige/70 text-sm mb-2">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-brown font-semibold rounded-full hover:bg-beige transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-beige/70 text-sm hover:text-white transition-colors">
                  &larr; Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="max-w-sm bg-white/10 p-6 rounded-lg text-center mt-4 border border-beige/20">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl text-white mb-2 font-medium">Check your inbox</h2>
              <p className="text-beige/80 text-sm mb-6">
                Password reset instructions have been sent to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="inline-block py-2 px-6 bg-white text-brown font-semibold rounded-full hover:bg-beige transition-colors">
                Return to Login
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

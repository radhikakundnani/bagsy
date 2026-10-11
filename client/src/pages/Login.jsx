import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BG_IMAGE = '/hero-bg.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Server is unavailable. Please check your connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - form */}
      <div className="w-full lg:w-1/3 relative flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-brown/85" />

        <div className="relative z-10 flex flex-col flex-1 px-10 md:px-16 lg:px-20 py-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF2DA" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-beige text-sm font-medium">Bagsy</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-12 underline underline-offset-8 decoration-1">
            Log in
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-sm">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
            />

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
              />
              <Link to="/forgot-password" className="block text-beige/50 text-xs text-right mt-1.5 hover:text-beige/70">
                forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-brown font-semibold rounded-full hover:bg-beige transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-beige/70 text-sm text-center mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-white font-bold hover:underline">
                SIGN UP
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right panel - image */}
      <div
        className="hidden lg:block lg:w-2/3 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
    </div>
  );
}

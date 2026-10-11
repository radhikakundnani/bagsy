import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isStrongPassword } from '../utils/passwordRules';
import PasswordChecklist from '../components/PasswordChecklist';

const BG_IMAGE = '/hero-bg.png';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

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
    if (!agreedTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
          <div className="flex items-center gap-2 mb-10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF2DA" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-beige text-sm font-medium">Smart Travel</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-8 underline underline-offset-8 decoration-1">
            Sign up
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Enter First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
            />

            <input
              type="text"
              placeholder="Enter Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
            />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
            />

            {password && <PasswordChecklist password={password} />}

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-transparent border border-beige/40 text-beige placeholder-beige/50 focus:outline-none focus:border-beige transition-colors"
            />

            <label className="flex items-center gap-2 text-beige/70 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-beige/40 accent-orange"
              />
              I agree to all terms and conditions.
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-brown font-semibold rounded-full hover:bg-beige transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p className="text-beige/70 text-sm text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-bold hover:underline">
                LOGIN
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

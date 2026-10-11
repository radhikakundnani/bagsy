import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Field, PasswordInput, inputClass } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(goTo, { replace: true });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError("Can't reach the server. Check your connection and try again.");
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome" accent="back" intro="Your lists are right where you left them.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        <Field label="Email" htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Password" htmlFor="login-password">
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Link to="/forgot-password" className="-mt-2 self-end text-sm font-medium underline decoration-2 underline-offset-4 hover:text-tomato smooth">
          Forgot password?
        </Link>

        <Button type="submit" variant="ink" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>

        <p className="text-center text-sm text-muted">
          New here?{' '}
          <Link to="/signup" state={location.state} className="font-bold text-ink underline decoration-2 underline-offset-4 hover:text-tomato smooth">
            Make an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

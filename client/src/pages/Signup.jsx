import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import PasswordChecklist from '../components/PasswordChecklist';
import { Alert, Button, Field, PasswordInput, inputClass } from '../components/ui';
import { isStrongPassword } from '../utils/passwordRules';

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
  const location = useLocation();
  const goTo = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("The two passwords don't match.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Your password doesn't meet all the rules yet.");
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the terms to continue.');
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      await signup(name, email, password);
      navigate(goTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Start" accent="packing" intro="Make an account and your first list is two minutes away.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="su-first">
            <input id="su-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
          </Field>
          <Field label="Last name" htmlFor="su-last">
            <input id="su-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
          </Field>
        </div>

        <Field label="Email" htmlFor="su-email">
          <input id="su-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </Field>

        <Field label="Password" htmlFor="su-password">
          <PasswordInput id="su-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {password && <PasswordChecklist password={password} />}

        <Field label="Confirm password" htmlFor="su-confirm">
          <PasswordInput id="su-confirm" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </Field>

        <label htmlFor="su-terms" className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            id="su-terms"
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-ink accent-ink"
          />
          I agree to the terms and conditions
        </label>

        <Button type="submit" variant="ink" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? 'Creating your account…' : 'Sign up'}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-bold text-ink underline decoration-2 underline-offset-4 hover:text-tomato smooth">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import AuthShell from '../components/AuthShell';
import { Alert, Button, Field, inputClass } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgotpassword', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthShell title="Check your" accent="inbox">
        <p className="text-muted">
          We've sent a reset link to <strong>{email}</strong>. It works for 10 minutes.
        </p>
        <Link to="/login" className="mt-6 inline-block font-bold underline decoration-2 underline-offset-4 hover:text-tomato">
          ← Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your" accent="password?" intro="Tell us your email and we'll send you a link to set a new one.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Email" htmlFor="fp-email">
          <input id="fp-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </Field>
        <Button type="submit" variant="ink" size="lg" disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
        <Link to="/login" className="text-center text-sm font-medium underline decoration-2 underline-offset-4 hover:text-tomato">
          ← Back to log in
        </Link>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import AuthShell from '../components/AuthShell';
import PasswordChecklist from '../components/PasswordChecklist';
import { Alert, Button, Field, PasswordInput } from '../components/ui';
import { isStrongPassword } from '../utils/passwordRules';

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
      setError("The two passwords don't match.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Your password doesn't meet all the rules yet.");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'That reset link has expired or is invalid. Ask for a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell title="All" accent="set">
        <Alert tone="success">Your password has been changed. Taking you to log in…</Alert>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Pick a new" accent="password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="New password" htmlFor="rp-password">
          <PasswordInput id="rp-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {password && <PasswordChecklist password={password} />}
        <Field label="Confirm new password" htmlFor="rp-confirm">
          <PasswordInput id="rp-confirm" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </Field>
        <Button type="submit" variant="ink" size="lg" disabled={loading} className="w-full">
          {loading ? 'Saving…' : 'Save new password'}
        </Button>
        <Link to="/login" className="text-center text-sm font-medium underline decoration-2 underline-offset-4 hover:text-tomato">
          ← Back to log in
        </Link>
      </form>
    </AuthShell>
  );
}

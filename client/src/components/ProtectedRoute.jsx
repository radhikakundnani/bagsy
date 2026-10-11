import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Spinner />
      </div>
    );
  }

  if (!token) {
    // Remember where they were going (e.g. an invite link) so we can send them back after logging in
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

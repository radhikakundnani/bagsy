import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CloudSun, Luggage, Plus, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Logo } from './ui';

const NAV = [
  { to: '/dashboard', label: 'Trips', icon: Luggage },
  { to: '/create-trip', label: 'New trip', icon: Plus },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

// Desktop: top bar. Phone: slim top bar + tab bar at the bottom (like an app).
export default function Layout({ children, wide = false }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to={token ? '/dashboard' : '/'} className="rounded-lg">
            <Logo />
          </Link>

          {token && (
            <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `smooth inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ${
                      isActive ? 'bg-ink text-card' : 'hover:bg-sun'
                    }`
                  }
                >
                  <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">
            {token ? (
              <>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-muted sm:inline">{user?.name}</span>
                <Button variant="paper" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="paper" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button variant="ink" size="sm" onClick={() => navigate('/signup')}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* key = path, so each new page plays the fade-in */}
      <main
        key={location.pathname}
        className={`animate-page-in mx-auto px-4 pb-32 pt-10 sm:px-6 md:pb-20 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}
      >
        {children}
      </main>

      {token && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-card md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label="Main"
        >
          <div className="grid grid-cols-4">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${isActive ? 'text-ink' : 'text-muted'}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`smooth flex h-8 w-12 items-center justify-center rounded-full ${isActive ? 'bg-ink text-card' : ''}`}>
                      <Icon size={20} strokeWidth={2} aria-hidden="true" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

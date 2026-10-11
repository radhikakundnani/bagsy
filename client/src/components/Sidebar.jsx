import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.20825 20.8335V9.89603L12.4999 4.3877L19.7916 9.89603V20.8335H13.8624V14.7044H11.1374V20.8335H5.20825Z" fill="#FFF2DA"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.65216 17.2284H9.25529V15.6253H7.65216V17.2284ZM7.65216 13.3014H9.25529V11.6993H7.65216V13.3014ZM7.65216 9.37533H9.25529V7.77324H7.65216V9.37533ZM11.6584 16.9482H17.2678V15.9066H11.6584V16.9482ZM11.6584 13.0212H17.2678V11.9795H11.6584V13.0212ZM11.6584 9.09407H17.2678V8.05241H11.6584V9.09407ZM4.16675 20.8337V4.16699H20.8334V20.8337H4.16675ZM5.20841 19.792H19.7917V5.20866H5.20841V19.792Z" fill="#FFF2DA"/>
    </svg>
  );
}

function NewTripIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 11h-3.5v3.5c0 .55-.45 1-1 1s-1-.45-1-1V13H7.5c-.55 0-1-.45-1-1s.45-1 1-1H11V7.5c0-.55.45-1 1-1s1 .45 1 1V11h3.5c.55 0 1 .45 1 1s-.45 1-1 1z" fill="#FFF2DA"/>
    </svg>
  );
}

function WeatherIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.6406 9.02557C12.9635 8.90057 15.3802 10.2391 16.1822 13.3016C17.0768 13.3747 17.9114 13.7809 18.5209 14.4398C19.1304 15.0987 19.4704 15.9624 19.4736 16.86C19.4769 17.7575 19.1432 18.6236 18.5386 19.287C17.9339 19.9503 17.1023 20.3626 16.2083 20.4422H6.19265C1.39578 19.7912 0.739527 12.8068 6.19265 11.8693C6.61939 11.0468 7.25504 10.3509 8.03578 9.85179C8.81652 9.35263 9.71486 9.06768 10.6406 9.02557Z" stroke="#FFF2DA" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3073 9.56803C13.5332 9.113 13.863 8.71748 14.2701 8.41343C14.6771 8.10937 15.1499 7.90531 15.6503 7.81772C16.1508 7.73012 16.6648 7.76146 17.1509 7.90919C17.637 8.05692 18.0815 8.3169 18.4486 8.66814C18.8156 9.01938 19.095 9.45203 19.264 9.93115C19.433 10.4103 19.4869 10.9224 19.4214 11.4262C19.356 11.93 19.1729 12.4114 18.8871 12.8314C18.6013 13.2514 18.2207 13.5983 17.776 13.8441M16.2135 6.39616V4.55762M12.9583 7.74512L11.6562 6.44303M19.4688 14.2607L20.7708 15.5576M20.8177 11.0003H22.6563M19.4688 7.74512L20.7708 6.44303" stroke="#FFF2DA" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#FFF2DA"/>
    </svg>
  );
}

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/dashboard', icon: ListIcon, label: 'Lists' },
  { to: '/create-trip', icon: NewTripIcon, label: 'New Trip' },
  { to: '/weather', icon: WeatherIcon, label: 'Weather' },
  { to: '/profile', icon: ProfileIcon, label: 'Profile' },
];

export default function Sidebar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-[150px] bg-brown flex flex-col z-50">
      <div className="px-4 pt-6 pb-8">
        <h1 className="text-sm font-bold tracking-wider">
          <span className="text-orange">BAG</span>
          <span className="text-beige">SY</span>
        </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brown-light text-beige'
                  : 'text-beige/70 hover:text-beige hover:bg-brown-light/50'
              }`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 flex flex-col gap-2">
        {token ? (
          <>
            <div className="text-beige/70 text-xs px-2 mb-1 truncate">
              {user?.name}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-full border border-beige text-beige text-sm hover:bg-beige/10 transition-colors"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-2 rounded-full bg-beige text-brown text-sm font-medium hover:bg-beige-dark transition-colors"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 rounded-full border border-beige text-beige text-sm hover:bg-beige/10 transition-colors"
            >
              Log In
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

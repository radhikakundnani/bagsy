import { Link } from 'react-router-dom';
import { Plug, IdCard, Droplets, Umbrella } from 'lucide-react';
import { Logo } from './ui';

// Packing items pinned around the form like sticky notes
const NOTES = [
  { text: 'passport', icon: IdCard, className: 'bg-lime left-[5%] top-[16%] -rotate-3' },
  { text: 'charger!!', icon: Plug, className: 'bg-sun right-[6%] top-[12%] rotate-2' },
  { text: 'sunscreen', icon: Droplets, className: 'bg-lilac left-[8%] bottom-[16%] rotate-2' },
  { text: 'just in case', icon: Umbrella, className: 'bg-sky right-[6%] bottom-[20%] -rotate-2' },
];

// Shared frame for log in, sign up and password pages
export default function AuthShell({ title, accent, intro, children }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper px-4 py-6 text-ink sm:px-6">
      <Link to="/" className="relative z-10 self-start rounded-lg">
        <Logo />
      </Link>

      {NOTES.map(({ text, icon: Icon, className }) => (
        <div
          key={text}
          aria-hidden="true"
          className={`absolute hidden items-center gap-2 rounded-xl border-2 border-ink px-4 py-3 text-sm font-bold shadow-pop lg:flex ${className}`}
        >
          <Icon size={16} strokeWidth={2.2} />
          {text}
        </div>
      ))}

      <div className="relative z-10 flex flex-1 items-center justify-center py-10">
        <div className="animate-page-in w-full max-w-md rounded-2xl border-2 border-ink bg-card p-6 shadow-pop-lg sm:p-8">
          <h1 className="font-display text-4xl">
            {title} {accent && <span className="font-accent text-[1.1em]">{accent}</span>}
          </h1>
          {intro && <p className="mt-3 text-muted">{intro}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

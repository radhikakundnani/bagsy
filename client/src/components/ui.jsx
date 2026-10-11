// Bagsy's shared building blocks. Every page uses these so the look stays consistent.
import { useState } from 'react';

// Each button colour has its own hover colour
const BUTTON_VARIANTS = {
  ink: 'bg-ink text-card hover:bg-tomato',
  tomato: 'bg-tomato text-card hover:bg-ink',
  paper: 'bg-card text-ink hover:bg-sun',
};

const BUTTON_SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

// Chunky pill button: lifts on hover, presses flat on click (styles in index.css)
export function Button({ variant = 'ink', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`btn inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-bold disabled:pointer-events-none disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export const inputClass =
  'smooth w-full rounded-xl border-2 border-ink bg-card px-4 py-3 text-ink placeholder:text-muted';

// A label + input wrapper
export function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-bold">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

// Password box with a Show / Hide toggle
export function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} className={`${inputClass} pr-20 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="smooth absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-sun"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

// Big headline with an optional italic serif word, e.g. <Title accent="trips">Your</Title>
export function Title({ children, accent, className = '', as: Tag = 'h1' }) {
  return (
    <Tag className={`font-display text-4xl text-balance md:text-5xl ${className}`}>
      {children}
      {accent && (
        <>
          {' '}
          <span className="relative inline-block whitespace-nowrap">
            <span className="font-accent text-[1.1em]">{accent}</span>
            <Squiggle className="absolute -bottom-1.5 left-0 w-full text-tomato" />
          </span>
        </>
      )}
    </Tag>
  );
}

export function Squiggle({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 82 6 T 102 6 T 118 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Round outlined badge holding a line icon
export function IconBadge({ icon: Icon, tint = 'bg-card', size = 'md', className = '' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const icons = { sm: 16, md: 20, lg: 26 };
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink ${tint} ${sizes[size]} ${className}`} aria-hidden="true">
      <Icon size={icons[size]} strokeWidth={2} />
    </span>
  );
}

// White card with an ink outline. Every card uses the same 24px padding.
export function Card({ children, className = '', shadow = true, as: Tag = 'div' }) {
  return <Tag className={`rounded-2xl border-2 border-ink bg-card p-6 ${shadow ? 'shadow-pop' : ''} ${className}`}>{children}</Tag>;
}

// Progress bar: ink fill, turns green when everything's packed
export function ProgressBar({ packed = 0, total = 0, className = 'h-2.5', label = 'Packing progress' }) {
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;
  return (
    <div
      className={`overflow-hidden rounded-full border-2 border-ink bg-paper ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full transition-[width] duration-500 ease-bagsy ${pct === 100 ? 'bg-lime-deep' : 'bg-ink'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Alert({ children, tone = 'error' }) {
  const tones = { error: 'bg-peach', info: 'bg-sky', success: 'bg-lime' };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border-2 border-ink px-4 py-3 text-sm font-medium ${tones[tone]}`}>
      {children}
    </div>
  );
}

// Three bouncing dots
export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20" role="status" aria-label={label}>
      {['bg-tomato', 'bg-sun-deep', 'bg-sky-deep'].map((c, i) => (
        <span key={c} className={`h-3.5 w-3.5 animate-bounce rounded-full border-2 border-ink ${c}`} style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

// Toast message that pops up from the bottom
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8" role="status">
      <div className={`animate-pop-in rounded-full border-2 border-ink px-5 py-2.5 text-sm font-bold shadow-pop ${toast.type === 'error' ? 'bg-peach' : 'bg-lime'}`}>
        {toast.message}
      </div>
    </div>
  );
}

// The luggage tag, with a string loop and list lines
export function TagMark({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={`logo-tag -rotate-[14deg] ${className}`}>
      <path d="M18 19 C 8 19, 3 10, 8 6 C 13 2, 19 8, 18 19" fill="none" stroke="#14100B" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 13 L19 8 L36 8 L36 31 L19 31 L13 26 Z" fill="#E5532D" stroke="#14100B" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="18" cy="19.5" r="2.4" fill="#FFFCF7" stroke="#14100B" strokeWidth="1.8" />
      <path d="M23.5 14.5 H32 M23.5 19.5 H32 M23.5 24.5 H29.5" stroke="#FFFCF7" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function Logo({ className = '' }) {
  return (
    <span className={`logo inline-flex items-center gap-2 font-display text-2xl lowercase ${className}`}>
      <TagMark />
      bagsy
    </span>
  );
}

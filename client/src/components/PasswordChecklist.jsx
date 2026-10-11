import { passwordRules } from '../utils/passwordRules';

// Shows each password rule with a tick once it's met, updating as the user types.
export default function PasswordChecklist({ password }) {
  return (
    <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2" aria-live="polite">
      {passwordRules.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.label} className={`flex items-center gap-2 ${met ? 'text-ink' : 'text-muted'}`}>
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full border border-ink text-[10px] font-black ${met ? 'bg-lime' : 'bg-card'}`}
              aria-hidden="true"
            >
              {met ? '✓' : ''}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

import { passwordRules } from '../utils/passwordRules';

// Shows each password rule with a tick once it's met, updating as the user types.
export default function PasswordChecklist({ password }) {
  return (
    <ul className="text-sm flex flex-col gap-1 -mt-1">
      {passwordRules.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.label} className={met ? 'text-green-300' : 'text-beige/60'}>
            {met ? '✓' : '○'} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

// Same rules as client/src/utils/passwordRules.js. The browser checks them for a nice live checklist,
// but the server must check them too, because anyone can call the API without using our website.
const passwordRules = [
  { label: 'at least 8 characters', test: (p) => p.length >= 8 },
  { label: 'an uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'a lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'a number', test: (p) => /\d/.test(p) },
  { label: 'a symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Returns an error message, or null if the password is fine
const passwordProblem = (password) => {
  if (typeof password !== 'string') return 'Please provide a password';
  if (password.length > 128) return 'Password must be 128 characters or fewer';
  const missing = passwordRules.filter((r) => !r.test(password)).map((r) => r.label);
  return missing.length ? `Password needs ${missing.join(', ')}` : null;
};

module.exports = { passwordProblem };

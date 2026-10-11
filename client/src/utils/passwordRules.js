// One place for the password rules, shared by Signup and ResetPassword.
// Each rule has a label to show the user and a test function.
export const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  // Any character that isn't a letter or number counts as a symbol (# . _ - @ ! ...)
  { label: 'A symbol, like # @ ! or .', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const isStrongPassword = (p) => passwordRules.every((rule) => rule.test(p));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Calm base: warm paper, off-white cards, near-black ink outlines
        paper: '#F4EFE6',
        card: '#FFFCF7',
        ink: '#14100B',
        muted: '#5A5248', // secondary text, still readable on paper and card
        tomato: '#E5532D', // the one loud colour: main buttons and the logo
        // Soft tints for fills, with a stronger shade for thin accents
        sky: { DEFAULT: '#DCE6FB', deep: '#5B82E8' },
        lilac: { DEFAULT: '#F1DFF6', deep: '#B96AD3' },
        sun: { DEFAULT: '#FBE6B5', deep: '#F2A818' },
        lime: { DEFAULT: '#E7F2C4', deep: '#7FA81E' },
        peach: { DEFAULT: '#FADACB', deep: '#E5532D' },
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        accent: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        // Hard offset shadows, kept small
        pop: '3px 3px 0 0 #14100B',
        'pop-sm': '2px 2px 0 0 #14100B',
        'pop-lg': '5px 5px 0 0 #14100B',
      },
      transitionTimingFunction: {
        bagsy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

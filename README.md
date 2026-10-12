# Bagsy

**Weather-aware packing lists you can share with your travel crew.**

Tell Bagsy where you're going, when, why and what you'll get up to. It builds a packing list from the weather for those exact dates, the occasion, your activities and your preferences, then AI suggests the extras a fixed list would miss. Travelling with others? Share an invite link: everyone gets their own list, and the trip admin can check them all.

## Features

- **Smart base list** from a rule-based engine: temperature bands, rain/snow/wind/humidity, climate type, 22 activities, 12 occasions (wedding, conference, trek…), trip type and length
- **Weather for your dates:** live forecast for trips in the next 5 days, typical weather (same dates last year) for trips further out
- **AI suggestions (Google Gemini):** tailored extras based on the occasion, your notes and packing preferences, each with a reason; keep or dismiss them
- **Group trips:** invite link, a list per person, crew progress, admin can view members' lists, remove people or reset the link
- **Review fast:** filter by to-pack / packed, jump between categories, progress on every trip card, reminders 3 days before you leave
- **Mobile-first UI** with a bottom tab bar, ready to become an app

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Lucide icons
**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, bcrypt
**APIs:** OpenWeatherMap (current + 5-day forecast), Open-Meteo (historical weather), Google Gemini (structured JSON suggestions)
**Security:** helmet, CORS allow-list, rate limiting, server-side validation, NoSQL-injection protection, secrets kept server-side

## How it works

1. The React app sends trip details to the Express API (with the user's login token).
2. The server fetches weather for the trip dates and builds the rule-based list.
3. It asks Gemini for extra items using a JSON schema, then validates the reply before saving. If the AI is unavailable, the trip still works.
4. Each member of a group trip gets their own list, generated the same way with their own preferences.

API keys never reach the browser: the server calls OpenWeatherMap and Gemini, and the keys live in environment variables.

## Run locally

You need Node.js, a MongoDB connection string (a free MongoDB Atlas cluster works) and a free OpenWeatherMap API key. A Gemini API key is optional.

```bash
# backend (http://localhost:5001)
cd server
cp .env.example .env   # then fill in the values (see comments in the file)
npm install
npm run dev

# frontend (http://localhost:3000)
cd client
npm install
npm run dev
```

## Tests

```bash
cd server
npm run test:groups     # group trips: invites, roles, permissions
npm run test:security   # headers, CORS, rate limits, validation
npm run test:ai         # checks your Gemini key and prompt
```

The group and security tests use a separate throwaway database (`bagsy-test`) and delete it afterwards.

## Credits

Bagsy started as a two-person team project, *Smart Travel Planner*, built with [@breenu](https://github.com/breenu). This version extends it with the redesign, group trips, date-matched weather, AI suggestions and security hardening.

# Bagsy

**Plan it, pack it, post it. Together.**

**Live:** [bagsy-pi.vercel.app](https://bagsy-pi.vercel.app)  
<sub>Hosted on free plans: the first request after a quiet spell can take up to a minute while the server wakes up.</sub>

Bagsy is a trip planner for people who travel in groups and overpack anyway. Tell it where you're going, when and why, and it builds a packing list around the weather on your exact dates, the occasion and what you'll get up to. Then plan the days together, collect the reels and photo ideas you want to recreate, and tick things off as you pack.

> *Bagsy* (British slang): to call dibs. "Bagsy the window seat."

## What it does

**Packing lists that fit the trip**
- A rule-based engine builds the base list from temperature, rain, wind and humidity, 22 activities, 12 occasions (wedding, conference, trek…) and trip length
- Weather for your actual dates: the live forecast for trips in the next 5 days, typical weather for the same dates last year for trips further out
- AI suggestions from Google Gemini add the extras a fixed list would miss, each with a reason you can keep or dismiss
- An ML model sorts anything you add yourself into the right category as you type (more below)

**Made for groups**
- Share an invite link and everyone gets their own list, built around their own preferences
- The trip admin can check everyone's progress and view their lists
- **Itinerary:** a shared, day-by-day plan anyone on the trip can add to
- **Inspo board:** save reels, TikToks, pins and ideas to shoot, on a group board or a private one, and tick them off once they're shot
- Every section is optional, so a quick solo trip stays simple

**Built to be reviewed fast**
- Filter by to-pack or packed, jump between categories, see progress on every trip
- Password reset by email, and a reminder before you leave
- Mobile-first design, ready to become an app

## The ML item sorter

When you add your own item ("type c cable", "aadhaar card", "kajal"), Bagsy picks its category for you. This is a small text classifier I built and trained myself; the full process is in [`ml/train_item_sorter.ipynb`](ml/train_item_sorter.ipynb).

| Step | Approach | Accuracy |
|---|---|---|
| Baseline | Always guess the most common category | 33% |
| 1 | TF-IDF on letter chunks + logistic regression | 69% |
| 2 | Added whole words as features | 76%\* |
| 3 | Sentence embeddings (all-MiniLM-L6-v2) + logistic regression | 82%\* |
| 4 | Tuned regularisation (C = 10) | **84%\*** |

\*5-fold cross-validated, on 466 labelled items.

**What I did along the way**
- **Built the dataset:** exported 253 items from the packing rules, then wrote 213 more the way people actually type them (slang, typos, brands, Indian items) to fix class imbalance and match real input
- **Error analysis:** the letter-based model failed on items like "euros" and "mouse" because it had no idea what words mean, which pointed to embeddings
- **Calibration:** chose C = 10 over higher values with the same accuracy, so the model still sounds unsure when it is unsure
- **Shipping it:** the trained weights are exported to JSON and run in Node with Transformers.js, with a test that checks Node's predictions match Python's. Below 50% confidence the app suggests a category instead of choosing one, and if the model is unavailable the app works exactly as before.

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Lucide icons
**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, bcrypt, Nodemailer
**ML:** Python, pandas, scikit-learn, sentence-transformers, Jupyter; Transformers.js in production
**APIs:** OpenWeatherMap, Open-Meteo, Google Gemini (structured JSON output)
**Security:** helmet, CORS allow-list, rate limiting, server-side validation, NoSQL-injection protection, secrets kept server-side

## How it works

1. The React app sends trip details to the Express API with the user's login token.
2. The server fetches weather for the trip dates and builds the rule-based list.
3. It asks Gemini for extra items using a JSON schema and validates the reply before saving. If the AI is unavailable, the trip still works.
4. Each person on a group trip gets their own list. The itinerary and the group inspo board are shared; private inspo ideas are never sent to anyone else.

API keys never reach the browser: the server calls the external APIs, and the keys live in environment variables.

## Run locally

You need Node.js, a MongoDB connection string (a free MongoDB Atlas cluster works) and a free OpenWeatherMap API key. Gemini and Gmail (for reset emails) are optional.

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
npm run test:sections   # itinerary + inspo board, including private ideas
npm run test:security   # headers, CORS, rate limits, validation
npm run test:sorter     # ML item sorter: Node matches the Python model
npm run test:ai         # checks your Gemini key and prompt
```

The database tests use a separate throwaway database (`bagsy-test`) and delete it afterwards.

## Credits

Bagsy started as a two-person team project, *Smart Travel Planner*, built with [@breenu](https://github.com/breenu). This version extends it with the redesign, group trips, itineraries, the inspo board, date-matched weather, AI suggestions, the ML item sorter and security hardening.

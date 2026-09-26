# Phone Cleaner — Strip Country Codes

A single-page React (Vite) app for cleaning a pasted list of phone numbers:
removes `+`, dashes, spaces, parentheses and dots, then removes the country
code — either auto-detected or chosen manually — with dark/light mode and
copy/download actions.

## Project structure

```
phone-cleaner/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx                # Main UI: textarea, controls, output, actions
│   ├── index.css              # Tailwind directives + base styles
│   ├── components/
│   │   └── ThemeToggle.jsx    # Dark/light toggle button
│   └── utils/
│       ├── phoneCleaner.js    # Cleaning + country-code-removal logic
│       ├── countryCodes.js    # Curated calling-code list (for select + auto-detect)
│       └── useTheme.js        # Theme state + localStorage persistence
└── .gitignore
```

## How the cleaning works

1. **Character cleanup** — every non-digit character (`+ - ( ) . space`) is
   stripped from each line.
2. **Country code removal** — four modes:
   - **Auto-detect**: tries to strip a known calling code (longest match
     first, e.g. `880` before `88`) whenever a number either starts with
     `+`/`00`, or is 11+ digits long (a strong hint it still carries a
     country code even without a `+`).
   - **Search country**: type-ahead search over ~150 countries (flag +
     name + code); the picked code is stripped from any number that starts
     with it.
   - **Custom code**: type any digits yourself (e.g. `258`) and that exact
     prefix is stripped — useful for codes not in the built-in list or
     for deliberately non-standard prefixes.
   - **None**: only the formatting is cleaned, no code is removed.
3. **Optional**: "Also drop leading local 0" strips a remaining leading `0`
   (common in local mobile formats) after the country code is gone.

A code is only stripped when doing so leaves at least 6 digits behind, to
avoid mangling short/local numbers. Each output row's colored dot shows
whether a code was removed (teal), the number was left unchanged (grey),
or no digits were found (amber) — hover a row to see the reason.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview   # optional local check of the production build
```

## Deploy to Vercel

**Option A — via GitHub (recommended)**
1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Vercel auto-detects Vite: Build Command `vite build`, Output Directory
   `dist`. Leave defaults and click **Deploy**.

**Option B — via Vercel CLI**
```bash
npm i -g vercel
vercel
```
Follow the prompts (first run links/creates the project); `vercel --prod`
deploys to production.

No environment variables or backend are needed — everything runs client-side.

# Larplete

Find a tennis or pickleball coach near you and reach your target level fast. Built for the LARP Hacks hackathon.

Larplete is a plain HTML, CSS and JavaScript app. There is no build step, no server code and no database: everything runs in the browser and is saved in that browser.

## Try it

- **Live:** deploy on Render (see below), or run it locally (see below).
- **Branches:** `main` is the final version (Combination V2). `daniel-original` and `ronbilia-original` hold the two original apps untouched. `combined` is the first merged version.

## How it works

Everyone starts at the same intro: **pick Student, Coach, or Recruiter**, then **enter your email**. Each role only sees its own screens. Returning users pick the same role and enter their email again to log in. There is no password (demo only).

**Student**
1. Answer one question per screen: sport, current level (from 1.0 "Never played" up to 5.0 "Competitive"), target level, how soon, your location and how far you will travel, language, budget, availability, and focus skill.
2. **Coaches:** coaches near you float on the board. Tap one to preview, then confirm.
3. **Chat:** your first message is a short questionnaire. It becomes a briefing for the coach, who also sees your answers.
4. **Inbox:** drills and notes from your coaches, and messages from recruiters.
5. **Videos:** upload a video of yourself playing (or add a link). Choose whether university recruiters can see it.
6. **Settings:** change any answer, redo the questions, or log out.

**Coach**
- Set up a profile and upload a certification (checked before you appear to students).
- **Overview:** student counts, and the students waiting for your reply.
- **Students:** everyone who sent you a request. Filter by status (New, Training, Ready), keep private notes, reply, and send drills and notes.
- **Activity:** send one drill to several students at once, and see a history of what you sent.

**Recruiter**
- Enter your university or club.
- **Find players:** browse student videos, filter by level and sport, save players, and message them. Messages land in the student's inbox.
- **My students:** the players you saved. Track each one (Watching, Contacted, Interested, Not a fit) and keep private notes.

To try all three roles at once, open three browser tabs on the same site and sign in as a different role in each. Each tab keeps its own sign-in, and they share the saved data. A tab shows another tab's changes after its next action or a reload.

## Run it locally

No build step and no internet needed (except for the two sample videos). Serve the folder:

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123/index.html. Opening `index.html` directly also works.

## Deploy on Render

Larplete is a static site, so use a **Static Site** on Render:

1. In Render, choose **New > Static Site** and connect this GitHub repository.
2. Branch: `main`.
3. Build command: leave empty.
4. Publish directory: `.`

The repository also includes a `render.yaml`, so you can use **New > Blueprint** instead and Render fills these in for you.

Each visitor's data is saved only in their own browser, so nothing is shared between people and there is nothing to configure.

## AI features (optional)

Everything works without a key. With a key, the AI upgrades three things:

| Feature | With key | Without key |
|---|---|---|
| Coach briefing | AI summary | Template sentence |
| Seeded coach replies | AI in character | Scripted replies |
| Certificate check | AI reads the file | Demo mode: accepted, clearly labelled as not verified |

To turn it on locally, copy `config.example.js` to `config.local.js` and paste your Anthropic API key. `config.local.js` is git-ignored. The key is used from the browser, so anyone who opens the page can see it. Fine for a local demo, never put a real key on a public site. The deployed version runs without a key.

`config.local.js` is deliberately not in the repository. On Render, `render.yaml` serves the empty `config.example.js` in its place. If you open a fresh clone locally without creating `config.local.js`, the browser logs one harmless 404 for it and the app works as normal.

## Files

- `index.html`, `styles.css`: page shell and styles (no external libraries)
- `data.js`: fictional coaches, skill levels, locations and distances, drills
- `state.js`: accounts and data in localStorage, the sign-in session, safe saving across tabs, small helpers
- `ai.js`: briefing, coach replies, certificate check, and their fallbacks
- `app.js`: all screens for the three roles
- `config.example.js`, `config.local.js` (git-ignored)
- `render.yaml`: Render static site settings

## Notes

- Coaches, players and videos are fictional demo data. The two sample tennis videos load from an outside site, so they will not play offline.
- Distances between cities are approximate. Locations are limited to Greater Toronto Area cities and postal codes.
- Uploaded videos are stored in this browser (IndexedDB), up to 100 MB each.
- Use Settings, then Reset all demo data, to start over.

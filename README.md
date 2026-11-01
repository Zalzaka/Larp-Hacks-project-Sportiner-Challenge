# Larplete

Find a tennis or pickleball coach near you and reach your target level fast. Built for the LARP Hacks hackathon, Larplete subtopic.

> **Branch: `combined`.** Daniel's app is the base, with ideas from ronbilia's `larplete_app.html` added on top
> (recruiter role, videos for recruiters, coach drills and notes, mobile bottom navigation).
> The two originals are kept untouched on `daniel-original` and `ronbilia-original`.

## How it works

Everyone starts at the same intro: **enter your email**, then pick **Student, Coach, or Recruiter**. Each role only sees its own screens. Returning users enter their email again to log in and skip the setup. There is no password (demo only).

**Student**
1. Answer one question per screen: sport, current level (from 1.0 "Never played" up to 5.0 "Competitive"), target level, how soon, your location and how far you will travel, language, budget, availability, and focus skill.
2. **Coaches:** coaches near you float on the board. Tap one to preview, then confirm.
3. **Chat:** your first message is a short questionnaire. It becomes a briefing for the coach, who also sees your answers.
4. **Inbox:** drills and notes from your coaches, and messages from recruiters.
5. **Videos:** upload a video of yourself playing (or add a link). Choose whether university recruiters can see it.
6. **Settings:** change any answer, redo the questions, or log out.

**Coach:** set up a profile, upload a certification (checked before you appear to students), then use the coach panel to reply to students and send them drills and notes.

**Recruiter:** enter your university or club, browse student videos, filter by level and sport, and message players. Messages land in the student's inbox.

To try all three roles, log out and sign up with a different email for each. Everything is stored in this browser.

## Run it

No build step and no internet needed. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8123
```

## AI features (optional)

Everything works without a key. With a key, the AI upgrades three things:

| Feature | With key | Without key |
|---|---|---|
| Coach briefing | AI summary | Template sentence |
| Seeded coach replies | AI in character | Scripted replies |
| Certificate check | AI reads the file | Demo mode: accepted, clearly labelled as not verified |

To turn it on, copy `config.example.js` to `config.local.js` and paste your Anthropic API key. `config.local.js` is git-ignored. The key is used from the browser, so anyone who opens the page can see it. Fine for a demo, not for production.

## Files

- `index.html`, `styles.css`: page shell and styles (no external libraries)
- `data.js`: fictional coaches, skill levels, locations and distances, drills
- `state.js`: accounts and data in localStorage, the sign-in session, small helpers
- `ai.js`: briefing, coach replies, certificate check, and their fallbacks
- `app.js`: all screens for the three roles
- `config.example.js`, `config.local.js` (git-ignored)

## Notes

- Coaches, players and videos are fictional demo data. The two sample tennis videos load from an outside site, so they will not play offline.
- Distances between cities are approximate. Locations are limited to Greater Toronto Area cities and postal codes.
- Uploaded videos are stored in this browser (IndexedDB), up to 100 MB each.
- Use Settings, then Reset all demo data, to start over.

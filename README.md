# Sportiner Crash Course

Find a tennis or pickleball coach and get competition-ready fast. Built for the LARP Hacks hackathon, Sportiner subtopic.

## How it works

**Students**
1. Choose Tennis or Pickleball, then your level.
2. Coaches tab: filter by price, language, area, availability, and skill, then pick a coach from the floating board.
3. Chat tab: your first message is a short questionnaire (skills, goal, competition, schedule). It's turned into an AI briefing the coach sees, along with your profile. After the coach replies, chat freely.
4. Settings: change sport, level, or language.

**Coaches**
1. Set up a profile and upload a certification.
2. The certificate is checked before you appear to students.
3. Coach home shows incoming students, their briefing, and a reply box.

Demo tip: you can be both. Register as a coach, switch role to student, find yourself in the Coaches tab, send a request, then switch back to coach to reply.

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

To turn it on, copy `config.example.js` to `config.local.js` and paste your Anthropic API key. `config.local.js` is git-ignored.

The key is used from the browser, so anyone who opens the page can see it. Fine for a demo, not for production.

## Files

- `index.html`, `styles.css`: page shell and styles (no external libraries)
- `data.js`: fictional coaches and constants
- `state.js`: saved state in localStorage and small helpers
- `ai.js`: briefing, coach replies, certificate check, and their fallbacks
- `app.js`: all screens
- `config.example.js`, `config.local.js` (git-ignored)

## Notes

- Coaches are fictional. No real people or endorsements.
- All data stays in your browser's localStorage. Use Settings → Reset all demo data to start over.
- `sportiner_crash_course.html` is an earlier prototype kept for reference.

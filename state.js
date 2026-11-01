const STORAGE_KEY = 'sportiner_v3';

function freshState() {
  return {
    role: null, // 'student' | 'coach'
    student: null, // answers from the onboarding wizard: sport, level, language, area, maxPrice, avail, skill, fastOnly, onboarded
    coach: null, // { name, sports, languages, area, price, avail, specialties, bio, status, certName, reason, source }
    confirmed: [], // coach ids
    threads: {}, // coachId -> { answers, briefing: {text, source}, messages: [{from, text}] }
    ui: { screen: 'landing', tab: 'coaches', openThread: null, preview: null },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const base = freshState();
      return { ...base, ...saved, ui: { ...base.ui, ...saved.ui, preview: null } };
    }
  } catch (e) {
    console.warn('Could not read saved state, starting fresh:', e);
  }
  return freshState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear saved state:', e);
  }
  state = freshState();
}

let state = loadState();

// ---------- small helpers ----------

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(dateStr + 'T00:00:00') - today) / 86400000);
}

function todayPlus(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function skillNames(skills) {
  return skills.map((s) => SKILLS[s]).join(', ');
}

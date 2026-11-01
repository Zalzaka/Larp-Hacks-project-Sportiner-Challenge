const STORAGE_KEY = 'sportiner_v4';
const SESSION_KEY = 'sportiner_session_v4';

// Everything lives in this browser's localStorage. There is no server and no password: sign-in is by email only (demo).
function freshState() {
  return {
    accounts: {}, // email -> { email, role, student?, coach?, recruiter?, confirmed: [coachId], inbox: [item] }
    threads: {}, // `${studentEmail}::${coachId}` -> { student, coachId, answers, briefing, messages: [{from, text}] }
    clips: [], // videos posted by students
    ui: { screen: 'auth', tab: 'coaches', openThread: null, openStudent: null, preview: null, contact: null },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const base = freshState();
      return { ...base, ...saved, ui: { ...base.ui, ...saved.ui, preview: null, contact: null } };
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

// The signed-in email lives in sessionStorage, so every new visit starts at the sign-in screen.
function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch (e) {
    return null;
  }
}

function writeSession(email) {
  try {
    if (email) sessionStorage.setItem(SESSION_KEY, email);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('Could not save the session:', e);
  }
  session = email || null;
}

function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear saved state:', e);
  }
  state = freshState();
  writeSession(null);
}

let state = loadState();
let session = readSession();

function me() {
  return (session && state.accounts[session]) || null;
}

// ---------- small helpers ----------

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function skillNames(skills) {
  return skills.map((s) => SKILLS[s]).join(', ');
}

function nameOf(email) {
  const local = String(email).split('@')[0].replace(/[._-]+/g, ' ').trim();
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'Student';
}

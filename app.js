let typingFor = null; // coach id whose reply is in flight
let certFile = null; // uploaded file, kept in memory only
let toastTimer = null;

const $ = (id) => document.getElementById(id);

function go(patch) {
  Object.assign(state.ui, patch);
  saveState();
  render();
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

function showError(id, message) {
  const el = $(id);
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

// ---------- shared pieces ----------

function opts(list, selected) {
  return list.map((v) => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(v)}</option>`).join('');
}

function chipList(name, entries, selected = []) {
  return entries
    .map(([value, label]) => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(value)}" ${selected.includes(value) ? 'checked' : ''}><span>${esc(label)}</span></label>`)
    .join('');
}

function checkedValues(form, name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);
}

function avatar(coach, size = 64, extra = '') {
  const hue = [...coach.id].reduce((sum, ch) => sum + ch.charCodeAt(0) * 37, 0) % 360;
  const initials = coach.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return `<div class="avatar ${extra}" style="width:${size}px;height:${size}px;font-size:${Math.round(size / 3)}px;background:linear-gradient(135deg,hsl(${hue} 70% 45%),hsl(${(hue + 50) % 360} 70% 32%))">${esc(initials)}</div>`;
}

function myListing() {
  const c = state.coach;
  if (!c || c.status !== 'verified') return null;
  return { id: 'me', name: c.name, sports: c.sports, languages: c.languages, area: c.area, pricePerHour: c.price, rating: null, specialties: c.specialties, avail: c.avail, fastTrack: false, bio: c.bio, persona: '', isMe: true };
}

function allCoaches() {
  const mine = myListing();
  return mine ? [...COACHES, mine] : COACHES;
}

function coachById(id) {
  return allCoaches().find((c) => c.id === id);
}

function sportLabel(coach) {
  return coach.sports.map((s) => SPORTS[s]).join(' & ');
}

// ---------- shell: header, tabs, routing ----------

function goBrand() {
  if (state.role === 'student') go({ screen: 'home' }); // the flow guard sends unfinished students back to their step
  else if (state.role === 'coach' && state.coach && state.coach.status === 'verified') go({ screen: 'coachhome' });
  else go({ screen: 'landing' });
}

function switchRole() {
  state.role = null;
  go({ screen: 'landing', preview: null });
}

function renderShell() {
  const screen = state.ui.screen;
  const inApp = screen === 'home' || screen === 'coachhome';
  $('header-right').innerHTML = inApp ? `<button class="link-btn" onclick="switchRole()">Switch role</button>` : '';

  const tabs = $('tabs');
  if (screen === 'home') {
    tabs.classList.remove('hidden');
    tabs.innerHTML = [['coaches', 'Coaches'], ['chat', 'Chat'], ['settings', 'Settings']]
      .map(([id, label]) => `<button class="tab ${state.ui.tab === id ? 'active' : ''}" onclick="openTab('${id}')">${label}</button>`)
      .join('');
  } else {
    tabs.classList.add('hidden');
    tabs.innerHTML = '';
  }
}

// Nothing past a step can be reached until that step is done.
function enforceFlow() {
  const ui = state.ui;
  if (!state.role) {
    ui.screen = 'landing';
    return;
  }
  if (state.role === 'student') {
    const s = state.student || {};
    const done = WIZARD.every((st) => s[st.key] !== undefined);
    if (!done) ui.screen = 'wizard';
    else if (!s.onboarded) ui.screen = 'ready';
    else ui.screen = 'home';
  } else {
    const c = state.coach;
    const verified = c && c.status === 'verified';
    if (ui.screen === 'coachhome' && !verified) ui.screen = !c ? 'cprofile' : c.status === 'draft' ? 'ccert' : 'cverify';
    if ((ui.screen === 'ccert' || ui.screen === 'cverify') && !c) ui.screen = 'cprofile';
    if (!['cprofile', 'ccert', 'cverify', 'coachhome'].includes(ui.screen)) ui.screen = verified ? 'coachhome' : 'cprofile';
  }
}

function render() {
  enforceFlow();
  renderShell();
  const views = { landing, wizard, ready, cprofile, ccert, cverify, home, coachhome };
  $('app').innerHTML = (views[state.ui.screen] || landing)();

  const box = document.querySelector('[data-scroll-end]');
  if (box) box.scrollIntoView({ block: 'end' });
}

// ---------- landing ----------

function landing() {
  return `
    <h1 class="h1 wz-title">Get competition-ready, <span class="neon">fast.</span></h1>
    <p class="muted mt1 wz-sub">First, tell us who you are.</p>
    <div class="tiles">
      <button class="tile" onclick="chooseRole('student')"><span class="tile-icon">🎓</span><span class="tile-text"><span class="tile-label">I'm a student</span><span class="tile-desc">Find a coach and start training</span></span></button>
      <button class="tile" onclick="chooseRole('coach')"><span class="tile-icon">🧑‍🏫</span><span class="tile-text"><span class="tile-label">I'm a coach</span><span class="tile-desc">Get verified and meet students</span></span></button>
    </div>`;
}

function chooseRole(role) {
  state.role = role;
  if (role === 'student') {
    state.student = state.student || {};
    go({ screen: 'home' });
  } // lands on the first unfinished step
  else go({ screen: state.coach && state.coach.status === 'verified' ? 'coachhome' : 'cprofile' });
}

// ---------- student onboarding: one full-screen question at a time ----------

function dots(step, total) {
  return `<div class="dots">${Array.from({ length: total }, (_, i) => `<i class="${i < step ? 'on' : ''}"></i>`).join('')}</div>`;
}

const LEVEL_ICONS = { 1: '🌱', 2: '🙂', 3: '🎯', 4: '🔥', 5: '🏆' };
const SKILL_ICONS = { serve: '🚀', forehand: '💥', backhand: '🔁', volley: '🧱', smash: '⚡', return: '🛡️', footwork: '👟' };
const LANG_ICONS = { English: '🇨🇦', French: '🇫🇷', Spanish: '🇪🇸', Mandarin: '🇨🇳', Hindi: '🇮🇳', Russian: '🇷🇺' };

// Each entry is one screen. options() returns [value, icon, label, description?].
const WIZARD = [
  { key: 'sport', short: 'Sport', title: 'What do you want to play?', sub: 'You can change this later in Settings.', options: () => [['tennis', '🎾', 'Tennis'], ['pickleball', '🏓', 'Pickleball']] },
  { key: 'level', short: 'Level', title: "What's your level?", layout: 'list', options: () => Object.entries(LEVELS).map(([n, l]) => [Number(n), LEVEL_ICONS[n], `${n} · ${l.label}`, l.desc]) },
  { key: 'language', short: 'Coach language', title: 'Which language should your coach speak?', options: () => LANGUAGES.map((l) => [l, LANG_ICONS[l], l]) },
  { key: 'area', short: 'Area', title: 'Where do you want to train?', options: () => [...AREAS.map((a) => [a, '📍', a]), ['Any', '🗺️', 'Anywhere in the GTA']] },
  { key: 'maxPrice', short: 'Budget per hour', title: "What's your budget per hour?", options: () => [[50, '💵', 'Up to $50'], [65, '💵', 'Up to $65'], [80, '💰', 'Up to $80'], [999, '💎', 'Any price']] },
  { key: 'avail', short: 'Availability', title: 'When can you train?', options: () => [['weekdays', '🌅', 'Weekdays'], ['evenings', '🌙', 'Evenings'], ['weekends', '🏖️', 'Weekends'], ['Any', '🕒', 'Any time']] },
  { key: 'skill', short: 'Focus skill', title: 'What do you want to work on most?', options: () => [...Object.entries(SKILLS).map(([k, v]) => [k, SKILL_ICONS[k], v]), ['Any', '🤷', 'Not sure yet']] },
  { key: 'fastOnly', short: 'Fast track', title: 'Is a competition coming up soon?', sub: 'Fast-track coaches can get you ready in under 4 weeks.', options: () => [[true, '⚡', 'Yes, I need fast prep'], [false, '🐢', 'No rush']] },
];

function currentStep() {
  const s = state.student || {};
  return WIZARD.findIndex((st) => s[st.key] === undefined);
}

function optionLabel(key, value) {
  const step = WIZARD.find((st) => st.key === key);
  const hit = step.options().find(([v]) => v === value);
  return hit ? `${hit[1]} ${hit[2]}` : String(value);
}

function wizard() {
  const i = currentStep();
  const st = WIZARD[i];
  const options = st.options();
  const pct = Math.round((i / (WIZARD.length + 1)) * 100);
  return `
    <div class="wz-top">
      <button class="wz-back" onclick="wizardBack()" aria-label="Back">←</button>
      <div class="wz-bar"><i style="width:${pct}%"></i></div>
      <span class="muted small">${i + 1}/${WIZARD.length}</span>
    </div>
    <h1 class="h1 wz-title">${esc(st.title)}</h1>
    ${st.sub ? `<p class="muted mt1 wz-sub">${esc(st.sub)}</p>` : ''}
    <div class="tiles ${st.layout === 'list' ? 'list' : ''}">
      ${options
        .map(([v, icon, label, desc]) => `<button class="tile" onclick="answerStep('${st.key}', ${esc(JSON.stringify(v))}, this)">
          <span class="tile-icon">${icon}</span><span class="tile-text"><span class="tile-label">${esc(label)}</span>${desc ? `<span class="tile-desc">${esc(desc)}</span>` : ''}</span></button>`)
        .join('')}
    </div>`;
}

function answerStep(key, value, el) {
  if (el) el.classList.add('picked');
  setTimeout(() => {
    state.student = state.student || {};
    state.student[key] = value;
    go({});
  }, 160);
}

function wizardBack() {
  const i = currentStep();
  if (i <= 0) {
    state.role = null;
    go({ screen: 'landing' });
    return;
  }
  delete state.student[WIZARD[i - 1].key];
  go({});
}

function ready() {
  const s = state.student;
  return `
    <div class="wz-top">
      <button class="wz-back" onclick="readyBack()" aria-label="Back">←</button>
      <div class="wz-bar"><i style="width:100%"></i></div>
      <span class="muted small">Done</span>
    </div>
    <div style="font-size:56px;text-align:center" class="mt3">✅</div>
    <h1 class="h1 mt2" style="text-align:center">You're ready to start.</h1>
    <p class="muted mt1" style="text-align:center">We'll show coaches that fit you. Change any of this later in Settings.</p>
    <div class="chips mt3" style="justify-content:center;gap:8px">
      ${WIZARD.map((st) => `<span class="tag">${esc(optionLabel(st.key, s[st.key]))}</span>`).join('')}
    </div>
    <button class="btn mt4" onclick="startApp()">Start using Sportiner</button>`;
}

function readyBack() {
  delete state.student[WIZARD[WIZARD.length - 1].key];
  go({});
}

function startApp() {
  state.student.onboarded = true;
  go({ screen: 'home', tab: 'coaches', preview: null });
}

function openTab(id) {
  go({ tab: id, preview: null });
}

// ---------- student home ----------

function home() {
  const tab = state.ui.tab;
  if (tab === 'chat') return chatTab();
  if (tab === 'settings') return settingsTab();
  return orbitView();
}

// Hard filters: sport, language, budget, fast track. Area, availability and skill are
// preferences: coaches that match all of them glow, so the board is never empty by accident.
function softMatches(c) {
  const s = state.student;
  return {
    area: s.area !== 'Any' && c.area === s.area,
    avail: s.avail !== 'Any' && c.avail.includes(s.avail),
    skill: s.skill !== 'Any' && c.specialties.includes(s.skill),
  };
}

function isStrongMatch(c) {
  const s = state.student;
  const m = softMatches(c);
  return (s.area === 'Any' || m.area) && (s.avail === 'Any' || m.avail) && (s.skill === 'Any' || m.skill);
}

function filteredCoaches() {
  const s = state.student;
  return allCoaches()
    .filter((c) => c.sports.includes(s.sport) && c.pricePerHour <= s.maxPrice && c.languages.includes(s.language) && (!s.fastOnly || c.fastTrack))
    .sort((a, b) => Number(isStrongMatch(b)) - Number(isStrongMatch(a)));
}

// ----- coaches: floating view -----

function orbitView() {
  const list = filteredCoaches();
  const bubbles = list
    .map((c, i) => {
      const ring = i % 2;
      const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2;
      const left = 50 + Math.cos(angle) * (ring ? 0.37 : 0.3) * 100;
      const top = 50 + Math.sin(angle) * (ring ? 0.43 : 0.34) * 100;
      const dur = 5 + (i % 4);
      const delay = -(i * 0.9);
      const dx = (i % 2 ? 1 : -1) * (8 + (i % 3) * 4);
      const dy = (i % 3 ? -1 : 1) * (10 + (i % 2) * 5);
      return `<button class="bubble" style="left:${left}%;top:${top}%" onclick="previewCoach('${c.id}')" aria-label="Preview ${esc(c.name)}">
        <span class="bubble-inner" style="--d:${dur}s;--delay:${delay}s;--dx:${dx}px;--dy:${dy}px">${avatar(c, 68, isStrongMatch(c) ? 'match' : '')}<span class="bubble-name">${esc(c.name.split(' ')[0])}</span></span></button>`;
    })
    .join('');

  return `
    <div class="row between">
      <button class="link-btn" onclick="openTab('settings')">⚙ Preferences</button>
      <span class="muted small">${list.length} coach${list.length === 1 ? '' : 'es'}</span>
    </div>
    ${list.length
      ? `<div class="orbit">${bubbles}<div class="orbit-center"><div class="h2">Choose your coach</div></div></div>`
      : `<div class="card mt3"><p class="h3">No coaches match your preferences yet.</p><p class="muted mt1">Try a different language, budget, or turn off fast track.</p><button class="btn mt2" onclick="openTab('settings')">Change preferences</button></div>`}
    ${list.length ? '<p class="muted tiny" style="text-align:center">Glowing coaches match your area, schedule and skill.</p>' : ''}
    ${state.ui.preview ? previewModal(state.ui.preview) : ''}`;
}

function previewCoach(id) {
  go({ preview: id });
}

function previewModal(id) {
  const c = coachById(id);
  if (!c) return '';
  const confirmed = state.confirmed.includes(id);
  return `
    <div class="backdrop" onclick="if(event.target===this) go({preview:null})">
      <div class="modal" role="dialog" aria-label="${esc(c.name)}">
        <div class="row">
          ${avatar(c, 72)}
          <div>
            <h3 class="h2">${esc(c.name)}</h3>
            <p class="muted small">${sportLabel(c)} · ${esc(c.area)}</p>
            <div class="row mt1" style="gap:6px">
              ${c.isMe ? '<span class="pill dim">You (demo)</span>' : '<span class="pill ok">✓ Verified</span>'}
              ${c.fastTrack ? '<span class="pill">FAST TRACK</span>' : ''}
              ${isStrongMatch(c) ? '<span class="pill">GREAT MATCH</span>' : ''}
            </div>
          </div>
        </div>
        <p class="mt2">${esc(c.bio)}</p>
        <div class="chips mt2" style="gap:6px">${c.specialties.map((s) => `<span class="tag">${SKILLS[s]}</span>`).join('')}</div>
        <p class="muted small mt2">$${c.pricePerHour}/hr · ${c.rating ? '★ ' + c.rating : 'New coach'} · ${esc(c.languages.join(', '))} · ${c.avail.map((a) => AVAIL[a]).join(', ')}</p>
        <div class="grid2 mt3">
          <button class="btn ghost" onclick="go({preview:null})">Back</button>
          <button class="btn" onclick="confirmCoach('${c.id}')">${confirmed ? 'Open chat' : 'Confirm coach'}</button>
        </div>
      </div>
    </div>`;
}

function confirmCoach(id) {
  if (!state.confirmed.includes(id)) state.confirmed.push(id);
  if (!state.threads[id]) state.threads[id] = { answers: null, briefing: null, messages: [] };
  go({ tab: 'chat', openThread: id, preview: null });
}

// ---------- chat ----------

function chatTab() {
  if (state.ui.openThread) return threadView(state.ui.openThread);
  if (!state.confirmed.length) {
    return `<h2 class="h2">Chat</h2><div class="card mt2"><p class="h3">No coaches yet.</p><p class="muted mt1">Confirm a coach to start a conversation.</p><button class="btn mt2" onclick="openTab('coaches')">Find a coach</button></div>`;
  }
  return `<h2 class="h2">Chat</h2>${state.confirmed
    .map((id) => {
      const c = coachById(id);
      const t = state.threads[id];
      if (!c || !t) return '';
      const last = t.messages[t.messages.length - 1];
      const preview = !t.answers ? 'Send your request to start' : last ? last.text : 'Request sent. Waiting for a reply.';
      return `<button class="listrow" onclick="go({openThread:'${id}'})">${avatar(c, 48)}<div class="grow"><div class="h3">${esc(c.name)}</div><div class="muted small clip">${esc(preview)}</div></div></button>`;
    })
    .join('')}`;
}

function threadHead(c) {
  return `
    <button class="link-btn" onclick="go({openThread:null})">← All chats</button>
    <div class="row mt1">${avatar(c, 48)}<div><h2 class="h3">${esc(c.name)}</h2><p class="muted small">${sportLabel(c)} · $${c.pricePerHour}/hr</p></div></div>`;
}

function questionnaire(c) {
  const s = state.student;
  return `
    <p class="muted mt2">This is your first message to ${esc(c.name.split(' ')[0])}. Answer a few questions so they know exactly what you need. We'll turn it into a short briefing.</p>
    <form class="form mt2" onsubmit="sendRequest(event, '${c.id}')">
      <div><span class="lbl small" style="font-weight:700">Which skills do you want to develop most?</span>
        <div class="chips mt1">${chipList('qskill', Object.entries(SKILLS))}</div></div>
      <label class="field"><span class="lbl">What's your goal?</span><select name="qgoal" class="input">${opts(GOALS)}</select></label>
      <div class="grid2 stack">
        <label class="field"><span class="lbl">Sessions per week</span><select name="qsessions" class="input">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${n === 2 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="field"><span class="lbl">When can you train?</span><select name="qavail" class="input">${opts(['Weekdays', 'Evenings', 'Weekends', 'Flexible'])}</select></label>
      </div>
      <div class="grid2 stack">
        <label class="field"><span class="lbl">Competition (optional)</span><input name="qcomp" class="input" placeholder="e.g. Spring Club Open"></label>
        <label class="field"><span class="lbl">Competition date (optional)</span><input name="qdate" type="date" min="${todayPlus(1)}" class="input"></label>
      </div>
      <label class="field"><span class="lbl">Anything else? (optional)</span><textarea name="qnotes" class="input" placeholder="Injuries, preferences, questions..."></textarea></label>
      <p id="q-error" class="error hidden"></p>
      <button class="btn" type="submit">Send request to ${esc(c.name.split(' ')[0])}</button>
      <p class="muted tiny">Your coach also sees: ${SPORTS[s.sport]}, level ${s.level} (${LEVELS[s.level].label}), language ${esc(s.language)}.</p>
    </form>`;
}

function sendRequest(e, id) {
  e.preventDefault();
  const f = e.target;
  const skills = checkedValues(f, 'qskill');
  if (!skills.length) return showError('q-error', 'Pick at least one skill.');

  const answers = {
    skills,
    goal: f.qgoal.value,
    sessions: Number(f.qsessions.value),
    avail: f.qavail.value,
    competition: f.qcomp.value.trim(),
    date: f.qdate.value,
    notes: f.qnotes.value.trim(),
  };
  const thread = state.threads[id];
  thread.answers = answers;
  thread.briefing = { text: templateBriefing(state.student, answers), source: 'template' };
  thread.messages = [];
  saveState();
  render();

  const coach = coachById(id);
  summariseRequest(state.student, answers, coach).then((briefing) => {
    thread.briefing = briefing;
    saveState();
    render();
  });
  if (!coach.isMe) triggerCoachReply(id, true, '');
}

function answersList(a) {
  const rows = [
    ['Skills', skillNames(a.skills)],
    ['Goal', a.goal],
    ['Sessions per week', a.sessions],
    ['Availability', a.avail],
  ];
  if (a.competition) rows.push(['Competition', a.competition + (a.date ? ` · ${a.date}` : '')]);
  if (a.notes) rows.push(['Notes', a.notes]);
  return `<ul class="answers">${rows.map(([k, v]) => `<li><b>${k}:</b> ${esc(v)}</li>`).join('')}</ul>`;
}

function briefingCard(thread, coach, viewer) {
  const s = state.student;
  const sourceLabel = thread.briefing.source === 'ai' ? 'AI briefing' : 'Template briefing (no AI key)';
  const heading = viewer === 'student' ? `What ${esc(coach.name.split(' ')[0])} sees · ${sourceLabel}` : sourceLabel;
  return `
    <div class="brief"><div class="label">${heading}</div>
      <p class="mt1">${esc(thread.briefing.text)}</p>
      <p class="muted small mt1">${SPORTS[s.sport]} · Level ${s.level} (${LEVELS[s.level].label}) · ${esc(s.language)}</p></div>`;
}

function messagesHtml(thread, viewer) {
  const mine = viewer === 'student' ? 'student' : 'coach';
  return `<div class="msgs">${thread.messages.map((m) => `<div class="msg ${m.from === mine ? 'me' : 'them'}">${esc(m.text)}</div>`).join('')}</div>`;
}

function threadView(id) {
  const c = coachById(id);
  const t = state.threads[id];
  if (!c || !t) return `<p class="muted">Chat not found.</p><button class="btn mt2" onclick="go({openThread:null})">Back</button>`;
  if (!t.answers) return threadHead(c) + questionnaire(c);

  const coachReplied = t.messages.some((m) => m.from === 'coach');
  const typing = typingFor === id ? `<p class="typing mt1">${esc(c.name.split(' ')[0])} is typing…</p>` : '';
  const waiting = !coachReplied && typingFor !== id ? `<p class="muted small mt2">Waiting for ${esc(c.name.split(' ')[0])} to answer your request.</p>` : '';
  return `
    ${threadHead(c)}
    <div class="card mt2"><p class="small muted">You sent</p>${answersList(t.answers)}</div>
    ${briefingCard(t, c, 'student')}
    ${messagesHtml(t, 'student')}${typing}${waiting}
    <form class="chatbar" onsubmit="sendMessage(event, '${id}')">
      <input id="chat-input" class="input" placeholder="${coachReplied ? 'Message…' : 'Available after your coach replies'}" ${coachReplied ? '' : 'disabled'} autocomplete="off">
      <button class="btn" type="submit" ${coachReplied ? '' : 'disabled'}>Send</button>
    </form>
    <div data-scroll-end></div>`;
}

function sendMessage(e, id) {
  e.preventDefault();
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;
  state.threads[id].messages.push({ from: 'student', text });
  saveState();
  render();
  const coach = coachById(id);
  if (coach && !coach.isMe) triggerCoachReply(id, false, text);
  const next = $('chat-input');
  if (next) next.focus();
}

async function triggerCoachReply(id, isFirst, lastText) {
  const coach = coachById(id);
  const thread = state.threads[id];
  if (!coach || !thread) return;
  typingFor = id;
  render();
  const reply = await coachReply(coach, thread, state.student, isFirst, lastText);
  typingFor = null;
  thread.messages.push({ from: 'coach', text: reply.text });
  saveState();
  render();
}

// ---------- settings ----------

function settingsTab() {
  const s = state.student;
  return `
    <h2 class="h2">Settings</h2>
    <p class="muted mt1">Change the preferences you picked when you started.</p>
    <div class="form mt3">
      ${WIZARD.map(
        (st) => `<label class="field"><span class="lbl">${esc(st.short)}</span>
          <select class="input" data-pref="${st.key}">
            ${st.options().map(([v, icon, label]) => `<option value="${esc(JSON.stringify(v))}" ${JSON.stringify(s[st.key]) === JSON.stringify(v) ? 'selected' : ''}>${icon} ${esc(label)}</option>`).join('')}
          </select></label>`
      ).join('')}
      <button class="btn" onclick="saveSettings()">Save preferences</button>
      <button class="btn ghost" onclick="redoOnboarding()">Redo the questions</button>
      <button class="btn ghost" onclick="switchRole()">Switch role</button>
      <button class="link-btn" onclick="resetDemo()">Reset all demo data</button>
    </div>`;
}

function saveSettings() {
  document.querySelectorAll('[data-pref]').forEach((sel) => {
    state.student[sel.dataset.pref] = JSON.parse(sel.value);
  });
  saveState();
  toast('Preferences saved');
}

function redoOnboarding() {
  state.student = {};
  go({ screen: 'wizard', tab: 'coaches' });
}

function resetDemo() {
  if (!confirm('Reset all demo data and start over?')) return;
  resetState();
  typingFor = null;
  certFile = null;
  render();
}

// ---------- coach onboarding ----------

function cprofile() {
  const c = state.coach || {};
  return `
    ${dots(1, 3)}
    <h1 class="h1">Set up your coach profile</h1>
    <form class="form mt3" onsubmit="saveCoachProfile(event)">
      <label class="field"><span class="lbl">Your name</span><input name="cname" class="input" value="${esc(c.name || '')}" required></label>
      <div><span class="lbl small" style="font-weight:700">Sport</span>
        <div class="chips mt1">
          ${[['tennis', 'Tennis'], ['pickleball', 'Pickleball'], ['both', 'Both']]
            .map(([v, l]) => `<label class="chip"><input type="radio" name="csport" value="${v}" ${(c.sports ? (c.sports.length > 1 ? 'both' : c.sports[0]) : 'tennis') === v ? 'checked' : ''}><span>${l}</span></label>`)
            .join('')}
        </div></div>
      <div><span class="lbl small" style="font-weight:700">Languages</span><div class="chips mt1">${chipList('clang', LANGUAGES.map((l) => [l, l]), c.languages || ['English'])}</div></div>
      <div><span class="lbl small" style="font-weight:700">What you teach best</span><div class="chips mt1">${chipList('cskill', Object.entries(SKILLS), c.specialties || [])}</div></div>
      <div><span class="lbl small" style="font-weight:700">Availability</span><div class="chips mt1">${chipList('cavail', Object.entries(AVAIL), c.avail || [])}</div></div>
      <div class="grid2 stack">
        <label class="field"><span class="lbl">Area</span><select name="carea" class="input">${opts(AREAS, c.area)}</select></label>
        <label class="field"><span class="lbl">Price per hour ($)</span><input name="cprice" type="number" min="10" max="300" class="input" value="${c.price || ''}" required></label>
      </div>
      <label class="field"><span class="lbl">Short bio</span><textarea name="cbio" class="input" placeholder="What makes your coaching different?">${esc(c.bio || '')}</textarea></label>
      <p id="c-error" class="error hidden"></p>
      <button class="btn" type="submit">Continue</button>
    </form>`;
}

function saveCoachProfile(e) {
  e.preventDefault();
  const f = e.target;
  const languages = checkedValues(f, 'clang');
  const specialties = checkedValues(f, 'cskill');
  const avail = checkedValues(f, 'cavail');
  if (!languages.length) return showError('c-error', 'Pick at least one language.');
  if (!specialties.length) return showError('c-error', 'Pick at least one skill you teach.');
  if (!avail.length) return showError('c-error', 'Pick when you are available.');

  const sportChoice = f.csport.value;
  state.coach = {
    name: f.cname.value.trim(),
    sports: sportChoice === 'both' ? ['tennis', 'pickleball'] : [sportChoice],
    languages,
    area: f.carea.value,
    price: Number(f.cprice.value),
    avail,
    specialties,
    bio: f.cbio.value.trim() || 'New coach on Sportiner.',
    status: 'draft',
    certName: null,
    reason: '',
    source: '',
  };
  go({ screen: 'ccert' });
}

function ccert() {
  return `
    ${dots(2, 3)}
    <h1 class="h1">Upload your certification</h1>
    <p class="muted mt1">Coaches must be verified before students can see them. Upload a photo or PDF of your coaching certificate (PNG, JPG, WebP, or PDF, up to 5 MB).</p>
    <div class="form mt3">
      <label class="field"><span class="lbl">Certificate file</span><input id="cert-file" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" class="input"></label>
      <p id="cert-error" class="error hidden"></p>
      <button class="btn" onclick="startVerification()">Submit for verification</button>
      <button class="link-btn" onclick="go({screen:'cprofile'})">← Back to profile</button>
    </div>`;
}

function startVerification() {
  const file = $('cert-file').files[0];
  if (!file) return showError('cert-error', 'Choose a file first.');
  certFile = file;
  state.coach.status = 'checking';
  state.coach.certName = file.name;
  go({ screen: 'cverify' });

  checkCertificate(file, state.coach).then((res) => {
    state.coach.status = res.approved ? 'verified' : 'needs_review';
    state.coach.reason = res.reason;
    state.coach.source = res.source;
    saveState();
    render();
  });
}

function cverify() {
  const c = state.coach;
  if (!c) return landing();
  const checking = c.status === 'checking' && certFile;
  const interrupted = c.status === 'checking' && !certFile;

  if (checking) {
    return `<div class="card mt3" style="text-align:center;padding:32px 16px"><div class="spinner"></div><h2 class="h2 mt2">Checking your certificate…</h2><p class="muted mt1">${esc(c.certName)}</p></div>`;
  }
  if (c.status === 'verified') {
    const note = c.source === 'demo' ? `<p class="small mt2" style="color:var(--warn)">${esc(c.reason)}</p>` : `<p class="muted small mt2">${esc(c.reason)} (checked by AI)</p>`;
    return `
      ${dots(3, 3)}
      <div class="card mt2" style="text-align:center;padding:32px 16px"><p style="font-size:42px">✓</p><h2 class="h2">You're verified</h2>${note}</div>
      <button class="btn mt3" onclick="go({screen:'coachhome'})">Go to coach home</button>`;
  }
  const why = interrupted ? 'The check was interrupted. Please upload the file again.' : c.reason;
  return `
    <div class="card mt3"><h2 class="h2">Needs review</h2><p class="muted mt1">${esc(why)}</p></div>
    <button class="btn mt3" onclick="go({screen:'ccert'})">Upload a different file</button>`;
}

// ---------- coach home ----------

function coachhome() {
  const c = state.coach;
  if (!c || c.status !== 'verified') return `<p class="muted">Finish verification first.</p><button class="btn mt2" onclick="go({screen:'cprofile'})">Set up profile</button>`;
  const t = state.threads.me;
  const head = `<div class="row between"><div class="row">${avatar({ id: 'me', name: c.name }, 48)}<div><h2 class="h3">${esc(c.name)}</h2><p class="muted small"><span class="pill ok">✓ Verified</span></p></div></div></div>`;

  if (!t || !t.answers) {
    return `${head}
      <h2 class="h2 mt3">Incoming students</h2>
      <div class="card mt2"><p class="h3">No requests yet.</p>
        <p class="muted mt1">For the demo: switch to student mode, find yourself in the Coaches tab, confirm, and send a request. It will show up here.</p>
        <button class="btn mt2" onclick="chooseRole('student')">Switch to student mode</button></div>`;
  }

  const hasReply = t.messages.some((m) => m.from === 'coach');
  return `${head}
    <h2 class="h2 mt3">Incoming student</h2>
    ${briefingCard(t, c, 'coach')}
    <div class="card mt2"><p class="small muted">Their answers</p>${answersList(t.answers)}</div>
    ${messagesHtml(t, 'coach')}
    <form class="chatbar" onsubmit="sendCoachMessage(event)">
      <input id="coach-input" class="input" placeholder="${hasReply ? 'Message…' : 'Reply to this request…'}" autocomplete="off">
      <button class="btn" type="submit">Send</button>
    </form>
    <div data-scroll-end></div>`;
}

function sendCoachMessage(e) {
  e.preventDefault();
  const input = $('coach-input');
  const text = input.value.trim();
  if (!text) return;
  state.threads.me.messages.push({ from: 'coach', text });
  saveState();
  render();
  const next = $('coach-input');
  if (next) next.focus();
}

// ---------- boot ----------

document.addEventListener('DOMContentLoaded', render);

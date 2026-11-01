// AI helpers. Each one works without an API key by falling back to a template or demo mode.

const AI_MODEL = 'claude-haiku-5-5';

function aiKey() {
  return (window.SPORTINER_CONFIG && window.SPORTINER_CONFIG.anthropicApiKey) || '';
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callClaude({ system, messages, maxTokens = 300 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': aiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return data.content.map((b) => b.text || '').join('').trim();
}

// ---------- request briefing for the coach ----------

function answersToText(answers) {
  const lines = [
    `Skills to develop: ${skillNames(answers.skills)}`,
    `Goal: ${answers.goal}`,
    `Sessions per week: ${answers.sessions}`,
    `Availability: ${answers.avail}`,
  ];
  if (answers.competition) lines.push(`Competition: ${answers.competition}${answers.date ? ' on ' + answers.date : ''}`);
  if (answers.notes) lines.push(`Notes: ${answers.notes}`);
  return lines.join('\n');
}

function templateBriefing(student, answers) {
  let when = 'no fixed deadline';
  if (answers.date) {
    const weeks = Math.max(0, Math.floor(daysUntil(answers.date) / 7));
    when = `${answers.competition || 'a competition'} in ${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  const urgency = answers.date ? (daysUntil(answers.date) <= 21 ? 'high' : daysUntil(answers.date) <= 42 ? 'medium' : 'low') : 'low';
  return `${LEVELS[student.level].label} ${SPORTS[student.sport].toLowerCase()} player (level ${student.level}/5) who wants to work on ${skillNames(answers.skills).toLowerCase()}. Goal: ${answers.goal.toLowerCase()} (${when}). Wants ${answers.sessions} session${answers.sessions === 1 ? '' : 's'} a week, ${answers.avail.toLowerCase()}. Urgency: ${urgency}.`;
}

async function summariseRequest(student, answers, coach) {
  if (!aiKey()) return { text: templateBriefing(student, answers), source: 'template' };
  try {
    const text = await callClaude({
      system: 'You write short briefings for sports coaches about a new student request. Write 3 sentences, plain text, concrete and useful. Mention level, what to work on, deadline urgency, and schedule.',
      messages: [{
        role: 'user',
        content: `Coach: ${coach.name} (${coach.sports.join('/')}).\nStudent sport: ${student.sport}, level ${student.level}/5 (${LEVELS[student.level].label}), language ${student.language}.\n${answersToText(answers)}`,
      }],
      maxTokens: 220,
    });
    return { text, source: 'ai' };
  } catch (err) {
    console.warn('AI briefing failed, using template:', err);
    return { text: templateBriefing(student, answers), source: 'template' };
  }
}

// ---------- seeded coach replies ----------

function scriptedReply(coach, thread, student, isFirst, lastStudentText) {
  const first = coach.name.split(' ')[0];
  if (isFirst) {
    const a = thread.answers;
    const skill = SKILLS[a.skills[0]].toLowerCase();
    const urgent = a.date && daysUntil(a.date) <= 28 ? ` With ${a.competition || 'your event'} coming up, we should start this week.` : '';
    return `Hi, I'm ${first}! Thanks for the details. ${coach.persona} I'd begin with your ${skill}.${urgent} I can do ${a.avail.toLowerCase()}. Want to lock in a first session?`;
  }
  const text = (lastStudentText || '').toLowerCase();
  if (/price|cost|rate|\$|pay|how much|much|fee|expensive/.test(text)) return `My rate is $${coach.pricePerHour} per hour. Happy to do a shorter first session if you want to try me out.`;
  if (/when|time|schedule|book|available|week|day/.test(text)) return `How about this Thursday evening or Saturday morning? Tell me which works and I'll hold the spot.`;
  if (/thank|great|perfect|sounds good/.test(text)) return `Anytime! See you on court. Bring water and your usual racket.`;
  const skill = SKILLS[thread.answers.skills[0]].toLowerCase();
  return `Good question. If you can, send me a short video of your ${skill} before our first session and we'll fix the biggest thing first.`;
}

function mergeRoles(list) {
  const out = [];
  list.forEach((m) => {
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += '\n' + m.content;
    else out.push({ ...m });
  });
  return out;
}

async function coachReply(coach, thread, student, isFirst, lastStudentText) {
  if (!aiKey()) {
    await wait(1200);
    return { text: scriptedReply(coach, thread, student, isFirst, lastStudentText), source: 'scripted' };
  }
  try {
    const history = [
      { role: 'user', content: `New student request.\nStudent: ${student.sport}, level ${student.level}/5, language ${student.language}.\n${answersToText(thread.answers)}\nBriefing: ${thread.briefing.text}` },
      ...thread.messages.map((m) => ({ role: m.from === 'coach' ? 'assistant' : 'user', content: m.text })),
    ];
    const text = await callClaude({
      system: `You are ${coach.name}, a ${coach.sports.join(' and ')} coach in the Greater Toronto Area. Style: ${coach.persona} Charge $${coach.pricePerHour}/hr. Reply to the student in 1 to 3 friendly sentences, plain text, no lists. Be concrete about what you would teach. Never claim to be an AI.`,
      messages: mergeRoles(history),
      maxTokens: 200,
    });
    return { text, source: 'ai' };
  } catch (err) {
    console.warn('AI coach reply failed, using script:', err);
    await wait(800);
    return { text: scriptedReply(coach, thread, student, isFirst, lastStudentText), source: 'scripted' };
  }
}

// ---------- certificate check ----------

const CERT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const CERT_MAX_BYTES = 5 * 1024 * 1024;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function checkCertificate(file, coach) {
  if (!CERT_TYPES.includes(file.type)) return { approved: false, reason: 'Please upload a PNG, JPG, WebP, or PDF file.', source: 'validation' };
  if (file.size > CERT_MAX_BYTES) return { approved: false, reason: 'That file is over 5 MB. Please upload a smaller one.', source: 'validation' };

  const demo = async () => {
    await wait(3000);
    return { approved: true, reason: 'Demo mode: the file was accepted but not actually verified.', source: 'demo' };
  };
  if (!aiKey()) return demo();

  try {
    const data = await fileToBase64(file);
    const block = file.type === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: file.type, data } }
      : { type: 'image', source: { type: 'base64', media_type: file.type, data } };
    const raw = await callClaude({
      system: 'You review uploaded coaching certificates for a tennis and pickleball coaching marketplace. Reply with JSON only.',
      messages: [{
        role: 'user',
        content: [
          block,
          { type: 'text', text: `Is this a plausible tennis or pickleball coaching certification (for example Tennis Canada, PTR, USPTA, IPTPA, or PPR) for a coach named "${coach.name}"? Reply ONLY with JSON: {"verdict":"approved" or "needs_review","reason":"one short sentence"}.` },
        ],
      }],
      maxTokens: 150,
    });
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return { approved: parsed.verdict === 'approved', reason: parsed.reason || '', source: 'ai' };
  } catch (err) {
    console.warn('AI certificate check failed, using demo mode:', err);
    return demo();
  }
}

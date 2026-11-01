// Fictional coaches and constants. No real people or endorsements.

const SKILLS = {
  serve: 'Serve',
  forehand: 'Forehand',
  backhand: 'Backhand',
  volley: 'Volley',
  smash: 'Smash',
  return: 'Return',
  footwork: 'Footwork',
};

// Skill levels, from complete beginner up to competitive.
const LEVELS = [
  { v: 1, label: 'Never played', desc: 'I have never held a racket, or I am just getting started.' },
  { v: 1.5, label: 'Learning the basics', desc: 'I can hit a few balls, but rallies are very short.' },
  { v: 2, label: 'Beginner', desc: 'I know the rules and can rally a little.' },
  { v: 2.5, label: 'Improving beginner', desc: 'I can keep a short rally and am working on direction.' },
  { v: 3, label: 'Intermediate', desc: 'I play regularly and can keep a rally going.' },
  { v: 3.5, label: 'Solid intermediate', desc: 'I hit with control and some power.' },
  { v: 4, label: 'Advanced', desc: 'Consistent strokes, and I play matches.' },
  { v: 4.5, label: 'Strong advanced', desc: 'I win most club matches.' },
  { v: 5, label: 'Competitive', desc: 'I compete in tournaments or leagues.' },
];

function levelInfo(v) {
  return LEVELS.find((l) => l.v === v);
}

function levelName(v) {
  const l = levelInfo(v);
  return `${Number(v).toFixed(1)} ${l ? l.label : ''}`.trim();
}

function levelIcon(v) {
  return v < 2 ? '🌱' : v < 3 ? '🙂' : v < 4 ? '🎯' : v < 5 ? '🔥' : '🏆';
}

const SPORTS = { tennis: 'Tennis', pickleball: 'Pickleball' };
const LANGUAGES = ['English', 'French', 'Spanish', 'Mandarin', 'Hindi', 'Russian'];
const AREAS = ['Toronto', 'Mississauga', 'Markham', 'Vaughan', 'Richmond Hill', 'Brampton', 'Oakville'];
const AVAIL = { weekdays: 'Weekdays', evenings: 'Evenings', weekends: 'Weekends' };
const GOALS = ['Reach my target level', 'Prepare for a tournament', 'Play more confidently', 'Stay active and enjoy the sport'];
const TIMEFRAMES = [[4, '⚡', '1 month'], [12, '📅', '3 months'], [26, '🗓️', '6 months'], [52, '🏆', '1 year']];
const DISTANCES = [5, 15, 30, 50];

function timeframeLabel(weeks) {
  const t = TIMEFRAMES.find(([w]) => w === weeks);
  return t ? t[2] : `${weeks} weeks`;
}

// ---------- locations (approximate distances between Greater Toronto Area cities, in km) ----------

const AREA_KM = {
  'Toronto|Mississauga': 25, 'Toronto|Markham': 30, 'Toronto|Vaughan': 25, 'Toronto|Richmond Hill': 30, 'Toronto|Brampton': 40, 'Toronto|Oakville': 40,
  'Mississauga|Markham': 50, 'Mississauga|Vaughan': 30, 'Mississauga|Richmond Hill': 45, 'Mississauga|Brampton': 15, 'Mississauga|Oakville': 15,
  'Markham|Vaughan': 15, 'Markham|Richmond Hill': 10, 'Markham|Brampton': 45, 'Markham|Oakville': 65,
  'Vaughan|Richmond Hill': 15, 'Vaughan|Brampton': 25, 'Vaughan|Oakville': 50,
  'Richmond Hill|Brampton': 40, 'Richmond Hill|Oakville': 60,
  'Brampton|Oakville': 25,
};

function areaKm(a, b) {
  if (a === b) return 5;
  return AREA_KM[`${a}|${b}`] ?? AREA_KM[`${b}|${a}`] ?? 99;
}

const POSTAL_PREFIXES = [
  ['M', 'Toronto'], ['L5', 'Mississauga'], ['L4Z', 'Mississauga'], ['L3R', 'Markham'], ['L3P', 'Markham'], ['L6E', 'Markham'],
  ['L4K', 'Vaughan'], ['L4L', 'Vaughan'], ['L6A', 'Vaughan'], ['L4B', 'Richmond Hill'], ['L4C', 'Richmond Hill'], ['L4E', 'Richmond Hill'], ['L4S', 'Richmond Hill'],
  ['L6P', 'Brampton'], ['L6R', 'Brampton'], ['L6S', 'Brampton'], ['L6T', 'Brampton'], ['L6V', 'Brampton'], ['L6W', 'Brampton'], ['L6X', 'Brampton'], ['L6Y', 'Brampton'], ['L6Z', 'Brampton'],
  ['L6H', 'Oakville'], ['L6J', 'Oakville'], ['L6K', 'Oakville'], ['L6L', 'Oakville'], ['L6M', 'Oakville'],
];

// A city name or a postal code in the Greater Toronto Area -> one of AREAS, or null.
function resolveArea(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const byName = AREAS.find((a) => t.toLowerCase().includes(a.toLowerCase()));
  if (byName) return byName;
  const postal = t.toUpperCase().replace(/\s/g, '');
  if (!/^[A-Z]\d[A-Z]/.test(postal)) return null;
  const hit = POSTAL_PREFIXES.find(([prefix]) => postal.startsWith(prefix));
  return hit ? hit[1] : null;
}

// ---------- coaches ----------

const COACHES = [
  { id: 't1', name: 'Maya Torres', sports: ['tennis'], languages: ['English', 'Spanish'], area: 'Toronto', pricePerHour: 65, rating: 4.9, specialties: ['serve', 'forehand'], avail: ['weekdays', 'evenings'], fastTrack: true, bio: 'Former college player. I turn a shaky serve into a reliable one in a few weeks.', persona: 'I like to make the serve automatic first, then build points around it.' },
  { id: 't2', name: 'Dev Patel', sports: ['tennis'], languages: ['English', 'Hindi'], area: 'Mississauga', pricePerHour: 55, rating: 4.7, specialties: ['backhand', 'return', 'footwork'], avail: ['evenings', 'weekends'], fastTrack: true, bio: 'Footwork specialist. I build court movement from zero.', persona: 'Movement first. Good footwork fixes half of your strokes.' },
  { id: 't3', name: 'Lena Park', sports: ['tennis'], languages: ['English', 'Mandarin'], area: 'Markham', pricePerHour: 80, rating: 4.8, specialties: ['volley', 'smash'], avail: ['weekends'], fastTrack: false, bio: 'Net game and doubles. Works best with a longer timeline.', persona: 'I teach players to finish points at the net with confidence.' },
  { id: 't4', name: 'Sam Okafor', sports: ['tennis'], languages: ['English', 'French'], area: 'Toronto', pricePerHour: 45, rating: 4.5, specialties: ['footwork', 'forehand', 'return'], avail: ['weekdays', 'evenings'], fastTrack: true, bio: 'Budget-friendly and available most weekdays. Good for quick progress.', persona: 'Short, focused sessions. We fix one thing at a time.' },
  { id: 'p1', name: 'Jordan Reyes', sports: ['pickleball'], languages: ['English', 'Spanish'], area: 'Vaughan', pricePerHour: 50, rating: 4.8, specialties: ['serve', 'return'], avail: ['weekdays', 'weekends'], fastTrack: true, bio: 'Serve and return practice that wins points early in games.', persona: 'Win the first three shots of every rally. That is where games are decided.' },
  { id: 'p2', name: 'Chloe Nguyen', sports: ['pickleball'], languages: ['English', 'French'], area: 'Toronto', pricePerHour: 60, rating: 4.9, specialties: ['volley', 'smash', 'footwork'], avail: ['evenings'], fastTrack: true, bio: 'Kitchen-line play and overhead control for competitive doubles.', persona: 'Own the kitchen line and the rest of the game gets easier.' },
  { id: 'p3', name: 'Ravi Shah', sports: ['pickleball'], languages: ['English', 'Hindi'], area: 'Richmond Hill', pricePerHour: 40, rating: 4.4, specialties: ['backhand', 'forehand'], avail: ['weekends'], fastTrack: true, bio: 'Affordable weekend sessions. Great for first-timers.', persona: 'Relaxed and patient. We build clean, repeatable strokes.' },
  { id: 'p4', name: 'Hana Mori', sports: ['pickleball'], languages: ['English', 'Mandarin'], area: 'Mississauga', pricePerHour: 75, rating: 4.7, specialties: ['serve', 'smash', 'volley'], avail: ['weekdays'], fastTrack: false, bio: 'Tournament-level preparation. Works best with at least a few months.', persona: 'Good routines, patterns, and staying calm under pressure.' },
  { id: 'b1', name: 'Alex Kim', sports: ['tennis', 'pickleball'], languages: ['English', 'Russian'], area: 'Toronto', pricePerHour: 70, rating: 4.6, specialties: ['serve', 'volley', 'footwork'], avail: ['evenings', 'weekends'], fastTrack: true, bio: 'Coaches both sports. Ideal if you play both or want to switch.', persona: 'Racket skills transfer. I show you what carries over between sports.' },
];

// ---------- featured videos and practice drills ----------

const CLIPS = [
  { id: 'c1', owner: null, player: 'Alex Rivera', sport: 'tennis', level: 4, title: 'Baseline rally', caption: 'A 22-shot rally from the baseline.', url: 'https://assets.mixkit.co/videos/preview/mixkit-tennis-player-hitting-the-ball-40297-large.mp4', hasFile: false, shared: true },
  { id: 'c2', owner: null, player: 'Jordan Lee', sport: 'tennis', level: 5, title: 'Net play and overheads', caption: 'Finishing points at the net.', url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-tennis-40296-large.mp4', hasFile: false, shared: true },
  { id: 'c3', owner: null, player: 'Mina Sato', sport: 'pickleball', level: 3, title: 'Dinking rally at the kitchen', caption: 'Patient dinks and a clean put-away.', url: '', hasFile: false, shared: true },
];

const DRILLS = {
  serve: { title: 'Serve placement', text: 'Hit 50 serves into the service box, aiming at the corners. Keep the same toss every time.' },
  forehand: { title: 'Forehand consistency', text: 'Rally 20 balls cross-court with a partner, then add one down-the-line shot.' },
  backhand: { title: 'Backhand technique', text: 'Do 30 slow backhand feeds, focusing on turning your shoulders. Then rally 20 cross-court.' },
  volley: { title: 'Volley control', text: 'Hit 40 volleys against a wall, keeping the ball low and controlled.' },
  smash: { title: 'Overhead placement', text: 'After a lob, hit 10 overheads to the deep corners and 10 to the middle.' },
  return: { title: 'Return depth', text: 'Return 15 serves deep to the baseline and 15 short, towards the net.' },
  footwork: { title: 'Court movement', text: 'Move from the center to each corner and back to ready position in two steps. 10 times each side.' },
};

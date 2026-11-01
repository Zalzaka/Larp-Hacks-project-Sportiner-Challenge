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

const LEVELS = {
  1: { label: 'Brand new', desc: 'Never played, or just picking up a racket.' },
  2: { label: 'Beginner', desc: 'I know the rules and can rally a little.' },
  3: { label: 'Intermediate', desc: 'I play regularly and can keep a rally going.' },
  4: { label: 'Advanced', desc: 'Consistent strokes, I play matches.' },
  5: { label: 'Competitive', desc: 'I compete in tournaments or leagues.' },
};

const SPORTS = { tennis: 'Tennis', pickleball: 'Pickleball' };
const LANGUAGES = ['English', 'French', 'Spanish', 'Mandarin', 'Hindi', 'Russian'];
const AREAS = ['Toronto', 'Mississauga', 'Markham', 'Vaughan', 'Richmond Hill'];
const AVAIL = { weekdays: 'Weekdays', evenings: 'Evenings', weekends: 'Weekends' };
const GOALS = ['Play my first tournament', 'Move up a level', 'Feel confident in club play', 'Get better, fast'];

const COACHES = [
  { id: 't1', name: 'Maya Torres', sports: ['tennis'], languages: ['English', 'Spanish'], area: 'Toronto', pricePerHour: 65, rating: 4.9, specialties: ['serve', 'forehand'], avail: ['weekdays', 'evenings'], fastTrack: true, bio: 'Former college player. I turn a shaky serve into a weapon in a few weeks.', persona: 'I like to make the serve automatic first, then build points around it.' },
  { id: 't2', name: 'Dev Patel', sports: ['tennis'], languages: ['English', 'Hindi'], area: 'Mississauga', pricePerHour: 55, rating: 4.7, specialties: ['backhand', 'return', 'footwork'], avail: ['evenings', 'weekends'], fastTrack: true, bio: 'Footwork specialist. Builds court movement from zero.', persona: 'Movement first. Good footwork fixes half of your strokes.' },
  { id: 't3', name: 'Lena Park', sports: ['tennis'], languages: ['English', 'Mandarin'], area: 'Markham', pricePerHour: 80, rating: 4.8, specialties: ['volley', 'smash'], avail: ['weekends'], fastTrack: false, bio: 'Net game and doubles. Best with a longer runway before your event.', persona: 'I teach players to finish points at the net with confidence.' },
  { id: 't4', name: 'Sam Okafor', sports: ['tennis'], languages: ['English', 'French'], area: 'Toronto', pricePerHour: 45, rating: 4.5, specialties: ['footwork', 'forehand', 'return'], avail: ['weekdays', 'evenings'], fastTrack: true, bio: 'Budget-friendly and available most weekdays. Good for quick prep.', persona: 'Short, focused sessions. We fix one thing at a time.' },
  { id: 'p1', name: 'Jordan Reyes', sports: ['pickleball'], languages: ['English', 'Spanish'], area: 'Vaughan', pricePerHour: 50, rating: 4.8, specialties: ['serve', 'return'], avail: ['weekdays', 'weekends'], fastTrack: true, bio: 'Serve and return drills that win points early in tournament play.', persona: 'Win the first three shots of every rally. That is where matches are decided.' },
  { id: 'p2', name: 'Chloe Nguyen', sports: ['pickleball'], languages: ['English', 'French'], area: 'Toronto', pricePerHour: 60, rating: 4.9, specialties: ['volley', 'smash', 'footwork'], avail: ['evenings'], fastTrack: true, bio: 'Kitchen-line play and smash control for competitive doubles.', persona: 'Own the kitchen line and the rest of the game gets easy.' },
  { id: 'p3', name: 'Ravi Shah', sports: ['pickleball'], languages: ['English', 'Hindi'], area: 'Richmond Hill', pricePerHour: 40, rating: 4.4, specialties: ['backhand', 'forehand'], avail: ['weekends'], fastTrack: true, bio: 'Affordable weekend sessions. Great for first-timers.', persona: 'Relaxed and patient. We build clean, repeatable strokes.' },
  { id: 'p4', name: 'Hana Mori', sports: ['pickleball'], languages: ['English', 'Mandarin'], area: 'Mississauga', pricePerHour: 75, rating: 4.7, specialties: ['serve', 'smash', 'volley'], avail: ['weekdays'], fastTrack: false, bio: 'Tournament-level prep. Works best with five or more weeks.', persona: 'Tournament habits: routines, patterns, and staying calm under pressure.' },
  { id: 'b1', name: 'Alex Kim', sports: ['tennis', 'pickleball'], languages: ['English', 'Russian'], area: 'Toronto', pricePerHour: 70, rating: 4.6, specialties: ['serve', 'volley', 'footwork'], avail: ['evenings', 'weekends'], fastTrack: true, bio: 'Coaches both sports. Ideal if you want to cross-train or switch.', persona: 'Racket skills transfer. I show you what carries over between sports.' },
];

// ---------- highlight clips and drills (adapted from ronbilia's Sportiner app) ----------

const CLIPS = [
  { id: 'c1', player: 'Alex Rivera', sport: 'tennis', level: 4, title: '22-Shot Baseline Topspin Rally', url: 'https://assets.mixkit.co/videos/preview/mixkit-tennis-player-hitting-the-ball-40297-large.mp4', stats: { speed: '112 km/h', accuracy: '94%', length: '45s' }, note: 'Promising forehand wrist snap. Good court positioning under pressure.' },
  { id: 'c2', player: 'Jordan Lee', sport: 'tennis', level: 5, title: 'Aggressive Overhead Volley Finish', url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-tennis-40296-large.mp4', stats: { speed: '128 km/h', accuracy: '98%', length: '30s' }, note: 'Exceptional net reach and rapid reaction time.' },
  { id: 'c3', player: 'Mina Sato', sport: 'pickleball', level: 3, title: 'Kitchen Dink Battle', url: '', stats: { speed: '48 km/h', accuracy: '91%', length: '28s' }, note: 'Patient at the kitchen line. Soft hands and good shot selection.' },
];

const DRILLS = {
  serve: { title: 'Toss and target serve', text: 'Hit 50 serves to the deuce box with the same toss height. Then 3 of 5 into each corner.' },
  forehand: { title: 'Cross-court forehand rally', text: 'Rally 20 balls cross-court, then add one down-the-line shot.' },
  backhand: { title: 'Backhand turn and hit', text: '30 slow backhand feeds focusing on the shoulder turn. Then 20 cross-court.' },
  volley: { title: 'Wall volleys', text: '40 volley punches against a wall, keeping the ball low and controlled.' },
  smash: { title: 'Overhead placement', text: 'Hit 10 smashes to the deep corners and 10 to the body after a lob.' },
  return: { title: 'Return targets', text: 'Return 15 serves deep to the baseline and 15 short to the net.' },
  footwork: { title: 'Cone recovery', text: 'Sprint from the center to a corner and recover to ready position in two steps. 10 reps each side.' },
};

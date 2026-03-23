// LocalStorage keys
const KEYS = {
  USER: 'studypulse_user',
  SESSIONS: 'studypulse_sessions',
  STATS: 'studypulse_stats',
  BADGES: 'studypulse_badges',
  ROOMS: 'studypulse_rooms',
  NOTES: 'studypulse_notes',
  SCHEDULE: 'studypulse_schedule',
  EXAMS: 'studypulse_exams'
};

// User Management
export const saveUser = (user) => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const updateUser = (updatedFields) => {
  const user = getUser();
  if (user) {
    const newUser = { ...user, ...updatedFields };
    saveUser(newUser);
    return newUser;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(KEYS.USER);
};

// Sessions Management
export const saveSessions = (sessions) => {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

export const getSessions = () => {
  const sessions = localStorage.getItem(KEYS.SESSIONS);
  return sessions ? JSON.parse(sessions) : [];
};

export const addSession = (session) => {
  const sessions = getSessions();
  const newSession = {
    ...session,
    id: Date.now(),
    userId: getUser()?.email,
    timestamp: new Date().toISOString()
  };
  sessions.push(newSession);
  saveSessions(sessions);
  return newSession;
};

export const getUserSessions = () => {
  const user = getUser();
  if (!user) return [];
  const sessions = getSessions();
  return sessions.filter(s => s.userId === user.email);
};

// Stats Management
export const getStats = () => {
  const user = getUser();
  if (!user) return null;
  
  const stats = localStorage.getItem(KEYS.STATS);
  const allStats = stats ? JSON.parse(stats) : {};
  return allStats[user.email] || createDefaultStats();
};

export const saveStats = (stats) => {
  const user = getUser();
  if (!user) return;
  
  const allStats = JSON.parse(localStorage.getItem(KEYS.STATS) || '{}');
  allStats[user.email] = stats;
  localStorage.setItem(KEYS.STATS, JSON.stringify(allStats));
};

export const createDefaultStats = () => ({
  totalHours: 0,
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  longestSession: 0,
  todaySessions: 0,
  level: 1,
  xp: 0,
  roomsJoined: 0,
  roomsCreated: 0,
  scheduleCreated: 0,
  notesCreated: 0,
  lastStudyDate: null,
  focusPatterns: {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  },
  moodTracking: []
});

export const updateStats = (sessionData) => {
  const stats = getStats();
  const hours = sessionData.duration / 3600; // Convert seconds to hours
  
  stats.totalHours += hours;
  stats.totalSessions += 1;
  stats.longestSession = Math.max(stats.longestSession, sessionData.duration / 60);
  
  // Update XP (10 XP per hour)
  const xpGained = Math.floor(hours * 10);
  stats.xp += xpGained;
  stats.level = Math.floor(stats.xp / 50) + 1;
  
  // Update streak
  const today = new Date().toDateString();
  const lastDate = stats.lastStudyDate ? new Date(stats.lastStudyDate).toDateString() : null;
  
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastDate === yesterdayStr) {
      stats.currentStreak += 1;
    } else if (lastDate !== today) {
      stats.currentStreak = 1;
    }
    
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastStudyDate = new Date().toISOString();
    stats.todaySessions = 1;
  } else {
    stats.todaySessions += 1;
  }
  
  // Track focus patterns
  const hour = new Date().getHours();
  if (hour < 12) stats.focusPatterns.morning += 1;
  else if (hour < 17) stats.focusPatterns.afternoon += 1;
  else if (hour < 22) stats.focusPatterns.evening += 1;
  else stats.focusPatterns.night += 1;
  
  saveStats(stats);
  return { stats, xpGained };
};

// Badges Management
export const getBadges = () => {
  const user = getUser();
  if (!user) return [];
  
  const badges = localStorage.getItem(KEYS.BADGES);
  const allBadges = badges ? JSON.parse(badges) : {};
  return allBadges[user.email] || [];
};

export const saveBadges = (badges) => {
  const user = getUser();
  if (!user) return;
  
  const allBadges = JSON.parse(localStorage.getItem(KEYS.BADGES) || '{}');
  allBadges[user.email] = badges;
  localStorage.setItem(KEYS.BADGES, JSON.stringify(allBadges));
};

export const addBadge = (badgeId) => {
  const badges = getBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    saveBadges(badges);
    return true;
  }
  return false;
};

// Study Rooms
export const getRooms = () => {
  const rooms = localStorage.getItem(KEYS.ROOMS);
  return rooms ? JSON.parse(rooms) : [];
};

export const saveRooms = (rooms) => {
  localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
};

export const createRoom = (roomData) => {
  const rooms = getRooms();
  const user = getUser();
  
  const newRoom = {
    id: Date.now().toString(),
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    name: roomData.name,
    creator: user.email,
    creatorName: user.name,
    participants: [{
      email: user.email,
      name: user.name,
      joinedAt: new Date().toISOString(),
      isActive: true
    }],
    messages: [],
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  rooms.push(newRoom);
  saveRooms(rooms);
  
  // Update stats
  const stats = getStats();
  stats.roomsCreated += 1;
  saveStats(stats);
  
  return newRoom;
};

export const joinRoom = (roomCode) => {
  const rooms = getRooms();
  const user = getUser();
  const room = rooms.find(r => r.code === roomCode && r.isActive);
  
  if (!room) return null;
  
  const alreadyJoined = room.participants.some(p => p.email === user.email);
  
  if (!alreadyJoined) {
    room.participants.push({
      email: user.email,
      name: user.name,
      joinedAt: new Date().toISOString(),
      isActive: true
    });
    
    saveRooms(rooms);
    
    // Update stats
    const stats = getStats();
    stats.roomsJoined += 1;
    saveStats(stats);
  }
  
  return room;
};

export const addMessage = (roomId, message) => {
  const rooms = getRooms();
  const room = rooms.find(r => r.id === roomId);
  const user = getUser();
  
  if (room) {
    room.messages.push({
      id: Date.now(),
      userId: user.email,
      userName: user.name,
      text: message,
      timestamp: new Date().toISOString()
    });
    saveRooms(rooms);
  }
};

// Notes Management
export const getNotes = () => {
  const user = getUser();
  if (!user) return [];
  
  const notes = localStorage.getItem(KEYS.NOTES);
  const allNotes = notes ? JSON.parse(notes) : {};
  return allNotes[user.email] || [];
};

export const saveNotes = (notes) => {
  const user = getUser();
  if (!user) return;
  
  const allNotes = JSON.parse(localStorage.getItem(KEYS.NOTES) || '{}');
  allNotes[user.email] = notes;
  localStorage.setItem(KEYS.NOTES, JSON.stringify(allNotes));
};

export const addNote = (noteData) => {
  const notes = getNotes();
  const newNote = {
    id: Date.now(),
    ...noteData,
    createdAt: new Date().toISOString()
  };
  notes.push(newNote);
  saveNotes(notes);
  
  // Update stats
  const stats = getStats();
  stats.notesCreated += 1;
  saveStats(stats);
  
  return newNote;
};

export const deleteNote = (noteId) => {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== noteId);
  saveNotes(filtered);
};

// Schedule & Exams
export const getSchedule = () => {
  const user = getUser();
  if (!user) return null;
  
  const schedule = localStorage.getItem(KEYS.SCHEDULE);
  const allSchedules = schedule ? JSON.parse(schedule) : {};
  return allSchedules[user.email] || null;
};

export const saveSchedule = (schedule) => {
  const user = getUser();
  if (!user) return;
  
  const allSchedules = JSON.parse(localStorage.getItem(KEYS.SCHEDULE) || '{}');
  allSchedules[user.email] = schedule;
  localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(allSchedules));
  
  // Update stats
  const stats = getStats();
  stats.scheduleCreated = 1;
  saveStats(stats);
};

export const getExams = () => {
  const user = getUser();
  if (!user) return [];
  
  const exams = localStorage.getItem(KEYS.EXAMS);
  const allExams = exams ? JSON.parse(exams) : {};
  return allExams[user.email] || [];
};

export const saveExams = (exams) => {
  const user = getUser();
  if (!user) return;
  
  const allExams = JSON.parse(localStorage.getItem(KEYS.EXAMS) || '{}');
  allExams[user.email] = exams;
  localStorage.setItem(KEYS.EXAMS, JSON.stringify(allExams));
};

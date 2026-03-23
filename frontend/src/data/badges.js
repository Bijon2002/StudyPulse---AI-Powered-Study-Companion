export const badges = [
  {
    id: 'first_hour',
    name: 'First Hour',
    description: 'Complete your first study session',
    icon: '🎯',
    requirement: { type: 'sessions', value: 1 },
    rarity: 'common'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 8 AM',
    icon: '🌅',
    requirement: { type: 'time', value: 'morning' },
    rarity: 'common'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10 PM',
    icon: '🦉',
    requirement: { type: 'time', value: 'night' },
    rarity: 'common'
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Study for 3 consecutive days',
    icon: '🔥',
    requirement: { type: 'streak', value: 3 },
    rarity: 'uncommon'
  },
  {
    id: 'streak_5',
    name: '5-Day Streak',
    description: 'Study for 5 consecutive days',
    icon: '⚡',
    requirement: { type: 'streak', value: 5 },
    rarity: 'rare'
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    icon: '👑',
    requirement: { type: 'streak', value: 7 },
    rarity: 'epic'
  },
  {
    id: 'study_beast',
    name: 'Study Beast',
    description: 'Study for 10 hours total',
    icon: '🦁',
    requirement: { type: 'totalHours', value: 10 },
    rarity: 'rare'
  },
  {
    id: 'marathon',
    name: 'Marathon Master',
    description: 'Complete a 3-hour session',
    icon: '🏃',
    requirement: { type: 'sessionLength', value: 180 },
    rarity: 'epic'
  },
  {
    id: 'focused',
    name: 'Laser Focus',
    description: 'Complete 5 sessions in one day',
    icon: '🎯',
    requirement: { type: 'dailySessions', value: 5 },
    rarity: 'rare'
  },
  {
    id: 'century',
    name: 'Century Club',
    description: 'Reach 100 hours of study',
    icon: '💯',
    requirement: { type: 'totalHours', value: 100 },
    rarity: 'legendary'
  },
  {
    id: 'level_10',
    name: 'Level 10 Scholar',
    description: 'Reach level 10',
    icon: '⭐',
    requirement: { type: 'level', value: 10 },
    rarity: 'epic'
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Join 5 study rooms',
    icon: '🦋',
    requirement: { type: 'roomsJoined', value: 5 },
    rarity: 'uncommon'
  },
  {
    id: 'room_creator',
    name: 'Room Creator',
    description: 'Create your first study room',
    icon: '🏠',
    requirement: { type: 'roomsCreated', value: 1 },
    rarity: 'common'
  },
  {
    id: 'planner_pro',
    name: 'Planner Pro',
    description: 'Create a study schedule',
    icon: '📅',
    requirement: { type: 'scheduleCreated', value: 1 },
    rarity: 'common'
  },
  {
    id: 'note_taker',
    name: 'Note Taker',
    description: 'Create 10 notes',
    icon: '📝',
    requirement: { type: 'notesCreated', value: 10 },
    rarity: 'uncommon'
  }
];

export const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

export const checkBadgeEarned = (badge, userStats) => {
  const { requirement } = badge;
  
  switch (requirement.type) {
    case 'sessions':
      return userStats.totalSessions >= requirement.value;
    case 'totalHours':
      return userStats.totalHours >= requirement.value;
    case 'streak':
      return userStats.currentStreak >= requirement.value;
    case 'sessionLength':
      return userStats.longestSession >= requirement.value;
    case 'dailySessions':
      return userStats.todaySessions >= requirement.value;
    case 'level':
      return userStats.level >= requirement.value;
    case 'roomsJoined':
      return userStats.roomsJoined >= requirement.value;
    case 'roomsCreated':
      return userStats.roomsCreated >= requirement.value;
    case 'scheduleCreated':
      return userStats.scheduleCreated >= requirement.value;
    case 'notesCreated':
      return userStats.notesCreated >= requirement.value;
    case 'time':
      return checkTimeRequirement(requirement.value);
    default:
      return false;
  }
};

const checkTimeRequirement = (timeType) => {
  const hour = new Date().getHours();
  if (timeType === 'morning') return hour < 8;
  if (timeType === 'night') return hour >= 22;
  return false;
};

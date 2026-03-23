export const motivationalQuotes = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "Study while others are sleeping; work while others are loafing.",
  "Your future is created by what you do today, not tomorrow.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Education is the passport to the future.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Strive for progress, not perfection.",
  "You don't have to be great to start, but you have to start to be great.",
  "Small daily improvements are the key to staggering long-term results.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream big, work hard, stay focused.",
  "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "The key to success is to focus on goals, not obstacles.",
];

export const sessionEndQuotes = [
  "Amazing work! Your brain just leveled up! 🧠✨",
  "You're crushing it! Keep this momentum going! 💪",
  "Another session conquered! You're unstoppable! 🚀",
  "Brilliant focus! Your future self will thank you! 🌟",
  "You just invested in your success! Well done! 🎯",
  "Fantastic session! You're building greatness! 🏆",
  "Your dedication is inspiring! Keep shining! ⭐",
  "Excellent work! You're one step closer to your goals! 🎓",
  "You're on fire! This is how champions are made! 🔥",
  "Outstanding effort! Your hard work is paying off! 💎",
];

export const getRandomQuote = (quotes = motivationalQuotes) => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getPersonalizedQuote = (userName, timeOfDay) => {
  const greetings = {
    morning: `Good morning, ${userName}! Start your day with focused learning.`,
    afternoon: `Good afternoon, ${userName}! Keep that momentum going strong.`,
    evening: `Good evening, ${userName}! Perfect time for deep focus.`,
    night: `Burning the midnight oil, ${userName}? Your dedication is admirable!`,
  };

  return greetings[timeOfDay] || greetings.morning;
};

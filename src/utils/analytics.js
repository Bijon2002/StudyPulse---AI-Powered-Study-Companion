export const analyzeStudyPatterns = (sessions, stats) => {
  if (!sessions || sessions.length === 0) {
    return {
      bestTimeOfDay: 'Not enough data',
      averageSessionLength: 0,
      totalStudyTime: 0,
      recommendations: ['Start your first study session to get personalized insights!']
    };
  }

  const { focusPatterns } = stats;
  const totalSessions = stats.totalSessions;
  
  // Find best time of day
  const timeSlots = [
    { name: 'morning', label: 'Morning (before 12 PM)', count: focusPatterns.morning },
    { name: 'afternoon', label: 'Afternoon (12-5 PM)', count: focusPatterns.afternoon },
    { name: 'evening', label: 'Evening (5-10 PM)', count: focusPatterns.evening },
    { name: 'night', label: 'Night (after 10 PM)', count: focusPatterns.night }
  ];
  
  const bestTime = timeSlots.reduce((max, slot) => 
    slot.count > max.count ? slot : max
  );
  
  // Calculate average session length
  const avgLength = stats.totalHours / totalSessions;
  
  // Generate recommendations
  const recommendations = generateRecommendations(stats, avgLength, bestTime.name);
  
  return {
    bestTimeOfDay: bestTime.label,
    averageSessionLength: avgLength,
    totalStudyTime: stats.totalHours,
    recommendations,
    focusDistribution: timeSlots
  };
};

const generateRecommendations = (stats, avgLength, bestTime) => {
  const recommendations = [];
  
  // Time-based recommendations
  if (bestTime === 'morning') {
    recommendations.push('🌅 You focus best in the morning. Try scheduling important topics before noon.');
  } else if (bestTime === 'evening') {
    recommendations.push('🌆 Evening is your peak focus time. Plan your toughest subjects for 5-10 PM.');
  } else if (bestTime === 'night') {
    recommendations.push('🌙 You\'re a night owl! Just ensure you get enough sleep for retention.');
  } else {
    recommendations.push('☀️ Afternoon works well for you. Consider a light lunch to maintain energy.');
  }
  
  // Session length recommendations
  if (avgLength < 0.5) {
    recommendations.push('⏱️ Try extending your sessions to 30-45 minutes for better deep work.');
  } else if (avgLength > 2) {
    recommendations.push('🧠 Great stamina! Consider 5-10 minute breaks every hour to maintain focus.');
  } else {
    recommendations.push('✅ Your session length is optimal for focused learning!');
  }
  
  // Streak recommendations
  if (stats.currentStreak === 0) {
    recommendations.push('🔥 Start a streak today! Consistency is key to long-term retention.');
  } else if (stats.currentStreak >= 3 && stats.currentStreak < 7) {
    recommendations.push(`🔥 ${stats.currentStreak}-day streak! You're building a powerful habit.`);
  } else if (stats.currentStreak >= 7) {
    recommendations.push(`🏆 Amazing ${stats.currentStreak}-day streak! You're in the top 1% of learners!`);
  }
  
  // Level-based recommendations
  if (stats.level < 5) {
    recommendations.push('🎯 Focus on building consistency. Aim for at least 1 hour daily.');
  } else if (stats.level < 10) {
    recommendations.push('📈 You\'re making great progress! Consider tackling more challenging topics.');
  } else {
    recommendations.push('⭐ Expert level! Share your knowledge by creating study rooms for others.');
  }
  
  return recommendations;
};

export const calculateDailyStats = (sessions) => {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => 
    new Date(s.timestamp).toDateString() === today
  );
  
  const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  
  return {
    sessionsToday: todaySessions.length,
    minutesToday: Math.round(totalMinutes),
    hoursToday: (totalMinutes / 60).toFixed(1)
  };
};

export const calculateWeeklyStats = (sessions) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weekSessions = sessions.filter(s => 
    new Date(s.timestamp) >= weekAgo
  );
  
  const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  
  // Group by day
  const dailyData = {};
  weekSessions.forEach(s => {
    const day = new Date(s.timestamp).toDateString();
    dailyData[day] = (dailyData[day] || 0) + (s.duration / 60);
  });
  
  return {
    sessionsThisWeek: weekSessions.length,
    minutesThisWeek: Math.round(totalMinutes),
    hoursThisWeek: (totalMinutes / 60).toFixed(1),
    dailyBreakdown: dailyData
  };
};

export const calculateMonthlyStats = (sessions) => {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const monthSessions = sessions.filter(s => 
    new Date(s.timestamp) >= monthAgo
  );
  
  const totalMinutes = monthSessions.reduce((sum, s) => sum + (s.duration / 60), 0);
  
  return {
    sessionsThisMonth: monthSessions.length,
    minutesThisMonth: Math.round(totalMinutes),
    hoursThisMonth: (totalMinutes / 60).toFixed(1)
  };
};

export const getChartData = (sessions, period = 'week') => {
  const now = new Date();
  let labels = [];
  let data = [];
  
  if (period === 'week') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const daySessions = sessions.filter(s => 
        new Date(s.timestamp).toDateString() === dateStr
      );
      const hours = daySessions.reduce((sum, s) => sum + (s.duration / 3600), 0);
      data.push(hours.toFixed(2));
    }
  } else if (period === 'month') {
    // Last 30 days grouped by week
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      labels.push(`Week ${4 - i}`);
      
      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.timestamp);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      const hours = weekSessions.reduce((sum, s) => sum + (s.duration / 3600), 0);
      data.push(hours.toFixed(2));
    }
  }
  
  return { labels, data };
};

export const detectDuplicateNotes = (notes) => {
  const duplicates = [];
  const seen = new Map();
  
  notes.forEach((note, index) => {
    const content = note.content.toLowerCase().trim();
    const words = content.split(/\s+/);
    
    // Check for similar content (>70% word overlap)
    for (const [seenContent, seenIndex] of seen.entries()) {
      const seenWords = seenContent.split(/\s+/);
      const commonWords = words.filter(w => seenWords.includes(w));
      const similarity = (commonWords.length * 2) / (words.length + seenWords.length);
      
      if (similarity > 0.7) {
        duplicates.push({
          note1: notes[seenIndex],
          note2: note,
          similarity: (similarity * 100).toFixed(0) + '%'
        });
      }
    }
    
    seen.set(content, index);
  });
  
  return duplicates;
};

export const extractKeywords = (text) => {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !commonWords.has(w));
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
};

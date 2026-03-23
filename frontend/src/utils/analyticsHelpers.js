import { startOfDay, endOfDay, subDays, format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const getDailyStudyData = (sessions) => {
  // Get last 7 days
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  });

  const data = days.map(day => {
    const daySessions = sessions.filter(session => 
      isSameDay(new Date(session.startTime), day)
    );
    const totalDuration = daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    return {
      date: format(day, 'MMM dd'),
      hours: (totalDuration / 3600).toFixed(1)
    };
  });

  return {
    labels: data.map(d => d.date),
    data: data.map(d => d.hours)
  };
};

export const getSubjectDistribution = (sessions) => {
  const distribution = {};
  sessions.forEach(session => {
    const subject = session.subject || 'Uncategorized';
    distribution[subject] = (distribution[subject] || 0) + session.duration;
  });

  // Convert to hours
  const labels = Object.keys(distribution);
  const data = Object.values(distribution).map(d => (d / 3600).toFixed(1));

  return { labels, data };
};

export const getMoodDistribution = (sessions) => {
  const distribution = {};
  sessions.forEach(session => {
    const mood = session.mood || 'neutral';
    distribution[mood] = (distribution[mood] || 0) + 1;
  });

  const labels = Object.keys(distribution).map(m => m.charAt(0).toUpperCase() + m.slice(1));
  const data = Object.values(distribution);

  return { labels, data };
};

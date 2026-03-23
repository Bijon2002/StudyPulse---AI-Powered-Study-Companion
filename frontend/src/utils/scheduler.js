export const generateStudySchedule = (exams, subjects) => {
  if (!exams || exams.length === 0) {
    return null;
  }

  const schedule = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  exams.forEach(exam => {
    const examDate = new Date(exam.date);
    examDate.setHours(0, 0, 0, 0);
    
    const daysUntilExam = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExam < 0) return; // Skip past exams

    const subject = subjects.find(s => s.id === exam.subjectId);
    if (!subject) return;

    const topics = subject.topics || [];
    const totalTopics = topics.length;
    
    if (totalTopics === 0) return;

    // Calculate study days (leave last 2 days for revision)
    const studyDays = Math.max(1, daysUntilExam - 2);
    const topicsPerDay = Math.ceil(totalTopics / studyDays);
    
    // Distribute topics across days
    let topicIndex = 0;
    for (let day = 0; day < studyDays && topicIndex < totalTopics; day++) {
      const studyDate = new Date(today);
      studyDate.setDate(today.getDate() + day);
      
      const dayTopics = [];
      for (let i = 0; i < topicsPerDay && topicIndex < totalTopics; i++) {
        dayTopics.push(topics[topicIndex]);
        topicIndex++;
      }
      
      schedule.push({
        date: studyDate.toISOString(),
        subjectId: subject.id,
        subjectName: subject.name,
        examDate: exam.date,
        topics: dayTopics,
        type: 'study',
        completed: false
      });
    }
    
    // Add revision days
    if (daysUntilExam >= 2) {
      for (let i = 1; i <= 2; i++) {
        const revisionDate = new Date(examDate);
        revisionDate.setDate(examDate.getDate() - i);
        
        schedule.push({
          date: revisionDate.toISOString(),
          subjectId: subject.id,
          subjectName: subject.name,
          examDate: exam.date,
          topics: topics,
          type: 'revision',
          completed: false,
          revisionNumber: 3 - i
        });
      }
    }
  });

  // Sort by date
  schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return schedule;
};

export const getScheduleForDate = (schedule, date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return schedule.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === targetDate.getTime();
  });
};

export const getUpcomingTasks = (schedule, days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return schedule.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= today && itemDate <= futureDate && !item.completed;
  });
};

export const markTaskComplete = (schedule, taskDate, subjectId) => {
  const updated = schedule.map(item => {
    const itemDate = new Date(item.date).toDateString();
    const targetDate = new Date(taskDate).toDateString();
    
    if (itemDate === targetDate && item.subjectId === subjectId) {
      return { ...item, completed: true };
    }
    return item;
  });
  
  return updated;
};

export const calculateScheduleProgress = (schedule) => {
  if (!schedule || schedule.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  
  const total = schedule.length;
  const completed = schedule.filter(item => item.completed).length;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
};

export const getExamReminders = (exams) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reminders = [];
  
  exams.forEach(exam => {
    const examDate = new Date(exam.date);
    examDate.setHours(0, 0, 0, 0);
    
    const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return; // Skip past exams
    
    let urgency = 'low';
    let message = '';
    
    if (daysUntil === 0) {
      urgency = 'critical';
      message = `${exam.subject} exam is TODAY!`;
    } else if (daysUntil === 1) {
      urgency = 'high';
      message = `${exam.subject} exam is TOMORROW!`;
    } else if (daysUntil <= 3) {
      urgency = 'high';
      message = `${exam.subject} exam in ${daysUntil} days`;
    } else if (daysUntil <= 7) {
      urgency = 'medium';
      message = `${exam.subject} exam in ${daysUntil} days`;
    } else if (daysUntil <= 14) {
      urgency = 'low';
      message = `${exam.subject} exam in ${daysUntil} days`;
    }
    
    if (message) {
      reminders.push({
        exam,
        daysUntil,
        urgency,
        message
      });
    }
  });
  
  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
};

export const optimizeStudyPlan = (schedule, userStats) => {
  // Analyze user's best study time
  const { focusPatterns } = userStats;
  const bestTime = Object.entries(focusPatterns)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  const suggestions = [];
  
  // Time-based suggestions
  const timeRecommendations = {
    morning: 'Schedule difficult topics in the morning when you focus best',
    afternoon: 'Your peak focus is in the afternoon - plan accordingly',
    evening: 'Evening is your optimal study time - leverage it',
    night: 'You study best at night - ensure adequate sleep for retention'
  };
  
  suggestions.push(timeRecommendations[bestTime]);
  
  // Session length suggestions
  const avgSessionLength = userStats.totalHours / userStats.totalSessions;
  if (avgSessionLength < 1) {
    suggestions.push('Consider 45-60 minute study blocks with 10 min breaks');
  } else if (avgSessionLength > 2) {
    suggestions.push('Break long sessions into chunks with regular breaks');
  }
  
  // Workload distribution
  const tasksPerDay = {};
  schedule.forEach(item => {
    const date = new Date(item.date).toDateString();
    tasksPerDay[date] = (tasksPerDay[date] || 0) + 1;
  });
  
  const maxTasksPerDay = Math.max(...Object.values(tasksPerDay));
  if (maxTasksPerDay > 5) {
    suggestions.push('Some days are overloaded - consider redistributing tasks');
  }
  
  return suggestions;
};

export const generateRevisionSchedule = (topics, examDate, currentDate = new Date()) => {
  const exam = new Date(examDate);
  const now = new Date(currentDate);
  now.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  
  const daysAvailable = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
  
  if (daysAvailable < 1) return [];
  
  // Spaced repetition intervals: 1 day, 3 days, 7 days before exam
  const revisionIntervals = [1, 3, 7].filter(interval => interval < daysAvailable);
  
  const revisionPlan = [];
  
  revisionIntervals.forEach(interval => {
    const revisionDate = new Date(exam);
    revisionDate.setDate(exam.getDate() - interval);
    
    revisionPlan.push({
      date: revisionDate.toISOString(),
      topics: topics,
      type: 'revision',
      interval: interval,
      description: `Revision ${interval} day(s) before exam`
    });
  });
  
  return revisionPlan.sort((a, b) => new Date(a.date) - new Date(b.date));
};

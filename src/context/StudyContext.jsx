import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();

export const useStudy = () => useContext(StudyContext);

const STORAGE_KEY = 'studypulse_data';

const INITIAL_STATE = {
  user: {
    name: 'Student',
    xp: 0,
    level: 1,
    avatar: '🌱',
  },
  sessions: [], // { id, startTime, endTime, duration (seconds), subject }
  exams: [], // { id, subject, date, topics: [] }
  tasks: [], // { id, title, status, subjectId }
  settings: {
    dailyGoal: 4 * 60 * 60, // 4 hours in seconds
  }
};

export const StudyProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [activeSession, setActiveSession] = useState(null); // { startTime, subject }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addXP = (amount) => {
    setData(prev => {
      const newXP = prev.user.xp + amount;
      const newLevel = Math.floor(newXP / 50) + 1;
      return {
        ...prev,
        user: { ...prev.user, xp: newXP, level: newLevel }
      };
    });
  };

  const startSession = (subject) => {
    setActiveSession({ startTime: Date.now(), subject });
  };

  const stopSession = (mood = 'neutral') => {
    if (!activeSession) return null;
    
    const endTime = Date.now();
    const duration = (endTime - activeSession.startTime) / 1000; // in seconds
    
    const newSession = {
      id: Date.now(),
      startTime: activeSession.startTime,
      endTime,
      duration,
      subject: activeSession.subject,
      mood
    };

    setData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));

    // Award XP: 10 XP per hour (3600 seconds) => 10 * (duration / 3600)
    // Minimum 1 XP for short sessions
    const xpEarned = Math.max(1, Math.round(10 * (duration / 3600)));
    addXP(xpEarned);

    setActiveSession(null);
    return { session: newSession, xpEarned };
  };

  const addExam = (exam) => {
    setData(prev => ({
      ...prev,
      exams: [...prev.exams, { ...exam, id: Date.now() }]
    }));
  };

  return (
    <StudyContext.Provider value={{ 
      data, 
      activeSession, 
      startSession, 
      stopSession,
      addExam,
      setData
    }}>
      {children}
    </StudyContext.Provider>
  );
};

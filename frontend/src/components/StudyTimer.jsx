import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const StudyTimer = () => {
  const { activeSession, startSession, stopSession } = useStudy();
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastSessionData, setLastSessionData] = useState(null);

  useEffect(() => {
    let interval;
    if (activeSession) {
      // Calculate elapsed time based on start time to avoid drift
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeSession.startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!subject.trim()) {
      alert('Please enter a subject to focus on!');
      return;
    }
    startSession(subject);
  };

  const handleStopClick = () => {
    setShowMoodSelector(true);
  };

  const confirmStop = (mood) => {
    const result = stopSession(mood);
    if (result) {
      setLastSessionData(result);
      setShowMoodSelector(false);
      setShowCelebration(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeSession ? 'Focus Mode On' : 'Ready to Focus?'}
          </h2>
          <p className="text-gray-500">
            {activeSession ? `Studying: ${activeSession.subject}` : 'Track your study hours and level up!'}
          </p>
        </div>

        {/* Timer Display */}
        <div className="text-6xl md:text-8xl font-mono font-bold text-indigo-600 tracking-tighter">
          {formatTime(elapsed)}
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          {!activeSession ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="What are you studying?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <button
                onClick={handleStart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play fill="currentColor" /> Start Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Pause is tricky with Date.now() logic without more complex state, so we'll stick to Stop for MVP or implement simple pause later */}
              <button
                onClick={handleStop}
                className="col-span-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Square fill="currentColor" /> Stop Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="text-center p-6 space-y-4">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">Great Job!</h3>
              <p className="text-gray-600">
                You studied for <span className="font-bold text-indigo-600">{Math.round(lastSessionData?.session.duration / 60)} minutes</span>.
              </p>
              <p className="text-sm text-green-600 font-bold">
                +{lastSessionData?.xpEarned} XP Earned
              </p>
              <button
                onClick={() => setShowCelebration(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyTimer;

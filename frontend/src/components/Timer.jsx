import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addSession, updateStats, getStats } from '../utils/storage';
import { sessionEndQuotes } from '../data/quotes';
import MotivationPopup from './MotivationPopup';

export default function Timer({ onSessionComplete, timerControls }) {
  const { 
    time, isRunning, isPaused, startTime, 
    onStart, onPause, onStop, setTime 
  } = timerControls;
  
  const [showMotivation, setShowMotivation] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const handleStart = () => {
    onStart();
  };

  const handlePause = () => {
    onPause();
  };

  const handleStop = () => {
    if (time > 0) {
      // Save session
      const session = {
        duration: time,
        startTime: startTime,
        endTime: new Date(),
        mood: 'neutral'
      };

      addSession(session);
      const { stats, xpGained } = updateStats(session);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show motivation popup
      setSessionData({
        duration: time,
        xpGained,
        stats
      });
      setShowMotivation(true);

      if (onSessionComplete) {
        onSessionComplete(stats);
      }
    }

    onStop();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!isRunning) return 'from-gray-500 to-gray-600';
    if (isPaused) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-600';
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
        <div className="flex items-center justify-center mb-6">
          <Clock className="w-6 h-6 md:w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Study Timer</h2>
        </div>

        <motion.div
          className={`bg-gradient-to-br ${getTimerColor()} rounded-2xl p-8 md:p-12 mb-6 shadow-lg`}
          animate={{
            scale: isRunning && !isPaused ? [1, 1.02, 1] : 1
          }}
          transition={{
            duration: 2,
            repeat: isRunning && !isPaused ? Infinity : 0
          }}
        >
          <div className="text-center">
            <motion.div
              className="text-5xl md:text-7xl font-bold text-white mb-2 font-mono"
              animate={{
                opacity: isPaused ? [1, 0.5, 1] : 1
              }}
              transition={{
                duration: 1,
                repeat: isPaused ? Infinity : 0
              }}
            >
              {formatTime(time)}
            </motion.div>
            <p className="text-white/90 text-base md:text-lg font-medium">
              {!isRunning ? 'Ready to start' : isPaused ? 'Paused' : 'In Progress'}
            </p>
          </div>
        </motion.div>

        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
            >
              <Play className="w-5 h-5" />
              Start Session
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className={`flex items-center gap-2 ${
                  isPaused
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                } text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
              >
                <Square className="w-5 h-5" />
                Stop
              </motion.button>
            </>
          )}
        </div>

        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-600 text-sm">
              💡 Tip: Take a 5-minute break every hour for optimal focus
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showMotivation && sessionData && (
          <MotivationPopup
            sessionData={sessionData}
            onClose={() => setShowMotivation(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

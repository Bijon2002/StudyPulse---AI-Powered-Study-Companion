import { motion } from 'framer-motion';
import { X, Trophy, Zap, TrendingUp } from 'lucide-react';
import { getRandomQuote, sessionEndQuotes } from '../data/quotes';

export default function MotivationPopup({ sessionData, onClose }) {
  const { duration, xpGained, stats } = sessionData;
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const quote = getRandomQuote(sessionEndQuotes);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Trophy className="w-20 h-20 text-yellow-300 mx-auto mb-4" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Session Complete! 🎉
          </h2>
          
          <p className="text-purple-100 text-lg mb-6">
            {quote}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span>Study Time</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>XP Gained</span>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-2xl font-bold text-yellow-300"
              >
                +{xpGained} XP
              </motion.span>
            </div>

            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-200">Current Level</span>
                <span className="text-white font-bold">Level {stats.level}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-purple-200">Total XP</span>
                <span className="text-white font-bold">{stats.xp} XP</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-purple-200">Current Streak</span>
                <span className="text-white font-bold">{stats.currentStreak} days 🔥</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Continue Learning
          </motion.button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>
      </motion.div>
    </motion.div>
  );
}

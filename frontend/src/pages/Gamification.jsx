import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Trophy, Star, Gift, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Gamification = () => {
  const { data } = useStudy();
  const { user } = data;

  // Calculate progress to next level
  const xpForNextLevel = 50;
  const currentLevelXP = user.xp % xpForNextLevel;
  const progress = (currentLevelXP / xpForNextLevel) * 100;

  const getPlantStage = () => {
    if (user.level < 2) return '🌱';
    if (user.level < 5) return '🌿';
    if (user.level < 10) return '🌳';
    if (user.level < 20) return '🌲';
    return '🏞️';
  };

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-6xl mx-auto mb-4 border-4 border-white shadow-lg"
        >
          {user.avatar}
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
        <p className="text-indigo-600 font-bold text-lg mt-1">Level {user.level} Scholar</p>
      </header>

      {/* Progress Section */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
        
        <div className="flex justify-between items-center mb-2 mt-4">
          <span className="text-sm font-bold text-gray-500">Current XP: {currentLevelXP}</span>
          <span className="text-sm font-bold text-gray-500">Next Level: {xpForNextLevel}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
             <h3 className="text-2xl font-bold text-gray-800">Your Study World</h3>
             <p className="text-gray-500">Keep studying to grow your world!</p>
          </div>
          <div className="text-6xl animate-bounce">
            {getPlantStage()}
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl text-white shadow-lg transform transition-transform hover:-translate-y-1">
          <Trophy size={32} className="mb-4 text-yellow-100" />
          <h3 className="text-xl font-bold">Achievements</h3>
          <p className="text-yellow-100 text-sm mt-1">3 Badges Unlocked</p>
          <div className="flex gap-2 mt-4">
            <span className="bg-white/20 p-1 rounded" title="First Session">🥇</span>
            <span className="bg-white/20 p-1 rounded" title="Study Beast">🦁</span>
            <span className="bg-white/20 p-1 rounded opacity-50">🔒</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl text-white shadow-lg transform transition-transform hover:-translate-y-1">
          <Gift size={32} className="mb-4 text-purple-100" />
          <h3 className="text-xl font-bold">Mystery Box</h3>
          <p className="text-purple-100 text-sm mt-1">Open at Level {Math.ceil(user.level / 5) * 5}</p>
          <button className="mt-4 bg-white/20 w-full py-2 rounded-lg font-bold hover:bg-white/30 transition-colors">
            Locked
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-6 rounded-2xl text-white shadow-lg transform transition-transform hover:-translate-y-1">
          <Zap size={32} className="mb-4 text-blue-100" />
          <h3 className="text-xl font-bold">Power Ups</h3>
          <p className="text-blue-100 text-sm mt-1">Boost your XP gain</p>
          <div className="mt-4 flex items-center justify-between bg-white/10 rounded-lg p-2">
            <span className="text-sm font-bold">2x Multiplier</span>
            <span className="text-xs bg-white text-blue-500 px-2 py-1 rounded">Shop</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;

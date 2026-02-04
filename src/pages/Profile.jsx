import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, TrendingUp, Flame, Target, LogOut } from 'lucide-react';
import { getUser, getStats, getUserSessions, logout } from '../utils/storage';
import { badges } from '../data/badges';
import { getBadges } from '../utils/storage';
import Avatar from '../components/Avatar';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    const userData = getUser();
    const userStats = getStats();
    const userSessions = getUserSessions();
    const badgeIds = getBadges();
    const userBadges = badges.filter(b => badgeIds.includes(b.id));

    setUser(userData);
    setStats(userStats);
    setSessions(userSessions);
    setEarnedBadges(userBadges);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      onLogout();
    }
  };

  if (!user || !stats) {
    return <div className="text-white">Loading...</div>;
  }

  const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar level={stats.level} xp={stats.xp} />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
            <div className="flex flex-col md:flex-row gap-4 text-purple-100">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-8 h-8 text-purple-400" />
            <h3 className="text-white font-semibold">Level & XP</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">Level {stats.level}</div>
          <div className="text-purple-300">{stats.xp} Total XP</div>
          <div className="mt-3 bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              style={{ width: `${((stats.xp % 50) / 50) * 100}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <h3 className="text-white font-semibold">Study Time</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalHours.toFixed(1)}h</div>
          <div className="text-blue-300">{stats.totalSessions} Sessions</div>
          <div className="text-sm text-blue-400 mt-2">
            Avg: {stats.totalSessions > 0 ? ((stats.totalHours / stats.totalSessions) * 60).toFixed(0) : 0} min/session
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-8 h-8 text-orange-400" />
            <h3 className="text-white font-semibold">Streaks</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.currentStreak} days</div>
          <div className="text-orange-300">Current Streak</div>
          <div className="text-sm text-orange-400 mt-2">
            Best: {stats.longestStreak} days
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-8 h-8 text-green-400" />
            <h3 className="text-white font-semibold">Achievements</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{earnedBadges.length}</div>
          <div className="text-green-300">Badges Earned</div>
          <div className="text-sm text-green-400 mt-2">
            {badges.length - earnedBadges.length} more to unlock
          </div>
        </motion.div>
      </div>

      {/* Focus Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
      >
        <h3 className="text-xl font-bold text-white mb-6">Focus Patterns</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(stats.focusPatterns).map(([time, count], index) => {
            const total = Object.values(stats.focusPatterns).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            const icons = {
              morning: '🌅',
              afternoon: '☀️',
              evening: '🌆',
              night: '🌙'
            };

            return (
              <div key={time} className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">{icons[time]}</div>
                <div className="text-white font-semibold capitalize mb-1">{time}</div>
                <div className="text-purple-300 text-sm mb-2">{count} sessions</div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20"
        >
          <h3 className="text-xl font-bold text-white mb-6">Your Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:border-white/40 transition"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-sm font-bold text-white">{badge.name}</div>
                <div className="text-xs text-purple-300 mt-1">{badge.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

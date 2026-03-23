import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Flame, Clock, BookOpen, Target } from 'lucide-react';
import Timer from '../components/Timer';
import ProgressRing from '../components/ProgressRing';
import Avatar from '../components/Avatar';
import StudyGraph from '../components/StudyGraph';
import StreakGraph from '../components/StreakGraph';
import Rewards from '../components/Rewards';
import { getUser, getStats, getUserSessions } from '../utils/storage';
import { getRandomQuote, getPersonalizedQuote } from '../data/quotes';
import { analyzeStudyPatterns, calculateDailyStats } from '../utils/analytics';

export default function Dashboard({ timerControls, onNavigate }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userData = getUser();
    const userStats = getStats();
    const userSessions = getUserSessions();

    setUser(userData);
    setStats(userStats);
    setSessions(userSessions);

    if (userStats && userSessions) {
      const analysisResults = analyzeStudyPatterns(userSessions, userStats);
      setInsights(analysisResults);
    }
  };

  const handleSessionComplete = () => {
    loadData();
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  };

  const dailyStats = calculateDailyStats(sessions);

  if (!user || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {getPersonalizedQuote(user.name, getTimeOfDay())}
            </h1>
            <p className="text-blue-100 text-sm md:text-base lg:text-lg max-w-2xl mx-auto md:mx-0">
              {getRandomQuote()}
            </p>
          </div>
          <div className="block md:scale-90 lg:scale-100">
            <Avatar level={stats.level} xp={stats.xp} />
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-blue-100 h-full"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 md:w-6 h-6 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Today</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900">{dailyStats.hoursToday}h</div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">{dailyStats.sessionsToday} sessions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-purple-100 h-full"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 md:w-6 h-6 text-purple-600" />
            <span className="text-purple-700 text-sm font-medium">Total Hours</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900">{stats.totalHours.toFixed(1)}h</div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">{stats.totalSessions} sessions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-orange-100 h-full"
        >
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-5 h-5 md:w-6 h-6 text-orange-600" />
            <span className="text-orange-700 text-sm font-medium">Streak</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900">{stats.currentStreak}</div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">days in a row</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-green-100 h-full"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 md:w-6 h-6 text-green-600" />
            <span className="text-green-700 text-sm font-medium">Level</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900">{stats.level}</div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">{stats.xp} XP</div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Timer onSessionComplete={handleSessionComplete} timerControls={timerControls} />
        </div>

        {/* Progress Ring */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100 flex flex-col items-center justify-center min-h-[300px]">
          <ProgressRing level={stats.level} xp={stats.xp} />
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">Next Level</p>
            <p className="text-gray-900 font-bold text-lg">
              {50 - (stats.xp % 50)} XP to go
            </p>
          </div>
        </div>
      </div>

      {/* Study Graph */}
      <StudyGraph sessions={sessions} period="week" />

      {/* Streak Graph - GitHub Style */}
      <StreakGraph sessions={sessions} />

      {/* Insights */}
      {insights && insights.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-cyan-600" />
            <h3 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h3>
          </div>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100"
              >
                <p className="text-gray-800">{rec}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-cyan-700 text-sm font-medium">Best Study Time</p>
              <p className="text-gray-900 font-semibold">{insights.bestTimeOfDay}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-cyan-700 text-sm font-medium">Avg Session Length</p>
              <p className="text-gray-900 font-semibold">
                {(insights.averageSessionLength * 60).toFixed(0)} minutes
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rewards & Global Pulse */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Rewards stats={stats} />
        
        {/* Global Study Pulse */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
               </div>
               Global Study Pulse
            </h3>
            
            <div className="space-y-4">
               {[
                 { name: 'Alex M.', rank: 1, hours: 142, streak: 45, status: 'Studying Math' },
                 { name: 'Sarah K.', rank: 2, hours: 128, streak: 32, status: 'Physics Lab' },
                 { name: 'Li Wei', rank: 3, hours: 115, streak: 28, status: 'Literature' },
                 { name: user.name + ' (You)', rank: 142, hours: stats.totalHours.toFixed(0), streak: stats.currentStreak, isMe: true }
               ].map((leader, i) => (
                 <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${leader.isMe ? 'bg-blue-600/20 border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border border-white/10'}`}>
                    <div className="flex items-center gap-4">
                       <span className={`text-lg font-black ${leader.isMe ? 'text-blue-400' : 'text-slate-500'}`}>#{leader.rank}</span>
                       <div>
                          <p className="text-white font-bold text-sm tracking-tight">{leader.name}</p>
                          {leader.status && (
                             <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                {leader.status}
                             </p>
                          )}
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-white font-black text-xs">{leader.hours}h</p>
                       <p className="text-slate-500 text-[10px] font-bold">🔥 {leader.streak}d</p>
                    </div>
                 </div>
               ))}
            </div>
            
            <button 
              onClick={() => onNavigate('community')}
              className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
            >
               View Full Leaderboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

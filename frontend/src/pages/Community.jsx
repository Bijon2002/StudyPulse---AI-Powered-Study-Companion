import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Award, MessageSquare, Heart, Shield, Star, Globe } from 'lucide-react';
import api from '../utils/api';

export default function Community() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/api/users/leaderboard');
        const enrichedUsers = response.data.map((user, i) => {
          const colors = ['bg-yellow-500', 'bg-slate-300', 'bg-orange-400', 'bg-indigo-500', 'bg-blue-500', 'bg-pink-500', 'bg-emerald-500'];
          return {
            ...user,
            avatar: user.name.substring(0, 2).toUpperCase(),
            color: colors[i % colors.length]
          };
        });
        setLeaderboard(enrichedUsers);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Community Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8">
               <Globe className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Global Study Network</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 leading-[1.1] sm:leading-[0.9] text-center sm:text-left">
               Learn Faster <br/> Together.
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 font-medium leading-relaxed opacity-80 mb-10 text-center sm:text-left">
               Connect with top performing students worldwide. Compete in challenges, share resources, and climb the ranks.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
               <div className="text-center">
                  <p className="text-3xl font-black">{leaderboard.length > 0 ? leaderboard.length * 3 : 0}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Active Now</p>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="text-center">
                  <p className="text-3xl font-black">{leaderboard.length > 0 ? Math.floor(leaderboard.length / 2) : 0}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Countries</p>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="text-center">
                  <p className="text-3xl font-black">{leaderboard.length > 0 ? leaderboard.length * 15 : 0}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Study Rooms</p>
               </div>
            </div>
         </div>
         
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48 sm:w-64 sm:h-64 rotate-12" />
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
         {/* Leaderboard Section */}
         <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Global Ranks
               </h2>
               <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                  View Full Board
               </button>
            </div>
            
            <div className="space-y-4">
               {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                  </div>
               ) : leaderboard.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 font-medium">
                    No users found. Be the first to join the network!
                  </div>
               ) : leaderboard.map((user, i) => (
                  <motion.div 
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 p-4 rounded-[24px] hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                     <div className="text-xl font-black text-slate-300 w-8">{user.rank}</div>
                     <div className={`w-14 h-14 ${user.color} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                        ) : user.avatar}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 truncate">{user.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.hours || 0} Hours Logged</p>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="text-lg font-black text-slate-900">{(user.xp || 0).toLocaleString()}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">XP</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Activity feed / Challenges */}
         <div className="space-y-8">
            <div>
               <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" />
                  Active Challenges
               </h2>
               <div className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-[40px] border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 relative overflow-hidden group cursor-pointer">
                     <div className="relative z-10 flex-1">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Deep Work Sprint</h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">Complete 4 cycles of study without interruption.</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{leaderboard.length > 0 ? leaderboard.length * 12 : 0} Participants</span>
                        </div>
                     </div>
                     <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 relative z-10 group-hover:rotate-12 transition-transform self-end sm:self-auto">
                        🔥
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-[40px] border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 relative overflow-hidden group cursor-pointer">
                     <div className="relative z-10 flex-1">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Library Contributor</h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">Upload 5 high-quality notes to the public library.</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{leaderboard.length > 0 ? leaderboard.length * 8 : 0} Participants</span>
                        </div>
                     </div>
                     <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 relative z-10 group-hover:-rotate-12 transition-transform self-end sm:self-auto">
                        📚
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
               <div>
                  <h4 className="text-xl font-black mb-1">StudyPulse WhatsApp</h4>
                  <p className="text-xs text-slate-400 font-medium">Join the primary communications channel.</p>
                  <p className="text-sm font-bold text-green-400 mt-2">+94 77 315 5125</p>
               </div>
               <a 
                 href="https://wa.me/94773155125" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-6 py-3 bg-green-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
               >
                  Connect Account
               </a>
            </div>
         </div>
      </div>
    </div>
  );
}

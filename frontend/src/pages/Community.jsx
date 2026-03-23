import { motion } from 'framer-motion';
import { Users, Trophy, Award, MessageSquare, Heart, Shield, Star, Globe } from 'lucide-react';

export default function Community() {
  const leaderboard = [
    { rank: 1, name: 'Alex Thompson', sessions: 154, points: 12450, avatar: 'AT', color: 'bg-yellow-500' },
    { rank: 2, name: 'Sarah Chen', sessions: 142, points: 11200, avatar: 'SC', color: 'bg-slate-300' },
    { rank: 3, name: 'Michael Ross', sessions: 128, points: 9800, avatar: 'MR', color: 'bg-orange-400' },
    { rank: 4, name: 'Elena Gilbert', sessions: 115, points: 8500, avatar: 'EG', color: 'bg-indigo-500' },
    { rank: 5, name: 'David Kim', sessions: 98, points: 7200, avatar: 'DK', color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Community Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8">
               <Globe className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Global Study Network</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
               Learn Faster <br/> Together.
            </h1>
            <p className="text-xl text-indigo-100 font-medium leading-relaxed opacity-80 mb-10">
               Connect with top performing students worldwide. Compete in challenges, share resources, and climb the ranks.
            </p>
            <div className="flex items-center gap-6">
               <div className="text-center">
                  <p className="text-3xl font-black">2.4k+</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Active Now</p>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="text-center">
                  <p className="text-3xl font-black">150</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Countries</p>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="text-center">
                  <p className="text-3xl font-black">45.2k</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Study Rooms</p>
               </div>
            </div>
         </div>
         
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <Trophy className="w-64 h-64 rotate-12" />
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
         {/* Leaderboard Section */}
         <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Global Ranks
               </h2>
               <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                  View Full Board
               </button>
            </div>
            
            <div className="space-y-4">
               {leaderboard.map((user, i) => (
                  <motion.div 
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 p-4 rounded-[24px] hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                     <div className="text-xl font-black text-slate-300 w-8">{user.rank}</div>
                     <div className={`w-14 h-14 ${user.color} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {user.avatar}
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-slate-900">{user.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.sessions} Sessions</p>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{user.points.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Points</p>
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
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-[40px] border border-orange-100 flex items-center gap-8 relative overflow-hidden group cursor-pointer">
                     <div className="relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Deep Work Sprint</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6">Complete 4 cycles of study without interruption.</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">1,240 Participants</span>
                        </div>
                     </div>
                     <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl shrink-0 relative z-10 group-hover:rotate-12 transition-transform">
                        🔥
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[40px] border border-blue-100 flex items-center gap-8 relative overflow-hidden group cursor-pointer">
                     <div className="relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Library Contributor</h3>
                        <p className="text-sm text-slate-500 font-medium mb-6">Upload 5 high-quality notes to the public library.</p>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">842 Participants</span>
                        </div>
                     </div>
                     <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl shrink-0 relative z-10 group-hover:-rotate-12 transition-transform">
                        📚
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[40px] text-white flex items-center justify-between">
               <div>
                  <h4 className="text-xl font-black mb-1">StudyPulse Discord</h4>
                  <p className="text-xs text-slate-400 font-medium">Join the primary communications channel.</p>
               </div>
               <button className="px-6 py-3 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
                  Connect Account
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

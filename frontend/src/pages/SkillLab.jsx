import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, ChevronRight, Brain, Code, Book, Rocket, Trophy } from 'lucide-react';

export default function SkillLab() {
  const skills = [
    { title: 'Computer Science', level: 65, icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Mathematics', level: 42, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Philosophy', level: 88, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Physics', level: 20, icon: Rocket, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const roadmaps = [
    { id: 1, name: 'Fullstack Development 2026', duration: '6 Months', lessons: 24, progress: 45 },
    { id: 2, name: 'Data Science & Neural Networks', duration: '4 Months', lessons: 18, progress: 12 },
    { id: 3, name: 'Quantum Mechanics for Beginners', duration: '3 Months', lessons: 12, progress: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
              <Rocket className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Skill Lab</h1>
           <p className="text-xl text-slate-500 font-medium leading-relaxed">
             Track your mastery of complex subjects and follow AI-generated learning roadmaps tailored to your pace.
           </p>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Left: Mastery Grid */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <Trophy className="w-6 h-6 text-yellow-500" />
               Current Mastery
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
               {skills.map((skill, i) => (
                  <motion.div 
                    key={skill.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                  >
                     <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${skill.bg} ${skill.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                           <skill.icon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Level</span>
                           <span className={`text-xl font-black ${skill.color}`}>{skill.level}%</span>
                        </div>
                     </div>
                     <h3 className="text-lg font-black text-slate-900 mb-4">{skill.title}</h3>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${skill.level}%` }}
                           className={`h-full bg-current ${skill.color}`}
                        />
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Right: Roadmaps */}
         <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <Rocket className="w-6 h-6 text-blue-600" />
               AI Roadmaps
            </h2>
            <div className="space-y-4">
                {roadmaps.map(rm => (
                  <div key={rm.id} className="bg-white p-6 rounded-[32px] border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group">
                     <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{rm.name}</h4>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-all" />
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        <span>🕒 {rm.duration}</span>
                        <span>📚 {rm.lessons} Lessons</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600" style={{ width: `${rm.progress}%` }} />
                        </div>
                        <span className="text-xs font-black text-slate-900">{rm.progress}%</span>
                     </div>
                  </div>
                ))}
                <button className="w-full h-24 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all bg-slate-50/50">
                   <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                      <Zap className="w-4 h-4" />
                      Generate New Roadmap
                   </div>
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}

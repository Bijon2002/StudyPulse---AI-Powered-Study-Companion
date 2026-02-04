import { motion } from 'framer-motion';

export default function ProgressRing({ level, xp }) {
  const xpForNextLevel = level * 50;
  const xpInCurrentLevel = xp % 50;
  const progress = (xpInCurrentLevel / 50) * 100;
  
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="54"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="80"
          cy="80"
          r="54"
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-white">{level}</div>
        <div className="text-xs text-purple-300">Level</div>
        <div className="text-xs text-purple-400 mt-1">{xpInCurrentLevel}/50 XP</div>
      </div>
    </div>
  );
}

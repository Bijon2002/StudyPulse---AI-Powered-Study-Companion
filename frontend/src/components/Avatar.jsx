import { motion } from 'framer-motion';

const avatarStages = [
  { level: 1, emoji: '🌱', name: 'Seedling', description: 'Just starting out' },
  { level: 5, emoji: '🌿', name: 'Sprout', description: 'Growing strong' },
  { level: 10, emoji: '🌳', name: 'Tree', description: 'Deeply rooted' },
  { level: 15, emoji: '🏝️', name: 'Island', description: 'Building your world' },
  { level: 20, emoji: '🏙️', name: 'City', description: 'Thriving ecosystem' },
  { level: 30, emoji: '🌍', name: 'World', description: 'Master of knowledge' },
  { level: 50, emoji: '🌌', name: 'Universe', description: 'Limitless potential' }
];

export default function Avatar({ level, xp, src }) {
  const currentStage = [...avatarStages]
    .reverse()
    .find(stage => level >= stage.level) || avatarStages[0];

  return (
    <div className="text-center">
      <motion.div
        className="relative inline-block"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden">
          {src ? (
            <img src={src} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <motion.div
              className="text-6xl"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              {currentStage.emoji}
            </motion.div>
          )}
        </div>
        
        <motion.div
          className="absolute -bottom-2 -right-2 bg-yellow-400 text-purple-900 font-bold text-sm px-3 py-1 rounded-full shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          Lv {level}
        </motion.div>
      </motion.div>

      <div className="mt-4">
        <h3 className="text-xl font-bold text-white">{currentStage.name}</h3>
        <p className="text-purple-300 text-sm">{currentStage.description}</p>
      </div>

      <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-purple-300">Progress</span>
          <span className="text-white font-semibold">{xp % 50}/50 XP</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((xp % 50) / 50) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

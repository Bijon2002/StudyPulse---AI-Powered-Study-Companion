import { motion } from 'framer-motion';
import { badges, rarityColors, checkBadgeEarned } from '../data/badges';
import { getBadges } from '../utils/storage';

export default function Rewards({ stats }) {
  const earnedBadgeIds = getBadges();
  
  const earnedBadges = badges.filter(badge => earnedBadgeIds.includes(badge.id));
  const availableBadges = badges.filter(badge => !earnedBadgeIds.includes(badge.id));

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
      <h3 className="text-2xl font-bold text-white mb-6">🏆 Achievements</h3>

      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-purple-300 mb-4">
            Earned ({earnedBadges.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-6 gap-4">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:border-white/40 transition"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className={`text-sm font-bold ${rarityColors[badge.rarity]}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-purple-300 mt-1">
                  {badge.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold text-purple-300 mb-4">
          Available ({availableBadges.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-6 gap-4">
          {availableBadges.slice(0, 8).map((badge, index) => {
            const canEarn = checkBadgeEarned(badge, stats);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border ${
                  canEarn ? 'border-yellow-500/50 animate-pulse' : 'border-white/10'
                } transition`}
              >
                <div className="text-4xl mb-2 grayscale opacity-50">
                  {badge.icon}
                </div>
                <div className="text-sm font-bold text-gray-400">
                  {badge.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {badge.description}
                </div>
                {canEarn && (
                  <div className="mt-2 text-xs text-yellow-400 font-semibold">
                    ✨ Ready to claim!
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {earnedBadges.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-purple-300">
            Start studying to earn your first badge!
          </p>
        </div>
      )}
    </div>
  );
}

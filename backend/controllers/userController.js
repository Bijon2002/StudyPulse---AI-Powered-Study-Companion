const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    // Fetch top 50 users sorted by XP descending
    const users = await User.find({}, 'name stats profilePic')
      .sort({ 'stats.xp': -1 })
      .limit(50);

    // Format the response to match the expected frontend structure
    const leaderboard = users.map((user, index) => ({
      id: user._id,
      name: user.name,
      rank: index + 1,
      xp: user.stats.xp,
      hours: user.stats.totalHours,
      streak: user.stats.currentStreak,
      level: user.stats.level,
      profilePic: user.profilePic || null
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

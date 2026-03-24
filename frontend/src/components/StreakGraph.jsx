import { motion } from 'framer-motion';

export default function StreakGraph({ sessions = [] }) {
  // Generate last 30 days (1 month)
  const generateDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        dayOfMonth: date.getDate(),
        count: 0
      });
    }
    
    return days;
  };

  const days = generateDays();

  // Count sessions per day
  sessions.forEach(session => {
    const sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
    const day = days.find(d => d.date === sessionDate);
    if (day) {
      day.count++;
    }
  });

  // Get color based on count
  const getColor = (count) => {
    if (count === 0) return '#e5e7eb';
    if (count === 1) return '#93c5fd';
    if (count === 2) return '#60a5fa';
    if (count === 3) return '#2563eb';
    return '#1e40af';
  };

  // Get tooltip text
  const getTooltip = (day) => {
    const date = new Date(day.date);
    const formatted = date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    if (day.count === 0) {
      return `No sessions on ${formatted}`;
    }
    return `${day.count} session${day.count > 1 ? 's' : ''} on ${formatted}`;
  };

  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  
  days.forEach((day, index) => {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
    
    if (index === days.length - 1) {
      weeks.push(currentWeek);
    }
  });

  // Day labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month labels from the data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels = [];
  let lastMonth = -1;
  
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay && firstDay.month !== lastMonth) {
      monthLabels.push({
        month: months[firstDay.month],
        weekIndex
      });
      lastMonth = firstDay.month;
    }
  });

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(59, 130, 246, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'space-between',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}>
            📅
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#f8fafc',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>Study Streak</h3>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '2px 0 0 0',
              fontWeight: '500'
            }}>Last 30 days</p>
          </div>
        </div>
        
        {/* Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#94a3b8',
          fontWeight: '500'
        }}>
          <span>Less</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {['#e5e7eb', '#93c5fd', '#60a5fa', '#2563eb', '#1e40af'].map((color, i) => (
              <div key={i} style={{
                width: '12px',
                height: '12px',
                backgroundColor: color,
                borderRadius: '3px',
                opacity: 0.9
              }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Streak badge */}
      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(239, 68, 68, 0.1))',
            border: '1px solid rgba(251, 146, 60, 0.25)',
            borderRadius: '20px',
            padding: '6px 14px',
            marginBottom: '18px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <span style={{ fontSize: '14px' }}>🔥</span>
          <span style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#fb923c',
            letterSpacing: '-0.01em'
          }}>{currentStreak} day streak!</span>
        </motion.div>
      )}

      {/* Heatmap Grid */}
      <div className="hide-scrollbar" style={{ position: 'relative', zIndex: 1, overflowX: 'auto', paddingBottom: '8px' }}>
        {/* Month labels */}
        <div style={{ display: 'flex', marginBottom: '8px', paddingLeft: '36px' }}>
          {monthLabels.map((label, index) => (
            <div
              key={index}
              style={{
                fontSize: '11px',
                color: '#64748b',
                fontWeight: '600',
                position: 'relative',
                left: `${label.weekIndex * 20}px`
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0' }}>
          {/* Day labels on the left */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginRight: '8px',
            paddingTop: '0'
          }}>
            {dayLabels.map((label, i) => (
              <div key={i} style={{
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px',
                color: '#475569',
                fontWeight: '600',
                width: '28px',
                justifyContent: 'flex-end'
              }}>
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.find(d => d.dayOfWeek === dayOfWeek);
                  
                  return (
                    <motion.div
                      key={dayOfWeek}
                      whileHover={{ scale: 1.4, zIndex: 10 }}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        backgroundColor: day ? getColor(day.count) : 'transparent',
                        cursor: day ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        outline: day && day.count > 0 ? `1px solid rgba(255,255,255,0.05)` : 'none'
                      }}
                      title={day ? getTooltip(day) : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}

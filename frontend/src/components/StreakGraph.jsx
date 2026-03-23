import { motion } from 'framer-motion';

export default function StreakGraph({ sessions = [] }) {
  // Generate last 365 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
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
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-400';
    if (count === 3) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  // Get tooltip text
  const getTooltip = (day) => {
    const date = new Date(day.date);
    const formatted = date.toLocaleDateString('en-US', { 
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

  // Month labels
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">📅 Study Streak</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-800 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2">
            {monthLabels.map((label, index) => (
              <div
                key={index}
                className="text-xs text-gray-600"
                style={{ marginLeft: `${label.weekIndex * 14}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.find(d => d.dayOfWeek === dayOfWeek);
                  
                  return (
                    <motion.div
                      key={dayOfWeek}
                      whileHover={{ scale: 1.5 }}
                      className={`w-3 h-3 rounded-sm ${day ? getColor(day.count) : 'bg-transparent'} cursor-pointer`}
                      title={day ? getTooltip(day) : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Day labels */}
          <div className="flex flex-col gap-1 mt-2 text-xs text-gray-600">
            <div style={{ height: '12px' }}>Mon</div>
            <div style={{ height: '12px' }}></div>
            <div style={{ height: '12px' }}>Wed</div>
            <div style={{ height: '12px' }}></div>
            <div style={{ height: '12px' }}>Fri</div>
            <div style={{ height: '12px' }}></div>
            <div style={{ height: '12px' }}>Sun</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {sessions.length}
          </div>
          <div className="text-xs text-gray-600">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {days.filter(d => d.count > 0).length}
          </div>
          <div className="text-xs text-gray-600">Active Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.max(...days.map(d => d.count), 0)}
          </div>
          <div className="text-xs text-gray-600">Best Day</div>
        </div>
      </div>
    </div>
  );
}

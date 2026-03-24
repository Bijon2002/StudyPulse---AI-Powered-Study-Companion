import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, Trash2, Clock, BookOpen, Target, CheckCircle2, 
  Circle, AlertCircle, TrendingUp, Lightbulb, Brain, Zap
} from 'lucide-react';

export default function Planner() {
  const [mode, setMode] = useState('exam'); // 'exam' or 'topic'
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [examPlans, setExamPlans] = useState([]);
  const [topicPlans, setTopicPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  
  const [newExamPlan, setNewExamPlan] = useState({
    subject: '',
    examDate: '',
    topics: '',
    hoursPerDay: 3,
    currentLevel: 'beginner'
  });

  const [newTopicPlan, setNewTopicPlan] = useState({
    topicName: '',
    difficulty: 'intermediate',
    targetDays: 14,
    hoursPerDay: 2
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const exams = JSON.parse(localStorage.getItem('studypulse_exam_plans') || '[]');
    const topics = JSON.parse(localStorage.getItem('studypulse_topic_plans') || '[]');
    setExamPlans(exams);
    setTopicPlans(topics);
  };

  // Generate Day-by-Day Exam Plan
  const generateExamTimeline = (plan) => {
    const examDate = new Date(plan.examDate);
    const today = new Date();
    const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    const topics = plan.topics.split(',').map(t => t.trim());
    const hoursPerDay = parseInt(plan.hoursPerDay);
    
    const timeline = [];
    const topicsPerDay = Math.ceil(topics.length / Math.max(daysUntil, 1));
    
    for (let day = 1; day <= daysUntil; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + day - 1);
      
      const dayTopics = topics.slice((day - 1) * topicsPerDay, day * topicsPerDay);
      
      let phase = 'Learning';
      let suggestions = [];
      
      if (day <= daysUntil * 0.7) {
        phase = 'Learning Phase';
        suggestions = [
          '📚 Focus on understanding core concepts',
          '✍️ Take detailed notes',
          '🎯 Practice basic problems',
          '💡 Watch tutorial videos if needed'
        ];
      } else if (day <= daysUntil * 0.9) {
        phase = 'Practice Phase';
        suggestions = [
          '📝 Solve practice problems',
          '🔄 Review previous topics',
          '⚡ Speed up problem-solving',
          '🎓 Test yourself with quizzes'
        ];
      } else {
        phase = 'Revision Phase';
        suggestions = [
          '🔍 Quick revision of all topics',
          '📋 Review your notes',
          '⭐ Focus on weak areas',
          '😌 Stay calm and confident'
        ];
      }
      
      timeline.push({
        day,
        date: currentDate.toLocaleDateString(),
        phase,
        topics: dayTopics,
        hours: hoursPerDay,
        suggestions,
        completed: false
      });
    }
    
    return timeline;
  };

  // Generate Topic Learning Timeline
  const generateTopicTimeline = (plan) => {
    const days = parseInt(plan.targetDays);
    const hoursPerDay = parseInt(plan.hoursPerDay);
    const difficulty = plan.difficulty;
    
    const phases = [
      {
        name: 'Foundation',
        percentage: 0.3,
        activities: [
          '📖 Read introductory materials',
          '🎯 Understand basic terminology',
          '💭 Identify key concepts',
          '📝 Create concept map'
        ]
      },
      {
        name: 'Deep Dive',
        percentage: 0.4,
        activities: [
          '🔬 Study advanced concepts',
          '💡 Work through examples',
          '🧩 Solve practice problems',
          '🎓 Watch expert explanations'
        ]
      },
      {
        name: 'Mastery',
        percentage: 0.3,
        activities: [
          '⚡ Practice complex problems',
          '🔄 Review and reinforce',
          '🎯 Test your knowledge',
          '✨ Apply to real scenarios'
        ]
      }
    ];
    
    const timeline = [];
    let currentDay = 1;
    
    phases.forEach(phase => {
      const phaseDays = Math.ceil(days * phase.percentage);
      
      for (let i = 0; i < phaseDays; i++) {
        if (currentDay > days) break;
        
        const date = new Date();
        date.setDate(date.getDate() + currentDay - 1);
        
        timeline.push({
          day: currentDay,
          date: date.toLocaleDateString(),
          phase: phase.name,
          hours: hoursPerDay,
          activities: phase.activities,
          milestones: currentDay === 1 ? ['🎯 Start learning'] : 
                     currentDay === Math.ceil(days * 0.3) ? ['✅ Foundation complete'] :
                     currentDay === Math.ceil(days * 0.7) ? ['🎓 Deep dive complete'] :
                     currentDay === days ? ['🏆 Topic mastered!'] : [],
          completed: false
        });
        
        currentDay++;
      }
    });
    
    return timeline;
  };

  const handleCreateExamPlan = () => {
    if (!newExamPlan.subject || !newExamPlan.examDate || !newExamPlan.topics) {
      alert('Please fill in all fields');
      return;
    }

    const plan = {
      id: Date.now(),
      ...newExamPlan,
      createdAt: new Date().toISOString(),
      timeline: generateExamTimeline(newExamPlan)
    };

    const plans = [...examPlans, plan];
    setExamPlans(plans);
    localStorage.setItem('studypulse_exam_plans', JSON.stringify(plans));
    
    setNewExamPlan({ subject: '', examDate: '', topics: '', hoursPerDay: 3, currentLevel: 'beginner' });
    setShowCreatePlan(false);
  };

  const handleCreateTopicPlan = () => {
    if (!newTopicPlan.topicName) {
      alert('Please enter a topic name');
      return;
    }

    const plan = {
      id: Date.now(),
      ...newTopicPlan,
      createdAt: new Date().toISOString(),
      timeline: generateTopicTimeline(newTopicPlan)
    };

    const plans = [...topicPlans, plan];
    setTopicPlans(plans);
    localStorage.setItem('studypulse_topic_plans', JSON.stringify(plans));
    
    setNewTopicPlan({ topicName: '', difficulty: 'intermediate', targetDays: 14, hoursPerDay: 2 });
    setShowCreatePlan(false);
  };

  const deletePlan = (planId, type) => {
    if (confirm('Delete this plan?')) {
      if (type === 'exam') {
        const plans = examPlans.filter(p => p.id !== planId);
        setExamPlans(plans);
        localStorage.setItem('studypulse_exam_plans', JSON.stringify(plans));
      } else {
        const plans = topicPlans.filter(p => p.id !== planId);
        setTopicPlans(plans);
        localStorage.setItem('studypulse_topic_plans', JSON.stringify(plans));
      }
    }
  };

  const toggleDayCompletion = (dayIndex) => {
    const updatedTimeline = [...selectedPlan.timeline];
    updatedTimeline[dayIndex].completed = !updatedTimeline[dayIndex].completed;
    
    const updatedPlan = { ...selectedPlan, timeline: updatedTimeline };
    setSelectedPlan(updatedPlan);

    if (mode === 'exam') {
      const plans = examPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
      setExamPlans(plans);
      localStorage.setItem('studypulse_exam_plans', JSON.stringify(plans));
    } else {
      const plans = topicPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
      setTopicPlans(plans);
      localStorage.setItem('studypulse_topic_plans', JSON.stringify(plans));
    }
  };

  const viewTimeline = (plan) => {
    setSelectedPlan(plan);
    setShowTimeline(true);
  };

  const currentPlans = mode === 'exam' ? examPlans : topicPlans;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Smart Study Planner</h2>
              <p className="text-gray-600 text-sm">AI-powered day-by-day study plans</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreatePlan(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg transition shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('exam')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              mode === 'exam' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Exam Preparation
          </button>
          <button
            onClick={() => setMode('topic')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              mode === 'topic' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Topic Learning
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {currentPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {mode === 'exam' ? plan.subject : plan.topicName}
                  </h3>
                  
                  {mode === 'exam' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      <Calendar className="w-4 h-4" />
                      Exam: {new Date(plan.examDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {mode === 'topic' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      <Target className="w-4 h-4" />
                      {plan.targetDays} days plan
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => deletePlan(plan.id, mode)}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {plan.hoursPerDay} hours/day
                </div>
                
                {mode === 'exam' && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    {plan.topics.split(',').length} topics
                  </div>
                )}
                
                {mode === 'topic' && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    {plan.difficulty} level
                  </div>
                )}
              </div>

              <button
                onClick={() => viewTimeline(plan)}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                View Day-by-Day Timeline
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 text-xl font-semibold mb-2">
            No {mode === 'exam' ? 'exam' : 'topic'} plans yet
          </h3>
          <p className="text-gray-600 mb-4">Create your first plan to get started</p>
          <button
            onClick={() => setShowCreatePlan(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Create Plan Modal */}
      <AnimatePresence>
        {showCreatePlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreatePlan(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Create {mode === 'exam' ? 'Exam Preparation' : 'Topic Learning'} Plan
              </h3>

              {mode === 'exam' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Subject Name</label>
                    <input
                      type="text"
                      value={newExamPlan.subject}
                      onChange={(e) => setNewExamPlan({ ...newExamPlan, subject: e.target.value })}
                      placeholder="e.g., Mathematics, Physics"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Exam Date</label>
                    <input
                      type="date"
                      value={newExamPlan.examDate}
                      onChange={(e) => setNewExamPlan({ ...newExamPlan, examDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Topics (comma-separated)</label>
                    <textarea
                      value={newExamPlan.topics}
                      onChange={(e) => setNewExamPlan({ ...newExamPlan, topics: e.target.value })}
                      placeholder="Algebra, Calculus, Geometry"
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Hours per Day</label>
                    <select
                      value={newExamPlan.hoursPerDay}
                      onChange={(e) => setNewExamPlan({ ...newExamPlan, hoursPerDay: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(h => (
                        <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}/day</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Current Level</label>
                    <select
                      value={newExamPlan.currentLevel}
                      onChange={(e) => setNewExamPlan({ ...newExamPlan, currentLevel: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateExamPlan}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      Generate Plan
                    </button>
                    <button
                      onClick={() => setShowCreatePlan(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Topic Name</label>
                    <input
                      type="text"
                      value={newTopicPlan.topicName}
                      onChange={(e) => setNewTopicPlan({ ...newTopicPlan, topicName: e.target.value })}
                      placeholder="e.g., Machine Learning, Quantum Physics"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Difficulty Level</label>
                    <select
                      value={newTopicPlan.difficulty}
                      onChange={(e) => setNewTopicPlan({ ...newTopicPlan, difficulty: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Target Days</label>
                    <select
                      value={newTopicPlan.targetDays}
                      onChange={(e) => setNewTopicPlan({ ...newTopicPlan, targetDays: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[7, 14, 21, 30].map(d => (
                        <option key={d} value={d}>{d} days</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Hours per Day</label>
                    <select
                      value={newTopicPlan.hoursPerDay}
                      onChange={(e) => setNewTopicPlan({ ...newTopicPlan, hoursPerDay: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(h => (
                        <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}/day</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateTopicPlan}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                    >
                      Generate Plan
                    </button>
                    <button
                      onClick={() => setShowCreatePlan(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Modal */}
      <AnimatePresence>
        {showTimeline && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTimeline(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  📅 Day-by-Day Timeline: {mode === 'exam' ? selectedPlan.subject : selectedPlan.topicName}
                </h3>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedPlan.timeline.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gradient-to-r ${day.completed ? 'from-green-50 to-emerald-50 border-emerald-500' : 'from-blue-50 to-sky-50 border-blue-600'} rounded-xl p-5 border-l-4 relative`}
                  >
                    <div className="absolute top-5 right-5">
                      <button 
                        onClick={() => toggleDayCompletion(index)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${day.completed ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 shadow-sm'}`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${day.completed ? 'text-emerald-600' : 'text-slate-400'}`} />
                        {day.completed ? 'Completed' : 'Mark Done'}
                      </button>
                    </div>

                    <div className="flex items-start justify-between mb-3 pr-28">
                      <div>
                        <h4 className={`text-lg font-bold ${day.completed ? 'text-emerald-900 line-through opacity-70' : 'text-gray-900'}`}>
                          Day {day.day} - {day.date}
                        </h4>
                        <p className={`${day.completed ? 'text-emerald-600 opacity-80' : 'text-blue-600'} font-semibold text-sm`}>{day.phase}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {day.hours}h
                      </div>
                    </div>

                    {mode === 'exam' && day.topics && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Topics to cover:</p>
                        <div className="flex flex-wrap gap-2">
                          {day.topics.map((topic, i) => (
                            <span key={i} className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === 'topic' && day.activities && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Activities:</p>
                        <div className="space-y-1">
                          {day.activities.map((activity, i) => (
                            <p key={i} className="text-sm text-gray-700">{activity}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.suggestions && (
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          Study Tips:
                        </p>
                        <div className="space-y-1">
                          {day.suggestions.map((tip, i) => (
                            <p key={i} className="text-xs text-gray-600">{tip}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {day.milestones && day.milestones.length > 0 && (
                      <div className="mt-2">
                        {day.milestones.map((milestone, i) => (
                          <span key={i} className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {milestone}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

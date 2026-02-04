import { Plus, Calendar as CalendarIcon, Book, Trash2, Sparkles, Briefcase, Map } from 'lucide-react';
import { generateStudyPlan, generateCareerInsights } from '../utils/aiHelpers';

const Planner = () => {
  const { data, addExam, setData } = useStudy();
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [careerInsights, setCareerInsights] = useState(null);
  
  const [newExam, setNewExam] = useState({
    subject: '',
    date: '',
    topics: ''
  });

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!newExam.subject || !newExam.date) return;

    const topicsList = newExam.topics.split(',').map(t => t.trim()).filter(t => t);
    
    addExam({
      subject: newExam.subject,
      date: newExam.date,
      topics: topicsList
    });

    setNewExam({ subject: '', date: '', topics: '' });
    setShowForm(false);
  };

  const handleAIPlan = async (exam) => {
    setIsGenerating(true);
    const plan = await generateStudyPlan(exam.subject, exam.date, exam.topics);
    if (plan) {
      setActivePlan({ id: exam.id, steps: plan });
    }
    setIsGenerating(false);
  };

  const handleCareerMagic = async () => {
    if (data.exams.length === 0) return;
    setIsGenerating(true);
    const subjects = data.exams.map(e => e.subject);
    const insights = await generateCareerInsights(subjects);
    setCareerInsights(insights);
    setIsGenerating(false);
  };

  const generateSchedule = (exam) => {
    const today = new Date();
    const examDate = new Date(exam.date);
    const daysLeft = differenceInDays(examDate, today);
    
    if (daysLeft <= 0) return <p className="text-red-500">Exam is today or passed!</p>;
    
    const isAIPlan = activePlan?.id === exam.id;

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
           <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
             <Map className="w-4 h-4 text-indigo-600" />
             Study Roadmap
           </h4>
           <button 
             onClick={() => handleAIPlan(exam)}
             disabled={isGenerating}
             className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-indigo-700 transition-all disabled:opacity-50"
           >
             <Sparkles className="w-3 h-3" />
             {isGenerating ? 'Analyzing...' : 'AI Smart Plan'}
           </button>
        </div>

        {isAIPlan ? (
          <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
             {activePlan.steps.map((step, i) => (
               <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-[10px] font-black text-indigo-600">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-indigo-900 uppercase tracking-tighter">{step.day}</p>
                    <p className="text-xs font-bold text-gray-700">{step.focus}</p>
                    <p className="text-[10px] text-gray-500 italic mt-0.5">{step.goal}</p>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="bg-indigo-50/50 rounded-2xl p-4 text-sm text-indigo-800 border border-indigo-100/50">
            <p className="font-bold mb-1">📅 {daysLeft} Days Remaining</p>
            <p className="text-xs opacity-80">Click 'AI Smart Plan' for a detailed daily schedule breakdown.</p>
          </div>
        )}
      </div>
    );
  };

  const deleteExam = (id) => {
    setData(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exam Planner</h1>
          <p className="text-gray-500">Auto-generate your study schedules.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Add Exam
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddExam} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newExam.subject}
                  onChange={e => setNewExam({...newExam, subject: e.target.value})}
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newExam.date}
                  onChange={e => setNewExam({...newExam, date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma separated)</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                rows="3"
                value={newExam.topics}
                onChange={e => setNewExam({...newExam, topics: e.target.value})}
                placeholder="Algebra, Geometry, Trigonometry, Calculus..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.exams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No exams planned yet. Add one to get started!</p>
          </div>
        ) : (
          data.exams.map(exam => (
            <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
              <button 
                onClick={() => deleteExam(exam.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <Book size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{exam.subject}</h3>
                  <p className="text-sm text-gray-500">{format(new Date(exam.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Topics ({exam.topics.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {exam.topics.slice(0, 3).map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {t}
                    </span>
                  ))}
                  {exam.topics.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{exam.topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                {generateSchedule(exam)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bonus AI Section */}
      <div className="pt-10">
         <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
               <div className="max-w-xl">
                  <h3 className="text-3xl font-black mb-4 tracking-tight flex items-center justify-center md:justify-start gap-3">
                     <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                     </div>
                     AI Career Navigator
                  </h3>
                  <p className="text-indigo-200 font-medium leading-relaxed">
                     Our AI analyzes your currently planned subjects and maps out potential career paths and professional insights tailored just for you.
                  </p>
               </div>
               <button 
                 onClick={handleCareerMagic}
                 disabled={isGenerating || data.exams.length === 0}
                 className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all disabled:opacity-50"
               >
                  {isGenerating ? 'Mapping Futures...' : 'Discover My Future'}
               </button>
            </div>

            {careerInsights && (
               <div className="mt-12 grid md:grid-cols-3 gap-6 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  {careerInsights.map((item, i) => (
                     <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/10 hover:bg-white/15 transition-all group">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                           {i === 0 ? '🚀' : i === 1 ? '💎' : '🌍'}
                        </div>
                        <h4 className="text-xl font-bold mb-3">{item.career}</h4>
                        <p className="text-sm text-indigo-100/70 mb-6 leading-relaxed font-medium">{item.description}</p>
                        <div className="pt-6 border-t border-white/10">
                           <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Pro Insight</p>
                           <p className="text-xs italic text-indigo-100 font-medium leading-relaxed">"{item.insight}"</p>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Planner;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Users, BookOpen, User as UserIcon, Menu, LogOut, X, Zap, Clock, Library, Search, Sparkles, Mic, Rocket, Globe, Palette } from 'lucide-react';
import { getChatbotResponse } from './utils/aiHelpers';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import PlannerPage from './pages/PlannerPage';
import StudyRoomsPage from './pages/StudyRoomsPage';
import NotebookPage from './pages/NotebookPage';
import Profile from './pages/Profile';
import FocusPage from './pages/FocusPage';
import LibraryPage from './pages/LibraryPage';
import Community from './pages/Community';
import WhiteboardPage from './pages/WhiteboardPage';
import ExtensionManager from './pages/ExtensionManager';
import ChatBot from './components/ChatBot';
import { getUser } from './utils/storage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Timer State
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(null);

  // AI Command Bar State
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandResult, setCommandResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
    }

    // Load timer state from localStorage if it exists
    const savedTimer = localStorage.getItem('studypulse_active_timer');
    if (savedTimer) {
      const data = JSON.parse(savedTimer);
      if (data.isRunning) {
        // Calculate elapsed time if it was running
        const startTime = new Date(data.startTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        setTimerTime(data.isPaused ? data.time : elapsed);
        setIsTimerRunning(true);
        setIsTimerPaused(data.isPaused);
        setTimerStartTime(startTime);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
      }
      if (e.key === 'Escape') setShowCommandBar(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandSearch = async (e) => {
    e.preventDefault();
    if (!commandQuery.trim()) return;
    
    setIsSearching(true);
    const q = commandQuery.toLowerCase();
    if (q.includes('go to') || q.includes('open')) {
      if (q.includes('notebook')) { setCurrentPage('notebook'); setShowCommandBar(false); }
      else if (q.includes('focus')) { setCurrentPage('focus'); setShowCommandBar(false); }
      else if (q.includes('hub')) { setCurrentPage('ai-hub'); setShowCommandBar(false); }
      else if (q.includes('planner')) { setCurrentPage('planner'); setShowCommandBar(false); }
    }

    const aiResponse = await getChatbotResponse(commandQuery);
    setCommandResult(aiResponse?.response || "I'm here to help!");
    setIsSearching(false);
  };

  // Timer Ticker
  useEffect(() => {
    let interval;
    if (isTimerRunning && !isTimerPaused) {
      interval = setInterval(() => {
        setTimerTime(t => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerPaused]);

  // Persist timer state
  useEffect(() => {
    if (isTimerRunning) {
      localStorage.setItem('studypulse_active_timer', JSON.stringify({
        time: timerTime,
        isRunning: isTimerRunning,
        isPaused: isTimerPaused,
        startTime: timerStartTime?.toISOString()
      }));
    } else {
      localStorage.removeItem('studypulse_active_timer');
    }
  }, [timerTime, isTimerRunning, isTimerPaused, timerStartTime]);

  const handleTimerStart = () => {
    setTimerStartTime(new Date());
    setIsTimerRunning(true);
    setIsTimerPaused(false);
    setTimerTime(0);
  };

  const handleTimerPause = () => {
    setIsTimerPaused(!isTimerPaused);
  };

  const handleTimerStop = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setTimerTime(0);
    setTimerStartTime(null);
  };

  const timerControls = {
    time: timerTime,
    isRunning: isTimerRunning,
    isPaused: isTimerPaused,
    startTime: timerStartTime,
    onStart: handleTimerStart,
    onPause: handleTimerPause,
    onStop: handleTimerStop,
    setTime: setTimerTime
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  if (!currentUser) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  const navItems = [
    { group: 'Core Dashboard', items: [
      { id: 'dashboard', label: 'Overview', icon: Home },
      { id: 'planner', label: 'Study Planner', icon: Calendar },
      { id: 'focus', label: 'Focus Guardian', icon: Clock },
      { id: 'notebook', label: 'Daily Notes', icon: BookOpen },
    ]},
    { group: 'Collaborative', items: [
      { id: 'rooms', label: 'Study Rooms', icon: Users },
      { id: 'whiteboard', label: 'Whiteboard', icon: Palette },
      { id: 'community', label: 'Community', icon: Globe },
    ]},
    { group: 'System', items: [
      { id: 'library', label: 'Resource Library', icon: Library },
      { id: 'extension', label: 'Extension Guard', icon: Zap },
      { id: 'profile', label: 'My Profile', icon: UserIcon },
    ]}
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-50 overflow-hidden">
    {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200 h-full overflow-y-auto z-40 shadow-sm transition-all duration-300 flex-shrink-0">
        {/* Sidebar Logo */}
        <div className="p-4 xl:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <span className="text-white text-xl font-black">⚡</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-900 to-blue-700 bg-clip-text text-transparent tracking-tight truncate">
                StudyPulse
              </h1>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/70 block">Intelligence Hub</span>
            </div>
          </div>
        </div>

        {/* AI Command Button */}
        <div className="px-6 mb-4">
           <button 
             onClick={() => setShowCommandBar(true)}
             className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all font-bold text-xs"
           >
              <Search className="w-4 h-4" />
              <span>Ask AI anything...</span>
              <span className="ml-auto text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>
           </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.group}</p>
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl font-bold text-sm transition-all relative group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activePill"
                        className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Nav is now just the links */}
      </aside>

      {/* Mobile Header */}
      <nav className="lg:hidden w-full flex-shrink-0 bg-white border-b border-slate-200 p-4 sticky top-0 z-[50] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">⚡</div>
          <span className="font-black text-slate-900 tracking-tight text-lg">StudyPulse</span>
        </div>
        <div className="flex items-center gap-2">
           <a 
             href="/studypulse-extension.zip"
             download="StudyPulse-Extension.zip"
             onClick={() => {
               alert("Extension downloaded! Extract the ZIP and load it via your browser's extension page (Enable Developer Mode -> Load Unpacked).");
             }}
             className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
             title="Download StudyPulse Extension"
           >
             <Zap className="w-5 h-5" />
           </a>
           <button
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className="p-2 bg-slate-50 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
           >
             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[85%] sm:w-[350px] bg-white z-[70] shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 overflow-hidden">
                    {currentUser.profilePic ? (
                      <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{currentUser.email}</p>
                    </div>
                 </div>
                 <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl">
                   <X className="w-6 h-6 text-slate-700" />
                 </button>
              </div>
              <nav className="space-y-2">
                 {navItems.map((group) => (
                   <div key={group.group} className="space-y-1 mb-6">
                     <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{group.group}</p>
                     {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentPage(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                              currentPage === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {item.label}
                          </button>
                        );
                     })}
                   </div>
                 ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-slate-100">
                 <button onClick={handleLogout} className="w-full py-4 text-red-600 font-extrabold rounded-2xl bg-red-50 border border-red-100">
                    Sign Out
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative flex flex-col w-full h-full">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">System Dashboard</span>
            </div>
            <a 
              href="/studypulse-extension.zip"
              download="StudyPulse-Extension.zip"
              onClick={() => {
                alert("Extension downloaded! Extract the ZIP and load it via chrome://extensions (Enable Developer Mode -> Load Unpacked).");
              }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm"
              title="Download the StudyPulse browser extension"
            >
              <Zap className="w-4 h-4" />
              Enable Extension
            </a>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{currentUser.email}</p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                onClick={() => setCurrentPage('profile')}
                className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
              >
                Account
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-black text-red-600 hover:bg-white hover:text-red-700 hover:shadow-sm rounded-xl transition-all"
              >
                Sign Out
              </button>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20 ml-2 overflow-hidden">
                {currentUser.profilePic ? (
                  <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {currentPage === 'dashboard' && <Dashboard timerControls={timerControls} onNavigate={setCurrentPage} />}
              {currentPage === 'planner' && <PlannerPage />}
              {currentPage === 'rooms' && <StudyRoomsPage />}
              {currentPage === 'notebook' && <NotebookPage />}
              {currentPage === 'community' && <Community />}
              {currentPage === 'whiteboard' && <WhiteboardPage />}
              {currentPage === 'extension' && <ExtensionManager />}
              {currentPage === 'focus' && <FocusPage timerControls={timerControls} />}
              {currentPage === 'library' && <LibraryPage />}
              {currentPage === 'profile' && <Profile onLogout={handleLogout} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global ChatBot Trigger / FAB */}
        <ChatBot />

        {/* Context-Aware Footer */}
        <footer className="px-6 md:px-10 py-10 border-t border-slate-200 bg-white/50">
          <div className="max-w-4xl opacity-50">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">© 2026 StudyPulse System</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Verified Intelligent Assistant Online • Secure Local Storage</p>
          </div>
        </footer>
      </main>
      {/* Command Bar Modal */}
      <AnimatePresence>
        {showCommandBar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-start justify-center pt-[15vh] p-4"
            onClick={() => setShowCommandBar(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200"
            >
              <form onSubmit={handleCommandSearch} className="flex items-center p-6 gap-4 border-b border-slate-100">
                <Search className="w-6 h-6 text-indigo-600" />
                <input 
                  autoFocus
                  placeholder="Type a command (ex: 'go to notebook' or 'how do stars form?')"
                  className="flex-1 text-lg font-bold text-slate-800 outline-none placeholder:text-slate-300"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                />
                <button 
                   type="submit"
                   className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-slate-900 transition-all"
                >
                  {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'ASK'}
                </button>
              </form>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="flex flex-col items-center py-20 gap-4">
                     <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center animate-bounce">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                     </div>
                     <p className="text-slate-400 font-bold animate-pulse">Consulting StudyPulse Brain...</p>
                  </div>
                ) : commandResult ? (
                  <div className="prose prose-slate max-w-none">
                     <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8">
                        <p className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Sparkles className="w-4 h-4" /> AI Answer
                        </p>
                        <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line text-lg">
                           {commandResult}
                        </p>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <p className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Popular Commands</p>
                    {[
                      { l: 'Go to Notebook', s: 'notebook' },
                      { l: 'Open Focus Mode', s: 'clock' },
                      { l: 'Find Study Rooms', s: 'users' },
                      { l: 'Create Study Plan', s: 'calendar' }
                    ].map(cmd => (
                      <button 
                        key={cmd.l}
                        onClick={() => { setCommandQuery(cmd.l); }}
                        className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-600/30 hover:bg-indigo-50 transition-all group text-left"
                      >
                         <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-600 transition-colors">
                            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                         </div>
                         <span className="font-bold text-sm text-slate-700">{cmd.l}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   <span>ESC to close</span>
                   <span>ENTER to ask</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                    <Mic className="w-3 h-3" /> Voice Powered
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

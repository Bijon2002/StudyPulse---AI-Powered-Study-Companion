import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Trash2, Search, Brain, FileText, Upload, 
  Sparkles, Lightbulb, MessageSquare, Network, Download, Share2,
  Volume2, Play, Pause, CheckSquare, List, Zap
} from 'lucide-react';
import { getNotes, addNote, deleteNote, saveNotes } from '../utils/storage';
import { detectDuplicateNotes, extractKeywords } from '../utils/analytics';

export default function NotebookPage() {
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: '',
    sources: []
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // chat, notebook, studio
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeatures, setAiFeatures] = useState({
    summary: '',
    faqs: [],
    flashcards: [],
    timeline: [],
    mindMap: [],
    podcast: null,
    quiz: []
  });
  const [quizResults, setQuizResults] = useState({}); // { questionIndex: { selectedIndex, isCorrect } }
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const speechRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const userNotes = getNotes();
    setNotes(userNotes);
    if (userNotes.length > 0 && !selectedNote) {
      // Don't auto-select to keep it clean, but could if desired
    }
  };

  const handleFileUpload = async (e, noteToUpdate = null) => {
    const files = Array.from(e.target.files);
    setIsAnalyzing(true);
    
    let combinedText = '';
    const newSources = [];

    for (const file of files) {
      try {
        const { processUploadedFile } = await import('../utils/fileExtractor');
        const result = await processUploadedFile(file);
        
        if (result.success && result.text) {
          combinedText += (combinedText ? '\n\n' : '') + result.text;
          newSources.push({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            content: result.text
          });
        }
      } catch (error) {
        console.error('File extraction error:', error);
      }
    }

    if (noteToUpdate) {
      const updatedNote = {
        ...noteToUpdate,
        content: noteToUpdate.content + (combinedText ? '\n\n' : '') + combinedText,
        sources: [...(noteToUpdate.sources || []), ...newSources]
      };
      const allNotes = notes.map(n => n.id === noteToUpdate.id ? updatedNote : n);
      saveNotes(allNotes);
      setNotes(allNotes);
      setSelectedNote(updatedNote);
      analyzeNoteAdvanced(updatedNote);
    } else {
      setNewNote(prev => ({
        ...prev,
        content: prev.content + (combinedText ? '\n\n' : '') + combinedText,
        sources: [...(prev.sources || []), ...newSources]
      }));
    }
    
    setIsAnalyzing(false);
  };

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return;

    addNote(newNote);
    setNewNote({ title: '', content: '', subject: '', sources: [] });
    setShowAddNote(false);
    loadNotes();
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      loadNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  // Chat Functionality
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedNote) return;

    const userMsg = { role: 'user', content: chatInput, id: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // AI Response
    const fetchResponse = async () => {
      const { getChatbotResponse } = await import('../utils/aiHelpers');
      const response = await getChatbotResponse(userMsg.content, selectedNote.content);
      
      const aiMsg = { 
        role: 'ai', 
        content: response.response, 
        id: Date.now() + 1,
        suggestions: response.suggestions 
      };
      setChatMessages(prev => [...prev, aiMsg]);
    };
    
    fetchResponse();
  };

  const analyzeNoteAdvanced = (note) => {
    if (!note || !note.content) return;
    setIsAnalyzing(true);
    
    const runAnalysis = async () => {
      const { 
        generateSummary, generateFAQs, generateFlashcards,
        generateQuiz, generateTimeline, generateMindMap, generatePodcastScript
      } = await import('../utils/aiHelpers');

      const results = {};
      results.summary = await generateSummary(note.content);
      results.faqs = await generateFAQs(note.content, note.title);
      results.flashcards = await generateFlashcards(note.content);
      results.quiz = await generateQuiz(note.content, note.title);
      
      // These are currently synchronous or very fast
      results.timeline = generateTimeline(note.content);
      results.mindMap = generateMindMap(note.content);
      results.podcast = generatePodcastScript(note.content, note.title);

      setAiFeatures(results);
      setIsAnalyzing(false);
    };

    runAnalysis();
  };

  const handleUpdateNoteContent = () => {
    if (!selectedNote) return;
    const updatedNote = { ...selectedNote, content: editContent };
    const allNotes = notes.map(n => n.id === selectedNote.id ? updatedNote : n);
    saveNotes(allNotes);
    setNotes(allNotes);
    setSelectedNote(updatedNote);
    setIsEditingContent(false);
    analyzeNoteAdvanced(updatedNote);
  };

  const handleQuizAnswer = (qIndex, oIndex, correctOption) => {
    if (quizResults[qIndex]) return; // Prevent re-answering
    
    const isCorrect = aiFeatures.quiz[qIndex].options[oIndex] === correctOption;
    setQuizResults(prev => ({
       ...prev,
       [qIndex]: { selectedIndex: oIndex, isCorrect }
    }));
  };

  const deleteSource = (sourceId) => {
    if (!selectedNote) return;
    const updatedSources = selectedNote.sources.filter(s => s.id !== sourceId);
    
    // Re-build content from remaining sources (or keep original content if edited manually)
    // For now, let's just update the sources list
    const updatedNote = { ...selectedNote, sources: updatedSources };
    const allNotes = notes.map(n => n.id === selectedNote.id ? updatedNote : n);
    saveNotes(allNotes);
    setNotes(allNotes);
    setSelectedNote(updatedNote);
  };

  const toggleAudioBriefing = () => {
    if (isPlayingBriefing) {
      window.speechSynthesis.cancel();
      setIsPlayingBriefing(false);
      return;
    }

    if (!selectedNote || !selectedNote.content) return;

    const utterance = new SpeechSynthesisUtterance(selectedNote.content);
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsPlayingBriefing(false);
    utterance.onerror = () => setIsPlayingBriefing(false);
    
    speechRef.current = utterance;
    setIsPlayingBriefing(true);
    window.speechSynthesis.speak(utterance);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">AI Notebook</h2>
              <p className="text-gray-600 text-sm">NotebookLM-style AI analysis & collaboration</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddNote(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Notebook
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notebooks..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[70vh]">
        {/* Notebooks Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Notebooks
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    analyzeNoteAdvanced(note);
                    setChatMessages([{
                      role: 'ai',
                      content: `Hi! I'm your assistant for **${note.title}**. Ask me anything about your notes!`,
                      id: 'welcome'
                    }]);
                    setQuizResults({});
                  }}
                  className={`w-full group text-left p-4 rounded-2xl transition-all border-2 relative ${
                    selectedNote?.id === note.id 
                      ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <h4 className={`font-black text-sm mb-1 truncate ${selectedNote?.id === note.id ? 'text-white' : 'text-slate-900'}`}>
                    {note.title}
                  </h4>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedNote?.id === note.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {note.subject || 'No Subject'} • {note.sources?.length || 0} Sources
                  </p>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                      selectedNote?.id === note.id ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))}
              
              <button 
                onClick={() => setShowAddNote(true)}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest">Create New</span>
              </button>
            </div>
          </div>
          
          {selectedNote && (
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-600 pl-3">Sources</h3>
                <label className="cursor-pointer p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                  <Upload className="w-4 h-4" />
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => handleFileUpload(e, selectedNote)} 
                  />
                </label>
              </div>
              
              <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {selectedNote.sources?.map(source => (
                  <div key={source.id} className="group flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{source.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{(source.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => deleteSource(source.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!selectedNote.sources || selectedNote.sources.length === 0) && (
                  <div className="text-center py-6 text-slate-400 italic text-xs">No files uploaded</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3 flex flex-col min-h-[600px] lg:h-[70vh]">
          {selectedNote ? (
            <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 flex-1 flex flex-col overflow-hidden">
              {/* Toolbar / Header */}
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedNote.title}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedNote.subject || 'General Studies'}</p>
                  </div>
                </div>

                <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                  {[
                    { id: 'chat', label: 'Ask AI', icon: MessageSquare },
                    { id: 'notebook', label: 'Notebook', icon: BookOpen },
                    { id: 'google-ai', label: 'Google NotebookLM', icon: Sparkles },
                    { id: 'studio', label: 'Studio', icon: Zap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                   <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                     <Download className="w-5 h-5" />
                   </button>
                   <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                     <Share2 className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex-1 overflow-hidden relative">
                {isAnalyzing ? (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Analyzing Sources</h3>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">AI Intelligence Engine Active</p>
                  </div>
                ) : null}

                <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                  {activeTab === 'chat' && (
                    <div className="max-w-4xl mx-auto flex flex-col h-full">
                       <div className="flex-1 space-y-8 pb-32">
                          {chatMessages.map((msg) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={msg.id} 
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] p-6 rounded-[32px] shadow-sm relative ${
                                msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                              }`}>
                                <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-slate-100 text-slate-400">
                                  {msg.role === 'user' ? 'Your Question' : 'StudyPulse AI'}
                                </div>
                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                {msg.suggestions && (
                                  <div className="flex flex-wrap gap-2 mt-6">
                                    {msg.suggestions.map(s => (
                                      <button 
                                        key={s} 
                                        onClick={() => { setChatInput(s); handleChatSubmit({ preventDefault: () => {} }); }}
                                        className="px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-[10px] font-black hover:bg-white/40 transition-all"
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                       </div>
                       
                       <div className="sticky bottom-0 bg-white pt-4">
                          <form onSubmit={handleChatSubmit} className="relative group">
                            <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity" />
                            <input 
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Ask a question about your sources..."
                              className="w-full pl-8 pr-32 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-slate-800 font-bold focus:outline-none focus:border-blue-600 transition-all shadow-xl relative z-10"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95">
                              Ask AI
                            </button>
                          </form>
                       </div>
                    </div>
                  )}

                  {activeTab === 'notebook' && (
                    <div className="max-w-5xl mx-auto space-y-10">
                       <div className="flex items-center justify-between">
                         <h3 className="text-3xl font-black text-slate-900 tracking-tight">Main Notes</h3>
                         <button 
                           onClick={() => {
                             if (isEditingContent) handleUpdateNoteContent();
                             else { setEditContent(selectedNote.content); setIsEditingContent(true); }
                           }}
                           className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${
                             isEditingContent ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10'
                           }`}
                         >
                           {isEditingContent ? 'Save Changes' : 'Edit Content'}
                         </button>
                       </div>
                       
                       <div className="bg-slate-50 border border-slate-200 rounded-[40px] p-10 min-h-[400px]">
                         {isEditingContent ? (
                           <textarea 
                             className="w-full h-[300px] bg-transparent resize-none border-none focus:outline-none text-slate-800 font-medium leading-loose"
                             value={editContent}
                             onChange={(e) => setEditContent(e.target.value)}
                             autoFocus
                           />
                         ) : (
                           <p className="text-slate-800 font-medium leading-loose whitespace-pre-wrap">{selectedNote.content}</p>
                         )}
                       </div>
                    </div>
                  )}

                  {activeTab === 'studio' && (
                    <div className="max-w-6xl mx-auto space-y-8">
                       <div className="grid md:grid-cols-2 gap-8">
                          {/* Audio Briefing */}
                          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                             <h4 className="text-2xl font-black mb-4 flex items-center gap-3">
                               <Volume2 className="w-8 h-8 text-indigo-300" />
                               Audio Briefing
                             </h4>
                             <p className="text-indigo-100 font-medium leading-relaxed mb-8 opacity-80">Transform your sources into a conversational podcast script for on-the-go learning.</p>
                             <div className="flex items-center justify-between bg-white/10 p-4 rounded-3xl border border-white/20">
                                <div className="flex items-center gap-3">
                                   <button 
                                     onClick={toggleAudioBriefing}
                                     className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform ${isPlayingBriefing ? 'bg-red-500 text-white' : 'bg-white text-indigo-900'}`}
                                   >
                                      {isPlayingBriefing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                                   </button>
                                   <span className="text-sm font-black tracking-widest uppercase">{isPlayingBriefing ? 'Playing...' : 'Listen Now'}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-tighter">{aiFeatures.podcast?.duration || '10 min read'}</span>
                             </div>
                          </div>

                          {/* Insight Engine */}
                          <div className="bg-white border-4 border-slate-50 rounded-[40px] p-10 shadow-xl">
                             <h4 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                               <Brain className="w-8 h-8 text-blue-600" />
                               Insight Engine
                             </h4>
                             <div className="space-y-4">
                                {aiFeatures.faqs.slice(0, 3).map((faq, i) => (
                                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-help group">
                                     <p className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">{faq.q}</p>
                                     <p className="text-xs text-slate-400 font-medium line-clamp-1">{faq.a}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       {/* Flashcard Studio */}
                       <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl">
                          <h4 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4">
                            <CheckSquare className="w-8 h-8 text-emerald-500" />
                            Flashcard Studio
                             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4 py-1.5 bg-slate-50 rounded-full">{aiFeatures.flashcards.length} Cards</span>
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {aiFeatures.flashcards.map((card, i) => {
                                const [isFlipped, setIsFlipped] = useState(false);
                                return (
                                  <motion.div 
                                    key={i} 
                                    whileHover={{ y: -5 }}
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className={`group h-48 rounded-3xl p-6 border-2 transition-all relative cursor-pointer ${isFlipped ? 'bg-blue-600 border-blue-600 shadow-blue-500/20' : 'bg-slate-50 border-transparent hover:border-blue-500'}`}
                                  >
                                    {!isFlipped ? (
                                      <p className="font-black text-slate-900 text-sm leading-relaxed mb-4">{card.front}</p>
                                    ) : (
                                      <p className="font-bold text-white text-sm leading-relaxed">{card.back}</p>
                                    )}
                                    <div className={`absolute bottom-6 left-6 right-6 pt-4 border-t ${isFlipped ? 'border-white/20' : 'border-slate-200'}`}>
                                       <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isFlipped ? 'text-blue-100' : 'text-blue-600'}`}>
                                         {isFlipped ? 'Question' : 'Answer'}
                                       </p>
                                       <p className={`text-[10px] font-bold line-clamp-2 ${isFlipped ? 'text-white/80' : 'text-slate-400'}`}>
                                         {isFlipped ? card.front : 'Click to flip and reveal...'}
                                       </p>
                                    </div>
                                  </motion.div>
                                );
                              })}
                           </div>
                        </div>

                       {/* Quiz Section */}
                       <div className="bg-amber-50 rounded-[40px] p-10 border border-amber-100 shadow-md">
                          <h4 className="text-3xl font-black text-amber-900 mb-8 flex items-center gap-4">
                            <Zap className="w-8 h-8 text-amber-500" />
                            Knowledge Check
                            {Object.keys(quizResults).length > 0 && (
                              <button 
                                onClick={() => setQuizResults({})}
                                className="ml-auto text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors"
                              >
                                Reset Quiz
                              </button>
                            )}
                          </h4>
                          <div className="space-y-6">
                             {aiFeatures.quiz.map((q, i) => (
                               <div key={i} className="bg-white rounded-[32px] p-8 shadow-sm">
                                  <p className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                     <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-sm">Q</span>
                                     {q.question}
                                  </p>
                                  <div className="grid md:grid-cols-2 gap-3">
                                     {q.options.map((opt, j) => {
                                       const result = quizResults[i];
                                       const isSelected = result?.selectedIndex === j;
                                       const isThisCorrect = opt === q.correct;
                                       
                                       let btnClass = "bg-slate-50 border-2 border-transparent hover:border-amber-500 hover:bg-amber-50 text-slate-700";
                                       if (result) {
                                          if (isThisCorrect) btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700";
                                          else if (isSelected) btnClass = "bg-red-50 border-red-500 text-red-700";
                                          else btnClass = "bg-slate-50 border-transparent opacity-50";
                                       }

                                       return (
                                         <button 
                                           key={j} 
                                           disabled={!!result}
                                           onClick={() => handleQuizAnswer(i, j, q.correct)}
                                           className={`w-full text-left p-5 rounded-2xl transition-all font-bold ${btnClass}`}
                                         >
                                            {opt}
                                         </button>
                                       );
                                     })}
                                  </div>
                                  
                                  {quizResults[i] && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className={`mt-6 p-6 rounded-2xl ${quizResults[i].isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}
                                    >
                                       <p className="font-black text-xs uppercase tracking-widest mb-2">
                                         {quizResults[i].isCorrect ? '✅ Well done!' : '❌ Not quite'}
                                       </p>
                                       <p className="text-sm font-medium">{q.explanation}</p>
                                    </motion.div>
                                  )}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'google-ai' && (
                    <div className="h-full flex flex-col gap-8">
                       {/* Header Section */}
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center border border-slate-100">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                   <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                                </svg>
                             </div>
                             <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Google Intelligence</h3>
                                <p className="text-slate-500 font-medium">Research powered by Google's ecosystem</p>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <a 
                                href="https://notebooklm.google.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-8 py-3.5 bg-blue-600 text-white rounded-[20px] font-black text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                             >
                                <Sparkles className="w-4 h-4" />
                                Launch NotebookLM
                             </a>
                             <a 
                                href="https://gemini.google.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-8 py-3.5 bg-slate-100 text-slate-900 rounded-[20px] font-black text-xs hover:bg-slate-200 transition active:scale-95"
                             >
                                Open Gemini
                             </a>
                          </div>
                       </div>

                       {/* Feature Cards */}
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-10 rounded-[40px] border border-blue-100 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                             <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">NotebookLM Studio</h4>
                             <p className="text-slate-600 font-medium leading-relaxed mb-8">
                                Use Google's specialized research tool to upload up to 50 sources and generate audio briefings, study guides, and FAQ sets.
                             </p>
                             <ul className="space-y-3 mb-10">
                                {['AI Podcasts & Summaries', 'Grounded QA', 'Document Visualization'].map(item => (
                                   <li key={item} className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                         <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                      </div>
                                      {item}
                                   </li>
                                ))}
                             </ul>
                             <a 
                                href="https://notebooklm.google.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
                             >
                                Enter Studio <span className="text-xl">→</span>
                             </a>
                          </div>

                          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                             <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Gemini Integration</h4>
                             <p className="text-slate-600 font-medium leading-relaxed mb-8">
                                Connect with Google's most capable AI models (Pro & Ultra) for multi-modal reasoning, coding, and logical tasks.
                             </p>
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Capabilities</p>
                                <div className="flex flex-wrap gap-2">
                                   {['Advanced Coding', 'Image Analysis', '1M+ Context Window'].map(tag => (
                                      <span key={tag} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">{tag}</span>
                                   ))}
                                </div>
                             </div>
                             <a 
                                href="https://gemini.google.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
                             >
                                Open Gemini <span className="text-xl">→</span>
                             </a>
                          </div>
                       </div>

                       {/* Interactive Note */}
                       <div className="mt-auto bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                          <div className="relative z-10">
                             <h5 className="text-xl font-black mb-4 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                                Seamless Research Workflow
                             </h5>
                             <p className="text-slate-300 font-medium leading-relaxed max-w-2xl mb-0">
                                For security reasons, Google does not allow their tools to be embedded inside other apps. 
                                <br/><br/>
                                <span className="text-white font-bold">Suggested Workflow:</span> Open your notebook here, then launch NotebookLM in a separate window. You can drag-and-drop text or insights between StudyPulse and Google AI for the ultimate research experience.
                             </p>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8">
                <Sparkles className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready to deep dive?</h3>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed mb-10">
                Select a notebook or create a new one to begin your AI-powered study session. Upload PDFs, images, or paste text to get started.
              </p>
              <button 
                onClick={() => setShowAddNote(true)}
                className="bg-blue-600 text-white px-10 py-4 rounded-[28px] font-black text-lg shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all active:scale-95"
              >
                Create First Notebook
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddNote(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Notebook</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Notebook title..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={newNote.subject}
                    onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Upload Sources (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                      Click to upload PDFs, Images, Docs, or Text files
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Supports PDF, Images (PNG/JPG), DOC, DOCX, TXT</p>
                    <p className="text-xs text-blue-600 mt-1">✨ OCR enabled for scanned PDFs and images!</p>
                  </div>
                  {newNote.sources?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Selected Sources</p>
                      {newNote.sources.map((file, i) => (
                        <div key={i} className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-900 text-sm font-bold mb-2 uppercase tracking-widest">Initial Content (Optional)</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write or paste your initial material here..."
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium leading-relaxed"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddNote}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Create Notebook
                  </button>
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

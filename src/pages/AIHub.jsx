import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Brain, FileText, CheckSquare, List, MessageSquare, Network, Lightbulb, PlayCircle, Search } from 'lucide-react';
import { getNotes } from '../utils/storage';

export default function AIHub() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const aiTools = [
    { id: 'summary', name: 'Smart Summary', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Distill long documents into concise key points.' },
    { id: 'quiz', name: 'Auto-Quiz', icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Generate multiple-choice practice questions.' },
    { id: 'flashcards', name: 'Concept Cards', icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Extract key definitions and create study cards.' },
    { id: 'mindmap', name: 'Knowledge Galaxy', icon: Network, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Visualize a 3D-style network of all your study concepts.' },
    { id: 'podcast', name: 'Audio Script', icon: PlayCircle, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Transform your notes into a natural dialogue script.' },
    { id: 'voice', name: 'Voice Notes', icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'Dictate notes and have AI organize them instantly.' },
    { id: 'chat', name: 'Study Chatbot', icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-50', desc: 'Ask questions directly about your study material.' }
  ];

  const handleToolAction = async (toolId) => {
    if (!selectedNote) return;
    setIsProcessing(true);
    setActiveTool(toolId);
    setResult(null);

    // Simulate AI processing
    if (toolId === 'voice') {
      startVoiceCapture();
      return;
    }

    setTimeout(async () => {
      const { 
        generateSummary, 
        generateFAQs, 
        generateFlashcards, 
        generateQuiz, 
        generateMindMap, 
        generatePodcastScript 
      } = await import('../utils/aiHelpers');

      let processResult;
      switch(toolId) {
        case 'summary': processResult = await generateSummary(selectedNote.content); break;
        case 'quiz': processResult = await generateQuiz(selectedNote.content, selectedNote.title); break;
        case 'flashcards': processResult = await generateFlashcards(selectedNote.content); break;
        case 'mindmap': 
          const keywords = await import('../utils/analytics').then(m => m.extractKeywords(selectedNote.content));
          processResult = {
            type: 'galaxy',
            center: selectedNote.title,
            nodes: keywords.map(k => ({ id: k.word, size: k.count * 10, connections: [selectedNote.title] }))
          };
          break;
        case 'podcast': processResult = generatePodcastScript(selectedNote.content, selectedNote.title); break;
        default: processResult = "AI tool processing completed.";
      }
      
      setResult(processResult);
      setIsProcessing(false);
    }, 1500);
  };

  const startVoiceCapture = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    setIsRecording(true);
    setResult('voice_active');
    setTranscript('');
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };
    
    recognition.onerror = () => stopVoiceCapture();
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoiceCapture = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsProcessing(true);
    
    // Process final transcript with AI
    const { generateSummary } = await import('../utils/aiHelpers');
    const summary = await generateSummary(transcript || "No audio captured.");
    setResult(`🎙️ VOICE NOTE SUMMARY:\n\n${summary}`);
    setIsProcessing(false);
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-800 rounded-[40px] p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/20">
            <Zap className="w-8 h-8 text-yellow-300" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">AI Study Hub</h2>
          <p className="text-indigo-100 text-lg font-medium leading-relaxed">
            Unlock the power of your study material. Select a notebook and use our premium AI tools to transform information into knowledge.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Navigation / Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-600" />
              1. Select a Source
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Find a notebook..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${
                    selectedNote?.id === note.id 
                    ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                    : 'bg-gray-50 border-transparent hover:bg-white hover:border-indigo-200'
                  }`}
                >
                  <p className={`font-bold text-sm truncate ${selectedNote?.id === note.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {note.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                    {note.subject || 'No subject'} • {note.content.split(' ').length} words
                  </p>
                </button>
              ))}
              {filteredNotes.length === 0 && (
                <div className="text-center py-10 text-gray-400 italic text-sm">No notebooks found</div>
              )}
            </div>
          </div>
        </div>

        {/* Tools and Results */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-50">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              2. Choose an AI Tool
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {aiTools.map(tool => (
                <button
                  key={tool.id}
                  disabled={!selectedNote}
                  onClick={() => handleToolAction(tool.id)}
                  className={`p-6 rounded-[28px] border-2 transition-all flex items-start gap-4 text-left group ${
                    !selectedNote ? 'opacity-50 grayscale cursor-not-allowed' : 
                    activeTool === tool.id ? 'bg-indigo-900 border-indigo-900 text-white' : 
                    'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-xl'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${activeTool === tool.id ? 'bg-white/20' : tool.bg} group-hover:scale-110 transition-transform`}>
                    <tool.icon className={`w-6 h-6 ${activeTool === tool.id ? 'text-white' : tool.color}`} />
                  </div>
                  <div>
                    <h4 className={`font-bold mb-1 ${activeTool === tool.id ? 'text-white' : 'text-gray-900'}`}>{tool.name}</h4>
                    <p className={`text-xs leading-relaxed ${activeTool === tool.id ? 'text-indigo-200' : 'text-gray-500'}`}>{tool.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(isProcessing || result) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-indigo-50/50 backdrop-blur-md rounded-[40px] p-10 border border-indigo-100 shadow-inner min-h-[300px] flex flex-col items-center justify-center text-center"
              >
                {isProcessing ? (
                  <>
                    <div className="relative mb-8">
                      <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-indigo-900 mb-2">AI is Thinking...</h3>
                    <p className="text-indigo-600 font-medium">Crunching your data for the best results</p>
                  </>
                ) : (
                  <div className="w-full text-left">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-100/50">
                      <h3 className="text-2xl font-black text-indigo-900 flex items-center gap-3">
                        <Sparkles className="w-7 h-7 text-indigo-600" />
                        AI Extraction Result
                      </h3>
                      <button onClick={() => setResult(null)} className="text-indigo-400 hover:text-indigo-600 font-bold text-sm">Clear Result</button>
                    </div>
                    
                    <div className="bg-white/70 rounded-3xl p-8 max-h-[500px] overflow-y-auto custom-scrollbar border border-white shadow-sm">
                      {typeof result === 'string' ? (
                        <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">{result}</p>
                      ) : Array.isArray(result) ? (
                        <div className="space-y-6">
                          {result.map((item, id) => (
                            <div key={id} className="p-6 bg-white rounded-2xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                              {item.q ? (
                                <>
                                  <p className="font-black text-indigo-900 mb-3 text-lg flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">Q</span>
                                    {item.q}
                                  </p>
                                  <p className="text-gray-600 pl-10 font-medium leading-relaxed">{item.a}</p>
                                </>
                              ) : item.question ? (
                                <>
                                  <p className="font-black text-indigo-900 mb-4 text-lg">Q: {item.question}</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                                    {item.options.map((opt, oi) => (
                                      <div key={oi} className={`p-4 rounded-xl border font-bold text-sm ${opt === item.correct ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : item.front ? (
                                <div className="flex gap-6 items-center">
                                  <div className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl font-black text-center shadow-lg">
                                    {item.front}
                                  </div>
                                  <div className="text-indigo-400 font-black">→</div>
                                  <div className="flex-1 text-gray-700 font-bold p-6 bg-white border-2 border-dashed border-indigo-200 rounded-2xl text-center">
                                    {item.back}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-50 rounded-xl text-xs font-mono">
                                  {JSON.stringify(item)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : result.type === 'galaxy' ? (
                        <div className="relative w-full h-[400px] bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent animate-pulse" />
                          <div className="relative z-10 w-full h-full p-10">
                             {/* Central Node */}
                             <motion.div 
                               animate={{ scale: [1, 1.1, 1] }} 
                               transition={{ duration: 4, repeat: Infinity }}
                               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-center p-4 shadow-[0_0_50px_rgba(37,99,235,0.5)] z-20"
                             >
                               {result.center}
                             </motion.div>
                             
                             {/* Orbiting Nodes */}
                             {result.nodes.map((node, ni) => {
                               const angle = (ni / result.nodes.length) * 2 * Math.PI;
                               const x = Math.cos(angle) * 140;
                               const y = Math.sin(angle) * 140;
                               return (
                                 <React.Fragment key={ni}>
                                   <div 
                                     className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-blue-400/30 origin-top-left"
                                     style={{ 
                                       width: '140px', 
                                       transform: `rotate(${angle}rad)`,
                                       zIndex: 10
                                     }}
                                   />
                                   <motion.div
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1, x, y }}
                                      transition={{ delay: ni * 0.1 }}
                                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-slate-800 border border-blue-500/50 rounded-xl text-blue-300 font-bold text-xs shadow-lg z-20 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors"
                                   >
                                      {node.id}
                                   </motion.div>
                                 </React.Fragment>
                               );
                             })}
                             
                             <div className="absolute bottom-6 left-6 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                               Knowledge Galaxy • Interactive Map
                             </div>
                          </div>
                        </div>
                      ) : result === 'voice_active' ? (
                        <div className="w-full flex flex-col items-center py-10">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-500/50 mb-8"
                          >
                            <Sparkles className="w-10 h-10 animate-pulse" />
                          </motion.div>
                          <h3 className="text-3xl font-black text-slate-900 mb-2">Listening...</h3>
                          <p className="text-slate-500 font-medium mb-10 max-w-sm text-center">Speak your notes clearly. StudyPulse AI is transcribing in real-time.</p>
                          
                          <div className="w-full p-8 bg-white rounded-3xl border-2 border-dashed border-red-200 min-h-[150px] text-left">
                            <p className="text-slate-800 font-bold leading-relaxed">{transcript || 'Start speaking to see transcription...'}</p>
                          </div>
                          
                          <button 
                            onClick={stopVoiceCapture}
                            className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-xl"
                          >
                            Stop & Analyze
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-xl font-black text-indigo-900">{result.title}</h4>
                          <p className="text-indigo-600 font-black text-sm uppercase">{result.duration}</p>
                          <p className="text-gray-700 font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-6 py-2">"{result.description}"</p>
                          <div className="mt-8 bg-indigo-900 text-white p-6 rounded-3xl">
                            <h5 className="font-extrabold mb-4 flex items-center gap-2">
                              <PlayCircle className="w-5 h-5 text-indigo-300" />
                              Generated Script Preview
                            </h5>
                            <p className="text-sm text-indigo-100 font-medium leading-loose opacity-80">{result.script}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

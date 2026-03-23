import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Mic, MicOff, X, Minimize2 } from 'lucide-react';
import { getChatbotResponse, speak, startListening, solveStudyDoubt } from '../utils/chatbotAPI';
import { getStats } from '../utils/storage';
import { getUser } from '../utils/storage';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hello! I'm Pulse AI, your advanced study companion.\n\nI can help you break down complex topics, solve tough problems, or even map out your career goals. \n\n**Try asking me one of these:**",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showDoubtSolver, setShowDoubtSolver] = useState(false);
  const [doubtData, setDoubtData] = useState({ question: '', subject: '' });
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Get bot response
    const fetchResponse = async () => {
      const user = getUser();
      const stats = getStats();
      const userContext = {
        userName: user?.name || 'Student',
        level: stats?.level || 1,
        xp: stats?.xp || 0,
        totalHours: stats?.totalHours || 0,
        currentStreak: stats?.currentStreak || 0,
        totalSessions: stats?.totalSessions || 0
      };

      const response = await getChatbotResponse(input, userContext);

      const botMessage = {
        id: Date.now() + 1,
        text: response.response || response,
        suggestions: response.suggestions,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    };

    fetchResponse();
    setInput('');
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current = startListening(({ transcript, error }) => {
        if (transcript) {
          setInput(transcript);
          setIsListening(false);
        }
        if (error) {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      });
    }
  };

  const handleSolveDoubt = () => {
    if (!doubtData.question.trim()) return;

    const response = solveStudyDoubt(doubtData.question, doubtData.subject);

    const botMessage = {
      id: Date.now(),
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setShowDoubtSolver(false);
    setDoubtData({ question: '', subject: '' });
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-sky-500 text-white p-4 rounded-full shadow-2xl z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed ${
        isMinimized 
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80' 
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-96'
      } bg-white rounded-2xl shadow-2xl border border-blue-100 z-50 overflow-hidden`}
      style={{ 
        height: isMinimized ? 'auto' : 'clamp(400px, 80vh, 600px)' 
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">Study Assistant</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => { setInput(s); handleSend(); }}
                          className="text-[10px] bg-white/50 hover:bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions / Sample Questions Grid */}
          <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Try asking...</p>
             <div className="grid grid-cols-2 gap-2">
                {[
                  { q: 'Explain a complex concept', i: '🧠' },
                  { q: "How's my study progress?", i: '📊' },
                  { q: 'Give me a motivation boost', i: '🔥' },
                  { q: 'Help me solve a doubt', i: '📚' },
                  { q: 'Create a study technique', i: '💡' },
                  { q: 'AI Career Guidance', i: '🚀' }
                ].map(item => (
                  <button
                    key={item.q}
                    onClick={() => { setInput(item.q); handleSend(); }}
                    className="flex flex-col items-start gap-1 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
                  >
                     <span className="text-sm">{item.i}</span>
                     <span className="text-[10px] font-bold text-slate-700 group-hover:text-blue-700 leading-tight">{item.q}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Doubt Solver */}
          <AnimatePresence>
            {showDoubtSolver && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-2 space-y-2"
              >
                <input
                  type="text"
                  placeholder="Enter your question..."
                  value={doubtData.question}
                  onChange={(e) => setDoubtData({ ...doubtData, question: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Subject (optional)"
                  value={doubtData.subject}
                  onChange={(e) => setDoubtData({ ...doubtData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSolveDoubt}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm py-2 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Get Help
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-2 rounded-lg hover:shadow-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

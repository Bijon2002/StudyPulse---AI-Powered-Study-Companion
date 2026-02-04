import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mic, MicOff, Send, X, Volume2, VolumeX } from 'lucide-react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI study coach. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      let responseText = "I'm not sure about that yet, but I'm learning!";
      const lowerText = text.toLowerCase();

      if (lowerText.includes('schedule') || lowerText.includes('plan')) {
        responseText = "I can help you plan! Check out the Planner tab to set up your exam schedule.";
      } else if (lowerText.includes('tired') || lowerText.includes('break')) {
        responseText = "It sounds like you need a break. Try the 5-minute breathing exercise or take a short walk.";
      } else if (lowerText.includes('motivate') || lowerText.includes('inspiration')) {
        responseText = "Success is the sum of small efforts, repeated day in and day out. You've got this!";
      } else if (lowerText.includes('summary') || lowerText.includes('notes')) {
        responseText = "You can use the Notebook feature to summarize your notes automatically.";
      } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
        responseText = "Hello there! Ready to crush some study goals today?";
      }

      const botMsg = { id: Date.now() + 1, text: responseText, isBot: true };
      setMessages(prev => [...prev, botMsg]);
      speak(responseText);
    }, 1000);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-50 transition-all transform hover:scale-110"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col h-[500px] animate-in slide-in-from-bottom-10 fade-in">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-indigo-600 rounded-t-2xl text-white">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare size={18} /> AI Coach
            </h3>
            <div className="flex gap-2">
              {isSpeaking && <Volume2 size={18} className="animate-pulse" />}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.isBot
                      ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, LogIn, Clock, Play, Pause, FileText, Upload, Trash2, X, 
  MessageSquare, Send, Brain, CheckSquare, Lightbulb, Target, Palette
} from 'lucide-react';
import { getUser } from '../utils/storage';
import { processUploadedFile } from '../utils/fileExtractor';
import { generateQuiz, generateFlashcards, generateSummary } from '../utils/aiHelpers';
import Whiteboard from '../components/Whiteboard';

export default function StudyRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomTimer, setRoomTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [roomDocuments, setRoomDocuments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('documents'); // documents, chat, quiz, whiteboard
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && selectedRoom) {
      interval = setInterval(() => {
        setRoomTimer(prev => prev + 1);
        const roomData = JSON.parse(localStorage.getItem(`room_${selectedRoom.code}`) || '{}');
        roomData.timerSeconds = roomTimer + 1;
        roomData.isRunning = true;
        localStorage.setItem(`room_${selectedRoom.code}`, JSON.stringify(roomData));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, selectedRoom, roomTimer]);

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      const interval = setInterval(loadMessages, 2000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const loadRooms = () => {
    const savedRooms = JSON.parse(localStorage.getItem('studypulse_rooms') || '[]');
    setRooms(savedRooms);
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    if (!newRoomName.trim()) return;

    const user = getUser();
    const code = generateRoomCode();
    
    const room = {
      id: Date.now(),
      name: newRoomName,
      code,
      host: user?.name || 'Anonymous',
      participants: [user?.name || 'Anonymous'],
      createdAt: new Date().toISOString(),
      documents: [],
      timerSeconds: 0,
      isRunning: false
    };

    const updatedRooms = [...rooms, room];
    setRooms(updatedRooms);
    localStorage.setItem('studypulse_rooms', JSON.stringify(updatedRooms));
    localStorage.setItem(`room_${code}`, JSON.stringify(room));
    localStorage.setItem(`room_${code}_messages`, JSON.stringify([]));
    
    setNewRoomName('');
    setShowCreateRoom(false);
    setSelectedRoom(room);
    loadRoomDocuments(code);
  };

  const joinRoom = () => {
    if (!joinCode.trim()) return;

    const roomData = JSON.parse(localStorage.getItem(`room_${joinCode.toUpperCase()}`) || 'null');
    
    if (roomData) {
      const user = getUser();
      const userName = user?.name || 'Anonymous';
      
      if (!roomData.participants.includes(userName)) {
        roomData.participants.push(userName);
        localStorage.setItem(`room_${joinCode.toUpperCase()}`, JSON.stringify(roomData));
      }
      
      setSelectedRoom(roomData);
      setRoomTimer(roomData.timerSeconds || 0);
      setIsTimerRunning(roomData.isRunning || false);
      loadRoomDocuments(roomData.code);
      setJoinCode('');
      setShowJoinRoom(false);
    } else {
      alert('Room not found! Please check the code.');
    }
  };

  const loadRoomDocuments = (roomCode) => {
    const docs = JSON.parse(localStorage.getItem(`room_${roomCode}_docs`) || '[]');
    setRoomDocuments(docs);
    
    // Generate quiz and flashcards from all documents
    if (docs.length > 0) {
      const allContent = docs.map(d => d.content).join('\n\n');
      if (allContent.length > 50) {
        const runAI = async () => {
          const quiz = await generateQuiz(allContent, 'Study Material');
          const cards = await generateFlashcards(allContent);
          const sum = await generateSummary(allContent);
          setQuizQuestions(quiz);
          setFlashcards(cards);
          setSummary(sum);
        };
        runAI();
      }
    }
  };

  const loadMessages = () => {
    if (!selectedRoom) return;
    const msgs = JSON.parse(localStorage.getItem(`room_${selectedRoom.code}_messages`) || '[]');
    setMessages(msgs);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const user = getUser();
    const message = {
      id: Date.now(),
      sender: user?.name || 'Anonymous',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`room_${selectedRoom.code}_messages`, JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  const handleFileUpload = async (e) => {
    if (!selectedRoom) return;
    
    const files = Array.from(e.target.files);
    setUploadingFile(true);
    
    for (const file of files) {
      try {
        const result = await processUploadedFile(file);
        
        const document = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedBy: getUser()?.name || 'Anonymous',
          uploadedAt: new Date().toISOString(),
          content: result.success ? result.text : '',
          wordCount: result.success ? result.text.split(' ').length : 0
        };
        
        const updatedDocs = [...roomDocuments, document];
        setRoomDocuments(updatedDocs);
        localStorage.setItem(`room_${selectedRoom.code}_docs`, JSON.stringify(updatedDocs));
        
        // Regenerate quiz and flashcards
        const allContent = updatedDocs.map(d => d.content).join('\n\n');
        if (allContent.length > 50) {
          const quiz = await generateQuiz(allContent, 'Study Material');
          const cards = await generateFlashcards(allContent);
          const sum = await generateSummary(allContent);
          setQuizQuestions(quiz);
          setFlashcards(cards);
          setSummary(sum);
        }
        
        if (result.success) {
          alert(`✅ ${file.name} uploaded! Extracted ${document.wordCount} words.`);
        } else {
          alert(`⚠️ ${file.name} uploaded but text extraction failed.`);
        }
      } catch (error) {
        alert(`❌ Failed to upload ${file.name}`);
      }
    }
    
    setUploadingFile(false);
  };

  const deleteDocument = (docId) => {
    if (confirm('Delete this document?')) {
      const updatedDocs = roomDocuments.filter(d => d.id !== docId);
      setRoomDocuments(updatedDocs);
      localStorage.setItem(`room_${selectedRoom.code}_docs`, JSON.stringify(updatedDocs));
      
      // Regenerate quiz
      const allContent = updatedDocs.map(d => d.content).join('\n\n');
      if (allContent.length > 50) {
        const runAI = async () => {
          const quiz = await generateQuiz(allContent, 'Study Material');
          const cards = await generateFlashcards(allContent);
          const sum = await generateSummary(allContent);
          setQuizQuestions(quiz);
          setFlashcards(cards);
          setSummary(sum);
        };
        runAI();
      } else {
        setQuizQuestions([]);
        setFlashcards([]);
        setSummary('');
      }
    }
  };

  const toggleTimer = () => {
    const newState = !isTimerRunning;
    setIsTimerRunning(newState);
    
    if (selectedRoom) {
      const roomData = JSON.parse(localStorage.getItem(`room_${selectedRoom.code}`) || '{}');
      roomData.isRunning = newState;
      roomData.timerSeconds = roomTimer;
      localStorage.setItem(`room_${selectedRoom.code}`, JSON.stringify(roomData));
    }
  };

  const resetTimer = () => {
    setRoomTimer(0);
    setIsTimerRunning(false);
    
    if (selectedRoom) {
      const roomData = JSON.parse(localStorage.getItem(`room_${selectedRoom.code}`) || '{}');
      roomData.timerSeconds = 0;
      roomData.isRunning = false;
      localStorage.setItem(`room_${selectedRoom.code}`, JSON.stringify(roomData));
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const leaveRoom = () => {
    setSelectedRoom(null);
    setRoomTimer(0);
    setIsTimerRunning(false);
    setRoomDocuments([]);
    setMessages([]);
    setQuizQuestions([]);
    setFlashcards([]);
    setSummary('');
  };

  if (selectedRoom) {
    return (
      <div className="space-y-6">
        {/* Room Header */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{selectedRoom.name}</h2>
              <p className="text-gray-600">Room Code: <span className="font-mono font-bold text-blue-600">{selectedRoom.code}</span></p>
            </div>
            <button
              onClick={leaveRoom}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-200 transition"
            >
              <X className="w-5 h-5" />
              Leave Room
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              {selectedRoom.participants.length} participant{selectedRoom.participants.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-1">
              {selectedRoom.participants.map((p, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Timer & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shared Timer */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl p-6 shadow-lg border border-blue-100">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Shared Study Timer
                </h3>
                <p className="text-xs text-gray-600">Everyone sees the same timer</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-blue-600 font-mono">
                  {formatTime(roomTimer)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {isTimerRunning ? '🟢 Running' : '⏸️ Paused'}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                    isTimerRunning
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-lg border border-blue-100">
              <div className="border-b border-gray-200 px-6 pt-4">
                <div className="flex gap-4">
                  {[
                    { id: 'documents', label: 'Documents', icon: FileText },
                    { id: 'chat', label: 'Chat', icon: MessageSquare },
                    { id: 'whiteboard', label: 'Whiteboard', icon: Palette },
                    { id: 'quiz', label: 'Quiz & Study', icon: Brain }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Shared Documents ({roomDocuments.length})</h3>
                      <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition cursor-pointer text-sm">
                        <Upload className="w-4 h-4" />
                        Upload
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                          disabled={uploadingFile}
                        />
                      </label>
                    </div>

                    {uploadingFile && (
                      <div className="text-center py-4">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Processing file...</p>
                      </div>
                    )}

                    {roomDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {roomDocuments.map((doc) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                  <span>📤 {doc.uploadedBy}</span>
                                  <span>📝 {doc.wordCount} words</span>
                                  <span>📅 {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                {doc.content && (
                                  <p className="text-sm text-gray-700 line-clamp-2 bg-white rounded p-2 border border-gray-100">
                                    {doc.content.substring(0, 150)}...
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteDocument(doc.id)}
                                className="text-red-500 hover:text-red-600 transition ml-4"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-gray-900 text-lg font-semibold mb-2">No documents yet</h4>
                        <p className="text-gray-600 text-sm">Upload PDFs, Images, DOCs, or TXT files to share</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Group Chat</h3>
                    
                    <div className="bg-gray-50 rounded-xl p-4 h-96 overflow-y-auto border border-gray-200">
                      {messages.length > 0 ? (
                        <div className="space-y-3">
                          {messages.map((msg) => {
                            const isMe = msg.sender === (getUser()?.name || 'Anonymous');
                            return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow-sm`}>
                                  <p className={`text-xs font-semibold mb-1 ${isMe ? 'text-blue-100' : 'text-gray-600'}`}>
                                    {msg.sender}
                                  </p>
                                  <p className="text-sm">{msg.text}</p>
                                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-blue-600 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'whiteboard' && (
                  <div className="h-[600px] w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Collaborative Whiteboard</h3>
                      <p className="text-xs text-slate-500 font-medium">Draw together in real-time</p>
                    </div>
                    <Whiteboard roomId={selectedRoom.code} />
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="space-y-6">
                    {roomDocuments.length === 0 ? (
                      <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-gray-900 text-lg font-semibold mb-2">No study materials yet</h4>
                        <p className="text-gray-600 text-sm">Upload documents to generate quiz and flashcards</p>
                      </div>
                    ) : (
                      <>
                        {/* Summary */}
                        {summary && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-blue-600" />
                              Summary
                            </h3>
                            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                              <p className="text-gray-800 text-sm">{summary}</p>
                            </div>
                          </div>
                        )}

                        {/* Flashcards */}
                        {flashcards.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <CheckSquare className="w-5 h-5 text-green-600" />
                              Flashcards ({flashcards.length})
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                              {flashcards.map((card, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                                  <p className="font-semibold text-gray-900 mb-2 text-sm">{card.front}</p>
                                  <p className="text-gray-600 text-xs">{card.back}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quiz */}
                        {quizQuestions.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-orange-600" />
                              Practice Quiz ({quizQuestions.length} questions)
                            </h3>
                            <div className="space-y-4">
                              {quizQuestions.map((q, i) => (
                                <div key={i} className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                  <p className="font-semibold text-gray-900 mb-3 text-sm">Q{i + 1}: {q.question}</p>
                                  <div className="space-y-2">
                                    {q.options.map((opt, j) => (
                                      <button key={j} className="w-full text-left bg-white rounded-lg px-4 py-2 border border-gray-200 hover:border-orange-400 transition text-sm">
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Room Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-semibold text-gray-900">{roomDocuments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages:</span>
                  <span className="font-semibold text-gray-900">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Study Time:</span>
                  <span className="font-semibold text-gray-900">{formatTime(roomTimer)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 shadow-lg border border-purple-100">
              <h4 className="font-bold text-gray-900 mb-2 text-sm">💡 Study Tips</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Use the timer for Pomodoro (25 min study, 5 min break)</li>
                <li>• Upload documents to generate quizzes</li>
                <li>• Chat with your study group</li>
                <li>• Review flashcards regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Study Rooms</h2>
              <p className="text-gray-600 text-sm">Study together with friends in real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowCreateRoom(true)}
          className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
        >
          <Plus className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Create Room</h3>
          <p className="text-blue-100">Start a new study session</p>
        </button>

        <button
          onClick={() => setShowJoinRoom(true)}
          className="bg-white border-2 border-blue-200 text-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-400 transition"
        >
          <LogIn className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-2xl font-bold mb-2">Join Room</h3>
          <p className="text-gray-600">Enter a room code</p>
        </button>
      </div>

      {/* My Rooms */}
      {rooms.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">My Rooms</h3>
          <div className="space-y-3">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 cursor-pointer hover:border-blue-400 transition"
                onClick={() => {
                  setSelectedRoom(room);
                  loadRoomDocuments(room.code);
                  const roomData = JSON.parse(localStorage.getItem(`room_${room.code}`) || '{}');
                  setRoomTimer(roomData.timerSeconds || 0);
                  setIsTimerRunning(roomData.isRunning || false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{room.name}</h4>
                    <p className="text-sm text-gray-600">
                      {room.participants.length} participant{room.participants.length > 1 ? 's' : ''} • Code: <span className="font-mono font-bold text-blue-600">{room.code}</span>
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Study Room</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name (e.g., Math Study Group)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={createRoom}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Room Modal */}
      <AnimatePresence>
        {showJoinRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Join Study Room</h3>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter room code (e.g., ABC123)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-mono text-center text-lg"
                autoFocus
                maxLength={6}
              />
              <div className="flex gap-3">
                <button
                  onClick={joinRoom}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Join Room
                </button>
                <button
                  onClick={() => setShowJoinRoom(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

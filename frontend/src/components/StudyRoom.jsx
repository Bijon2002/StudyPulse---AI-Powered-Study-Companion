import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, Copy, Check, LogOut, Clock } from 'lucide-react';
import { getRooms, createRoom, joinRoom, addMessage, saveRooms } from '../utils/storage';
import { getUser } from '../utils/storage';

export default function StudyRoom() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      const interval = setInterval(() => {
        const updatedRooms = getRooms();
        const updated = updatedRooms.find(r => r.id === currentRoom.id);
        if (updated) {
          setCurrentRoom(updated);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom?.messages]);

  const loadRooms = () => {
    const allRooms = getRooms();
    const user = getUser();
    const userRooms = allRooms.filter(room => 
      room.participants.some(p => p.email === user.email) && room.isActive
    );
    setRooms(userRooms);
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;

    const newRoom = createRoom({ name: roomName });
    setRoomName('');
    setShowCreateRoom(false);
    setCurrentRoom(newRoom);
    loadRooms();
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;

    const room = joinRoom(joinCode.toUpperCase());
    if (room) {
      setJoinCode('');
      setShowJoinRoom(false);
      setCurrentRoom(room);
      loadRooms();
    } else {
      alert('Room not found! Please check the code.');
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentRoom) return;

    addMessage(currentRoom.id, message);
    setMessage('');
    
    // Reload current room to get updated messages
    const updatedRooms = getRooms();
    const updated = updatedRooms.find(r => r.id === currentRoom.id);
    setCurrentRoom(updated);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (currentRoom) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/20 h-full flex flex-col">
        {/* Room Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{currentRoom.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-purple-300 text-sm">Room Code:</span>
              <code className="bg-white/10 px-3 py-1 rounded text-yellow-400 font-mono">
                {currentRoom.code}
              </code>
              <button
                onClick={copyRoomCode}
                className="text-purple-300 hover:text-white transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>

        {/* Participants */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-300" />
            <span className="text-purple-300 text-sm">
              {currentRoom.participants.length} participant(s)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentRoom.participants.map((participant, index) => (
              <div
                key={index}
                className="bg-white/10 px-3 py-1 rounded-full text-sm text-white flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${participant.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                {participant.name}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-black/20 rounded-xl p-4">
          {currentRoom.messages.length === 0 ? (
            <div className="text-center text-purple-300 py-8">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            currentRoom.messages.map((msg) => {
              const user = getUser();
              const isOwn = msg.userId === user.email;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/10'
                    } rounded-2xl p-3`}
                  >
                    {!isOwn && (
                      <p className="text-xs text-purple-300 mb-1 font-semibold">
                        {msg.userName}
                      </p>
                    )}
                    <p className="text-white text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 text-white mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20">
      <div className="text-center mb-8">
        <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Study Rooms</h2>
        <p className="text-purple-300">Study together with friends in real-time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateRoom(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition"
        >
          <div className="text-4xl mb-2">➕</div>
          Create Room
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowJoinRoom(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition"
        >
          <div className="text-4xl mb-2">🚪</div>
          Join Room
        </motion.button>
      </div>

      {/* My Rooms */}
      {rooms.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">My Rooms</h3>
          <div className="space-y-3">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentRoom(room)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{room.name}</h4>
                    <p className="text-purple-300 text-sm">
                      {room.participants.length} participants • Code: {room.code}
                    </p>
                  </div>
                  <div className="text-purple-400">→</div>
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
              className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Create Study Room</h3>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="Enter room name..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition"
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
              className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Join Study Room</h3>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Enter room code..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4 font-mono text-center text-lg"
                maxLength={6}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleJoinRoom}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Join
                </button>
                <button
                  onClick={() => setShowJoinRoom(false)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition"
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

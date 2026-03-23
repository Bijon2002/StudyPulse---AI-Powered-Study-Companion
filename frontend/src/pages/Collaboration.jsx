import React, { useState } from 'react';
import { Users, Crown, Lock, MessageSquare, Video, Send } from 'lucide-react';

const Collaboration = () => {
  const friends = [
    { id: 1, name: 'Sarah M.', status: 'Studying Math', avatar: '👩‍🎓', time: '2h 30m' },
    { id: 2, name: 'Alex K.', status: 'Online', avatar: '👨‍💻', time: '1h 15m' },
    { id: 3, name: 'Jamie L.', status: 'Offline', avatar: '🧑‍🏫', time: '45m' },
  ];

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, user: 'Sarah M.', text: 'Hey! Anyone up for a Math sprint?' },
    { id: 2, user: 'Alex K.', text: 'Sure, I can join in 5 mins.' },
  ]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { id: Date.now(), user: 'You', text: chatMessage }]);
    setChatMessage('');
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Study Room</h1>
        <p className="text-gray-500">Study together, stay motivated.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Friends Column */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="text-indigo-600" /> Active Friends
              </h2>
              <div className="space-y-4">
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                        {friend.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-indigo-600">{friend.time}</span>
                      <p className="text-xs text-gray-400">today</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors border border-dashed border-indigo-200">
                + Invite Friend
              </button>
            </div>

            {/* Chat Column */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="text-indigo-600" /> Room Chat
              </h2>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {chatHistory.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-400 mb-1">{msg.user}</span>
                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                      msg.user === 'You' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Study Room Mockup */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </div>
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
               <div className="flex -space-x-4">
                 {friends.map(f => (
                   <div key={f.id} className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-2xl">
                     {f.avatar}
                   </div>
                 ))}
                 <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-sm font-bold">
                   +5
                 </div>
               </div>
               <p className="text-gray-400">8 people studying in "Quiet Library"</p>
               <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full font-bold flex items-center gap-2">
                 <Video size={18} /> Join Video Room
               </button>
            </div>
          </div>
        </div>

        {/* Leaderboard & Premium */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Crown className="text-yellow-500" /> Leaderboard
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold ${i === 1 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    #{i}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${100 - i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">Go Premium</h3>
            <ul className="space-y-2 text-sm text-indigo-100 mb-6">
              <li className="flex items-center gap-2"><Lock size={14} /> AI Study Coach</li>
              <li className="flex items-center gap-2"><Lock size={14} /> Advanced Analytics</li>
              <li className="flex items-center gap-2"><Lock size={14} /> PDF Exports</li>
            </ul>
            <button className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;

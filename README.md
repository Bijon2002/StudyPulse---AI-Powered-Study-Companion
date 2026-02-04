# 🎓 StudyPulse 2.0 - AI-Powered Study Companion

![StudyPulse Banner](https://img.shields.io/badge/StudyPulse-2.0-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

**StudyPulse** is a fully functional, interactive React web application designed to revolutionize how students learn. With personalized features, scientific-backed gamification, collaborative study rooms, and AI-powered insights, StudyPulse is your ultimate study companion.

---

## ✨ Features

### 🔐 **1. User Management & Personalization**

- **Login/Register System**: Mock authentication with localStorage (easily upgradeable to Firebase)
- **Personalized Dashboard**: Each user sees their own study hours, XP, badges, and avatar
- **Motivational Quotes**: Personalized greetings based on time of day
- **Custom Study Schedules**: Auto-generated based on exams and subjects

### ⏱️ **2. Study Time Tracker**

- **Functional Timer**: Start, Pause, Stop controls
- **Automatic Session Tracking**: All sessions saved per user
- **Visual Analytics**: Daily, weekly, monthly study hours graphs
- **Session Celebrations**:
  - 🎊 Confetti animations
  - 💬 Motivational popups
  - 🎵 Optional sound effects
  - ⚡ XP rewards (10 XP per hour)

### 👥 **3. Collaboration & Study Rooms**

- **Create Study Rooms**: Generate unique room codes
- **Join Rooms**: Easy 6-character code system
- **Real-time Chat**: Simple messaging within rooms
- **Participant Tracking**: See who's active or idle
- **Room Persistence**: Data stored in localStorage (upgradeable to Firebase)

### 🎮 **4. Gamification & Progress**

- **XP System**: 10 XP per study hour
- **Level System**: Unlock new levels every 50 XP
- **15 Unique Badges**:
  - 🎯 First Hour
  - 🔥 5-Day Streak
  - 🦁 Study Beast (10 hours)
  - 👑 Week Warrior
  - 💯 Century Club (100 hours)
  - And 10 more!
- **Evolving Avatar**: Changes from 🌱 Seedling → 🌌 Universe
- **Progress Ring**: Visual XP and level tracking
- **Mystery Rewards**: Random XP bonuses

### 🧠 **5. Smart Study Insights**

- **Focus Pattern Analysis**: Track best study times
- **AI Recommendations**:
  - "You focus best in the evening"
  - "Try 30-min sessions with 5-min breaks"
- **Auto-Generated Schedules**: Based on:
  - Exam dates
  - Subjects
  - Topics
  - Optimal revision timing
- **Spaced Repetition**: Automatic revision scheduling

### 📝 **6. Notebook & AI Analyzer**

- **Personal Study Notebook**: Per-user note storage
- **Duplicate Detection**: Highlights repeated concepts
- **Keyword Extraction**: Automatic topic identification
- **Search Functionality**: Find notes instantly
- **Subject Tagging**: Organize by subject

### 🤖 **7. Chatbot & Voice Assistant**

- **AI Study Assistant**: Context-aware responses
- **Study Tips**: Pomodoro, Active Recall, Feynman Technique
- **Progress Summaries**: Real-time stats
- **Study Doubt Solver**: Subject-specific guidance
- **Voice Input/Output**: Web Speech API integration
- **Quick Actions**: Pre-built question buttons

### 📅 **8. Exam & Revision Planner**

- **Exam Management**: Add exams with dates and topics
- **Auto-Schedule Generation**: Smart topic distribution
- **Daily Task View**: See today's study plan
- **Progress Tracking**: Visual completion percentage
- **Urgent Reminders**:
  - 🚨 Critical (exam today)
  - ⚠️ High (1-3 days)
  - 📅 Medium (4-7 days)
- **Revision Scheduling**: Automatic spaced repetition

---

## 🛠️ Technology Stack

### **Frontend**

- ⚛️ **React 18.3** - Modern UI library
- ⚡ **Vite 6.0** - Lightning-fast build tool
- 🎨 **Tailwind CSS 3.4** - Utility-first styling
- 🎭 **Framer Motion** - Smooth animations
- 📊 **Chart.js** - Beautiful graphs
- 🎉 **Canvas Confetti** - Celebration effects
- 🎯 **Lucide React** - Modern icons

### **State Management**

- 💾 **LocalStorage** - Client-side persistence
- 🔄 **React Hooks** - useState, useEffect, useRef

### **APIs & Integrations**

- 🗣️ **Web Speech API** - Voice input/output
- 🎤 **Speech Recognition** - Browser-native
- 🔊 **Speech Synthesis** - Text-to-speech

### **Future Integrations (Optional)**

- 🔥 **Firebase** - Authentication & Realtime Database
- 🤖 **OpenAI API** - Advanced text summarization
- 🤗 **HuggingFace API** - LLM features

---

## 📁 Project Structure

```
src/
│
├── components/
│   ├── Timer.jsx              # Study timer with session tracking
│   ├── ProgressRing.jsx       # Circular XP progress indicator
│   ├── Rewards.jsx            # Badge display system
│   ├── StudyGraph.jsx         # Chart.js analytics
│   ├── Avatar.jsx             # Evolving user avatar
│   ├── Planner.jsx            # Exam & revision planner
│   ├── MotivationPopup.jsx    # Session completion popup
│   ├── ChatBot.jsx            # AI study assistant
│   ├── StudyRoom.jsx          # Collaborative study rooms
│   ├── Login.jsx              # Authentication
│   └── Register.jsx           # User registration
│
├── pages/
│   ├── Dashboard.jsx          # Main dashboard
│   ├── PlannerPage.jsx        # Exam planning page
│   ├── StudyRoomsPage.jsx     # Collaboration page
│   ├── NotebookPage.jsx       # Note-taking page
│   └── Profile.jsx            # User profile & stats
│
├── utils/
│   ├── storage.js             # LocalStorage management
│   ├── analytics.js           # Study pattern analysis
│   ├── scheduler.js           # Auto-schedule generation
│   └── chatbotAPI.js          # AI chatbot logic
│
├── data/
│   ├── quotes.js              # Motivational quotes
│   └── badges.js              # Achievement definitions
│
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js 16+ installed
- npm or yarn package manager

### **Installation**

1. **Clone or navigate to the project**

   ```bash
   cd c:\Parama_padi_2.0
   ```

2. **Install dependencies** (if not already installed)

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Add your Hugging Face API key:
   ```
   VITE_HUGGINGFACE_API_KEY=your_api_key_here
   ```
   - Get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Build for Production**

```bash
npm run build
npm run preview
```

---

## 🎯 Usage Guide

### **Getting Started**

1. **Register an Account**
   - Enter your name, email, and password
   - Data is stored locally (no server required)

2. **Start Your First Session**
   - Click "Start Session" on the timer
   - Study for any duration
   - Click "Stop" to save and earn XP

3. **Explore Features**
   - **Dashboard**: View stats and insights
   - **Planner**: Add exams and get auto-schedules
   - **Study Rooms**: Create or join collaborative sessions
   - **Notebook**: Take and organize notes
   - **Profile**: View achievements and patterns

### **Creating a Study Plan**

1. Go to **Planner** page
2. Click **"Add Exam"**
3. Enter:
   - Subject name
   - Exam date
   - Topics (comma-separated)
4. Click **"Generate Study Plan"**
5. View auto-generated daily tasks with revision scheduling

### **Joining a Study Room**

1. Go to **Study Rooms** page
2. Click **"Join Room"**
3. Enter the 6-character room code
4. Start chatting and studying together!

### **Using the AI Chatbot**

1. Click the **💬 icon** in bottom-right
2. Ask questions like:
   - "Give me a study tip"
   - "How's my progress?"
   - "I need motivation"
3. Use **🎤 voice input** for hands-free interaction
4. Click **"Solve Doubt"** for subject-specific help

---

## 🏆 Gamification System

### **XP & Levels**

- **Earn XP**: 10 XP per hour of study
- **Level Up**: Every 50 XP unlocks a new level
- **Max Level**: Unlimited progression

### **Badge Rarity System**

- 🟢 **Common**: Easy to earn (First Hour, Room Creator)
- 🔵 **Uncommon**: Moderate effort (3-Day Streak, Note Taker)
- 🟣 **Rare**: Significant achievement (5-Day Streak, Study Beast)
- 🟠 **Epic**: Major milestone (Week Warrior, Level 10)
- 🟡 **Legendary**: Ultimate goals (Century Club)

### **Avatar Evolution**

- Level 1: 🌱 Seedling
- Level 5: 🌿 Sprout
- Level 10: 🌳 Tree
- Level 15: 🏝️ Island
- Level 20: 🏙️ City
- Level 30: 🌍 World
- Level 50: 🌌 Universe

---

## 📊 Analytics & Insights

### **Tracked Metrics**

- Total study hours
- Session count
- Current & longest streak
- Average session length
- Focus patterns (morning/afternoon/evening/night)
- Daily/weekly/monthly trends

### **AI Recommendations**

- Best time of day to study
- Optimal session length
- Break suggestions
- Streak maintenance tips
- Level-based advice

---

## 🎨 Design Philosophy

### **Visual Excellence**

- ✨ Glassmorphism effects
- 🌈 Vibrant gradient backgrounds
- 🎭 Smooth Framer Motion animations
- 🎨 Modern color palette (Purple, Pink, Indigo)
- 📱 Fully responsive design

### **User Experience**

- ⚡ Fast loading with Vite
- 🎯 Intuitive navigation
- 💬 Clear feedback and celebrations
- 🔔 Smart notifications and reminders
- 🎮 Engaging gamification

---

## 🔮 Future Enhancements

### **Phase 1: Backend Integration**

- [ ] Firebase Authentication
- [ ] Firestore Database
- [ ] Real-time sync across devices
- [ ] Cloud backup

### **Phase 2: Advanced AI**

- [ ] OpenAI integration for note summarization
- [ ] HuggingFace models for Q&A
- [ ] Personalized learning paths
- [ ] Predictive analytics

### **Phase 3: Social Features**

- [ ] Friend system
- [ ] Leaderboards
- [ ] Study challenges
- [ ] Achievement sharing

### **Phase 4: Mobile App**

- [ ] React Native version
- [ ] Offline mode
- [ ] Push notifications
- [ ] Widget support

---

## 🐛 Troubleshooting

### **Common Issues**

**Timer not starting?**

- Ensure you're logged in
- Check browser console for errors
- Try refreshing the page

**Data not saving?**

- Check if localStorage is enabled
- Clear browser cache and try again
- Ensure you're using a modern browser

**Voice assistant not working?**

- Only works in Chrome/Edge (Web Speech API)
- Grant microphone permissions
- Check browser compatibility

**Graphs not displaying?**

- Complete at least one study session
- Ensure Chart.js is loaded
- Check for JavaScript errors

---

## 🤝 Contributing

This is a demo/hackathon project. Feel free to:

- Fork and modify
- Add new features
- Improve UI/UX
- Fix bugs
- Optimize performance

---

## 📄 License

MIT License - Feel free to use for personal or educational purposes.

---

## 👨‍💻 Developer Notes

### **Key Implementation Details**

1. **User Isolation**: All data is scoped by user email
2. **Session Tracking**: Uses `setInterval` for accurate timing
3. **XP Calculation**: `Math.floor(hours * 10)`
4. **Level Formula**: `Math.floor(xp / 50) + 1`
5. **Streak Logic**: Compares `lastStudyDate` with today/yesterday
6. **Schedule Generation**: Distributes topics evenly, reserves 2 days for revision

### **Performance Optimizations**

- Lazy loading with React.lazy (future)
- Memoization with useMemo/useCallback (future)
- Virtual scrolling for large lists (future)
- Image optimization (future)

---

## 🎉 Acknowledgments

Built with ❤️ for students worldwide. Special thanks to:

- React team for the amazing framework
- Tailwind CSS for beautiful utilities
- Framer Motion for smooth animations
- Chart.js for data visualization
- The open-source community

---

## 📞 Support

For questions or issues:

- Check the troubleshooting section
- Review the code comments
- Experiment with the features
- Build upon this foundation!

---

**Made with 💜 by the StudyPulse Team**

_Empowering students through technology and gamification_ 🚀

# StudyPulse ⚡ — AI-Powered Study Companion

StudyPulse is a high-performance, intelligent study ecosystem designed to boost productivity through deep focus tracking, collaborative tools, and AI-driven insights. It seamlessly integrates a powerful web dashboard with a custom browser extension to create a distraction-free learning environment.

![StudyPulse Header](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2071)

## 🚀 Key Features

### 🛡️ Focus Guardian & Extension
*   **Intelligent Blocking**: Automatically restrict access to distracting websites during focus sessions.
*   **Dual-Layer Tracking**: Sync your study activity from the browser extension directly to your dashboard.
*   **Extension Manager**: Configure your allowlist and view real-time tracking logs in the "Extension Guard" tab.
*   **Guardian Mode**: A strict blocking page that redirects you back to your study goals when you stray.

### 🎨 Intelligent Whiteboard
*   **Infinity Canvas**: A smooth, high-performance drawing area for brainstorming and diagrams.
*   **Auto-scaling**: Responsive layout that adapts instantly to any window size or device.
*   **Collaborative Ready**: Generate instant invite links to share your canvas with peers.

### 🤖 AI Study Assistant
*   **Pollinations powered**: Integrated AI helper for instant explanations, summaries, and complex problem solving.
*   **Zero-Config AI**: High-quality generative responses without requiring expensive API keys.
*   **Context-Aware**: Access the AI Command Bar (⌘K) from anywhere in the application.

### 📊 Community & Motivation
*   **Global Leaderboard**: Compete with students worldwide and track your XP/Streak rank in real-time.
*   **Study Rooms**: Join virtual collaborative environments to stay motivated.
*   **Daily Notes & Planner**: Organize your schedule with an interactive timeline and task management system.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Framer Motion, Axios, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB Atlas, Mongoose |
| **AI Layer** | Pollinations.ai (Free unauthenticated API) |
| **Extension** | Chrome Extension API, Javascript (Manifest V3) |
| **Deployment** | Vercel (Frontend), Render/DigitalOcean (Backend Suggestion) |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account (or local MongoDB instance)

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with your MONGODB_URI and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Browser Extension Setup
1.  Navigate to the **Extension Guard** tab in the StudyPulse dashboard.
2.  Click **"Install Extension"** to download the `StudyPulse-Extension.zip`.
3.  Extract the ZIP folder.
4.  Open Chrome and go to `chrome://extensions`.
5.  Enable **Developer Mode**.
6.  Click **"Load Unpacked"** and select the extracted folder.

---

## 🔒 Security & Privacy
*   **Local-First Architecture**: Study data resides in your profile; browser logs are synced only when you choose to activate Focus Mode.
*   **No API Keys Required**: The integrated AI uses a public, ethically-accessible endpoint.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for students, by the StudyPulse Team.*

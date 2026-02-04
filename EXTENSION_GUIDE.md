# 🚀 BROWSER EXTENSION + STREAK GRAPH - COMPLETE GUIDE

## ✅ **WHAT'S NEW**

### **1. Browser Extension** 🌐

- ✅ **Time Tracking** - Track time spent on every website
- ✅ **Focus Mode** - Block distracting websites
- ✅ **Website Blocker** - Custom blocked sites list
- ✅ **Auto Sync** - Sync data to StudyPulse app
- ✅ **Real-time Stats** - See today's browsing time

### **2. GitHub-Style Streak Graph** 📊

- ✅ **365-Day Calendar** - Full year view
- ✅ **Color Intensity** - More sessions = darker color
- ✅ **Hover Tooltips** - See exact session count
- ✅ **Monthly Labels** - Easy navigation
- ✅ **Stats Summary** - Total sessions, active days, best day

---

## 🌐 **BROWSER EXTENSION**

### **Features:**

#### **A. Time Tracking**

- Automatically tracks time on every website
- Records domain and duration
- Saves data every minute
- Shows daily statistics

#### **B. Focus Mode**

- Toggle on/off with one click
- Blocks distracting websites
- Shows motivational blocked page
- Timer shows how long you've been focused

#### **C. Website Blocker**

- Pre-loaded with common distractions:
  - facebook.com
  - twitter.com
  - instagram.com
  - youtube.com
  - reddit.com
  - tiktok.com
- Add custom sites
- Remove sites anytime

#### **D. Sync to App**

- One-click sync button
- Sends data to StudyPulse app
- Updates your dashboard
- Shows success message

---

## 📥 **HOW TO INSTALL EXTENSION**

### **Step 1: Load Extension in Chrome/Edge**

1. **Open Extension Page:**
   - Chrome: Go to `chrome://extensions/`
   - Edge: Go to `edge://extensions/`

2. **Enable Developer Mode:**
   - Toggle "Developer mode" ON (top right)

3. **Load Extension:**
   - Click "Load unpacked"
   - Navigate to: `c:\Parama_padi_2.0\browser-extension`
   - Click "Select Folder"

4. **Extension Installed!**
   - You'll see "StudyPulse Focus Tracker" in your extensions
   - Pin it to toolbar for easy access

---

### **Step 2: Use the Extension**

#### **Open Extension Popup:**

1. Click the StudyPulse icon in toolbar
2. See the popup interface

#### **Enable Focus Mode:**

1. Toggle "Focus Mode" ON
2. Blocked sites are now blocked!
3. Try visiting facebook.com
4. You'll see the blocked page

#### **View Stats:**

```
📊 Today's Stats
Total Time: 2h 15m
Sites Visited: 12
```

#### **Manage Blocked Sites:**

1. Scroll to "Blocked Sites" section
2. See default blocked sites
3. Add new site:
   - Type: "twitter.com"
   - Click "Add"
4. Remove site:
   - Click "Remove" next to any site

#### **Sync to App:**

1. Make sure StudyPulse app is running (localhost:5173)
2. Click "🔄 Sync to StudyPulse App"
3. See success message
4. Check dashboard for updated data

---

## 🎨 **EXTENSION INTERFACE**

### **Popup (350px wide):**

```
⚡ StudyPulse
Focus Tracker & Website Blocker

┌─────────────────────────────┐
│ 🎯 Focus Mode        [ON/OFF]│
│ Block distracting websites   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 📊 Today's Stats            │
│ ┌──────────┬──────────┐    │
│ │   2h     │    12    │    │
│ │Total Time│  Sites   │    │
│ └──────────┴──────────┘    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🚫 Blocked Sites            │
│ ┌─────────────────────────┐ │
│ │ facebook.com   [Remove] │ │
│ │ twitter.com    [Remove] │ │
│ │ instagram.com  [Remove] │ │
│ │ youtube.com    [Remove] │ │
│ └─────────────────────────┘ │
│ [example.com] [Add]         │
└─────────────────────────────┘

[🔄 Sync to StudyPulse App]
```

---

### **Blocked Page:**

When you try to visit a blocked site:

```
🚫

Site Blocked

This website is blocked during Focus Mode

┌─────────────────────────────┐
│     Stay Focused! 💪        │
│ 📚 You're in study mode     │
│ ⏰ Take a break after       │
│ 🎯 Focus on your goals      │
│ ✨ You've got this!         │
└─────────────────────────────┘

00:05
Time since you tried to visit this site

[⚡ Go to StudyPulse]
```

---

## 📊 **GITHUB-STYLE STREAK GRAPH**

### **What It Shows:**

#### **Visual Calendar:**

- 365 days (full year)
- Each square = 1 day
- Color intensity = session count
- Hover to see details

#### **Color Scale:**

```
□ Gray    = 0 sessions
□ Light   = 1 session
□ Medium  = 2 sessions
□ Dark    = 3 sessions
□ Darkest = 4+ sessions
```

#### **Stats:**

- **Total Sessions**: All study sessions
- **Active Days**: Days with at least 1 session
- **Best Day**: Maximum sessions in one day

---

## 🎯 **HOW TO USE**

### **Streak Graph (In Dashboard):**

1. Go to Dashboard
2. Scroll down
3. See "📅 Study Streak" section
4. View your year of study activity

**What You'll See:**

```
📅 Study Streak                Less □□□□□ More

Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
Mon  ■■■□□■■■■■□□■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□
     ■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□
Wed  ■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□
     ■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□
Fri  ■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□
     ■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□
Sun  ■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□

┌──────────────┬──────────────┬──────────────┐
│      45      │      30      │      5       │
│Total Sessions│ Active Days  │  Best Day    │
└──────────────┴──────────────┴──────────────┘
```

**Hover Over Any Square:**

```
Tooltip: "3 sessions on Jan 15, 2026"
```

---

## 🔧 **TECHNICAL DETAILS**

### **Extension Architecture:**

**Files:**

```
browser-extension/
├── manifest.json       # Extension config
├── background.js       # Service worker (time tracking)
├── content.js          # Runs on web pages
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
└── blocked.html        # Blocked site page
```

**How It Works:**

1. **Time Tracking:**
   - `background.js` monitors active tab
   - Tracks URL and domain
   - Saves time every minute
   - Stores in `chrome.storage.local`

2. **Website Blocking:**
   - Checks if site is in blocked list
   - If Focus Mode ON + site blocked
   - Redirects to `blocked.html`

3. **Data Storage:**

   ```javascript
   timeData: {
     "2026-01-31": {
       "github.com": 1200,  // seconds
       "stackoverflow.com": 800
     }
   }
   ```

4. **Sync to App:**
   - Sends POST request to localhost:5173
   - Transfers time data
   - Updates dashboard

---

### **Streak Graph Algorithm:**

1. **Generate 365 Days:**

   ```javascript
   for (let i = 364; i >= 0; i--) {
     const date = new Date(today);
     date.setDate(date.getDate() - i);
     days.push(date);
   }
   ```

2. **Count Sessions Per Day:**

   ```javascript
   sessions.forEach((session) => {
     const date = session.timestamp.split("T")[0];
     dayData[date]++;
   });
   ```

3. **Assign Colors:**

   ```javascript
   if (count === 0) return "bg-gray-100";
   if (count === 1) return "bg-blue-200";
   if (count === 2) return "bg-blue-400";
   if (count === 3) return "bg-blue-600";
   return "bg-blue-800";
   ```

4. **Group by Weeks:**
   - 7 days per column
   - Start on Sunday
   - 52 weeks displayed

---

## 💡 **USE CASES**

### **1. Block Distractions During Study:**

```
1. Open extension
2. Toggle Focus Mode ON
3. Start studying
4. Try to visit YouTube
5. See blocked page
6. Stay focused!
```

### **2. Track Browsing Habits:**

```
1. Extension tracks automatically
2. At end of day, click extension
3. See: "5h total time, 20 sites"
4. Identify time wasters
5. Add to blocked list
```

### **3. Sync to Dashboard:**

```
1. Study for a week
2. Extension tracks all time
3. Click "Sync to StudyPulse App"
4. Go to Dashboard
5. See updated streak graph
6. Visualize your consistency
```

### **4. Monitor Study Streak:**

```
1. Open Dashboard
2. Scroll to Streak Graph
3. See your study pattern
4. Identify gaps
5. Maintain consistency
6. Build better habits
```

---

## 🎯 **EXAMPLE WORKFLOW**

### **Day 1: Setup**

```
Morning:
1. Install browser extension
2. Pin to toolbar
3. Enable Focus Mode
4. Add custom blocked sites

During Study:
1. Extension tracks time automatically
2. Blocked sites redirect to focus page
3. Stay productive

Evening:
1. Click extension icon
2. See: "3h study time today"
3. Click "Sync to App"
4. Check Dashboard
5. See first square on streak graph!
```

### **Week 1: Building Streak**

```
Each Day:
1. Study with Focus Mode ON
2. Extension tracks time
3. Sync to app daily

End of Week:
1. Open Dashboard
2. See 7 colored squares
3. Total: 21 sessions
4. Active Days: 7
5. Best Day: 5 sessions
```

---

## ✅ **WHAT'S WORKING**

### **Browser Extension:**

- ✅ Time tracking on all websites
- ✅ Focus mode toggle
- ✅ Website blocking
- ✅ Custom blocked sites
- ✅ Add/Remove sites
- ✅ Daily stats display
- ✅ Sync to app button
- ✅ Blocked page with timer
- ✅ Auto-save every minute

### **Streak Graph:**

- ✅ 365-day calendar view
- ✅ Color-coded intensity
- ✅ Hover tooltips
- ✅ Monthly labels
- ✅ Day labels (Mon, Wed, Fri, Sun)
- ✅ Total sessions stat
- ✅ Active days stat
- ✅ Best day stat
- ✅ Responsive design

---

## 🚀 **TRY IT NOW!**

### **Test Extension:**

1. **Install:**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Load unpacked
   - Select `c:\Parama_padi_2.0\browser-extension`

2. **Test Focus Mode:**
   - Click extension icon
   - Toggle Focus Mode ON
   - Visit `facebook.com`
   - See blocked page!

3. **Test Time Tracking:**
   - Browse normally for 5 minutes
   - Click extension icon
   - See time tracked

4. **Test Sync:**
   - Make sure app is running (localhost:5173)
   - Click "Sync to StudyPulse App"
   - Go to Dashboard
   - See updated data

### **Test Streak Graph:**

1. **View Graph:**
   - Go to http://localhost:5173
   - Go to Dashboard
   - Scroll down
   - See "📅 Study Streak"

2. **Check Your Streak:**
   - See colored squares for days with sessions
   - Hover over squares for details
   - View stats at bottom

---

## 🎉 **YOU NOW HAVE:**

1. ✅ **Browser Extension**
   - Time tracking
   - Website blocking
   - Focus mode
   - Sync to app

2. ✅ **Streak Graph**
   - GitHub-style calendar
   - 365-day view
   - Color intensity
   - Hover tooltips
   - Stats summary

3. ✅ **Complete System**
   - Track browsing time
   - Block distractions
   - Visualize consistency
   - Build study habits

---

**Everything is ready to use!** 🚀💙

**Install the extension and see your streak grow!**

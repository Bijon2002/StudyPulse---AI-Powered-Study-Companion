import { getChatbotResponse as getAIResponse } from './aiHelpers';

export const getChatbotResponse = async (message, userContext) => {
  const lowerMessage = message.toLowerCase();

  // Add personalization with user context
  if (userContext) {
    const { userName, level, xp, totalHours, currentStreak, totalSessions } = userContext;

    // Explain concept bridge
    if (lowerMessage.includes('explain') || lowerMessage.includes('concept')) {
      return {
        response: `I love deep dives! 🧠 \n\nTell me which concept you're wrestling with. I'll break it down using:\n1. **Simplified definition**\n2. **Real-world analogy**\n3. **3 Key pillars** of the idea.\n\nWhat are we learning today?`,
        suggestions: ['Quantum Physics', 'Photosynthesis', 'Market Economics']
      };
    }

    // Progress-specific responses (moved to handle as fallback)
    if (lowerMessage.includes('progress') || lowerMessage.includes('stats') || lowerMessage.includes('how am i doing')) {
      return {
        response: `Hey ${userName}! Here's your progress:\n\n⭐ Level ${level} (${xp} XP)\n📚 ${totalHours.toFixed(1)} total study hours\n🔥 ${currentStreak}-day streak\n📊 ${totalSessions} study sessions completed\n\n${currentStreak > 0 ? `Amazing ${currentStreak}-day streak! Keep it up! 🎉` : 'Start a session today to begin your streak! 💪'}\n\nWhat would you like to work on next?`,
        suggestions: ['Study tips', 'Set a goal', 'Start session']
      };
    }

    // Career Guidance
    if (lowerMessage.includes('career') || lowerMessage.includes('future') || lowerMessage.includes('guidance')) {
      return {
        response: `As a Level ${level} scholar, you're building a strong foundation. \n\nBased on your study patterns, you show high discipline. Have you considered paths in **Data Science, Research, or Project Management?**\n\nI can help you map out a 12-month skill roadmap if you'd like!`,
        suggestions: ['Generate Roadmap', 'Skill analysis', 'Ask about an industry']
      };
    }

    // Resolve Doubt bridge
    if (lowerMessage.includes('solve a doubt') || lowerMessage.includes('help with problem')) {
      return {
        response: `I'm ready! Paste the problem or describe what's confusing you. \n\nI can help with **Math, Science, History, or Coding.** What's on your mind?`,
        suggestions: ['Math problem', 'Science concept', 'Coding logic']
      };
    }

    // Personalized greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
      return {
        response: `Hi ${userName}! 👋\n\nYou're at Level ${level} with ${totalHours.toFixed(1)} hours of study time. ${currentStreak > 0 ? `Your ${currentStreak}-day streak is impressive!` : "Let's start a new streak today!"}\n\nHow can I help you reach your goals today?`,
        suggestions: ['My progress', 'Study tips', 'Motivation boost']
      };
    }
  }

  // Fallback to AI response
  const aiResponse = await getAIResponse(message, '');
  return aiResponse;
};

export const solveStudyDoubt = (question, subject = '') => {
  if (!question || question.trim().length === 0) {
    return 'Please enter your question and I\'ll help you solve it!';
  }

  const lowerQuestion = question.toLowerCase();
  const subjectLower = subject.toLowerCase();

  // Math-related
  if (subjectLower.includes('math') || lowerQuestion.includes('equation') || lowerQuestion.includes('solve')) {
    return `📐 Math Help:\n\nFor "${question}":\n\n1. **Identify** what you're solving for\n2. **Break down** the problem into steps\n3. **Apply** relevant formulas\n4. **Check** your answer\n\n💡 Tips:\n- Write down what you know\n- Draw diagrams if helpful\n- Work backwards from the answer\n- Practice similar problems\n\nNeed more specific help? Try:\n- Khan Academy for video tutorials\n- Wolfram Alpha for step-by-step solutions\n- Practice problems from your textbook`;
  }

  // Science-related
  if (subjectLower.includes('science') || subjectLower.includes('physics') || subjectLower.includes('chemistry') || subjectLower.includes('biology')) {
    return `🔬 Science Help:\n\nFor "${question}":\n\n1. **Understand** the concept\n2. **Identify** key principles\n3. **Apply** to the problem\n4. **Verify** with examples\n\n💡 Study Strategy:\n- Read the textbook section\n- Watch explanatory videos\n- Do practice problems\n- Create concept maps\n- Teach it to someone else\n\nResources:\n- YouTube (CrashCourse, Khan Academy)\n- Your textbook examples\n- Lab experiments`;
  }

  // Language/English
  if (subjectLower.includes('english') || subjectLower.includes('language') || lowerQuestion.includes('grammar') || lowerQuestion.includes('write')) {
    return `📝 Language Help:\n\nFor "${question}":\n\n1. **Read** examples\n2. **Understand** the rules\n3. **Practice** writing\n4. **Get feedback**\n\n💡 Writing Tips:\n- Read widely\n- Practice daily\n- Use grammar checkers\n- Get peer reviews\n- Revise multiple times\n\nResources:\n- Grammarly for grammar\n- Hemingway Editor for clarity\n- Read quality literature`;
  }

  // History/Social Studies
  if (subjectLower.includes('history') || subjectLower.includes('social')) {
    return `📚 History Help:\n\nFor "${question}":\n\n1. **Timeline**: When did it happen?\n2. **Context**: What was happening around it?\n3. **Causes**: Why did it happen?\n4. **Effects**: What were the results?\n5. **Significance**: Why does it matter?\n\n💡 Study Tips:\n- Create timelines\n- Make connections\n- Use mnemonics\n- Watch documentaries\n- Discuss with others`;
  }

  // General study doubt
  return `🎓 Study Help:\n\nFor your question: "${question}"\n\n**Approach:**\n1. **Break it down** into smaller parts\n2. **Research** each part separately\n3. **Connect** the concepts\n4. **Practice** with examples\n5. **Test** your understanding\n\n**Study Strategies:**\n- 📖 Review your notes/textbook\n- 🎥 Watch tutorial videos\n- 💬 Discuss with classmates\n- ✍️ Practice problems\n- 🧠 Teach it to someone\n\n**Resources:**\n- Khan Academy (free videos)\n- YouTube educational channels\n- Your textbook examples\n- Study groups\n- Office hours with teachers\n\nNeed more specific help? Let me know the subject!`;
};

// Web Speech API for voice input
export const startListening = (callback) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    callback({ error: 'Speech recognition not supported' });
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    callback({ transcript });
  };

  recognition.onerror = (event) => {
    callback({ error: event.error });
  };

  recognition.start();
  return recognition;
};

// Web Speech API for voice output
export const speak = (text) => {
  if (!('speechSynthesis' in window)) {
    console.log('Speech synthesis not supported');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

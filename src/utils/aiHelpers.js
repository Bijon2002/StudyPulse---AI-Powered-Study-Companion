// AI utilities using free HuggingFace API (Mistral-7B for high quality)
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2';

// Minimum content requirements
const MIN_WORDS = 20;

const callLLM = async (prompt, systemPrompt = "You are a helpful study assistant.", retryCount = 0) => {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${systemPrompt} \n\n ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.4, // Lower temperature for more accurate, "grounded" answers
            top_p: 0.9,
            return_full_text: false
          }
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      const text = result[0]?.generated_text || result.generated_text || (Array.isArray(result) ? result[0] : result);
      return typeof text === 'string' ? text : JSON.stringify(text);
    } 
    
    // Handle "Model is loading" - retry once after wait
    if (result.error?.includes('loading') && retryCount < 1) {
      console.log('Model is loading, waiting 10s...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      return callLLM(prompt, systemPrompt, retryCount + 1);
    }

    console.error('API Error:', result.error || 'Unknown error');
    return null;
  } catch (error) {
    console.error('LLM Call Error:', error);
    return null;
  }
};

export const generateSummary = async (text) => {
  if (!text || text.trim().split(/\s+/).length < MIN_WORDS) {
    return '⚠️ Content too short. Please add at least 20 words for AI analysis.';
  }

  const prompt = `Summarize the following study material into a concise paragraph focusing on key takeaways:\n\n${text}`;
  const response = await callLLM(prompt, "Summarize accurately and concisely.");
  
  if (response) return response.trim();

  // Fallback
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).join('. ').trim() + '.';
};

export const generateFAQs = async (text, title) => {
  const prompt = `Based on this study material "${title}", generate 3-4 frequently asked questions and their answers. Format as JSON: [{"q": "Question", "a": "Answer"}]. Output ONLY the JSON array. Material: ${text}`;
  const response = await callLLM(prompt, "Output ONLY valid JSON.");
  
  if (response) {
    try {
      const match = response.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
    } catch (e) {
      console.warn("JSON Parse Error in FAQs");
    }
  }

  // Fallback
  return [
    { q: `What is the core focus of ${title}?`, a: `The material discusses several key concepts related to ${title}.` },
    { q: 'Is there a summary available?', a: 'Yes, check the Summary tab for a quick overview.' }
  ];
};

export const generateFlashcards = async (text) => {
  const prompt = `Create 5 study flashcards from this text. Format as JSON: [{"front": "Question", "back": "Answer"}]. Output ONLY the JSON array. Text: ${text}`;
  const response = await callLLM(prompt, "Output ONLY valid JSON.");

  if (response) {
    try {
      const match = response.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
    } catch (e) {}
  }

  const keywords = extractTopWords(text, 5);
  return keywords.map(kw => ({ front: `Define ${kw.word}`, back: `A key concept mentioned in the text.` }));
};

export const generateQuiz = async (text, title) => {
  const prompt = `Create a 3-question multiple choice quiz about "${title}". Format as JSON: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": "Correct Option", "explanation": "..."}]. Output ONLY JSON. Text: ${text}`;
  const response = await callLLM(prompt, "Output ONLY valid JSON.");

  if (response) {
    try {
      const match = response.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
    } catch (e) {}
  }

  return [{
    question: `What is a primary topic in ${title}?`,
    options: ['Subject A', 'Subject B', 'Subject C', 'Subject D'],
    correct: 'Subject A',
    explanation: 'Check the source materials for detailed context.'
  }];
};

export const generateTimeline = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 6).map((sentence, index) => ({
    step: index + 1,
    title: `Checkpoint ${index + 1}`,
    content: sentence.trim() + '.'
  }));
};

export const generateMindMap = (text) => {
  const keywords = extractTopWords(text, 8);
  return keywords.map((kw, index) => ({
    concept: kw.word,
    frequency: kw.count,
    connections: keywords.filter((k, i) => i !== index).slice(0, 3).map(k => k.word)
  }));
};

// Generate a detailed study plan/roadmap
export const generateStudyPlan = async (subject, examDate, topics) => {
  const systemPrompt = "You are an expert Academic Advisor. Your task is to create a highly effective, day-by-day study roadmap for an upcoming exam.";
  const prompt = `SUBJECT: ${subject}\nEXAM DATE: ${examDate}\nTOPICS TO COVER: ${topics.join(', ')}\n\nPlease generate a structured study plan starting from today until the exam date. 
  For each day, specify which topics to focus on and a specific learning goal. 
  Format the output as a JSON array: [{"day": "Date/Day X", "focus": "Topic", "goal": "Objective"}]. Output ONLY JSON.`;

  const response = await callLLM(prompt, systemPrompt);
  if (response) {
    try {
      const match = response.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
    } catch (e) {
      console.error('Study Plan JSON Error:', e);
    }
  }
  return null;
};

// Surprise: AI Career & Role Insights based on subjects
export const generateCareerInsights = async (subjects) => {
  const systemPrompt = "You are a Career Counselor. Analyze study subjects and suggest career paths.";
  const prompt = `I am studying: ${subjects.join(', ')}. What are 3 potential career paths, and what is one "Pro Insight" for each? 
  Format as JSON: [{"career": "...", "description": "...", "insight": "..."}]. Output ONLY JSON.`;

  const response = await callLLM(prompt, systemPrompt);
  if (response) {
    try {
      const match = response.match(/\[.*\]/s);
      if (match) return JSON.parse(match[0]);
    } catch (e) {}
  }
  return null;
};

export const generatePodcastScript = (text, title) => {
  const words = text.split(/\s+/);
  const duration = Math.ceil(words.length / 150);
  return {
    title: `Audio Briefing: ${title}`,
    duration: `${duration} min`,
    description: `AI overview of ${title}.`,
    script: text.substring(0, 500)
  };
};

const extractTopWords = (text, count = 10) => {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'it', 'its', 'they', 'them', 'their']);
  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !commonWords.has(w));
  const frequency = {};
  words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
  return Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, count).map(([word, count]) => ({ word, count }));
};

export const getChatbotResponse = async (message, context = '') => {
  const lowerMessage = message.toLowerCase();
  
  if (context && context.trim().length > 10) {
    const systemPrompt = `You are a specialized Study Assistant. Your task is to answer the user's question based strictly on the provided context from their study documents. 
    Guidelines:
    1. If the answer is in the context, be thorough and precise.
    2. If the answer is not in the context, clearly state that the information isn't in their current documents, then provide a general educational answer if possible.
    3. Use markdown for better readability (bullet points, bold text).
    4. Keep the tone professional, encouraging, and academic.`;

    const prompt = `CONTEXT FROM USER DOCUMENTS:\n"""\n${context.substring(0, 4000)}\n"""\n\nUSER QUESTION: ${message}`;
    const response = await callLLM(prompt, systemPrompt);
    
    if (response) {
      return {
        response: response.trim(),
        suggestions: ['Summarize these notes', 'Generate a quiz', 'Back to general tips']
      };
    }
  }

  // Fallback for general questions (without context)
  const generalSystemPrompt = "You are a friendly Study Assistant. Provide helpful, concise advice on study techniques, motivation, and time management.";
  const response = await callLLM(message, generalSystemPrompt);

  if (response) {
    return {
      response: response.trim(),
      suggestions: ['Study tips', 'Time management', 'Motivation']
    };
  }

  return {
    response: "I'm here to help! Paste some notes in the Notebook and I can help you analyze them, or ask me for study tips!",
    suggestions: ['Study tips', 'Motivation']
  };
};

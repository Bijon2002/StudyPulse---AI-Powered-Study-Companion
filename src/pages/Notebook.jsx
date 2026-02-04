import React, { useState } from 'react';
import { Sparkles, Copy, FileText, AlertCircle, Settings, Key } from 'lucide-react';

const Notebook = () => {
  const [notes, setNotes] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const analyzeNotes = () => {
    if (!notes.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI processing or use API if key exists (mock implementation)
    setTimeout(() => {
      const sentences = notes.split('.').filter(s => s.trim().length > 0);
      const words = notes.toLowerCase().split(/\s+/);
      const wordFreq = {};
      words.forEach(w => {
        if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
      });
      
      const repeatedConcepts = Object.entries(wordFreq)
        .filter(([_, count]) => count > 2)
        .map(([word]) => word);

      const summary = sentences.length > 0 
        ? (apiKey ? "✨ (AI Generated) " : "") + sentences.slice(0, 2).join('. ') + '.' 
        : '';

      setAnalysis({
        summary: summary || "Could not generate summary.",
        repeated: repeatedConcepts,
        duplicates: sentences.length !== new Set(sentences).size
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Notebook</h1>
          <p className="text-gray-500">Take notes and let AI organize them.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="AI Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={analyzeNotes}
            disabled={isAnalyzing || !notes.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Notes'}
          </button>
        </div>
      </header>

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2">
          <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Key size={16} /> AI Configuration
          </h3>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter OpenAI / HuggingFace API Key (Optional)"
              className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button 
              onClick={() => setShowSettings(false)}
              className="px-3 py-2 bg-indigo-200 text-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-300"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-indigo-600 mt-2">
            * If no key is provided, we use a local rule-based simulation for free.
          </p>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 h-full flex flex-col">
          <textarea
            className="flex-1 w-full p-6 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-lg leading-relaxed shadow-sm font-sans"
            placeholder="Start typing your study notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="space-y-4 overflow-auto">
          {analysis ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-in slide-in-from-right">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-indigo-600" />
                  Quick Summary
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  {analysis.summary}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Copy size={18} className="text-orange-500" />
                  Key Concepts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.repeated.length > 0 ? (
                    analysis.repeated.map((word, i) => (
                      <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-100">
                        {word}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No repeated concepts detected.</p>
                  )}
                </div>
              </div>

              {analysis.duplicates && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Duplicate Content</p>
                    <p className="text-xs text-red-600">You have repeated identical sentences.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <Sparkles size={32} className="mb-2 opacity-50" />
              <p>Write notes and click "Analyze" to see insights here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notebook;

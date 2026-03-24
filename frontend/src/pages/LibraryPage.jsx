import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library, FileText, Trash2, Search, Filter, Download, ExternalLink, Clock } from 'lucide-react';
import { getNotes } from '../utils/storage';

export default function LibraryPage() {
  const [sources, setSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const notes = getNotes();
    const allSources = [];
    notes.forEach(note => {
      if (note.sources) {
        note.sources.forEach(source => {
          allSources.push({
            ...source,
            noteTitle: note.title,
            noteId: note.id
          });
        });
      }
    });
    setSources(allSources);
  }, []);

  const filteredSources = sources.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.noteTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || s.type.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  const deleteSource = (id) => {
    if (confirm('Permanently remove this source from your library?')) {
      const notes = JSON.parse(localStorage.getItem('studypulse_notes') || '[]');
      const updatedNotes = notes.map(note => ({
        ...note,
        sources: note.sources ? note.sources.filter(s => s.id !== id) : []
      }));
      localStorage.setItem('studypulse_notes', JSON.stringify(updatedNotes));
      setSources(sources.filter(s => s.id !== id));
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Library className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Library</h2>
            <p className="text-gray-500">All your uploaded source materials in one place</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-50 px-6 py-3 rounded-2xl flex flex-col items-center border border-blue-100">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Files</span>
            <span className="text-2xl font-black text-blue-900">{sources.length}</span>
          </div>
          <div className="bg-sky-50 px-6 py-3 rounded-2xl flex flex-col items-center border border-sky-100">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Storage</span>
            <span className="text-2xl font-black text-sky-900">
              {formatSize(sources.reduce((acc, curr) => acc + (curr.size || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg border border-blue-50 overflow-hidden">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search by file name or notebook topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto hide-scrollbar">
            {['all', 'pdf', 'image', 'word'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap shrink-0 ${
                  filterType === t 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source, i) => (
            <motion.div
              key={source.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 bg-white border border-gray-100 rounded-3xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 p-0.5 shadow-lg group-hover:scale-110 transition-transform">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                    {source.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      {source.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {formatSize(source.size || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{source.uploadedAt ? new Date(source.uploadedAt).toLocaleDateString() : 'Unknown date'}</span>
                </div>
                <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  Source: {source.noteTitle}
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button 
                  onClick={() => alert('Viewing document detail... (Available in full version)')}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteSource(source.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSources.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">We couldn't find any documents matching your current criteria.</p>
            <button onClick={() => {setSearchTerm(''); setFilterType('all');}} className="mt-6 text-blue-600 font-bold hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Globe, Plus, Trash2, Zap, Save } from 'lucide-react';
import api from '../utils/api';

export default function ExtensionManager() {
  const [allowlist, setAllowlist] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchActivity();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings/allowlist');
      if (res.data.allowlist) setAllowlist(res.data.allowlist);
    } catch (err) {
      console.error('Failed to load extension settings:', err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await api.get('/api/activity');
      if (res.data.sessions) setSessions(res.data.sessions);
    } catch (err) {
      console.error('Failed to load extension activity:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/api/settings/allowlist', { allowlist });
      
      // Ping the deeply-integrated browser extension content.js 
      window.postMessage({ type: 'SYNC_EXTENSION_SETTINGS' }, '*');
      
      alert('Extension connection synchronized successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const performAdd = () => {
    let domain = newDomain.trim().toLowerCase();
    if (!domain) return;
    
    // Attempt basic cleanup to grab hostname
    try {
      if (domain.includes('http')) {
        domain = new URL(domain).hostname;
      }
      domain = domain.replace('www.', '');
    } catch(e) {}

    if (!allowlist.includes(domain)) {
      setAllowlist([...allowlist, domain]);
    }
    setNewDomain('');
  };

  const performRemove = (domain) => {
    setAllowlist(allowlist.filter(d => d !== domain));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="w-7 h-7 text-white" />
           </div>
           <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Extension Guard</h1>
              <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Focus Tracking & Access Control</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="/studypulse-extension.zip"
            download="StudyPulse-Extension.zip"
            className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 hover:text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all border border-slate-200 hover:border-indigo-100"
          >
            <Zap className="w-4 h-4" />
            Install Extension
          </a>
          
          <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Syncing...' : 'Save & Sync'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-1 space-y-6">
           {/* Status Information Panel */}
           <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <h2 className="text-xl font-black mb-2 relative z-10">How it works</h2>
             <p className="text-sm text-indigo-100/70 font-medium leading-relaxed relative z-10 mb-8">
                When <strong>Focus Mode</strong> is activated through the extension popup, deep work tracking begins. Any site <strong>not listed</strong> in your Allowlist will trigger the Guardian blocker.
             </p>
             
             <div className="space-y-4 relative z-10">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                   <ShieldCheck className="w-6 h-6 text-emerald-400" />
                   <div>
                     <p className="font-bold text-sm">Allowed Sites</p>
                     <p className="text-xs text-emerald-200/70">Time tracked optimally</p>
                   </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                   <ShieldAlert className="w-6 h-6 text-red-400" />
                   <div>
                     <p className="font-bold text-sm">Blocked Sites</p>
                     <p className="text-xs text-red-200/70">Redirected to Guardian</p>
                   </div>
                </div>
             </div>
           </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white rounded-[32px] border border-slate-200 p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-slate-900">Allowed Study Domains</h2>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg">{allowlist.length} Rules Active</span>
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                 <div className="flex-1 relative">
                    <Globe className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && performAdd()}
                      placeholder="e.g. coursera.org, linkedin.com, leetcode.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                 </div>
                 <button 
                   onClick={performAdd}
                   className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-colors"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                 {allowlist.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold">No domains allowed</p>
                      <p className="text-sm">Every site will be blocked in Focus Mode</p>
                   </div>
                 ) : (
                   allowlist.map((domain, index) => (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       key={index} 
                       className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 hover:shadow-sm transition-all"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                           <Globe className="w-4 h-4 text-slate-400" />
                         </div>
                         <span className="font-bold text-slate-700">{domain}</span>
                       </div>
                       <button 
                         onClick={() => performRemove(domain)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                         title="Remove Domain"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </motion.div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Session History Section */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <Zap className="w-5 h-5 text-amber-500" />
               <h2 className="text-xl font-black text-slate-900">Recent Tracking Logs</h2>
            </div>
            <button 
               onClick={fetchActivity}
               className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
            >
               Refresh Logs
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Domain</th>
                     <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Duration</th>
                     <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Date & Time</th>
                     <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {sessions.length === 0 ? (
                     <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                           No activity recorded yet. Activate Focus Mode in the extension to start tracking.
                        </td>
                     </tr>
                  ) : (
                     sessions.map((session, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 font-bold text-slate-700">{session.domain}</td>
                           <td className="py-4">
                              <span className="font-black text-indigo-600">
                                 {Math.floor(session.duration / 60)}m {Math.floor(session.duration % 60)}s
                              </span>
                           </td>
                           <td className="py-4 text-xs font-medium text-slate-500">
                              {new Date(session.timestamp).toLocaleString()}
                           </td>
                           <td className="py-4">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">
                                 Synced
                              </span>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

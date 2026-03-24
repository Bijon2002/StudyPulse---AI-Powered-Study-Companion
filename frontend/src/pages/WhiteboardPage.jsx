import { Palette, Share2, Info } from 'lucide-react';
import Whiteboard from '../components/Whiteboard';

export default function WhiteboardPage() {
  return (
    <div className="h-full min-h-[85vh] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Palette className="w-6 h-6 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personal Workspace</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Digital Infinite Canvas</p>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Auto-Saving Active</span>
           </div>
           <button 
             onClick={() => {
               navigator.clipboard.writeText("https://studypulse.app/invite/abc-123");
               alert("Collaboration Link copied to clipboard!");
             }}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
           >
              <Share2 className="w-4 h-4" />
              Collaborate
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden relative">
         <Whiteboard roomId="personal-workspace" />
      </div>
      
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
         <div className="shrink-0">
           <Info className="w-4 h-4 text-slate-400" />
         </div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Tip: Your personal workspace is persistent and private. Use it to sketch out complex concepts before sharing.
         </p>
      </div>
    </div>
  );
}

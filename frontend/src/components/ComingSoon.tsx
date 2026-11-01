import React from 'react';
import { Layers } from 'lucide-react';

export default function ComingSoon({ title, badge = 'MODUL ANALISIS' }: { title: string; badge?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#030712] text-white font-mono p-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
        <Layers className="w-8 h-8 text-cyan-400" />
      </div>
      <div className="px-3 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] text-cyan-400 font-bold mb-3 tracking-widest uppercase">
        {badge}
      </div>
      <h1 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">{title}</h1>
      <p className="text-gray-500 text-xs text-center max-w-md mb-6 leading-relaxed">
        Modul analitik intelijen ini sedang dalam tahap agregasi pipeline sensor dan data real-time.
      </p>
      <div className="px-4 py-2 border border-cyan-900/60 rounded-lg text-xs text-cyan-400 font-bold bg-[#040e24] shadow-inner tracking-wider">
        STATUS: SISTEM SEDANG DISIAPKAN
      </div>
    </div>
  );
}

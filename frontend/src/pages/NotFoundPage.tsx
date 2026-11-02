import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw, Shield, Radio, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#030816] text-white font-mono flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Animated Grid & Glow */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 text-center space-y-6">
        {/* Logo & Status Badge */}
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="World Monitor"
            className="w-16 h-16 object-contain mb-3 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/50 text-red-400 text-xs tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>ERROR STATUS CODE // 404</span>
          </div>
        </div>

        {/* 404 Large Display */}
        <div>
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-900 drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]">
            404
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-2">
            KOORDINAT NODE TIDAK DITEMUKAN
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mt-2 leading-relaxed">
            Halaman atau node telemetri yang Anda cari telah dipindahkan, dinonaktifkan, atau tidak pernah ada dalam basis data radar World Monitor.
          </p>
        </div>

        {/* System Diagnostic Box */}
        <div className="p-3.5 rounded-xl bg-[#060D20]/90 border border-cyan-900/50 text-left text-[11px] text-gray-400 space-y-1 shadow-2xl">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5 border-b border-cyan-900/40 pb-1.5 mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>DIAGNOSIS TELEMETRI SITUASIONAL</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>KODE KESALAHAN:</span>
            <span className="text-red-400 font-bold">ERR_RESOURCE_NOT_FOUND (404)</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>JARINGAN EDGE:</span>
            <span className="text-emerald-400 font-bold">ONLINE · CLOUDFLARE TIER-1</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>WAKTU LAPORAN:</span>
            <span className="text-gray-300">{new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider transition shadow-lg shadow-cyan-950/60 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>KEMBALI KE BERANDA</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black/60 hover:bg-cyan-950/50 border border-cyan-800/60 hover:border-cyan-400 text-cyan-300 text-xs font-bold tracking-wider transition cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>BUKA DASHBOARD</span>
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/70 border border-gray-800 text-gray-400 hover:text-white text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI</span>
          </button>
        </div>

        <div className="text-[10px] text-gray-600 pt-4">
          World Monitor Real-Time Global Intelligence · TLS 1.3 Secure Gateway
        </div>
      </div>
    </div>
  );
}

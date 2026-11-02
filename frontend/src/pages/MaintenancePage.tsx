import { useEffect, useState } from 'react';
import { Wrench, Clock, RefreshCw, Mail, ShieldAlert, Lock } from 'lucide-react';
import { isAdminAuthenticated } from '../lib/auth';

const HEALTH_URL = '/api/config'; // endpoint stabil untuk cek kesehatan server
const CHECK_EVERY_MS = 15_000;
const CONTACT_EMAIL = 'admin@jack-ai.my.id';

const pad = (n: number) => String(n).padStart(2, '0');

export default function MaintenancePage() {
  const [targetEnd, setTargetEnd] = useState(() => {
    const saved = localStorage.getItem('wm_maintenance_end');
    return saved ? parseInt(saved, 10) : Date.now() + 2 * 60 * 60 * 1000;
  });
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('wm_maintenance_title') || 'Lagi Maintenance');
  const [customMessage, setCustomMessage] = useState(() => localStorage.getItem('wm_maintenance_msg') || 'Kami lagi upgrade sistem telemetri & keamanan biar makin kenceng dan stabil. Bentar lagi balik kok!');

  const [left, setLeft] = useState(Math.max(0, targetEnd - Date.now()));
  const [checking, setChecking] = useState(false);
  const isAdmin = isAdminAuthenticated();

  // countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setLeft(Math.max(0, targetEnd - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [targetEnd]);

  const [checkStatusMsg, setCheckStatusMsg] = useState('');

  // auto-cek status live dari server (/api/maintenance)
  const check = async (isManualClick = false) => {
    setChecking(true);
    if (isManualClick) setCheckStatusMsg('');

    try {
      const res = await fetch('/api/maintenance', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Kalau admin sudah mematikan maintenance, langsung kembalikan pengunjung ke halaman utama!
        if (data.active === false) {
          localStorage.setItem('wm_maintenance_mode', 'false');
          window.location.href = '/';
          return;
        }

        if (data.title) setCustomTitle(data.title);
        if (data.message) setCustomMessage(data.message);
        if (data.endTime) setTargetEnd(data.endTime);

        if (isManualClick) {
          setCheckStatusMsg('⏳ Server masih dalam proses perbaikan/pemeliharaan. Harap tunggu sesuai hitungan mundur di atas.');
          setTimeout(() => setCheckStatusMsg(''), 5000);
        }
      } else {
        if (isManualClick) {
          setCheckStatusMsg('⏳ Server masih dalam pemeliharaan berkala.');
          setTimeout(() => setCheckStatusMsg(''), 5000);
        }
      }
    } catch {
      if (isManualClick) {
        setCheckStatusMsg('⏳ Server belum selesai perbaikan. Silakan cek beberapa saat lagi.');
        setTimeout(() => setCheckStatusMsg(''), 5000);
      }
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  };

  useEffect(() => {
    check(); // cek saat pertama kali dibuka
  }, []);

  useEffect(() => {
    const t = setInterval(check, CHECK_EVERY_MS);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);

  return (
    <div className="min-h-screen w-full bg-[#030816] flex items-center justify-center p-4 relative overflow-hidden font-mono select-none">
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Admin Bypass Pill (Hanya muncul jika admin sedang login) */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-bold transition shadow-lg shadow-cyan-950/50"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bypass ke Panel Admin →</span>
          </a>
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg text-center px-2">
        {/* Animated Wrench Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-6 shadow-2xl shadow-cyan-950/60 ring-1 ring-cyan-500/20">
          <Wrench className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[11px] font-mono text-amber-400 tracking-widest font-bold uppercase">
            SISTEM DALAM PEMELIHARAAN
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
          {customTitle}
        </h1>

        <p className="text-gray-400 mt-3 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          {customMessage}
        </p>

        {/* Countdown Box */}
        <div className="mt-8 bg-[#0A1029]/80 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-4">
            <Clock className="w-3.5 h-3.5" />
            Estimasi Selesai
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[
              { v: h, l: 'Jam' },
              { v: m, l: 'Menit' },
              { v: s, l: 'Detik' },
            ].map(({ v, l }) => (
              <div key={l} className="w-20 sm:w-24 py-3 sm:py-3.5 rounded-xl bg-black/60 border border-cyan-900/50 shadow-inner">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-wider">
                  {pad(v)}
                </div>
                <div className="text-[10px] font-mono text-cyan-500/80 uppercase mt-1 font-semibold">
                  {l}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => check(true)}
            disabled={checking}
            className="mt-6 w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm tracking-wide transition shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Memeriksa status...' : 'Cek Status Sekarang'}</span>
          </button>

          {/* Status Alert Pemberitahuan Saat Belum Selesai Perbaikan */}
          {checkStatusMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs text-center font-mono animate-fadeIn">
              {checkStatusMsg}
            </div>
          )}

          <p className="text-[10px] font-mono text-gray-500 mt-3">
            Halaman ini otomatis reload saat server kembali beroperasi normal.
          </p>
        </div>

        {/* Footer Contact */}
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-cyan-300 transition"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-500" />
            <span>{CONTACT_EMAIL}</span>
          </a>
          <span className="text-[10px] text-gray-600 font-mono">
            World Monitor Intelligence Platform
          </span>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { User, Shield, LogOut, LayoutDashboard, ExternalLink } from 'lucide-react';
import { isAdminAuthenticated, removeAdminCookie } from '../lib/auth';

export default function AdminProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLogged(isAdminAuthenticated());

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLogged) return null;

  const handleLogout = () => {
    removeAdminCookie();
    setIsLogged(false);
    window.location.href = '/auth/admin';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#081226] border border-cyan-700/60 hover:border-cyan-400 text-white transition shadow-md shadow-cyan-950/40"
        title="Admin Control Profile"
      >
        <img
          src="/admin-shield-logo.png"
          alt="Admin Shield Logo"
          className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]"
        />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] font-mono font-bold leading-none text-cyan-300">Admin Jack</span>
          <span className="text-[9px] font-mono text-gray-400 leading-tight">Superadmin</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#081226] border border-cyan-800/80 shadow-2xl shadow-black/80 z-50 overflow-hidden font-mono text-xs">
          {/* Header Info */}
          <div className="p-3 bg-gradient-to-b from-cyan-950/50 to-transparent border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Session Admin (7 Hari)</span>
            </div>
            <div className="text-[11px] text-cyan-300 font-bold mt-1 truncate">
              admin@jack-ai.my.id
            </div>
            <div className="text-[9px] text-emerald-400 mt-0.5">
              ● Akses Root / Superadmin Aktif
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-1">
            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-cyan-950/60 transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold">Web Utama</div>
                <div className="text-[10px] text-gray-400">Kembali ke halaman monitoring</div>
              </div>
            </a>

            <a
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-cyan-950/60 transition"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold">Panel Admin</div>
                <div className="text-[10px] text-gray-400">Kontrol sistem, maintenance & server</div>
              </div>
            </a>

            <a
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-200 hover:text-white hover:bg-cyan-950/60 transition"
            >
              <User className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-bold">Pengaturan Akun</div>
                <div className="text-[10px] text-gray-400">Ganti nama, email & password</div>
              </div>
            </a>
          </div>

          {/* Logout Action */}
          <div className="p-1.5 border-t border-cyan-900/40 bg-black/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

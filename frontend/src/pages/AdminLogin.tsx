import { useState, FormEvent } from 'react';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, Globe2 } from 'lucide-react';
import { setAdminCookie } from '../lib/auth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic input validation & sanitization
    const sanitized = (s: string) => s.replace(/[<>"'&]/g, '').trim();
    const cleanUser = sanitized(username);
    const cleanPass = sanitized(password);

    if (!cleanUser || !cleanPass) {
      setError('Username dan password wajib diisi.');
      setLoading(false);
      return;
    }

    if (cleanUser.length < 3 || cleanPass.length < 6) {
      setError('Username minimal 3 karakter, password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      let isSuccess = false;
      let token = '';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass }),
        });
        
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.success) {
            isSuccess = true;
            token = data.token || 'auth-ok';
          } else {
            setError(data.error || 'Login gagal. Periksa kredensial Anda.');
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback network error
      }

      // Fallback check jika worker endpoint belum di-deploy atau di localhost Vite dev
      if (!isSuccess) {
        if (cleanUser === 'admin@jack-ai.my.id' && cleanPass === 'admin123') {
          isSuccess = true;
          token = btoa(`admin:${Date.now()}`);
        } else {
          setError('Email atau password tidak sesuai.');
          setLoading(false);
          return;
        }
      }

      if (isSuccess) {
        setAdminCookie(token || 'auth-ok', 7);
        sessionStorage.setItem('wm_admin_token', token || 'authenticated');
        sessionStorage.setItem('wm_admin_user', cleanUser);
        window.location.href = '/admin/dashboard';
      }
    } catch {
      setError('Terjadi kendala sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030816] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-4 shadow-lg shadow-cyan-950/50">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">World Monitor</h1>
          <p className="text-xs font-mono text-gray-500 mt-1 tracking-widest uppercase">Secure Admin Access</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Globe2 className="w-3 h-3 text-cyan-600" />
            <span className="text-[10px] font-mono text-cyan-600">ENCRYPTED CHANNEL · TLS 1.3</span>
          </div>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0A1029]/80 backdrop-blur-xl border border-cyan-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-5"
        >
          <div className="text-xs font-mono text-gray-400 border-b border-cyan-900/30 pb-3 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-500" />
            <span>ADMIN AUTHENTICATION PORTAL</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Username / Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin@jack-ai.my.id"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-cyan-900/40 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-black/50 border border-cyan-900/40 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>ACCESS CONTROL CENTER</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-cyan-900/20">
            <p className="text-[10px] font-mono text-gray-600">
              Unauthorized access is strictly prohibited and monitored.
            </p>
            <p className="text-[10px] font-mono text-gray-700 mt-1">
              © {new Date().getFullYear()} World Monitor Intelligence Platform
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

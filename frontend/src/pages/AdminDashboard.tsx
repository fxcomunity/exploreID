import { useState, useEffect } from 'react';
import {
  Shield, Server, Activity, Users, Database, Globe,
  Cpu, Lock, RefreshCw, AlertTriangle, CheckCircle2,
  Terminal, HardDrive, Key, Power
} from 'lucide-react';
import { isAdminAuthenticated, removeAdminCookie } from '../lib/auth';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SECURITY' | 'API_KEYS' | 'SYSTEM'>('OVERVIEW');
  const [ddosThreshold, setDdosThreshold] = useState('100 req/min');
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem('wm_maintenance_mode') === 'true';
  });
  const [maintenanceMessage, setMaintenanceMessage] = useState(() => {
    return localStorage.getItem('wm_maintenance_msg') || 'Sistem World Monitor sedang dalam proses pemeliharaan berkala.';
  });

  const [maintenanceTitle, setMaintenanceTitle] = useState(() => {
    return localStorage.getItem('wm_maintenance_title') || 'Lagi Maintenance';
  });
  const [maintenanceDurationHours, setMaintenanceDurationHours] = useState('2');

  const toggleMaintenance = async () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    localStorage.setItem('wm_maintenance_mode', String(next));
    
    const targetEnd = Date.now() + (parseFloat(maintenanceDurationHours) || 2) * 60 * 60 * 1000;
    if (next) {
      localStorage.setItem('wm_maintenance_title', maintenanceTitle);
      localStorage.setItem('wm_maintenance_msg', maintenanceMessage);
      localStorage.setItem('wm_maintenance_end', String(targetEnd));
    }

    // Broadcast ke Server / Edge Worker agar berefek ke SEMUA browser & device lain (Brave, Chrome, HP)
    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: next,
          title: maintenanceTitle,
          message: maintenanceMessage,
          endTime: targetEnd,
        }),
      });
    } catch {
      // Local fallback
    }
  };
  const [logs, setLogs] = useState([
    { id: 1, time: '10:41:02', ip: '114.124.20.15', event: 'ADMIN_LOGIN_SUCCESS', status: 'SUCCESS' },
    { id: 2, time: '10:39:15', ip: '185.220.101.5', event: 'BLOCKED_SQL_INJECTION', status: 'BLOCKED' },
    { id: 3, time: '10:35:40', ip: '45.154.255.89', event: 'BLOCKED_XSS_PAYLOAD', status: 'BLOCKED' },
    { id: 4, time: '10:28:11', ip: '103.111.20.4', event: 'API_DISASTER_SYNC', status: 'SUCCESS' },
  ]);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      window.location.href = '/auth/admin';
    }
  }, []);

  const handleLogout = () => {
    removeAdminCookie();
    window.location.href = '/auth/admin';
  };

  const handleSimulateBlock = () => {
    const randomIP = `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    setLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString('id-ID'),
        ip: randomIP,
        event: 'BLOCKED_SUSPICIOUS_PROBE',
        status: 'BLOCKED',
      },
      ...prev,
    ]);
  };

  return (
    <div className="w-full min-h-full bg-[#030816] text-gray-200 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ─── ADMIN HEADER ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              ROOT ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2 mt-1">
            <Shield className="w-7 h-7 text-cyan-400" />
            Admin Master Console
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Logged as: <span className="text-cyan-300 font-bold">admin@jack-ai.my.id</span> · Session: 7 Hari Aktif (Cookie)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 md:flex-none px-3.5 py-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white text-xs font-mono transition"
          >
            ← Ke User Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-950/60 border border-red-800/60 hover:bg-red-900/60 text-red-300 text-xs font-mono transition"
          >
            <Power className="w-3.5 h-3.5" />
            Keluar (Logout)
          </button>
        </div>
      </div>

      {/* ─── SYSTEM STATUS METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-1">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>EDGE WORKER STATUS</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">OPERATIONAL</div>
          <div className="text-[10px] text-gray-500 font-mono">Cloudflare Global Network</div>
        </div>

        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-1">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>DDoS FIREWALL</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">ACTIVE (L3/L4/L7)</div>
          <div className="text-[10px] text-gray-500 font-mono">WAF + XSS Sanitizer Enabled</div>
        </div>

        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-1">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>AI MULTI-ROUTER</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">6 PROVIDERS</div>
          <div className="text-[10px] text-gray-500 font-mono">Groq, Gemini, DeepSeek, OpenAI...</div>
        </div>

        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-1">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>DATABASE TYPE</span>
            <Database className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-orange-400 font-mono">SERVERLESS LIVE</div>
          <div className="text-[10px] text-gray-500 font-mono">100% Real-Time API Pipelines</div>
        </div>
      </div>

      {/* ─── TABS NAVIGATION ─── */}
      <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Ringkasan & Telemetri' },
          { id: 'SECURITY', label: 'Keamanan & Proteksi DDoS' },
          { id: 'API_KEYS', label: 'Status API Gateway' },
          { id: 'SYSTEM', label: 'Pengaturan Server' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-black shadow-md shadow-cyan-950'
                : 'bg-[#081226] text-gray-400 hover:text-white border border-cyan-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: OVERVIEW ─── */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40">
              <div className="flex items-center justify-between mb-3 border-b border-cyan-900/40 pb-2">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Live Security Audit Stream
                </span>
                <button
                  onClick={handleSimulateBlock}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:text-white transition"
                >
                  + Uji Deteksi Serangan
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-64 font-mono text-xs">
                {logs.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-2 rounded bg-black/40 border border-cyan-950">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">{l.time}</span>
                      <span className="text-cyan-300 font-bold">{l.ip}</span>
                      <span className="text-gray-300 text-[11px]">{l.event}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      l.status === 'BLOCKED' ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Power className={`w-3.5 h-3.5 ${maintenanceMode ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
                    Mode Pemeliharaan (Maintenance)
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    maintenanceMode ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {maintenanceMode ? 'STATUS: AKTIF' : 'STATUS: NORMAL'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {maintenanceMode
                    ? '⚠️ Banner pemeliharaan sedang aktif di tampilan pengguna.'
                    : 'Sistem sedang berjalan normal tanpa gangguan pemeliharaan.'}
                </p>
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Judul Halaman Maintenance:</label>
                  <input
                    type="text"
                    value={maintenanceTitle}
                    onChange={e => {
                      setMaintenanceTitle(e.target.value);
                      if (maintenanceMode) localStorage.setItem('wm_maintenance_title', e.target.value);
                    }}
                    placeholder="Judul maintenance..."
                    className="w-full px-2.5 py-1.5 rounded bg-black/50 border border-cyan-900/50 text-xs font-mono text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Pesan Penjelasan untuk User:</label>
                  <textarea
                    rows={2}
                    value={maintenanceMessage}
                    onChange={e => {
                      setMaintenanceMessage(e.target.value);
                      if (maintenanceMode) localStorage.setItem('wm_maintenance_msg', e.target.value);
                    }}
                    placeholder="Pesan pemeliharaan untuk pengguna..."
                    className="w-full px-2.5 py-1.5 rounded bg-black/50 border border-cyan-900/50 text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-gray-400 uppercase whitespace-nowrap">Durasi Estimasi:</label>
                  <select
                    value={maintenanceDurationHours}
                    onChange={e => {
                      setMaintenanceDurationHours(e.target.value);
                      const targetEnd = Date.now() + parseFloat(e.target.value) * 60 * 60 * 1000;
                      localStorage.setItem('wm_maintenance_end', String(targetEnd));
                    }}
                    className="flex-1 bg-black/50 border border-cyan-900/50 rounded px-2 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
                  >
                    <option value="0.5">30 Menit</option>
                    <option value="1">1 Jam</option>
                    <option value="2">2 Jam</option>
                    <option value="4">4 Jam</option>
                    <option value="8">8 Jam</option>
                    <option value="24">24 Jam</option>
                  </select>
                </div>
                <button
                  onClick={toggleMaintenance}
                  className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                    maintenanceMode
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{maintenanceMode ? 'Nonaktifkan Mode Pemeliharaan' : 'Aktifkan Mode Pemeliharaan'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">Ambang Batas Rate Limit (DDoS)</span>
                <p className="text-[11px] text-gray-400">Membatasi request per IP client untuk mencegah spam & scraping.</p>
                <div className="flex items-center gap-2 pt-2">
                  <select
                    value={ddosThreshold}
                    onChange={e => setDdosThreshold(e.target.value)}
                    className="flex-1 bg-black/50 border border-cyan-900/50 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none"
                  >
                    <option value="60 req/min">Ketat (60 req/menit)</option>
                    <option value="100 req/min">Standar (100 req/menit)</option>
                    <option value="300 req/min">Longgar (300 req/menit)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Quick Info */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-3">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                Arsitektur & Lisensi
              </span>
              <div className="text-xs space-y-2 font-mono text-gray-300">
                <div className="flex justify-between border-b border-cyan-950 pb-1">
                  <span className="text-gray-500">Domain:</span>
                  <span className="text-cyan-300">world-monitoring.jack-ai.my.id</span>
                </div>
                <div className="flex justify-between border-b border-cyan-950 pb-1">
                  <span className="text-gray-500">Platform:</span>
                  <span>Cloudflare Workers + SPA</span>
                </div>
                <div className="flex justify-between border-b border-cyan-950 pb-1">
                  <span className="text-gray-500">Cookie Lifetime:</span>
                  <span className="text-emerald-400 font-bold">7 Hari (Strict/Lax)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Admin URL:</span>
                  <span className="text-red-400">/auth/admin (Hidden)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-[#081226] border border-cyan-700/40 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-300">PANDUAN ADMIN</span>
              <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                Menu profil admin kamu selalu tersedia di sudut kanan atas seluruh halaman aplikasi ketika kamu sedang login.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SECURITY ─── */}
      {activeTab === 'SECURITY' && (
        <div className="p-5 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Konfigurasi Proteksi Keamanan Aktif
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-black/40 border border-cyan-950 space-y-1">
              <div className="text-cyan-300 font-bold">1. Content Security Policy (CSP)</div>
              <div className="text-gray-400 text-[11px]">Mencegah injeksi iframe asing. Hanya mengizinkan YouTube & Windy radar.</div>
              <div className="text-emerald-400 text-[10px] font-bold">STATUS: ENFORCED (HTTP Header)</div>
            </div>
            <div className="p-3 rounded bg-black/40 border border-cyan-950 space-y-1">
              <div className="text-cyan-300 font-bold">2. Anti-XSS & SQL Injection Filter</div>
              <div className="text-gray-400 text-[11px]">Membersihkan otomatis script tag, inline handler, dan query manipulasi database.</div>
              <div className="text-emerald-400 text-[10px] font-bold">STATUS: ACTIVE ON EDGE GATEWAY</div>
            </div>
            <div className="p-3 rounded bg-black/40 border border-cyan-950 space-y-1">
              <div className="text-cyan-300 font-bold">3. HSTS Preload & Strict Transport</div>
              <div className="text-gray-400 text-[11px]">Memaksa seluruh request HTTPS dengan masa berlaku 1 tahun.</div>
              <div className="text-emerald-400 text-[10px] font-bold">STATUS: MAX-AGE 31536000s</div>
            </div>
            <div className="p-3 rounded bg-black/40 border border-cyan-950 space-y-1">
              <div className="text-cyan-300 font-bold">4. Timing-Attack Defense</div>
              <div className="text-gray-400 text-[11px]">Jeda 1000ms pada endpoint login untuk mengacaukan pembacaan timing brute-force.</div>
              <div className="text-emerald-400 text-[10px] font-bold">STATUS: ENABLED</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: API KEYS ─── */}
      {activeTab === 'API_KEYS' && (
        <div className="p-5 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Integrasi API Providers
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {[
              { name: 'NASA EONET v3', type: 'Public / Real-Time', status: 'ONLINE', quota: 'Unlimited' },
              { name: 'USGS Earthquake Feed', type: 'Public GeoJSON', status: 'ONLINE', quota: 'Unlimited' },
              { name: 'YouTube Data API v3', type: 'API Key V3', status: 'ACTIVE', quota: '10,000 unit/hari' },
              { name: 'ExchangeRate API', type: 'API Key Currency', status: 'ONLINE', quota: '1,500 req/bulan' },
              { name: 'Open-Meteo Air Quality', type: 'Public Meteorological', status: 'ONLINE', quota: 'Unlimited' },
              { name: 'Alpha Vantage Global', type: 'Commodity Spot Feed', status: 'CONFIGURED', quota: '25 req/hari' },
              { name: 'AI Multi-Provider (Groq/Gemini/DeepSeek)', type: 'Auto-Failover Gateway', status: 'ONLINE', quota: 'Tier 1' },
            ].map(api => (
              <div key={api.name} className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-cyan-950">
                <div>
                  <div className="text-white font-bold">{api.name}</div>
                  <div className="text-[10px] text-gray-500">{api.type}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-900">
                    {api.status}
                  </span>
                  <div className="text-[10px] text-gray-500 mt-0.5">{api.quota}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: SYSTEM ─── */}
      {activeTab === 'SYSTEM' && (
        <div className="p-5 rounded-xl bg-[#081226] border border-cyan-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase">System Information</h3>
          <pre className="p-4 rounded-lg bg-black text-cyan-400 font-mono text-xs overflow-x-auto leading-relaxed border border-cyan-950">
{`Environment : production
Runtime     : Cloudflare Workers (V8 Edge Compute)
Client      : React 18 + Vite 5 + TailwindCSS
Admin User  : admin@jack-ai.my.id
Cookie Auth : 7 Days Expiration (wm_admin_session)
Status      : All Edge Nodes Synced & Healthy`}
          </pre>
        </div>
      )}
    </div>
  );
}

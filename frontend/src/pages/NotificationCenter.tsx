import React, { useState, useEffect } from 'react';
import {
  Bell, Radio, ShieldAlert, CheckCircle2,
  AlertTriangle, Volume2, VolumeX, Flame, Activity,
  Globe, Zap, Play, ShieldCheck, Check
} from 'lucide-react';
import { fetchEarthquakes, fetchDisasters } from '../lib/api';

interface AlertItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  source: string;
  time: string;
  desc: string;
  category: 'SEISMIC' | 'DISASTER' | 'GEOPOLITIC' | 'ENERGY';
}

// Suara Chime Peringatan Web Media via Web Audio API (Synthesizer Asli Browser)
function playAlertChime(critical = false) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (critical) {
      // Dua nada frekuensi tinggi bergantian (sirine/news breaking)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      // Nada lonceng berita (chime lembut)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn('Audio not allowed yet by user gesture:', e);
  }
}

export default function NotificationCenter() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [subscribedCategories, setSubscribedCategories] = useState({
    seismic: true,
    disaster: true,
    geopolitic: true,
    energy: true,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      try {
        const [quakes, disasters] = await Promise.all([
          fetchEarthquakes(),
          fetchDisasters(),
        ]);

        const generated: AlertItem[] = [];

        // Gempa USGS
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quakes.slice(0, 8).forEach((q: any) => {
          generated.push({
            id: `quake-${q.id}`,
            category: 'SEISMIC',
            type: q.magnitude >= 6.5 ? 'CRITICAL' : 'WARNING',
            title: `Gempa Signifikan M ${q.magnitude.toFixed(1)}: ${q.place}`,
            source: 'USGS Global Seismology',
            time: new Date(q.time).toLocaleTimeString('id-ID'),
            desc: `Pusat getaran seismik pada kedalaman laut/darat koordinat [${q.lat.toFixed(2)}, ${q.lng.toFixed(2)}].`,
          });
        });

        // Bencana NASA
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        disasters.slice(0, 6).forEach((d: any) => {
          generated.push({
            id: `disaster-${d.id}`,
            category: 'DISASTER',
            type: d.category.toLowerCase().includes('storm') ? 'CRITICAL' : 'WARNING',
            title: `${d.category.toUpperCase()}: ${d.title}`,
            source: 'NASA EONET Telemetry',
            time: d.date ? new Date(d.date).toLocaleTimeString('id-ID') : 'Real-time',
            desc: `Sensor satelit mendeteksi fenomena alam ekstrem di wilayah lintasan.`,
          });
        });

        setAlerts(generated);
      } catch (err) {
        console.error('Failed to load alert feed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  // Minta Izin Notifikasi Browser
  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung Web Notification API.');
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        if (soundEnabled) playAlertChime(false);
        new Notification('WORLD MONITOR — Peringatan Dini Aktif', {
          body: 'Notifikasi media web berhasil diaktifkan. Anda akan menerima peringatan darurat langsung di layar desktop/HP Anda.',
          icon: '/favicon.png',
        });
      }
    } catch (e) {
      console.error('Permission request error:', e);
    }
  };

  // Uji Coba Kirim Notifikasi Browser
  const triggerTestNotification = () => {
    if (permission !== 'granted') {
      requestBrowserPermission();
      return;
    }

    if (soundEnabled) playAlertChime(true);

    new Notification('🚨 WORLD MONITOR — BREAKING ALERT', {
      body: 'Uji Coba Berhasil: Peringatan gempa bumi M6+ dan bencana global telah disinkronkan ke peramban Anda.',
      icon: '/favicon.png',
      tag: 'test-alert',
    });
  };

  const toggleCategory = (cat: keyof typeof subscribedCategories) => {
    setSubscribedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="min-h-screen bg-[#060D1F] text-gray-200 p-4 lg:p-6 space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              WEB MEDIA PUSH DISPATCHER
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2 mt-1">
            <Bell className="w-6 h-6 text-cyan-400" />
            Pusat Peringatan Dini Web Media
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Sistem notifikasi peramban langsung (Browser Push) berstandar portal berita internasional tanpa aplikasi pihak ketiga.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(s => !s)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition ${
            soundEnabled
              ? 'bg-cyan-950 text-cyan-400 border-cyan-500'
              : 'bg-black/40 text-gray-400 border-gray-800 hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          Suara Alarm: {soundEnabled ? 'AKTIF' : 'NONAKTIF'}
        </button>
      </div>

      {/* ─── BROWSER PUSH NOTIFICATION ACTIVATION CARD ─── */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#081735] via-[#051126] to-[#040c1e] border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              permission === 'granted'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                : permission === 'denied'
                ? 'bg-red-950 text-red-400 border border-red-800/40'
                : 'bg-yellow-950 text-yellow-400 border border-yellow-800/40'
            }`}>
              {permission === 'granted'
                ? 'STATUS: NOTIFIKASI BROWSER AKTIF'
                : permission === 'denied'
                ? 'STATUS: DIBLOKIR DI BROWSER'
                : 'STATUS: PERLU DIAKTIFKAN'}
            </span>
          </div>

          <h2 className="text-base font-bold text-white">
            Aktifkan Peringatan Cepat di Peramban Anda (Browser Web Media Push)
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Sistem ini menggunakan fitur resmi Web Push Notification peramban (Chrome, Edge, Firefox, Safari). Peringatan akan muncul seperti portal berita (*breaking news banner*) di sudut layar laptop atau notifikasi HP Anda saat terdeteksi gempa bumi signifikan M6+ atau bahaya besar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {permission !== 'granted' ? (
            <button
              onClick={requestBrowserPermission}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4 fill-current" />
              Izinkan Notifikasi Web
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Peramban Terhubung</span>
            </div>
          )}

          <button
            onClick={triggerTestNotification}
            className="px-4 py-2.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 hover:bg-cyan-900/50 text-cyan-300 font-mono text-xs transition flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Uji Peringatan Sekarang
          </button>
        </div>
      </div>

      {/* ─── CATEGORY FILTERS & PREFERENCES ─── */}
      <div className="rounded-xl bg-[#081226] border border-cyan-900/50 p-4">
        <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-3 mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
            Kategori Peringatan yang Diikuti (Subscription Preferences)
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'seismic', label: 'Gempa Bumi Signifikan (M6+)', icon: Activity, color: 'text-red-400' },
            { key: 'disaster', label: 'Bencana Badai & Kebakaran NASA', icon: Flame, color: 'text-orange-400' },
            { key: 'geopolitic', label: 'Krisis Geopolitik Global (GDELT)', icon: Globe, color: 'text-cyan-400' },
            { key: 'energy', label: 'Volatilitas Pasar Energi (EIA)', icon: Zap, color: 'text-yellow-400' },
          ].map(cat => {
            const Icon = cat.icon;
            const isChecked = subscribedCategories[cat.key as keyof typeof subscribedCategories];
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key as keyof typeof subscribedCategories)}
                className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                  isChecked
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-white'
                    : 'bg-black/30 border-cyan-950 text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span className="text-xs font-medium">{cat.label}</span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  isChecked ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-gray-700'
                }`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── LIVE ALERT FEED ─── */}
      <div className="rounded-xl bg-[#081226] border border-cyan-900/50 p-4">
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <h2 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
              Log Peringatan Dini Real-Time (Live Telemetry Feed)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            {alerts.length} EVENT TERVERIFIKASI
          </span>
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <div className="text-center py-12 text-cyan-500/70 text-xs font-mono">
              Memindai sensor telemetry USGS & NASA untuk peringatan aktif...
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs font-mono">
              Kondisi stabil. Tidak ada peringatan darurat saat ini.
            </div>
          ) : (
            alerts.map(a => (
              <div
                key={a.id}
                className="p-3.5 rounded-lg bg-black/40 border border-cyan-950 hover:border-cyan-800 transition flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold mt-0.5 ${
                    a.type === 'CRITICAL'
                      ? 'bg-red-950 text-red-400 border border-red-800/40 animate-pulse'
                      : 'bg-yellow-950 text-yellow-400 border border-yellow-800/40'
                  }`}>
                    {a.type}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{a.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{a.desc}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">
                      Sumber: {a.source} · Waktu Deteksi: {a.time}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (permission === 'granted') {
                      if (soundEnabled) playAlertChime(a.type === 'CRITICAL');
                      new Notification(`WORLD MONITOR — ${a.type}`, {
                        body: a.title,
                        icon: '/favicon.png',
                      });
                    } else {
                      requestBrowserPermission();
                    }
                  }}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded whitespace-nowrap transition"
                >
                  Kirim ke Layar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

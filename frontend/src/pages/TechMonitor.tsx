import React, { useState } from 'react';
import {
  Cpu, Rocket, Radio, Sparkles, ExternalLink,
  Layers, RefreshCw, Zap, ShieldCheck
} from 'lucide-react';

const SPACE_LAUNCHES = [
  {
    mission: 'Starlink Group 10-14',
    provider: 'SpaceX (Falcon 9)',
    site: 'Cape Canaveral SLC-40',
    status: 'TERJADWAL',
    date: '3 November 2026',
    payload: 'Konstelasi Satelit Internet Orbit Rendah (LEO)',
  },
  {
    mission: 'Artemis II Lunar Prep',
    provider: 'NASA / Boeing / Lockheed (SLS)',
    site: 'Kennedy Space Center LC-39B',
    status: 'INTEGRASI UJI',
    date: 'Desember 2026',
    payload: 'Misi Berawak Mengitari Bulan (Orion Spacecraft)',
  },
  {
    mission: 'Ariane 6 Commercial Flight',
    provider: 'Arianespace (ESA)',
    site: 'Kourou ELA-4, French Guiana',
    status: 'SIAP LUNCUR',
    date: 'November 2026',
    payload: 'Satelit Observasi Bumi Optik Copernicus Sentinel',
  },
  {
    mission: 'Chandrayaan-4 Sample Return Phase',
    provider: 'ISRO (LVM3)',
    site: 'Satish Dhawan Space Centre',
    status: 'FASE PENGEMBANGAN',
    date: '2027',
    payload: 'Pengambilan Sampel Batuan Kutub Selatan Bulan',
  },
];

const SEMICONDUCTOR_LEADERS = [
  { name: 'NVIDIA Corporation', ticker: 'NVDA', tech: 'AI Accelerator (Blackwell / Rubin)', marketShare: '88% AI GPU' },
  { name: 'TSMC (Taiwan Semi)', ticker: 'TSM', tech: 'Node 2nm GAA & 3nm FinFET', marketShare: '61% Foundry Global' },
  { name: 'ASML Holding', ticker: 'ASML', tech: 'High-NA EUV Lithography (0.55 NA)', marketShare: '100% Extreme UV' },
  { name: 'Samsung Electronics', ticker: '005930.KS', tech: 'HBM3e / HBM4 Memory Stack', marketShare: '42% DRAM Global' },
  { name: 'Qualcomm & Arm', ticker: 'QCOM / ARM', tech: 'Nuvia Oryon & AI PC Cores', marketShare: '90% Mobile Architecture' },
];

export default function TechMonitor() {
  return (
    <div className="min-h-screen bg-[#060D1F] text-gray-200 p-4 lg:p-6 space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyan-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              FRONTIER TECH & AEROSPACE TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2 mt-1">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Technology & Science Monitor
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Peluncuran misi antariksa global, peta rantai pasok semikonduktor AI, & perkembangan komputasi kuantum.
          </p>
        </div>
      </div>

      {/* ─── KPIS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40">
          <div className="text-[11px] font-mono text-gray-400">PELUNCURAN AKTIF BULAN INI</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1 flex items-center justify-between">
            18 Misi
            <Rocket className="w-5 h-5 text-cyan-500/40" />
          </div>
          <div className="text-[10px] text-gray-500 mt-1">NASA, SpaceX, ESA, ISRO</div>
        </div>

        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40">
          <div className="text-[11px] font-mono text-gray-400">NODE LITOGRAFI PALING CANGGIH</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">2 Nanometer</div>
          <div className="text-[10px] text-gray-500 mt-1">TSMC N2 GAAFET Node</div>
        </div>

        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40">
          <div className="text-[11px] font-mono text-gray-400">TOTAL SATELIT AKTIF (ORBIT)</div>
          <div className="text-2xl font-bold text-yellow-400 font-mono mt-1">~10.450</div>
          <div className="text-[10px] text-gray-500 mt-1">Orbit Bumi Rendah (LEO)</div>
        </div>

        <div className="p-4 rounded-xl bg-[#081226] border border-cyan-900/40">
          <div className="text-[11px] font-mono text-gray-400">STATUS AKSELERASI AI</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">HIGH SPEED</div>
          <div className="text-[10px] text-gray-500 mt-1">Infrastruktur komputasi global</div>
        </div>
      </div>

      {/* ─── UPCOMING SPACE LAUNCHES ─── */}
      <div className="rounded-xl bg-[#081226] border border-cyan-900/50 p-4">
        <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-3 mb-4">
          <Rocket className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
            Jadwal Peluncuran Misi Antariksa Strategis Dunia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPACE_LAUNCHES.map(l => (
            <div
              key={l.mission}
              className="p-3.5 rounded-lg bg-black/40 border border-cyan-950 hover:border-cyan-800 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">{l.mission}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                    {l.status}
                  </span>
                </div>
                <div className="text-[11px] text-cyan-500 font-mono mt-1">{l.provider} · {l.site}</div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">{l.payload}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-cyan-950 text-[10px] font-mono text-gray-500 flex justify-between">
                <span>Jadwal Peluncuran:</span>
                <span className="text-cyan-300">{l.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SEMICONDUCTOR MONOPOLY INDEX ─── */}
      <div className="rounded-xl bg-[#081226] border border-cyan-900/50 p-4">
        <div className="flex items-center gap-2 border-b border-cyan-900/40 pb-3 mb-4">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
            Rantai Pasok Semikonduktor & Hardware AI Global
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase text-gray-500 bg-black/30 border-b border-cyan-950">
              <tr>
                <th className="py-2.5 px-3">Korporasi</th>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Teknologi Kunci</th>
                <th className="py-2.5 px-3">Pangsa Pasar Strategis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/50">
              {SEMICONDUCTOR_LEADERS.map(s => (
                <tr key={s.ticker} className="hover:bg-cyan-950/20 transition">
                  <td className="py-2.5 px-3 font-bold text-white">{s.name}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{s.ticker}</td>
                  <td className="py-2.5 px-3 text-gray-300">{s.tech}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{s.marketShare}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

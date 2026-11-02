import { useState } from 'react';
import { Activity, RefreshCw, Download, Shield, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

/** Convert ISO 3166-1 alpha-2 code to flag emoji */
const getFlagEmoji = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));

type Status = 'Stable' | 'Unstable' | 'Neutral';

interface Country {
  name: string;
  code: string;
  status: Status;
  score: number;
  region: string;
}

const countries: Country[] = [
  { name: 'Indonesia', code: 'ID', status: 'Stable', score: 0.72, region: 'Asia Tenggara' },
  { name: 'India', code: 'IN', status: 'Stable', score: 0.65, region: 'Asia Selatan' },
  { name: 'Amerika Serikat', code: 'US', status: 'Stable', score: 0.81, region: 'Amerika Utara' },
  { name: 'Rusia', code: 'RU', status: 'Unstable', score: -0.54, region: 'Eropa Timur' },
  { name: 'China', code: 'CN', status: 'Neutral', score: 0.12, region: 'Asia Timur' },
  { name: 'Brasil', code: 'BR', status: 'Stable', score: 0.58, region: 'Amerika Selatan' },
  { name: 'Suriah', code: 'SY', status: 'Unstable', score: -0.92, region: 'Timur Tengah' },
  { name: 'Afghanistan', code: 'AF', status: 'Unstable', score: -0.88, region: 'Asia Tengah' },
  { name: 'Denmark', code: 'DK', status: 'Stable', score: 0.90, region: 'Eropa Utara' },
  { name: 'Jerman', code: 'DE', status: 'Stable', score: 0.77, region: 'Eropa Tengah' },
  { name: 'Nigeria', code: 'NG', status: 'Unstable', score: -0.41, region: 'Afrika Barat' },
  { name: 'Ukraina', code: 'UA', status: 'Unstable', score: -0.67, region: 'Eropa Timur' },
  { name: 'Kanada', code: 'CA', status: 'Stable', score: 0.84, region: 'Amerika Utara' },
  { name: 'Australia', code: 'AU', status: 'Stable', score: 0.79, region: 'Oceania' },
  { name: 'Iran', code: 'IR', status: 'Unstable', score: -0.55, region: 'Asia Barat' },
  { name: 'Malawi', code: 'MW', status: 'Unstable', score: -0.38, region: 'Afrika Selatan' },
  { name: 'Albania', code: 'AL', status: 'Neutral', score: 0.20, region: 'Eropa Selatan' },
  { name: 'Angola', code: 'AO', status: 'Unstable', score: -0.30, region: 'Afrika Tengah' },
  { name: 'Tunisia', code: 'TN', status: 'Unstable', score: -0.22, region: 'Afrika Utara' },
];

const stableCount = countries.filter(c => c.status === 'Stable').length;
const unstableCount = countries.filter(c => c.status === 'Unstable').length;
const neutralCount = countries.filter(c => c.status === 'Neutral').length;
const total = countries.length;

const mostCritical = [...countries].sort((a, b) => a.score - b.score)[0];
const mostStable = [...countries].sort((a, b) => b.score - a.score)[0];

const regional = [
  { name: 'Eropa', stable: 80, color: 'bg-green-400' },
  { name: 'Asia', stable: 60, color: 'bg-yellow-400' },
  { name: 'Amerika', stable: 72, color: 'bg-green-400' },
  { name: 'Afrika', stable: 35, color: 'bg-red-400' },
  { name: 'Oceania', stable: 88, color: 'bg-green-400' },
];

const tickerNews = [
  'ALBANIA: Kerusuhan meletus di protes antikorupsi Tirana',
  'UKRAINE: Serangan drone terbesar sejak 2025 melanda Kiev',
  'INDONESIA: Pertumbuhan ekonomi Q3 capai 5.2%, melampaui estimasi',
  'RUSIA: Sanksi baru EU berlaku mulai 1 Desember',
  'DENMARK: Terpilih sebagai negara paling stabil ke-2 di dunia',
  'SURIAH: Krisis kemanusiaan memburuk — PBB serukan bantuan darurat',
  'IRAN: Program nuklir kembali disorot setelah laporan IAEA terbaru',
];

// Donut chart params
const R = 36;
const CIRC = 2 * Math.PI * R;
const segments = [
  { pct: stableCount / total, color: '#4ade80', label: 'Stable' },
  { pct: unstableCount / total, color: '#f87171', label: 'Unstable' },
  { pct: neutralCount / total, color: '#60a5fa', label: 'Neutral' },
];

function DonutChart() {
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      {segments.map((seg, i) => {
        const dash = seg.pct * CIRC;
        const gap = CIRC - dash;
        const el = (
          <circle
            key={i}
            cx="50" cy="50" r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x="50" y="47" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
        {((stableCount / total) * 100).toFixed(1)}%
      </text>
      <text x="50" y="58" textAnchor="middle" fill="#9ca3af" fontSize="6">
        STABLE
      </text>
    </svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ALL' | Status>('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = activeTab === 'ALL' ? countries : countries.filter(c => c.status === activeTab);
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="w-full min-h-full bg-[#0A0F24] text-white font-mono flex flex-col">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#1a2a4a] bg-[#060D1F] gap-3">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wide">COUNTRY INTELLIGENCE</h1>
            <div className="text-gray-500 text-xs">GLOBAL_INTELLIGENCE_SUMMARY // {today}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 border border-cyan-800 rounded text-cyan-400 text-xs hover:bg-cyan-900/30 transition">
            <RefreshCw className="w-3 h-3" /> REFRESH VIEW
          </button>
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 rounded text-gray-400 text-xs hover:bg-gray-800/30 transition">
            <Download className="w-3 h-3" /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* MAIN CONTENT — RESPONSIVE (STACK ON MOBILE, SIDE-BY-SIDE ON LG) */}
      <div className="flex flex-col lg:flex-row flex-1">

        {/* LEFT: Stability + Stats */}
        <div className="w-full lg:w-72 flex flex-col gap-3 p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-[#1a2a4a] flex-shrink-0">

          {/* Stability Index */}
          <div className="bg-[#0D1530] border border-[#1a2a4a] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold tracking-widest mb-3">
              <Shield className="w-3 h-3 text-cyan-400" /> STABILITY INDEX
            </div>
            <div className="flex justify-center mb-3">
              <DonutChart />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400" /><span className="text-gray-400">Stable ({stableCount})</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-gray-400">Unstable ({unstableCount})</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-gray-400">Neutral ({neutralCount})</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-700" /><span className="text-gray-600">No Data (0)</span></div>
            </div>
          </div>

          {/* Most Critical */}
          <div className="bg-[#0D1530] border border-red-900 rounded-lg p-3">
            <div className="text-red-400 text-xs font-bold tracking-widest flex items-center gap-1 mb-2">
              <TrendingDown className="w-3 h-3" /> MOST CRITICAL
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" title={mostCritical.code}>{getFlagEmoji(mostCritical.code)}</span>
              <div>
                <div className="text-white font-bold">{mostCritical.name}</div>
                <div className="text-red-400 text-xs">Score: {mostCritical.score.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Most Stable */}
          <div className="bg-[#0D1530] border border-green-900 rounded-lg p-3">
            <div className="text-green-400 text-xs font-bold tracking-widest flex items-center gap-1 mb-2">
              <TrendingUp className="w-3 h-3" /> MOST STABLE
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" title={mostStable.code}>{getFlagEmoji(mostStable.code)}</span>
              <div>
                <div className="text-white font-bold">{mostStable.name}</div>
                <div className="text-green-400 text-xs">Score: +{mostStable.score.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Regional Stability */}
          <div className="bg-[#0D1530] border border-[#1a2a4a] rounded-lg p-3">
            <div className="text-cyan-400 text-xs font-bold tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> REGIONAL STABILITY
            </div>
            {regional.map(r => (
              <div key={r.name} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-400">{r.name}</span>
                  <span className="text-white">{r.stable}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.stable}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Country Registry */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 pt-4 pb-2 border-b border-[#1a2a4a] gap-2">
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <Activity className="w-4 h-4 text-cyan-400" />
              REGISTRY <span className="text-cyan-400 ml-1">{total}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(['ALL', 'Stable', 'Unstable', 'Neutral'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    activeTab === tab
                      ? tab === 'ALL' ? 'bg-white text-black'
                        : tab === 'Stable' ? 'bg-green-500 text-white'
                        : tab === 'Unstable' ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-3 px-4 py-2 text-xs text-gray-500 font-bold tracking-widest border-b border-[#1a2a4a]">
            <span>REGION</span>
            <span>OUTLOOK</span>
            <span className="text-right">FRESHNESS</span>
          </div>

          {/* Country List */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {filtered.map(c => (
              <div key={c.name}>
                <div
                  className="grid grid-cols-3 px-4 py-3 border-b border-[#1a2a4a] hover:bg-[#0D1530] cursor-pointer transition items-center"
                  onClick={() => setExpandedRow(expandedRow === c.name ? null : c.name)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-7 rounded flex items-center justify-center text-lg bg-cyan-950/60 border border-cyan-800/80" title={c.code}>{getFlagEmoji(c.code)}</span>
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-1.5">{c.name} <span className="text-[10px] font-mono text-cyan-400/60">{c.code}</span></div>
                      <div className="text-xs text-gray-500">{c.region}</div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
                      c.status === 'Stable'
                        ? 'text-green-400 border-green-800 bg-green-900/20'
                        : c.status === 'Unstable'
                        ? 'text-red-400 border-red-800 bg-red-900/20'
                        : 'text-blue-400 border-blue-800 bg-blue-900/20'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {c.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-400 text-xs font-bold">HARI INI</span>
                    <span className="text-gray-600 text-xs ml-2">≡</span>
                  </div>
                </div>

                {/* Expanded row */}
                {expandedRow === c.name && (
                  <div className="bg-[#060D1F] border-b border-[#1a2a4a] px-6 py-3">
                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <div className="text-gray-500">SKOR STABILITAS</div>
                        <div className={`text-lg font-bold ${c.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {c.score > 0 ? '+' : ''}{c.score.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">STATUS</div>
                        <div className={`font-bold ${c.status === 'Stable' ? 'text-green-400' : c.status === 'Unstable' ? 'text-red-400' : 'text-blue-400'}`}>{c.status}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">KAWASAN</div>
                        <div className="text-white">{c.region}</div>
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4">
                          <div
                            className={`h-full rounded-full ${c.score >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.abs(c.score) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="flex items-center border-t border-[#1a2a4a] bg-[#060D1F] px-4 py-1 overflow-hidden">
        <span className="text-blue-400 text-xs font-bold mr-3 whitespace-nowrap animate-pulse">◉ LIVE</span>
        <div className="overflow-hidden flex-1">
          <div className="flex text-xs text-gray-400 whitespace-nowrap" style={{ animation: 'marquee 50s linear infinite' }}>
            {[...tickerNews, ...tickerNews].map((t, i) => (
              <span key={i} className="mr-12">
                <span className="text-blue-400 font-bold">{t.split(':')[0]}:</span>
                <span>{t.split(':').slice(1).join(':')}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
